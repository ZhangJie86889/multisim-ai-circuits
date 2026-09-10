---
id: 002
name: 共射极放大器
difficulty: 入门
status: 待验证
desc: 2N2222 分压偏置共射放大，阻容耦合，增益 ≥ 20，下限频率约 10 Hz
signalflow: VIN,C1,R1,R2,Q1,RC,RE1,RE2,CE,C2,RL,VCC
---

<!-- SIGNALFLOW: VIN,C1,R1,R2,Q1,RC,RE1,RE2,CE,C2,RL,VCC -->

# 002 · 共射极放大器（2N2222 分压偏置，Av ≥ 20）

> 🟡 **待验证** —— 本页由 AI 依据 [`prompt-used.md`](./prompt-used.md) 生成，
> 网表已通过 `cir_lint.py`，但**尚未有人在真实 Multisim 14.3 里跑通**。
> 理论值与实测值对照见 [`verification.md`](./verification.md)。

---

## 1. 完整 .cir 网表代码

文件名：`002-common-emitter-amp.cir`　编码：**ANSI（7-bit ASCII）**

```spice
* 002-COMMON-EMITTER-AMP: 2N2222 VOLTAGE-DIVIDER BIAS CE AMPLIFIER, ANSI, MULTISIM 14.3
* FILE: 002-common-emitter-amp.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> C1 -> R1 -> R2 -> Q1 -> RC -> RE1 -> RE2 -> CE -> C2 -> RL -> VCC
* RE2 IS BYPASSED BY CE SO THE AC GAIN IS SET BY RC / (RE1 + re)
VIN IN 0 AC 10m SIN(0 10m 1k)
C1 IN BASE 10u
R1 VCC BASE 47k
R2 BASE 0 8.2k
Q1 COL BASE EMIT 2N2222
RC VCC COL 4.7k
RE1 EMIT EMIT2 100
RE2 EMIT2 0 900
CE EMIT2 0 100u
C2 COL OUT 10u
RL OUT 0 10k
VCC VCC 0 12
.MODEL 2N2222 NPN(IS=1E-14 BF=200 VAF=100 IKF=0.3 BR=3 RB=10 RC=0.3 RE=0.2
+ TF=400E-12 TR=100E-9 CJE=25E-12 CJC=8E-12)
.OP
.AC DEC 10 10 1MEG
.TRAN 10u 5m 0 1u
.END
```

**设计要点**：射极电阻拆成 `RE1 = 100 Ω`（保留，提供局部负反馈、稳定增益）+ `RE2 = 900 Ω`
（被 `CE = 100u` 旁路）。直流工作点由 `RE1+RE2 = 1 kΩ` 决定，交流增益由 `RE1` 决定——
这样既保证 Q 点稳定（1 mA 左右），又拿到 ≥ 20 的增益。

---

## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数）

| 网表标号 | Multisim 库路径（Group / Family / Component） | 参数 | 备注 |
|---------|---------------------------------------------|------|------|
| VIN | Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE | 10 mV 峰值，1 kHz 正弦（`AC 10m` 用于 AC 分析） | 也可直接用 XFG1 代替 |
| C1 | Basic / CAPACITOR | **10u** 电解，输入耦合 | 有极性（若用 ELECTROLYTIC），**+ 极朝 BASE** |
| R1 | Basic / RESISTOR | **47k**，上偏置 | VCC → BASE |
| R2 | Basic / RESISTOR | **8.2k**，下偏置 | BASE → GND |
| Q1 | Transistors / BJT_NPN / **2N2222** | NPN，β ≈ 200 | 引脚 E-B-C（正面朝自己、引脚朝下） |
| RC | Basic / RESISTOR | **4.7k**，集电极电阻 | VCC → COL |
| RE1 | Basic / RESISTOR | **100**，射极交流负反馈 | 决定增益，**不可旁路** |
| RE2 | Basic / RESISTOR | **900**，射极直流负反馈 | 与 RE1 串联，总 1k 定 Q 点 |
| CE | Basic / CAPACITOR | **100u** 电解，射极旁路 | **+ 极朝 EMIT2** |
| C2 | Basic / CAPACITOR | **10u** 电解，输出耦合 | **+ 极朝 COL** |
| RL | Basic / RESISTOR | **10k**，负载 | 接 OUT → GND |
| VCC | Sources / POWER_SOURCES / DC_POWER | **12 V** | 网络名 `VCC` |
| GND | Sources / POWER_SOURCES / GROUND | — | 必须放 |

---

## 3. ASCII 布局图（信号左到右，电源顶、地底，标旋转角度）

