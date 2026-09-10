/**
 * template.ts —— 与 prompts/circuit-generation-template.md 同源
 * 网页端提示词生成器用它把 {{占位符}} 填成用户输入。
 */

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

export const SUPPLEMENT = `补充要求：
A. .cir 文件内所有注释使用英文（Multisim 导入器对非 ASCII 字符敏感，
   中文说明请放在第 2/3/4/5/6/7 部分，不要写进网表）。
B. 每行长度不超过 132 字符，超长用 + 续行。
C. 输出第 7 部分时，理论值必须能用网表里的元件值手算复现，
   并额外给出「这 3 个数如果测出来偏了，最可能是哪里接错」。`;

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
  { key: "验证目标", label: "验证目标", hint: "1 kHz 方波下饱和，Vce ≈ 0.2 V，LED 电流约 3 mA" },
  { key: "性能指标", label: "性能指标", hint: "Ic ≈ 3 mA；Ib ≈ 0.43 mA；Vce(sat) ≈ 0.2 V" },
  { key: "电源规格", label: "电源规格", hint: "VCC = 5 V DC，负端接地" },
  { key: "输入信号", label: "输入信号", hint: "0–5 V 方波，1 kHz，占空比 50%，Tr = Tf = 1 us" },
  { key: "负载", label: "负载", hint: "红 LED + 1k 集电极电阻到 VCC" },
  { key: "有源器件及型号", label: "有源器件及型号", hint: "Q1 = 2N2222；DLED = LED_red" },
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

export function fillTemplate(fields: PromptFields, withSupplement = true): string {
  let out = GENERATION_TEMPLATE;
  for (const key of FIELD_KEYS) {
    const value = fields[key];
    out = out.split(`{{${key}}}`).join(value || `{{${key}}}`);
  }
  if (withSupplement) out += "\n\n" + SUPPLEMENT;
  return out;
}

export function remainingPlaceholders(text: string): string[] {
  const found = text.match(/\{\{[^}]+\}\}/g) ?? [];
  return [...new Set(found)];
}

export function filledCount(fields: PromptFields): number {
  return FIELD_KEYS.filter((k) => fields[k].trim().length > 0).length;
}
