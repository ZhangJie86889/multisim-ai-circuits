/**
 * library.ts —— 与 docs/multisim-library-map.md 同源
 * 格式：Group（组） / Family（系列） / Component（元件）
 */

export type LibRow = {
  name: string;
  path: string;
  note: string;
  tags: string;
};

export type LibGroup = { title: string; emoji: string; rows: LibRow[] };

export const libraryGroups: LibGroup[] = [
  {
    title: "电源与地",
    emoji: "🔌",
    rows: [
      { name: "DC_POWER", path: "Sources / POWER_SOURCES / DC_POWER", note: "直流电压源，默认 12 V，双击改值", tags: "dc power vcc vdd" },
      { name: "AC_POWER", path: "Sources / POWER_SOURCES / AC_POWER", note: "交流电源（正弦，可设幅值/频率/相位）", tags: "ac power" },
      { name: "GROUND", path: "Sources / POWER_SOURCES / GROUND", note: "地，每个电路必须有一个，仿真基准点", tags: "gnd ground 地" },
      { name: "DGND", path: "Sources / POWER_SOURCES / DGND", note: "数字地", tags: "dgnd" },
      { name: "VCC", path: "Sources / POWER_SOURCES / VCC", note: "+5 V 电源符号，常用作网络标签", tags: "vcc" },
      { name: "VDD / VEE / VSS", path: "Sources / POWER_SOURCES / VDD 等", note: "数字电源 / 负电源 / 数字地符号", tags: "vdd vee vss" },
      { name: "AC_VOLTAGE", path: "Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE", note: "正弦信号源，可设 AC Analysis Magnitude（做 AC 分析必须设）", tags: "ac voltage sine 正弦" },
      { name: "PULSE_VOLTAGE", path: "Sources / SIGNAL_VOLTAGE_SOURCES / PULSE_VOLTAGE", note: "脉冲源，PULSE(V1 V2 TD TR TF PW PER)", tags: "pulse 脉冲" },
      { name: "CLOCK_VOLTAGE", path: "Sources / SIGNAL_VOLTAGE_SOURCES / CLOCK_VOLTAGE", note: "时钟源，PULSE 导入不稳时的替代品，直接设频率/占空比", tags: "clock 时钟" },
      { name: "EXPONENTIAL / PWL", path: "Sources / SIGNAL_VOLTAGE_SOURCES / EXPONENTIAL_VOLTAGE", note: "指数源 / 分段线性源（PIECEWISE_LINEAR_VOLTAGE）", tags: "exp pwl" },
      { name: "受控源 VCVS 等", path: "Sources / CONTROLLED_VOLTAGE_SOURCES / VOLTAGE_CONTROLLED_VOLTAGE_SOURCE", note: "四类受控源都有对应 Family", tags: "vcvs ccvs 受控源" },
    ],
  },
  {
    title: "无源元件",
    emoji: "🧱",
    rows: [
      { name: "Resistor", path: "Basic / RESISTOR / <阻值>", note: "选 1.0k 等标称值；要任意值选 RESISTOR_VIRTUAL 或改属性", tags: "resistor r 电阻" },
      { name: "Potentiometer", path: "Basic / POTENTIOMETER / <阻值>", note: "可调电阻，仿真中按 A / Shift+A 调百分比", tags: "potentiometer 电位器" },
      { name: "Capacitor", path: "Basic / CAPACITOR / <容值>", note: "无极性电容", tags: "capacitor c 电容" },
      { name: "Capacitor（电解）", path: "Basic / CAP_ELECTROLIT / <容值>", note: "有正负极性，接反会报错或不收敛", tags: "electrolytic 电解" },
      { name: "Inductor", path: "Basic / INDUCTOR / <感值>", note: "电感（可变电解为 INDUCTOR_VARIABLE）", tags: "inductor l 电感" },
      { name: "Transformer", path: "Basic / TRANSFORMER / <型号>", note: "变压器", tags: "transformer 变压器" },
      { name: "Switch / Relay / Fuse", path: "Basic / SWITCH · RELAY · FUSE", note: "开关（仿真中按空格切换）/ 继电器 / 保险丝", tags: "switch relay fuse 开关 继电器 保险丝" },
    ],
  },
  {
    title: "二极管与 LED",
    emoji: "💡",
    rows: [
      { name: "1N4148", path: "Diodes / DIODE / 1N4148", note: "高速开关二极管，Vf ≈ 0.7 V", tags: "1n4148" },
      { name: "1N4007", path: "Diodes / DIODE / 1N4007", note: "整流二极管，1 A / 1000 V（部分版本在 RECTIFIER_DIODE）", tags: "1n4007" },
      { name: "LED_red", path: "Diodes / LED / LED_red", note: "Vf ≈ 2.0 V，If(max) ≈ 20 mA", tags: "led red 红" },
      { name: "LED_green", path: "Diodes / LED / LED_green", note: "Vf ≈ 2.2 V", tags: "led green 绿" },
      { name: "LED_yellow / blue / white", path: "Diodes / LED / LED_yellow 等", note: "蓝/白 Vf ≈ 3.0~3.6 V", tags: "led blue white 蓝 白" },
      { name: "Zener 稳压管", path: "Diodes / ZENER / <稳压值>", note: "如 1N4733A（5.1 V）", tags: "zener 稳压" },
      { name: "肖特基", path: "Diodes / SCHOTTKY_DIODE / <型号>", note: "Vf ≈ 0.3 V", tags: "schottky 肖特基" },
      { name: "整流桥", path: "Diodes / FWB / <型号>", note: "Full-wave bridge", tags: "fwb 整流桥" },
    ],
  },
  {
    title: "三极管",
    emoji: "🔺",
    rows: [
      { name: "2N2222", path: "Transistors / BJT_NPN / 2N2222", note: "NPN 小信号/开关，本项目默认管，Ic(max) 800 mA", tags: "2n2222 bjt npn" },
      { name: "2N3904", path: "Transistors / BJT_NPN / 2N3904", note: "NPN 小信号，Ic(max) 200 mA", tags: "2n3904" },
      { name: "BC547", path: "Transistors / BJT_NPN / BC547", note: "欧洲常用 NPN（常见 BC547A/B/C）", tags: "bc547" },
      { name: "2N2907 / 2N3906 / BC557", path: "Transistors / BJT_PNP / <型号>", note: "PNP 对应管", tags: "pnp 2n2907 2n3906 bc557" },
      { name: "TIP31 / TIP41", path: "Transistors / POWER_BJT_NPN / <型号>", note: "功率 NPN", tags: "tip31 tip41 功率" },
      { name: "BJT_NPN_VIRTUAL", path: "Transistors / TRANSISTORS_VIRTUAL / BJT_NPN_VIRTUAL", note: "虚拟三极管，可自定义 β，教学演示用", tags: "virtual 虚拟 beta" },
      { name: "MOSFET / JFET / IGBT", path: "Transistors / MOSFET_N · JFET_N · IGBT", note: "如 2N7000（N 沟道）；达林顿 DARLINGTON_NPN", tags: "mosfet jfet igbt 2n7000" },
    ],
  },
  {
    title: "运放与比较器",
    emoji: "🎚️",
    rows: [
      { name: "741 / LM741", path: "Analog / OPAMP / 741", note: "经典单运放，DIP-8（部分版本 LM741H / LM741CN）", tags: "741 lm741 opamp 运放" },
      { name: "LM358", path: "Analog / OPAMP / LM358N", note: "双运放，单电源可用，DIP-8", tags: "lm358" },
      { name: "LM324", path: "Analog / OPAMP / LM324N", note: "四运放，单电源", tags: "lm324" },
      { name: "LM393 / LM311", path: "Analog / COMPARATOR / LM393N", note: "双/单电压比较器（不是运放，输出需上拉）", tags: "lm393 lm311 比较器 comparator" },
      { name: "TL081 / TL082", path: "Analog / OPAMP / TL081", note: "JFET 输入运放", tags: "tl081 tl082" },
      { name: "OPAMP_3T_VIRTUAL", path: "Analog / OPAMP / OPAMP_3T_VIRTUAL", note: "理想运放，教学推导用", tags: "virtual 理想运放" },
    ],
  },
  {
    title: "定时器与混合器件",
    emoji: "⏱️",
    rows: [
      { name: "NE555 / LM555", path: "Mixed / TIMER / LM555CN", note: "本项目 003 用的，DIP-8（搜 NE555 亦可）", tags: "ne555 lm555 555 timer" },
      { name: "LM556", path: "Mixed / TIMER / LM556CN", note: "双 555", tags: "lm556" },
      { name: "ADC / DAC", path: "Mixed / ADC_DAC / <型号>", note: "模数 / 数模转换器", tags: "adc dac" },
      { name: "模拟开关", path: "Mixed / ANALOG_SWITCH / <型号>", note: "模拟开关", tags: "analog switch" },
      { name: "555 引脚（DIP-8）", path: "1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC", note: "本项目 003 网表按此顺序", tags: "555 pinout 引脚" },
    ],
  },
  {
    title: "仪器（从右侧仪器栏拖，不是元件）",
    emoji: "🔬",
    rows: [
      { name: "函数发生器 XFG1", path: "Simulate → Instruments → Function Generator", note: "Amplitude 是峰值，叠加在 Offset 上", tags: "xfg1 function generator 函数发生器" },
      { name: "示波器 XSC1", path: "Simulate → Instruments → Oscilloscope", note: "四通道版是 4 Channel Oscilloscope", tags: "xsc1 oscilloscope 示波器" },
      { name: "万用表 XMM1", path: "Simulate → Instruments → Multimeter", note: "DC/AC V/A/Ω，测静态工作点", tags: "xmm1 multimeter 万用表" },
      { name: "波特图仪 XBP1", path: "Simulate → Instruments → Bode Plotter", note: "直接看幅频/相频", tags: "xbp1 bode 波特图" },
      { name: "频率计 XFC1", path: "Simulate → Instruments → Frequency Counter", note: "读频率比示波器游标更准", tags: "xfc1 frequency counter 频率计" },
      { name: "其他仪器", path: "Simulate → Instruments → …", note: "失真分析仪 XDA1 / 瓦特表 XWM1 / 逻辑分析仪 XLA1 / 字发生器 XWG1", tags: "xda1 xwm1 xla1 xwg1" },
    ],
  },
  {
    title: "整理原理图常用快捷键",
    emoji: "⌨️",
    rows: [
      { name: "旋转 90°（顺时针）", path: "Ctrl + R", note: "最常用", tags: "rotate 旋转" },
      { name: "旋转 90°（逆时针）", path: "Ctrl + Shift + R", note: "", tags: "rotate 旋转" },
      { name: "水平镜像", path: "Ctrl + 左/右方向键", note: "会翻转引脚，慎用", tags: "mirror 镜像" },
      { name: "显示节点编号", path: "Tools → Circuit → Show Node Numbers", note: "查悬空节点必备", tags: "node 节点" },
      { name: "放置网络标签", path: "Place → Net 或双击导线改名", note: "避免长飞线", tags: "net 网络标签" },
      { name: "打开元件属性", path: "双击元件", note: "", tags: "property 属性" },
    ],
  },
];
