#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cir_lint.py —— NI Multisim 14.3 .cir 网表硬约束检查器

用法
----
    python cir_lint.py path/to/xxx.cir          # 检查单个网表
    python cir_lint.py circuits/                # 目录批量模式（递归找 *.cir）
    python cir_lint.py circuits/ --strict       # warning 也算失败（CI 推荐）
    python cir_lint.py circuits/ --quiet        # 只打印汇总

退出码
------
    0   无 error（warn 不影响，除非 --strict）
    1   存在 error（--strict 时 warn 也计入）
    2   找不到任何 .cir 文件 / 参数错误

检查规则
--------
    E-ENC001  文件必须是 ANSI / 7-bit ASCII（非 ASCII 字符会让 Multisim 导入器解析失败）
    E-ENC002  文件不能带 UTF-8 BOM
    E-TITLE1  首行必须是 * 开头的标题注释
    E-END001  末行必须是 .END
    E-END002  .END 只能出现在最后一行
    E-DOT001  指令不在白名单 .OP/.AC/.TRAN/.DC/.MODEL/.END 内
    E-DOT002  命中黑名单指令（.MEAS/.FOUR/.NOISE/.TF/.SENS/.STEP/.TEMP/.MC/
              .PROBE/.PLOT/.PRINT/.SUBCKT/.INCLUDE/.LIB 等）
    E-NODE1   节点名必须匹配 ^[A-Z][A-Z0-9_]*$ 或为 0（地）
    E-SCI1    元件行的值字段禁止科学计数法（1e-3 / 2.5E+6）；
              .MODEL 行不检查（14.34F、7.306P 是 SPICE 标准后缀，1E-14 也是合法模型参数）
    W-ORDER1  元件行顺序与 README 声明的 SIGNALFLOW 不一致
              （Multisim 按元件行出现顺序从左到右摆放元件）
    W-FLOAT1  某个非地节点只出现 1 次，疑似悬空
    W-LEN01   单行超过 132 字符（经典 SPICE 上限，Multisim 导入可能被截断）
    W-NAME1   元件名建议全大写
    W-MISC1   无法识别的行
    W-FANOUT1 单个节点出现 >= 5 次，导入后飞线易交叉（v2 提示词第 9 条配套）
    I-SPAN1   单个网络横跨 >= 4 个元件位，导入后必然产生跨图长线（仅提示）

级别说明（v1.2 新增）
--------------------
    error  会让 Multisim 导入失败，必须修；退出码 1
    warn   可能导致导入后难用或结果不符；--strict 时计入失败
    info   纯排版 / 可读性提示，任何模式下都 **不影响退出码**，只提醒不阻塞

    为什么要引入 info：像「某个网络横跨很远」这类问题，在分压偏置、555 这类
    正常电路里也必然出现（例如 002 的 COL 跨 5 个元件位），
    若判成 warn 会让 CI 无辜变红。所以凡"正常电路也会命中"的排版类检查，
    一律用 info。

解析前提（v1.1 新增，避免误报）
-------------------------------
    - 行内注释：`;` 与 `$` 之后的内容不参与语法判断（SPICE 标准注释符）。
      注意：**注释里的中文仍会被 E-ENC001 抓到**（因为 .cir 要求纯 ASCII），
      但不会再被误判成节点名或元件值。
    - 括号内容：`PULSE(...)` / `SIN(...)` 内部的参数不参与节点与值解析，
      否则 `PULSE(0 5 0 1u 1u 0.5m 1m)` 中间的 token 会被当成节点。
    - 续行：`+` 开头的物理行会合并回上一逻辑行后再检查（行长按合并后计算）。

    目录模式会对每个文件单独出报告，最后打印汇总。
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

# ---------------------------------------------------------------- 常量

ALLOWED_DOT = {".OP", ".AC", ".TRAN", ".DC", ".MODEL", ".END"}

BANNED_DOT = {
    ".MEAS", ".MEASURE",        # 测量指令，Multisim 导入器不支持
    ".FOUR",                    # 傅里叶分析
    ".NOISE",                   # 噪声分析
    ".TF",                      # 传输函数
    ".SENS",                    # 灵敏度
    ".STEP",                    # 参数扫描（UI 里用 Parameter Sweep）
    ".TEMP",                    # 温度
    ".MC",                      # 蒙特卡洛
    ".PROBE", ".PLOT", ".PRINT",  # 输出控制
    ".SUBCKT", ".ENDS",         # 子电路（黑盒策略禁止）
    ".INCLUDE", ".LIB",         # 外部文件引用
    ".PARAM", ".OPTIONS",       # 参数与选项，导入器常忽略/报错
    ".WIDTH", ".NODESET", ".IC", ".GLOBAL", ".FUNC",
}

