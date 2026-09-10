---
id: 001
name: BJT 开关驱动 LED
difficulty: 入门
status: 待验证
desc: 2N2222 饱和开关驱动红色 LED，验证 Ib/Ic/Vce(sat) 与开关波形
signalflow: VIN,RB,Q1,DLED,RC,VCC
---

<!-- SIGNALFLOW: VIN,RB,Q1,DLED,RC,VCC -->

# 001 · BJT 开关驱动 LED（2N2222 + LED_red）

> 🟡 **待验证** —— 本页 7 部分内容由 AI 依据 [`prompt-used.md`](./prompt-used.md) 生成，
> 网表已通过 `cir_lint.py`，但**尚未有人在真实 Multisim 14.3 里跑通**。
> 理论值与实测值对照见 [`verification.md`](./verification.md)。

---

## 1. 完整 .cir 网表代码

文件名：`001-bjt-switch-led.cir`　编码：**ANSI（7-bit ASCII）**
（网表内注释全部英文——Multisim 导入器对非 ASCII 字符敏感，中文说明放在本页下方各节）

```spice
* 001-BJT-SWITCH-LED: 2N2222 SATURATED SWITCH DRIVING A RED LED, ANSI, MULTISIM 14.3
* FILE: 001-bjt-switch-led.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> RB -> Q1 -> DLED -> RC -> VCC
* ELEMENT LINES ARE WRITTEN IN SIGNAL-FLOW ORDER SO MULTISIM PLACES
* COMPONENTS LEFT TO RIGHT ALONG THE SIGNAL PATH.
VIN IN 0 PULSE(0 5 0 1u 1u 0.5m 1m)
RB IN BASE 10k
Q1 COL BASE 0 2N2222
DLED COL DLEDN LED_RED
RC DLEDN VCC 1k
VCC VCC 0 5
.MODEL 2N2222 NPN(IS=1E-14 BF=200 VAF=100 IKF=0.3 BR=3 RB=10 RC=0.3 RE=0.2
+ TF=400E-12 TR=100E-9 CJE=25E-12 CJC=8E-12)
.MODEL LED_RED D(IS=1E-21 N=1.8 RS=2.5 BV=5 IBV=10u CJO=50p TT=5u)
.OP
.TRAN 1u 3m 0 1u
.END
```

**行序说明**：`VIN → RB → Q1 → DLED → RC → VCC`，即 Multisim 导入后从左到右的摆放顺序。
`.MODEL` 行在元件行之后、`.OP / .TRAN` 之前。

---

## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数）

| 网表标号 | Multisim 库路径（Group / Family / Component） | 参数 | 备注 |
|---------|---------------------------------------------|------|------|
| VIN | Sources / SIGNAL_VOLTAGE_SOURCES / PULSE_VOLTAGE | `PULSE(0 5 0 1u 1u 0.5m 1m)`：0→5 V，周期 1 ms（1 kHz），占空比 50% | 若导入不稳定，改用 Sources / SIGNAL_VOLTAGE_SOURCES / **CLOCK_VOLTAGE**（Frequency 1 kHz、Duty 50%、5 V） |
| RB | Basic / RESISTOR | **10k** | 基极限流，决定 Ib ≈ 0.43 mA |
| Q1 | Transistors / BJT_NPN / **2N2222** | NPN，β ≈ 200，Ic(max) 800 mA | TO-92，引脚 **E-B-C**（正面朝自己、引脚朝下，从左往右） |
| DLED | Diodes / LED / **LED_red** | Vf ≈ 2.0 V，If(max) ≈ 20 mA | **有极性**，阴极（短脚/平边）朝 Q1 集电极方向 |
| RC | Basic / RESISTOR | **1k** | 集电极限流，决定 Ic(sat) ≈ 2.8 mA |
| VCC | Sources / POWER_SOURCES / DC_POWER | **5 V** | 网络名 `VCC` |
| GND | Sources / POWER_SOURCES / GROUND | — | **必须放**，否则报 floating node |

---

## 3a. 网格坐标表（Multisim 默认栅格 0.1 inch = 1 格，相对坐标）

