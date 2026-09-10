/**
 * template.ts —— 提示词模板（与 prompts/ 下的 md 同源）
 *
 * v1 = prompts/circuit-generation-template.md      严格 7 部分输出
 * v2 = prompts/circuit-generation-template-v2.md   严格 8 部分输出（多一张 3a 网格坐标表），
 *      新增「网络标签优先 / 信号流单调向右 / 扇出 ≤ 4」等摆放与连线约束
 *
 * 两版占位符完全相同（仍是 12 个），所以字段定义只写一份。
 */

/** v1：严格 7 部分输出 */
export const GENERATION_TEMPLATE = `你是精通 NI Multisim 14.3 的电路仿真工程师，熟悉 SPICE 网表语法及 Multisim 网表导入兼容性。

任务：
设计一个【{{电路名称}}】，输出可直接用 Multisim File → Open 导入的 .cir 网表。
我要用【{{验证仪器}}】验证【{{验证目标}}】。

电路规格：
- 性能指标：{{性能指标}}
- 电源：{{电源规格}}
- 输入：{{输入信号}}
- 负载：{{负载}}
- 有源器件：{{有源器件及型号}}

具体元器件要求（必须使用）：
{{元器件清单：每行一个，含网表标号/Multisim库路径/参数}}

- 计算说明：{{关键设计计算}}
- 信号流向：{{从输入到输出的信号流向描述}}

硬性约束（必须遵守）：
1. 分析指令只允许：.OP / .AC / .TRAN / .DC
2. 禁止：.MEAS .FOUR .NOISE .TF .SENS .STEP .TEMP .MC .PROBE .PLOT .PRINT
3. 黑盒策略：含有源器件时允许 .MODEL，禁止 .SUBCKT
4. 元件值写法：10k / 1k / 5（禁止科学计数法；.MODEL 内参数除外，如 14.34F）
5. 节点名全英文大写；首行标题注释；末行 .END；ANSI 编码
6. 【导入布局优化】Multisim 按元件行出现顺序从左到右摆放元件，元件行必须按
   物理信号流顺序书写：{{输入源→中间元件按流向→电源行放最后}}；
   .MODEL 行放元件行之后、分析指令之前

输出格式（严格按以下 7 部分，顺序不变）：
## 1. 完整 .cir 网表代码（一个代码块，行首 * 中文注释，注明文件名与编码）
## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数）
## 3. ASCII 布局图（信号左到右，电源顶、地底，标旋转角度）
## 4. 导入后整理步骤（黑盒替换/摆位旋转/连线顺序/网络标签/美化）
## 5. 连线表（序号 | 从 | 到 | 是否用网络标签）
## 6. 仪器设置（XFG1/XSC1 端子与面板参数 + Grapher 游标读数法）
## 7. 验证值 + 易错点（理论计算表 + 3 个典型接错方式及读数表现）`;

