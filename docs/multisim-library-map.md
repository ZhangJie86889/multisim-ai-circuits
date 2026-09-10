# Multisim 常用元件库路径速查表

> **格式**：`Group（组） / Family（系列） / Component（元件）`
> 对应 Multisim 取件对话框（`Place → Component`）里的三级树 —— 也就是本项目要你
> **不用再逐层翻** 的那一层。
>
> ⚠️ **版本差异提示**：本表基于 **Multisim 14.x** 的主数据库（Master Database）整理。
> 不同小版本 / 教育版 / 简化安装可能缺件或系列名略有出入（尤其二极管和运放的 Family 名）。
> **搜不到就用搜索框**：`Search` 里勾选 `Search in: All databases`，输型号关键词（如 `2N2222`），
> 比按树翻快得多。发现出入请提 PR 修正本表 —— 这类修正最欢迎。

---

## 一、电源与地（Sources）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **DC_POWER** | `Sources / POWER_SOURCES / DC_POWER` | 直流电压源，默认 12 V，双击改值 |
| **AC_POWER** | `Sources / POWER_SOURCES / AC_POWER` | 交流电源（正弦，可设幅值/频率/相位） |
| **GROUND** | `Sources / POWER_SOURCES / GROUND` | 地，**每个电路必须有一个**，仿真基准点 |
| **DGND** | `Sources / POWER_SOURCES / DGND` | 数字地 |
| **VCC** | `Sources / POWER_SOURCES / VCC` | +5 V 电源符号（常用作网络标签） |
| **VDD** | `Sources / POWER_SOURCES / VDD` | 数字电源符号 |
| **VEE** | `Sources / POWER_SOURCES / VEE` | 负电源符号 |
| **VSS** | `Sources / POWER_SOURCES / VSS` | 数字地符号 |
| **SIGNAL_VOLTAGE（AC_VOLTAGE）** | `Sources / SIGNAL_VOLTAGE_SOURCES / AC_VOLTAGE` | 正弦信号源，**可设 AC Analysis Magnitude**（做 AC 分析必须设） |
| **PULSE_VOLTAGE** | `Sources / SIGNAL_VOLTAGE_SOURCES / PULSE_VOLTAGE` | 脉冲源，`PULSE(V1 V2 TD TR TF PW PER)` |
| **CLOCK_VOLTAGE** | `Sources / SIGNAL_VOLTAGE_SOURCES / CLOCK_VOLTAGE` | 时钟源，**PULSE 导入不稳时的替代品**，直接设频率/占空比 |
| **EXPONENTIAL_VOLTAGE** | `Sources / SIGNAL_VOLTAGE_SOURCES / EXPONENTIAL_VOLTAGE` | 指数源 |
| **PWL_VOLTAGE** | `Sources / SIGNAL_VOLTAGE_SOURCES / PIECEWISE_LINEAR_VOLTAGE` | 分段线性源 |
| **SIGNAL_CURRENT** | `Sources / SIGNAL_CURRENT_SOURCES / AC_CURRENT` 等 | 信号电流源 |
| **受控源（VCVS 等）** | `Sources / CONTROLLED_VOLTAGE_SOURCES / VOLTAGE_CONTROLLED_VOLTAGE_SOURCE` | 四类受控源都有对应 Family |

> 💡 **网表里的 `V` 行**导入后通常落到 `SIGNAL_VOLTAGE_SOURCES` 或 `POWER_SOURCES`，
> 具体取决于有没有 `PULSE/SIN/EXP` 等瞬态关键字。若导入后变成 `DC_POWER`（丢了波形），
> 手动换成 `CLOCK_VOLTAGE` / `PULSE_VOLTAGE` 并重新填参数。

---

## 二、无源元件（Basic）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **Resistor（电阻）** | `Basic / RESISTOR / <阻值>` | 选 `1.0k` 等标称值；**要任意值选 `RESISTOR_VIRTUAL` 或改属性** |
| **Potentiometer（电位器）** | `Basic / POTENTIOMETER / <阻值>` | 可调电阻，仿真中按 `A` / `Shift+A` 调百分比 |
| **Capacitor（电容）** | `Basic / CAPACITOR / <容值>` | 无极性；有任意值需求同上 |
| **Capacitor（电解/有极性）** | `Basic / CAP_ELECTROLIT / <容值>` | **有正负极性**，接反会报错或不收敛 |
| **可变电容** | `Basic / CAPACITOR_VARIABLE / <容值>` | |
| **Inductor（电感）** | `Basic / INDUCTOR / <感值>` | |
| **可变电感** | `Basic / INDUCTOR_VARIABLE / <感值>` | |
| **Transformer（变压器）** | `Basic / TRANSFORMER / <型号>` | |
| **Switch（开关）** | `Basic / SWITCH / <类型>` | 仿真中按空格切换 |
| **Relay（继电器）** | `Basic / RELAY / <型号>` | |
| **Fuse（保险丝）** | `Basic / FUSE / <额定电流>` | |

