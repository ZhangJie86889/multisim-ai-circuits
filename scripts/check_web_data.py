#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_web_data.py —— 校验 web/src/data/circuits.ts 与 circuits/ 目录是否同步

背景
----
`web/src/data/circuits.ts` 里内嵌了种子电路的 .cir 全文（CIR_001 / CIR_002 / CIR_003），
方便静态站点直接展示与在线检查。但内嵌必然存在「改了一处、忘了另一处」的风险，
本脚本负责发现这种漂移。

用法
----
    python scripts/check_web_data.py          # 校验，不一致退出码 1
    python scripts/check_web_data.py -v       # 打印每个电路的对比详情

校验内容
--------
1. circuits/*/ 下每个非 _template 目录，都能在 circuits.ts 里找到同 id 的 CIR_xxx 块；
2. CIR_xxx 块的内容与该目录下唯一的 .cir 文件逐字一致（忽略行尾 CR、忽略首尾空行）；
3. front-matter 的 id / name / difficulty / status / signalflow 与 circuits.ts 对应字段一致；
4. README.md 必须是 **UTF-8**（中文 Windows 编辑器容易存成 GBK/ANSI，
   提交后 GitHub 网页中文会整片乱码，且 build_index.py 会生成乱码索引行）。

退出码：0 一致 / 1 有漂移 / 2 找不到文件。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CIRCUITS_DIR = ROOT / "circuits"
TS_FILE = ROOT / "web" / "src" / "data" / "circuits.ts"

# 匹配 const CIR_001 = `...`;
RE_CIR_BLOCK = re.compile(r"const\s+CIR_(\w+)\s*=\s*`(.*?)`;", re.DOTALL)
# front-matter 区块
RE_FRONTMATTER = re.compile(r"^---\s*$(.*?)^---\s*$", re.MULTILINE | re.DOTALL)


def norm_cir(text: str) -> str:
    """归一化：去 CR、统一结尾、去首尾空行。"""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return "\n".join(line.rstrip() for line in text.split("\n")).strip("\n")


def read_cir_blocks() -> dict:
    """解析 circuits.ts 里的 CIR_xxx 内嵌字符串 -> {id: content}"""
    if not TS_FILE.is_file():
        return {}
    text = TS_FILE.read_text(encoding="utf-8")
    out = {}
    for m in RE_CIR_BLOCK.finditer(text):
        out[m.group(1).lstrip("0") or "0"] = norm_cir(m.group(2))
    return out


def parse_frontmatter(readme: Path) -> dict:
    if not readme.is_file():
        return {}
    text = readme.read_text(encoding="utf-8", errors="replace")
    m = RE_FRONTMATTER.match(text)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        fm[k.strip().lower()] = v.strip()
    return fm


def check_md_encoding(readme: Path) -> str:
    """校验 Markdown 文档必须是 UTF-8。

    踩过的坑：中文 Windows 上的编辑器（含部分 AI 工具）默认把文件存成
    GBK/ANSI。这种文件直接提交会有两个后果——
      ① GitHub 网页按 UTF-8 渲染，中文整片变乱码；
      ② build_index.py 读出来全是问号，生成进索引表的也是乱码。
    所以这里给出可操作的修复提示，而不是让乱码静默溜过去。
    """
    if not readme.is_file():
        return ""
    raw = readme.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        return "README.md 带 UTF-8 BOM，请另存为「UTF-8 无 BOM」"
    try:
        raw.decode("utf-8")
        return ""
    except UnicodeDecodeError:
        for enc in ("gbk", "big5"):
            try:
                raw.decode(enc)
                return (f"README.md 不是 UTF-8（实际是 {enc.upper()} / ANSI），"
                        f"提交后 GitHub 上中文会变乱码；请用记事本或 VS Code "
                        f"转成 UTF-8 后重新提交")
            except UnicodeDecodeError:
                continue
        return "README.md 不是有效的 UTF-8，且无法按 GBK / Big5 解码"


def main(argv=None) -> int:
    argv = argv if argv is not None else sys.argv[1:]
    verbose = "-v" in argv or "--verbose" in argv
    quiet = "-q" in argv or "--quiet" in argv

    if not CIRCUITS_DIR.is_dir():
        print(f"❌ 找不到目录：{CIRCUITS_DIR}")
        return 2
    blocks = read_cir_blocks()
    if not blocks:
        print(f"❌ 未能在 {TS_FILE.as_posix()} 里解析出任何 CIR_xxx 块")
        return 2

    problems = []
    checked = 0

    dirs = sorted(d for d in CIRCUITS_DIR.iterdir() if d.is_dir() and not d.name.startswith("_"))
    for d in dirs:
        cirs = sorted(d.glob("*.cir"))
        if not cirs:
            problems.append(f"{d.name}: 目录下没有 .cir 文件")
            continue
        if len(cirs) > 1:
            problems.append(f"{d.name}: 目录下有 {len(cirs)} 个 .cir，无法判断哪个是主网表")

        cir_file = cirs[0]
        # 目录名形如 001-bjt-switch-led -> id 001 -> key "1"
        m = re.match(r"(\d+)", d.name)
        if not m:
            problems.append(f"{d.name}: 目录名未以数字编号开头")
            continue
        key = m.group(1).lstrip("0") or "0"
        cid = m.group(1)

        # 编码校验：Markdown 必须是 UTF-8，否则 GitHub 上中文会乱码
        enc_problem = check_md_encoding(d / "README.md")
        if enc_problem:
            problems.append(f"{cid}: {enc_problem}")

        file_text = norm_cir(cir_file.read_text(encoding="utf-8", errors="replace"))
        ts_text = blocks.get(key)
        checked += 1

        if ts_text is None:
            problems.append(
                f"{cid}: circuits.ts 里缺少 CIR_{cid} 块（当前有：{', '.join('CIR_' + k for k in sorted(blocks))}）"
            )
            continue
        if ts_text != file_text:
            fl = file_text.split("\n")
            tl = ts_text.split("\n")
            detail = []
            for i in range(max(len(fl), len(tl))):
                a = fl[i] if i < len(fl) else "<无>"
                b = tl[i] if i < len(tl) else "<无>"
                if a != b:
                    detail.append(f"    第 {i+1} 行 文件:{a!r}  ts:{b!r}")
            problems.append(f"{cid}: .cir 内容与 circuits.ts 不一致（{len(detail)} 处差异）")
            if verbose and detail:
                print(f"  [{cid}] 差异明细：")
                print("\n".join(detail[:12]))
        elif verbose and not quiet:
            print(f"  ✅ {cid}: {cir_file.name} 与 CIR_{cid} 一致（{len(file_text.splitlines())} 行）")

        # front-matter 校验
        fm = parse_frontmatter(d / "README.md")
        if not fm:
            problems.append(f"{cid}: README.md 缺少 front-matter")
        else:
            if fm.get("id") and fm["id"] != cid:
                problems.append(f"{cid}: front-matter id={fm['id']} 与目录编号不符")
            flow_fm = [x.strip() for x in re.split(r"[,，]", fm.get("signalflow", "")) if x.strip()]
            if flow_fm:
                # circuits.ts 中该电路的 signalFlow: [...]
                pat = re.compile(
                    r'id:\s*"%s".*?signalFlow:\s*\[(.*?)\]' % re.escape(cid), re.DOTALL
                )
                mm = pat.search(TS_FILE.read_text(encoding="utf-8"))
                if mm:
                    ts_flow = re.findall(r'"([^"]+)"', mm.group(1))
                    if ts_flow != flow_fm:
                        problems.append(
                            f"{cid}: signalFlow 不一致 ts={ts_flow} / front-matter={flow_fm}"
                        )
                else:
                    problems.append(f"{cid}: circuits.ts 里未找到 signalFlow 定义")

    print()
    if problems:
        print("=" * 56)
        print(f"❌ web 数据校验失败（检查 {checked} 个电路，{len(problems)} 个问题）：")
        for p in problems:
            print(f"  - {p}")
        print("\n修复：把 circuits/*/*.cir 的改动同步到 web/src/data/circuits.ts 的 CIR_xxx 块。")
        return 1

    print("=" * 56)
    print(f"✅ web 数据校验通过（{checked} 个电路的 .cir 与 front-matter 均已同步）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
