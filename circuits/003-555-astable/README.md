---
id: 003
name: NE555 多谐振荡器
difficulty: 进阶
status: 待验证
desc: NE555 无稳态方波输出，约 1 kHz，占空比约 53%，需黑盒替换为库件 LM555CN
signalflow: RA,RB,CT,CC,RPU,XU1,RL,VCC
---

<!-- SIGNALFLOW: RA,RB,CT,CC,RPU,XU1,RL,VCC -->

# 003 · NE555 多谐振荡器（约 1 kHz 方波）

> 🟡 **待验证** —— 本页由 AI 依据 [`prompt-used.md`](./prompt-used.md) 生成，
> 网表已通过 `cir_lint.py`，但**尚未有人在真实 Multisim 14.3 里跑通**。
>
> ⚠️ **本电路有一个先天限制，务必先读**：项目硬性约束**禁止 `.SUBCKT`**，
> 而 NE555 是集成电路，没有 `.SUBCKT` 就无法在纯 SPICE 里描述其内部结构。
> 因此网表里 `XU1` 只是一个**黑盒占位**（模型名 `NE555`）。
> **导入 Multisim 后必须把它替换成主数据库里的 `Mixed / TIMER / LM555CN`**，
> 否则仿真会报 "model not found" 或输出恒为 0。
> 这是"AI 生成内容需人工验证"最典型的一个例子——网表语法没问题，但内容必须人来补全。

---

## 1. 完整 .cir 网表代码

文件名：`003-555-astable.cir`　编码：**ANSI（7-bit ASCII）**

```spice
* 003-555-ASTABLE: NE555 ASTABLE MULTIVIBRATOR, ABOUT 1 KHZ SQUARE WAVE, ANSI
* FILE: 003-555-astable.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: RA -> RB -> CT -> CC -> RPU -> XU1 -> RL -> VCC
* XU1 IS A BLACK BOX: PIN ORDER IS 1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC
* REPLACE IT WITH THE MULTISIM LIBRARY PART (MIXED / TIMER / LM555CN) AFTER IMPORT.
* THERE IS NO .MODEL LINE ON PURPOSE: NO .SUBCKT IS ALLOWED, SO THE INTERNAL
* CIRCUIT OF THE 555 CANNOT BE DESCRIBED HERE.
RA VCC DIS 8.2k
RB DIS THR 68k
CT THR 0 10n
CC CTRL 0 10n
RPU VCC RESET 10k
XU1 0 THR OUT RESET CTRL THR DIS VCC NE555
RL OUT 0 10k
VCC VCC 0 5
.TRAN 1u 10m 0 1u
.END
```

**引脚顺序（DIP-8，从左上逆时针）**：`1=GND  2=TRIG  3=OUT  4=RESET  5=CTRL  6=THR  7=DIS  8=VCC`
网表里 `XU1` 后的 8 个节点就是按这个顺序排列的，**第 2 和第 6 位都写 `THR`**
（即把 TRIG 与 THR 短接，这是无稳态接法的关键）。

---

## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数）

| 网表标号 | Multisim 库路径（Group / Family / Component） | 参数 | 备注 |
|---------|---------------------------------------------|------|------|
| RA | Basic / RESISTOR | **8.2k** | VCC → DIS（7 脚），充电电阻上臂 |
| RB | Basic / RESISTOR | **68k** | DIS（7 脚）→ THR（6/2 脚），充放电共用 |
| CT | Basic / CAPACITOR | **10n**（0.01 µF，瓷片/涤纶） | THR → GND，定时电容，决定频率 |
| CC | Basic / CAPACITOR | **10n** | CTRL（5 脚）→ GND，去耦，**不接会频偏/受干扰** |
| RPU | Basic / RESISTOR | **10k** | VCC → RESET（4 脚），上拉防误复位 |
| XU1 | Mixed / TIMER / **LM555CN**（或 NE555） | DIP-8，VCC 4.5~16 V | **必须黑盒替换**；网表里只是占位名 `NE555` |
| RL | Basic / RESISTOR | **10k** | OUT → GND，输出负载 |
| VCC | Sources / POWER_SOURCES / DC_POWER | **5 V** | 网络名 `VCC` |
| GND | Sources / POWER_SOURCES / GROUND | — | 必须放 |

---

## 3a. 网格坐标表（Multisim 默认栅格 0.1 inch = 1 格，相对坐标）

> 芯片 XU1 居中（缺口朝左，1~4 脚在左、5~8 脚在右）；
> 定时网络 `VCC → RA → DIS → RB → THR → CT → GND` 排在芯片右侧；
> RESET 上拉在左上，OUT 负载在左下。所有电阻电容按"上电阻、下电容"分两排。

