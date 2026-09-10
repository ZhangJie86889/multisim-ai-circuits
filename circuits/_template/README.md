---
id: NNN
name: 电路中文名
difficulty: 入门
status: 待验证
desc: 一句话说明（20~40 字，写清拓扑 + 关键指标）
signalflow: VIN,RIN,Q1,RC,VCC
---

<!-- SIGNALFLOW: VIN,RIN,Q1,RC,VCC -->
<!-- 上面这行给 scripts/cir_lint.py 用：必须与 .cir 里元件行的出现顺序完全一致 -->
<!-- 库路径查 docs/multisim-library-map.md -->

# NNN · 电路中文名

> 🟡 **待验证** —— 本页内容由 AI 生成，尚未经人工 Multisim 仿真。
> 实测值见 [`verification.md`](./verification.md)。

> 📐 **本模板已对齐 v2 格式**：共 **8 部分**（第 3 节拆成 **3a 网格坐标表 + 3b ASCII 图**，
> 第 5 节连线表多一列「建议走线方向」）。
> 生成提示词时请用 [`prompts/circuit-generation-template-v2.md`](../../prompts/circuit-generation-template-v2.md)。

---

## ⚠️ 新增一个电路，一共要动 3 处（别漏第 3 处）

| # | 位置 | 怎么做 |
|---|------|--------|
| 1 | `circuits/NNN-xxx/` 本目录 4 个文件 | `.cir` / `README.md` / `prompt-used.md` / `verification.md` |
| 2 | 根 `README.md` 的电路索引表 | 跑 `python scripts/build_index.py --write` **自动生成，不要手改** |
| 3 | **`web/src/data/circuits.ts`** | **必须**加一条同 id 的电路对象（含 `grid` 字段） |

> ❗ 第 3 处最容易漏。`web/` 里内嵌了一份 `.cir` 副本供网页展示与在线检查，
> 漏了它 `python scripts/check_web_data.py` 会报 `circuits.ts 里缺少 CIR_00N 块`，**CI 直接变红**。

**提交前跑这三条（CI 同款）：**

```bash
python scripts/cir_lint.py circuits/ --strict   # 0 error / 0 warn 才过
python scripts/build_index.py --write           # 刷新根 README 索引表
python scripts/check_web_data.py -v             # 校验 web 数据与 circuits/ 同步
```

---

## front-matter 规范（提交前必读）

每个 `circuits/*/README.md` 顶部必须有下面这段 YAML，`scripts/build_index.py` 靠它生成索引表。

| 字段 | 取值 | 说明 |
|------|------|------|
| `id` | `001` / `002` … | 三位数字，与目录名前缀一致 |
| `name` | 中文短名 | 进索引表的"电路名"列 |
| `difficulty` | `入门` / `进阶` / `挑战` | 三选一，**不要自造**（网页的类型定义只认这三个） |
| `status` | `待验证` / `已验证` / `验证失败` | 对应 🟡 / 🟢 / 🔴，同样不要自造 |
| `desc` | 一句话 | 进索引表的"说明"列，写清拓扑 + 关键指标 |
| `signalflow` | `VIN,RIN,Q1,RC,VCC` | 元件标号顺序，逗号分隔，**无空格** |

**规则**：
1. `status` 只有在 `verification.md` 的"实测值"列被真实 Grapher 读数填满后才允许改成 `已验证`。
2. `signalflow` 必须与 `<!-- SIGNALFLOW: ... -->` 标记一致，且等于 `.cir` 中元件行的出现顺序
   （`cir_lint.py` 会比对，不一致会报 `W-ORDER1`）。
3. 改完 `README.md` 后跑 `python scripts/build_index.py --write` 刷新根 README 的索引表。
4. `difficulty` / `status` 的取值同时被网页端 `web/src/data/circuits.ts` 的类型约束，
   写错会导致 `npm run build` 失败。

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

## 3a. 网格坐标表（Multisim 默认栅格 0.1 inch = 1 格，相对坐标）

> 列 x 向右递增、行 y 向下递增；**主信号链上的元件必须同 y**（排成一行），
> 电源在 y 更小的上方、地回路在 y 更大的下方。旋转角只能取 0 / 90 / 180 / 270。