> 主信号链 `VIN → RB → Q1` 全部排在 **y = 3 同一行**；集电极回路在 **x = 9 这一列向上**；
> 地回路在下方。照这张表摆，飞线只剩 3 条短直线 + 1 条竖线。

| 标号 | 列 x | 行 y | 旋转 | 摆放说明 |
|------|------|------|------|---------|
| VIN | 0 | 3 | 0° | 最左，脉冲信号源 |
| RB | 4 | 3 | 0° | 与 VIN 同行（主信号链） |
| Q1 | 9 | 3 | 0° | TO-92，E 下 / B 中 / C 上 |
| DLED | 9 | 2 | 90° | Q1 正上方，阴极朝上（朝 RC） |
| RC | 9 | 1 | 90° | 再往上一格 |
| VCC | 9 | 0 | 0° | 顶部电源符号，正对 RC 上端 |
| GND | 9 | 5 | 0° | 底部地符号（VIN 负端与 Q1 发射极共用） |

---

## 3b. ASCII 布局图（按 3a 坐标绘制：信号左到右，电源顶、地底，标旋转角度）

```
                    +5 V (VCC)
                        |
                        |   RC 1k        [旋转 90°, 竖放]
                        +---[\\\\\\]-----+
                        |                |
                        |            DLEDN (网络标签)
                        |                |
                        |           DLED LED_red   [旋转 90°, 竖放, 阴极朝下]
                        |            | |            (阴极 = 横杠一侧, 朝 Q1 的 C)
                        |                |
                        |              COL (网络标签)
                        |                |
   VIN                  |           C ---+
  [PULSE]----[ RB 10k ]-+-- BASE    |        Q1 2N2222
    |            [旋转 0°]     B ---|/         [旋转 0°, TO-92 正面朝自己]
    |                               |\         引脚左起 E - B - C
    |                                 | E
    |                                 |
   GND o------------------------------+-------------------- GND
                                                              |
   XFG1:  + --> IN          - --> GND                         |
   XSC1:  CH A + --> IN     CH B + --> COL    两路 - --> GND --+
```

**旋转角度备注**：水平放置的电阻/二极管为 `0°`；竖直放置的（RC、DLED）为 `90°`
（`Ctrl+R` 一次）。三极管默认 `0°`，引脚顺序 E-B-C，接错任意一个都不亮。

---

## 4. 导入后整理步骤（黑盒替换 / 摆位旋转 / 连线顺序 / 网络标签 / 美化）

1. **黑盒替换（关键）**
   - `.MODEL 2N2222 ...` 在 Multisim 里只会生成一个"空壳"三极管（模型名匹配不到库件时更惨，直接报错）。
     **删掉它**，从 `Transistors / BJT_NPN / 2N2222` 重新放一个，按第 5 节连线表接回。
   - 同理，`.MODEL LED_RED D(...)` 换成 `Diodes / LED / LED_red`。
2. **摆位旋转**：按第 3 节 ASCII 图摆。`Ctrl+R` 顺时针 90°，`Ctrl+Shift+R` 逆时针；
   三极管引脚不对时用 `Ctrl+左右方向键` 镜像（**镜像会左右翻转引脚，慎用**）。
3. **连线顺序**：① 主信号链 `VIN(+) → RB → Q1(B)`；② 集电极回路
   `VCC → RC → DLED(阳极) → DLED(阴极) → Q1(C)`；③ `Q1(E) → GND`；④ `VIN(-) → GND`。
4. **网络标签**：给 `VCC`、`IN`、`COL` 加网络名（`Place → Net` 或双击导线改名），
   省掉长飞线；`VCC` 建议直接用 `Sources / POWER_SOURCES / VCC` 符号。
5. **美化**：`Options → Sheet Properties → Wiring` 里把线宽调到 2；
   元件标号 `R1/R2/Q1/D1` 拖动到不重叠位置。
6. **重设分析**：`.OP` / `.TRAN` 导入后常被忽略 →
   `Simulate → Analyses and simulation → Transient Analysis`，
   Start time 0、End time **3 ms**、Maximum time step **1 us**，勾选 `V(IN)`、`V(COL)`。