BANNED_HINT = {
    ".MEAS": "改用 Grapher 游标人工读数",
    ".MEASURE": "改用 Grapher 游标人工读数",
    ".STEP": "改用 Multisim UI 的 Parameter Sweep（Device parameter + List）",
    ".SUBCKT": "黑盒策略禁止子电路；改为在 Multisim 里放真实库件",
    ".ENDS": "黑盒策略禁止子电路",
    ".INCLUDE": "禁止外部文件引用，把所有内容写进单个 .cir",
    ".LIB": "禁止外部文件引用，把所有内容写进单个 .cir",
    ".PARAM": "把参数直接算成数值写死，不要在网表里用变量",
    ".OPTIONS": "分析选项在 Multisim UI 里设置，不要写进网表",
}

ELEMENT_FIRST = set("RLCVDQX")          # 元件行首字母（M/J 等暂不纳入）
# 电源网络名：这些节点横跨很远属正常现象，不参与 W-FANOUT1 / I-SPAN1
POWER_NETS = {"VCC", "VDD", "VEE", "VSS", "VBB", "VPP", "VTT", "GND"}
NODE_RE = re.compile(r"^[A-Z][A-Z0-9_]*$")
# 1e-3 / 1E-3 / 2.5e+6 / 1.0E-9 这类科学计数法
# SCI_RE 用于整行粗筛，SCI_TOKEN_RE 用于单个值 token 的完整匹配（更严格）
SCI_RE = re.compile(r"\d+\.?\d*[eE][+-]?\d+")
SCI_TOKEN_RE = re.compile(r"^[+-]?(?:\d+\.?\d*|\.\d+)[eE][+-]?\d+$")
NAME_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]*")
MAX_LINE_LEN = 132

# README 里声明信号流的两种方式
RE_HTML_SIGNALFLOW = re.compile(r"<!--\s*SIGNALFLOW\s*[:：]\s*(.+?)\s*-->")
RE_FM_SIGNALFLOW = re.compile(r"^\s*signalflow\s*[:：]\s*(.+?)\s*$",
                              re.IGNORECASE | re.MULTILINE)


# ---------------------------------------------------------------- 数据结构

@dataclass
class Issue:
    level: str          # "error" | "warn" | "info"
    code: str
    line: int           # 行号（0 表示整个文件）
    msg: str

    def __str__(self) -> str:
        tag = {"error": "ERROR", "warn": "WARN ", "info": "INFO "}.get(
            self.level, "?    ")
        loc = f"第 {self.line} 行" if self.line else "文件级"
        return f"  [{tag}] {self.code} @ {loc}: {self.msg}"


@dataclass
class FileReport:
    path: Path
    issues: list = field(default_factory=list)
    n_elements: int = 0
    n_lines: int = 0

    def add(self, level, code, line, msg):
        self.issues.append(Issue(level, code, line, msg))

    @property
    def errors(self):
        return [i for i in self.issues if i.level == "error"]

    @property
    def warnings(self):
        return [i for i in self.issues if i.level == "warn"]

    @property
    def infos(self):
        return [i for i in self.issues if i.level == "info"]


# ---------------------------------------------------------------- 解析工具

def decode_file(path: Path, rep: FileReport) -> str:
    """按 ANSI / 7-bit ASCII 解码，顺便报编码问题。"""
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        rep.add("error", "E-ENC002", 0,
                "文件带 UTF-8 BOM，Multisim 导入器会把它当成首行内容；"
                "请用 ANSI（或 UTF-8 无 BOM）重新保存")
        raw = raw[3:]
    try:
        return raw.decode("ascii")
    except UnicodeDecodeError:
        text = raw.decode("utf-8", errors="replace")
        bad = [i for i, ln in enumerate(text.splitlines(), 1)
               if any(ord(ch) > 127 for ch in ln)]
        shown = ", ".join(str(i) for i in bad[:10])
        more = " ..." if len(bad) > 10 else ""
        rep.add("error", "E-ENC001", bad[0] if bad else 0,
                f"文件含 {len(bad)} 行非 ASCII 字符（行号：{shown}{more}）；"
                f"Multisim 网表导入器对非 ASCII 敏感，注释请全部改用英文，"
                f"中文说明放到同目录 README.md")
        return text


