/**
 * cir-lint.ts —— cir_lint.py 的浏览器端 TypeScript 移植
 *
 * 规则与 Python 版保持一致（v1.1），可在网页里离线跑，无需后端：
 *   E-ENC001 非 ASCII 字符（Multisim 导入器对非 ASCII 敏感）
 *   E-ENC002 UTF-8 BOM
 *   E-TITLE1 首行必须是 * 开头的标题注释
 *   E-END001 末行必须是 .END
 *   E-END002 .END 只能出现在最后一行
 *   E-DOT001 指令不在白名单 .OP/.AC/.TRAN/.DC/.MODEL/.END 内
 *   E-DOT002 命中黑名单指令
 *   E-NODE1  节点名必须匹配 ^[A-Z][A-Z0-9_]*$ 或为 0
 *   E-SCI1   元件行的值字段禁止科学计数法
 *   W-ORDER1 元件行顺序与声明的信号流不一致（需传入 signalFlow）
 *   W-FLOAT1 非地节点只出现 1 次，疑似悬空
 *   W-LEN01  单行超过 132 字符
 *   W-NAME1  元件名建议全大写
 *   W-MISC1  无法识别的行
 *   W-FANOUT1 单节点出现 >= 5 次，导入后飞线易交叉
 *   I-SPAN1   单个网络横跨 >= 4 个元件位，会拉出跨图长线
 *
 * 级别说明：error 必须修；warn 在 --strict 下计入失败；
 * info 纯排版提示，任何模式下都不影响通过与否（与 Python 版一致）。
 *
 * 解析前提：先剥行内注释（; 与 $），再剥括号内容（PULSE(...)/SIN(...)），
 * 最后合并 "+" 续行 —— 与 Python 版逐条对齐。
 */

export type LintLevel = "error" | "warn" | "info";

export type LintFinding = {
  level: LintLevel;
  code: string;
  /** 1 起的行号；null 表示文件级 */
  line: number | null;
  message: string;
};

export type LintReport = {
  findings: LintFinding[];
  errors: number;
  warns: number;
  infos: number;
  pass: boolean;
  nElements: number;
  nLines: number;
};

const ALLOWED_DOT = new Set([".OP", ".AC", ".TRAN", ".DC", ".MODEL", ".END"]);

const BANNED_DOT: Record<string, string> = {
  ".MEAS": "改用 Grapher 游标人工读数",
  ".MEASURE": "改用 Grapher 游标人工读数",
  ".FOUR": "该指令 Multisim 导入器不支持，请移除",
  ".NOISE": "该指令 Multisim 导入器不支持，请移除",
  ".TF": "该指令 Multisim 导入器不支持，请移除",
  ".SENS": "该指令 Multisim 导入器不支持，请移除",
  ".STEP": "改用 Multisim UI 的 Parameter Sweep（Device parameter + List）",
  ".TEMP": "该指令 Multisim 导入器不支持，请移除",
  ".MC": "该指令 Multisim 导入器不支持，请移除",
  ".PROBE": "该指令 Multisim 导入器不支持，请移除",
  ".PLOT": "该指令 Multisim 导入器不支持，请移除",
  ".PRINT": "该指令 Multisim 导入器不支持，请移除",
  ".SUBCKT": "黑盒策略禁止子电路；改为在 Multisim 里放真实库件",
  ".ENDS": "黑盒策略禁止子电路",
  ".INCLUDE": "禁止外部文件引用，把所有内容写进单个 .cir",
  ".LIB": "禁止外部文件引用，把所有内容写进单个 .cir",
  ".PARAM": "把参数直接算成数值写死，不要在网表里用变量",
  ".OPTIONS": "分析选项在 Multisim UI 里设置，不要写进网表",
  ".WIDTH": "该指令 Multisim 导入器不支持，请移除",
  ".NODESET": "该指令 Multisim 导入器不支持，请移除",
  ".IC": "该指令 Multisim 导入器不支持，请移除",
  ".GLOBAL": "该指令 Multisim 导入器不支持，请移除",
  ".FUNC": "该指令 Multisim 导入器不支持，请移除",
};

