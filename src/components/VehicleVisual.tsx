'use client';

import React from 'react';

interface VehicleVisualProps {
  brand?: string;
  cc?: number | null;
  hp?: number | null;
  weight?: number | null;
  price?: number | null;
  category?: string | null;
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

// Detect category from cc/category string
function detectType(cc: number, cat: string): 'scooter' | 'sport' | 'cruiser' | 'adv' | 'naked' | 'touring' {
  const c = cat.toLowerCase();
  // Direct DB category matches
  if (c === 'scooter' || c === 'commuter' || c === 'cub' || c === 'electric') return 'scooter';
  if (c === 'sport') return 'sport';
  if (c === 'cruiser' || c === 'classic') return 'cruiser';
  if (c === 'adventure') return 'adv';
  if (c === 'touring') return 'touring';
  if (c === 'naked') return 'naked';
  // Fuzzy matches
  if (c.includes('scoot') || c.includes('commut')) return 'scooter';
  if (c.includes('sport') || c.includes('super') || c.includes('ss') || c.includes('racing')) return 'sport';
  if (c.includes('cruis') || c.includes('chopper') || c.includes('bobber') || c.includes('classic')) return 'cruiser';
  if (c.includes('adv') || c.includes('enduro') || c.includes('dual') || c.includes('off')) return 'adv';
  if (c.includes('tour') || c.includes('gt')) return 'touring';
  // Heuristic by cc
  if (cc <= 180) return 'scooter';
  if (cc >= 900) return 'cruiser';
  return 'naked';
}

// ═══════════════════════════════════════════
//  DETAILED MOTORCYCLE SVG PATHS
//  ViewBox: 0 0 300 160
//  Each type: wheels, frame, engine, seat,
//  tank, exhaust, handlebars, details
// ═══════════════════════════════════════════

function getScooterPaths() {
  return {
    // Front wheel: center ~75,128, r=22
    frontWheel: { cx: 75, cy: 128, r: 22 },
    // Rear wheel: center ~225,128, r=22
    rearWheel: { cx: 225, cy: 128, r: 22 },
    // Body/frame
    body: `
      M97,128 L105,110 L115,95 Q120,88 130,85 L145,82
      Q155,80 160,82 L175,85 L195,90 Q205,95 210,105 L215,115 L203,128
    `,
    // Flat footboard (scooter characteristic)
    footboard: `M105,115 L195,115 L195,120 L105,120 Z`,
    // Front fork
    fork: `M97,128 L90,105 L85,85 Q83,78 80,72`,
    // Handlebar
    handlebar: `M72,65 L88,68 M80,72 L80,62 Q80,58 84,56 L92,54`,
    // Headlight
    headlight: `M78,75 A4,5 0 1,1 78.01,75`,
    // Seat
    seat: `M135,78 Q145,72 165,72 Q180,72 190,78 L192,82 L130,82 Z`,
    // Rear body panel
    rearPanel: `M190,82 Q200,80 210,85 L215,95 Q218,100 215,105 L210,105 Q205,90 195,85 L190,82`,
    // Taillight
    taillight: `M215,100 L220,98 L220,104 L215,105`,
    // Front fender
    frontFender: `M58,118 Q65,105 75,103 Q85,105 92,118`,
    // Rear fender
    rearFender: `M208,118 Q215,105 225,103 Q235,105 242,118`,
    // Windscreen
    windscreen: `M82,70 Q85,55 90,48 L94,50 Q90,58 88,68`,
    // Engine (CVT cover on side)
    engine: `M155,108 Q160,100 170,98 Q180,98 185,102 L188,112 L185,118 L155,118 Z`,
    // Exhaust
    exhaust: `M188,112 L200,108 Q210,105 220,108 L230,115 Q235,118 232,122`,
    // Mirror
    mirror: `M74,58 L68,52 L64,54 L66,58 L72,60`,
  };
}

function getSportPaths() {
  return {
    frontWheel: { cx: 65, cy: 130, r: 24 },
    rearWheel: { cx: 235, cy: 130, r: 24 },
    // Main frame triangle
    body: `
      M89,130 L100,105 L120,75 L140,65 L170,62 L190,65 L205,75 L215,95 L211,130
    `,
    // Fairing (full sport fairing)
    fairing: `
      M95,100 L105,80 L120,65 Q130,58 145,55 L160,54 L170,56
      Q175,58 172,65 L165,75 L140,80 L120,85 L105,95 L95,105 Z
    `,
    // Fork (steep angle for sport)
    fork: `M89,130 L82,110 L78,90 Q75,80 72,72`,
    // Clip-on handlebars (low, aggressive)
    handlebar: `M68,68 L78,70 M75,72 Q78,65 82,62 L88,60`,
    // Headlight (twin)
    headlight: `M92,75 Q95,70 100,70 Q105,70 105,75 Q105,80 100,80 Q95,80 92,75`,
    // Seat (low, aggressive)
    seat: `M160,58 Q175,52 195,55 Q205,58 208,65 L210,70 L158,68 Z`,
    // Tail section (sharp)
    tail: `M208,65 L225,62 L235,68 L230,80 L215,85 L210,75 Z`,
    taillight: `M228,68 L235,68 L233,74 L228,72`,
    // Tank (muscular)
    tank: `M125,62 Q135,52 150,50 Q165,50 172,55 L170,62 L140,65 L125,68 Z`,
    // Engine (inline-4 visible)
    engine: `
      M125,90 L130,80 L155,78 L170,80 L175,85 L178,100 L180,110
      L175,118 L130,118 L125,110 Z
    `,
    // Radiator
    radiator: `M112,95 L118,82 L125,82 L125,100 L118,105 Z`,
    // Exhaust (underslung)
    exhaust: `M175,110 Q185,112 195,108 Q210,100 220,95 L228,92 Q235,90 238,95`,
    exhaustTip: `M236,92 L245,90 L245,96 L238,97`,
    // Front fender (tight)
    frontFender: `M48,120 Q55,108 65,105 Q75,108 82,120`,
    // Rear fender
    rearFender: `M218,120 Q225,108 235,105 Q245,108 252,120`,
    // Chain/swingarm
    swingarm: `M180,118 L215,125 L211,130`,
    // Windscreen (small)
    windscreen: `M98,68 Q102,55 108,48 L112,50 Q108,58 105,65`,
    // Disk brake front
    diskBrake: `M65,130 A10,10 0 1,1 65.01,130`,
  };
}

function getCruiserPaths() {
  return {
    frontWheel: { cx: 55, cy: 130, r: 24 },
    rearWheel: { cx: 245, cy: 130, r: 22 },
    // Frame (long, low-slung)
    body: `
      M79,130 L90,115 L105,100 L130,90 L160,85 L190,85
      L210,90 L225,100 L223,130
    `,
    // Fork (raked out, long)
    fork: `M79,130 L72,112 L62,88 Q58,78 55,68`,
    // Wide handlebars (ape hanger style)
    handlebar: `M48,60 L62,65 M55,68 L55,55 Q56,48 62,45 L70,44 M55,55 L48,52`,
    // Headlight (round, classic)
    headlight: `M55,72 A6,6 0 1,1 55.01,72`,
    // Seat (low, stepped)
    seat: `M145,80 Q155,72 175,70 Q190,70 195,74 L196,80 L195,85 L145,85 Z`,
    // Sissy bar / passenger
    sissyBar: `M195,74 L198,58 L202,58 L200,80`,
    // Tank (teardrop)
    tank: `M108,85 Q118,72 135,68 Q155,68 165,75 L162,85 L108,88 Z`,
    // Engine (V-twin, large)
    engine: `
      M130,95 L135,88 L155,85 L165,88 L170,95
      L172,108 L170,118 L135,118 L130,108 Z
    `,
    engineDetail: `M140,92 L145,88 L155,88 L160,92 M135,102 L165,102 M140,110 L160,110`,
    // Exhaust (long, swooping pipes)
    exhaust: `M170,108 Q180,115 190,118 Q210,120 230,115 L240,112 Q248,110 252,115`,
    exhaust2: `M170,102 Q182,108 195,110 Q215,112 235,108 L245,105 Q250,103 254,108`,
    // Front fender (classic)
    frontFender: `M35,120 Q42,105 55,102 Q68,105 75,120`,
    // Rear fender (full)
    rearFender: `M228,120 Q235,108 245,106 Q255,108 262,120 L260,126 L230,126 Z`,
    taillight: `M258,118 L265,116 L265,122 L258,122`,
    // Saddlebag hint
    saddlebag: `M200,92 L210,90 L215,95 L215,110 L210,115 L200,115 Z`,
    // Spoke pattern (cruiser style)
    spokes: true,
  };
}

function getAdvPaths() {
  return {
    frontWheel: { cx: 60, cy: 132, r: 26 },
    rearWheel: { cx: 240, cy: 132, r: 24 },
    // Frame (tall, upright)
    body: `
      M86,132 L95,112 L110,85 L130,72 L155,65 L180,68
      L200,78 L215,98 L216,132
    `,
    // Long-travel fork
    fork: `M86,132 L80,110 L72,85 Q68,75 65,65`,
    // Wide handlebar (enduro style)
    handlebar: `M58,58 L72,62 M65,65 L65,52 Q66,46 72,44 L80,43 M58,58 L52,55`,
    // Beak/front fender (ADV style, high-mounted)
    beak: `M68,78 Q70,72 75,68 L85,65 Q90,68 88,74 L80,80`,
    // Windscreen (tall touring)
    windscreen: `M90,60 Q95,42 102,32 L108,34 Q104,45 100,58`,
    // Headlight
    headlight: `M70,70 A5,5 0 1,1 70.01,70`,
    // Seat (high, flat, two-up)
    seat: `M140,62 Q155,55 175,55 Q195,55 205,62 L208,68 L138,68 Z`,
    // Tank (tall, narrow)
    tank: `M112,70 Q122,58 140,55 Q158,55 168,60 L165,70 L112,75 Z`,
    // Engine (exposed, parallel twin / single)
    engine: `
      M130,82 L135,75 L160,72 L170,78 L175,88
      L178,105 L175,118 L135,118 L130,105 Z
    `,
    engineDetail: `M140,82 L160,80 M135,92 L170,90 M138,105 L168,105`,
    // Exhaust (high-mount adventure style)
    exhaust: `M175,95 Q185,88 195,85 L210,82 Q225,80 235,85 L238,90`,
    exhaustEnd: `M235,82 L248,80 L248,92 L240,92`,
    // Bash plate (skid plate)
    bashPlate: `M128,118 L180,118 L178,125 L130,125 Z`,
    // Front fender (high mount)
    frontFender: `M40,122 Q48,108 60,105 Q72,108 80,122`,
    rearFender: `M222,122 Q230,110 240,108 Q250,110 258,122`,
    // Pannier rack hint
    pannierRack: `M205,72 L215,70 L220,75 L218,90 L210,92`,
    taillight: `M218,78 L225,76 L225,82 L218,82`,
    // Hand guard
    handGuard: `M56,56 Q52,52 54,48 L62,44 Q66,42 68,46`,
  };
}

function getNakedPaths() {
  return {
    frontWheel: { cx: 65, cy: 130, r: 23 },
    rearWheel: { cx: 235, cy: 130, r: 22 },
    // Frame
    body: `
      M88,130 L98,108 L115,82 L135,70 L160,65 L185,68
      L200,78 L212,100 L213,130
    `,
    // Fork
    fork: `M88,130 L82,110 L76,88 Q73,78 70,70`,
    // Handlebar (flat bar)
    handlebar: `M64,64 L76,67 M70,70 L70,60 Q72,55 78,53 L85,52`,
    // Round headlight (naked style)
    headlight: `M72,73 A5,5 0 1,1 72.01,73`,
    // Seat (sporty but upright)
    seat: `M148,62 Q162,55 180,55 Q195,56 200,62 L202,68 L146,68 Z`,
    // Tank (muscular)
    tank: `M118,72 Q128,58 145,54 Q162,54 172,60 L168,70 L118,76 Z`,
    // Engine (exposed, inline or twin)
    engine: `
      M130,85 L136,78 L160,75 L170,80 L175,90
      L178,105 L175,118 L135,118 L130,105 Z
    `,
    engineDetail: `M140,85 L160,82 M135,95 L170,92 M138,108 L168,108`,
    engineFins: `M132,90 L128,88 M132,96 L128,94 M132,102 L128,100`,
    // Exhaust (side-exit)
    exhaust: `M175,105 Q185,110 195,112 Q210,115 225,112 L235,108 Q240,105 242,110`,
    exhaustTip: `M240,106 L250,104 L250,112 L242,112`,
    // Front fender
    frontFender: `M45,120 Q52,106 65,104 Q78,106 85,120`,
    rearFender: `M218,120 Q225,108 235,106 Q245,108 252,120`,
    taillight: `M248,112 L255,110 L255,116 L248,116`,
    // Swingarm
    swingarm: `M178,118 L214,126 L213,130`,
    // Disk brake
    diskBrake: true,
  };
}

function getTouringPaths() {
  return {
    frontWheel: { cx: 55, cy: 132, r: 24 },
    rearWheel: { cx: 248, cy: 132, r: 24 },
    body: `
      M79,132 L88,112 L105,88 L125,75 L155,68 L190,68
      L215,78 L230,98 L224,132
    `,
    fork: `M79,132 L72,112 L62,88 Q58,78 55,68`,
    handlebar: `M48,62 L62,65 M55,68 L55,55 Q56,48 62,45 L70,44`,
    // Tall windscreen
    windscreen: `M85,62 Q92,38 100,25 L106,27 Q100,42 95,58`,
    headlight: `M56,72 A6,6 0 1,1 56.01,72`,
    // Long comfort seat
    seat: `M140,64 Q158,56 185,55 Q210,56 220,62 L222,68 L138,68 Z`,
    tank: `M108,72 Q120,58 140,55 Q160,55 170,60 L168,72 L108,76 Z`,
    engine: `
      M130,85 L136,78 L165,75 L178,80 L182,92
      L185,108 L182,120 L135,120 L130,108 Z
    `,
    // Exhaust
    exhaust: `M182,108 Q195,115 210,118 Q230,120 245,115 L255,112`,
    exhaust2: `M182,100 Q198,105 218,108 Q238,110 250,105 L258,102`,
    // Front fender
    frontFender: `M35,122 Q42,108 55,105 Q68,108 75,122`,
    rearFender: `M230,122 Q238,110 248,108 Q258,110 265,122 L262,128 L232,128 Z`,
    // Top case
    topCase: `M218,55 L235,53 L240,58 L240,72 L235,75 L218,75 Z`,
    // Panniers
    pannier: `M225,82 L240,80 L242,90 L242,110 L238,115 L225,115 Z`,
    taillight: `M262,118 L268,116 L268,124 L262,124`,
  };
}

// Render wheel with spokes/rim detail
function renderWheel(cx: number, cy: number, r: number, seed: number, accent: string): React.ReactNode {
  const spokeCount = 8;
  const spokes: React.ReactNode[] = [];
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2 + (seed % 10) * 0.1;
    const x1 = cx + (r * 0.3) * Math.cos(angle);
    const y1 = cy + (r * 0.3) * Math.sin(angle);
    const x2 = cx + (r * 0.85) * Math.cos(angle);
    const y2 = cy + (r * 0.85) * Math.sin(angle);
    spokes.push(
      <line key={`sp-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={accent} strokeWidth="0.5" opacity="0.25" />
    );
  }
  return (
    <g key={`wheel-${cx}`}>
      {/* Tire */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="1.2" opacity="0.6" />
      {/* Rim */}
      <circle cx={cx} cy={cy} r={r * 0.85} fill="none" stroke={accent} strokeWidth="0.6" opacity="0.3" />
      {/* Hub */}
      <circle cx={cx} cy={cy} r={r * 0.15} fill="none" stroke={accent} strokeWidth="0.8" opacity="0.5" />
      <circle cx={cx} cy={cy} r={2} fill={accent} opacity="0.4" />
      {/* Spokes */}
      {spokes}
      {/* Disk brake */}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={accent} strokeWidth="0.4" opacity="0.15"
        strokeDasharray="3,3" />
    </g>
  );
}

// Render all paths for a bike type
function renderPaths(paths: Record<string, any>, accent: string, seed: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Render wheels first
  if (paths.frontWheel) {
    elements.push(renderWheel(paths.frontWheel.cx, paths.frontWheel.cy, paths.frontWheel.r, seed, accent));
  }
  if (paths.rearWheel) {
    elements.push(renderWheel(paths.rearWheel.cx, paths.rearWheel.cy, paths.rearWheel.r, seed, accent));
  }

  // Ground line
  const groundY = 155;
  elements.push(
    <line key="ground" x1="10" y1={groundY} x2="290" y2={groundY}
      stroke={accent} strokeWidth="0.5" opacity="0.15" strokeDasharray="4,4" />
  );

  // Render each path
  const pathKeys = Object.keys(paths).filter(k =>
    k !== 'frontWheel' && k !== 'rearWheel' && k !== 'spokes' && k !== 'diskBrake'
  );

  const fillKeys = ['fairing', 'footboard', 'engine', 'tank', 'seat', 'rearPanel',
    'topCase', 'pannier', 'saddlebag', 'bashPlate', 'exhaustEnd', 'rearFender'];

  pathKeys.forEach((key, i) => {
    const d = paths[key];
    if (typeof d !== 'string') return;

    const isFill = fillKeys.includes(key);
    const isDetail = key.includes('Detail') || key.includes('Fin') || key === 'radiator';
    const isAccent = key === 'headlight' || key === 'taillight';
    const isMirror = key === 'mirror' || key === 'handGuard';

    let strokeW = '1';
    let opacity = 0.55;
    let fill = 'none';

    if (isFill) {
      fill = accent;
      opacity = 0.04;
      strokeW = '0.8';
    }
    if (isDetail) {
      strokeW = '0.5';
      opacity = 0.2;
    }
    if (isAccent) {
      fill = accent;
      opacity = 0.35;
      strokeW = '0.6';
    }
    if (isMirror) {
      strokeW = '0.6';
      opacity = 0.3;
    }
    if (key === 'body') {
      strokeW = '1.2';
      opacity = 0.5;
    }
    if (key === 'fork' || key === 'swingarm') {
      strokeW = '1.2';
      opacity = 0.45;
    }
    if (key === 'exhaust' || key === 'exhaust2') {
      strokeW = '1';
      opacity = 0.35;
    }
    if (key === 'handlebar') {
      strokeW = '1';
      opacity = 0.5;
    }
    if (key === 'windscreen') {
      strokeW = '0.6';
      opacity = 0.2;
      fill = accent;
    }
    if (key.includes('Fender')) {
      strokeW = '0.8';
      opacity = 0.3;
    }

    elements.push(
      <path
        key={`p-${key}-${i}`}
        d={d}
        fill={fill}
        stroke={accent}
        strokeWidth={strokeW}
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  });

  return elements;
}

// Terminal scan lines overlay
function renderScanLines(accent: string): React.ReactNode[] {
  const lines: React.ReactNode[] = [];
  for (let y = 0; y < 160; y += 3) {
    lines.push(
      <line key={`scan-${y}`} x1="0" y1={y} x2="300" y2={y}
        stroke={accent} strokeWidth="0.3" opacity="0.025" />
    );
  }
  return lines;
}

// HUD overlay: data readouts in terminal style
function renderHUD(brand: string, cc: number, hp: number, accent: string): React.ReactNode[] {
  return [
    // Top-left: brand
    <text key="hud-brand" x="8" y="14" fill={accent} opacity="0.2"
      fontSize="7" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">
      {brand.substring(0, 12)}
    </text>,
    // Top-right: CC
    <text key="hud-cc" x="292" y="14" fill={accent} opacity="0.25"
      fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="end" letterSpacing="0.5">
      {cc}cc
    </text>,
    // Bottom-right: HP
    hp > 0 ? (
      <text key="hud-hp" x="292" y="152" fill={accent} opacity="0.2"
        fontSize="7" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
        {hp.toFixed(0)}hp
      </text>
    ) : null,
    // Corner brackets
    <path key="corner-tl" d="M4,4 L14,4 M4,4 L4,14" stroke={accent} strokeWidth="0.6" opacity="0.12" />,
    <path key="corner-tr" d="M296,4 L286,4 M296,4 L296,14" stroke={accent} strokeWidth="0.6" opacity="0.12" />,
    <path key="corner-bl" d="M4,156 L14,156 M4,156 L4,146" stroke={accent} strokeWidth="0.6" opacity="0.12" />,
    <path key="corner-br" d="M296,156 L286,156 M296,156 L296,146" stroke={accent} strokeWidth="0.6" opacity="0.12" />,
  ];
}

const VehicleVisual: React.FC<VehicleVisualProps> = ({
  brand = 'UNKNOWN',
  cc = 125,
  hp = null,
  weight = null,
  price = null,
  category = null,
  accentColor = '#b8f53e',
  width = 300,
  height = 160,
}) => {
  const seed = hashStr(`${brand}-${cc}-${category || 'std'}`);
  const ccVal = cc ?? 125;
  const hpVal = hp ?? ccVal * 0.08;
  const type = detectType(ccVal, category || '');

  const pathsMap: Record<string, () => Record<string, any>> = {
    scooter: getScooterPaths,
    sport: getSportPaths,
    cruiser: getCruiserPaths,
    adv: getAdvPaths,
    naked: getNakedPaths,
    touring: getTouringPaths,
  };

  const paths = (pathsMap[type] || getNakedPaths)();

  return (
    <svg
      viewBox="0 0 300 160"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width="300" height="160" fill="transparent" />

      {/* Scan lines */}
      {renderScanLines(accentColor)}

      {/* Motorcycle */}
      {renderPaths(paths, accentColor, seed)}

      {/* Glow layer */}
      <g filter="url(#bikeGlow)" opacity="0.3">
        {paths.body && typeof paths.body === 'string' && (
          <path d={paths.body} fill="none" stroke={accentColor} strokeWidth="2" opacity="0.15" />
        )}
      </g>

      {/* HUD */}
      {renderHUD(brand, ccVal, hpVal, accentColor)}

      <defs>
        <filter id="bikeGlow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
    </svg>
  );
};

export default VehicleVisual;

// ═══════════════════════════════════
//  NEWS VISUAL
// ═══════════════════════════════════
export const NewsVisual: React.FC<{
  category: string;
  title: string;
  accentColor?: string;
  width?: number;
  height?: number;
}> = ({ category, title, accentColor = '#b8f53e', width = 400, height = 240 }) => {
  const seed = hashStr(`${category}-${title}`);

  // Category-specific detailed icon
  const renderIcon = () => {
    const c = accentColor;
    switch (category) {
      case 'data-report':
        return (
          <g opacity="0.3">
            {/* Chart axes */}
            <line x1="40" y1="20" x2="40" y2="80" stroke={c} strokeWidth="1" />
            <line x1="40" y1="80" x2="170" y2="80" stroke={c} strokeWidth="1" />
            {/* Data line */}
            <polyline points="45,65 65,50 85,58 105,35 125,42 145,22 165,30"
              fill="none" stroke={c} strokeWidth="1.5" />
            {/* Data dots */}
            {[45,65,85,105,125,145,165].map((x, i) => {
              const ys = [65,50,58,35,42,22,30];
              return <circle key={`dd-${i}`} cx={x} cy={ys[i]} r="2" fill={c} opacity="0.5" />;
            })}
            {/* Grid lines */}
            {[35,50,65].map(y => (
              <line key={`gl-${y}`} x1="40" y1={y} x2="170" y2={y} stroke={c} strokeWidth="0.3" opacity="0.3" strokeDasharray="2,4" />
            ))}
          </g>
        );
      case 'new-release':
        return (
          <g opacity="0.3">
            {/* Simplified motorcycle outline */}
            <circle cx="65" cy="70" r="15" fill="none" stroke={c} strokeWidth="1" />
            <circle cx="145" cy="70" r="15" fill="none" stroke={c} strokeWidth="1" />
            <path d="M80,70 L90,55 L105,42 L120,38 L135,42 L130,70" fill="none" stroke={c} strokeWidth="1.2" />
            <path d="M105,42 L108,30 L118,28 L120,38" fill="none" stroke={c} strokeWidth="0.8" />
            {/* Sparkle */}
            <path d="M160,25 L162,32 L170,34 L162,36 L160,44 L158,36 L150,34 L158,32 Z" fill={c} opacity="0.4" />
            <text x="155" y="60" fill={c} fontSize="8" fontFamily="'JetBrains Mono', monospace" opacity="0.5">NEW</text>
          </g>
        );
      case 'review':
        return (
          <g opacity="0.3">
            {/* Speedometer */}
            <path d="M100,75 A35,35 0 1,1 100.01,75" fill="none" stroke={c} strokeWidth="1" />
            {/* Ticks */}
            {Array.from({length: 9}, (_, i) => {
              const a = Math.PI + (i / 8) * Math.PI;
              const x1 = 100 + 30 * Math.cos(a);
              const y1 = 55 + 30 * Math.sin(a);
              const x2 = 100 + 35 * Math.cos(a);
              const y2 = 55 + 35 * Math.sin(a);
              return <line key={`tk-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.8" />;
            })}
            {/* Needle */}
            <line x1="100" y1="55" x2="78" y2="38" stroke={c} strokeWidth="1.5" />
            <circle cx="100" cy="55" r="3" fill={c} opacity="0.5" />
          </g>
        );
      case 'modification':
        return (
          <g opacity="0.3">
            {/* Wrench */}
            <path d="M70,30 L75,35 L115,75 L120,80 L125,78 L130,72 L125,68 L85,28 L80,25 Z"
              fill="none" stroke={c} strokeWidth="1" />
            <circle cx="73" cy="28" r="8" fill="none" stroke={c} strokeWidth="0.8" />
            {/* Gear */}
            <circle cx="128" cy="75" r="10" fill="none" stroke={c} strokeWidth="0.8" />
            <circle cx="128" cy="75" r="5" fill="none" stroke={c} strokeWidth="0.5" />
            {/* Gear teeth */}
            {Array.from({length: 8}, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={`gt-${i}`} x1={128 + 10*Math.cos(a)} y1={75 + 10*Math.sin(a)}
                x2={128 + 14*Math.cos(a)} y2={75 + 14*Math.sin(a)} stroke={c} strokeWidth="1.5" />;
            })}
          </g>
        );
      case 'industry':
      default:
        return (
          <g opacity="0.3">
            {/* Factory/building */}
            <rect x="40" y="35" width="30" height="45" fill="none" stroke={c} strokeWidth="0.8" />
            <rect x="80" y="25" width="30" height="55" fill="none" stroke={c} strokeWidth="0.8" />
            <rect x="120" y="40" width="40" height="40" fill="none" stroke={c} strokeWidth="0.8" />
            {/* Windows */}
            <rect x="48" y="42" width="6" height="6" fill={c} opacity="0.2" />
            <rect x="58" y="42" width="6" height="6" fill={c} opacity="0.2" />
            <rect x="48" y="55" width="6" height="6" fill={c} opacity="0.2" />
            <rect x="58" y="55" width="6" height="6" fill={c} opacity="0.2" />
            <rect x="88" y="32" width="6" height="6" fill={c} opacity="0.2" />
            <rect x="98" y="32" width="6" height="6" fill={c} opacity="0.2" />
            {/* Chimney */}
            <rect x="85" y="15" width="5" height="12" fill="none" stroke={c} strokeWidth="0.6" />
            {/* Smoke */}
            <path d="M88,15 Q92,10 88,5 Q84,0 88,-5" fill="none" stroke={c} strokeWidth="0.5" opacity="0.4" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 200 100" width={width} height={height} xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}>
      {/* Scan lines */}
      {Array.from({ length: 20 }, (_, i) => (
        <line key={`nsl-${i}`} x1="0" y1={i * 5} x2="200" y2={i * 5}
          stroke={accentColor} strokeWidth="0.3" opacity="0.025" />
      ))}

      {renderIcon()}

      {/* Corners */}
      <path d="M4,4 L14,4 M4,4 L4,14" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <path d="M196,4 L186,4 M196,4 L196,14" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <path d="M4,96 L14,96 M4,96 L4,86" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />
      <path d="M196,96 L186,96 M196,96 L196,86" stroke={accentColor} strokeWidth="0.6" opacity="0.15" />

      <text x="100" y="94" fill={accentColor} opacity="0.12" fontSize="5.5"
        fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">
        {category.toUpperCase().replace(/-/g, '_')}
      </text>
    </svg>
  );
};

