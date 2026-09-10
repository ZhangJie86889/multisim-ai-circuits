---
id: NNN
name: 电路中文名
difficulty: 入门|进阶|困难
status: 待验证|已验证|验证失败
desc: 一句话说明（20~40 字，写清拓扑 + 关键指标）
signalflow: VIN,RIN,Q1,RC,VCC
---

<!-- SIGNALFLOW: VIN,RIN,Q1,RC,VCC -->
<!-- 上面这行给 scripts/cir_lint.py 用：必须与 .cir 里元件行的出现顺序完全一致 -->
<!-- 库路径查 docs/multisim-library-map.md -->

# NNN · 电路中文名

> 🟡 **待验证** —— 本页内容由 AI 生成，尚未经人工 Multisim 仿真。
> 实测值见 [`verification.md`](./verification.md)。

## front-matter 规范（提交前必读）

每个 `circuits/*/README.md` 顶部必须有下面这段 YAML，`scripts/build_index.py` 靠它生成索引表。

| 字段 | 取值 | 说明 |
|------|------|------|
| `id` | `001` / `002` … | 三位数字，与目录名前缀一致 |
| `name` | 中文短名 | 进索引表的"电路名"列 |
| `difficulty` | `入门` / `进阶` / `困难` | 三选一，不要自造 |
| `status` | `待验证` / `已验证` / `验证失败` | 对应 🟡 / 🟢 / 🔴 |
| `desc` | 一句话 | 进索引表的"说明"列，写清拓扑 + 关键指标 |
| `signalflow` | `VIN,RIN,Q1,RC,VCC` | 元件标号顺序，逗号分隔，无空格 |

**规则**：
1. `status` 只有在 `verification.md` 的"实测值"列被真实 Grapher 读数填满后才允许改成 `已验证`。
2. `signalflow` 必须与 `<!-- SIGNALFLOW: ... -->` 标记一致，且等于 `.cir` 中元件行的出现顺序
   （`cir_lint.py` 会比对，不一致只报 warn，但会被 CODEOWNER 打回）。
3. 改完 `README.md` 后跑 `python scripts/build_index.py --write` 刷新根 README 的索引表。

---

## 1. 完整 .cir 网表代码

文件名：`<dir-name>.cir`　编码：**ANSI（7-bit ASCII，注释全英文）**

```spice
* TEMPLATE: REPLACE THIS LINE WITH CIRCUIT NAME IN ENGLISH, ANSI, MULTISIM 14.3
* FILE: <dir-name>.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> RIN -> Q1 -> RC -> VCC
VIN IN 0 AC 10m SIN(0 10m 1k)
RIN IN MID 1k
Q1 OUT MID 0 2N2222
RC VCC OUT 4.7k
VCC VCC 0 12
.MODEL 2N2222 NPN(IS=1E-14 BF=200 VAF=100 IKF=0.3 BR=3 RB=10 RC=0.3 RE=0.2
+ TF=400E-12 TR=100E-9 CJE=25E-12 CJC=8E-12)
.OP
.AC DEC 10 10 1MEG
.TRAN 10u 5m 0 1u
.END
```

## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数）

| 网表标号 | Multisim 库路径（Group / Family / Component） | 参数 | 备注 |
|---------|---------------------------------------------|------|------|
| VIN | Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE | 10 mV 峰值，1 kHz，正弦 | 或用 CLOCK_VOLTAGE / PULSE_VOLTAGE |
| RIN | Basic / RESISTOR | 1k | — |
| Q1 | Transistors / BJT_NPN / 2N2222 | NPN，β ≈ 200 | 导入后黑盒替换 |
| RC | Basic / RESISTOR | 4.7k | — |
| VCC | Sources / POWER_SOURCES / DC_POWER | 12 V | — |
| GND | Sources / POWER_SOURCES / GROUND | — | **必须放，否则 floating node** |

## 3. ASCII 布局图（信号左到右，电源顶、地底，标旋转角度）

```
        +12 V (VCC)
            |
            |  RC 4.7k        (旋转 90°, 竖放)
            +----[\\\\]----+---- OUT (XSC1 CH B)
            |              |
   IN o-----[ RIN 1k ]-----|  Q1 2N2222 (TO-92 正面朝自己, 旋转 0°)
   (XFG1 +)                |   B
                           +---|\
                               | \---- C
                               | /
                           +---|/
                           |   E
                           |
        GND o--------------+---------------------- (XFG1 - / XSC1 地)
```

## 4. 导入后整理步骤

1. **黑盒替换**：`.MODEL 2N2222 ...` 在 Multisim 里只是一个空壳名。
   删掉导入得到的占位三极管，从 `Transistors / BJT_NPN / 2N2222` 重新放一个，按第 5 节连线表接回。
2. **摆位旋转**：按第 3 节 ASCII 图摆。`Ctrl+R` / `Ctrl+Shift+R` 旋转，`Ctrl+左右方向键` 镜像。
3. **连线顺序**：先连主信号链（IN → RIN → Q1 → OUT），再连电源（VCC → RC），最后接地。
4. **网络标签**：`VCC`、`OUT`、`IN` 用 `Place → Net` 或 `Ctrl+J` 加网络名，避免长飞线。
5. **美化**：`Tools → Options → Global preferences` 里关掉网格吸附微调；选中元件 `Ctrl+D` 复制属性。
6. **重设分析**：`.OP/.AC/.TRAN` 导入后常被忽略，`Simulate → Analyses and simulation` 里重设一遍。

## 5. 连线表（序号 | 从 | 到 | 是否用网络标签）

| # | 从 | 到 | 网络标签 |
|---|-----|-----|---------|
| 1 | XFG1 `+` / VIN `+` | RIN 左端 | IN |
| 2 | RIN 右端 | Q1 基极 (B) | — |
| 3 | VCC(+) | RC 上端 | VCC |
| 4 | RC 下端 | Q1 集电极 (C) | OUT |
| 5 | Q1 发射极 (E) | GND | — |
| 6 | XFG1 `-` / XSC1 地 | GND | — |
| 7 | Q1 集电极 (C) | XSC1 CH B `+` | OUT |
| 8 | XFG1 `+` | XSC1 CH A `+` | IN |

## 6. 仪器设置（XFG1 / XSC1 + Grapher 游标读数法）

| 仪器 | 端子接法 | 面板参数 |
|------|---------|---------|
| XFG1 函数发生器 | `+` → IN，`-` → GND，`COM` → GND | Sine，Freq 1 kHz，Amplitude 10 mVpk，Offset 0 V |
| XSC1 示波器 | CH A `+` → IN，CH B `+` → OUT，两路 `-` → GND | Timebase 200 us/Div；CH A 5 mV/Div、CH B 200 mV/Div；均 DC 耦合；Trigger CH A、上升沿、0 V |

**Grapher 游标读数法**：
`Simulate → Analyses and simulation → Transient Analysis` 跑完后自动弹 Grapher →
点工具栏 `Cursor`（或 `View → Show/Hide Cursors`）→ 拖 Cursor 1 / Cursor 2 到相邻两个波峰 →
读 `dx` 得周期、`dy` 得幅值；`dy/dx` 可算变化率。增益用 `dy(CH B) / dy(CH A)`。

## 7. 验证值 + 易错点

### 理论计算表（待人工仿真回填实测值）

| 量 | 理论值 | 实测值 | 备注 |
|----|--------|--------|------|
| （自行填写） | | | |

### 3 个典型接错方式及读数表现

| # | 接错方式 | 示波器/万用表读数表现 |
|---|---------|---------------------|
| 1 | | |
| 2 | | |
| 3 | | |