| 标号 | 列 x | 行 y | 旋转 | 摆放说明 |
|------|------|------|------|---------|
| XU1 | 8 | 4 | 0° | DIP-8，缺口朝左；1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC |
| RA | 8 | 1 | 90° | VCC → DIS(7)，芯片右上方 |
| RB | 12 | 2 | 0° | DIS(7) → THR(6)，横放 |
| CT | 12 | 6 | 90° | THR → GND，定时电容（决定频率） |
| CC | 15 | 6 | 90° | CTRL(5) → GND，去耦（不接会频偏） |
| RPU | 5 | 1 | 90° | VCC → RESET(4)，芯片左上方 |
| RL | 3 | 7 | 90° | OUT(3) → GND，输出负载 |
| VCC | 8 | 0 | 0° | 顶部电源符号 |
| GND | 8 | 10 | 0° | 底部地符号 |

---

## 3b. ASCII 布局图（按 3a 坐标绘制：信号左到右，电源顶、地底，标旋转角度）

```
                        +5 V (VCC)
                            |
        +-------------------+-------------------+
        |                                       |
      RPU 10k                                RA 8.2k          [均旋转 90°, 竖放]
        |                                       |
      RESET (4)                              DIS (7)
        |                                       |
        |                                    RB 68k           [旋转 0°, 横放]
        |                                       |
        |                                       +---- THR (网络标签: THR)
        |                                       |        = 同时接 2 脚 TRIG 与 6 脚 THR
        |                                       |
        |        XU1  LM555CN  [旋转 0°]        |
        |      +----------------------+         |
        |   1 -|GND                VCC|-8 ------+
        |   2 -|TRIG              DIS |-7 ------+
        |   3 -|OUT              THR  |-6 ------+
        |   4 -|RESET            CTRL |-5 ---- CC 10n ---- GND   [CC 旋转 90°]
        |      +----------------------+    |         |
        |           |                      |         |
        |         OUT (网络标签)           CT 10n   GND
        |           |                      |         |
        +-- RL 10k -+                      |         |
        |           |                      |         |
       GND         GND --------------------+---------+
        |
        +-- XSC1 CH B + --> OUT,  CH B - --> GND
```

**旋转角度**：`RA`、`RPU`、`CC`、`CT` 竖放 `90°`；`RB`、`RL` 横放 `0°`；
`XU1` 芯片 `0°`（缺口朝左，1 脚在左下）。

---

## 4. 导入后整理步骤

1. **黑盒替换（本电路的核心步骤，不做就一定跑不起来）**
   - 网表里的 `XU1 ... NE555` 导入后是一个**没有内部模型的空盒**。
   - 删掉它，从 `Mixed / TIMER / LM555CN`（或搜 `NE555`）重新放置一个 8 脚芯片。
   - 按第 5 节连线表把 8 个引脚逐一接回。**引脚顺序是 DIP-8 标准：1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC**。
2. **摆位旋转**：按第 3 节图摆；芯片缺口朝左。
3. **连线顺序**：
   ① 定时网络 `VCC → RA → DIS → RB → THR → CT → GND`；
   ② `THR` 同时飞一根线到 `TRIG`（2 脚）——**这根线漏了就振荡不起来**；
   ③ `CTRL`（5 脚）→ `CC` → GND；
   ④ `VCC → RPU → RESET`（4 脚）；
   ⑤ `OUT`（3 脚）→ `RL` → GND，并引到 XSC1 CH B；
   ⑥ 芯片 1 脚 → GND，8 脚 → VCC。
4. **网络标签**：`VCC`、`THR`、`DIS`、`RESET`、`OUT` 全部加网络名，
   555 的连线交叉多，不加标签会连错。
5. **美化**：把 `RA / RB` 放在芯片上方一排，`CT / CC` 放在下方一排，视觉上就是"上电阻下电容"。
6. **重设分析**：`Simulate → Analyses and simulation → Transient Analysis`，
   End time **10 ms**、Maximum time step **1 us**，Output 加 `V(OUT)`、`V(THR)`。
   > 若一开始不起振，在 `Analyses → Transient` 里勾选 **"Set initial conditions" → User-defined**，
   > 或在 Multisim 里临时把 `CT` 初值设为 0（`Initial conditions`），帮助起振。

---

## 5. 连线表（序号 | 从 | 到 | 网络标签 | 建议走线方向）

