#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_index.py —— 扫描 circuits/*/README.md 的 front-matter，生成电路索引表

front-matter 规范（写在每个 circuits/<id>-<name>/README.md 顶部）：

    ---
    id: 001
    name: BJT 开关驱动 LED
    difficulty: 入门
    status: 待验证
    desc: 2N2222 饱和开关驱动红色 LED，验证 Ib/Ic/Vce(sat) 与开关波形
    signalflow: VIN,RB,Q1,DLED,RC,VCC
    ---

用法
----
    python build_index.py                 # 打印索引表到 stdout
    python build_index.py --write         # 写回根 README.md 的标记区间
    python build_index.py --check         # 校验 README 里的表是否最新（CI 用）
    python build_index.py --root <dir>    # 指定仓库根目录（默认脚本上一级的上一级）

退出码
------
    0   成功（--check 时表示索引已是最新）
    1   --check 发现索引不同步，或缺少 front-matter 字段
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

START_MARK = "<!-- CIRCUIT-INDEX:START -->"
END_MARK = "<!-- CIRCUIT-INDEX:END -->"

RE_FRONTMATTER = re.compile(r"^---\s*$(.*?)^---\s*$", re.MULTILINE | re.DOTALL)
RE_KV = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$")

REQUIRED = ("id", "name", "difficulty", "status", "desc")

STATUS_BADGE = {
    "已验证": "🟢 已验证",
    "待验证": "🟡 待验证",
    "验证失败": "🔴 验证失败",
}

TABLE_HEADER = [
    "| 编号 | 电路名 | 难度 | 验证状态 | 一句话说明 |",
    "|------|--------|------|----------|------------|",
]


# ---------------------------------------------------------------- 解析

def parse_front_matter(readme: Path):
    """返回 (dict, error_message)。"""
    try:
        text = readme.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        return None, f"读取失败：{e}"

    m = RE_FRONTMATTER.search(text)
    if not m:
        return None, "未找到 YAML front-matter（文件开头必须是 --- 包裹的区块）"

    data = {}
    for line in m.group(1).splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        kv = RE_KV.match(line)
        if not kv:
            continue
        key, val = kv.group(1), kv.group(2).strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            val = val[1:-1]
        data[key] = val

    missing = [k for k in REQUIRED if not data.get(k)]
    if missing:
        return None, f"front-matter 缺少字段：{', '.join(missing)}"
    return data, None


def scan(root: Path):
    circuits_dir = root / "circuits"
    if not circuits_dir.is_dir():
        return [], [f"找不到目录：{circuits_dir}"]

    entries, errors = [], []
    for child in sorted(circuits_dir.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith("_"):        # 跳过 _template 等模板目录
            continue
        readme = child / "README.md"
        if not readme.is_file():
            errors.append(f"{child.name}: 缺少 README.md")
            continue
        data, err = parse_front_matter(readme)
        if err:
            errors.append(f"{child.name}: {err}")
            continue
        data["_dir"] = child.name
        data["_rel"] = f"circuits/{child.name}/README.md"
        entries.append(data)

    def sort_key(d):
        sid = str(d.get("id", ""))
        return (0, int(sid)) if sid.isdigit() else (1, sid)

    entries.sort(key=lambda d: sort_key(d))
    return entries, errors


# ---------------------------------------------------------------- 渲染

def badge(status: str) -> str:
    return STATUS_BADGE.get(status.strip(), f"🟡 {status}".strip())


def render_table(entries) -> str:
    if not entries:
        return "\n".join(
            ["| 编号 | 电路名 | 难度 | 验证状态 | 一句话说明 |",
             "|------|--------|------|----------|------------|",
             "| — | （暂无电路，快去提第一个 PR） | — | — | — |"]
        )
    rows = list(TABLE_HEADER)
    for d in entries:
        rows.append(
            f"| {d['id']} "
            f"| [{d['name']}]({d['_rel']}) "
            f"| {d['difficulty']} "
            f"| {badge(d['status'])} "
            f"| {d['desc']} |"
        )
    return "\n".join(rows)


def replace_in_readme(readme: Path, table: str) -> str:
    """把标记区间内的内容替换为新表，返回替换后的全文。"""
    text = readme.read_text(encoding="utf-8")
    pattern = re.compile(
        re.escape(START_MARK) + r".*?" + re.escape(END_MARK), re.DOTALL)
    if not pattern.search(text):
        raise SystemExit(
            f"❌ {readme} 里找不到索引标记区间，请手动加入：\n"
            f"   {START_MARK}\n   {END_MARK}")
    return pattern.sub(START_MARK + "\n" + table + "\n" + END_MARK, text)


# ---------------------------------------------------------------- CLI

def main(argv=None) -> int:
    default_root = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser(description="生成 multisim-ai-circuits 电路索引表")
    ap.add_argument("--root", default=str(default_root), help="仓库根目录")
    ap.add_argument("--write", action="store_true", help="写回根 README.md")
    ap.add_argument("--check", action="store_true",
                    help="只校验 README 里的表是否最新（CI 用）")
    args = ap.parse_args(argv)

    root = Path(args.root).resolve()
    entries, errors = scan(root)
    table = render_table(entries)

    for e in errors:
        print(f"⚠️  {e}")

    if args.check or args.write:
        readme = root / "README.md"
        if not readme.is_file():
            print(f"❌ 找不到 {readme}")
            return 1
        current = readme.read_text(encoding="utf-8")
        updated = replace_in_readme(readme, table)
        if args.check:
            if current == updated:
                print("✅ 索引表已是最新")
                return 0
            print("❌ 索引表不是最新的，请运行：python scripts/build_index.py --write")
            return 1
        if current == updated:
            print("✅ 索引表无变化，未写入")
        else:
            readme.write_text(updated, encoding="utf-8")
            print(f"✅ 已更新 {readme.as_posix()} 的索引表（{len(entries)} 个电路）")
        if errors:
            return 1
        return 0

    print(table)
    if errors:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
