/**
 * faq.ts —— 与 docs/faq.md 同源（12 条高频问题）
 * 修改这些问题时请同步更新仓库里的 docs/faq.md。
 */

export type Faq = { q: string; a: string; code?: string };

export const faqs: Faq[] = [
  {
    q: "为什么导入后 .OP / .TRAN / .AC 这些分析指令被忽略了？",
    a: "Multisim 的网表导入器对分析指令的支持是不稳定的——部分版本会读进来，部分版本直接丢弃，还有的读进来但参数错位。所以不要指望网表里的分析指令，导入后一律在 UI 里重设。项目把分析指令写进网表只是为了语法自洽（也能给纯 SPICE 工具用），真正的仿真参数以各电路 README 第 6 节为准。同理 .PARAM / .OPTIONS / .STEP / .MEASURE 也常被忽略或报错，所以硬约束里直接禁掉了；要参数扫描就走 UI 的 Parameter Sweep（Device parameter + List）。",
    code: `Simulate → Analyses and simulation
  ├ DC Operating Point  → Output 页加你要看的节点电压/支路电流
  ├ Transient Analysis  → 填 End time 与 Maximum time step
  └ AC Analysis         → Decade + 起止频率 + Output 加 V(OUT)`,
  },
  {
    q: "为什么导入后元件乱七八糟、图一点都不整齐？",
    a: "这不是提示词能修的问题，是格式限制。.cir 网表根本不包含任何坐标信息——它只描述「谁连谁」。Multisim 导入时会自己给元件排位置（大致按元件行出现顺序从左到右），所以结果必然是「能连对，但摆得难看」。能缓解的是：生成时约束元件行按物理信号流顺序书写、电源行放最后，这样主链路至少沿着信号方向排（硬约束第 6 条的由来）。要一张真正整齐的图只有两条路：照 README 第 3 节 ASCII 图手动摆一遍，或换用带坐标的格式（如 LTspice 的 .asc）。别信「改一下提示词就能让 Multisim 摆整齐」。",
  },
  {
    q: "XFG1（函数发生器）的 Amplitude 和 Offset 到底怎么设？",
    a: "XFG1 上的 Amplitude 指的是峰值（Vp），不是峰峰值（Vpp），而且它是叠加在 Offset 上的。公式：输出范围 = Offset ± Amplitude。想要 0~5 V 方波（001 电路要的）应设 Amplitude 2.5 Vp + Offset 2.5 V；最常见错误是设成 Amplitude 5 V + Offset 0 V，实际得到 −5 V ~ +5 V，会让三极管基极在负半周反偏。面板若只显示 Vpp，则 Amplitude(Vp) = Vpp / 2。",
    code: `0 V ~ 5 V 方波（001 要的）    → Amplitude 2.5 Vp + Offset 2.5 V
−5 V ~ +5 V                   → Amplitude 5 Vp   + Offset 0 V
1 kHz 20 mVpp 正弦（002 要的） → Amplitude 10 mVp + Offset 0 V`,
  },
  {
    q: "为什么我的 .cir 打不开 / 导入解析失败？",
    a: "按出现频率排序的三个原因：① 文件里有非 ASCII 字符（中文注释最常见）——实测会让 Multisim 网表导入器直接解析失败，注释一律用英文；② 单行超过 132 字符（经典 SPICE 上限），用 + 续行；③ 用了不支持的指令（.PARAM / .OPTIONS / .MEASURE / .STEP / .SUBCKT / .INCLUDE / .LIB…），全部删掉。排查顺序：先跑 python scripts/cir_lint.py xxx.cir，它会把三类一次性报出来并给出行号。",
  },
  {
    q: "仿真报 singular matrix / floating node / Transient analysis failed？",
    a: "几乎都是悬空节点导致的。singular matrix = 导纳矩阵奇异 = 有节点没有到地的直流通路。常见情形：忘了放 GROUND（每个电路必须且只能有一个地，网络 0）、信号源负端没接地、某个节点只连了 1 个元件引脚、两个电容串联中间的节点没有直流通路（并联一个大电阻如 1MEG 到地）、运放输出悬空。排查方法：Tools → Circuit → Show Node Numbers，确认地网络编号是 0，然后逐个节点数引脚——每个非地节点至少要有 2 个引脚。cir_lint.py 的 W-FLOAT1 会直接告诉你哪个节点只出现了 1 次。",
  },
  {
    q: "LED 不亮 / 电流和算出来的差很多？",
    a: "先查三件事：① 极性反了——LED 阴极（横杠一侧、短脚）应朝向电流流出的方向，001 电路里阴极朝 RC/VCC 一侧、阳极朝 Q1 集电极；② Vf 取值不同——LED_red ≈ 2.0 V、green ≈ 2.2 V、blue/white ≈ 3.0~3.6 V，换颜色不改限流电阻电流会明显变化；③ Multisim 库里的 LED 模型参数与网表 .MODEL 不一致，黑盒替换后实际用的是库件模型，Vf 可能差 0.2~0.5 V。快速判据：I = (VCC − Vf − Vce(sat)) / RC。",
  },
  {
    q: "NE555 接好了不振荡，输出一条直线？",
    a: "按概率排查：① XU1 没做黑盒替换（003 最容易踩的坑）——硬约束禁止 .SUBCKT，网表里 XU1 ... NE555 只是没有内部模型的空盒，必须换成 Mixed / TIMER / LM555CN；② THR(6) 和 TRIG(2) 没短接——这是无稳态接法的灵魂，漏掉它输出会卡在低电平；③ RESET(4) 悬空或被接地——必须经 10 kΩ 上拉到 VCC；④ 不起振——Transient 里勾选 Set initial conditions → User-defined。注意 555 输出高电平不是 VCC（典型 VCC − 1.3 V ≈ 3.7 V @5 V）。",
  },
  {
    q: "Grapher 的游标怎么读数？",
    a: "跑完分析自动弹 Grapher → 工具栏点 Cursor（或 View → Show/Hide Cursors）→ 拖 Cursor 1 / Cursor 2，面板上直接显示 dx（横坐标差）和 dy（纵坐标差）。两个坑：先点选曲线再拖游标，否则 dx/dy 读的是另一条曲线的；Maximum time step 太大会让波形呈锯齿、读数偏小，一般取信号周期的 1/1000。",
    code: `周期 T / 频率 f    卡相邻两个同向过零点 → f = 1/dx
峰峰值 Vpp        卡同一周期的波峰和波谷 → dy
电压增益          dy(输出曲线) / dy(输入曲线)
相位差            卡两曲线相邻同向过零点 → φ = 360° × dx / T
−3 dB 截止频率    AC 曲线 Magnitude 页找 0.707 × 中频增益处`,
  },
  {
    q: "元件值到底该怎么写？为什么不能用 1e-3？",
    a: "部分 SPICE 导入器（含 Multisim 的）对 1e-3 这类科学计数法支持不一致，但对标准后缀是稳定支持的，所以硬约束第 4 条直接禁掉科学计数法。例外：.MODEL 行内部的参数允许科学计数法，14.34F、7.306P、1E-14 都是合法模型参数，cir_lint 也不检查 .MODEL 行。",
    code: `1000 Ω    → 1k      （不是 1e3）
0.001 A   → 1m      （不是 1e-3）
10 µF     → 10u     （不是 10e-6）
10 nF     → 10n     （不是 1e-8）
1 MΩ      → 1MEG    （不是 1e6）`,
  },
  {
    q: "为什么禁止 .SUBCKT？我想用运放/555 这种集成电路怎么办？",
    a: "原因：.SUBCKT 会让 Multisim 导入器生成一个嵌套子电路块，在 14.x 上经常导入失败、或导入后变成无法编辑的黑盒，且和「导入后要手动换库件」的流程冲突。替代方案 = 黑盒策略：网表里只写一个占位元件行（如 XU1 0 THR OUT ... NE555），不写 .SUBCKT / .INCLUDE / .LIB；导入后替换成 Multisim 主数据库里的真实型号（Mixed / TIMER / LM555CN、Analog / OPAMP / 741…）。代价是这种网表在纯 SPICE 工具里跑不了，但本项目目标是「能导入 Multisim」，不是「能离线跑 SPICE」。",
  },
  {
    q: "搜不到库路径里写的元件？",
    a: "① 版本/数据库差异——Multisim 14.x 各版本、教育版、自定义安装的库内容不同，Family 名也可能略有出入（二极管和运放最明显）；② 用搜索框——Place → Component → Search，勾选 Search in: All databases，输型号关键词（2N2222 / LM358 / 555），比按树翻快十倍；③ 模型缺失——某些型号（如国产 S8050）默认库没有，需导入 SPICE 模型，这种情况请换用通用型号，别硬导。找到了不一样的真实路径 → 提 PR 修 docs/multisim-library-map.md。",
  },
  {
    q: "我只是想快速用现成电路，该看哪些文件？",
    a: "进 circuits/NNN-xxx/ 目录：NNN-xxx.cir 是 File → Open 要导入的；README.md 照第 4 节整理、第 5 节连线、第 6 节设仪器、第 7 节对数值；verification.md 看状态标签 🟢🟡🔴 和理论/实测对照；prompt-used.md 是想改电路时用来重新生成的提示词。一定要先看 verification.md 的状态标签：🟢 已验证 = 有人真的跑通了，可以直接用；🟡 待验证 = 只过了语法 lint，没人跑过，当作草稿；🔴 验证失败 = 已知有问题。",
  },
];
