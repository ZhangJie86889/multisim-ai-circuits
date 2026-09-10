# 004 使用的提示词（可复现）

## 使用的模型

| 项 | 值 |
|---|---|
| 模型 | GitHub Copilot |
| 日期 | 2026-09-10 |
| 生成轮次 | 第 1 轮 |

## 填完占位符的提示词

```text
设计一个可在 NI Multisim 14.3 导入的一阶无源 RC 低通滤波器。
使用 AC_VOLTAGE 正弦源 VIN、1 kΩ 串联电阻 R1、100 nF 对地电容 C1，
输入 1 kHz、1 V 峰值，输出节点为 OUT。要求给出 ANSI ASCII .cir 网表，
包含 .OP、.AC DEC 10 10 100k、.TRAN 1u 5m 0 1u，元件行顺序为 VIN,R1,C1，
并说明 fc、时间常数、幅频相频验证方法、Multisim 库路径、网格坐标和易错点。
禁止使用 .SUBCKT、.MEAS、.PRINT 等额外 SPICE 指令。
```

## 自检结果

- [x] 网表元件行顺序为 `VIN,R1,C1`
- [x] 网表注释为英文 ASCII
- [x] 已给出 AC、Transient 和理论验证值
- [ ] 已在 Multisim 里实际导入并跑通 → **未跑通**，故 `status: 待验证`
