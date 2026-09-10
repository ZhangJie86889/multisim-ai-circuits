# 003 使用的提示词（可复现）

## 使用的模型

| 项 | 值 |
|----|----|
| 模型 | 示例：DeepSeek-V3（替换成你实际使用的模型） |
| 日期 | 2026-09-10 |
| 温度 / 其他参数 | 默认 |
| 生成轮次 | 第 1 轮；第 2 轮追问"禁止 .SUBCKT 时 555 怎么办" |

## 填完占位符的提示词

```text
你是精通 NI Multisim 14.3 的电路仿真工程师，熟悉 SPICE 网表语法及 Multisim 网表导入兼容性。

任务：
设计一个【NE555 无稳态多谐振荡器（5 V 单电源，输出约 1 kHz 方波，占空比接近 50 %）】，
输出可直接用 Multisim File → Open 导入的 .cir 网表。
我要用【XSC1 双通道示波器（CH A 看定时电容电压，CH B 看输出）+ Frequency Counter】验证
【输出频率约 1 kHz；电容电压在 1/3 VCC ~ 2/3 VCC 之间来回；输出高电平约 VCC−1.3 V（不是 5 V）；
占空比约 53 %】。

电路规格：
- 性能指标：输出频率 1.00 kHz（允许 ±5 %）；占空比 50 % ~ 60 %；
  定时电容电压摆幅 = 1/3 VCC ~ 2/3 VCC；输出高电平 ≥ 3.3 V
- 电源：单电源 VCC = 5 V（网络名 VCC，对地）
- 输入：无外部输入（自激振荡）；第 5 脚 CTRL 经 10 nF 去耦到地，第 4 脚 RESET 经 10 kΩ 上拉到 VCC
- 负载：RL = 10 kΩ 接在 OUT（3 脚）到地
- 有源器件：NE555 / LM555CN（Mixed / TIMER，Multisim 主数据库自带，DIP-8）

具体元器件要求（必须使用）：
RA  | Basic / RESISTOR   | 8.2k，VCC -> DIS(7)
RB  | Basic / RESISTOR   | 68k，DIS(7) -> THR(6)，且 THR(6) 与 TRIG(2) 短接
CT  | Basic / CAPACITOR  | 10n，THR -> GND，定时电容
CC  | Basic / CAPACITOR  | 10n，CTRL(5) -> GND，去耦
RPU | Basic / RESISTOR   | 10k，VCC -> RESET(4)，上拉
XU1 | Mixed / TIMER / LM555CN | DIP-8，引脚 1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC
RL  | Basic / RESISTOR   | 10k，OUT(3) -> GND
VCC | Sources / POWER_SOURCES / DC_POWER | 5 V
GND | Sources / POWER_SOURCES / GROUND   | —

- 计算说明：
  1) f = 1.44 / ((RA + 2*RB) * C)。目标 f = 1 kHz
     → (RA + 2*RB) * C = 1.44e-3
  2) 取 C = 10 nF（小电容、漏电小） → RA + 2*RB = 144 kΩ
  3) 取 RB = 68 kΩ（E24 标称） → RA = 144k − 136k = 8 kΩ，取 E24 标称 8.2 kΩ
     校核：RA + 2*RB = 8.2k + 136k = 144.2 kΩ
           f = 1.44 / (144.2k * 10n) = 1.44 / 1.442e-3 = 998.6 Hz ≈ 1.00 kHz ✅
  4) tH = 0.693 * (RA + RB) * C = 0.693 * 76.2k * 10n = 528 µs
     tL = 0.693 * RB * C       = 0.693 * 68k  * 10n = 471 µs
     T  = tH + tL = 999 µs ✅    D = tH / T = 52.9 % ✅（在 50~60 % 内）
  5) 电容电压摆幅：1/3 * 5 = 1.67 V ~ 2/3 * 5 = 3.33 V
  6) 输出高电平：VOH ≈ VCC − 1.3 = 3.7 V（NE555 双极输出级），VOL ≈ 0.1 V
  7) 放电电流校核：I_dis(peak) = 3.33 V / RB = 49 µA，远小于 7 脚额定值 ✅

- 信号流向：上电后 CT 经 RA + RB 从 0 V 充电；充到 2/3 VCC 时内部上比较器翻转，
  输出变低、放电管导通，CT 经 RB 向 DIS(7) 放电；放到 1/3 VCC 时下比较器翻转，
  输出变高、放电管截止，重新充电，如此循环形成自激方波。

硬性约束（必须遵守）：
1. 分析指令只允许：.OP / .AC / .TRAN / .DC
2. 禁止：.MEAS .FOUR .NOISE .TF .SENS .STEP .TEMP .MC .PROBE .PLOT .PRINT
3. 黑盒策略：含有源器件时允许 .MODEL，禁止 .SUBCKT
4. 元件值写法：10k / 1k / 5（禁止科学计数法；.MODEL 内参数除外，如 14.34F）
5. 节点名全英文大写；首行标题注释；末行 .END；ANSI 编码
6. 【导入布局优化】Multisim 按元件行出现顺序从左到右摆放元件，元件行必须按
   物理信号流顺序书写：RA → RB → CT → CC → RPU → XU1 → RL → VCC；
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
D. 因为禁止 .SUBCKT，NE555 的内部电路无法描述。请明确写出：
   XU1 只是黑盒占位（模型名 NE555），导入 Multisim 后必须替换成
   Mixed / TIMER / LM555CN，并在第 4 部分把替换步骤写成第一步。
```

## 人工改动记录

| 位置 | AI 原输出 | 人工改为 | 原因 |
|------|----------|---------|------|
| `RA` | 8k（由 144k − 136k 算出） | 8.2k | E24 标称值没有 8.0k；换 8.2k 后 f = 998.6 Hz，仍在 ±5 % 内 |
| `.MODEL NE555 ...` | 尝试用 `.MODEL` 描述 555 | 删除，改为纯黑盒 `XU1 ... NE555` | `.MODEL` 只能描述两端/三端器件，描述不了 8 脚 IC；硬写会生成无效模型 |
| 分析指令 | `.OP .TRAN 1u 10m 0 1u` | 只保留 `.TRAN 1u 10m 0 1u` | 无稳态电路没有稳定直流工作点，`.OP` 无意义且易让导入器报错 |
| 网表注释 | 中文 | 英文 | Multisim 导入器对非 ASCII 敏感 |
| 第 8 部分 | AI 未主动说明黑盒限制（第 1 轮） | 追问后补 `D` 条并要求写入第 4 部分 | 这是本电路最容易让人踩坑的点，必须显式写出来 |

## 自检结果

- [x] 已用 `prompts/circuit-review-prompt.md` 跑过 7 项自检
  （第 6 项"数值自洽"结论：频率/占空比自洽；第 5 项提示 `XU1` 的 `NE555` 为外部模型引用，需在 Multisim 侧替换 —— 已在 README 顶部显著标注）
- [x] `python scripts/cir_lint.py circuits/003-555-astable/003-555-astable.cir` 通过（0 error）
- [ ] 已在 Multisim 里实际导入并跑通 → **未跑通**，故 `status: 待验证`
