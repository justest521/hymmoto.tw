'use client';

import React from 'react';

interface VehicleVisualProps {
  brand?: string;
  modelName?: string;
  cc?: number | null;
  hp?: number | null;
  weight?: number | null;
  price?: number | null;
  category?: string | null;
  seatHeight?: number | null;     // mm
  engineType?: string | null;     // DB engine_type string
  cooling?: string | null;        // air/water/oil/electric
  fuelTank?: number | null;       // liters
  accentColor?: string;
  width?: number;
  height?: number;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ═══════════════════════════════════════════
//  ENGINE TYPE DETECTION
// ═══════════════════════════════════════════
type EngineLayout = 'single' | 'parallel-twin' | 'v-twin' | 'inline-3' | 'inline-4' | 'v4' | 'boxer' | 'electric';

function detectEngine(engineType: string | null, cc: number): EngineLayout {
  if (!engineType) {
    if (cc === 0) return 'electric';
    if (cc <= 300) return 'single';
    if (cc <= 700) return 'parallel-twin';
    return 'inline-4';
  }
  const e = engineType.toLowerCase();
  if (e.includes('電動') || e.includes('馬達') || e.includes('electric') || e.includes('motor')) return 'electric';
  if (e.includes('水平對臥') || e.includes('boxer')) return 'boxer';
  if (e.includes('v4') || (e.includes('v') && e.includes('四缸'))) return 'v4';
  if (e.includes('v型') || e.includes('l型') || e.includes('milwaukee') || e.includes('revolution')) return 'v-twin';
  if (e.includes('三缸') || e.includes('並列三') || e.includes('直列三')) return 'inline-3';
  if (e.includes('四缸') || e.includes('並列四') || e.includes('直列四')) return 'inline-4';
  if (e.includes('雙缸') || e.includes('twin') || e.includes('並列雙') || e.includes('直列雙')) return 'parallel-twin';
  if (e.includes('單缸') || e.includes('single') || e.includes('空冷')) return 'single';
  if (cc <= 300) return 'single';
  if (cc <= 700) return 'parallel-twin';
  return 'inline-4';
}

type BikeType = 'scooter' | 'sport' | 'cruiser' | 'adv' | 'naked' | 'touring' | 'classic' | 'cub' | 'electric';

function detectType(cc: number, cat: string): BikeType {
  const c = cat.toLowerCase();
  if (c === 'scooter') return 'scooter';
  if (c === 'commuter') return 'scooter';
  if (c === 'cub') return 'cub';
  if (c === 'electric') return 'electric';
  if (c === 'sport') return 'sport';
  if (c === 'cruiser') return 'cruiser';
  if (c === 'classic') return 'classic';
  if (c === 'adventure') return 'adv';
  if (c === 'touring') return 'touring';
  if (c === 'naked') return 'naked';
  if (cc <= 180) return 'scooter';
  if (cc >= 900) return 'cruiser';
  return 'naked';
}

function isWaterCooled(cooling: string | null): boolean {
  if (!cooling) return false;
  const c = cooling.toLowerCase();
  return c.includes('water') || c.includes('水');
}

// ═══════════════════════════════════════════
//  PARAMETRIC MOTORCYCLE DRAWING
//  ViewBox: 0 0 300 160
// ═══════════════════════════════════════════

interface BikeGeometry {
  frontWheelX: number; frontWheelR: number;
  rearWheelX: number; rearWheelR: number;
  groundY: number;
  steeringHeadX: number; steeringHeadY: number;
  seatFrontX: number; seatFrontY: number;
  seatRearX: number; seatRearY: number;
  swingarmPivotX: number; swingarmPivotY: number;
  tankFrontX: number; tankFrontY: number; tankTopY: number; tankRearX: number;
  engineX: number; engineY: number; engineW: number; engineH: number;
  forkAngle: number;
  handlebarDY: number; handlebarWidth: number;
  hasFairing: boolean; hasWindscreen: boolean; hasTopCase: boolean;
  hasPannier: boolean; hasBeak: boolean; hasFloorboard: boolean; hasSissyBar: boolean;
}

function computeGeometry(type: BikeType, cc: number, seatHeight: number | null, weight: number | null, fuelTank: number | null, engine: EngineLayout): BikeGeometry {
  const seatH = seatHeight ?? (type === 'adv' ? 850 : type === 'cruiser' ? 720 : type === 'scooter' ? 770 : 800);
  const seatNorm = (seatH - 700) / 170; // 0=low, 1=high
  const w = weight ?? 170;
  const massScale = Math.min(1.3, Math.max(0.7, w / 200));
  const tank = fuelTank ?? 12;
  const tankScale = Math.min(1.4, Math.max(0.6, tank / 15));
  const groundY = 148;

  const base: Record<BikeType, Partial<BikeGeometry>> = {
    scooter: {
      frontWheelX: 75, frontWheelR: 18, rearWheelX: 225, rearWheelR: 18,
      steeringHeadX: 92, steeringHeadY: 78,
      forkAngle: 26, handlebarDY: -18, handlebarWidth: 18,
      hasFairing: false, hasWindscreen: true, hasFloorboard: true,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: false,
    },
    cub: {
      frontWheelX: 68, frontWheelR: 20, rearWheelX: 228, rearWheelR: 20,
      steeringHeadX: 88, steeringHeadY: 75,
      forkAngle: 27, handlebarDY: -22, handlebarWidth: 22,
      hasFairing: false, hasWindscreen: false, hasFloorboard: false,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: false,
    },
    sport: {
      frontWheelX: 62, frontWheelR: 22, rearWheelX: 238, rearWheelR: 22,
      steeringHeadX: 85, steeringHeadY: 72,
      forkAngle: 22, handlebarDY: -5, handlebarWidth: 14,
      hasFairing: true, hasWindscreen: true, hasFloorboard: false,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: false,
    },
    cruiser: {
      frontWheelX: 52, frontWheelR: 24, rearWheelX: 248, rearWheelR: 22,
      steeringHeadX: 82, steeringHeadY: 80,
      forkAngle: 35, handlebarDY: -30, handlebarWidth: 28,
      hasFairing: false, hasWindscreen: false, hasFloorboard: false,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: true,
    },
    classic: {
      frontWheelX: 60, frontWheelR: 22, rearWheelX: 238, rearWheelR: 22,
      steeringHeadX: 84, steeringHeadY: 76,
      forkAngle: 27, handlebarDY: -20, handlebarWidth: 22,
      hasFairing: false, hasWindscreen: false, hasFloorboard: false,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: false,
    },
    naked: {
      frontWheelX: 62, frontWheelR: 22, rearWheelX: 238, rearWheelR: 22,
      steeringHeadX: 86, steeringHeadY: 74,
      forkAngle: 24, handlebarDY: -14, handlebarWidth: 20,
      hasFairing: false, hasWindscreen: false, hasFloorboard: false,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: false,
    },
    adv: {
      frontWheelX: 58, frontWheelR: 26, rearWheelX: 242, rearWheelR: 24,
      steeringHeadX: 86, steeringHeadY: 68,
      forkAngle: 26, handlebarDY: -20, handlebarWidth: 24,
      hasFairing: false, hasWindscreen: true, hasFloorboard: false,
      hasTopCase: false, hasPannier: true, hasBeak: true, hasSissyBar: false,
    },
    touring: {
      frontWheelX: 52, frontWheelR: 24, rearWheelX: 250, rearWheelR: 24,
      steeringHeadX: 80, steeringHeadY: 74,
      forkAngle: 30, handlebarDY: -22, handlebarWidth: 24,
      hasFairing: true, hasWindscreen: true, hasFloorboard: false,
      hasTopCase: true, hasPannier: true, hasBeak: false, hasSissyBar: false,
    },
    electric: {
      frontWheelX: 75, frontWheelR: 18, rearWheelX: 225, rearWheelR: 18,
      steeringHeadX: 92, steeringHeadY: 78,
      forkAngle: 26, handlebarDY: -18, handlebarWidth: 18,
      hasFairing: false, hasWindscreen: false, hasFloorboard: true,
      hasTopCase: false, hasPannier: false, hasBeak: false, hasSissyBar: false,
    },
  };

  const b = base[type] || base.naked;
  const shY = b.steeringHeadY! - (seatNorm * 8);
  const seatFY = shY - 4 - (seatNorm * 6);
  const midX = (b.frontWheelX! + b.rearWheelX!) / 2;
  const swX = b.rearWheelX! - 30;
  const swY = groundY - b.rearWheelR! - 10;
  const engX = midX - 15;
  const engY = shY + 15;
  const engW = 45 * massScale;
  const engH = 35 * massScale;
  const tankFX = b.steeringHeadX! + 5;
  const tankTopY2 = seatFY - 6 * tankScale;
  const tankRX = midX + 10;

  return {
    frontWheelX: b.frontWheelX!, frontWheelR: b.frontWheelR!,
    rearWheelX: b.rearWheelX!, rearWheelR: b.rearWheelR!,
    groundY,
    steeringHeadX: b.steeringHeadX!, steeringHeadY: shY,
    seatFrontX: midX - 5, seatFrontY: seatFY,
    seatRearX: swX + 5, seatRearY: seatFY + 2,
    swingarmPivotX: swX, swingarmPivotY: swY,
    tankFrontX: tankFX, tankFrontY: shY - 2, tankTopY: tankTopY2, tankRearX: tankRX,
    engineX: engX, engineY: engY, engineW: engW, engineH: engH,
    forkAngle: b.forkAngle!, handlebarDY: b.handlebarDY!, handlebarWidth: b.handlebarWidth!,
    hasFairing: b.hasFairing!, hasWindscreen: b.hasWindscreen!, hasTopCase: b.hasTopCase!,
    hasPannier: b.hasPannier!, hasBeak: b.hasBeak!, hasFloorboard: b.hasFloorboard!, hasSissyBar: b.hasSissyBar!,
  };
}

// ═══════════════════════════════════════════
//  SVG RENDERING
// ═══════════════════════════════════════════

function renderWheel(cx: number, cy: number, r: number, c: string, key: string): React.ReactNode {
  const spokeCount = r > 20 ? 10 : 8;
  return (
    <g key={key}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="2" opacity="0.5" />
      <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke={c} strokeWidth="0.4" opacity="0.15" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke={c} strokeWidth="0.8" opacity="0.3" />
      <circle cx={cx} cy={cy} r={r * 0.12} fill={c} opacity="0.35" />
      {Array.from({ length: spokeCount }, (_, i) => {
        const a = (i / spokeCount) * Math.PI * 2;
        return (
          <line key={`${key}-s${i}`}
            x1={cx + r * 0.15 * Math.cos(a)} y1={cy + r * 0.15 * Math.sin(a)}
            x2={cx + r * 0.75 * Math.cos(a)} y2={cy + r * 0.75 * Math.sin(a)}
            stroke={c} strokeWidth="0.4" opacity="0.2" />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke={c} strokeWidth="0.5" opacity="0.12" strokeDasharray="2,2" />
      <circle cx={cx} cy={cy} r={1.5} fill={c} opacity="0.5" />
    </g>
  );
}

function renderEngine(g: BikeGeometry, engine: EngineLayout, c: string): React.ReactNode {
  const { engineX: ex, engineY: ey, engineW: ew, engineH: eh } = g;
  const elements: React.ReactNode[] = [];

  elements.push(
    <rect key="eng-block" x={ex} y={ey} width={ew} height={eh} rx={3}
      fill={c} fillOpacity="0.03" stroke={c} strokeWidth="1" opacity="0.4" />
  );

  switch (engine) {
    case 'single': {
      const cylW = ew * 0.4, cylX = ex + (ew - cylW) / 2;
      elements.push(
        <rect key="eng-cyl" x={cylX} y={ey - 8} width={cylW} height={10} rx={2}
          fill="none" stroke={c} strokeWidth="0.8" opacity="0.35" />
      );
      for (let i = 0; i < 4; i++) {
        elements.push(
          <line key={`fin-${i}`} x1={cylX - 3} y1={ey - 6 + i * 2.5} x2={cylX + cylW + 3} y2={ey - 6 + i * 2.5}
            stroke={c} strokeWidth="0.4" opacity="0.2" />
        );
      }
      break;
    }
    case 'parallel-twin': {
      const cylW = ew * 0.28, gap = ew * 0.08;
      const cx1 = ex + (ew / 2) - gap / 2 - cylW, cx2 = ex + (ew / 2) + gap / 2;
      elements.push(
        <rect key="cyl1" x={cx1} y={ey - 10} width={cylW} height={12} rx={2} fill="none" stroke={c} strokeWidth="0.8" opacity="0.35" />,
        <rect key="cyl2" x={cx2} y={ey - 10} width={cylW} height={12} rx={2} fill="none" stroke={c} strokeWidth="0.8" opacity="0.35" />
      );
      break;
    }
    case 'v-twin': {
      const vcx = ex + ew / 2, vcy = ey, cylL = 14, cw = 8;
      elements.push(
        <rect key="vcyl1" x={vcx - cw - 4} y={vcy - cylL} width={cw} height={cylL} rx={2}
          fill="none" stroke={c} strokeWidth="0.8" opacity="0.35"
          transform={`rotate(-25, ${vcx - cw / 2 - 4}, ${vcy})`} />,
        <rect key="vcyl2" x={vcx + 4} y={vcy - cylL} width={cw} height={cylL} rx={2}
          fill="none" stroke={c} strokeWidth="0.8" opacity="0.35"
          transform={`rotate(25, ${vcx + cw / 2 + 4}, ${vcy})`} />
      );
      break;
    }
    case 'inline-3': {
      const cw3 = ew * 0.2, gap3 = (ew - 3 * cw3) / 4;
      for (let i = 0; i < 3; i++) {
        elements.push(
          <rect key={`cyl-${i}`} x={ex + gap3 + i * (cw3 + gap3)} y={ey - 8} width={cw3} height={10} rx={1.5}
            fill="none" stroke={c} strokeWidth="0.7" opacity="0.3" />
        );
      }
      break;
    }
    case 'inline-4': {
      const cw4 = ew * 0.16, gap4 = (ew - 4 * cw4) / 5;
      for (let i = 0; i < 4; i++) {
        elements.push(
          <rect key={`cyl-${i}`} x={ex + gap4 + i * (cw4 + gap4)} y={ey - 8} width={cw4} height={10} rx={1.5}
            fill="none" stroke={c} strokeWidth="0.6" opacity="0.3" />
        );
      }
      break;
    }
    case 'v4': {
      const vcx2 = ex + ew / 2;
      for (let i = 0; i < 2; i++) {
        const ox = (i - 0.5) * 10;
        elements.push(
          <rect key={`v4f-${i}`} x={vcx2 + ox - 5} y={ey - 12} width={7} height={12} rx={1.5}
            fill="none" stroke={c} strokeWidth="0.6" opacity="0.3"
            transform={`rotate(-20, ${vcx2 + ox}, ${ey})`} />,
          <rect key={`v4r-${i}`} x={vcx2 + ox + 2} y={ey - 12} width={7} height={12} rx={1.5}
            fill="none" stroke={c} strokeWidth="0.6" opacity="0.3"
            transform={`rotate(20, ${vcx2 + ox + 5}, ${ey})`} />
        );
      }
      break;
    }
    case 'boxer': {
      const bcy = ey + eh / 2;
      elements.push(
        <rect key="box-l" x={ex - 12} y={bcy - 5} width={14} height={10} rx={2} fill="none" stroke={c} strokeWidth="0.8" opacity="0.35" />,
        <rect key="box-r" x={ex + ew - 2} y={bcy - 5} width={14} height={10} rx={2} fill="none" stroke={c} strokeWidth="0.8" opacity="0.35" />
      );
      break;
    }
    case 'electric': {
      elements.push(
        <rect key="battery" x={ex + 4} y={ey + 3} width={ew - 8} height={eh - 6} rx={3}
          fill="none" stroke={c} strokeWidth="0.8" opacity="0.3" />,
        <path key="bolt" d={`M${ex + ew / 2 + 2},${ey + 6} L${ex + ew / 2 - 3},${ey + eh / 2 + 2} L${ex + ew / 2 + 1},${ey + eh / 2 + 2} L${ex + ew / 2 - 2},${ey + eh - 4} L${ex + ew / 2 + 3},${ey + eh / 2} L${ex + ew / 2 - 1},${ey + eh / 2} Z`}
          fill={c} opacity="0.2" />
      );
      break;
    }
  }
  return <g key="engine-group">{elements}</g>;
}

function renderBike(g: BikeGeometry, engine: EngineLayout, waterCooled: boolean, c: string, type: BikeType): React.ReactNode[] {
  const el: React.ReactNode[] = [];

  // Wheels
  el.push(renderWheel(g.frontWheelX, g.groundY - g.frontWheelR, g.frontWheelR, c, 'fw'));
  el.push(renderWheel(g.rearWheelX, g.groundY - g.rearWheelR, g.rearWheelR, c, 'rw'));

  // Fork (two tubes)
  const fBotX = g.frontWheelX, fBotY = g.groundY - g.frontWheelR;
  el.push(
    <line key="fork1" x1={g.steeringHeadX - 1.5} y1={g.steeringHeadY} x2={fBotX - 1.5} y2={fBotY} stroke={c} strokeWidth="1.5" opacity="0.45" />,
    <line key="fork2" x1={g.steeringHeadX + 1.5} y1={g.steeringHeadY} x2={fBotX + 1.5} y2={fBotY} stroke={c} strokeWidth="1" opacity="0.3" />
  );

  // Handlebar
  const hbY = g.steeringHeadY + g.handlebarDY, hbX = g.steeringHeadX;
  el.push(
    <line key="hbar" x1={hbX - g.handlebarWidth / 2} y1={hbY} x2={hbX + g.handlebarWidth / 2} y2={hbY} stroke={c} strokeWidth="1.2" opacity="0.5" />,
    <line key="stem" x1={hbX} y1={hbY} x2={g.steeringHeadX} y2={g.steeringHeadY} stroke={c} strokeWidth="1" opacity="0.4" />,
    <circle key="grip-l" cx={hbX - g.handlebarWidth / 2} cy={hbY} r="2" fill="none" stroke={c} strokeWidth="0.8" opacity="0.3" />,
    <circle key="grip-r" cx={hbX + g.handlebarWidth / 2} cy={hbY} r="2" fill="none" stroke={c} strokeWidth="0.8" opacity="0.3" />
  );

  // Headlight
  const hlX = g.steeringHeadX - 4, hlY = g.steeringHeadY + 4;
  if (type === 'sport' || type === 'touring') {
    el.push(
      <ellipse key="hl1" cx={hlX - 2} cy={hlY} rx="3" ry="4" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.6" opacity="0.4" />,
      <ellipse key="hl2" cx={hlX + 5} cy={hlY} rx="3" ry="4" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.6" opacity="0.4" />
    );
  } else {
    const hlR = type === 'cruiser' || type === 'classic' ? 6 : 5;
    el.push(<circle key="hl" cx={hlX} cy={hlY} r={hlR} fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.8" opacity="0.45" />);
  }

  // Frame
  el.push(
    <path key="frame-top" d={`M${g.steeringHeadX},${g.steeringHeadY} Q${g.tankRearX},${g.tankFrontY - 3} ${g.seatFrontX},${g.seatFrontY + 5}`} fill="none" stroke={c} strokeWidth="1.2" opacity="0.4" />,
    <path key="frame-down" d={`M${g.steeringHeadX},${g.steeringHeadY + 3} L${g.engineX},${g.engineY + g.engineH} L${g.swingarmPivotX},${g.swingarmPivotY}`} fill="none" stroke={c} strokeWidth="1" opacity="0.35" />,
    <path key="frame-seat" d={`M${g.seatRearX},${g.seatRearY + 5} L${g.swingarmPivotX},${g.swingarmPivotY}`} fill="none" stroke={c} strokeWidth="0.8" opacity="0.3" />
  );

  // Swingarm
  el.push(<line key="swingarm" x1={g.swingarmPivotX} y1={g.swingarmPivotY} x2={g.rearWheelX} y2={g.groundY - g.rearWheelR} stroke={c} strokeWidth="1.5" opacity="0.4" />);

  // Tank
  el.push(
    <path key="tank" d={`M${g.tankFrontX},${g.tankFrontY} Q${(g.tankFrontX + g.tankRearX) / 2},${g.tankTopY} ${g.tankRearX},${g.tankFrontY + 2} L${g.tankRearX},${g.tankFrontY + 8} Q${(g.tankFrontX + g.tankRearX) / 2},${g.tankFrontY + 10} ${g.tankFrontX},${g.tankFrontY + 6} Z`}
      fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.8" opacity="0.45" />,
    <circle key="tank-cap" cx={(g.tankFrontX + g.tankRearX) / 2} cy={g.tankTopY + 3} r="2" fill="none" stroke={c} strokeWidth="0.5" opacity="0.25" />
  );

  // Seat
  el.push(
    <path key="seat" d={`M${g.seatFrontX},${g.seatFrontY} Q${(g.seatFrontX + g.seatRearX) / 2},${g.seatFrontY - 3} ${g.seatRearX},${g.seatRearY} L${g.seatRearX + 3},${g.seatRearY + 5} L${g.seatFrontX - 3},${g.seatFrontY + 4} Z`}
      fill={c} fillOpacity="0.06" stroke={c} strokeWidth="0.7" opacity="0.4" />
  );

  // Engine
  el.push(renderEngine(g, engine, c));

  // Exhaust
  const exSX = g.engineX + g.engineW, exSY = g.engineY + g.engineH - 5;
  if (type === 'sport') {
    el.push(
      <path key="exhaust" d={`M${exSX},${exSY} Q${exSX + 20},${exSY + 8} ${g.rearWheelX - 15},${g.groundY - g.rearWheelR - 5} L${g.rearWheelX - 5},${g.groundY - g.rearWheelR - 8}`} fill="none" stroke={c} strokeWidth="1.2" opacity="0.3" />,
      <ellipse key="ex-tip" cx={g.rearWheelX - 3} cy={g.groundY - g.rearWheelR - 7} rx="3" ry="2" fill="none" stroke={c} strokeWidth="0.6" opacity="0.3" />
    );
  } else if (type === 'adv') {
    el.push(
      <path key="exhaust" d={`M${exSX},${exSY} Q${exSX + 10},${exSY - 15} ${g.seatRearX + 10},${g.seatRearY + 5} L${g.seatRearX + 25},${g.seatRearY + 3}`} fill="none" stroke={c} strokeWidth="1.2" opacity="0.3" />,
      <rect key="ex-tip" x={g.seatRearX + 22} y={g.seatRearY} width={8} height={6} rx={2} fill="none" stroke={c} strokeWidth="0.6" opacity="0.3" />
    );
  } else if (type === 'cruiser') {
    el.push(
      <path key="exhaust1" d={`M${g.engineX + g.engineW - 5},${g.engineY + g.engineH} Q${g.engineX + g.engineW + 15},${g.groundY - 15} ${g.rearWheelX - 10},${g.groundY - 15} L${g.rearWheelX + 5},${g.groundY - 18}`} fill="none" stroke={c} strokeWidth="1.5" opacity="0.3" />,
      <path key="exhaust2" d={`M${g.engineX + g.engineW - 5},${g.engineY + g.engineH - 5} Q${g.engineX + g.engineW + 20},${g.groundY - 22} ${g.rearWheelX - 5},${g.groundY - 22} L${g.rearWheelX + 10},${g.groundY - 25}`} fill="none" stroke={c} strokeWidth="1" opacity="0.2" />
    );
  } else {
    el.push(
      <path key="exhaust" d={`M${exSX},${exSY} Q${exSX + 15},${exSY + 5} ${g.rearWheelX - 20},${g.groundY - 20} L${g.rearWheelX},${g.groundY - 22}`} fill="none" stroke={c} strokeWidth="1.2" opacity="0.3" />,
      <ellipse key="ex-tip" cx={g.rearWheelX + 2} cy={g.groundY - 22} rx="3" ry="2" fill="none" stroke={c} strokeWidth="0.6" opacity="0.25" />
    );
  }

  // Taillight
  el.push(<rect key="taillight" x={g.seatRearX + 2} y={g.seatRearY + 3} width={5} height={3} rx={1} fill={c} opacity="0.3" />);

  // Fenders
  const fwr = g.frontWheelR, fwx = g.frontWheelX, fwy = g.groundY - fwr;
  el.push(<path key="f-fender" d={`M${fwx - fwr - 2},${fwy + 3} Q${fwx - fwr},${fwy - fwr * 0.3} ${fwx},${fwy - fwr - 1} Q${fwx + fwr},${fwy - fwr * 0.3} ${fwx + fwr + 2},${fwy + 3}`} fill="none" stroke={c} strokeWidth="0.6" opacity="0.25" />);
  const rwr = g.rearWheelR, rwx = g.rearWheelX, rwy = g.groundY - rwr;
  el.push(<path key="r-fender" d={`M${rwx - rwr - 2},${rwy + 3} Q${rwx},${rwy - rwr * 0.5} ${rwx + rwr + 2},${rwy + 3}`} fill="none" stroke={c} strokeWidth="0.6" opacity="0.25" />);

  // Optional parts
  if (g.hasFairing) {
    el.push(<path key="fairing" d={`M${g.steeringHeadX - 5},${g.steeringHeadY - 2} Q${g.steeringHeadX - 12},${g.steeringHeadY + 10} ${g.steeringHeadX - 8},${g.engineY + g.engineH} L${g.engineX + g.engineW + 5},${g.engineY + g.engineH} L${g.tankRearX},${g.seatFrontY + 5} L${g.tankFrontX},${g.steeringHeadY - 2} Z`} fill={c} fillOpacity="0.03" stroke={c} strokeWidth="0.6" opacity="0.2" />);
  }
  if (g.hasWindscreen) {
    const wsH = type === 'touring' ? 30 : type === 'adv' ? 25 : 15;
    el.push(<path key="windscreen" d={`M${g.steeringHeadX - 2},${g.steeringHeadY - 5} Q${g.steeringHeadX + 3},${g.steeringHeadY - wsH} ${g.steeringHeadX + 8},${g.steeringHeadY - wsH - 5}`} fill="none" stroke={c} strokeWidth="0.5" opacity="0.18" />);
  }
  if (g.hasFloorboard) {
    const fbY = g.engineY + g.engineH + 2;
    el.push(<rect key="floorboard" x={g.steeringHeadX + 5} y={fbY} width={g.swingarmPivotX - g.steeringHeadX - 10} height={5} rx={2} fill={c} fillOpacity="0.04" stroke={c} strokeWidth="0.6" opacity="0.25" />);
  }
  if (g.hasBeak) {
    el.push(<path key="beak" d={`M${fwx},${fwy - fwr - 1} L${fwx - fwr - 8},${fwy - fwr + 5} L${fwx - fwr - 5},${fwy - fwr + 10} L${fwx},${fwy - fwr + 3}`} fill={c} fillOpacity="0.03" stroke={c} strokeWidth="0.5" opacity="0.2" />);
  }
  if (g.hasSissyBar) {
    el.push(<line key="sissybar" x1={g.seatRearX} y1={g.seatRearY + 3} x2={g.seatRearX + 3} y2={g.seatRearY - 18} stroke={c} strokeWidth="1" opacity="0.3" />);
  }
  if (g.hasTopCase) {
    el.push(<rect key="topcase" x={g.seatRearX + 5} y={g.seatRearY - 8} width={18} height={14} rx={3} fill={c} fillOpacity="0.03" stroke={c} strokeWidth="0.6" opacity="0.25" />);
  }
  if (g.hasPannier) {
    el.push(<rect key="pannier" x={g.seatRearX + 3} y={g.seatRearY + 5} width={14} height={18} rx={2} fill={c} fillOpacity="0.02" stroke={c} strokeWidth="0.5" opacity="0.2" />);
  }

  // Radiator
  if (waterCooled && !g.hasFloorboard) {
    el.push(
      <rect key="radiator" x={g.steeringHeadX - 8} y={g.engineY + 2} width={8} height={g.engineH - 4} rx={1} fill="none" stroke={c} strokeWidth="0.5" opacity="0.2" />,
      ...Array.from({ length: 4 }, (_, i) => (
        <line key={`rad-${i}`} x1={g.steeringHeadX - 7} y1={g.engineY + 6 + i * ((g.engineH - 10) / 3)} x2={g.steeringHeadX - 1} y2={g.engineY + 6 + i * ((g.engineH - 10) / 3)} stroke={c} strokeWidth="0.3" opacity="0.15" />
      ))
    );
  }

  // Chain
  if (!g.hasFloorboard && engine !== 'electric') {
    el.push(<line key="chain" x1={g.swingarmPivotX + 5} y1={g.swingarmPivotY + 3} x2={g.rearWheelX} y2={g.groundY - g.rearWheelR + 2} stroke={c} strokeWidth="0.4" opacity="0.12" strokeDasharray="1.5,1.5" />);
  }

  // Ground
  el.push(<line key="ground" x1="15" y1={g.groundY + 2} x2="285" y2={g.groundY + 2} stroke={c} strokeWidth="0.4" opacity="0.1" strokeDasharray="4,4" />);

  return el;
}

function renderHUD(brand: string, cc: number, hp: number, model: string, c: string): React.ReactNode[] {
  return [
    <text key="hud-brand" x="8" y="13" fill={c} opacity="0.18" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">{brand.substring(0, 14)}</text>,
    <text key="hud-cc" x="292" y="13" fill={c} opacity="0.22" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" textAnchor="end">{cc > 0 ? `${cc}cc` : 'EV'}</text>,
    hp > 0 ? <text key="hud-hp" x="292" y="153" fill={c} opacity="0.18" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" textAnchor="end">{hp.toFixed(0)}hp</text> : null,
    model ? <text key="hud-model" x="8" y="153" fill={c} opacity="0.12" fontSize="5.5" fontFamily="'JetBrains Mono', monospace">{model.substring(0, 20)}</text> : null,
    <path key="c-tl" d="M4,4 L14,4 M4,4 L4,14" stroke={c} strokeWidth="0.5" opacity="0.1" />,
    <path key="c-tr" d="M296,4 L286,4 M296,4 L296,14" stroke={c} strokeWidth="0.5" opacity="0.1" />,
    <path key="c-bl" d="M4,156 L14,156 M4,156 L4,146" stroke={c} strokeWidth="0.5" opacity="0.1" />,
    <path key="c-br" d="M296,156 L286,156 M296,156 L296,146" stroke={c} strokeWidth="0.5" opacity="0.1" />,
  ];
}

function renderScanLines(c: string): React.ReactNode[] {
  const lines: React.ReactNode[] = [];
  for (let y = 0; y < 160; y += 3) {
    lines.push(<line key={`scan-${y}`} x1="0" y1={y} x2="300" y2={y} stroke={c} strokeWidth="0.3" opacity="0.02" />);
  }
  return lines;
}

const VehicleVisual: React.FC<VehicleVisualProps> = ({
  brand = 'UNKNOWN', modelName = '', cc = 125, hp = null, weight = null,
  price = null, category = null, seatHeight = null, engineType = null,
  cooling = null, fuelTank = null, accentColor = '#b8f53e', width = 300, height = 160,
}) => {
  const ccVal = cc ?? 125;
  const hpVal = hp ?? ccVal * 0.08;
  const type = detectType(ccVal, category || '');
  const engine = detectEngine(engineType, ccVal);
  const wc = isWaterCooled(cooling);
  const geo = computeGeometry(type, ccVal, seatHeight, weight, fuelTank, engine);

  return (
    <svg viewBox="0 0 300 160" width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="300" height="160" fill="transparent" />
      {renderScanLines(accentColor)}
      {renderBike(geo, engine, wc, accentColor, type)}
      {renderHUD(brand, ccVal, hpVal, modelName, accentColor)}
    </svg>
  );
};

export default VehicleVisual;

// ═══════════════════════════════════
//  NEWS VISUAL
// ═══════════════════════════════════
export const NewsVisual: React.FC<{
  category: string; title: string; accentColor?: string; width?: number; height?: number;
}> = ({ category, title, accentColor = '#b8f53e', width = 400, height = 240 }) => {
  const renderIcon = () => {
    const c = accentColor;
    switch (category) {
      case 'data-report':
        return (<g opacity="0.3">
          <line x1="40" y1="20" x2="40" y2="80" stroke={c} strokeWidth="1" />
          <line x1="40" y1="80" x2="170" y2="80" stroke={c} strokeWidth="1" />
          <polyline points="45,65 65,50 85,58 105,35 125,42 145,22 165,30" fill="none" stroke={c} strokeWidth="1.5" />
          {[45,65,85,105,125,145,165].map((x, i) => {
            const ys = [65,50,58,35,42,22,30];
            return <circle key={`dd-${i}`} cx={x} cy={ys[i]} r="2" fill={c} opacity="0.5" />;
          })}
        </g>);
      case 'new-release':
        return (<g opacity="0.3">
          <circle cx="65" cy="70" r="15" fill="none" stroke={c} strokeWidth="1" />
          <circle cx="145" cy="70" r="15" fill="none" stroke={c} strokeWidth="1" />
          <path d="M80,70 L90,55 L105,42 L120,38 L135,42 L130,70" fill="none" stroke={c} strokeWidth="1.2" />
          <path d="M160,25 L162,32 L170,34 L162,36 L160,44 L158,36 L150,34 L158,32 Z" fill={c} opacity="0.4" />
        </g>);
      case 'review':
        return (<g opacity="0.3">
          <path d="M100,75 A35,35 0 1,1 100.01,75" fill="none" stroke={c} strokeWidth="1" />
          {Array.from({length: 9}, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return <line key={`tk-${i}`} x1={100 + 30*Math.cos(a)} y1={55 + 30*Math.sin(a)} x2={100 + 35*Math.cos(a)} y2={55 + 35*Math.sin(a)} stroke={c} strokeWidth="0.8" />; })}
          <line x1="100" y1="55" x2="78" y2="38" stroke={c} strokeWidth="1.5" />
          <circle cx="100" cy="55" r="3" fill={c} opacity="0.5" />
        </g>);
      case 'modification':
        return (<g opacity="0.3">
          <path d="M70,30 L75,35 L115,75 L120,80 L125,78 L130,72 L125,68 L85,28 L80,25 Z" fill="none" stroke={c} strokeWidth="1" />
          <circle cx="73" cy="28" r="8" fill="none" stroke={c} strokeWidth="0.8" />
          <circle cx="128" cy="75" r="10" fill="none" stroke={c} strokeWidth="0.8" />
        </g>);
      default:
        return (<g opacity="0.3">
          <rect x="40" y="35" width="30" height="45" fill="none" stroke={c} strokeWidth="0.8" />
          <rect x="80" y="25" width="30" height="55" fill="none" stroke={c} strokeWidth="0.8" />
          <rect x="120" y="40" width="40" height="40" fill="none" stroke={c} strokeWidth="0.8" />
          <rect x="48" y="42" width="6" height="6" fill={c} opacity="0.2" />
          <rect x="88" y="32" width="6" height="6" fill={c} opacity="0.2" />
        </g>);
    }
  };
  return (
    <svg viewBox="0 0 200 100" width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {Array.from({ length: 20 }, (_, i) => (<line key={`nsl-${i}`} x1="0" y1={i * 5} x2="200" y2={i * 5} stroke={accentColor} strokeWidth="0.3" opacity="0.025" />))}
      {renderIcon()}
      <path d="M4,4 L14,4 M4,4 L4,14" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <path d="M196,4 L186,4 M196,4 L196,14" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <path d="M4,96 L14,96 M4,96 L4,86" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <path d="M196,96 L186,96 M196,96 L196,86" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <text x="100" y="94" fill={accentColor} opacity="0.12" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">{category.toUpperCase().replace(/-/g, '_')}</text>
    </svg>
  );
};

export const BrandVisual: React.FC<{
  brand: string; share: number; accentColor?: string; width?: number; height?: number;
}> = ({ brand, share, accentColor = '#b8f53e', width = 80, height = 80 }) => {
  const angle = (share / 100) * 360, rad = (angle * Math.PI) / 180;
  const r = 30, cx = 40, cy = 40;
  const x = cx + r * Math.sin(rad), y = cy - r * Math.cos(rad);
  return (
    <svg viewBox="0 0 80 80" width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={accentColor} strokeWidth="2" opacity="0.08" />
      {share > 0 && share < 100 && <path d={`M${cx},${cy - r} A${r},${r} 0 ${angle > 180 ? 1 : 0},1 ${x.toFixed(1)},${y.toFixed(1)}`} fill="none" stroke={accentColor} strokeWidth="3" opacity="0.5" strokeLinecap="round" />}
      <text x={cx} y={cy + 2} fill={accentColor} opacity="0.6" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="bold">{brand.substring(0, 4)}</text>
    </svg>
  );
};