def logical_lines(text: str):
    """
    把 '+' 续行合并回上一行，返回 [(行号, 内容), ...]。
    行号取续行的起始行号，方便定位。
    """
    out = []
    pending = None
    for i, raw in enumerate(text.splitlines(), 1):
        stripped = raw.strip()
        if not stripped:
            continue
        if stripped.startswith("+") and pending is not None:
            pending = (pending[0], pending[1] + " " + stripped[1:].strip())
            continue
        if pending is not None:
            out.append(pending)
        pending = (i, stripped)
    if pending is not None:
        out.append(pending)
    return out


def strip_inline_comment(line: str) -> str:
    """
    剥离 SPICE 行内注释。
    `;` 和 `$` 都是 SPICE 的行内注释起始符，其后内容不参与解析。
    （少了这一步，行尾注释里的中文/数字会被误判成节点或元件值。）
    """
    cut = len(line)
    for sep in (";", "$"):
        idx = line.find(sep)
        if idx != -1:
            cut = min(cut, idx)
    return line[:cut]


def strip_parentheses(s: str) -> str:
    """
    去掉括号及其内部内容（替换为单个空格）。
    `PULSE(0 5 0 1u 1u 0.5m 1m)` / `SIN(0 10m 1k)` 里的参数不该被当成节点或元件值解析。
    """
    out, depth = [], 0
    for ch in s:
        if ch == "(":
            depth += 1
            if depth == 1:
                out.append(" ")
            continue
        if ch == ")":
            depth = max(0, depth - 1)
            continue
        if depth == 0:
            out.append(ch)
    return "".join(out)


def element_tokens(line: str) -> list:
    """元件行 -> token 列表（先剥注释，再剥括号，最后按空白切分）。"""
    body = strip_parentheses(strip_inline_comment(line)).strip()
    return body.split() if body else []


def nodes_of(prefix: str, tokens: list):
    """按元件类型取出节点 token 列表。"""
    p = prefix.upper()
    if p in ("R", "L", "C", "V", "D"):
        return tokens[1:3]
    if p in ("Q", "M", "J"):
        return tokens[1:4]
    if p == "X":
        # X 行最后一项是模型名，其余全是节点
        return tokens[1:-1] if len(tokens) >= 2 else []
    return tokens[1:3]


def value_tokens(prefix: str, tokens: list):
    """
    按元件类型取出"值"字段（只有这些 token 需要查科学计数法）。
    Q / X / J / M 的值就是末尾的模型名；R/L/C/V/I/D 是节点之后的部分。
    """
    p = prefix.upper()
    rest = tokens[1:]
    if p in ("Q", "X", "J", "M"):
        return rest[-1:] if rest else []
    return rest[2:]


# ---------------------------------------------------------------- 主检查