---

## 5. 连线表（序号 | 从 | 到 | 网络标签 | 建议走线方向）

| # | 从 | 到 | 网络标签 | 建议走线方向 |
|---|-----|-----|---------|-------------|
| 1 | XFG1 `+`（或 VIN 正端） | RB 左端 | `IN` | 短直线（同行，(0,3)→(4,3)） |
| 2 | RB 右端 | Q1 基极 (B) | `BASE` | 短直线（同行，(4,3)→(8,3)） |
| 3 | VCC (+5 V) | RC 上端 | `VCC` | 短直线（同列，(9,0)→(9,1)） |
| 4 | RC 下端 | DLED 阴极（横杠侧） | `DLEDN` | 短直线（同列，(9,1)→(9,2)） |
| 5 | DLED 阳极（三角侧） | Q1 集电极 (C) | `COL` | 短直线（同列，(9,2)→(9,3)） |
| 6 | Q1 发射极 (E) | GND | — | 先竖后横（(9,3)→(9,5)） |
| 7 | VIN 负端 / XFG1 `-` | GND | — | 网络标签（免走线，与第 6 条共用同一个地符号） |
| 8 | XSC1 CH A `+` | `IN` | `IN` | 网络标签（免走线） |
| 9 | XSC1 CH B `+` | `COL` | `COL` | 网络标签（免走线） |
| 10 | XSC1 CH A `-`、CH B `-` | GND | — | 网络标签（免走线） |

> ⚠️ 第 4、5 条最容易接反：**DLED 阴极（横杠）朝 RC / VCC 方向，阳极朝 Q1 集电极**。
> 因为本电路是"高电平导通、电流从 VCC 灌向 Q1 的 C 再到地"。

---

## 6. 仪器设置（XFG1 / XSC1 端子与面板参数 + Grapher 游标读数法）

### XFG1 函数发生器（替代网表里的 VIN 脉冲源）

| 项 | 设置 |
|----|------|
| 波形 | **Square**（方波） |
| Frequency | **1 kHz** |
| Duty cycle | **50 %** |
| Amplitude | **2.5 Vp**（峰值，不是峰峰值） |
| Offset | **2.5 V** |
| 接线 | `+` → `IN`，`COM` → GND |

> **关键**：要得到 **0 V ~ 5 V** 的方波，是 `Amplitude 2.5 Vp + Offset 2.5 V`，
> 不是 `Amplitude 5 V + Offset 0`（那个是 −5 V ~ +5 V，负半周会让 Q1 基极反偏）。
> 若面板只有 Vpp，则 `Vpp = 5 V`、`Offset = 2.5 V`。

### XSC1 示波器

| 项 | 设置 |
|----|------|
| Timebase | **500 us/Div**（1 kHz → 周期 1 ms，看 2 个周期） |
| CH A | `IN`，**2 V/Div**，DC 耦合 |
| CH B | `COL`，**1 V/Div**，DC 耦合 |
| Trigger | CH A，上升沿，Level **2.5 V** |
| 接线 | CH A `+`→`IN`，CH B `+`→`COL`，两路 `−`→GND |

### Grapher 游标读数法

1. `Simulate → Analyses and simulation → Transient Analysis`，End time `3 ms`、
   Maximum time step `1 us`，Output 里加 `V(IN)`、`V(COL)`，以及 `I(Q1[IB])`、`I(Q1[IC])`。
2. Run 后自动弹出 **Grapher**。
3. 工具栏点 **Cursor**（或 `View → Show/Hide Cursors`），拖动 **Cursor 1 / Cursor 2**。
4. 读数：
   - **周期**：两游标卡在 `V(IN)` 相邻上升沿 → `dx = 1.000 ms`，`f = 1/dx`。
   - **Vce(sat)**：在 `V(IN)` 为高电平区间读 `V(COL)`，**约 0.2 V**。
   - **截止电平**：`V(IN)` 低电平区间读 `V(COL)`，**约 5 V**（回路断开，LED 上无压降）。
   - **Ib / Ic**：切到电流曲线，同样用游标读高电平区间的平台值。

