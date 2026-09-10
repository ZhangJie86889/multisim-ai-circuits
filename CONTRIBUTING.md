# 贡献指南

> 先说最重要的一句：**AI 负责生成网表与文档，Multisim 导入与仿真读数由你来人工验证。**
> 本仓库唯一的质量闸门就是"有人真的在 Multisim 里跑过"。没有实测值的电路永远挂着 🟡 待验证。

---

## 一、谁能贡献

- 有 Multisim 14.3（或其他版本）能实际打开仿真的人 —— **尤其缺你**。
- 模电 / 数电 / 电子线路的在读学生，把你做过的实验按本仓库格式整理进来，就是最好的贡献。
- 只会用 AI、跑不了 Multisim 也可以贡献：生成网表 + 文档，但**必须诚实标注 `status: 待验证`**，
  并在 `verification.md` 里写明"本人无 Multisim 环境，未验证"。

## 二、五步贡献流程

### Step 1 · 提案（可选但推荐）

去 [Issue 模板 → 求电路](.github/ISSUE_TEMPLATE/circuit-request.md) 开一个 Issue，
或直接在现有 `circuit-request` Issue 下评论认领。也可以跳过这步，直接提 PR。

### Step 2 · 建目录 + 生成（AI 部分）

**用脚手架脚本，一条命令建好目录**（推荐）：

```bash
python scripts/new_circuit.py 004 rc-lowpass "一阶 RC 低通滤波器" \
    --difficulty 入门 \
    --flow VIN,R1,C1 \
    --desc "无源 RC 低通，截止频率约 1 kHz，-20 dB/十倍频滚降" \
    --name-en "First-order RC low-pass filter"
```

它会复制 `circuits/_template/` → `circuits/004-rc-lowpass/`、把 `TEMPLATE.cir` 改名、
替换掉 front-matter 里的占位符，最后打印一份「还需要手填什么」的清单。

> 不想用脚本就手动来：`cp -r circuits/_template/ circuits/004-my-circuit/`，
> 再把 `TEMPLATE.cir` 改名成 `004-my-circuit.cir`（**文件名必须与目录名一致**）。

然后：