/** v2：强化导入布局，严格 8 部分输出（多一张 3a 网格坐标表） */
export const GENERATION_TEMPLATE_V2 = `你是精通 NI Multisim 14.3 的电路仿真工程师，熟悉 SPICE 网表语法及 Multisim 网表导入兼容性。

任务：
设计一个【{{电路名称}}】，输出可直接用 Multisim File → Open 导入的 .cir 网表。
我要用【{{验证仪器}}】验证【{{验证目标}}】。

电路规格：
- 性能指标：{{性能指标}}
- 电源：{{电源规格}}
- 输入：{{输入信号}}
- 负载：{{负载}}
- 有源器件：{{有源器件及型号}}

具体元器件要求（必须使用）：
{{元器件清单：每行一个，含网表标号/Multisim库路径/参数}}

- 计算说明：{{关键设计计算}}
- 信号流向：{{从输入到输出的信号流向描述}}

硬性约束（必须遵守）：
1. 分析指令只允许：.OP / .AC / .TRAN / .DC
2. 禁止：.MEAS .FOUR .NOISE .TF .SENS .STEP .TEMP .MC .PROBE .PLOT .PRINT
3. 黑盒策略：含有源器件时允许 .MODEL，禁止 .SUBCKT
4. 元件值写法：10k / 1k / 5（禁止科学计数法；.MODEL 内参数除外，如 14.34F）
5. 节点名全英文大写；首行标题注释；末行 .END；ANSI 编码
6. 【行序 = 信号流】元件行必须按物理信号流顺序书写，一行只写一个元件；
   输入源在最前、电源行（VCC / VDD / VEE）统一放最后；
   .MODEL 行放元件行之后、分析指令之前
7. 【网络标签优先】节点名必须语义化且简短（不超过 6 个字符），
   如 IN / OUT / BASE / COL / EMIT / VCC / THR / DIS / CTRL / RESET；
   禁止使用 N1、N2、A、B、NET01 这类无意义名字。
   两个在图上相距超过 2 格的元件之间，一律用「取同一个节点名」来连接
   （导入后等同于打了网络标签），不允许画跨越图面的长飞线
8. 【信号流单调向右】每个元件的输入节点，必须来自它左侧（更早出现）的元件或信号源。
   不允许出现「第 i 行元件的输出，被送回第 j<i 行元件的输入端」这类回流 / 回绕连线。
   确有反馈需求的（如运放反馈、振荡器正反馈），请在第 3b 节 ASCII 图与第 5 节连线表里
   显式标注「反馈支路」，并说明它在图上走最下方一行
9. 【扇出限制】单个节点建议不超过 4 个元件引脚（含芯片引脚）。
   超过 4 个必须拆成两个节点名（中间用 0 欧电阻或直接导线相连），否则导入后飞线必然交叉。
   注意：分压偏置电路的基极节点天然有 4 个连接（上偏置 / 下偏置 / 耦合电容 / 管子基极），
   属正常情况，可在第 3a 节用「同列垂直对齐」来避免交叉
10. 【电源与地统一】所有 VCC / VDD / VEE 行集中在元件行最后；
    地一律用节点 0；全网只能有一个地网络，禁止出现 VSS2、GND2 之类的第二地

输出格式（严格按以下 8 部分，顺序不变）：
## 1. 完整 .cir 网表代码（一个代码块，注明文件名与编码）
## 2. 元件清单表（网表标号 | Multisim 库路径 | 参数 | 所在列）
## 3a. 网格坐标表（标号 | 列 x | 行 y | 旋转角度 | 摆放说明）
## 3b. ASCII 布局图（严格按 3a 的坐标绘制；信号左到右，电源顶、地底）
## 4. 导入后整理步骤（黑盒替换 / 按 3a 坐标摆位旋转 / 打网络标签 / 连线）
## 5. 连线表（序号 | 从 | 到 | 是否用网络标签 | 建议走线方向）
## 6. 仪器设置（XFG1 / XSC1 / XBP1 端子与面板参数 + Grapher 游标读数法）
## 7. 验证值 + 易错点（理论计算表 + 3 个典型接错方式的读数表现
     + 1 条「位置错乱 / 连线交叉」的自查与修正步骤）`;

export const SUPPLEMENT = `补充要求：
A. .cir 文件内所有注释使用英文（Multisim 导入器对非 ASCII 字符敏感，
   中文说明请放在第 2/3/4/5/6/7 部分，不要写进网表）。
B. 每行长度不超过 132 字符，超长用 + 续行。
C. 输出第 7 部分时，理论值必须能用网表里的元件值手算复现，
   并额外给出「这 3 个数如果测出来偏了，最可能是哪里接错」。`;

export const SUPPLEMENT_V2 = `补充要求：
A. .cir 文件内所有注释使用英文（Multisim 导入器对非 ASCII 字符敏感），
   中文说明请放在第 2~7 部分，不要写进网表。
B. 每行长度不超过 132 字符，超长用 + 续行。
C. 输出第 7 部分时，理论值必须能用网表里的元件值手算复现，
   并额外给出「这 3 个数如果测出来偏了，最可能是哪里接错」。
D. 第 3a 网格坐标表按 Multisim 默认栅格（0.1 inch = 1 格）给出相对坐标：
   列 x 从 0 开始向右递增，行 y 从 0 开始向下递增；旋转角度只能取 0 / 90 / 180 / 270。
   规则：主信号链上的所有元件 y 必须相同（排在同一行）；
   电源与去耦电容放在 y 更小的上方；地回路放在 y 更大的下方。
E. 第 5 部分「建议走线方向」只能填以下四种之一：
   短直线 / 先横后竖 / 先竖后横 / 网络标签（免走线）。
   出现斜线或需要跨越其它元件的长线即为不合格，必须改用网络标签。`;

export type TemplateVersion = "v1" | "v2";

export const TEMPLATE_META: Record<
  TemplateVersion,
  { label: string; template: string; supplement: string; outputs: string; desc: string }
> = {
  v1: {
    label: "v1 · 经典 7 部分",
    template: GENERATION_TEMPLATE,
    supplement: SUPPLEMENT,
    outputs: "7 部分",
    desc: "只有一条「元件行序 = 信号流」约束。现有 3 个种子电路用的就是它。",
  },
  v2: {
    label: "v2 · 强化摆放（推荐）",
    template: GENERATION_TEMPLATE_V2,
    supplement: SUPPLEMENT_V2,
    outputs: "8 部分",
    desc: "新增网络标签优先、信号流单调向右、扇出 ≤ 4，并多一张 3a 网格坐标表，导入后照表摆位即可。",
  },
};