```
                             +12 V (VCC)
                                 |
                 +---------------+---------------+
                 |                               |
            R1 47k                            RC 4.7k        [两者均旋转 90°, 竖放]
                 |                               |
    C1           +---- BASE (网络标签)           +---- COL (网络标签)
 IN o----||------+---------- B                   |      |
       10u       |          |                    |      +---- C2 ----+----||----+---- OUT
                 |      Q1 2N2222  [旋转 0°]     |            10u    |           |
                 |      C ---\                   |                   |          RL 10k
                 |           \-------------------+                   |           |
                 |           /                                       |           |
                 |      E ---+                                       |           |
                 |           |                                       |          GND
                 |        EMIT (网络标签)                             |
                 |           |                                       |
                 |       RE1 100  [旋转 90°]                          |
                 |           |                                       |
                 |        EMIT2 (网络标签)                            |
                 |        |     |                                    |
                 |    RE2 900  CE 100u   [均旋转 90°]                 |
                 |        |     |                                    |
                R2 8.2k   |     |                                    |
                 |        |     |                                    |
   XFG1 + o------+--------+-----+------------------------------------+
   XFG1 - o--GND                                                      |
                R2 下端 -> GND                                        |
   GND o--------------------------------------------------------------+

   仪器：XFG1 + --> IN, - --> GND
        XSC1 CH A + --> IN, CH B + --> OUT, 两路 - --> GND
```

**旋转角度**：水平电阻/电容 `0°`；所有竖直放置的（R1、R2、RC、RE1、RE2、CE）`90°`；
电解电容竖放时**正极在上**（朝 VCC 或朝三极管侧）。

---

## 4. 导入后整理步骤

1. **黑盒替换**：删掉 `.MODEL 2N2222` 生成的空壳管，重新从
   `Transistors / BJT_NPN / 2N2222` 放置，按第 5 节连线表接回。
2. **摆位旋转**：按第 3 节图摆；`Ctrl+R` 旋转 90°；电解电容竖放时确认 `+` 极朝上。
3. **连线顺序**：
   ① 信号链 `VIN(+) → C1 → BASE`；`Q1(C) → COL → C2 → OUT → RL → GND`；
   ② 偏置 `VCC → R1 → BASE`、`BASE → R2 → GND`；
   ③ 集电极 `VCC → RC → COL`；
   ④ 射极 `Q1(E) → RE1 → EMIT2 → RE2 → GND`，并把 `CE` 并在 `RE2` 两端；
   ⑤ 最后统一接地。
4. **网络标签**：给 `VCC`、`BASE`、`COL`、`EMIT`、`EMIT2`、`OUT`、`IN` 加网络名，
   避免长飞线交叉。
5. **美化**：把 `RE1/RE2/CE` 排成一列，`R1/R2` 排成另一列，整体是"左输入—中三极管—右输出"。
6. **重设分析**（重要）：
   - **Transient**：`Simulate → Analyses and simulation → Transient Analysis`，
     End time **5 ms**、Maximum time step **1 us**，Output 加 `V(IN)`、`V(OUT)`。
   - **AC**：`AC Analysis`，Decade、10 points/dec、Start **10 Hz**、Stop **1 MHz**，
     Output 加 `V(OUT)`。
   - **DC Operating Point**：Output 加 `V(COL)`、`V(EMIT)`、`I(Q1[IC])`、`I(Q1[IB])`。

---

## 5. 连线表（序号 | 从 | 到 | 是否用网络标签）

| # | 从 | 到 | 网络标签 |
|---|-----|-----|---------|
| 1 | XFG1 `+`（或 VIN 正端） | C1 负极侧（输入侧） | `IN` |
| 2 | C1 正极侧 | Q1 基极 (B) | `BASE` |
| 3 | VCC (+12 V) | R1 上端 | `VCC` |
| 4 | R1 下端 | Q1 基极 (B) | `BASE` |
| 5 | Q1 基极 (B) | R2 上端 | `BASE` |
| 6 | R2 下端 | GND | — |
| 7 | VCC (+12 V) | RC 上端 | `VCC` |
| 8 | RC 下端 | Q1 集电极 (C) | `COL` |
| 9 | Q1 集电极 (C) | C2 正极侧 | `COL` |
| 10 | C2 负极侧 | RL 上端 | `OUT` |
| 11 | RL 下端 | GND | — |
| 12 | Q1 发射极 (E) | RE1 上端 | `EMIT` |
| 13 | RE1 下端 | RE2 上端 | `EMIT2` |
| 14 | CE 正极 | `EMIT2` | `EMIT2` |
| 15 | CE 负极 | GND | — |
| 16 | RE2 下端 | GND | — |
| 17 | VIN 负端 / XFG1 `-` | GND | — |
| 18 | XSC1 CH A `+` | `IN` | `IN` |
| 19 | XSC1 CH B `+` | `OUT` | `OUT` |
| 20 | XSC1 CH A `-`、CH B `-` | GND | — |

