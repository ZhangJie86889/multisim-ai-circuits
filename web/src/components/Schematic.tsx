import type { ReactNode } from "react";

const WIRE = "#0f766e";
const TEXT = "#475569";
const FILL = "#f1f5f9";

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="schematic">
      <div className="lab-grid" style={{ padding: "8px 6px" }}>
        <svg viewBox="0 0 640 280" role="img" aria-label={label}>
          {children}
        </svg>
      </div>
    </div>
  );
}

function Wire({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={WIRE} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />;
}

function Txt({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={TEXT}
      fontSize="11"
      fontFamily="IBM Plex Mono, ui-monospace, monospace"
    >
      {children}
    </text>
  );
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3.2" fill="#0f172a" />;
}

function Box({ x, y, w, h, text }: { x: number; y: number; w: number; h: number; text: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={FILL} stroke={WIRE} strokeWidth="1.4" />
      <Txt x={x + w / 2} y={y + h / 2 + 4}>
        {text}
      </Txt>
    </>
  );
}

export function Schematic({ id }: { id: string }) {
  if (id === "001") {
    return (
      <Frame label="BJT LED 开关原理图">
        <Txt x={70} y={200}>VIN</Txt>
        <Txt x={70} y={218}>1kHz</Txt>
        <Wire d="M80 190 V40" />
        <Dot x={80} y={190} />
        <Wire d="M80 190 H160" />
        <Box x={160} y={178} w={70} h={24} text="RB 10k" />
        <Wire d="M230 190 H300" />
        <Dot x={300} y={190} />
        <Txt x={300} y={208}>B</Txt>
        <Wire d="M300 190 L340 150" />
        <Wire d="M300 190 L340 230" />
        <Wire d="M332 142 L348 158" />
        <Wire d="M340 150 V70" />
        <Dot x={340} y={118} />
        <path d="M340 96 l12 14 -12 14 -12 -14 z" fill="none" stroke={WIRE} strokeWidth="1.6" />
        <Wire d="M328 110 L352 124" />
        <Txt x={372} y={116} anchor="start">DLED</Txt>
        <Wire d="M340 96 V70" />
        <Box x={305} y={50} w={70} h={22} text="RC 1k" />
        <Wire d="M340 50 V28" />
        <Dot x={340} y={28} />
        <Txt x={370} y={32} anchor="start">VCC 5V</Txt>
        <Wire d="M340 230 V250" />
        <Wire d="M70 250 H400" />
        <Txt x={80} y={268} anchor="start">GND 0</Txt>
        <Txt x={348} y={142} anchor="start">C</Txt>
        <Txt x={348} y={236} anchor="start">E</Txt>
        <Txt x={430} y={160} anchor="start">Q1 2N2222</Txt>
      </Frame>
    );
  }

  if (id === "002") {
    return (
      <Frame label="共射放大原理图">
        <Txt x={50} y={168}>VIN</Txt>
        <Wire d="M70 160 H110" />
        <Box x={110} y={148} w={54} h={24} text="C1 10u" />
        <Wire d="M164 160 H250" />
        <Dot x={250} y={160} />
        <Txt x={250} y={146}>B</Txt>
        <Wire d="M250 160 V210" />
        <Box x={228} y={210} w={50} h={22} text="R2 8.2k" />
        <Wire d="M250 232 V255" />
        <Wire d="M250 160 L290 130" />
        <Wire d="M250 160 L290 200" />
        <Wire d="M290 130 V80" />
        <Dot x={290} y={80} />
        <Box x={264} y={48} w={50} h={22} text="RC 4.7k" />
        <Wire d="M290 48 V24" />
        <Wire d="M250 24 H520" />
        <Txt x={400} y={18}>VCC 12V</Txt>
        <Box x={224} y={24} w={50} h={22} text="R1 47k" />
        <Wire d="M250 46 V160" />
        <Wire d="M290 200 V222" />
        <Box x={262} y={222} w={50} h={22} text="RE1 100" />
        <Wire d="M290 244 V255" />
        <Wire d="M332 222 V244" />
        <Box x={310} y={200} w={50} h={22} text="CE 100u" />
        <Wire d="M332 244 V255" />
        <Wire d="M70 255 H520" />
        <Txt x={80} y={272} anchor="start">GND</Txt>
        <Wire d="M290 80 H400" />
        <Box x={400} y={68} w={54} h={24} text="C2 10u" />
        <Wire d="M454 80 H510" />
        <Dot x={510} y={80} />
        <Txt x={546} y={84} anchor="start">OUT</Txt>
        <Wire d="M510 80 V210" />
        <Box x={486} y={210} w={50} h={22} text="RL 10k" />
        <Wire d="M510 232 V255" />
        <Txt x={312} y={150} anchor="start">Q1</Txt>
        <Txt x={300} y={260} anchor="start" >RE2 900 在 RE1 下方</Txt>
      </Frame>
    );
  }

  return (
    <Frame label="555 无稳态原理图">
      <rect x="230" y="70" width="160" height="120" rx="8" fill={FILL} stroke={WIRE} strokeWidth="1.6" />
      <Txt x={310} y={132}>LM555CN</Txt>
      <Txt x={310} y={148}>XU1</Txt>
      <Txt x={238} y={92} anchor="start">1 GND</Txt>
      <Txt x={238} y={168} anchor="start">8 VCC</Txt>
      <Txt x={382} y={92} anchor="end">4 RESET</Txt>
      <Txt x={382} y={168} anchor="end">5 CTRL</Txt>
      <Wire d="M230 100 H170 V255" />
      <Wire d="M230 88 H200 V40 H390" />
      <Wire d="M390 70 V40" />
      <Txt x={310} y={28}>VCC 5V</Txt>
      <Txt x={478} y={92} anchor="start">RESET→VCC</Txt>
      <Wire d="M390 100 H470" />
      <Wire d="M390 140 H440" />
      <Box x={440} y={128} w={50} h={22} text="RA 8.2k" />
      <Wire d="M490 139 H530 V180" />
      <Dot x={530} y={180} />
      <Txt x={546} y={176} anchor="start">DIS</Txt>
      <Box x={508} y={180} w={50} h={22} text="RB 68k" />
      <Wire d="M530 202 V230" />
      <Dot x={530} y={230} />
      <Txt x={546} y={226} anchor="start">THR</Txt>
      <Wire d="M390 180 H530" />
      <Wire d="M530 230 V250" />
      <Box x={508} y={250} w={50} h={22} text="CT 10n" />
      <Wire d="M530 272 H170" />
      <Txt x={470} y={200} anchor="start">CC 10n→GND</Txt>
      <Wire d="M310 190 V220" />
      <Dot x={310} y={220} />
      <Txt x={318} y={236} anchor="start">OUT</Txt>
      <Wire d="M310 220 H80" />
      <Txt x={70} y={216}>OUT</Txt>
      <Wire d="M80 220 V250" />
      <Box x={56} y={248} w={50} h={22} text="RL 10k" />
    </Frame>
  );
}