1. 复制 **v2** 模板 [`prompts/circuit-generation-template-v2.md`](./prompts/circuit-generation-template-v2.md)
   （v1 也还能用，但导入后整理更费劲；两版区别见 [README「v1 还是 v2？」](./README.md#v1-还是-v2)）。
2. 把 12 个 `{{占位符}}` 全填掉（规范见 [`prompts/README.md`](./prompts/README.md)）。
3. 丢给任意大模型，拿到**严格 8 部分**（v1 是 7 部分）的输出：
   第 1~7 节填进新目录的 `README.md`，第 1 部分的网表写进 `004-my-circuit.cir`。
4. 把填完的提示词**原样**存进 `prompt-used.md`——不留这个文件的 PR 会被打回。

> 📁 一个电路目录里必须是这 4 个文件（名字严格对应）：
> `<目录名>.cir` / `README.md` / `prompt-used.md` / `verification.md`。
> `README.md` 顶部要有 front-matter，字段规范见
> [`circuits/_template/README.md`](./circuits/_template/README.md)。

### Step 3 · 验证（人工部分，不可跳过）

1. `File → Open`，文件类型选 `SPICE netlist (*.cir)`，导入你的 `.cir`。
2. **黑盒替换**：`.MODEL` 生成的器件全部换成 Multisim 主数据库里的真实型号
   （路径查 [`docs/multisim-library-map.md`](./docs/multisim-library-map.md)）。
3. 按 README **第 3a 节的网格坐标表**摆位（`Ctrl+R` 旋转、`Ctrl+左右` 镜像），
   再对着第 3b 节 ASCII 图核对；按第 5 节连线表逐条接线。
4. **重设分析**：`Simulate → Analyses and simulation`（导入的 `.OP/.TRAN/.AC` 常被忽略）。
5. 跑仿真，用 **Grapher 游标**读真实数值。
6. 把读数填进 `verification.md` 的"实测值"列，把 README front-matter 的
   `status` 改成 `已验证`。

> 跑不通也没关系 —— 提交时保持 `待验证`，在 `verification.md` 第 6 节写清卡在哪一步。
> **一个诚实标注"卡住了"的 PR，比一个假装跑通的 PR 有价值得多。**

### Step 4 · 自检

**① 同步网页数据（最容易漏的一步）**

新电路必须在 `web/src/data/circuits.ts` 里有一条对应记录：

- 文件顶部加 `const CIR_00N = \`...网表全文...\`;`
- 在 `circuits` 数组里加一个同 `id` 的对象（含 `grid` / `parts` / `wires` / `theory` 等字段）

漏了它，`check_web_data.py` 会报 `缺少 CIR_00N 块`，**CI 直接变红**。

**② 跑这三条（CI 同款）**

```bash
# 网表 16 条规则（严格模式，warning 也算失败——CI 就是这个标准）
python scripts/cir_lint.py circuits/ --strict

# 刷新根 README 的索引表
python scripts/build_index.py --write

# 校验 web 数据与 circuits/ 是否同步
python scripts/check_web_data.py -v
```

再把网表全文贴给 [`prompts/circuit-review-prompt.md`](./prompts/circuit-review-prompt.md)，
让 AI 出一份 7 项 PASS/FAIL 清单，逐条确认。

### Step 5 · 提 PR

PR 标题格式：`feat(circuit): 004-xxx —— 一句话说明`

描述里请包含：

- 关联的 Issue（`Closes #N`）
- 使用的模型（写进 `prompt-used.md` 即可）
- **验证状态**：🟢 已验证 / 🟡 待验证 / 🔴 验证失败
- 若已验证：贴 Grapher 波形截图 + 关键实测值
- 若未验证：写清缺什么（没有 Multisim / 版本不对 / 卡在某一步）

---

## 三、PR 检查清单

提交前逐项打勾，Reviewer 也会照这个查：

### 文件完整性

- [ ] 目录名格式 `NNN-kebab-case`，且 `NNN` 不与现有编号冲突
- [ ] 目录下 4 个文件齐全：`NNN-xxx.cir` / `README.md` / `prompt-used.md` / `verification.md`
- [ ] `.cir` 文件名与目录名一致

### lint 相关

- [ ] `python scripts/cir_lint.py circuits/ --strict` 退出码 0
- [ ] `.cir` 首行是 `*` 标题注释，**末行是 `.END`**
- [ ] `.cir` 里没有中文/非 ASCII 字符（注释全英文，中文在 README 里）
- [ ] 指令只有 `.OP/.AC/.TRAN/.DC/.MODEL/.END`，一条黑名单指令都没有
- [ ] 节点名全大写（或 `0`），元件值无科学计数法（`10k` 不是 `1e4`）
- [ ] 元件行顺序 == README 里 `<!-- SIGNALFLOW: ... -->` 声明的顺序
- [ ] `python scripts/build_index.py --check` 通过（跑过 `--write`）

### 内容相关

- [ ] README 顶部 front-matter 六个字段齐全（`id/name/difficulty/status/desc/signalflow`）
- [ ] README 的 7 部分输出**齐全且顺序不变**（1 网表 / 2 元件表 / 3 布局图 / 4 整理步骤 /
      5 连线表 / 6 仪器设置 / 7 验证值+易错点）
- [ ] 第 5 节连线表覆盖了所有网络，`GND` 明确标出
- [ ] 第 7 节有**理论计算表**（能用网表元件值手算复现）+ **3 个典型接错方式**
- [ ] `prompt-used.md` 里存了**填完占位符的完整提示词** + 模型名 + 人工改动记录

### 验证状态（最重要）

- [ ] `verification.md` 的"实测值"列要么填了真实 Grapher 读数，要么**明确留空**
- [ ] **`status` 字段与实际情况一致**：没跑通就写 `待验证`，不要提前改 `已验证`
- [ ] 已验证的：附了 Multisim 原理图或 Grapher 波形截图（放本目录 `assets/`）
- [ ] 验证失败的：在 `verification.md` 第 6 节写明原因与现象

---

## 四、硬约束速查（写网表必须遵守）

| # | 约束 | 原因 |
|---|------|------|
| 1 | 分析指令只允许 `.OP / .AC / .TRAN / .DC` | 其余 Multisim 导入器不支持 |
| 2 | 禁止 `.MEAS .FOUR .NOISE .TF .SENS .STEP .TEMP .MC .PROBE .PLOT .PRINT` | 导入器忽略或报错 |
| 3 | 允许 `.MODEL`，**禁止 `.SUBCKT` / `.INCLUDE` / `.LIB`** | 黑盒策略，外部引用在导入后丢失 |
| 4 | 元件值写 `10k / 1k / 5`，禁止 `1e-3` | 部分导入器不认科学计数法（`.MODEL` 内参数除外） |
| 5 | 节点名全英文大写，首行 `*` 注释，末行 `.END` | 导入器解析要求 |
| 6 | **ANSI / 7-bit ASCII**，注释全英文 | 实测非 ASCII 字符会导致导入解析失败 |
| 7 | 单行 ≤ 132 字符，超长用 `+` 续行 | 经典 SPICE 上限 |
| 8 | 元件行按**信号流顺序**书写，电源行放最后 | Multisim 按行序从左到右摆放元件 |

全部由 `scripts/cir_lint.py` 自动检查，第 8 条只报 warn。

---

## 五、修改已有电路

欢迎！尤其欢迎这几种：

- **纠错**：发现理论值算错、库路径写错、连线表有遗漏 → 直接改，PR 标题 `fix(circuit-001): ...`。
- **补实测值**：已有电路状态是 🟡，你跑通了 → 填 `verification.md`，把 `status` 改成 `已验证`，
  PR 标题 `verify(circuit-001): ...`，附截图。
- **补内容**：加上 Multisim 实测波形、更详细的手算过程、更多易错点。

改 `.cir` 时记得同步改 README 里的代码块、`signalflow` 和第 7 节理论值——
**三者不一致是最常见的返工原因**。

## 六、行为准则

- 不抄袭商用实验指导书原文；引用教材请注明页码。
- 如实填写验证状态。**伪造实测值是本仓库唯一的"零容忍"行为**，一经发现 PR 直接关闭。
- 讨论对事不对人；AI 生成错了很正常，改掉就行。