const ELEMENT_FIRST = new Set(["R", "L", "C", "V", "D", "Q", "X"]);
/** 电源网络名：横跨很远属正常，不参与 W-FANOUT1 / I-SPAN1 */
const POWER_NETS = new Set(["VCC", "VDD", "VEE", "VSS", "VBB", "VPP", "VTT", "GND"]);
const NODE_RE = /^(0|[A-Z][A-Z0-9_]*)$/;
const SCI_TOKEN_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)[eE][+-]?\d+$/;
const NAME_RE = /^[A-Za-z][A-Za-z0-9_]*/;
const MAX_LINE_LEN = 132;

type LogicalLine = { line: number; text: string };

/** 剥离 SPICE 行内注释（; 与 $ 起）。 */
export function stripInlineComment(line: string): string {
  let cut = line.length;
  for (const sep of [";", "$"]) {
    const idx = line.indexOf(sep);
    if (idx !== -1) cut = Math.min(cut, idx);
  }
  return line.slice(0, cut);
}

/** 去掉括号及其内部内容（替换为单空格）。 */
export function stripParentheses(s: string): string {
  let out = "";
  let depth = 0;
  for (const ch of s) {
    if (ch === "(") {
      depth += 1;
      if (depth === 1) out += " ";
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) out += ch;
  }
  return out;
}

/** 元件行 -> token（先剥注释，再剥括号，最后按空白切分）。 */
export function elementTokens(line: string): string[] {
  const body = stripParentheses(stripInlineComment(line)).trim();
  return body ? body.split(/\s+/) : [];
}

export function elementName(line: string): string {
  return elementTokens(line)[0] ?? "";
}

function nodesOf(prefix: string, tokens: string[]): string[] {
  const p = prefix.toUpperCase();
  if ("RLCVD".includes(p)) return tokens.slice(1, 3);
  if ("QMJ".includes(p)) return tokens.slice(1, 4);
  if (p === "X") return tokens.length >= 2 ? tokens.slice(1, -1) : [];
  return tokens.slice(1, 3);
}

function valueTokensOf(prefix: string, tokens: string[]): string[] {
  const p = prefix.toUpperCase();
  const rest = tokens.slice(1);
  if ("QXJM".includes(p)) return rest.length ? rest.slice(-1) : [];
  return rest.slice(2);
}

/** 合并 "+" 续行，返回 (行号, 内容)。空行会被丢弃。 */
function logicalLines(text: string): LogicalLine[] {
  const out: LogicalLine[] = [];
  let pending: LogicalLine | null = null;
  const physical = text.split(/\r?\n/);
  for (let i = 0; i < physical.length; i++) {
    const stripped = physical[i]!.trim();
    if (!stripped) continue;
    if (stripped.startsWith("+") && pending) {
      pending = { line: pending.line, text: pending.text + " " + stripped.slice(1).trim() };
      continue;
    }
    if (pending) out.push(pending);
    pending = { line: i + 1, text: stripped };
  }
  if (pending) out.push(pending);
  return out;
}

