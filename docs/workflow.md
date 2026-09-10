# 完整贡献流程（图文）

> 这一篇是 [根 README 的流程图](../../README.md#二工作流程图) 的展开版。
> 看完你应该能独立完成"从想要一个电路 → 到它被合并进索引表"的全过程。

---

## 0. 全流程总览

```
   ┌──────────────────────────────────────────────────────────────┐
   │                        AI 负责的部分                          │
   └──────────────────────────────────────────────────────────────┘

   ① 提 Issue          ② 填模板            ③ 丢给 AI
   ┌──────────┐       ┌──────────┐        ┌──────────────┐
   │circuit-  │       │复制 prompt│        │ 7 部分输出： │
   │request   │──────▶│模板，替换 │───────▶│ 1 网表       │
   │表单 9 项 │       │12 个占位符│        │ 2 元件表     │
   └──────────┘       └──────────┘        │ 3 布局图     │
                                          │ 4 整理步骤   │
                                          │ 5 连线表     │
                                          │ 6 仪器设置   │
                                          │ 7 验证值     │
                                          └──────┬───────┘
   ┌──────────────────────────────────────────────────────────────┐
   │                       人 负责的部分                           │
   └──────────────────────────────────────────────────────────────┘
                                                 │
   ④ Multisim 导入 ◀─────────────────────────────┘
   ┌────────────────────────────────────────────┐
   │ File → Open → 文件类型 SPICE netlist(*.cir) │
   │  ├ 黑盒替换：.MODEL 空壳 → 库里的真实型号   │
   │  ├ 按第 3 节 ASCII 图摆位（Ctrl+R 旋转）    │
   │  ├ 按第 5 节连线表逐条接（GND 别漏）        │
   │  └ 重设分析：Simulate → Analyses and ...    │
   └────────────────────┬───────────────────────┘
                        │
   ⑤ 仿真 + Grapher 读数 │
   ┌────────────────────▼───────────────────────┐
   │ Cursor → dx(周期) / dy(幅值) / 电流平台值   │
   │ 填进 verification.md 的「实测值」列         │
   └────────────────────┬───────────────────────┘
                        │
   ⑥ 提 PR ─────────────┘
   ┌────────────────────────────────────────────┐
   │ 4 个文件齐全 + 本地 --strict 通过           │
   └────────────────────┬───────────────────────┘
                        │
   ⑦ CI: cir_lint --strict + build_index --check │
                        │
   ⑧ 合并 → 索引表自动更新 🟢
```

---

## ① 提 Issue：把需求说清楚

用 [`.github/ISSUE_TEMPLATE/circuit-request.md`](../../.github/ISSUE_TEMPLATE/circuit-request.md)。
**9 个字段一一对应生成模板的 12 个占位符**：

| Issue 字段 | 对应占位符 |
|-----------|-----------|
| 1 电路名称 | `{{电路名称}}` |
| 2 验证仪器 | `{{验证仪器}}` |
| 3 验证目标 | `{{验证目标}}` |
| 4 电源 | `{{电源规格}}` |
| 5 输入信号 | `{{输入信号}}` |
| 6 性能指标 | `{{性能指标}}` |
| 7 负载 | `{{负载}}` |
| 8 关键元件 | `{{有源器件及型号}}` + `{{元器件清单}}` |
| 9 其他要求 | `{{关键设计计算}}` + `{{信号流向}}` |

> 💡 **质量分水岭在第 6 和第 8 项**。写"放大倍数大一点"和写
> "|Av| ≥ 20（1 kHz、RL = 10k）"，AI 给出的东西完全是两回事。

**也可以不提 Issue**，直接开工。Issue 的价值在于让别人看到你在做、避免重复劳动。

---

## ② 填模板：12 个占位符

```bash
# 打开模板，整段复制
prompts/circuit-generation-template.md

# 不知道怎么填，查这个（每个占位符都有正例/反例）
prompts/README.md
```

**强烈建议额外追加三条补充要求**（模板文件末尾已备好，复制即可）：

```text
A. .cir 文件内所有注释使用英文（Multisim 导入器对非 ASCII 字符敏感）
B. 每行长度不超过 132 字符，超长用 + 续行
C. 第 7 部分的理论值必须能用网表元件值手算复现，并给出 3 个"读数偏了最可能接错哪"
```

---

## ③ 丢给 AI：拿 7 部分

| 部分 | 你会拿到什么 | 落到哪个文件 |
|------|-------------|-------------|
| 1 完整 .cir | 网表代码 | `NNN-xxx.cir` |
| 2 元件清单表 | 标号 / 库路径 / 参数 | README 第 2 节 |
| 3 ASCII 布局图 | 摆位与旋转角度 | README 第 3 节 |
| 4 导入后整理步骤 | 黑盒替换等 | README 第 4 节 |
| 5 连线表 | 逐条连接关系 | README 第 5 节 |
| 6 仪器设置 | XFG1/XSC1 + Grapher 读数法 | README 第 6 节 |
| 7 验证值 + 易错点 | 理论表 + 3 个接错方式 | README 第 7 节 + `verification.md` |

```bash
# 建目录（复制模板目录即可，4 个文件骨架都在）
cp -r circuits/_template/ circuits/004-my-circuit/
cd circuits/004-my-circuit/
mv TEMPLATE.cir 004-my-circuit.cir
```

**先别急着信 AI**。拿到输出后做三件事：

1. **手算复核第 7 节**：用网表里的元件值把 Ib/Ic/Vce/增益/频率重算一遍，看对不对。
   AI 在算术上翻车的概率不低，这是最容易抓到的错误。
2. **查库路径**：第 2 节的 Group/Family/Component 对照
   [`multisim-library-map.md`](./multisim-library-map.md) 核一遍。
3. **看第 1 节行序**：元件行是不是按信号流排的、电源是不是在最后。

---

## ④ 导入 Multisim：四个必做动作

```
File → Open → 文件类型选 "SPICE netlist (*.cir)" → 选中你的 .cir
```

### 动作 1：黑盒替换（最容易忘）

`.MODEL 2N2222 NPN(...)` 这类行在 Multisim 里只会生成一个**空壳**，
模型名匹配不到库件时甚至会报错。**必须**删掉后从主数据库重新放：

| 网表里的 | 换成 |
|---------|------|
| `.MODEL 2N2222 ...` 生成的三极管 | `Transistors / BJT_NPN / 2N2222` |
| `.MODEL LED_RED D(...)` | `Diodes / LED / LED_red` |
| `XU1 ... NE555`（黑盒） | `Mixed / TIMER / LM555CN` |

路径速查 → [`multisim-library-map.md`](./multisim-library-map.md)。

### 动作 2：摆位旋转

Multisim 按**元件行出现顺序**从左到右摆放。如果你在生成时约束了行序（约束 6），
导入后主链路大致是沿着信号流排的，只需旋转 + 微调。

- `Ctrl+R` 顺时针 90°，`Ctrl+Shift+R` 逆时针
- `Ctrl+左右方向键` 镜像（**会翻转引脚，慎用**）
- 三极管默认引脚：**TO-92 正面朝自己、引脚朝下，左起 E-B-C**

### 动作 3：按连线表逐条接

照 README 第 5 节。`GND` 是最容易漏的——漏了就报 floating node。

### 动作 4：重设分析

`.OP / .AC / .TRAN` 导入后**经常被忽略**：

```
Simulate → Analyses and simulation
  ├ DC Operating Point  → Output 加 V(COL)、I(Q1[IC])
  ├ Transient Analysis  → End time / Maximum time step 按 README 第 6 节填
  └ AC Analysis         → Decade / 起止频率 / Output 加 V(OUT)
```

---

## ⑤ 仿真 + Grapher 游标读数

### 游标怎么用

1. 跑完分析自动弹 **Grapher**。
2. 工具栏点 **Cursor**（或 `View → Show/Hide Cursors`）。
3. 拖 **Cursor 1 / Cursor 2**，面板上直接显示 `dx`（横坐标差）和 `dy`（纵坐标差）。

| 要测的量 | 游标怎么卡 |
|---------|-----------|
| 周期 / 频率 | 卡在相邻两个同向过零（或波峰）→ `f = 1/dx` |
| 幅值（峰峰值） | 卡在同一周期的波峰与波谷 → `dy` |
| 增益 | `dy(输出曲线) / dy(输入曲线)` |
| 相位差 | 卡两曲线相邻同向过零点 → `φ = 360° × dx / T` |
| 直流工作点 | 读曲线平台值，或直接用 `DC Operating Point` 分析 |
| −3 dB 频率 | AC 曲线上找 `0.707 × 中频增益` 处的频率 |

### 常见坑

- **游标选错曲线**：Grapher 里要先点选曲线再拖游标，否则 dx/dy 是另一条曲线的。
- **瞬态没跑够周期**：至少要跑 3~5 个周期，否则起振/建立过程会污染读数。
- **Maximum time step 太大**：波形会呈锯齿状、读数偏小。一般取周期的 1/1000。

---

## ⑥ 提 PR

```bash
# 1) 本地自检（CI 就是这个标准）
python scripts/cir_lint.py circuits/ --strict
python scripts/build_index.py --write

# 2) AI 自检：把网表贴给下面这个提示词，逐条确认 PASS/FAIL
prompts/circuit-review-prompt.md

# 3) 提交
git checkout -b feat/004-my-circuit
git add circuits/004-my-circuit/ README.md
git commit -m "feat(circuit): 004-xxx —— 一句话说明"
git push origin feat/004-my-circuit
```

PR 描述模板：

```markdown
Closes #N

- 模型：DeepSeek-V3
- 验证状态：🟢 已验证 / 🟡 待验证
- 实测值（已验证时填）：f = 1.002 kHz（理论 1.000 kHz，误差 +0.2%）
- 截图：见 circuits/004-xxx/assets/
- 备注：
```

---

## ⑦⑧ CI 与合并

CI 会跑两件事（[`.github/workflows/lint.yml`](../../.github/workflows/lint.yml)）：

1. `python scripts/cir_lint.py circuits/ --strict` —— 网表硬约束
2. `python scripts/build_index.py --check` —— 索引表是否最新

**最常见的 CI 失败原因**：忘了跑 `build_index.py --write`。
改了任何 `circuits/*/README.md` 的 front-matter，索引就要重新生成。

合并后，你的电路会自动出现在根 README 的索引表里，状态标签按 front-matter 显示。

---

## 附：如果我没有 Multisim 怎么办

完全可以贡献，但请**如实标注**：

1. `status: 待验证` —— 不要改。
2. `verification.md` 第 1 节写明"本人无 Multisim 环境"。
3. 在 Issue/PR 里注明，方便有环境的人接力验证（我们会给这类 PR 打 `需要验证` 标签）。

**不允许**把理论值抄进"实测值"列 —— 这是本仓库唯一的零容忍行为。