> ⚠️ 第 13~15 条是**最关键的**：`CE` 必须并在 **`RE2`（900 Ω）两端**，
> **不能**并在 `RE1 + RE2` 整体两端——那样增益会掉到 `4.7k/1k ≈ 4.7`，指标直接不达标。

---

## 6. 仪器设置（XFG1 / XSC1 端子与面板参数 + Grapher 游标读数法）

### XFG1 函数发生器

| 项 | 设置 |
|----|------|
| 波形 | **Sine** |
| Frequency | **1 kHz** |
| Amplitude | **10 mVp**（峰值） |
| Offset | **0 V** |
| 接线 | `+` → `IN`，`COM` → GND |

### XSC1 示波器（测增益与相位）

| 项 | 设置 |
|----|------|
| Timebase | **200 us/Div**（1 kHz 周期 1 ms，看 5 个周期） |
| CH A | `IN`，**5 mV/Div**，DC 耦合 |
| CH B | `OUT`，**100 mV/Div**，DC 耦合 |
| Trigger | CH A，上升沿，Level **0 V** |
| 现象 | CH B 与 CH A **反相 180°**（共射极的固有特性） |
| 接线 | CH A `+`→`IN`，CH B `+`→`OUT`，两路 `−`→GND |

### XMM1 万用表（测静态工作点）

选 **DC V**，`+` 接 `COL`、`−` 接 GND → 读 **Vc ≈ 6.94 V**；
再测 `EMIT` → 读 **Ve ≈ 1.08 V**。
（也可选 DC A 串进集电极读 `Ic ≈ 1.08 mA`。）

### Grapher 游标读数法

1. **瞬态增益**：`Transient Analysis` 后开 Grapher → `Cursor` →
   Cursor 1 卡在 `V(OUT)` 的波峰、Cursor 2 卡在同一周期的波谷 → `dy` = 峰峰值 `Vopp`；
   同样读 `V(IN)` 的 `dy` = `Vipp`。增益 `|Av| = Vopp / Vipp`。
2. **相位差**：读 `V(IN)` 与 `V(OUT)` 相邻同向过零点之间的 `dx`，
   `φ = −360° × dx / T`（负号表示反相，约 −180°）。
3. **频响**：`AC Analysis` 后在 Grapher 里切到 `Magnitude` 页 →
   用游标找增益下降 3 dB（即 `0.707 × 中频增益`）处的频率，即 `f_L` / `f_H`；
   `Phase` 页读相频。若要看 dB 轴：`Grapher → View → Show/Hide Cursors` 配合
   右侧 `dB` 刻度（或用 `Bode Plotter XBP1` 直接看）。

---

## 7. 验证值 + 易错点

### 7.1 理论计算表

前提：`VCC = 12 V`，`Vbe ≈ 0.7 V`，`β = 200`，`V_T = 26 mV`，`Vce(sat) ≈ 0.2 V`。

**① 静态工作点**

| # | 观测量 | 计算式 | 理论值 | 实测值 |
|---|--------|--------|--------|--------|
| 1 | 基极分压 Vb | `12 × 8.2k / (47k + 8.2k)` | **1.78 V** | 待填 |
| 2 | 射极电压 Ve | `Vb − 0.7` | **1.08 V** | 待填 |
| 3 | 射极电流 Ie | `Ve / (100 + 900)` | **1.08 mA** | 待填 |
| 4 | 集电极电流 Ic | `Ie × β/(β+1)` | **1.08 mA** | 待填 |
| 5 | 集电极电压 Vc | `12 − 1.08m × 4.7k` | **6.94 V** | 待填 |
| 6 | Vce | `Vc − Ve` | **5.86 V**（≈ VCC/2 附近偏上，动态范围好） | 待填 |
| 7 | 基极电流 Ib | `Ic / β` | **5.4 µA** | 待填 |
| 8 | 分压电流（稳定性校核） | `12 / 55.2k` | **217 µA ≈ 40 × Ib** ✅ 稳定 | 待填 |

**② 交流指标**

