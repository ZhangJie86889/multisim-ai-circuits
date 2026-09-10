import { useState } from "react";
import { faqs } from "../data/faq";

export function Faq() {
  const [q, setQ] = useState("");
  const key = q.trim().toLowerCase();
  const list = key
    ? faqs.filter((f) => f.q.toLowerCase().includes(key) || f.a.toLowerCase().includes(key))
    : faqs;

  return (
    <div className="container narrow">
      <h1>FAQ · 高频问题</h1>
      <p className="lead">
        这里的答案都是已知结论，不是猜测。如果你的情况与某条不符，请开 Issue 说明 Multisim 版本与现象——
        很可能又是一个版本差异，值得补进来。
      </p>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="搜索问题（如 导入 / 555 / 悬空）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 340 }}
        />
        <span className="spacer" />
        <span className="small muted">{list.length} / {faqs.length} 条</span>
      </div>

      {list.map((f, i) => (
        <details className="card" key={i} style={{ padding: "14px 18px" }} open={list.length <= 3}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>{f.q}</summary>
          <p style={{ marginTop: 10 }}>{f.a}</p>
          {f.code && <pre className="code" style={{ borderRadius: 6, marginTop: 8 }}>{f.code}</pre>}
        </details>
      ))}

      {list.length === 0 && <p className="muted">没有匹配的问题。</p>}

      <div className="callout accent" style={{ marginTop: 22 }}>
        <div className="t">还有问题？</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          开 Issue，标题带 <span className="mono">[FAQ]</span>，我们会把有价值的问题补进文档和本页。
        </p>
      </div>
    </div>
  );
}
