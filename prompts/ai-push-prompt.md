# 说明 2 · 让 AI 帮你把新内容推送到 GitHub

> **这是给人看的说明书，里面嵌了一段给 AI 的提示词。**
> 用法：复制下面「复制即用」那一整块，粘贴给任意 AI（WorkBuddy / DeepSeek / GPT / Claude 都行），
> 它就会自己完成检查 → 提交 → 推送 → 验证线上。
>
> 配套文档：
> - **说明 1**（新增一个电路要写什么格式）→ [`circuits/_template/README.md`](../circuits/_template/README.md)
> - 完整贡献流程 → [`CONTRIBUTING.md`](../CONTRIBUTING.md)

---

## 一、复制即用（懒人版）

把下面这一整块原样发给 AI：

```text
我在本地仓库里加了新内容，帮我把它们推送到 GitHub 并更新开源网站。

【仓库信息】
- 本地路径：D:\Desktop\个人文件\multisim-ai-circuits
- 远程地址：git@github.com:ZhangJie86889/multisim-ai-circuits.git
  （本机已配好 SSH 密钥，直接用 SSH 推送，不要问我要 PAT / 令牌）
- 分支：main
- 线上站点：https://zhangjie86889.github.io/multisim-ai-circuits/

【工作流程】
1. 先跑 `git status`，告诉我你发现了哪些新增或改动的文件，并说明你打算怎么分类提交。
   如果发现下面「硬约束」里的问题，先停下来问我，不要自己硬改我的内容。
2. 按顺序跑完这 4 条检查，任何一条失败就停下报告，不要绕过：
      python scripts/cir_lint.py circuits/ --strict
      python scripts/build_index.py --write
      python scripts/check_web_data.py -v
      cd web && npm run build          # 仅当 web/ 或 circuits/ 有变动时才需要
3. 全部通过后，再 git add → git commit → git push。
   commit message 用中文，遵循 Conventional Commits（feat / fix / docs / ci / refactor …）。
   如果同时有「我新增的内容」和「你自动修的问题」，请分成两个 commit。
4. push 之后验证：
   - 远端文件是否可达（raw.githubusercontent.com 取 HTTP 200）
   - GitHub Actions 两个工作流（Lint CIR / Deploy Web）是否 success
   - 线上站点是否已更新到新内容（可能需要等 1 分钟左右）

【硬约束 — 违反任何一条都不要执行】
- 禁止 `git push --force`；禁止改 `.git/config` 里的远程地址；不要把任何令牌写进文件或命令。
  如果碰到需要 PAT 的情况，直接告诉我去配 SSH，不要让我给你令牌。
- 所有 .md 必须是 **UTF-8**（不是 GBK / ANSI）；所有 .cir 必须是 **纯 ASCII**、
  LF 换行、首行是注释标题、末行是 `.END`。
- 不要提交 `node_modules/`、`dist/` 等构建产物（已被 .gitignore 排除）。
- **不要把电路的 status 从「待验证」改成「已验证」** —— 只有我在真实 Multisim 14.3 里
  跑过仿真、填了 verification.md 的实测值才算数。这是本项目的诚实边界。
- 如果是新增电路，确认这 3 处都改了，缺一不可：
      ① circuits/NNN-xxx/ 目录（4 个文件）
      ② 根 README.md 的索引表（用 build_index.py --write 生成，不要手改）
      ③ web/src/data/circuits.ts（加 CIR_NNN 块 + 电路条目，必须带 grid 字段）

【最后给我一份报告】
- 改了 / 新增了哪些文件
- 4 条检查各自的结果（通过 / 失败在哪一行）
- commit hash 与 push 结果
- Actions 状态、线上地址
- 以及：还有哪些事需要我自己做（比如在 Multisim 里仿真验证）
```

---

## 二、如果你想更省事：一句话版

```text
帮我把 D:\Desktop\个人文件\multisim-ai-circuits 里的新改动检查、提交并推送到 GitHub，
流程按 prompts/ai-push-prompt.md 里写的执行，最后给我一份报告。
```

（前提是仓库里已经有这份文件 —— 现在有了。）

---

## 三、AI 会替你做的 7 件事（你心里有数就行）

| # | 步骤 | 对应命令 / 动作 |
|---|------|----------------|
| 1 | 摸清改动 | `git status` + `git diff` |
| 2 | 网表硬约束 | `python scripts/cir_lint.py circuits/ --strict`（16 条规则） |
| 3 | 刷新索引 | `python scripts/build_index.py --write`（自动写回根 README） |
| 4 | 网页数据同步 | `python scripts/check_web_data.py -v`（含 UTF-8 编码校验） |
| 5 | 前端类型检查 | `cd web && npm run build`（`tsc --noEmit` + vite 构建） |
| 6 | 提交推送 | `git add` → `git commit` → `git push`（SSH，无令牌） |
| 7 | 线上验证 | 远端文件 200 / Actions ✅ / Pages 已更新 |

---

## 四、为什么这台机器不用令牌

- 本机 `~/.ssh/id_ed25519` 的公钥已加到 GitHub 账号，**SSH 推送不需要 PAT**；
- 更关键的是：GitHub 规定 **PAT 若缺 `workflow` 域，任何包含 `.github/workflows/` 的推送都会被整条拒绝**，
  而这个仓库必须靠 workflow 跑 CI 和 Pages。SSH 没有这个限制。
- 结论：**永远用 SSH，别再生成 PAT**。也别把令牌粘进对话里。

---

## 五、几个已知会踩的坑（提示词里已经写成硬约束）

| 坑 | 后果 | 提示词里的防线 |
|---|---|---|
| 中文 Windows 编辑器把 `.md` 存成 GBK | GitHub 上中文整片乱码；`build_index.py` 把乱码写进根 README 索引行 | `check_web_data.py` 会报错并提示怎么转 |
| `.cir` 里写了中文注释 | Multisim 网表导入器直接解析失败 | `cir_lint.py` 的 `E-ENC001` |
| 新增电路忘了同步 `circuits.ts` | CI 报「缺少 CIR_00N 块」变红 | 硬约束里列了「3 处缺一不可」 |
| 手动改根 README 索引表 | 下次 `--check` 不一致 | 只允许用 `build_index.py --write` |
| `git push` 偶发 `Could not read from remote repository` | 白紧张一次 | 属瞬时故障，**重试一次就好**，别去动配置 |
| AI 擅自把状态改成「已验证」 | 破坏项目诚实边界 | 硬约束明令禁止 |