| # | 从 | 到 | 网络标签 | 建议走线方向 |
|---|-----|-----|---------|-------------|
| 1 | VCC (+5 V) | RA 上端 | `VCC` | 短直线（同列，(8,0)→(8,1)） |
| 2 | RA 下端 | XU1 引脚 7（DIS） | `DIS` | 先竖后横 |
| 3 | XU1 引脚 7（DIS） | RB 左端 | `DIS` | 短直线（芯片右侧就近走线） |
| 4 | RB 右端 | XU1 引脚 6（THR） | `THR` | 先横后竖 |
| 5 | XU1 引脚 6（THR） | XU1 引脚 2（TRIG） | `THR`（**关键短接**） | 网络标签（免走线，2 / 6 脚同名即同网） |
| 6 | `THR` 节点 | CT 上端 | `THR` | 先横后竖 |
| 7 | CT 下端 | GND | — | 短直线（同列，(12,7)→(12,10)） |
| 8 | XU1 引脚 5（CTRL） | CC 上端 | `CTRL` | 先横后竖 |
| 9 | CC 下端 | GND | — | 短直线（同列，(15,7)→(15,10)） |
| 10 | VCC (+5 V) | RPU 上端 | `VCC` | 网络标签（免走线，与第 1 条同网） |
| 11 | RPU 下端 | XU1 引脚 4（RESET） | `RESET` | 先竖后横 |
| 12 | XU1 引脚 8（VCC） | VCC (+5 V) | `VCC` | 网络标签（免走线） |
| 13 | XU1 引脚 1（GND） | GND | — | 短直线 |
| 14 | XU1 引脚 3（OUT） | RL 上端 | `OUT` | 先横后竖 |
| 15 | RL 下端 | GND | — | 先竖后横（(3,8)→(3,10)→(8,10)） |
| 16 | XSC1 CH B `+` | `OUT` | `OUT` | 网络标签（免走线） |
| 17 | XSC1 CH B `-` | GND | — | 网络标签（免走线） |

> ⚠️ **第 5 条（THR ↔ TRIG 短接）是无稳态接法的灵魂**。漏掉它，电容电压永远充不到
> 2/3 VCC 触发复位，输出会一直卡在高电平。

---

## 6. 仪器设置（XFG1 / XSC1 端子与面板参数 + Grapher 游标读数法）

- 本电路**不需要 XFG1**（555 自激，没有外部输入）。
- 若想验证 RESET 功能，可临时用 XFG1 给 4 脚灌 0/5 V 方波（1 kHz 以下），观察输出被门控。

### XSC1 示波器（双通道看"电容三角波 + 输出方波"，这是 555 最经典的波形对照）

| 项 | 设置 |
|----|------|
| Timebase | **100 us/Div**（周期 ≈ 1 ms，看 10 个周期；想看细节用 50 us/Div） |
| CH A | `THR`（电容电压），**1 V/Div**，DC 耦合 |
| CH B | `OUT`，**2 V/Div**，DC 耦合 |
| Trigger | CH B，上升沿，Level **2 V** |
| 预期现象 | CH A 是在 **1.67 V ↔ 3.33 V** 之间来回的**锯齿/指数波**；CH B 是 0~3.7 V 方波，跳变点正好对应 CH A 触及 1.67 V / 3.33 V 的时刻 |
| 接线 | CH A `+`→`THR`，CH B `+`→`OUT`，两路 `−`→GND |

### XMM1 / 频率计

Multisim 的 **Frequency Counter（XFC1）** 接到 `OUT` 可直接读频率，比示波器游标更准；
注意把 `Trigger Level` 设到 2 V、`Coupling` 选 DC。

### Grapher 游标读数法

1. `Transient Analysis`（0–10 ms，1 us）后开 Grapher，Output 选 `V(OUT)` 与 `V(THR)`。
2. `Cursor` → Cursor 1 / Cursor 2 卡在 `V(OUT)` **相邻两个上升沿** → `dx` = 周期 `T`，`f = 1/dx`。
3. 卡在**同一个周期内** `V(OUT)` 的上升沿与下降沿 → `dx` = 高电平时间 `tH`；
   下降沿到下一个上升沿 → `tL`。占空比 `D = tH / T`。
4. 切到 `V(THR)` 曲线，用游标读**波峰与波谷** → 应分别为 **3.33 V** 与 **1.67 V**（即 2/3 VCC 与 1/3 VCC）。
5. 读 `V(OUT)` 高电平平台 → 应约 **3.7 V**（NE555 输出高电平典型为 `VCC − 1.3 V`，不是 5 V！）。

---

## 7. 验证值 + 易错点

### 7.1 理论计算表

前提：`VCC = 5 V`，`RA = 8.2 kΩ`，`RB = 68 kΩ`，`C = 10 nF`，NE555 内部比较器阈值
`1/3 VCC` 与 `2/3 VCC`。