> ⚠️ 网表写 `10u` 的电容导入后如果是 `CAPACITOR`（无极性）没问题；
> 若你期望的是电解电容（比如 100 µF 以上），手动换成 `CAP_ELECTROLIT` 并注意极性。

---

## 三、二极管（Diodes）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **1N4148** | `Diodes / DIODE / 1N4148` | 高速开关二极管，Vf ≈ 0.7 V |
| **1N4007** | `Diodes / DIODE / 1N4007`（部分版本在 `RECTIFIER_DIODE`） | 整流二极管，1 A / 1000 V |
| **1N4001~1N4006** | `Diodes / DIODE / 1N400x` | 同系列 |
| **LED_red（红）** | `Diodes / LED / LED_red` | **Vf ≈ 2.0 V**，If(max) ≈ 20 mA |
| **LED_green（绿）** | `Diodes / LED / LED_green` | **Vf ≈ 2.2 V** |
| **LED_yellow / LED_blue / LED_white** | `Diodes / LED / LED_yellow` 等 | 蓝/白 Vf ≈ 3.0~3.6 V |
| **稳压管（Zener）** | `Diodes / ZENER / <稳压值>` | 如 `1N4733A`（5.1 V） |
| **肖特基** | `Diodes / SCHOTTKY_DIODE / <型号>` | Vf ≈ 0.3 V |
| **整流桥** | `Diodes / FWB / <型号>` | Full-wave bridge |
| **晶闸管 SCR / 双向可控硅 TRIAC** | `Diodes / SCR`、`Diodes / TRIAC` | |
| **光电二极管 / 光耦** | `Diodes / PHOTO_DIODE`、`Optocoupler` 组 | |

> 💡 **换 LED 颜色 = 换 Vf = 换电流**。同一个 5 V 限流电阻下，
> 红（Vf 2.0 V）→ 绿（2.2 V）→ 蓝（3.3 V），电流会依次明显下降。这是"电路没变但灯变暗"的元凶。

---

## 四、三极管（Transistors）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **2N2222** | `Transistors / BJT_NPN / 2N2222` | NPN 小信号/开关，**本项目默认管**，Ic(max) 800 mA |
| **2N3904** | `Transistors / BJT_NPN / 2N3904` | NPN 小信号，Ic(max) 200 mA |
| **BC547** | `Transistors / BJT_NPN / BC547`（常见为 `BC547A/B/C`） | 欧洲常用 NPN |
| **2N2907 / 2N3906 / BC557** | `Transistors / BJT_PNP / <型号>` | PNP 对应管 |
| **BC547 / BC557 系列** | `Transistors / BJT_NPN` / `BJT_PNP` | |
| **TIP31 / TIP41（功率 NPN）** | `Transistors / POWER_BJT_NPN / <型号>` | |
| **虚拟三极管（可自定义 β）** | `Transistors / TRANSISTORS_VIRTUAL / BJT_NPN_VIRTUAL` | **做教学演示想改 β 时用这个** |
| **MOSFET（N/P 沟道）** | `Transistors / MOSFET_N` / `MOSFET_P` | 如 `2N7000` |
| **JFET** | `Transistors / JFET_N` / `JFET_P` | |
| **IGBT / 达林顿** | `Transistors / IGBT`、`Transistors / DARLINGTON_NPN` | |

> ⚠️ **TO-92 引脚顺序**：正面（平面）朝自己、引脚朝下，**左起 E - B - C**（2N2222 / 2N3904 / BC547 都是）。
> 不同厂家/封装（如 SOT-23、某些 PNP）可能不同，**以 datasheet 为准**。接错引脚是最常见的实做故障。

---