---

## 7. 验证值 + 易错点

### 7.1 理论计算表

前提：`VCC = 5 V`，`LED_red` 的 `Vf ≈ 2.0 V`，2N2222 `Vbe ≈ 0.7 V`、`Vce(sat) ≈ 0.2 V`、`β ≈ 200`。

| # | 观测量 | 计算式 | 理论值 | 实测值 |
|---|--------|--------|--------|--------|
| 1 | 输入高电平时的基极电流 Ib | `(5 − 0.7) / 10k` | **0.43 mA** | 待填 |
| 2 | 集电极饱和电流 Ic(sat) | `(5 − 2.0 − 0.2) / 1k` | **2.8 mA** | 待填 |
| 3 | 强制 β（判断饱和） | `Ic / Ib = 2.8m / 0.43m` | **6.5**（≪ 200 → 深度饱和） | 待填 |
| 4 | Vce（饱和时） | 查 2N2222 输出特性 | **≈ 0.2 V** | 待填 |
| 5 | Vce（截止时） | 回路断开，C 点被上拉 | **≈ 5.0 V** | 待填 |
| 6 | LED 正向电流 If | `= Ic` | **2.8 mA**（< 20 mA 安全） | 待填 |
| 7 | LED 阳极对地电压（导通时） | `Vce(sat) + Vf` | **≈ 2.2 V** | 待填 |
| 8 | 输入方波周期 / 频率 | `PULSE(...  PW 0.5m  PER 1m)` | **1.0 ms / 1 kHz** | 待填 |
| 9 | LED 平均功耗 | `2.0 V × 2.8 mA × 50%` | **2.8 mW** | 待填 |
| 10 | RC 功耗 | `Ic² × RC = (2.8m)² × 1k` | **7.8 mW**（1/4 W 足够） | 待填 |

### 7.2 3 个典型接错方式及读数表现

| # | 接错方式 | 读数 / 现象表现 |
|---|---------|----------------|
| 1 | **RB 接到集电极、RC 串在基极回路**（RB 与 RC 位置对调） | Q1 基极电流被 1k 限到 ≈ 4.3 mA、而集电极回路被 10k 限流：LED **极暗或不亮**；测 `V(COL)` 高电平时只有 ~2.5 V 而非 0.2 V（Q1 仍饱和但 Ic 只有 0.28 mA），RB 电阻会明显发烫（若按 1/4 W 选则有焦味风险）。 |
| 2 | **LED 反接**（阴极朝 Q1 集电极） | 输入高电平时 LED **始终不亮**；`V(COL)` 高电平 ≈ 5 V（二极管反偏，回路断开），低电平也 ≈ 5 V，示波器 CH B **一条直线无方波**；只有把 DLED 正过来才会出现 0.2 V / 5 V 的跳变。 |
| 3 | **忘记接地（VIN 负端或 Q1 发射极悬空）** | Multisim 直接报 **"singular matrix" / "floating node"** 或 `Transient analysis failed`；侥幸跑起来也是 `V(COL)` 恒为 0 或恒为 5 V 的直线，Ib、Ic 全为 0。**检查方法**：`Tools → Circuit → Show Node Numbers`，确认地网络编号是 0 且每个节点至少有 2 个引脚。 |

**补充易错点**：
- 把 `PULSE(0 5 ...)` 当成 0~5 V 是**对的**，但 XFG1 面板上要设成 `Amplitude 2.5 Vp + Offset 2.5 V`，
  直接设 `Amplitude 5 V` 会变成 −5~+5 V。
- 用 `LED_green` / `LED_blue` 替换 `LED_red` 时 `Vf` 会升到 2.2~3.3 V，Ic 会掉到 1.8 mA 以下，亮度明显变暗。
- 若把 RB 换成 100k，Ib 只有 43 µA，`Ib × β = 8.6 mA > 2.8 mA` 仍饱和；但换成 1M 就退出饱和，
  `V(COL)` 高电平会停在 0.6~1.5 V（放大区），LED 半亮——这是"看着像坏了但没坏"的典型情况。