// Brand visual with share arc
export const BrandVisual: React.FC<{
  brand: string;
  share: number;
  accentColor?: string;
  width?: number;
  height?: number;
}> = ({ brand, share, accentColor = '#b8f53e', width = 80, height = 80 }) => {
  const angle = (share / 100) * 360;
  const rad = (angle * Math.PI) / 180;
  const r = 30;
  const cx = 40, cy = 40;
  const x = cx + r * Math.sin(rad);
  const y = cy - r * Math.cos(rad);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 80 80" width={width} height={height} xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={accentColor} strokeWidth="2" opacity="0.08" />
      {share > 0 && share < 100 && (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 ${largeArc},1 ${x.toFixed(1)},${y.toFixed(1)}`}
          fill="none" stroke={accentColor} strokeWidth="3" opacity="0.5" strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy + 2} fill={accentColor} opacity="0.6" fontSize="8"
        fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="bold">
        {brand.substring(0, 4)}
      </text>
      {[0, 90, 180, 270].map((deg, i) => {
        const dr = (deg * Math.PI) / 180;
        return (
          <circle key={`d-${i}`} cx={cx + (r + 6) * Math.sin(dr)} cy={cy - (r + 6) * Math.cos(dr)}
            r="1" fill={accentColor} opacity={0.2} />
        );
      })}
    </svg>
  );
};
