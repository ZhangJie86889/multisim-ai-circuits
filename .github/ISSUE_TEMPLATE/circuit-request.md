---
name: 求电路（Circuit Request）
about: 想要一个还没有的电路？填这份表单，字段与生成模板的占位符一一对应
title: "[求电路] "
labels: ["circuit-request", "待领取"]
assignees: ''
---

## 填写说明

下面每个字段都对应 [`prompts/circuit-generation-template.md`](../../prompts/circuit-generation-template.md)
里的一个 `{{占位符}}`。**填完直接复制到模板里就能用**。
不确定怎么填的字段，看 [`prompts/README.md`](../../prompts/README.md) 的示例，或留 `不确定`。

---

### 1. 电路名称
<!-- {{电路名称}} —— 写「拓扑 + 核心器件 + 关键指标」，20 字以内 -->

例：2N2222 饱和开关驱动红色 LED（5 V / 约 3 mA）

**你的：**

### 2. 验证仪器
<!-- {{验证仪器}} —— 写 Multisim 仪器代号：XSC1 示波器 / XMM1 万用表 / XBP1 波特图仪 / XFC1 频率计 / XDA1 失真仪 -->

- [ ] XSC1 示波器
- [ ] XMM1 万用表
- [ ] XBP1 波特图仪
- [ ] XFC1 频率计
- [ ] XDA1 失真分析仪
- [ ] 其他：

### 3. 验证目标
<!-- {{验证目标}} —— 「要看什么量」+「预期数值」 -->

例：确认输入高电平时 Q1 进入饱和（Vce < 0.3 V），LED 电流约 3 mA

**你的：**

### 4. 电源
<!-- {{电源规格}} —— 单/双电源 + 电压 + 网络名 -->

例：单电源 VCC = 5 V（网络名 VCC，对地）

**你的：**

### 5. 输入信号
<!-- {{输入信号}} —— 波形 + 频率 + 幅值（标明 Vpp/Vpk/Vrms）+ 直流偏置 -->

例：1 kHz 方波，0 V ~ 5 V（Vpp = 5 V、Offset = 2.5 V），占空比 50%

**你的：**

### 6. 性能指标
<!-- {{性能指标}} —— 量化 + 单位 + 边界（≥ / ≤ / 典型值） -->

例：电压增益 |Av| ≥ 20（1 kHz、RL = 10 kΩ）；下限频率 ≤ 100 Hz

**你的：**

### 7. 负载
<!-- {{负载}} —— 阻性/容性 + 数值；没有就写「空载」 -->

**你的：**

### 8. 关键元件
<!-- {{有源器件及型号}} + {{元器件清单}} —— 型号必须是 Multisim 主数据库里能搜到的，
     路径参考 docs/multisim-library-map.md。一行一个：标号 | 库路径 | 参数 -->

| 网表标号 | Multisim 库路径 | 参数 |
|---------|----------------|------|
| 例：Q1 | Transistors / BJT_NPN / 2N2222 | NPN，β ≈ 200 |
| | | |
| | | |

### 9. 其他要求
<!-- {{关键设计计算}} / {{信号流向}} / 特殊约束 -->

- 关键设计计算（已知就填，没有就写「由 AI 推导，需人工复核」）：
- 信号流向（输入 → … → 输出）：
- 已尝试过的方法 / 踩过的坑：
- 参考教材或实验指导书页码：
- 是否愿意在电路生成后**亲自用 Multisim 验证并回填实测值**：[ ] 是 [ ] 否

---

## 领取须知（给想接单的贡献者）

1. 复制本 Issue 内容 → 填进 [`prompts/circuit-generation-template.md`](../../prompts/circuit-generation-template.md)。
2. 丢给任意大模型，拿到 7 部分输出。
3. `cp -r circuits/_template/ circuits/NNN-xxx/`，把 7 部分填进去。
4. **必须自己用 Multisim 14.3 实际导入并跑一遍**，把 Grapher 读数填进 `verification.md`。
5. 本地 `python scripts/cir_lint.py circuits/ --strict` 通过后再提 PR，
   并在 PR 描述里写 `Closes #<本 Issue 号>`。

> ⚠️ 没有实测值的 PR 一律保持 `status: 待验证` 合并（或直接被要求补充），
> **不允许**把 AI 算出来的理论值抄进"实测值"列。
