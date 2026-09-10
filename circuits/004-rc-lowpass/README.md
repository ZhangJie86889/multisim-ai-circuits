---
id: 004
name: 一阶 RC 低通滤波器
difficulty: 入门
status: 待验证
desc: 无源一阶 RC 低通，截止频率约 1.59 kHz，滚降约 -20 dB/十倍频
signalflow: VIN,R1,C1
---

<!-- SIGNALFLOW: VIN,R1,C1 -->

# 004 · 一阶 RC 低通滤波器

> 🟡 **待验证** —— 本页由 AI 生成，网表已通过 `cir_lint.py`，但尚未有人在真实 Multisim 14.3 里跑通。
> 理论值与实测值对照见 [`verification.md`](./verification.md)。

## 1. 完整 .cir 网表代码

文件名：`004-rc-lowpass.cir`　编码：**ANSI（7-bit ASCII）**

```spice
* 004-RC-LOWPASS: FIRST-ORDER RC LOW-PASS FILTER, FC ABOUT 1.59 KHZ, ANSI, MULTISIM 14.3
* FILE: 004-rc-lowpass.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> R1 -> C1
VIN IN 0 AC 1 SIN(0 1 1000)
R1 IN OUT 1k
C1 OUT 0 100n
.OP
.AC DEC 10 10 100k
.TRAN 1u 5m 0 1u
.END
```

传递函数为 $H(j\omega)=1/(1+j\omega R_1C_1)$，输出从 `OUT` 对地测量。

## 2. 元件清单表

| 网表标号 | Multisim 库路径 | 参数 | 备注 |
|---|---|---|---|
| VIN | Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE | 1 V 峰值，1 kHz 正弦，`AC 1` | `AC` 幅值用于 AC 分析 |
| R1 | Basic / RESISTOR | 1k | 串联输入电阻 |
| C1 | Basic / CAPACITOR | 100n | 输出节点到地 |
| GND | Sources / POWER_SOURCES / GROUND | — | 必须放置 |

## 3a. 网格坐标表

| 标号 | 列 x | 行 y | 旋转 | 摆放说明 |
|---|---:|---:|---|---|
| VIN | 0 | 3 | 0° | 最左，交流信号源 |
| R1 | 4 | 3 | 0° | 与 VIN 同行，串联 |
| C1 | 9 | 3 | 90° | OUT 节点向下接地 |
| GND | 9 | 5 | 0° | C1 下端接地 |

## 3b. ASCII 布局图

```text
                         C1 100n
                           |
VIN / XFG1 + o--- R1 1k ---+--- OUT / XSC1 CH B +
       (0°)                |
                         GND

XFG1 - / XSC1 CH A - ---------------- GND
```

`R1` 横放，`C1` 竖放 90°；输入和输出都相对于同一个 GND 测量。

## 4. 导入后整理步骤

1. 从 `Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE` 放置 VIN，设置 Sine、1 kHz、Amplitude 1 Vpk、Offset 0 V。
2. 放置 R1 与 C1，按 3a 坐标摆位；C1 竖放，接在 `OUT` 与 GND 之间。
3. 连接 `VIN(+) → R1 → OUT`，再连接 `OUT → C1 → GND`；VIN 负端接 GND。
4. 放置网络标签 `IN`、`OUT`，并把示波器两路负端接 GND。
5. 在 `Simulate → Analyses and simulation` 中重设 AC（10 Hz–100 kHz、每十倍频 10 点）和 Transient（0–5 ms、最大步长 1 us）。

## 5. 连线表

| # | 从 | 到 | 网络标签 | 建议走线方向 |
|---:|---|---|---|---|
| 1 | XFG1 `+` / VIN 正端 | R1 左端 | `IN` | 短直线 |
| 2 | R1 右端 | C1 上端 | `OUT` | 短直线 |
| 3 | C1 下端 | GND | — | 先竖后横 |
| 4 | XFG1 `-` | GND | — | 网络标签（免走线） |
| 5 | XSC1 CH A `+` | `IN` | `IN` | 网络标签（免走线） |
| 6 | XSC1 CH B `+` | `OUT` | `OUT` | 网络标签（免走线） |
| 7 | XSC1 CH A/B `-` | GND | — | 网络标签（免走线） |

## 6. 仪器设置

| 仪器 | 端子接法 | 面板参数 |
|---|---|---|
| XFG1 | `+ → IN`，`- / COM → GND` | Sine，1 kHz，1 Vpk，0 V offset |
| XSC1 CH A | `+ → IN`，`- → GND` | 500 mV/Div，DC 耦合 |
| XSC1 CH B | `+ → OUT`，`- → GND` | 500 mV/Div，DC 耦合 |

Grapher 中选择 `V(IN)` 与 `V(OUT)`。低频时两者幅值接近；在截止频率处输出约为输入的 0.707 倍，且输出相位落后约 45°。

## 7. 验证值 + 易错点

### 7.1 理论计算表

| # | 观测量 | 计算式 | 理论值 | 实测值 |
|---:|---|---|---|---|
| 1 | 时间常数 τ | `R1 × C1` | 100 µs | |
| 2 | 截止频率 fc | `1 / (2πR1C1)` | 1.59 kHz | |
| 3 | fc 处幅值比 | `|H(fc)| = 1 / √2` | 0.707（-3.01 dB） | |
| 4 | fc 处相位 | `-atan(1)` | -45° | |
| 5 | 10 kHz 幅值比 | `1 / √(1 + (10k/1.59k)^2)` | 0.157（-16.1 dB） | |
| 6 | 高频滚降 | 每十倍频 | -20 dB/dec | |

### 7.2 三个典型接错方式

| 接错方式 | 读数表现 |
|---|---|
| C1 下端未接 GND | 输出节点悬空或仿真报 floating node，频响不可信 |
| C1 并到 VIN 而不是 OUT | 截止频率可能仍接近 1.59 kHz，但输出取样关系错误，波形明显衰减 |
| R1 与 C1 数值单位写错 | fc 按比例偏移；例如 C1 误用 100u 时 fc 约 0.016 Hz |

## 8. 位置 / 连线自查

1. 运行 `python scripts/cir_lint.py circuits/004-rc-lowpass/004-rc-lowpass.cir`，确认没有行序或悬空节点警告。
2. 确认 R1 串联在输入与 OUT 之间，C1 从 OUT 单独接地。
3. AC 分析必须保留 VIN 行中的 `AC 1`，否则 AC 曲线没有有效激励。
