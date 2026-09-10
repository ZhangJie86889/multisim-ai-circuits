# 001 · BJT 开关驱动 LED —— 验证记录

> 状态：🟡 **待验证**
> 验证人：________　日期：________　Multisim 版本：________（目标 14.3）

## 1. 验证环境

| 项 | 值 |
|----|----|
| Multisim 版本 | |
| 操作系统 | |
| 导入方式 | `File → Open`，文件类型 `SPICE netlist (*.cir)` |
| 是否黑盒替换 | 需要：Q1 → `Transistors / BJT_NPN / 2N2222`；DLED → `Diodes / LED / LED_red`；VIN → `CLOCK_VOLTAGE`（若 PULSE 导入失败） |
| 分析是否重设 | 需要：`Transient Analysis`，End time 3 ms，Maximum time step 1 us |

## 2. 理论值 vs 实测值

| # | 观测量 | 理论值 | 实测值 | 误差 | 结论 |
|---|--------|--------|--------|------|------|
| 1 | Ib（输入高电平平台） | 0.43 mA | | | |
| 2 | Ic(sat) | 2.8 mA | | | |
| 3 | Vce（饱和时） | ≈ 0.20 V | | | |
| 4 | Vce（截止时） | ≈ 5.00 V | | | |
| 5 | LED 正向电流 If | 2.8 mA | | | |
| 6 | LED 阳极对地电压（导通） | ≈ 2.2 V | | | |
| 7 | 输入方波频率 | 1.00 kHz | | | |
| 8 | 输出方波频率 | 1.00 kHz | | | |
| 9 | 导通延迟 / 拖尾 | < 5 us | | | |

## 3. 手算过程（用网表元件值）

```text
VCC = 5 V，Vf(LED_red) ≈ 2.0 V，Vce(sat) ≈ 0.2 V，Vbe ≈ 0.7 V，β(2N2222) ≈ 200

1) 集电极回路（饱和时）
   Ic(sat) = (VCC - Vf - Vce(sat)) / RC
           = (5 - 2.0 - 0.2) / 1k
           = 2.8 mA

2) 基极回路（输入高电平 5 V）
   Ib = (Vin_high - Vbe) / RB
      = (5 - 0.7) / 10k
      = 0.43 mA

3) 饱和判据
   所需最小 Ib = Ic(sat) / β = 2.8 mA / 200 = 14 uA
   实际 Ib = 0.43 mA = 30 倍余量  →  深度饱和
   强制 β = Ic / Ib = 2.8 / 0.43 = 6.5  ≪ 200  →  确认饱和

4) 截止时
   Ib = 0 → Ic ≈ 0 → RC 与 LED 上无压降 → V(COL) = VCC = 5 V

5) 功耗
   P(RC)  = (2.8 mA)^2 * 1k       = 7.84 mW
   P(LED) = 2.0 V * 2.8 mA * 50%  = 2.8 mW
   P(Q1)  = 0.2 V * 2.8 mA * 50%  = 0.28 mW
   P(RB)  = (5 - 0.7)^2 / 10k * 50% = 0.92 mW
   全部 ≪ 250 mW，1/4 W 封装安全
```

## 4. 导入过程记录

| 步骤 | 现象 | 是否正常 |
|------|------|---------|
| File → Open 导入 .cir | | |
| 元件摆放顺序 | 预期 VIN → RB → Q1 → DLED → RC → VCC 左到右 | |
| 黑盒替换 Q1 / DLED | | |
| 首次 Run（Transient） | | |
| 是否报 floating node | | |

## 5. 截图

（暂无 —— 建议放：原理图、Grapher 波形带游标、XFG1/XSC1 面板）

## 6. 结论

- [ ] 全部观测量在可接受误差内 → 改 README front-matter 为 🟢 `已验证`
- [ ] 有观测量超差但已定位 → 🔴 `验证失败`，写清原因
- [x] 尚未验证 → 保持 🟡 `待验证`

**备注 / 已知问题**：

1. 本电路理论值依赖 `LED_red` 的 `Vf ≈ 2.0 V`。Multisim 库里 `LED_red` 的实际模型参数
   可能不同，若实测 Ic 偏离 2.8 mA 超过 ±20%，先查 `Vf`（用 XMM1 二极管档或看 Grapher 里 DLED 两端电压），
   再回头修 `RC`。
2. `PULSE_VOLTAGE` 在部分 Multisim 版本导入会失败 → 换 `CLOCK_VOLTAGE`（1 kHz、50%、5 V），
   或直接删掉 VIN 用外部 XFG1。
3. `.OP` 分析对方波电路意义有限（会停在 t=0 的初值），主要看 `.TRAN`。