def check_file(path: Path) -> FileReport:
    rep = FileReport(path=path)
    text = decode_file(path, rep)
    lines = logical_lines(text)
    rep.n_lines = len(lines)

    if not lines:
        rep.add("error", "E-TITLE1", 0, "文件为空")
        return rep

    # 规则 1：首行必须是 * 开头
    if not lines[0][1].startswith("*"):
        rep.add("error", "E-TITLE1", lines[0][0],
                f"首行必须是 * 开头的标题注释，实际为：{lines[0][1][:40]!r}")

    # 规则 2：末行必须是 .END
    last_no, last_txt = lines[-1]
    if not last_txt.upper().startswith(".END"):
        rep.add("error", "E-END001", last_no,
                f"末行必须是 .END，实际为：{last_txt[:40]!r}")

    node_count = {}
    element_order = []
    # v1.2：记录每个元件行的 (名称, 节点列表, 行号)，供 W-FANOUT1 / I-SPAN1 使用
    element_seq = []

    for idx, (lineno, content) in enumerate(lines):
        # 长度检查（warn）
        if len(content) > MAX_LINE_LEN:
            rep.add("warn", "W-LEN01", lineno,
                    f"该行 {len(content)} 字符，超过 {MAX_LINE_LEN}；"
                    f"请用 '+' 续行")

        # 行内注释（; 与 $）不参与语法判断
        code = strip_inline_comment(content).strip()
        if not code:
            continue

        if code.startswith("*"):
            continue

        if code.startswith("."):
            _check_directive(code, lineno, idx, len(lines), rep)
            continue

        # 元件行
        m = NAME_RE.match(code)
        if not m:
            rep.add("warn", "W-MISC1", lineno, f"无法识别的行：{code[:40]!r}")
            continue

        name = m.group(0)
        if name[0].upper() not in ELEMENT_FIRST:
            rep.add("warn", "W-MISC1", lineno,
                    f"首字母 {name[0]!r} 不在受检元件集合 "
                    f"{''.join(sorted(ELEMENT_FIRST))} 内，已跳过：{code[:40]!r}")
            continue

        # 剥掉括号内容后再切分，避免 PULSE(...)/SIN(...) 的参数被当成节点
        tokens = element_tokens(content)
        if name != name.upper():
            rep.add("warn", "W-NAME1", lineno,
                    f"元件名 {name!r} 建议全大写（写成 {name.upper()!r}）")
        if len(tokens) < 3:
            rep.add("error", "E-NODE1", lineno,
                    f"元件行 {name!r} 字段不足（至少需要 名称 + 2 个节点 + 值）")
            continue

        element_order.append(name.upper())
        element_seq.append((name.upper(), nodes_of(name[0], tokens), lineno))
        rep.n_elements += 1

        # 规则 5：节点名
        for node in nodes_of(name[0], tokens):
            if node == "0":
                continue
            if not NODE_RE.match(node):
                rep.add("error", "E-NODE1", lineno,
                        f"节点名 {node!r} 不合法：必须匹配 ^[A-Z][A-Z0-9_]*$ "
                        f"（全英文大写，可用下划线），或为 0（地）")
            else:
                node_count[node] = node_count.get(node, 0) + 1

        # 规则 6：值字段禁止科学计数法
        # （.MODEL 是 '.' 开头，走指令分支，不会到这里，所以 1E-14 不会被误报）
        for val in value_tokens(name[0], tokens):
            if SCI_TOKEN_RE.match(val):
                rep.add("error", "E-SCI1", lineno,
                        f"元件 {name!r} 的值字段出现科学计数法 {val!r}；"
                        f"请改写成 SPICE 后缀形式（1e-3 -> 1m，1e-6 -> 1u，"
                        f"1e-9 -> 1n，1e-12 -> 1p，1e6 -> 1MEG）")

    # 悬空节点（warn，非硬约束，但极常见）
    for node, cnt in sorted(node_count.items()):
        if cnt < 2:
            rep.add("warn", "W-FLOAT1", 0,
                    f"节点 {node!r} 只出现 {cnt} 次，疑似悬空（每个节点至少需要 2 个引脚）")

    # ---- v1.2 排版规则（配合 v2 提示词的「摆放整齐 / 连线不混杂」）----

    # W-FANOUT1：单节点出现 >= 5 次 —— 挂太多引脚，导入后飞线必然交叉。
    # 阈值取 5 而不是 3：分压偏置电路的基极节点天然有 4 个连接
    # （耦合电容 + 上偏置 + 下偏置 + 管子基极），取 3 会误伤 002 这类正常电路。
    for node, cnt in sorted(node_count.items()):
        if node in POWER_NETS:
            continue
        if cnt >= 5:
            rep.add("warn", "W-FANOUT1", 0,
                    f"节点 {node!r} 共出现 {cnt} 次，扇出过大；导入后以它为中心会拉出 "
                    f"{cnt} 条飞线，极易交叉。建议拆成两个节点名"
                    f"（中间用 0 欧电阻或直接导线相连），或改用网络标签集中放置")

    # I-SPAN1：单个网络横跨 >= 4 个元件位 —— 必然产生横穿图面的长线。
    # 用 info 级别：分压偏置、555 这类正常电路也会命中（如 002 的 COL 跨 5 位），
    # 不能让它把 CI 判红，只作排版提醒。
    span_of = {}
    for k, (_nm, nds, _ln) in enumerate(element_seq):
        for nd in nds:
            if nd == "0" or nd in POWER_NETS:
                continue
            lo, hi = span_of.get(nd, (k, k))
            span_of[nd] = (min(lo, k), max(hi, k))
    for node, (lo, hi) in sorted(span_of.items()):
        span = hi - lo
        if span >= 4:
            rep.add("info", "I-SPAN1", element_seq[hi][2],
                    f"网络 {node!r} 从第 {lo + 1} 个元件跨到第 {hi + 1} 个元件"
                    f"（跨 {span} 位）；导入后它会拉出一条横穿图面的长线。"
                    f"建议在第 3a 节网格坐标表里把这些元件排成同列，或改用网络标签")

    # 规则 7：元件行顺序 vs README 声明的信号流
    declared = read_declared_signalflow(path)
    if declared:
        actual = [n for n in element_order if n in set(declared)]
        if actual != declared:
            rep.add("warn", "W-ORDER1", 0,
                    "元件行顺序与 README 声明的信号流不一致\n"
                    f"            声明：{' -> '.join(declared)}\n"
                    f"            实际：{' -> '.join(actual)}\n"
                    "            Multisim 按元件行出现顺序从左到右摆放元件，"
                    "顺序错了导入后整张图就是乱的")
    return rep


