import { useState, type ReactNode } from "react";

type Props = {
  /** 右上角显示的文件名/标签 */
  name?: string;
  /** 代码内容 */
  code: string;
  /** 语言标签，仅展示用 */
  lang?: string;
  /** 是否为 ASCII 图（浅色皮肤） */
  ascii?: boolean;
  children?: ReactNode;
};

/** 带标题栏与复制按钮的代码块 */
export function CodeBlock({ name = "netlist", code, lang = "spice", ascii = false, children }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // 剪贴板不可用（非 https / 权限被拒）时退化为选中提示
      setCopied(false);
    }
  };

  return (
    <div className="code-wrap">
      <div className="code-head" style={ascii ? { background: "#e2e8f0", color: "#334155" } : undefined}>
        <span className="dot" />
        <span className="name">{name}</span>
        <span className="spacer" />
        <span style={{ opacity: 0.7 }}>{lang}</span>
        <button
          type="button"
          onClick={copy}
          style={ascii ? { background: "#f1f5f9", color: "#334155", borderColor: "#cbd5e1" } : undefined}
        >
          {copied ? "已复制 ✓" : "复制"}
        </button>
      </div>
      <pre className={ascii ? "code ascii" : "code"}>{code}</pre>
      {children}
    </div>
  );
}
