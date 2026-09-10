import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  EMPTY_FIELDS,
  FIELD_META,
  fillTemplate,
  filledCount,
  remainingPlaceholders,
  type PromptFields,
} from "../data/template";
import { CodeBlock } from "../components/CodeBlock";

const EXAMPLE: PromptFields = {
  电路名称: "2N2222 开关驱动红 LED",
  验证仪器: "XFG1 函数发生器 + XSC1 示波器",
  验证目标: "1 kHz 方波下饱和，Vce ≈ 0.2 V，LED 电流约 2.8 mA",
  性能指标: "Ic(sat) ≈ 2.8 mA；Ib ≈ 0.43 mA；Vce(sat) ≈ 0.2 V；强制 β ≈ 6.5",
  电源规格: "VCC = 5 V DC，负端接地",
  输入信号: "0–5 V 方波，1 kHz，占空比 50%，Tr = Tf = 1 us",
  负载: "红色 LED（Vf ≈ 2.0 V）+ 1k 集电极电阻到 VCC",
  有源器件及型号: "Q1 = 2N2222（NPN，β ≈ 200）；DLED = LED_red",
  "元器件清单：每行一个，含网表标号/Multisim库路径/参数":
    "VIN | SIGNAL_VOLTAGE_SOURCES / PULSE_VOLTAGE | PULSE(0 5 0 1u 1u 0.5m 1m)\nRB | Basic / RESISTOR | 10k\nQ1 | Transistors / BJT_NPN / 2N2222 | NPN\nDLED | Diodes / LED / LED_red | Vf 2.0 V\nRC | Basic / RESISTOR | 1k\nVCC | POWER_SOURCES / DC_POWER | 5 V",
  关键设计计算: "Ib = (5 − 0.7) / 10k ≈ 0.43 mA；Ic(sat) = (5 − 2.0 − 0.2) / 1k ≈ 2.8 mA",
  从输入到输出的信号流向描述: "方波 → RB → Q1 基极；集电极经 LED、RC 上拉到 VCC；发射极接地",
  "输入源→中间元件按流向→电源行放最后": "VIN → RB → Q1 → DLED → RC → VCC",
};

export function PromptGenerator() {
  const [fields, setFields] = useState<PromptFields>(EMPTY_FIELDS);
  const [withSupplement, setWithSupplement] = useState(true);

  const output = useMemo(() => fillTemplate(fields, withSupplement), [fields, withSupplement]);
  const filled = filledCount(fields);
  const missing = remainingPlaceholders(output);
  const total = FIELD_META.length;

  const set = (key: keyof PromptFields, value: string) => setFields((f) => ({ ...f, [key]: value }));

  return (
    <div className="container">
      <h1>提示词生成器</h1>
      <p className="lead">
        填写下面的字段，右侧实时拼出完整的生成提示词。带着 <span className="mono">{`{{占位符}}`}</span>{" "}
        直接发给 AI 也能用（AI 会反问或自行假设），但填得越满，返工越少。
      </p>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => setFields(EXAMPLE)}>载入示例（001 电路）</button>
        <button className="btn" onClick={() => setFields(EMPTY_FIELDS)}>清空</button>
        <label className="small" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginLeft: 6 }}>
          <input type="checkbox" checked={withSupplement} onChange={(e) => setWithSupplement(e.target.checked)} />
          附带「补充要求 A/B/C」
        </label>
        <span className="spacer" />
        <span className={`badge ${filled === total ? "ok" : "warn"}`}>
          已填 {filled}/{total}
        </span>
      </div>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <div>
          {FIELD_META.map(({ key, label, hint, multi }) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <div className="hint">{hint}</div>
              {multi ? (
                <textarea
                  id={key}
                  value={fields[key]}
                  rows={5}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={hint}
                />
              ) : (
                <input
                  id={key}
                  type="text"
                  value={fields[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={hint}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ position: "sticky", top: 76 }}>
          <div className="toolbar" style={{ marginBottom: 8 }}>
            <strong>提示词预览</strong>
            <span className="spacer" />
            {missing.length > 0 ? (
              <span className="badge warn">还剩 {missing.length} 个占位符</span>
            ) : (
              <span className="badge ok">占位符已填满</span>
            )}
          </div>
          <CodeBlock name="prompt.txt" code={output} lang={`${output.length} 字符`} />
          <p className="small muted" style={{ marginTop: 8 }}>
            直接点上方「复制」即可粘贴给任意大模型。想手动改细节？也可以去仓库看原始模板{" "}
            <span className="mono">prompts/circuit-generation-template.md</span>。
          </p>
        </div>
      </div>

      <h2>拿到 7 部分输出之后</h2>
      <ol className="steps">
        <li>把第 1 部分的代码块存成 <span className="mono">circuits/NNN-xxx/NNN-xxx.cir</span>。</li>
        <li>跑 <Link to="/lint">在线检查</Link> 或本地 <span className="mono">python scripts/cir_lint.py</span>，确认 0 error。</li>
        <li>在 Multisim 里 <span className="mono">File → Open</span> 导入，做黑盒替换、摆位、连线。</li>
        <li>跑仿真、用 Grapher 游标读数，把实测值填进 <span className="mono">verification.md</span>，再提 PR。</li>
      </ol>
    </div>
  );
}
