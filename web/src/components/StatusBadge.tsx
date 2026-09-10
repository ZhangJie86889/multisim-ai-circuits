import { statusMeta, type VerifyStatus, type Difficulty } from "../data/circuits";

export function StatusBadge({ status, withHint = false }: { status: VerifyStatus; withHint?: boolean }) {
  const meta = statusMeta[status];
  const cls = status === "已验证" ? "ok" : status === "验证失败" ? "err" : "warn";
  return (
    <span className={`badge ${cls}`} title={withHint ? meta.hint : undefined}>
      <span aria-hidden>{meta.dot}</span>
      {meta.label}
    </span>
  );
}

export function DifficultyBadge({ level }: { level: Difficulty }) {
  const cls = level === "入门" ? "gray" : level === "进阶" ? "accent" : "err";
  return <span className={`badge ${cls}`}>{level}</span>;
}

/** 信号流：A → B → C，直观展示 Multisim 导入后的摆放顺序 */
export function SignalFlow({ nodes }: { nodes: string[] }) {
  return (
    <div className="chips">
      {nodes.map((n, i) => (
        <span key={`${n}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span className="flow-arrow">→</span>}
          <span className="chip">{n}</span>
        </span>
      ))}
    </div>
  );
}
