import { useMemo, useState } from "react";
import { lintCir, type LintReport } from "../lib/cir-lint";
import { circuits } from "../data/circuits";

const SAMPLE = `* MY-FIRST-CIRCUIT: RC LOW PASS FILTER, ANSI, MULTISIM 14.3
* FILE: my-rc-lp.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> R1 -> C1
VIN IN 0 PULSE(0 5 0 1u 1u 0.5m 1m)
R1 IN OUT 1k
C1 OUT 0 100n
.OP
.TRAN 1u 3m 0 1u
.END
`;

const LEVEL_LABEL: Record<string, string> = {
  error: "ERROR",
  warn: "WARN",
  info: "INFO",
};

function Report({ report }: { report: LintReport }) {
  const { errors, warns, infos, findings } = report;
  const ok = errors === 0;
  return (
    <>
      <div className={`callout ${ok ? "ok" : "err"}`} style={{ marginTop: 14 }}>
        <div className="t">{ok ? "✅ LINT PASSED" : "❌ LINT FAILED"}</div>
        <p style={{ margin: "4px 0 0" }} className="small">
          {errors} error · {warns} warn · {infos} info · 识别到 {report.nElements} 个元件行
          {ok
            ? "（语法可导入 Multisim；info 只是排版提示，不影响导入）"
            : "（存在会让导入失败的问题，请先修复）"}
        </p>
      </div>

      {findings.length === 0 ? (
        <p className="small muted" style={{ marginTop: 10 }}>
          全部检查通过，没有任何 error / warn / info。
        </p>
      ) : (
        <ul className="lint-list">
          {findings.map((f, i) => (
            <li key={i} className={f.level}>
              <span className="tag">{LEVEL_LABEL[f.level] ?? f.level}</span>
              <span className="tag" style={{ background: "transparent", color: "var(--muted)" }}>{f.code}</span>
              <span className="loc">{f.line ? `第 ${f.line} 行` : "文件级"}</span>
              <span style={{ flex: 1 }}>{f.message}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function LintPage() {
  const [text, setText] = useState(SAMPLE);
  const [strict, setStrict] = useState(false);
  const [report, setReport] = useState<LintReport | null>(null);

  const lineCount = useMemo(() => text.split(/\r?\n/).length, [text]);

  const run = () => setReport(lintCir(text));
  const clear = () => {
    setText("");
    setReport(null);
  };

  const loadSample = (slug: string) => {
    const c = circuits.find((x) => x.slug === slug);
    if (c) {
      setText(c.cir);
      setReport(lintCir(c.cir, c.signalFlow));
    }
  };

  return (
    <div className="container">
      <h1>在线 .cir 语法检查</h1>
      <p className="lead">
        浏览器本地运行，与仓库的 <span className="mono">cir_lint.py</span> 同一套规则（16 条：9 error / 6 warn / 1 info）。
        粘贴网表后点「开始检查」，或直接载入种子电路试跑。数据不会离开你的浏览器。
      </p>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <button className="btn primary" onClick={run}>开始检查</button>
        <button className="btn" onClick={clear}>清空</button>
        <label className="small" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} />
          严格模式（warn 也算失败）
        </label>
        <span className="spacer" />
        <span className="small muted">{lineCount} 行</span>
      </div>

      <div className="toolbar" style={{ marginTop: -4 }}>
        <span className="small muted">载入示例：</span>
        {circuits.map((c) => (
          <button key={c.slug} className="btn small" onClick={() => loadSample(c.slug)}>
            {c.id} {c.name}
          </button>
        ))}
      </div>

      <textarea
        className="code-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder="把 .cir 网表粘贴到这里…"
      />

      <h2>检查结果</h2>
      {report ? (
        <>
          {report && <Report report={report} />}
          {strict && report.errors === 0 && report.warns > 0 && (
            <div className="callout warn" style={{ marginTop: 12 }}>
              <div className="t">严格模式失败</div>
              <p style={{ margin: "4px 0 0" }} className="small">
                当前 {report.warns} 个 warning（如 W-LEN01 行过长、W-FLOAT1 疑似悬空）。
                普通模式可导入，但 CI 用了 <span className="mono">--strict</span>，建议一并修掉。
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="small muted">还没有结果，点上方「开始检查」。</p>
      )}

      <h2>规则清单</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>代码</th><th>级别</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr><td className="mono">E-ENC001</td><td><span className="badge err">error</span></td><td>文件含非 ASCII 字符（中文注释最常见）→ 导入直接失败</td></tr>
            <tr><td className="mono">E-ENC002</td><td><span className="badge err">error</span></td><td>文件带 UTF-8 BOM</td></tr>
            <tr><td className="mono">E-TITLE1</td><td><span className="badge err">error</span></td><td>首行必须是 * 开头的标题注释</td></tr>
            <tr><td className="mono">E-END001</td><td><span className="badge err">error</span></td><td>末行必须是 .END</td></tr>
            <tr><td className="mono">E-END002</td><td><span className="badge err">error</span></td><td>.END 只能出现在最后一行</td></tr>
            <tr><td className="mono">E-DOT001</td><td><span className="badge err">error</span></td><td>分析指令不在白名单 .OP/.AC/.TRAN/.DC/.MODEL/.END 内</td></tr>
            <tr><td className="mono">E-DOT002</td><td><span className="badge err">error</span></td><td>命中黑名单指令（.STEP/.MEAS/.SUBCKT/.PARAM…）</td></tr>
            <tr><td className="mono">E-NODE1</td><td><span className="badge err">error</span></td><td>节点名必须匹配 ^[A-Z][A-Z0-9_]*$ 或为 0</td></tr>
            <tr><td className="mono">E-SCI1</td><td><span className="badge err">error</span></td><td>元件值禁止科学计数法（.MODEL 行不检查）</td></tr>
            <tr><td className="mono">W-ORDER1</td><td><span className="badge warn">warn</span></td><td>元件行顺序与声明的信号流不一致（载入示例时自动带入 signalflow）</td></tr>
            <tr><td className="mono">W-FLOAT1</td><td><span className="badge warn">warn</span></td><td>非地节点只出现 1 次，疑似悬空</td></tr>
            <tr><td className="mono">W-LEN01</td><td><span className="badge warn">warn</span></td><td>单行超过 132 字符</td></tr>
            <tr><td className="mono">W-NAME1</td><td><span className="badge warn">warn</span></td><td>元件名建议全大写</td></tr>
            <tr><td className="mono">W-MISC1</td><td><span className="badge warn">warn</span></td><td>无法识别的行 / 首字母不在 RLCVDQX 内</td></tr>
            <tr><td className="mono">W-FANOUT1</td><td><span className="badge warn">warn</span></td><td>单节点出现 ≥5 次，扇出过大导致连线交叉（拆节点或加网络标签）</td></tr>
            <tr><td className="mono">I-SPAN1</td><td><span className="badge gray">info</span></td><td>单网络横跨 ≥4 个元件位，会拉出横穿图面的长线（<strong>不影响通过</strong>）</td></tr>
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>
        粘贴单文件时不带 <span className="mono">signalflow</span>，W-ORDER1 只在从示例载入时校验。
        CI 里由 <span className="mono">cir_lint.py</span> 读取同目录 README 的 front-matter 自动比对。
      </p>
    </div>
  );
}
