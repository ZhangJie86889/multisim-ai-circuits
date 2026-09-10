#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
new_circuit.py —— 一条命令脚手架出一个符合 v2 格式的新电路目录

用法
----
    python scripts/new_circuit.py <编号> <短名> "<中文名>" [选项]

例：
    python scripts/new_circuit.py 004 rc-lowpass "一阶 RC 低通滤波器" \
        --difficulty 入门 \
        --flow VIN,R1,C1 \
        --desc "无源 RC 低通，截止频率约 1 kHz，-20 dB/十倍频滚降" \
        --name-en "First-order RC low-pass filter, fc about 1 kHz"

它会做的事
----------
1. 把 circuits/_template/ 复制成 circuits/<编号>-<短名>/
2. 把模板里的占位符（NNN / 电路中文名 / <dir-name> / signalflow 等）替换成你给的值
3. 把 TEMPLATE.cir 重命名为 <编号>-<短名>.cir
4. 打印「还需要你手填什么」的 TODO 清单（含要同步到 web/ 的提醒）

退出码：0 成功 / 1 参数错或目录已存在 / 2 找不到模板
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = ROOT / "circuits" / "_template"

DIFFICULTIES = ("入门", "进阶", "挑战")
STATUSES = ("待验证", "已验证", "验证失败")

TEXT_SUFFIXES = {".md", ".cir", ".txt"}

# 模板里的占位符（顺序有意义：先长后短，避免误替换）
PLACEHOLDER_DESC = "desc: 一句话说明（20~40 字，写清拓扑 + 关键指标）"


def build_replacements(cid: str, dirname: str, name: str, name_en: str,
                       difficulty: str, flow: list) -> dict:
    flow_csv = ",".join(flow)
    flow_arrow = " -> ".join(flow)
    name_en = name_en or "TODO FILL ENGLISH NAME"
    return {
        PLACEHOLDER_DESC: f"desc: （待填：20~40 字，写清拓扑 + 关键指标）",
        "VIN -> RIN -> Q1 -> RC -> VCC": flow_arrow,
        "VIN,RIN,Q1,RC,VCC": flow_csv,
        "difficulty: 入门": f"difficulty: {difficulty}",
        "<dir-name>": dirname,
        "NNN-xxx": dirname,
        "id: NNN": f"id: {cid}",
        "NNN · 电路中文名": f"{cid} · {name}",
        "CIR_00N": f"CIR_{cid}",
        "电路中文名": name,
        "REPLACE THIS LINE WITH CIRCUIT NAME IN ENGLISH": name_en.upper(),
        "TEMPLATE:": f"{dirname}:",
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(
        description="脚手架一个符合 v2 格式的新电路目录",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("id", help="三位编号，如 004")
    ap.add_argument("slug", help="短英文名（小写连字符），如 rc-lowpass")
    ap.add_argument("name", help="电路中文名，如「一阶 RC 低通滤波器」")
    ap.add_argument("--difficulty", default="入门", choices=DIFFICULTIES)
    ap.add_argument("--status", default="待验证", choices=STATUSES)
    ap.add_argument("--flow", default="", help="元件行顺序（信号流），如 VIN,R1,C1")
    ap.add_argument("--desc", default="", help="一句话说明，进索引表")
    ap.add_argument("--name-en", default="", help="英文名，写进 .cir 标题行")
    args = ap.parse_args(argv)

    if not re.fullmatch(r"\d{3}", args.id):
        print(f"❌ 编号必须是三位数字，收到：{args.id!r}")
        return 1
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", args.slug):
        print(f"❌ 短名只能用小写字母/数字/连字符，收到：{args.slug!r}")
        return 1
    if not TEMPLATE_DIR.is_dir():
        print(f"❌ 找不到模板目录：{TEMPLATE_DIR.as_posix()}")
        return 2

    dirname = f"{args.id}-{args.slug}"
    target = ROOT / "circuits" / dirname
    if target.exists():
        print(f"❌ 目录已存在，请换个编号/短名：{target.as_posix()}")
        return 1

    flow = [x.strip().upper() for x in re.split(r"[,，\s]+", args.flow) if x.strip()]

    # 1) 复制模板
    shutil.copytree(TEMPLATE_DIR, target)
    # 2) 重命名模板网表
    old_cir = target / "TEMPLATE.cir"
    if old_cir.is_file():
        old_cir.rename(target / f"{dirname}.cir")
    # 3) 替换占位符
    repl = build_replacements(args.id, dirname, args.name, args.name_en,
                              args.difficulty, flow)
    changed = []
    for p in sorted(target.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = p.read_text(encoding="utf-8")
        out = text
        for k, v in repl.items():
            out = out.replace(k, v)
        out = out.replace("status: 待验证", f"status: {args.status}")
        if args.desc:
            out = out.replace("desc: （待填：20~40 字，写清拓扑 + 关键指标）",
                              f"desc: {args.desc}")
        if out != text:
            p.write_text(out, encoding="utf-8")
            changed.append(p.relative_to(ROOT).as_posix())

    # 4) 打印 TODO
    flow_hint = ",".join(flow) if flow else "VIN,R1,C1"
    print(f"\n✅ 已创建 {target.as_posix()}")
    print(f"   文件：{', '.join(sorted(p.name for p in target.iterdir()))}")
    if changed:
        print(f"   已替换占位符：{len(changed)} 个文件")
    if not flow:
        print("   ⚠️ 你没给 --flow，README 的 signalflow 还是模板默认值，记得手改")

    print("\n" + "=" * 60)
    print("接下来还需要你手动做的事：")
    print("=" * 60)
    print(f"1. 用 v2 提示词生成 7/8 部分内容（prompts/circuit-generation-template-v2.md）,")
    print(f"   把结果填进 circuits/{dirname}/README.md，并把第 1 部分的网表写进")
    print(f"   circuits/{dirname}/{dirname}.cir（纯 ASCII，单行 ≤132 字符）")
    print(f"2. 把实际用的提示词存到 circuits/{dirname}/prompt-used.md")
    print(f"3. 在 Multisim 里跑一遍，把实测值填进 verification.md，状态改成「已验证」")
    print(f"4. 【最容易漏】同步网页数据 web/src/data/circuits.ts：")
    print(f"   - 顶部加  const CIR_{args.id} = `...你的网表全文...`;")
    print(f"   - 在 circuits 数组里加一条 id=\"{args.id}\" 的对象（含 grid / parts / wires 等字段）")
    print(f"5. 跑这三条（CI 同款），全绿再提交：")
    print(f"     python scripts/cir_lint.py circuits/ --strict")
    print(f"     python scripts/build_index.py --write")
    print(f"     python scripts/check_web_data.py -v")
    print(f"6. 提交：git add -A && git commit -m \"feat(circuits): 新增 {args.id} {args.name}\" && git push")
    print(f"\n   （signalflow 建议值：{flow_hint}）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
