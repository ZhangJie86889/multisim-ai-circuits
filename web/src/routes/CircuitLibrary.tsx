import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { circuits } from "../data/circuits";
import { StatusBadge, DifficultyBadge, SignalFlow } from "../components/StatusBadge";

const DIFFS = ["全部", "入门", "进阶", "挑战"] as const;
const STATUSES = ["全部", "待验证", "已验证", "失败"] as const;

export function CircuitLibrary() {
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("全部");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("全部");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    return circuits.filter((c) => {
      if (diff !== "全部" && c.difficulty !== diff) return false;
      if (status !== "全部" && c.status !== status) return false;
      if (!key) return true;
      return (
        c.name.toLowerCase().includes(key) ||
        c.nameEn.toLowerCase().includes(key) ||
        c.id.includes(key) ||
        c.summary.toLowerCase().includes(key) ||
        c.parts.some((p) => p.ref.toLowerCase().includes(key) || p.path.toLowerCase().includes(key))
      );
    });
  }, [diff, status, q]);

  return (
    <div className="container">
      <h1>电路库</h1>
      <p className="lead">
        每个目录包含 <span className="mono">.cir</span> 网表、7 部分说明文档、实际使用的提示词与验证记录。
        点开任一电路可查看完整网表、连线表、仪器设置与理论值。
      </p>

      <div className="toolbar" style={{ marginTop: 18 }}>
        <input
          type="text"
          placeholder="搜索电路名 / 编号 / 元件（如 2N2222）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select value={diff} onChange={(e) => setDiff(e.target.value as (typeof DIFFS)[number])} style={{ maxWidth: 130 }}>
          {DIFFS.map((d) => (
            <option key={d} value={d}>{d === "全部" ? "全部难度" : d}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])} style={{ maxWidth: 150 }}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === "全部" ? "全部状态" : s}</option>
          ))}
        </select>
        <span className="spacer" />
        <span className="small muted">共 {list.length} 个电路</span>
      </div>

      {list.length === 0 ? (
        <div className="callout">没有匹配的电路。换个关键词，或去 GitHub 开 Issue 求一个。</div>
      ) : (
        <div className="grid cards">
          {list.map((c) => (
            <Link key={c.slug} to={`/circuits/${c.slug}`} className="card link">
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <span className="badge mono gray">{c.id}</span>
                <DifficultyBadge level={c.difficulty} />
                <span style={{ marginLeft: "auto" }}>
                  <StatusBadge status={c.status} withHint />
                </span>
              </div>
              <h3 style={{ margin: "0 0 4px" }}>{c.name}</h3>
              <div className="small muted" style={{ marginBottom: 10 }}>{c.nameEn}</div>
              <p className="small" style={{ margin: "0 0 12px", color: "var(--fg-soft)" }}>{c.summary}</p>
              <SignalFlow nodes={c.signalFlow} />
            </Link>
          ))}
        </div>
      )}

      <div className="callout accent" style={{ marginTop: 28 }}>
        <div className="t">想贡献一个电路？</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          复制 <span className="mono">circuits/_template/</span>，用{" "}
          <Link to="/prompt">提示词生成器</Link> 造一份提示词交给 AI，按{" "}
          <Link to="/workflow">工作流</Link> 人工验证后提交 PR。CI 会自动跑 16 条规则检查。
        </p>
      </div>
    </div>
  );
}