| # | 观测量 | 计算式 | 理论值 | 实测值 |
|---|--------|--------|--------|--------|
| 9 | 射极动态电阻 re | `26 mV / 1.08 mA` | **24 Ω** | 待填 |
| 10 | 空载增益 \|Av\| | `Rc / (RE1 + re) = 4.7k / 124` | **37.9**（31.6 dB） | 待填 |
| 11 | 带载增益 \|Av\|（RL = 10k） | `(4.7k ∥ 10k) / 124 = 3.20k / 124` | **25.8**（28.2 dB） | 待填 |
| 12 | 输入电阻 Rin | `R1 ∥ R2 ∥ [β(RE1+re)] = 47k ∥ 8.2k ∥ 24.8k` | **5.4 kΩ** | 待填 |
| 13 | 输出电阻 Rout | `≈ Rc` | **4.7 kΩ** | 待填 |
| 14 | 输出幅值（10 mVp 输入，带载） | `10 mV × 25.8` | **258 mVp**（516 mVpp） | 待填 |
| 15 | 下限频率 f_L（CE 主导） | `1 / [2π × (RE1 + re + Rth/β) × CE]`，`Rth = R1∥R2 = 6.98k` | **≈ 10 Hz** | 待填 |
| 16 | 下限频率 f_L（C1） | `1 / [2π × Rin × C1]` | **≈ 2.9 Hz** | 待填 |
| 17 | 下限频率 f_L（C2） | `1 / [2π × (Rc + RL) × C2]` | **≈ 1.1 Hz** | 待填 |
| 18 | 上限频率 f_H | 由 `Cjc` 密勒效应决定，`Cm ≈ Cjc(1+|Av|) ≈ 310 pF`，`1/(2π × 6.98k × Cm)` | **≈ 70 kHz**（模型相关，以 .AC 实测为准） | 待填 |
| 19 | 最大不失真输入（带载） | 正向受截止限制 `ΔV = 12 − 6.94 = 5.06 V`；`5.06 / 25.8` | **≈ 196 mVp** | 待填 |
| 20 | 相位关系 | 共射极固有 | **反相 180°** | 待填 |

### 7.2 3 个典型接错方式及读数表现

| # | 接错方式 | 读数 / 现象表现 |
|---|---------|----------------|
| 1 | **CE 并在 RE1+RE2 整体两端**（旁路了全部射极电阻） | 静态点几乎不变（Vc 仍 ≈ 6.9 V），但**增益暴跌到 ≈ 4.7**（`4.7k / 1k`），输出只有 ~47 mVp，指标 ≥ 20 不达标；同时波形会明显失真（输入超过 100 mVp 就削顶）。**排查**：看 `V(EMIT)` 上有没有 1 kHz 交流成分——正确接法下 EMIT 节点应有约 `10 mV × 100/124 ≈ 8 mV` 的交流，若 `V(EMIT)` 是纯直流 1.08 V 就说明 RE1 也被旁路了。 |
| 2 | **R1 与 R2 对调**（47k 接地、8.2k 接 VCC） | 分压点电压变成 `12 × 47k / 55.2k = 10.2 V` → `Ve ≈ 9.5 V`、`Ie ≈ 9.5 mA`、`Vc = 12 − 9.5m×4.7k = **−32 V**`（实际会到 **Vce(sat) ≈ 0.2 V**，三极管深度饱和）→ 示波器上 `V(OUT)` 是一条贴在底的直线、完全无放大；XMM1 测 `Vc ≈ 0.2 V`、`Ve ≈ 9.5 V`。**一眼识别法**：`Vc` 应该 ≈ VCC/2，测出来只有零点几伏就是偏置接错或三极管饱和。 |
| 3 | **忘记接 CE / CE 虚焊**（射极完全无旁路） | 增益变成 `4.7k / (1000 + 24) ≈ **4.6**`，输出 ~46 mVp，只有目标的 1/5.6；**但静态工作点完全正常**（Vc ≈ 6.94 V、Ve ≈ 1.08 V），所以很容易误判成"三极管坏了"。**排查**：只测直流点查不出来，必须加 1 kHz 交流信号看输出幅值；或用 XMM1 交流档测 `EMIT` 对地电压，正确时应有 ≈ 8 mV 交流，若无交流则 CE 未起作用。 |

**补充易错点**：
- 三极管引脚认错（把 E/B/C 当成 B/C/E）是最常见的实物错误，Multisim 里表现为
  `Vc ≈ 12 V`（管子当成了二极管在导通）或 `Ve ≈ 0 V`；用 `Simulate → Analyses → DC Operating Point`
  看 `V(BE)` 是否为 ~0.65 V、`V(BC)` 是否反偏（应为负值）即可确认。
- 输入信号给太大（比如 1 Vp）会削顶：本电路最大不失真输入约 196 mVp（带载）。
  看到输出波形顶部或底部变平，先降输入幅值，别急着改电路。
- `.AC` 分析需要 `VIN` 带 `AC 10m` 关键字，若导入后 AC 分析曲线是空的，
  在 Multisim 里检查信号源的 **AC Analysis Magnitude** 属性是否被清零。