## 五、运算放大器与比较器（Analog）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **741 / LM741** | `Analog / OPAMP / 741`（部分版本为 `LM741H` / `LM741CN`） | 经典单运放，DIP-8 |
| **LM358** | `Analog / OPAMP / LM358N`（或 `LM358P` / `LM358AD`） | 双运放，单电源可用，DIP-8 |
| **LM324** | `Analog / OPAMP / LM324N` | 四运放，单电源 |
| **LM393** | `Analog / COMPARATOR / LM393N` | 双电压比较器（**不是运放**，输出需上拉） |
| **LM311** | `Analog / COMPARATOR / LM311N` | 单比较器 |
| **TL081 / TL082** | `Analog / OPAMP / TL081` 等 | JFET 输入运放 |
| **OP07 / AD620 / INA128** | `Analog / OPAMP / <型号>` | 精密运放 / 仪表放大器 |
| **虚拟运放（理想）** | `Analog / OPAMP / OPAMP_3T_VIRTUAL`（或 `OPAMP_5T_VIRTUAL`） | **教学推导时想用理想运放选这个** |

> 💡 网表里写 `.MODEL` 定义运放是不可行的（运放是多端器件），
> **运放一律靠黑盒替换为上表库件**。741 的引脚：2 = 反相输入，3 = 同相输入，
> 4 = V−，6 = 输出，7 = V+（DIP-8，1/5/8 为调零/空脚）。

---

## 六、定时器与混合器件（Mixed）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **NE555 / LM555** | `Mixed / TIMER / LM555CN`（搜 `NE555` 亦可） | **本项目 003 用的**，DIP-8 |
| **LM556（双 555）** | `Mixed / TIMER / LM556CN` | |
| **ADC / DAC** | `Mixed / ADC_DAC / <型号>` | |
| **模拟开关** | `Mixed / ANALOG_SWITCH / <型号>` | |
| **乘法器 / 除法器** | `Mixed / MULTIPLIER`、`Mixed / DIVIDER` | |
| **滤波器** | `Mixed / FILTER / <型号>` | |
| **555 引脚（DIP-8）** | 1=GND 2=TRIG 3=OUT 4=RESET 5=CTRL 6=THR 7=DIS 8=VCC | **本项目 003 网表按此顺序** |

---

## 七、稳压与电源管理（Power Management）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **LM7805 / LM7812** | `Power / VOLTAGE_REGULATOR / LM7805CT` 等 | 三端线性稳压器，正输入、地、正输出 |
| **LM7905 / LM7912** | `Power / VOLTAGE_REGULATOR / LM7905CT` 等 | 负电压三端稳压器，注意输入输出极性 |
| **LM317** | `Power / VOLTAGE_REGULATOR / LM317T` | 可调正稳压器，需按数据手册设置反馈电阻 |
| **LM337** | `Power / VOLTAGE_REGULATOR / LM337T` | 可调负稳压器 |
| **LM7805_VIRTUAL** | `Power / VOLTAGE_REGULATOR / LM78XX_VIRTUAL` | 教学或快速验证时使用的虚拟三端稳压器 |
| **TL431** | `Power / VOLTAGE_REFERENCE / TL431` | 可调精密基准/并联稳压器 |
| **电池** | `Sources / POWER_SOURCES / BATTERY` | 直流电池模型，可设置电压和内阻 |

## 八、晶闸管与光耦（Thyristors & Optocouplers）

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **SCR** | `Diodes / SCR / <型号>` | 单向可控硅，端子为 A / K / G |
| **TRIAC** | `Diodes / TRIAC / <型号>` | 双向可控硅，适合交流调光和交流开关 |
| **DIAC** | `Diodes / DIAC / <型号>` | 双向触发二极管，常与 TRIAC 配合 |
| **UJT** | `Transistors / UJT / <型号>` | 单结晶体管，可用于弛张振荡器 |
| **MOC3021** | `Optocouplers / OPTOCOUPLER / MOC3021` | 随机导通型光耦，适合 TRIAC 触发 |
| **4N25 / PC817** | `Optocouplers / OPTOCOUPLER / <型号>` | 晶体管输出光耦，用于信号隔离 |

## 九、TTL / CMOS 数字逻辑

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **74LS00** | `TTL / 74LS / 74LS00N` | 四路二输入 NAND 门 |
| **74LS04** | `TTL / 74LS / 74LS04N` | 六路反相器 |
| **74LS08** | `TTL / 74LS / 74LS08N` | 四路二输入 AND 门 |
| **74LS32** | `TTL / 74LS / 74LS32N` | 四路二输入 OR 门 |
| **74LS86** | `TTL / 74LS / 74LS86N` | 四路二输入 XOR 门 |
| **74HC00 / 74HC04** | `CMOS / 74HC_4V / 74HC00N_4V` 等 | CMOS NAND / 反相器，注意逻辑电源电压 |
| **CD4017** | `CMOS / 4000 / 4017BD_10V` | 十进制计数器/分频器 |
| **CD4013** | `CMOS / 4000 / 4013BD_10V` | 双 D 触发器 |
| **74LS161** | `TTL / 74LS / 74LS161N` | 四位同步二进制计数器 |