| 标号 | 列 x | 行 y | 旋转 | 摆放说明 |
|------|------|------|------|---------|
| VIN | 0 | 3 | 0° | 最左，交流信号源 |
| RIN | 4 | 3 | 0° | 与 VIN 同行（主信号链） |
| Q1 | 9 | 3 | 0° | TO-92，E 下 / B 中 / C 上 |
| RC | 9 | 1 | 90° | Q1 正上方，集电极电阻 |
| VCC | 9 | 0 | 0° | 顶部电源符号，正对 RC 上端 |
| GND | 9 | 5 | 0° | 底部地符号 |

## 3b. ASCII 布局图（按 3a 坐标绘制：信号左到右，电源顶、地底，标旋转角度）

```
        +12 V (VCC)
            |
            |  RC 4.7k        (旋转 90°, 竖放, 在第 9 列)
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
2. **按 3a 坐标摆位**：照网格坐标表逐个放，`Ctrl+R` / `Ctrl+Shift+R` 旋转，
   `Ctrl+左右方向键` 镜像（**会翻转引脚，慎用**）。
3. **连线顺序**：先连主信号链（IN → RIN → Q1 → RC），再连电源，最后接地。
4. **网络标签**：`VCC` / `OUT` / `IN` 用 `Place → Net` 加网络名，
   间距超过 2 格的连线一律改用网络标签，避免长飞线。
5. **美化**：`Options → Sheet Properties → Wiring` 里把线宽调到 2；元件标号拖到不重叠位置。
6. **重设分析**：`.OP/.AC/.TRAN` 导入后常被忽略，`Simulate → Analyses and simulation` 里重设一遍。

## 5. 连线表（序号 | 从 | 到 | 网络标签 | 建议走线方向）

> 「建议走线方向」只能填这四种：**短直线 / 先横后竖 / 先竖后横 / 网络标签（免走线）**。
> 出现斜线、或需要跨越其它元件的长线即为不合格 —— 必须改用网络标签。

| # | 从 | 到 | 网络标签 | 建议走线方向 |
|---|-----|-----|---------|-------------|
| 1 | XFG1 `+` / VIN `+` | RIN 左端 | `IN` | 短直线（同行，(0,3)→(4,3)） |
| 2 | RIN 右端 | Q1 基极 (B) | `BASE` | 短直线（同行，(4,3)→(8,3)） |
| 3 | VCC (+) | RC 上端 | `VCC` | 短直线（同列，(9,0)→(9,1)） |
| 4 | RC 下端 | Q1 集电极 (C) | `COL` | 短直线（同列，(9,1)→(9,2)） |
| 5 | Q1 发射极 (E) | GND | — | 先竖后横（(9,3)→(9,5)） |
| 6 | XFG1 `-` / XSC1 地 | GND | — | 网络标签（免走线，与第 5 条共用同一个地符号） |
| 7 | Q1 集电极 (C) | XSC1 CH B `+` | `COL` | 网络标签（免走线） |
| 8 | XFG1 `+` | XSC1 CH A `+` | `IN` | 网络标签（免走线） |

## 6. 仪器设置（XFG1 / XSC1 + Grapher 游标读数法）

| 仪器 | 端子接法 | 面板参数 |
|------|---------|---------|
| XFG1 函数发生器 | `+` → IN，`-` → GND，`COM` → GND | Sine，Freq 1 kHz，Amplitude 10 mVpk，Offset 0 V |
| XSC1 示波器 | CH A `+` → IN，CH B `+` → OUT，两路 `-` → GND | Timebase 200 us/Div；CH A 5 mV/Div、CH B 200 mV/Div；均 DC 耦合；Trigger CH A、上升沿、0 V |

> ⚠️ XFG1 的 `Amplitude` 是**峰值**，且叠加在 `Offset` 上。要 0~5 V 方波应设
> `Amplitude 2.5 Vp + Offset 2.5 V`，不是 `5 V + 0`。

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

### 位置 / 连线错乱的自查（v2 新增）

导入后若图很乱，按这个顺序查：

1. 跑 `python scripts/cir_lint.py <你的.cir>`，看有没有 `W-ORDER1`（行序与 signalflow 不一致）
   或 `I-SPAN1`（某网络横跨太远）。
2. 有没有按 **3a 网格坐标表**摆位？没摆的话元件是 Multisim 随机放的，必然乱。
3. 有没有把长连接改成**网络标签**？相距 >2 格的连接靠飞线一定会交叉。
