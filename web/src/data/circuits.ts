/**
 * circuits.ts —— 种子电路数据（与仓库 circuits/ 目录同源）
 *
 * 注意：这里的 .cir 内容与仓库里的文件保持逐字一致。
 * 若修改了 circuits/ 下的 .cir，请同步更新本文件；
 * 运行 python scripts/check_web_data.py 可校验两者是否一致。
 */

export type Difficulty = "入门" | "进阶" | "挑战";
export type VerifyStatus = "待验证" | "已验证" | "验证失败";

export type PartRow = { ref: string; path: string; params: string; note?: string };
export type WireRow = { n: number; from: string; to: string; net?: string };
export type TheoryRow = { param: string; formula: string; value: string; unit?: string };
export type Pitfall = { title: string; effect: string };
export type InstrumentRow = { name: string; terminals: string; panel: string };
/** v2 的 3a 网格坐标表：Multisim 默认栅格 0.1 inch = 1 格，相对坐标 */
export type GridRow = { ref: string; x: number; y: number; rot: string; note: string };

export type Circuit = {
  slug: string;
  id: string;
  name: string;
  nameEn: string;
  difficulty: Difficulty;
  status: VerifyStatus;
  summary: string;
  signalFlow: string[];
  instruments: string;
  filename: string;
  cir: string;
  parts: PartRow[];
  /** 3a 网格坐标表（v2 格式）。连线表的「建议走线方向」以 README 为准，不在网页重复。 */
  grid: GridRow[];
  ascii: string;
  importSteps: string[];
  wires: WireRow[];
  instrumentsSetup: InstrumentRow[];
  grapher: string[];
  theory: TheoryRow[];
  pitfalls: Pitfall[];
  notes: string;
};

const CIR_001 = `* 001-BJT-SWITCH-LED: 2N2222 SATURATED SWITCH DRIVING A RED LED, ANSI, MULTISIM 14.3
* FILE: 001-bjt-switch-led.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> RB -> Q1 -> DLED -> RC -> VCC
* ELEMENT LINES ARE WRITTEN IN SIGNAL-FLOW ORDER SO MULTISIM PLACES
* COMPONENTS LEFT TO RIGHT ALONG THE SIGNAL PATH.
VIN IN 0 PULSE(0 5 0 1u 1u 0.5m 1m)
RB IN BASE 10k
Q1 COL BASE 0 2N2222
DLED COL DLEDN LED_RED
RC DLEDN VCC 1k
VCC VCC 0 5
.MODEL 2N2222 NPN(IS=1E-14 BF=200 VAF=100 IKF=0.3 BR=3 RB=10 RC=0.3 RE=0.2
+ TF=400E-12 TR=100E-9 CJE=25E-12 CJC=8E-12)
.MODEL LED_RED D(IS=1E-21 N=1.8 RS=2.5 BV=5 IBV=10u CJO=50p TT=5u)
.OP
.TRAN 1u 3m 0 1u
.END
`;

const CIR_002 = `* 002-COMMON-EMITTER-AMP: 2N2222 VOLTAGE-DIVIDER BIAS CE AMPLIFIER, ANSI, MULTISIM 14.3
* FILE: 002-common-emitter-amp.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: VIN -> C1 -> R1 -> R2 -> Q1 -> RC -> RE1 -> RE2 -> CE -> C2 -> RL -> VCC
* RE2 IS BYPASSED BY CE SO THE AC GAIN IS SET BY RC / (RE1 + re)
VIN IN 0 AC 10m SIN(0 10m 1k)
C1 IN BASE 10u
R1 VCC BASE 47k
R2 BASE 0 8.2k
Q1 COL BASE EMIT 2N2222
RC VCC COL 4.7k
RE1 EMIT EMIT2 100
RE2 EMIT2 0 900
CE EMIT2 0 100u
C2 COL OUT 10u
RL OUT 0 10k
VCC VCC 0 12
.MODEL 2N2222 NPN(IS=1E-14 BF=200 VAF=100 IKF=0.3 BR=3 RB=10 RC=0.3 RE=0.2
+ TF=400E-12 TR=100E-9 CJE=25E-12 CJC=8E-12)
.OP
.AC DEC 10 10 1MEG
.TRAN 10u 5m 0 1u
.END
`;