function checkDirective(code: string, lineno: number, idx: number, total: number, add: Add): void {
  const token = code.split(/\s+/)[0]!.toUpperCase().replace(/\($/, "");
  if (token in BANNED_DOT) {
    add("error", "E-DOT002", lineno, `黑名单指令 ${token}；${BANNED_DOT[token]}`);
    return;
  }
  if (!ALLOWED_DOT.has(token)) {
    add("error", "E-DOT001", lineno, `指令 ${token} 不在白名单 .OP/.AC/.TRAN/.DC/.MODEL/.END 内`);
    return;
  }
  if (token === ".END" && idx !== total - 1) {
    add("error", "E-END002", lineno, ".END 只能出现在文件最后一行，其后不得再有元件/指令行");
  }
}

type Add = (level: LintLevel, code: string, line: number | null, message: string) => void;

export function lintCir(text: string, signalFlow?: string[]): LintReport {
  const findings: LintFinding[] = [];
  const add: Add = (level, code, line, message) => findings.push({ level, code, line, message });

  // 编码检查（在剥离 BOM 之前先看原始字节）
  if (text.startsWith("\uFEFF")) {
    add("error", "E-ENC002", null, "文件带 UTF-8 BOM，Multisim 导入器会把它当成首行内容；请另存为 ANSI（或 UTF-8 无 BOM）");
  }
  const body = text.replace(/^\uFEFF/, "");
  const nonAscii = body
    .split(/\r?\n/)
    .map((ln, i) => ({ i: i + 1, bad: /[^\x00-\x7F]/.test(ln) }))
    .filter((r) => r.bad)
    .map((r) => r.i);
  if (nonAscii.length) {
    const shown = nonAscii.slice(0, 10).join(", ");
    const more = nonAscii.length > 10 ? " ..." : "";
    add(
      "error",
      "E-ENC001",
      nonAscii[0] ?? null,
      `文件含 ${nonAscii.length} 行非 ASCII 字符（行号：${shown}${more}）；Multisim 网表导入器对非 ASCII 敏感，注释请全部改用英文`,
    );
  }

  const lines = logicalLines(body);
  if (!lines.length) {
    add("error", "E-TITLE1", null, "文件为空");
    return finalize(findings, 0);
  }

  if (!lines[0]!.text.startsWith("*")) {
    add("error", "E-TITLE1", lines[0]!.line, `首行必须是 * 开头的标题注释，实际为：${JSON.stringify(lines[0]!.text.slice(0, 40))}`);
  }

  const last = lines[lines.length - 1]!;
  if (!last.text.toUpperCase().startsWith(".END")) {
    add("error", "E-END001", last.line, `末行必须是 .END，实际为：${JSON.stringify(last.text.slice(0, 40))}`);
  }

  const nodeCount = new Map<string, number>();
  const elementOrder: string[] = [];
  // 记录每个元件行的 (名称, 节点列表, 行号)，供 W-FANOUT1 / I-SPAN1 使用
  const elementSeq: { name: string; nodes: string[]; line: number }[] = [];
  let nElements = 0;

  lines.forEach((content, idx) => {
    const lineno = content.line;
    if (content.text.length > MAX_LINE_LEN) {
      add("warn", "W-LEN01", lineno, `该行 ${content.text.length} 字符，超过 ${MAX_LINE_LEN}；请用 '+' 续行`);
    }

    const code = stripInlineComment(content.text).trim();
    if (!code) return;
    if (code.startsWith("*")) return;

    if (code.startsWith(".")) {
      checkDirective(code, lineno, idx, lines.length, add);
      return;
    }

    const m = NAME_RE.exec(code);
    if (!m) {
      add("warn", "W-MISC1", lineno, `无法识别的行：${JSON.stringify(code.slice(0, 40))}`);
      return;
    }
    const name = m[0]!;
    if (!ELEMENT_FIRST.has(name[0]!.toUpperCase())) {
      add("warn", "W-MISC1", lineno, `首字母 ${JSON.stringify(name[0])} 不在受检元件集合 RLCVDQX 内，已跳过：${JSON.stringify(code.slice(0, 40))}`);
      return;
    }

    const tokens = elementTokens(content.text);
    if (name !== name.toUpperCase()) {
      add("warn", "W-NAME1", lineno, `元件名 ${JSON.stringify(name)} 建议全大写（写成 ${JSON.stringify(name.toUpperCase())}）`);
    }
    if (tokens.length < 3) {
      add("error", "E-NODE1", lineno, `元件行 ${JSON.stringify(name)} 字段不足（至少需要 名称 + 2 个节点 + 值）`);
      return;
    }

    elementOrder.push(name.toUpperCase());
    elementSeq.push({ name: name.toUpperCase(), nodes: nodesOf(name[0]!, tokens), line: lineno });
    nElements += 1;

    for (const node of nodesOf(name[0]!, tokens)) {
      if (node === "0") continue;
      if (!NODE_RE.test(node)) {
        add("error", "E-NODE1", lineno, `节点名 ${JSON.stringify(node)} 不合法：必须匹配 ^[A-Z][A-Z0-9_]*$（全英文大写，可用下划线），或为 0（地）`);
      } else {
        nodeCount.set(node, (nodeCount.get(node) ?? 0) + 1);
      }
    }

    for (const val of valueTokensOf(name[0]!, tokens)) {
      if (SCI_TOKEN_RE.test(val)) {
        add("error", "E-SCI1", lineno, `元件 ${JSON.stringify(name)} 的值字段出现科学计数法 ${JSON.stringify(val)}；请改写成 SPICE 后缀形式（1e-3 -> 1m，1e-6 -> 1u，1e-9 -> 1n，1e-12 -> 1p，1e6 -> 1MEG）`);
      }
    }
  });

  // 悬空节点
  for (const [node, cnt] of [...nodeCount.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (cnt < 2) {
      add("warn", "W-FLOAT1", null, `节点 ${JSON.stringify(node)} 只出现 ${cnt} 次，疑似悬空（每个节点至少需要 2 个引脚）`);
    }
  }

  // W-FANOUT1：单节点出现 >= 5 次（阈值取 5：分压偏置的基极节点天然 4 个连接）
  for (const [node, cnt] of [...nodeCount.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (POWER_NETS.has(node)) continue;
    if (cnt >= 5) {
      add(
        "warn",
        "W-FANOUT1",
        null,
        `节点 ${JSON.stringify(node)} 共出现 ${cnt} 次，扇出过大；导入后以它为中心会拉出 ${cnt} 条飞线，极易交叉。建议拆成两个节点名（中间用 0 欧电阻或直接导线相连），或改用网络标签集中放置`,
      );
    }
  }

  // I-SPAN1：单网络横跨 >= 4 个元件位（info 级别，正常电路也会命中，不判失败）
  const spanOf = new Map<string, [number, number]>();
  elementSeq.forEach((el, k) => {
    for (const nd of el.nodes) {
      if (nd === "0" || POWER_NETS.has(nd)) continue;
      const cur = spanOf.get(nd);
      spanOf.set(nd, cur ? [Math.min(cur[0], k), Math.max(cur[1], k)] : [k, k]);
    }
  });
  for (const [node, [lo, hi]] of [...spanOf.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const span = hi - lo;
    if (span >= 4) {
      add(
        "info",
        "I-SPAN1",
        elementSeq[hi]?.line ?? null,
        `网络 ${JSON.stringify(node)} 从第 ${lo + 1} 个元件跨到第 ${hi + 1} 个元件（跨 ${span} 位）；导入后它会拉出一条横穿图面的长线。建议把这些元件排成同列，或改用网络标签`,
      );
    }
  }

  // 行序 vs 声明的信号流
  if (signalFlow && signalFlow.length) {
    const declared = signalFlow.map((s) => s.trim().toUpperCase()).filter(Boolean);
    const declaredSet = new Set(declared);
    const actual = elementOrder.filter((n) => declaredSet.has(n));
    if (actual.join(",") !== declared.join(",")) {
      add(
        "warn",
        "W-ORDER1",
        null,
        `元件行顺序与声明的信号流不一致。声明：${declared.join(" -> ")}；实际：${actual.join(" -> ")}。Multisim 按元件行出现顺序从左到右摆放元件`,
      );
    }
  }

  return finalize(findings, nElements);
}

function finalize(findings: LintFinding[], nElements: number): LintReport {
  const errors = findings.filter((f) => f.level === "error").length;
  const warns = findings.filter((f) => f.level === "warn").length;
  const infos = findings.filter((f) => f.level === "info").length;
  return { findings, errors, warns, infos, pass: errors === 0, nElements, nLines: 0 };
}