export type PromptFields = {
  电路名称: string;
  验证仪器: string;
  验证目标: string;
  性能指标: string;
  电源规格: string;
  输入信号: string;
  负载: string;
  有源器件及型号: string;
  "元器件清单：每行一个，含网表标号/Multisim库路径/参数": string;
  关键设计计算: string;
  从输入到输出的信号流向描述: string;
  "输入源→中间元件按流向→电源行放最后": string;
};

export const FIELD_KEYS: (keyof PromptFields)[] = [
  "电路名称",
  "验证仪器",
  "验证目标",
  "性能指标",
  "电源规格",
  "输入信号",
  "负载",
  "有源器件及型号",
  "元器件清单：每行一个，含网表标号/Multisim库路径/参数",
  "关键设计计算",
  "从输入到输出的信号流向描述",
  "输入源→中间元件按流向→电源行放最后",
];

export const EMPTY_FIELDS: PromptFields = {
  电路名称: "",
  验证仪器: "",
  验证目标: "",
  性能指标: "",
  电源规格: "",
  输入信号: "",
  负载: "",
  有源器件及型号: "",
  "元器件清单：每行一个，含网表标号/Multisim库路径/参数": "",
  关键设计计算: "",
  从输入到输出的信号流向描述: "",
  "输入源→中间元件按流向→电源行放最后": "",
};

/** 每个字段的短标签 + 示例提示（鼠标悬停/placeholder 用） */
export const FIELD_META: { key: keyof PromptFields; label: string; hint: string; multi?: boolean }[] = [
  { key: "电路名称", label: "电路名称", hint: "2N2222 开关驱动红 LED" },
  { key: "验证仪器", label: "验证仪器", hint: "XFG1 函数发生器 + XSC1 示波器" },
  { key: "验证目标", label: "验证目标", hint: "1 kHz 方波下饱和，Vce ≈ 0.2 V，LED 电流约 2.8 mA" },
  { key: "性能指标", label: "性能指标", hint: "Ic(sat) ≈ 2.8 mA；Ib ≈ 0.43 mA；Vce(sat) ≈ 0.2 V；强制 β ≈ 6.5" },
  { key: "电源规格", label: "电源规格", hint: "VCC = 5 V DC，负端接地" },
  { key: "输入信号", label: "输入信号", hint: "0–5 V 方波，1 kHz，占空比 50%，Tr = Tf = 1 us" },
  { key: "负载", label: "负载", hint: "红色 LED（Vf ≈ 2.0 V）+ 1k 集电极电阻到 VCC" },
  { key: "有源器件及型号", label: "有源器件及型号", hint: "Q1 = 2N2222（NPN，β ≈ 200）；DLED = LED_red" },
  {
    key: "元器件清单：每行一个，含网表标号/Multisim库路径/参数",
    label: "元器件清单（每行一个：标号 / 库路径 / 参数）",
    hint: "VIN | PULSE_VOLTAGE | PULSE(0 5 0 1u 1u 0.5m 1m)\nRB | RESISTOR | 10k",
    multi: true,
  },
  { key: "关键设计计算", label: "关键设计计算", hint: "Ib = (5 − 0.7) / 10k ≈ 0.43 mA" },
  { key: "从输入到输出的信号流向描述", label: "信号流向描述", hint: "方波 → RB → 基极；集电极经 LED、RC 上拉到 VCC" },
  {
    key: "输入源→中间元件按流向→电源行放最后",
    label: "元件行排列顺序（信号流）",
    hint: "VIN → RB → Q1 → DLED → RC → VCC",
  },
];

export function fillTemplate(
  fields: PromptFields,
  version: TemplateVersion = "v1",
  withSupplement = true,
): string {
  const meta = TEMPLATE_META[version];
  let out = meta.template;
  for (const key of FIELD_KEYS) {
    const value = fields[key];
    out = out.split(`{{${key}}}`).join(value || `{{${key}}}`);
  }
  if (withSupplement) out += "\n\n" + meta.supplement;
  return out;
}

export function remainingPlaceholders(text: string): string[] {
  const found = text.match(/\{\{[^}]+\}\}/g) ?? [];
  return [...new Set(found)];
}

export function filledCount(fields: PromptFields): number {
  return FIELD_KEYS.filter((k) => fields[k].trim().length > 0).length;
}
