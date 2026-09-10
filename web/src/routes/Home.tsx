import { Link } from "react-router-dom";
import { circuits } from "../data/circuits";
import { StatusBadge, DifficultyBadge } from "../components/StatusBadge";
import { REPO_URL } from "../config";

const FLOW = [
  { t: "提 Issue 填需求", d: "用 circuit-request 表单描述电路，字段与提示词占位符一一对应。" },
  { t: "复制并填写模板", d: "打开 prompts/circuit-generation-template.md，替换 12 个 {{占位符}}。" },
  { t: "丢给任意 AI", d: "DeepSeek / 通义 / GPT / Claude / 豆包皆可，得到严格 7 部分输出。" },
  { t: "Multisim File → Open", d: "把第 1 部分的 .cir 存盘后导入，黑盒替换库件、按 ASCII 图摆位连线。" },
  { t: "人工仿真验证", d: "在真实 Multisim 14.3 里跑，用 Grapher 游标记录实测值（AI 不参与）。" },
  { t: "填 verification.md 并提 PR", d: "理论上/实测值分列，状态标签按实情填写。" },
  { t: "CI 自动跑 cir_lint", d: "push/PR 触发，16 条硬约束全过才允许合并。" },
  { t: "合并 + 刷新索引", d: "build_index.py 更新 README 索引表，电路正式入库。" },
];

export function Home() {
  return (
    <div className="container">
      <section className="hero">
        <h1>提示词驱动的 Multisim 电路库</h1>
        <p className="tagline">
          用一套标准化提示词，让 AI 直接产出可被 <span className="mono">File → Open</span> 导入 NI Multisim 14.3 的{" "}
          <span className="mono">.cir</span> 网表，外加元件清单、ASCII 布局图、连线表、仪器设置与验证值——替代人工在
          Group → Family → Component 三级树里逐层翻找元器件。
        </p>
        <div className="cta">
          <Link to="/circuits" className="btn primary">浏览电路库</Link>
          <Link to="/prompt" className="btn">生成提示词</Link>
          <Link to="/lint" className="btn">在线检查 .cir</Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn">GitHub</a>
        </div>

        <div className="stat-row">
          <div className="stat"><div className="n">{circuits.length}</div><div className="l">种子电路</div></div>
          <div className="stat"><div className="n">7</div><div className="l">结构化输出</div></div>
          <div className="stat"><div className="n">16</div><div className="l">lint 规则</div></div>
          <div className="stat"><div className="n">MIT</div><div className="l">开源协议</div></div>
        </div>
      </section>

      <div className="callout warn" style={{ marginTop: 20 }}>
        <div className="t">⚠️ 诚实边界（本项目的立身之本）</div>
        <p style={{ margin: "4px 0 0" }}>
          AI 负责生成网表与文档，<strong>Multisim 导入与仿真读数由贡献者人工验证</strong>。每个电路都带验证状态标签
          （🟢 已验证 / 🟡 待验证 / 🔴 验证失败），<span className="mono">verification.md</span> 中理论值与实测值分列。
          <strong>本项目杜绝「AI 生成就当能用」。</strong>
        </p>
      </div>

      <h2>它解决什么问题</h2>
      <div className="grid cols-3">
        <div className="card">
          <h3>🗂️ 库层级太深</h3>
          <p className="small muted">Multisim 元件散落在 Group / Family / Component 三级树里，找一个 2N2222 要点开好几层。本项目直接给出完整库路径。</p>
        </div>
        <div className="card">
          <h3>⏱️ 每个电路 1~2 小时</h3>
          <p className="small muted">找元件、定参数、查连线顺序、算验证值，初学者极易接错（极性反、引脚反、偏置算错、忘接地）。</p>
        </div>
        <div className="card">
          <h3>🚫 网表导入的坑</h3>
          <p className="small muted">非 ASCII 字符、超 132 字符的行、不支持的指令都会让导入直接失败。16 条 lint 规则把它们挡在门外。</p>
        </div>
      </div>

      <h2>工作流（八步闭环）</h2>
      <ol className="steps">
        {FLOW.map((s) => (
          <li key={s.t}>
            <strong>{s.t}</strong>
            <div className="small muted">{s.d}</div>
          </li>
        ))}
      </ol>

      <h2>种子电路</h2>
      <div className="grid cards">
        {circuits.map((c) => (
          <Link key={c.slug} to={`/circuits/${c.slug}`} className="card link">
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <span className="badge mono gray">{c.id}</span>
              <DifficultyBadge level={c.difficulty} />
              <span className="spacer" style={{ marginLeft: "auto" }} />
              <StatusBadge status={c.status} withHint />
            </div>
            <h3 style={{ margin: "0 0 4px" }}>{c.name}</h3>
            <div className="small muted" style={{ marginBottom: 8 }}>{c.nameEn}</div>
            <p className="small" style={{ margin: 0, color: "var(--fg-soft)" }}>{c.summary}</p>
          </Link>
        ))}
      </div>

      <div className="callout accent" style={{ marginTop: 28 }}>
        <div className="t">💡 关于「图不整齐」</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          <span className="mono">.cir</span> 网表不包含任何坐标信息，Multisim 会按元件行顺序自行摆放，导入后必然要手动整理。
          这是格式限制，任何提示词都改不了。要一张真正整齐的图，要么照 ASCII 图手动摆，要么换用 LTspice 的{" "}
          <span className="mono">.asc</span>（带 X/Y 坐标）。
        </p>
      </div>
    </div>
  );
}
