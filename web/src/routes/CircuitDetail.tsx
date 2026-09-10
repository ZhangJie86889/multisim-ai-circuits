import { Link, useParams } from "react-router-dom";
import { getCircuit } from "../data/circuits";
import { CodeBlock } from "../components/CodeBlock";
import { Schematic } from "../components/Schematic";
import { StatusBadge, DifficultyBadge, SignalFlow } from "../components/StatusBadge";
import { REPO_URL, REPO_BRANCH } from "../config";

export function CircuitDetail() {
  const { slug = "" } = useParams();
  const c = getCircuit(slug);

  if (!c) {
    return (
      <div className="container narrow">
        <h1>找不到该电路</h1>
        <p className="lead">没有编号为 <span className="mono">{slug}</span> 的电路。</p>
        <Link to="/circuits" className="btn primary">返回电路库</Link>
      </div>
    );
  }

  const dirUrl = `${REPO_URL}/tree/${REPO_BRANCH}/circuits/${c.slug}`;
  const cirUrl = `${REPO_URL}/blob/${REPO_BRANCH}/circuits/${c.slug}/${c.filename}`;

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/circuits">电路库</Link> / <span className="mono">{c.id}</span> {c.name}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        <span className="badge mono gray">{c.id}</span>
        <DifficultyBadge level={c.difficulty} />
        <StatusBadge status={c.status} withHint />
      </div>
      <h1 style={{ marginBottom: 4 }}>{c.name}</h1>
      <div className="muted">{c.nameEn}</div>
      <p className="lead" style={{ marginTop: 10 }}>{c.summary}</p>

      <div className="callout warn" style={{ marginTop: 14 }}>
        <div className="t">
          {c.status === "已验证" ? "🟢 已验证" : c.status === "失败" ? "🔴 验证失败" : "🟡 待验证"}
        </div>
        <p style={{ margin: "4px 0 0" }} className="small">
          本页 7 部分内容由 AI 依据提示词生成，网表已通过 <span className="mono">cir_lint.py</span>。
          {c.status !== "已验证" && " 但尚未有人在真实 Multisim 14.3 里跑通，请当作草稿使用。"}
          {" "}理论值与实测值对照见目录下的 <span className="mono">verification.md</span>。
        </p>
      </div>

      <dl className="kv" style={{ marginTop: 18 }}>
        <dt>文件名</dt>
        <dd className="mono">{c.filename}（ANSI / 7-bit ASCII）</dd>
        <dt>验证仪器</dt>
        <dd>{c.instruments}</dd>
        <dt>信号流</dt>
        <dd><SignalFlow nodes={c.signalFlow} /></dd>
        <dt>仓库位置</dt>
        <dd>
          <a href={dirUrl} target="_blank" rel="noreferrer" className="mono">circuits/{c.slug}/</a>
        </dd>
      </dl>

      {c.notes && (
        <div className="callout accent" style={{ marginTop: 16 }}>
          <div className="t">📌 本电路要点</div>
          <p style={{ margin: "4px 0 0" }} className="small">{c.notes}</p>
        </div>
      )}

      <h2>推荐接线示意</h2>
      <Schematic id={c.id} />
      <p className="small muted" style={{ marginTop: 8 }}>
        示意图仅供理解拓扑，实际摆位与旋转角度以下方 ASCII 布局图为准。
      </p>

      <h2>1 · 完整 .cir 网表代码</h2>
      <CodeBlock name={c.filename} code={c.cir} lang="spice" />
      <p className="small muted" style={{ marginTop: 8 }}>
        想自己改？用 <Link to="/lint">在线检查</Link> 验证语法后再存盘导入。
        {" "}
        <a href={cirUrl} target="_blank" rel="noreferrer">在 GitHub 查看原始文件 ↗</a>
      </p>

      <h2>2 · 元件清单（网表标号 | Multisim 库路径 | 参数）</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>标号</th><th>Group / Family / Component</th><th>参数</th><th>备注</th></tr>
          </thead>
          <tbody>
            {c.parts.map((p) => (
              <tr key={p.ref}>
                <td className="mono"><strong>{p.ref}</strong></td>
                <td className="mono">{p.path}</td>
                <td className="mono">{p.params}</td>
                <td>{p.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>3 · ASCII 布局图（导入后照此摆位）</h2>
      <CodeBlock name="layout.txt" code={c.ascii} lang="ascii" ascii />

      <h2>4 · 导入后整理步骤</h2>
      <ol className="steps">
        {c.importSteps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <h2>5 · 连线表（逐条核对，防漏线）</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>#</th><th>从</th><th>到</th><th>网络标签</th></tr>
          </thead>
          <tbody>
            {c.wires.map((w) => (
              <tr key={w.n}>
                <td className="num">{w.n}</td>
                <td className="mono">{w.from}</td>
                <td className="mono">{w.to}</td>
                <td>{w.net ? <span className="chip">{w.net}</span> : <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>6 · 仪器设置 + Grapher 游标读数法</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>仪器</th><th>端子接线</th><th>面板参数</th></tr>
          </thead>
          <tbody>
            {c.instrumentsSetup.map((t) => (
              <tr key={t.name}>
                <td className="mono"><strong>{t.name}</strong></td>
                <td>{t.terminals}</td>
                <td>{t.panel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>游标读数</h3>
      <ul>
        {c.grapher.map((g, i) => (
          <li key={i} className="small">{g}</li>
        ))}
      </ul>

      <h2>7 · 验证值 + 易错点</h2>
      <h3>7.1 理论计算表</h3>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>观测量</th><th>计算式</th><th>理论值</th><th>实测值</th></tr>
          </thead>
          <tbody>
            {c.theory.map((t, i) => (
              <tr key={i}>
                <td>{t.param}</td>
                <td className="mono">{t.formula}</td>
                <td className="num">
                  <strong>{t.value}</strong> {t.unit}
                </td>
                <td className="muted">待填</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>7.2 典型接错方式及读数表现</h3>
      {c.pitfalls.map((p, i) => (
        <div className="callout" key={i} style={{ marginBottom: 10 }}>
          <div className="t">❌ {p.title}</div>
          <p style={{ margin: "4px 0 0" }} className="small">{p.effect}</p>
        </div>
      ))}

      <hr />
      <div className="toolbar">
        <Link to="/circuits" className="btn">← 返回电路库</Link>
        <Link to="/lint" className="btn">在线检查 .cir</Link>
        <span className="spacer" />
        <a href={dirUrl} target="_blank" rel="noreferrer" className="btn">在 GitHub 查看目录 ↗</a>
      </div>
    </div>
  );
}