| # | 观测量 | 计算式 | 理论值 | 实测值 |
|---|--------|--------|--------|--------|
| 1 | 充电时间 tH（输出高） | `0.693 × (RA + RB) × C = 0.693 × 76.2k × 10n` | **528 µs** | 待填 |
| 2 | 放电时间 tL（输出低） | `0.693 × RB × C = 0.693 × 68k × 10n` | **471 µs** | 待填 |
| 3 | 周期 T | `tH + tL` | **999 µs** | 待填 |
| 4 | 频率 f | `1 / T = 1.44 / ((RA + 2RB) × C)` | **1.00 kHz** | 待填 |
| 5 | 占空比 D | `tH / T = (RA+RB)/(RA+2RB) = 76.2/144.2` | **52.9 %** | 待填 |
| 6 | 电容电压上限 | `2/3 × VCC` | **3.33 V** | 待填 |
| 7 | 电容电压下限 | `1/3 × VCC` | **1.67 V** | 待填 |
| 8 | 输出高电平 VOH | `VCC − 1.3`（NE555 典型，Iout ≈ 5 mA 时更接近 `VCC − 1.7`） | **≈ 3.7 V**（不是 5 V！） | 待填 |
| 9 | 输出低电平 VOL | `≈ 0.1 V` | **≈ 0.1 V** | 待填 |
| 10 | 输出峰峰值 | `VOH − VOL` | **≈ 3.6 Vpp** | 待填 |
| 11 | 输出电流（RL = 10k 时） | `3.7 V / 10k` | **0.37 mA** | 待填 |
| 12 | DIS 放电峰值电流 | `3.33 V / RB = 3.33 / 68k` | **49 µA**（很小，7 脚安全） | 待填 |
| 13 | 若去掉 CC（5 脚悬空）时频率漂移 | — | 典型 **±5 %** 且易受干扰 | 待填 |

### 7.2 3 个典型接错方式及读数表现

| # | 接错方式 | 读数 / 现象表现 |
|---|---------|----------------|
| 1 | **忘记把 THR（6 脚）与 TRIG（2 脚）短接** | 电容可以充到 2/3 VCC 使输出变低、放电管导通，但**触发比较器永远不会翻转回高** → 输出**卡在低电平（≈ 0.1 V）不动**，示波器一条直线；`V(THR)` 在 1.67 V 附近上下小幅摆动。**排查**：看 `V(OUT)` 是否恒低且 `V(THR)` 停在 1.67 V 不动。 |
| 2 | **RA 与 RB 位置对调**（68k 接 VCC→DIS，8.2k 接 DIS→THR） | 电路仍然振荡，但频率变成 `1.44/((68k + 2×8.2k)×10n) = 1.44/842µ = **1.71 kHz**`，占空比变成 `(68+8.2)/84.2 = **90.5 %**`——输出是一串很窄的负脉冲。**排查**：频率对了但占空比离 50% 很远，先怀疑 RA/RB 接反（或 RB 太小）。要占空比 < 50% 必须在 RB 上并联二极管。 |
| 3 | **RESET（4 脚）悬空或误接地** | 悬空时芯片可能被干扰随机复位 → 输出**间歇性停振**（波形一段有一段没有）；接地时**完全不振**，输出恒定低电平 ≈ 0 V，`V(THR)` 停在 2.5 V 左右。**排查**：先测 4 脚电压，应为 5 V（经 RPU 上拉）；若为 0，检查 RPU 是否焊/连到 VCC。 |

**补充易错点**：
- **输出高电平不是 5 V**。NE555 的输出级是双极型推挽，高电平典型 `VCC − 1.3 V ≈ 3.7 V`。
  如果你测到 5.0 V，说明用的是 CMOS 版本（如 TLC555 / LMC555）或模型参数偏理想。
- **频率算不准**：`f = 1.44/((RA + 2RB)C)` 是**忽略放电管饱和压降与传播延迟**的近似式，
  实测偏低 2~5 % 属正常。`C` 用 10 nF 这种小电容时，**面包板/导线的分布电容（几 pF）**也会带来偏差，
   Multisim 里看不到，实做时会在高频段明显。
- **要占空比可调到 50 % 以下**：在 `RB` 两端反并联一个二极管（阳极接 THR、阴极接 DIS），
  让充电只走 `RA`、放电只走 `RB`。本电路未包含该二极管，故 `D > 50 %`。
- **CTRL（5 脚）不建议真悬空**：Multisim 里悬空往往还能跑，实做必须接 10 nF 到地。
