import { useState } from "react";
import { libraryGroups } from "../data/library";

export function LibraryMap() {
  const [q, setQ] = useState("");
  const key = q.trim().toLowerCase();

  const groups = libraryGroups
    .map((g) => ({
      ...g,
      rows: key
        ? g.rows.filter(
            (r) =>
              r.name.toLowerCase().includes(key) ||
              r.path.toLowerCase().includes(key) ||
              r.note.toLowerCase().includes(key) ||
              r.tags.toLowerCase().includes(key),
          )
        : g.rows,
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="container">
      <h1>Multisim 元件库路径速查</h1>
      <p className="lead">
        格式：<span className="mono">Group / Family / Component</span>，对应取件对话框{" "}
        <span className="mono">Place → Component</span> 的三级树——也就是本项目要你
        <strong>不用再逐层翻</strong>的那一层。
      </p>

      <div className="callout warn" style={{ marginTop: 14 }}>
        <div className="t">⚠️ 版本差异提示</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          本表基于 Multisim 14.x 主数据库整理。不同小版本 / 教育版 / 简化安装可能缺件或系列名略有出入
          （尤其二极管和运放的 Family 名）。<strong>搜不到就用搜索框</strong>：
          <span className="mono">Search</span> 里勾选 <span className="mono">Search in: All databases</span>，输型号关键词比按树翻快十倍。
        </p>
      </div>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="搜索元件 / 库路径 / 型号（如 2N2222 / LED / opamp）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 380 }}
        />
        <span className="spacer" />
        <span className="small muted">
          {groups.reduce((n, g) => n + g.rows.length, 0)} 条结果
        </span>
      </div>

      {groups.map((g) => (
        <section key={g.title}>
          <h2>
            {g.emoji} {g.title}
          </h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>元件</th><th>Group / Family / Component</th><th>说明</th></tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.name + r.path}>
                    <td><strong>{r.name}</strong></td>
                    <td className="mono">{r.path}</td>
                    <td>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {groups.length === 0 && <p className="muted">没有匹配的元件。试试型号关键词（如 <span className="mono">2n2222</span>）。</p>}

      <div className="callout accent" style={{ marginTop: 26 }}>
        <div className="t">发现路径不对？</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          提 PR 修 <span className="mono">docs/multisim-library-map.md</span> 即可——这类修正最欢迎。
          在表格里改一行，并在「版本差异记录」里补一行你的 Multisim 版本与实际路径。
        </p>
      </div>
    </div>
  );
}
