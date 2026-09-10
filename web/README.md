# web/ · 配套静态站点

`multisim-ai-circuits` 的浏览器端伴侣：把仓库里的电路库、提示词模板、元件库速查表
搬到网页上，并额外提供一个**纯前端**的 `.cir` 语法检查器（移植自 `scripts/cir_lint.py`）。

技术栈刻意保持最简，方便任何人 fork 后直接部署：

| 项 | 选择 | 理由 |
|----|------|------|
| 构建 | Vite 5 | 快、零配置、产物是纯静态文件 |
| 框架 | React 18 + React Router 6 | 生态成熟，HashRouter 免服务端 rewrite |
| 语言 | TypeScript（strict） | 数据文件与 lint 逻辑都要类型约束 |
| 样式 | 手写 CSS（单文件 `styles.css`） | 无 Tailwind/UI 库依赖，改起来直观 |

> 本目录**不引入**任何后端、数据库或鉴权。数据全部静态内嵌在 `src/data/`，
> 在线检查在浏览器里跑，不联网、不上传。

---

## 页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 定位、痛点、八步工作流、种子电路卡片、诚实边界 |
| `/circuits` | 电路库 | 按难度/状态筛选 + 关键词搜索 |
| `/circuits/:slug` | 电路详情 | 原理图示意 + 7 部分内容（网表/元件表/布局图/整理步骤/连线表/仪器/验证值） |
| `/prompt` | 提示词生成器 | 填 12 个字段，实时拼出完整提示词，一键复制 |
| `/lint` | 在线检查 | 粘贴 `.cir`，浏览器内跑 13 条硬约束，PASS/FAIL + 逐条定位 |
| `/library` | 元件库速查 | Group / Family / Component 三级路径，可搜索 |
| `/faq` | FAQ | 12 条高频问题，可搜索 |
| `/workflow` | 工作流 | 八步流程 + PR 前 7 项自检 + 本地命令 |

（使用 `HashRouter`，所以线上 URL 形如
`https://<user>.github.io/multisim-ai-circuits/#/circuits/001-bjt-switch-led`。）

---

## 本地开发

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

## 构建与预览

```bash
npm run build      # 先 tsc --noEmit 类型检查，再 vite build -> web/dist
npm run preview    # 本地预览构建产物
```

`vite.config.ts` 里 `base: "./"` 配合 HashRouter，使产物可直接丢到
GitHub Pages 的任意子路径下，无需改配置。

---

## 数据维护（重要）

`src/data/circuits.ts` 里**内嵌了每个种子电路的 `.cir` 全文**，供详情页展示与在线检查使用。
这意味着 `circuits/*/*.cir` 与本站点存在两份拷贝，**改动必须同步**。

为防止漂移，仓库提供了校验脚本：

```bash
# 在仓库根目录执行
python scripts/check_web_data.py -v
```

它会逐字比对 `circuits/NNN-xxx/*.cir` 与 `src/data/circuits.ts` 里的 `CIR_xxx` 块，
并核对 front-matter 的 `signalflow` 是否与 `circuits.ts` 一致。CI 会在 PR 时自动跑。

同步数据文件的其他来源：

- `src/data/faq.ts` ← `docs/faq.md`
- `src/data/library.ts` ← `docs/multisim-library-map.md`
- `src/data/template.ts` ← `prompts/circuit-generation-template.md`

修改上述文档时，请顺手更新对应数据文件。

---

## 部署到 GitHub Pages

仓库已带工作流 [`.github/workflows/pages.yml`](../.github/workflows/pages.yml)：

1. 打开仓库 `Settings → Pages`，把 **Source** 设为 **GitHub Actions**；
2. 推送到 `main` 且改动落在 `web/**` 时自动构建并发布；
3. 线上地址：`https://<user>.github.io/multisim-ai-circuits/`。

也可以在 `Actions → Deploy Web → Run workflow` 手动触发。

---

## 与 Grok 版站点的关系

本项目早期参考过一个更重的实现（TanStack Start + better-auth + pglite + Vercel/Nitro + PWA）。
那套栈对本仓库的需求（纯展示 + 浏览器内 lint）明显过度，故本站**重新实现为纯静态 Vite 应用**，
只吸收了两处真正有价值的思路：

1. **浏览器端 lint**：把 `cir_lint.py` 的规则移植成 TS，让用户不必装 Python 就能自查；
2. **原理图 SVG**：用内联 SVG 手绘三个种子电路的接线示意，比纯 ASCII 图更直观。

其余页面结构（首页/电路库/详情/提示词/检查/FAQ/元件表）则按本仓库的实际内容重新组织。