const CIR_003 = `* 003-555-ASTABLE: NE555 ASTABLE MULTIVIBRATOR, ABOUT 1 KHZ SQUARE WAVE, ANSI
* FILE: 003-555-astable.cir    ENCODING: ANSI (7-BIT ASCII)
* SIGNAL FLOW: RA -> RB -> CT -> CC -> RPU -> XU1 -> RL -> VCC
* XU1 IS A BLACK BOX: PIN ORDER IS 1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC
* REPLACE IT WITH THE MULTISIM LIBRARY PART (MIXED / TIMER / LM555CN) AFTER IMPORT.
* THERE IS NO .MODEL LINE ON PURPOSE: NO .SUBCKT IS ALLOWED, SO THE INTERNAL
* CIRCUIT OF THE 555 CANNOT BE DESCRIBED HERE.
RA VCC DIS 8.2k
RB DIS THR 68k
CT THR 0 10n
CC CTRL 0 10n
RPU VCC RESET 10k
XU1 0 THR OUT RESET CTRL THR DIS VCC NE555
RL OUT 0 10k
VCC VCC 0 5
.TRAN 1u 10m 0 1u
.END
`;

export const circuits: Circuit[] = [
  {
    slug: "001-bjt-switch-led",
    id: "001",
    name: "BJT 开关驱动 LED",
    nameEn: "2N2222 saturated switch + LED_red",
    difficulty: "入门",
    status: "待验证",
    summary: "2N2222 饱和开关驱动红色 LED，验证 Ib/Ic/Vce(sat) 与开关波形",
    signalFlow: ["VIN", "RB", "Q1", "DLED", "RC", "VCC"],
    instruments: "XFG1 · XSC1",
    filename: "001-bjt-switch-led.cir",
    cir: CIR_001,
    notes:
      "元件行序 VIN -> RB -> Q1 -> DLED -> RC -> VCC，即 Multisim 导入后从左到右的摆放顺序。Q1 与 DLED 为黑盒，导入后需替换成库件 2N2222 / LED_red。",
    parts: [
      { ref: "VIN", path: "Sources / SIGNAL_VOLTAGE_SOURCES / PULSE_VOLTAGE", params: "PULSE(0 5 0 1u 1u 0.5m 1m)", note: "0→5 V，1 kHz。不稳时改用 CLOCK_VOLTAGE" },
      { ref: "RB", path: "Basic / RESISTOR", params: "10k", note: "基极限流，Ib ≈ 0.43 mA" },
      { ref: "Q1", path: "Transistors / BJT_NPN / 2N2222", params: "NPN，β ≈ 200", note: "TO-92 引脚 E-B-C" },
      { ref: "DLED", path: "Diodes / LED / LED_red", params: "Vf ≈ 2.0 V", note: "有极性，阴极朝 Q1 集电极" },
      { ref: "RC", path: "Basic / RESISTOR", params: "1k", note: "集电极限流，Ic(sat) ≈ 2.8 mA" },
      { ref: "VCC", path: "Sources / POWER_SOURCES / DC_POWER", params: "5 V", note: "网络名 VCC" },
      { ref: "GND", path: "Sources / POWER_SOURCES / GROUND", params: "—", note: "必须放，否则报 floating node" },
    ],
    grid: [
      { ref: "VIN", x: 0, y: 3, rot: "0°", note: "最左，脉冲信号源" },
      { ref: "RB", x: 4, y: 3, rot: "0°", note: "与 VIN 同行（主信号链）" },
      { ref: "Q1", x: 9, y: 3, rot: "0°", note: "TO-92，E 下 / B 中 / C 上" },
      { ref: "DLED", x: 9, y: 2, rot: "90°", note: "Q1 正上方，阴极朝上（朝 RC）" },
      { ref: "RC", x: 9, y: 1, rot: "90°", note: "再往上一格" },
      { ref: "VCC", x: 9, y: 0, rot: "0°", note: "顶部电源符号，正对 RC 上端" },
      { ref: "GND", x: 9, y: 5, rot: "0°", note: "底部地符号（VIN 负端与 Q1 发射极共用）" },
    ],
    ascii: `                    +5 V (VCC)
                        |
                   RC 1k  (90° 竖放)
                        |
                    DLEDN
                        |
                 DLED LED_red (90° 竖放, 阴极朝下)
                        |
                      COL
                        |
   VIN                  C ———+
  [PULSE]—[ RB 10k ]—+— BASE  |   Q1 2N2222 (0°)
    |              (0°)     B—|/  引脚左起 E-B-C
    |                          |\\ 
    |                            | E
    |                            |
   GND o—————————————————————————+———— GND`,
    importSteps: [
      "删掉 .MODEL 2N2222 生成的空壳三极管，从 Transistors / BJT_NPN / 2N2222 重新放置，按连线表接回。",
      "同理把 .MODEL LED_RED 的二极管换成 Diodes / LED / LED_red。",
      "按 ASCII 图摆位：RC、DLED 竖放 90°（Ctrl+R），Q1 保持 0°。",
      "连线顺序：① VIN(+) → RB → Q1(B)；② VCC → RC → DLED(阴极) → DLED(阳极) → Q1(C)；③ Q1(E) → GND；④ VIN(-) → GND。",
      "给 VCC / IN / COL 加网络标签（Place → Net），VCC 直接用 Sources / POWER_SOURCES / VCC 符号。",
    ],
    wires: [
      { n: 1, from: "XFG1 + / VIN 正端", to: "RB 左端", net: "IN" },
      { n: 2, from: "RB 右端", to: "Q1 基极 (B)", net: "BASE" },
      { n: 3, from: "VCC (+5 V)", to: "RC 上端", net: "VCC" },
      { n: 4, from: "RC 下端", to: "DLED 阴极（横杠侧）", net: "DLEDN" },
      { n: 5, from: "DLED 阳极（三角侧）", to: "Q1 集电极 (C)", net: "COL" },
      { n: 6, from: "Q1 发射极 (E)", to: "GND" },
      { n: 7, from: "VIN 负端 / XFG1 -", to: "GND" },
      { n: 8, from: "XSC1 CH A +", to: "IN", net: "IN" },
      { n: 9, from: "XSC1 CH B +", to: "COL", net: "COL" },
      { n: 10, from: "XSC1 CH A- / CH B-", to: "GND" },
    ],
    instrumentsSetup: [
      { name: "XFG1", terminals: "+ → IN，COM → GND", panel: "Square · 1 kHz · Duty 50 % · Amplitude 2.5 Vp · Offset 2.5 V（得到 0–5 V）" },
      { name: "XSC1 CH A", terminals: "CH A + → IN，- → GND", panel: "2 V/Div，DC 耦合" },
      { name: "XSC1 CH B", terminals: "CH B + → COL，- → GND", panel: "1 V/Div，DC 耦合，读 Vce(sat)" },
    ],
    grapher: [
      "Transient Analysis：End time 3 ms、Maximum time step 1 us，Output 加 V(IN)、V(COL)、I(Q1[IB])、I(Q1[IC])。",
      "游标卡在 V(IN) 相邻上升沿 → dx ≈ 1.000 ms，f = 1/dx。",
      "高电平区间读 V(COL) ≈ 0.2 V；低电平区间读 V(COL) ≈ 5 V。",
      "电流曲线读高电平平台 → Ib ≈ 0.43 mA、Ic ≈ 2.8 mA。",
    ],
    theory: [
      { param: "基极电流 Ib", formula: "(5 − 0.7) / 10k", value: "0.43", unit: "mA" },
      { param: "集电极饱和电流 Ic(sat)", formula: "(5 − 2.0 − 0.2) / 1k", value: "2.8", unit: "mA" },
      { param: "强制 β（判断饱和）", formula: "Ic / Ib", value: "≈ 6.5", unit: "≪ 200" },
      { param: "Vce 饱和", formula: "查 2N2222 输出特性", value: "≈ 0.2", unit: "V" },
      { param: "Vce 截止", formula: "回路断开，C 点被上拉", value: "≈ 5.0", unit: "V" },
      { param: "LED 正向电流 If", formula: "= Ic", value: "2.8", unit: "mA (< 20 mA)" },
      { param: "输入方波周期 / 频率", formula: "PULSE(... PW 0.5m  PER 1m)", value: "1.0 ms / 1 kHz", unit: "" },
      { param: "LED 平均功耗", formula: "2.0 V × 2.8 mA × 50%", value: "2.8", unit: "mW" },
    ],
    pitfalls: [
      { title: "LED 反接（阴极朝 Q1 集电极）", effect: "输入高电平时 LED 始终不亮；V(COL) 高电平 ≈ 5 V，低电平也 ≈ 5 V，CH B 一条直线无方波。" },
      { title: "RB 与 RC 位置对调", effect: "Ib 被 1k 限到 ≈ 4.3 mA，集电极回路被 10k 限流：LED 极暗或不亮；V(COL) 高电平只有 ~2.5 V。" },
      { title: "忘记接地（VIN 负端或 Q1 发射极悬空）", effect: "Multisim 报 singular matrix / floating node；侥幸跑起来 V(COL) 恒为 0 或恒为 5 V，Ib、Ic 全为 0。" },
    ],
  },
  {
    slug: "002-common-emitter-amp",
    id: "002",
    name: "共射极放大器",
    nameEn: "2N2222 voltage-divider bias CE amplifier",
    difficulty: "入门",
    status: "待验证",
    summary: "2N2222 分压偏置共射放大，阻容耦合，增益 ≥ 20，下限频率约 10 Hz",
    signalFlow: ["VIN", "C1", "R1", "R2", "Q1", "RC", "RE1", "RE2", "CE", "C2", "RL", "VCC"],
    instruments: "XFG1 · XSC1 · XMM1",
    filename: "002-common-emitter-amp.cir",
    cir: CIR_002,
    notes:
      "射极电阻拆成 RE1 = 100 Ω（保留，提供交流局部负反馈）+ RE2 = 900 Ω（被 CE = 100u 旁路）。直流工作点由 RE1+RE2 = 1 kΩ 决定，交流增益由 RE1 决定。",
    parts: [
      { ref: "VIN", path: "Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE", params: "10 mV 峰值，1 kHz 正弦", note: "AC 10m 用于 AC 分析" },
      { ref: "C1", path: "Basic / CAPACITOR", params: "10u 电解，输入耦合", note: "+ 极朝 BASE" },
      { ref: "R1", path: "Basic / RESISTOR", params: "47k 上偏置", note: "VCC → BASE" },
      { ref: "R2", path: "Basic / RESISTOR", params: "8.2k 下偏置", note: "BASE → GND" },
      { ref: "Q1", path: "Transistors / BJT_NPN / 2N2222", params: "NPN，β ≈ 200", note: "引脚 E-B-C" },
      { ref: "RC", path: "Basic / RESISTOR", params: "4.7k 集电极", note: "VCC → COL" },
      { ref: "RE1", path: "Basic / RESISTOR", params: "100 射极交流负反馈", note: "决定增益，不可旁路" },
      { ref: "RE2", path: "Basic / RESISTOR", params: "900 射极直流负反馈", note: "与 RE1 串联，总 1k 定 Q 点" },
      { ref: "CE", path: "Basic / CAPACITOR", params: "100u 电解，射极旁路", note: "+ 极朝 EMIT2" },
      { ref: "C2", path: "Basic / CAPACITOR", params: "10u 电解，输出耦合", note: "+ 极朝 COL" },
      { ref: "RL", path: "Basic / RESISTOR", params: "10k 负载", note: "OUT → GND" },
      { ref: "VCC", path: "Sources / POWER_SOURCES / DC_POWER", params: "12 V", note: "网络名 VCC" },
      { ref: "GND", path: "Sources / POWER_SOURCES / GROUND", params: "—", note: "必须放" },
    ],
    grid: [
      { ref: "VIN", x: 0, y: 4, rot: "0°", note: "最左，正弦信号源" },
      { ref: "C1", x: 3, y: 4, rot: "0°", note: "输入耦合，+ 极朝右（朝 BASE）" },
      { ref: "R1", x: 6, y: 2, rot: "90°", note: "上偏置：VCC → BASE" },
      { ref: "R2", x: 6, y: 8, rot: "90°", note: "下偏置：BASE → GND（与 R1 同列）" },
      { ref: "Q1", x: 9, y: 4, rot: "0°", note: "E 下 / B 左 / C 上" },
      { ref: "RC", x: 9, y: 2, rot: "90°", note: "集电极电阻：VCC → COL（Q1 正上方）" },
      { ref: "RE1", x: 9, y: 7, rot: "90°", note: "射极交流负反馈（不可旁路），Q1 正下方" },
      { ref: "RE2", x: 9, y: 9, rot: "90°", note: "与 RE1 串成同一条竖线" },
      { ref: "CE", x: 12, y: 9, rot: "90°", note: "并在 RE2 两端（+ 极朝上）" },
      { ref: "C2", x: 13, y: 4, rot: "0°", note: "输出耦合，+ 极朝左（朝 COL）" },
      { ref: "RL", x: 16, y: 4, rot: "90°", note: "输出负载：OUT → GND" },
      { ref: "VCC", x: 6, y: 0, rot: "0°", note: "顶部电源符号，正对 R1 上端" },
      { ref: "GND", x: 9, y: 11, rot: "0°", note: "底部地符号（R2 / RE2 / CE / RL 共用）" },
    ],
    ascii: `                    +12 V (VCC)
                        |
          +-------------+-------------+
          |                           |
      R1 47k                      RC 4.7k   (均 90° 竖放)
          |                           |
 C1       +—— BASE ——+               +—— COL ——+
IN o—||——+          |               |         |
    10u  |      Q1 2N2222 (0°)       |         +— C2 —+—||—+— OUT
         |      C ——\\               |         | 10u  |    |
         |           \\——————+       |         |       RL 10k
         |      E ——+       |       |         |       |
         |          |       |       |         |      GND
         |      EMIT       |       |         |
         |          |       |       |         |
         |      RE1 100     |       |         |
         |          |       |       |         |
         |      EMIT2       |       |         |
         |      |     |     |       |         |
         |  RE2 900  CE 100u |       |         |
         |      |     |     |       |         |
        R2 8.2k |     |     |       |         |
         |      |     |     |       |         |
 GND o———+——————+—————+—————+———————+—————————+`,
    importSteps: [
      "删掉 .MODEL 2N2222 生成的空壳管，从 Transistors / BJT_NPN / 2N2222 重新放置，按连线表接回。",
      "按 ASCII 图摆位，R1/R2/RC/RE1/RE2/CE 竖放 90°；电解电容竖放时 + 极朝上。",
      "连线顺序：① VIN(+) → C1 → BASE；Q1(C) → COL → C2 → OUT → RL → GND；② VCC → R1 → BASE、BASE → R2 → GND；③ VCC → RC → COL；④ Q1(E) → RE1 → EMIT2 → RE2 → GND，CE 并在 RE2 两端；⑤ 统一接地。",
      "给 VCC / BASE / COL / EMIT / EMIT2 / OUT / IN 加网络名（555 之外交叉最多的就是这个电路）。",
      "分析指令导入后常被忽略：Transient（5 ms / 1 us）、AC（DEC 10，10 Hz–1 MHz）、DC Operating Point 均在 UI 里重设。",
    ],
    wires: [
      { n: 1, from: "XFG1 + / VIN 正端", to: "C1 输入侧", net: "IN" },
      { n: 2, from: "C1 正极侧", to: "Q1 基极 (B)", net: "BASE" },
      { n: 3, from: "VCC (+12 V)", to: "R1 上端", net: "VCC" },
      { n: 4, from: "R1 下端", to: "Q1 基极 (B)", net: "BASE" },
      { n: 5, from: "Q1 基极 (B)", to: "R2 上端", net: "BASE" },
      { n: 6, from: "R2 下端", to: "GND" },
      { n: 7, from: "VCC (+12 V)", to: "RC 上端", net: "VCC" },
      { n: 8, from: "RC 下端", to: "Q1 集电极 (C)", net: "COL" },
      { n: 9, from: "Q1 集电极 (C)", to: "C2 正极侧", net: "COL" },
      { n: 10, from: "C2 负极侧", to: "RL 上端", net: "OUT" },
      { n: 11, from: "RL 下端", to: "GND" },
      { n: 12, from: "Q1 发射极 (E)", to: "RE1 上端", net: "EMIT" },
      { n: 13, from: "RE1 下端", to: "RE2 上端", net: "EMIT2" },
      { n: 14, from: "CE 正极", to: "EMIT2", net: "EMIT2" },
      { n: 15, from: "CE 负极", to: "GND" },
      { n: 16, from: "RE2 下端", to: "GND" },
      { n: 17, from: "VIN 负端 / XFG1 -", to: "GND" },
      { n: 18, from: "XSC1 CH A +", to: "IN", net: "IN" },
      { n: 19, from: "XSC1 CH B +", to: "OUT", net: "OUT" },
      { n: 20, from: "XSC1 CH A- / CH B-", to: "GND" },
    ],
    instrumentsSetup: [
      { name: "XFG1", terminals: "+ → IN，COM → GND", panel: "Sine · 1 kHz · Amplitude 10 mVp · Offset 0 V" },
      { name: "XSC1 CH A", terminals: "CH A + → IN，- → GND", panel: "5 mV/Div，DC 耦合" },
      { name: "XSC1 CH B", terminals: "CH B + → OUT，- → GND", panel: "100 mV/Div，DC 耦合。CH B 与 CH A 反相 180°" },
      { name: "XMM1", terminals: "DC V：+ → COL，- → GND", panel: "读 Vc ≈ 6.94 V；再测 EMIT ≈ 1.08 V" },
    ],
    grapher: [
      "瞬态增益：Cursor 1/2 卡 V(OUT) 波峰与波谷 → dy = Vopp；同样读 V(IN) 的 Vipp；|Av| = Vopp / Vipp。",
      "相位差：读 V(IN) 与 V(OUT) 相邻同向过零点的 dx，φ = −360° × dx / T（约 −180°）。",
      "频响：AC Analysis 后切 Magnitude 页，找 0.707 × 中频增益处的 f_L / f_H。",
    ],
    theory: [
      { param: "基极分压 Vb", formula: "12 × 8.2k / (47k + 8.2k)", value: "1.78", unit: "V" },
      { param: "射极电压 Ve", formula: "Vb − 0.7", value: "1.08", unit: "V" },
      { param: "射极电流 Ie", formula: "Ve / (100 + 900)", value: "1.08", unit: "mA" },
      { param: "集电极电压 Vc", formula: "12 − 1.08m × 4.7k", value: "6.94", unit: "V" },
      { param: "Vce", formula: "Vc − Ve", value: "5.86", unit: "V（≈ VCC/2 偏上）" },
      { param: "基极电流 Ib", formula: "Ic / β", value: "5.4", unit: "µA" },
      { param: "分压电流（稳定性校核）", formula: "12 / 55.2k", value: "217 µA ≈ 40 × Ib", unit: "✅ 稳定" },
      { param: "射极动态电阻 re", formula: "26 mV / 1.08 mA", value: "24", unit: "Ω" },
      { param: "空载增益 |Av|", formula: "Rc / (RE1 + re) = 4.7k / 124", value: "37.9", unit: "（31.6 dB）" },
      { param: "带载增益 |Av| (RL=10k)", formula: "(4.7k ∥ 10k) / 124", value: "25.8", unit: "（28.2 dB）" },
      { param: "输入电阻 Rin", formula: "R1 ∥ R2 ∥ [β(RE1+re)]", value: "5.4", unit: "kΩ" },
      { param: "输出幅值（10 mVp 输入，带载）", formula: "10 mV × 25.8", value: "258", unit: "mVp" },
      { param: "下限频率 f_L（CE 主导）", formula: "1 / [2π(RE1+re+Rth/β)CE]", value: "≈ 10", unit: "Hz" },
      { param: "最大不失真输入（带载）", formula: "(12 − 6.94) / 25.8", value: "≈ 196", unit: "mVp" },
      { param: "相位关系", formula: "共射极固有", value: "反相 180°", unit: "" },
    ],
    pitfalls: [
      { title: "CE 并在 RE1+RE2 整体两端", effect: "静态点几乎不变（Vc ≈ 6.9 V），但增益暴跌到 ≈ 4.7（4.7k / 1k），输出仅 ~47 mVp，指标 ≥ 20 不达标且易削顶。" },
      { title: "R1 与 R2 对调", effect: "分压点变 10.2 V → 三极管深度饱和，Vc ≈ 0.2 V，V(OUT) 是贴底直线、完全无放大。" },
      { title: "忘记接 CE / CE 虚焊", effect: "增益变成 4.7k / (1000+24) ≈ 4.6，但静态工作点完全正常，只测直流点查不出来，必须加交流信号看输出幅值。" },
    ],
  },
  {
    slug: "003-555-astable",
    id: "003",
    name: "NE555 多谐振荡器",
    nameEn: "NE555 astable multivibrator ≈ 1 kHz",
    difficulty: "进阶",
    status: "待验证",
    summary: "NE555 无稳态方波输出，约 1 kHz，占空比约 53%，需黑盒替换为库件 LM555CN",
    signalFlow: ["RA", "RB", "CT", "CC", "RPU", "XU1", "RL", "VCC"],
    instruments: "XSC1 · XFC1",
    filename: "003-555-astable.cir",
    cir: CIR_003,
    notes:
      "本电路有先天限制：硬约束禁止 .SUBCKT，而 NE555 是集成电路，无法用纯 SPICE 描述内部结构。XU1 只是黑盒占位（模型名 NE555），导入后必须替换成 Mixed / TIMER / LM555CN，否则报 model not found 或输出恒为 0。",
    parts: [
      { ref: "RA", path: "Basic / RESISTOR", params: "8.2k", note: "VCC → DIS(7)，充电上臂" },
      { ref: "RB", path: "Basic / RESISTOR", params: "68k", note: "DIS(7) → THR(6/2)，充放电共用" },
      { ref: "CT", path: "Basic / CAPACITOR", params: "10n", note: "THR → GND，定时电容" },
      { ref: "CC", path: "Basic / CAPACITOR", params: "10n", note: "CTRL(5) → GND，去耦，不接会频偏" },
      { ref: "RPU", path: "Basic / RESISTOR", params: "10k", note: "VCC → RESET(4)，上拉防误复位" },
      { ref: "XU1", path: "Mixed / TIMER / LM555CN", params: "DIP-8，VCC 4.5~16 V", note: "必须黑盒替换，网表里只是占位名 NE555" },
      { ref: "RL", path: "Basic / RESISTOR", params: "10k", note: "OUT → GND，输出负载" },
      { ref: "VCC", path: "Sources / POWER_SOURCES / DC_POWER", params: "5 V", note: "网络名 VCC" },
      { ref: "GND", path: "Sources / POWER_SOURCES / GROUND", params: "—", note: "必须放" },
    ],
    grid: [
      { ref: "XU1", x: 8, y: 4, rot: "0°", note: "DIP-8，缺口朝左；1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC" },
      { ref: "RA", x: 8, y: 1, rot: "90°", note: "VCC → DIS(7)，芯片右上方" },
      { ref: "RB", x: 12, y: 2, rot: "0°", note: "DIS(7) → THR(6)，横放" },
      { ref: "CT", x: 12, y: 6, rot: "90°", note: "THR → GND，定时电容（决定频率）" },
      { ref: "CC", x: 15, y: 6, rot: "90°", note: "CTRL(5) → GND，去耦（不接会频偏）" },
      { ref: "RPU", x: 5, y: 1, rot: "90°", note: "VCC → RESET(4)，芯片左上方" },
      { ref: "RL", x: 3, y: 7, rot: "90°", note: "OUT(3) → GND，输出负载" },
      { ref: "VCC", x: 8, y: 0, rot: "0°", note: "顶部电源符号" },
      { ref: "GND", x: 8, y: 10, rot: "0°", note: "底部地符号" },
    ],
    ascii: `                        +5 V (VCC)
                            |
        +-------------------+-------------------+
        |                                       |
      RPU 10k                                RA 8.2k   (均 90° 竖放)
        |                                       |
      RESET (4)                              DIS (7)
        |                                       |
        |                                    RB 68k    (0° 横放)
        |                                       |
        |                                       +—— THR (同时接 6 脚与 2 脚)
        |        XU1  LM555CN  (0°)             |
        |      +----------------------+         |
        |   1 -|GND                VCC|-8 ------+
        |   2 -|TRIG              DIS |-7 ------+
        |   3 -|OUT              THR  |-6 ------+
        |   4 -|RESET            CTRL |-5 —— CC 10n —— GND
        |      +----------------------+    |
        |           |                      CT 10n
        |         OUT                      |
        +— RL 10k —+                      GND
        |           |
       GND         GND`,
    importSteps: [
      "黑盒替换（核心步骤，不做一定跑不起来）：删掉 XU1，从 Mixed / TIMER / LM555CN 重新放置 8 脚芯片，按连线表接回。",
      "引脚顺序 DIP-8：1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC。第 2 与第 6 位都写 THR（TRIG 与 THR 短接）。",
      "摆位：RA/RPU/CC/CT 竖放 90°，RB/RL 横放 0°，芯片缺口朝左。",
      "连线顺序：① VCC → RA → DIS → RB → THR → CT → GND；② THR 飞线到 TRIG(2 脚)——漏了就振荡不起来；③ CTRL(5) → CC → GND；④ VCC → RPU → RESET(4)；⑤ OUT(3) → RL → GND 并引到 XSC1 CH B；⑥ 芯片 1 脚 → GND，8 脚 → VCC。",
      "若不起振：Transient 里勾选 Set initial conditions → User-defined，或临时给 CT 设非零初值。",
    ],
    wires: [
      { n: 1, from: "VCC (+5 V)", to: "RA 上端", net: "VCC" },
      { n: 2, from: "RA 下端", to: "XU1 引脚 7（DIS）", net: "DIS" },
      { n: 3, from: "XU1 引脚 7（DIS）", to: "RB 左端", net: "DIS" },
      { n: 4, from: "RB 右端", to: "XU1 引脚 6（THR）", net: "THR" },
      { n: 5, from: "XU1 引脚 6（THR）", to: "XU1 引脚 2（TRIG）", net: "THR（关键短接）" },
      { n: 6, from: "THR 节点", to: "CT 上端", net: "THR" },
      { n: 7, from: "CT 下端", to: "GND" },
      { n: 8, from: "XU1 引脚 5（CTRL）", to: "CC 上端", net: "CTRL" },
      { n: 9, from: "CC 下端", to: "GND" },
      { n: 10, from: "VCC (+5 V)", to: "RPU 上端", net: "VCC" },
      { n: 11, from: "RPU 下端", to: "XU1 引脚 4（RESET）", net: "RESET" },
      { n: 12, from: "XU1 引脚 8（VCC）", to: "VCC (+5 V)", net: "VCC" },
      { n: 13, from: "XU1 引脚 1（GND）", to: "GND" },
      { n: 14, from: "XU1 引脚 3（OUT）", to: "RL 上端", net: "OUT" },
      { n: 15, from: "RL 下端", to: "GND" },
      { n: 16, from: "XSC1 CH B +", to: "OUT", net: "OUT" },
      { n: 17, from: "XSC1 CH B -", to: "GND" },
    ],
    instrumentsSetup: [
      { name: "XSC1 CH A", terminals: "CH A + → THR，- → GND", panel: "1 V/Div，DC 耦合。看 1.67–3.33 V 之间的锯齿/指数波" },
      { name: "XSC1 CH B", terminals: "CH B + → OUT，- → GND", panel: "2 V/Div，DC 耦合。0–3.7 V 方波，Timebase 100 us/Div" },
      { name: "XFC1", terminals: "+ → OUT，- → GND", panel: "Frequency Counter，Trigger 2 V、DC 耦合，直接读频率更准" },
    ],
    grapher: [
      "Transient Analysis：End time 10 ms、Maximum time step 1 us，Output 加 V(OUT)、V(THR)。",
      "Cursor 1/2 卡 V(OUT) 相邻上升沿 → dx = T，f = 1/dx。卡同一周期上升/下降沿 → dx = tH，D = tH/T。",
      "V(THR) 波峰/波谷应分别为 3.33 V 与 1.67 V（2/3 VCC 与 1/3 VCC）。",
      "V(OUT) 高电平平台 ≈ 3.7 V（NE555 输出高电平典型 VCC − 1.3 V，不是 5 V）。",
    ],
    theory: [
      { param: "充电时间 tH（输出高）", formula: "0.693 × (RA+RB) × C", value: "528", unit: "µs" },
      { param: "放电时间 tL（输出低）", formula: "0.693 × RB × C", value: "471", unit: "µs" },
      { param: "周期 T", formula: "tH + tL", value: "999", unit: "µs" },
      { param: "频率 f", formula: "1.44 / ((RA + 2RB) × C)", value: "1.00", unit: "kHz" },
      { param: "占空比 D", formula: "(RA+RB) / (RA+2RB) = 76.2/144.2", value: "52.9", unit: "%" },
      { param: "电容电压上限", formula: "2/3 × VCC", value: "3.33", unit: "V" },
      { param: "电容电压下限", formula: "1/3 × VCC", value: "1.67", unit: "V" },
      { param: "输出高电平 VOH", formula: "VCC − 1.3（NE555 典型）", value: "≈ 3.7", unit: "V（不是 5 V！）" },
      { param: "输出低电平 VOL", formula: "典型", value: "≈ 0.1", unit: "V" },
      { param: "输出电流（RL=10k）", formula: "3.7 V / 10k", value: "0.37", unit: "mA" },
      { param: "DIS 放电峰值电流", formula: "3.33 V / RB = 3.33 / 68k", value: "49", unit: "µA（7 脚安全）" },
    ],
    pitfalls: [
      { title: "忘记把 THR(6) 与 TRIG(2) 短接", effect: "电容能充到 2/3 VCC 让输出变低，但触发比较器永远不翻转 → 输出卡在低电平不动，V(THR) 在 1.67 V 附近小幅摆动。" },
      { title: "RA 与 RB 位置对调", effect: "仍振荡但 f 变 1.71 kHz、占空比变 90.5 %，输出是一串很窄的负脉冲。" },
      { title: "RESET(4) 悬空或误接地", effect: "悬空时随机复位 → 间歇性停振；接地时完全不振，输出恒低 ≈ 0 V，V(THR) 停在 2.5 V 左右。" },
    ],
  },
];

export function getCircuit(slug: string): Circuit | undefined {
  return circuits.find((c) => c.slug === slug);
}

export const statusMeta: Record<VerifyStatus, { dot: string; label: string; hint: string }> = {
  待验证: { dot: "🟡", label: "待验证", hint: "只过了语法 lint，没人跑过，请当作草稿" },
  已验证: { dot: "🟢", label: "已验证", hint: "有人真的跑通了，数值可信度高" },
  验证失败: { dot: "🔴", label: "验证失败", hint: "已知有问题，原因写在 verification.md" },
};