## 十、显示与输入器件

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **七段数码管（共阴）** | `Indicators / HEX_DISPLAY / SEVEN_SEG_COM_CATHODE` | 段线通常为 a~g，公共阴极接地 |
| **七段数码管（共阳）** | `Indicators / HEX_DISPLAY / SEVEN_SEG_COM_ANODE` | 公共阳极接正电源，段线通常低电平点亮 |
| **LCD 16x2** | `Indicators / LCD / LCD_16X2` | 字符型液晶显示器，适合 MCU 接口实验 |
| **LED BARGRAPH** | `Indicators / LED / LED_BARGRAPH` | LED 条形图，用于电平显示 |
| **按钮** | `Basic / SWITCH / PUSHBUTTON` | 瞬时按键，仿真时按空格或鼠标操作 |
| **DIP 开关** | `Basic / SWITCH / DIP_SWITCH` | 多位拨码开关，可作为数字输入 |
| **蜂鸣器** | `Indicators / AUDIBLE / BUZZER` | 有源/无源型号名称可能不同，搜 `BUZZER` |

## 十一、机电与传感器

| 元件 | Group / Family / Component | 说明 |
|------|---------------------------|------|
| **直流电机** | `Electromechanical / MOTORS / DC_MOTOR` | 感性负载，开关时应并联续流二极管 |
| **步进电机** | `Electromechanical / MOTORS / STEPPER_MOTOR` | 配合驱动器或 H 桥使用 |
| **继电器** | `Electromechanical / RELAY / <型号>` | 线圈与触点隔离，注意线圈额定电压 |
| **LDR 光敏电阻** | `Sensors / OPTOELECTRONIC / PHOTORESISTOR` | 阻值随光照变化 |
| **热敏电阻 NTC / PTC** | `Basic / THERMISTOR / NTC` 或 `PTC` | 温度变化引起阻值变化 |
| **压电片** | `Electromechanical / TRANSDUCERS / PIEZO` | 可作蜂鸣器或振动传感器 |

## 十二、仪器（不是元件，从右侧仪器栏拖）

| 仪器 | 默认代号 | 取用路径 |
|------|---------|---------|
| 函数发生器 | XFG1 | `Simulate → Instruments → Function Generator`（或右侧仪器工具栏） |
| 示波器 | XSC1 | `Simulate → Instruments → Oscilloscope`（**四通道版是 4 Channel Oscilloscope**） |
| 万用表 | XMM1 | `Simulate → Instruments → Multimeter` |
| 波特图仪 | XBP1 | `Simulate → Instruments → Bode Plotter` |
| 频率计 | XFC1 | `Simulate → Instruments → Frequency Counter` |
| 失真分析仪 | XDA1 | `Simulate → Instruments → Distortion Analyzer` |
| 瓦特表 | XWM1 | `Simulate → Instruments → Wattmeter` |
| 逻辑分析仪 | XLA1 | `Simulate → Instruments → Logic Analyzer` |
| 字发生器 | XWG1 | `Simulate → Instruments → Word Generator` |

---

## 十三、快捷键（整理原理图时省时间）

| 操作 | 快捷键 |
|------|--------|
| 旋转 90°（顺时针） | `Ctrl + R` |
| 旋转 90°（逆时针） | `Ctrl + Shift + R` |
| 水平镜像 | `Ctrl + 左/右方向键`（**会翻转引脚，慎用**） |
| 打开元件属性 | 双击元件 |
| 放置网络标签 | `Place → Net` 或双击导线改名 |
| 显示节点编号 | `Tools → Circuit → Show Node Numbers`（**查悬空节点必备**） |
| 复制元件属性 | 选中后 `Ctrl + D` |
| 运行 / 停止仿真 | `F5` / `Ctrl + T`?（以实际菜单为准：`Simulate → Run`） |

---

## 十四、发现路径不对？

提 PR 改这张表！在表格里改一行 + 在下面"版本差异记录"里补一行即可：

| 元件 | 你的 Multisim 版本 | 实际路径 |
|------|------------------|---------|
| | | |
