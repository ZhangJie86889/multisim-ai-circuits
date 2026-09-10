import { Link } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { REPO_URL, REPO_BRANCH } from "../config";

const STEPS: { t: string; d: string; who: "AI" | "人工" | "CI" }[] = [
  { t: "① 提 Issue 填需求", who: "人工", d: "用 .github/ISSUE_TEMPLATE/circuit-request.md 描述电路，表单字段与提示词占位符一一对应。" },
  { t: "② 复制并填写模板", who: "人工", d: "打开 prompts/circuit-generation-template.md（v1）或 circuit-generation-template-v2.md（强化摆放，推荐），替换 12 个 {{占位符}}。可先用本站的提示词生成器。" },
  { t: "③ 丢给任意 AI", who: "AI", d: "DeepSeek / 通义 / GPT / Claude / 豆包皆可，得到严格 7 部分（v1）或 8 部分（v2，多一张 3a 网格坐标表）输出。" },
  { t: "④ Multisim File → Open 导入", who: "人工", d: "把第 1 部分的 .cir 存盘导入，做黑盒替换，按 ASCII 图摆位、连线、加网络标签。" },
  { t: "⑤ 人工仿真验证", who: "人工", d: "在真实 Multisim 14.3 里跑，用 Grapher 游标记录实测值——这一步 AI 不参与，最关键。" },
  { t: "⑥ 填 verification.md 并提 PR", who: "人工", d: "理论与实践值分列，status 按实情填写（没实测不许改成已验证）。" },
  { t: "⑦ CI 自动跑 cir_lint", who: "CI", d: "push/PR 触发 .github/workflows/lint.yml，16 条规则全过才允许合并（info 级排版提示不影响通过）。" },
  { t: "⑧ 合并 + 刷新索引", who: "CI", d: "build_index.py 更新 README 索引表，电路正式入库。" },
];

const WHO_CLS: Record<string, string> = { AI: "accent", 人工: "warn", CI: "ok" };

const REVIEW = [
  "首行标题注释、末行 .END、ANSI 编码",
  "指令白名单 .OP/.AC/.TRAN/.DC/.MODEL/.END；黑名单指令一个都不能出现",
  "节点名全大写；元件值无科学计数法",
  "元件行顺序是否等于信号流向（Multisim 按行序摆放元件）",
  "逐行核对连接关系：每个节点至少 2 个引脚，无悬空节点",
  "数值自洽：用网表参数手算工作点（Ib、Ic、Vce），判断是否满足设计指标",
  "与第 7 部分验证值表交叉比对：理论值与网表参数是否自洽",
];

const LOCAL_CMD = `# 检查单个网表
python scripts/cir_lint.py circuits/NNN-xxx/xxx.cir

# 批量检查 + 严格模式（CI 同款）
python scripts/cir_lint.py circuits/ --strict

# 刷新 README 索引表
python scripts/build_index.py --write`;

export function Workflow() {
  return (
    <div className="container narrow">
      <h1>贡献工作流</h1>
      <p className="lead">
        从提需求到合并，一共八步。核心原则：<strong>AI 生成、人工验证</strong>。
        第 ⑤ 步（真实 Multisim 仿真）是分水岭，任何 AI 都无法替代。
      </p>

      <figure style={{ margin: "18px 0 0" }}>
        <img
          src="./images/workflow.svg"
          alt="工作流程图：八步闭环，按人工、AI、CI 三类角色着色"
          style={{ width: "100%", maxWidth: 780, height: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
        />
        <figcaption className="small muted" style={{ marginTop: 6 }}>
          图按 <strong>人工 / AI / CI</strong> 三类角色着色；矢量图，放大不糊。
          仓库里同一张图在 <span className="mono">docs/images/workflow.svg</span>。
        </figcaption>
      </figure>

      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table className="data">
          <thead>
            <tr><th>#</th><th>步骤</th><th>负责</th><th>说明</th></tr>
          </thead>
          <tbody>
            {STEPS.map((s) => (
              <tr key={s.t}>
                <td className="mono">{s.t.slice(0, 1)}</td>
                <td><strong>{s.t.slice(1).trim()}</strong></td>
                <td><span className={`badge ${WHO_CLS[s.who]}`}>{s.who}</span></td>
                <td>{s.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>PR 前自检（7 项 PASS/FAIL）</h2>
      <p className="small">
        把下面清单交给任意 AI 逐条审查你的网表。<strong>任何一条 FAIL 都必须修掉或在 PR 里说明理由。</strong>
        第 4、5、6 条正是 Multisim 导入后「能跑但结果不对」的高发区。
      </p>
      <ol className="steps">
        {REVIEW.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
      <CodeBlock
        name="review-prompt.txt"
        lang="prompt"
        code={`你是 SPICE 网表审查员。对以下 .cir 网表逐项检查并输出 PASS/FAIL 清单：\n\n${REVIEW.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\n网表如下：\n\n{{粘贴 .cir 全文}}`}
      />

      <h2>自检之外，人工还要做这三件事</h2>
      <div className="grid cols-3">
        <div className="card">
          <h3>🔁 黑盒替换</h3>
          <p className="small muted">把 .MODEL 定义的器件换成 Multisim 主数据库里的真实型号（2N2222 / LED_red / LM555CN…）。</p>
        </div>
        <div className="card">
          <h3>⚙️ 重设分析</h3>
          <p className="small muted">导入后 .OP/.TRAN/.AC 常被忽略，在 Simulate → Analyses and simulation 里重设一遍。</p>
        </div>
        <div className="card">
          <h3>📝 填实测值</h3>
          <p className="small muted">Grapher 游标读数填进 verification.md，把 front-matter 的 status 改成「已验证」。</p>
        </div>
      </div>

      <h2>本地自动检查</h2>
      <p className="small">上面 1~4 条由脚本自动覆盖，与 CI 完全一致：</p>
      <CodeBlock name="terminal" lang="bash" code={LOCAL_CMD} />

      <hr />

      <div className="callout warn">
        <div className="t">⚠️ 诚实边界</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          <span className="mono">.cir</span> 网表通过了 lint 只代表<strong>语法能导入</strong>，不代表电路能跑通。
          一个 🟡 待验证的电路，本体可能有三极管引脚接错、偏置算错、555 忘记短接 2/6 脚等问题。
          请务必亲自在 Multisim 里验证，并优先使用 🟢 已验证的电路。
        </p>
      </div>

      <div className="toolbar" style={{ marginTop: 20 }}>
        <Link to="/prompt" className="btn primary">去生成提示词</Link>
        <Link to="/lint" className="btn">在线检查 .cir</Link>
        <a href={`${REPO_URL}/blob/${REPO_BRANCH}/docs/workflow.md`} target="_blank" rel="noreferrer" className="btn">
          完整工作流文档 ↗
        </a>
      </div>
    </div>
  );
}
