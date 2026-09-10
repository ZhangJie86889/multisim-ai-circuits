# PR 前自检提示词（写给贡献者）

> **什么时候用**：你已经把 AI 生成的 `.cir` 存进 `circuits/NNN-xxx/`，
> 准备提 PR **之前**。把下面提示词复制走，把 `{{粘贴 .cir 全文}}` 换成你的网表，
> 发给任意大模型，它会逐条输出 PASS/FAIL 清单。
> **任何一条 FAIL 都必须修掉或在 PR 里说明理由**——别把它当形式主义，
> 这 7 条里第 4、5、6 条正是 Multisim 导入后"能跑但结果不对"的高发区。

```text
你是 SPICE 网表审查员。对以下 .cir 网表逐项检查并输出 PASS/FAIL 清单：

1. 首行标题注释、末行 .END、ANSI 编码
2. 指令白名单 .OP/.AC/.TRAN/.DC/.MODEL/.END；黑名单指令一个都不能出现
3. 节点名全大写；元件值无科学计数法
4. 元件行顺序是否等于信号流向（Multisim 按行序摆放元件）
5. 逐行核对连接关系：每个节点至少 2 个引脚，无悬空节点
6. 数值自洽：用网表参数手算工作点（如 Ib、Ic、Vce），判断是否满足
   设计指标（饱和/截止/增益/频率）
7. 与第 7 部分验证值表交叉比对：理论值与网表参数是否自洽

网表如下：

{{粘贴 .cir 全文}}
```

---

## 输出格式建议（可一并追加给 AI）

```text
请按下面格式输出，不要省略任何一项：

| # | 检查项 | 结论 | 依据/违规行 |
|---|--------|------|-------------|
| 1 | 首行/末行/编码 | PASS / FAIL | 第 N 行… |
| 2 | 指令白/黑名单 | PASS / FAIL | … |
| ... | | | |

最后给出：
- 必须修改（阻塞合并）：…
- 建议修改（不阻塞）：…
- 手算工作点过程（Ib / Ic / Vce / 增益 / 频率，逐步列式子）
```

## 自检之外，人工还要做这三件事

AI 审查员**看不到** Multisim 里的实际情况，所以这三项必须人工：

1. **黑盒替换**：`.MODEL` 定义的器件换成 Multisim 主数据库里的真实型号
   （`2N2222` / `LED_red` / `LM555CN` …）。路径查 [`docs/multisim-library-map.md`](../docs/multisim-library-map.md)。
2. **重设分析**：导入后 `.OP/.TRAN/.AC` 常被忽略，在
   `Simulate → Analyses and simulation` 里重设一遍（见 [`docs/faq.md`](../docs/faq.md) Q1）。
3. **填实测值**：Grapher 游标读数填进 `verification.md` 的"实测值"列，
   把 front-matter 的 `status` 从 `待验证` 改成 `已验证`。

## 本地自动检查（与上面 1~4 条对应）

```bash
python scripts/cir_lint.py circuits/NNN-xxx/xxx.cir
python scripts/cir_lint.py circuits/ --strict   # CI 同款
```
