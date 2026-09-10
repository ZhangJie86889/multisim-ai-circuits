# 本次使用的提示词（可复现）

> **为什么留这个文件**：同一个电路换个人问 AI，结果可能完全不同。
> 把**填完占位符的最终提示词**原样存下来，别人才能复现、才能定位"是提示词写得烂还是 AI 犯蠢"。
> 提 PR 时这个文件是必填项。

## 填写方式

1. 复制 [`prompts/circuit-generation-template.md`](../../prompts/circuit-generation-template.md) 里的模板。
2. 把 `{{...}}` 全部替换（规范见 [`prompts/README.md`](../../prompts/README.md)）。
3. **原样粘贴到下面"，不加修饰**。
4. 再补一段"AI 与模型信息"和"人工改动记录"。

---

## 使用的模型

| 项 | 值 |
|----|----|
| 模型 | 例：DeepSeek-V3 |
| 日期 | YYYY-MM-DD |
| 温度 / 其他参数 | 默认 |
| 生成轮次 | 第 1 轮（是否追问过） |

## 填完占位符的提示词

```text
（把整段提示词粘贴到这里）
```

## 人工改动记录

| 位置 | AI 原输出 | 人工改为 | 原因 |
|------|----------|---------|------|
| 例：RC 值 | 933 Ω | 1k | 取 E24 标称值，实测仍满足指标 |
| | | | |

> ⚠️ 如果你**一行没改**就直接用了 AI 输出，请在这里写明"未做人工改动"——
> 这不是丢人的事，但必须诚实记录，便于 reviewer 重点核查。

## 自检结果

- [ ] 已用 [`prompts/circuit-review-prompt.md`](../../prompts/circuit-review-prompt.md) 跑过 7 项自检
- [ ] `python scripts/cir_lint.py <本目录>.cir` 通过（0 error）
- [ ] 已在 Multisim 里实际导入并跑通（未跑通请保持 `status: 待验证`）
