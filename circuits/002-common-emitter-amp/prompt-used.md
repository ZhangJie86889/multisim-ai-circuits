# 002 使用的提示词（可复现）

## 使用的模型

| 项 | 值 |
|----|----|
| 模型 | 示例：DeepSeek-V3（替换成你实际使用的模型） |
| 日期 | 2026-09-10 |
| 温度 / 其他参数 | 默认 |
| 生成轮次 | 第 1 轮，追问 1 次（要求把射极电阻拆成 RE1 + RE2 以提高增益） |

## 填完占位符的提示词

```text
你是精通 NI Multisim 14.3 的电路仿真工程师，熟悉 SPICE 网表语法及 Multisim 网表导入兼容性。

任务：
设计一个【2N2222 分压偏置阻容耦合共射极放大器（单电源 12 V，电压增益 ≥ 20，
下限频率 ≤ 100 Hz）】，输出可直接用 Multisim File → Open 导入的 .cir 网表。
我要用【XSC1 双通道示波器 + XMM1 万用表 + AC Analysis 的 Grapher】验证
【静态工作点 Vc ≈ VCC/2、Ic ≈ 1 mA；1 kHz 小信号电压增益 |Av| ≥ 20；输出与输入反相 180°；
下限频率 ≤ 100 Hz；10 mVp 输入时输出不失真】。

电路规格：
- 性能指标：|Av| ≥ 20（1 kHz，RL = 10 kΩ）；Ic ≈ 1 mA；Vc ≈ 6 ~ 7 V（留出对称动态范围）；
  下限频率 ≤ 100 Hz；10 mVp 输入时输出无明显失真
- 电源：单电源 VCC = 12 V（网络名 VCC，对地）
- 输入：1 kHz 正弦，10 mV 峰值，0 V 直流偏置（AC 分析幅值同为 10 mV）
- 负载：RL = 10 kΩ 阻性负载，接在输出耦合电容之后
- 有源器件：2N2222（NPN，Transistors / BJT_NPN，Multisim 主数据库自带）

具体元器件要求（必须使用）：
VIN  | Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE | 10 mV 峰值，1 kHz 正弦，AC 10m
C1   | Basic / CAPACITOR                             | 10u，输入耦合
R1   | Basic / RESISTOR                              | 47k，上偏置
R2   | Basic / RESISTOR                              | 8.2k，下偏置
Q1   | Transistors / BJT_NPN / 2N2222                | NPN，β ≈ 200
RC   | Basic / RESISTOR                              | 4.7k，集电极电阻
RE1  | Basic / RESISTOR                              | 100，射极交流负反馈（不旁路）
RE2  | Basic / RESISTOR                              | 900，射极直流负反馈（被 CE 旁路）
CE   | Basic / CAPACITOR                             | 100u，射极旁路，并在 RE2 两端
C2   | Basic / CAPACITOR                             | 10u，输出耦合
RL   | Basic / RESISTOR                              | 10k，负载
VCC  | Sources / POWER_SOURCES / DC_POWER            | 12 V
GND  | Sources / POWER_SOURCES / GROUND              | —

- 计算说明：
  1) 取 Ic ≈ 1 mA，VCC = 12 V。令 Ve ≈ VCC/10 = 1.2 V 以获得良好温度稳定性
     → Re_total = 1.2 V / 1 mA = 1.2 kΩ，取标称 1 kΩ（RE1 100 + RE2 900）→ Ve = 1.08 V，Ie = 1.08 mA
  2) Vb = Ve + 0.7 = 1.78 V。取分压电流 ≈ 10 × Ib = 10 × (1 mA / 200) = 50 µA，
     实际取 ≈ 217 µA（更稳）→ R2 = 1.78 / 217µ ≈ 8.2k，R1 = (12 − 1.78) / 217µ ≈ 47k
     校核：Vb = 12 × 8.2 / 55.2 = 1.78 V ✅
  3) 取 Vc ≈ VCC/2 附近 → Rc = (12 − 6.94) / 1.08 mA ≈ 4.7k（标称）→ Vc = 12 − 1.08m × 4.7k = 6.94 V
     Vce = 6.94 − 1.08 = 5.86 V，动态范围 ≈ ±5 V ✅
  4) re = 26 mV / 1.08 mA = 24 Ω
     空载 |Av| = Rc / (RE1 + re) = 4.7k / 124 = 37.9 ≥ 20 ✅
     带载 |Av| = (4.7k ∥ 10k) / 124 = 3.20k / 124 = 25.8 ≥ 20 ✅
  5) 下限频率：Rth = R1 ∥ R2 = 6.98k
     CE 支路等效电阻 = RE1 + re + Rth/β = 100 + 24 + 34.9 = 159 Ω
     → f_L(CE) = 1 / (2π × 159 × 100u) ≈ 10 Hz ≤ 100 Hz ✅
     C1: Rin = 47k ∥ 8.2k ∥ [200 × 124] = 5.4k → f_L = 1/(2π × 5.4k × 10u) ≈ 2.9 Hz
     C2: f_L = 1/(2π × 14.7k × 10u) ≈ 1.1 Hz
     → 主导 f_L ≈ 10 Hz ✅
  6) 动态范围：正向受截止限制 ΔV+ = 12 − 6.94 = 5.06 V；负向受饱和限制
     ΔV− = 6.94 − (1.08 + 0.2) = 5.66 V → 最大不失真输出峰值 ≈ 5.06 V
     → 最大输入峰值 = 5.06 / 25.8 ≈ 196 mVp

- 信号流向：1 kHz 正弦经 C1 耦合到 Q1 基极（直流偏置由 R1/R2 分压提供）；
  Q1 以共射极组态放大并反相，集电极电压经 C2 耦合、隔直后驱动 RL；
  射极经 RE1（保留交流负反馈）+ RE2（被 CE 旁路）到地，CE 只旁路 RE2 以兼顾
  Q 点稳定与增益。

硬性约束（必须遵守）：
1. 分析指令只允许：.OP / .AC / .TRAN / .DC
2. 禁止：.MEAS .FOUR .NOISE .TF .SENS .STEP .TEMP .MC .PROBE .PLOT .PRINT
3. 黑盒策略：含有源器件时允许 .MODEL，禁止 .SUBCKT
4. 元件值写法：10k / 1k / 5（禁止科学计数法；.MODEL 内参数除外，如 14.34F）
5. 节点名全英文大写；首行标题注释；末行 .END；ANSI 编码
6. 【导入布局优化】Multisim 按元件行出现顺序从左到右摆放元件，元件行必须按
   物理信号流顺序书写：VIN → C1 → R1 → R2 → Q1 → RC → RE1 → RE2 → CE → C2 → RL → VCC；
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
| 射极电阻 | 单一 `RE = 1k` + `CE` 全旁路（增益仅 ~4.7，不达标） | 拆成 `RE1 = 100`（不旁路）+ `RE2 = 900`（旁路） | 这是第 2 轮追问的核心：既保住 1 mA 静态点，又把增益提到 25.8 |
| `R2` | 10k | 8.2k | 让 `Vb` 落在 1.78 V，`Vc` 落在 6.94 V（更接近 VCC/2） |
| 网表注释 | 中文 | 英文 | Multisim 导入器对非 ASCII 敏感 |
| 分析指令 | `.AC DEC 10 1 1MEG` | `.AC DEC 10 10 1MEG` | 起始频率 1 Hz 时仿真点数过多、耗时长；10 Hz 已覆盖 f_L |

## 自检结果

- [x] 已用 `prompts/circuit-review-prompt.md` 跑过 7 项自检（结论：PASS）
- [x] `python scripts/cir_lint.py circuits/002-common-emitter-amp/002-common-emitter-amp.cir` 通过（0 error）
- [ ] 已在 Multisim 里实际导入并跑通 → **未跑通**，故 `status: 待验证`
