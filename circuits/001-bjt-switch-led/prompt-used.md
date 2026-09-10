# 001 使用的提示词（可复现）

## 使用的模型

| 项 | 值 |
|----|----|
| 模型 | 示例：DeepSeek-V3（你在实际生成时替换成真实模型名） |
| 日期 | 2026-09-10 |
| 温度 / 其他参数 | 默认 |
| 生成轮次 | 第 1 轮，未追问 |

## 填完占位符的提示词

```text
你是精通 NI Multisim 14.3 的电路仿真工程师，熟悉 SPICE 网表语法及 Multisim 网表导入兼容性。

任务：
设计一个【2N2222 饱和开关驱动红色 LED（5 V 电源，集电极电流约 3 mA，1 kHz 方波通断）】，
输出可直接用 Multisim File → Open 导入的 .cir 网表。
我要用【XSC1 双通道示波器 + XMM1 万用表】验证【输入高电平时 Q1 进入饱和（Vce < 0.3 V）、
LED 电流约 3 mA 且点亮；输入低电平时 Q1 截止、LED 完全熄灭，V(COL) 回到 5 V】。

电路规格：
- 性能指标：开关状态下 Vce(sat) ≤ 0.3 V；导通集电极电流 2.5 ~ 3.5 mA；
  截止时漏电流可忽略；1 kHz 通断无明显拖尾
- 电源：单电源 VCC = 5 V（网络名 VCC，对地）
- 输入：1 kHz 方波，低电平 0 V / 高电平 5 V，占空比 50%，上升下降时间 1 us
- 负载：LED_red 作为集电极负载，串联限流电阻 RC
- 有源器件：2N2222（NPN，Transistors / BJT_NPN，Multisim 主数据库自带）

具体元器件要求（必须使用）：
VIN  | Sources / SIGNAL_VOLTAGE_SOURCES / PULSE_VOLTAGE | PULSE(0 5 0 1u 1u 0.5m 1m)，1 kHz 方波
RB   | Basic / RESISTOR                                 | 10k
Q1   | Transistors / BJT_NPN / 2N2222                   | NPN，β ≈ 200
DLED | Diodes / LED / LED_red                           | Vf ≈ 2.0 V
RC   | Basic / RESISTOR                                 | 1k
VCC  | Sources / POWER_SOURCES / DC_POWER               | 5 V
GND  | Sources / POWER_SOURCES / GROUND                 | —

- 计算说明：
  1) 目标 Ic(sat) ≈ 3 mA，取 VCC = 5 V、LED_red 的 Vf ≈ 2.0 V、Vce(sat) ≈ 0.2 V
     → RC = (5 − 2.0 − 0.2) / 3 mA ≈ 933 Ω，取 E24 标称 1k → Ic ≈ 2.8 mA
  2) 取强制 β = 10（远小于 2N2222 的 β ≈ 200，保证深度饱和）→ Ib ≥ 2.8 mA / 10 = 0.28 mA
     → RB ≤ (5 − 0.7) / 0.28 mA ≈ 15.4k，取标称 10k → Ib = (5 − 0.7) / 10k = 0.43 mA
  3) 校核：Ib × βmin(100) = 43 mA ≫ 2.8 mA → 深度饱和，Vce ≈ 0.2 V
  4) 功耗校核：P(RC) = (2.8 mA)² × 1k = 7.8 mW，P(LED) = 2.0 V × 2.8 mA × 50% = 2.8 mW，
     均远小于 1/4 W

- 信号流向：输入 1 kHz 方波经 RB 限流进入 Q1 基极；Q1 工作在开关状态（饱和/截止）；
  输入高电平时 Q1 饱和导通，电流从 VCC 经 RC → LED_red → Q1 的 C-E 到地，LED 点亮；
  输入低电平时 Q1 截止，集电极回路断开，C 点被上拉到 5 V，LED 熄灭。

硬性约束（必须遵守）：
1. 分析指令只允许：.OP / .AC / .TRAN / .DC
2. 禁止：.MEAS .FOUR .NOISE .TF .SENS .STEP .TEMP .MC .PROBE .PLOT .PRINT
3. 黑盒策略：含有源器件时允许 .MODEL，禁止 .SUBCKT
4. 元件值写法：10k / 1k / 5（禁止科学计数法；.MODEL 内参数除外，如 14.34F）
5. 节点名全英文大写；首行标题注释；末行 .END；ANSI 编码
6. 【导入布局优化】Multisim 按元件行出现顺序从左到右摆放元件，元件行必须按
   物理信号流顺序书写：VIN → RB → Q1 → DLED → RC → VCC；
   .MODEL 行放元件行之后、分析指令之前

输出格式（严格按以下 7 部分，顺序不变）：
## 1. 完整 .cir 网表代码（一个代码块，行首 * 中文注释，注明文件名与编码）
## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数）
## 3. ASCII 布局图（信号左到右，电源顶、地底，标旋转角度）
## 4. 导入后整理步骤（黑盒替换/摆位旋转/连线顺序/网络标签/美化）
## 5. 连线表（序号 | 从 | 到 | 是否用网络标签）
## 6. 仪器设置（XFG1/XSC1 端子与面板参数 + Grapher 游标读数法）
## 7. 验证值 + 易错点（理论计算表 + 3 个典型接错方式及读数表现）

补充要求：
A. .cir 文件内所有注释使用英文（Multisim 导入器对非 ASCII 字符敏感，
   中文说明请放在第 2/3/4/5/6/7 部分，不要写进网表）。
B. 每行长度不超过 132 字符，超长用 + 续行。
C. 输出第 7 部分时，理论值必须能用网表里的元件值手算复现，
   并额外给出「这 3 个数如果测出来偏了，最可能是哪里接错」。
```

## 人工改动记录

| 位置 | AI 原输出 | 人工改为 | 原因 |
|------|----------|---------|------|
| 网表注释语言 | 中文注释（`* 001 BJT开关...`） | 全英文 | Multisim 导入器实测对非 ASCII 字符敏感，中文注释会导致解析失败；中文说明移到本目录 README |
| `.MODEL LED_RED` | 部分模型未给 `RS` | 补 `RS=2.5` | 无串联电阻的理想二极管会算得 If 偏大 |
| 分析指令 | `.TRAN 1u 3m 0 1u UIC` | 去掉 `UIC` | Multisim 导入器对 `UIC` 支持不稳定 |

## 自检结果

- [x] 已用 `prompts/circuit-review-prompt.md` 跑过 7 项自检（结论：PASS）
- [x] `python scripts/cir_lint.py circuits/001-bjt-switch-led/001-bjt-switch-led.cir` 通过（0 error）
- [ ] 已在 Multisim 里实际导入并跑通 → **未跑通**，故 `status: 待验证`