def _check_directive(content: str, lineno: int, idx: int, total: int,
                     rep: FileReport) -> None:
    token = content.split()[0].upper().rstrip("(")
    if token in BANNED_DOT:
        hint = BANNED_HINT.get(token, "该指令 Multisim 导入器不支持，请移除")
        rep.add("error", "E-DOT002", lineno, f"黑名单指令 {token}；{hint}")
        return
    if token not in ALLOWED_DOT:
        rep.add("error", "E-DOT001", lineno,
                f"指令 {token} 不在白名单 "
                f"{'/'.join(sorted(ALLOWED_DOT))} 内")
        return
    if token == ".END" and idx != total - 1:
        rep.add("error", "E-END002", lineno,
                ".END 只能出现在文件最后一行，其后不得再有元件/指令行")


def read_declared_signalflow(cir_path: Path):
    """从同目录 README.md 读取声明的信号流（front-matter 优先，其次 HTML 注释）。"""
    readme = cir_path.parent / "README.md"
    if not readme.is_file():
        return None
    try:
        text = readme.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None

    raw = None
    # front-matter 区块
    fm = re.match(r"^---\s*$(.*?)^---\s*$", text, re.MULTILINE | re.DOTALL)
    if fm:
        m = RE_FM_SIGNALFLOW.search(fm.group(1))
        if m:
            raw = m.group(1)
    if raw is None:
        m = RE_HTML_SIGNALFLOW.search(text)
        if m:
            raw = m.group(1)
    if not raw:
        return None

    items = [x.strip().upper() for x in re.split(r"[,，>\-]+|\s*->\s*", raw)
             if x.strip()]
    return items or None


# ---------------------------------------------------------------- 报告输出

def render(rep: FileReport, quiet: bool) -> None:
    print(f"\n=== {rep.path.as_posix()} ===")
    print(f"    逻辑行 {rep.n_lines} 行 · 元件 {rep.n_elements} 个")
    if not rep.issues:
        print("    ✅ 全部检查通过（0 error / 0 warn / 0 info）")
        return
    if not quiet:
        for i in rep.issues:
            print(str(i))
    print(f"    小结：{len(rep.errors)} error / {len(rep.warnings)} warn "
          f"/ {len(rep.infos)} info")


def collect(target: Path) -> list:
    if target.is_file():
        return [target]
    files = sorted(target.rglob("*.cir"))
    return files


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(
        description="Multisim 14.3 .cir 网表硬约束检查器",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("target", help=".cir 文件路径，或包含 .cir 的目录")
    ap.add_argument("--strict", action="store_true",
                    help="warning 也计入失败（退出码 1）")
    ap.add_argument("--quiet", "-q", action="store_true",
                    help="只打印每个文件的小结与总汇总")
    args = ap.parse_args(argv)

    target = Path(args.target)
    if not target.exists():
        print(f"❌ 路径不存在：{target}")
        return 2

    files = collect(target)
    if not files:
        print(f"❌ 在 {target} 下没有找到任何 .cir 文件")
        return 2

    reports = [check_file(f) for f in files]
    for r in reports:
        render(r, args.quiet)

    total_e = sum(len(r.errors) for r in reports)
    total_w = sum(len(r.warnings) for r in reports)
    total_i = sum(len(r.infos) for r in reports)
    # info 永远不影响退出码，只有 error（和 --strict 下的 warn）才算失败
    failed = [r for r in reports if r.errors or (args.strict and r.warnings)]

    print("\n" + "=" * 56)
    print(f"总计：{len(files)} 个文件 · {total_e} error · {total_w} warn "
          f"· {total_i} info")
    if failed:
        print("失败文件：")
        for r in failed:
            print(f"  - {r.path.as_posix()} "
                  f"({len(r.errors)} error / {len(r.warnings)} warn)")
        print("❌ LINT FAILED")
        return 1
    print("✅ LINT PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
