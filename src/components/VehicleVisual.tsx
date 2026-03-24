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

// Generate a deterministic hash from string
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Generate motorcycle silhouette path based on vehicle attributes
function generateBikePath(cc: number, category: string, seed: number): string {
  const isScooter = cc <= 180 || category === 'scooter';
  const isSport = category === 'sport' || category === 'supersport';
  const isCruiser = category === 'cruiser' || cc >= 800;
  const isAdv = category === 'adventure' || category === 'adv';

  // Base dimensions for SVG viewBox 200x100
  if (isScooter) {
    // Scooter: lower, rounder profile
    return `M40,70 Q45,68 50,65 L55,55 Q58,48 65,45 L80,42 Q90,40 95,42 L110,45 Q115,43 120,44 L130,48 Q140,52 145,58 L150,65 Q152,68 155,70
            M55,70 A12,12 0 1,1 55.01,70 M140,70 A12,12 0 1,1 140.01,70
            M65,45 L70,35 Q75,30 85,30 L95,32 Q100,33 100,38 L98,42
            M110,44 L115,38 Q118,35 122,36 L125,40 L120,44`;
  }

  if (isSport) {
    // Sport: aggressive, forward-leaning
    return `M35,72 L45,68 L55,55 L60,42 Q62,36 68,32 L85,28 Q92,26 98,28 L108,32 Q115,30 120,32 L135,40 Q145,48 150,58 L155,68 L160,72
            M52,72 A13,13 0 1,1 52.01,72 M147,72 A13,13 0 1,1 147.01,72
            M68,32 L72,22 Q76,18 82,18 L90,20 Q94,21 95,25 L93,28
            M98,28 L105,22 Q110,20 115,22 L118,28 L120,32
            M60,42 L58,38 Q56,34 60,32 L65,33`;
  }

  if (isCruiser) {
    // Cruiser: long, low, extended
    return `M25,70 L35,66 L45,60 L55,52 Q60,46 68,44 L85,42 Q95,40 105,42 L125,44 Q135,42 145,44 L155,50 Q162,56 165,62 L168,68 L170,70
            M42,70 A14,14 0 1,1 42.01,70 M158,70 A14,14 0 1,1 158.01,70
            M68,44 L72,34 Q75,28 82,28 L88,30 Q92,31 92,36 L90,42
            M55,52 L50,48 Q48,44 52,42 L58,44`;
  }

  if (isAdv) {
    // Adventure: tall, upright
    return `M40,74 L48,68 L55,55 L60,42 Q62,34 68,30 L82,26 Q90,24 98,26 L110,30 Q118,28 125,32 L140,44 Q148,54 152,64 L155,70 L158,74
            M52,74 A14,14 0 1,1 52.01,74 M145,74 A14,14 0 1,1 145.01,74
            M68,30 L70,16 Q72,10 78,10 L86,12 Q90,14 90,20 L88,26
            M60,42 L56,36 Q54,32 58,30 L64,32`;
  }

  // Default: standard naked bike
  const yOff = (seed % 5) - 2; // slight variation
  return `M38,72 L48,66 L56,54 L62,42 Q65,36 72,${32 + yOff} L88,${28 + yOff} Q96,${26 + yOff} 104,${28 + yOff} L118,${32 + yOff} Q125,30 130,34 L142,46 Q150,56 154,64 L158,70 L160,72
          M52,72 A13,13 0 1,1 52.01,72 M148,72 A13,13 0 1,1 148.01,72
          M72,${32 + yOff} L74,${22 + yOff} Q77,${18 + yOff} 84,${18 + yOff} L92,${20 + yOff} Q96,${22 + yOff} 96,${26 + yOff} L94,${28 + yOff}
          M62,42 L58,38 Q56,34 60,32 L66,34`;
}

// Data-driven background pattern
function generateGrid(seed: number, cc: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const cols = 12;
  const rows = 6;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const h = hashStr(`${seed}-${idx}`);
      // Sparse dots based on cc - higher cc = more active dots
      const threshold = Math.max(40, 85 - (cc / 20));
      if (h % 100 > threshold) {
        const x = 8 + c * 16.5;
        const y = 8 + r * 16;
        const opacity = 0.08 + (h % 15) / 100;
        elements.push(
          <rect key={`g-${idx}`} x={x} y={y} width="1.5" height="1.5" fill="currentColor" opacity={opacity} />
        );
      }
    }
  }
  return elements;
}

// Power indicator bars on the side
function generatePowerBars(hp: number, maxHp: number = 200): React.ReactNode[] {
  const bars: React.ReactNode[] = [];
  const count = 8;
  const filled = Math.max(1, Math.min(count, Math.round((hp / maxHp) * count)));

  for (let i = 0; i < count; i++) {
    const y = 85 - i * 9;
    const active = i < filled;
    bars.push(
      <rect
        key={`pb-${i}`}
        x="4" y={y} width="6" height="5" rx="1"
        fill={active ? 'currentColor' : 'currentColor'}
        opacity={active ? 0.6 + (i / count) * 0.4 : 0.08}
      />
    );
  }
  return bars;
}

// CC indicator on right side
function generateCCIndicator(cc: number): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  const maxCC = 1200;
  const level = Math.min(1, cc / maxCC);
  const totalH = 50;
  const filledH = totalH * level;

  segments.push(
    <rect key="cc-bg" x="190" y="25" width="4" height={totalH} rx="1" fill="currentColor" opacity={0.06} />
  );
  segments.push(
    <rect key="cc-fill" x="190" y={25 + totalH - filledH} width="4" height={filledH} rx="1" fill="currentColor" opacity={0.35} />
  );

  return segments;
}

const VehicleVisual: React.FC<VehicleVisualProps> = ({
  brand = 'UNKNOWN',
  cc = 125,
  hp = null,
  weight = null,
  price = null,
  category = null,
  accentColor = '#b8f53e',
  width = 240,
  height = 120,
}) => {
  const seed = hashStr(`${brand}-${cc}-${category || 'std'}`);
  const ccVal = cc ?? 125;
  const hpVal = hp ?? ccVal * 0.08;
  const catStr = (category || '').toLowerCase();

  const bikePath = generateBikePath(ccVal, catStr, seed);

  return (
    <svg
      viewBox="0 0 200 100"
      width={width}
      height={height}
      style={{ color: accentColor }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background grid */}
      {generateGrid(seed, ccVal)}

      {/* Horizontal scan lines */}
      {[20, 40, 60, 80].map(y => (
        <line key={`sl-${y}`} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.3" opacity="0.04" />
      ))}

      {/* Power bars left */}
      {generatePowerBars(hpVal)}

      {/* CC indicator right */}
      {generateCCIndicator(ccVal)}

      {/* Motorcycle silhouette */}
      <path
        d={bikePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glow effect on the bike */}
      <path
        d={bikePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.08"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* CC text */}
      <text
        x="195" y="18"
        fill="currentColor" opacity="0.3"
        fontSize="7" fontFamily="'JetBrains Mono', monospace"
        textAnchor="end"
      >
        {ccVal}cc
      </text>

      {/* Brand watermark */}
      <text
        x="15" y="18"
        fill="currentColor" opacity="0.15"
        fontSize="6" fontFamily="'JetBrains Mono', monospace"
      >
        {brand.substring(0, 8)}
      </text>

      {/* Data readout bottom-right */}
      {hpVal > 0 && (
        <text
          x="195" y="92"
          fill="currentColor" opacity="0.25"
          fontSize="5.5" fontFamily="'JetBrains Mono', monospace"
          textAnchor="end"
        >
          {hpVal.toFixed(0)}hp
        </text>
      )}

      {/* Filter definitions */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export default VehicleVisual;

// Simpler version for news cards
export const NewsVisual: React.FC<{
  category: string;
  title: string;
  accentColor?: string;
  width?: number;
  height?: number;
}> = ({ category, title, accentColor = '#b8f53e', width = 400, height = 240 }) => {
  const seed = hashStr(`${category}-${title}`);

  // Category-specific icon patterns
  const iconPath = (() => {
    switch (category) {
      case 'data-report':
        // Chart/graph icon
        return 'M30,70 L30,30 M30,70 L170,70 M45,55 L65,40 L85,50 L105,30 L125,45 L145,25 L165,35';
      case 'new-release':
        // Sparkle/new icon
        return 'M100,20 L105,40 L125,45 L105,50 L100,70 L95,50 L75,45 L95,40 Z M140,30 L143,38 L150,40 L143,42 L140,50 L137,42 L130,40 L137,38 Z M60,55 L63,63 L70,65 L63,67 L60,75 L57,67 L50,65 L57,63 Z';
      case 'review':
        // Magnifying glass / analysis
        return 'M85,45 A20,20 0 1,1 85.01,45 M100,58 L120,78 M75,38 L95,38 M85,28 L85,48';
      case 'modification':
        // Wrench/gear
        return 'M100,25 A25,25 0 1,1 100.01,25 M100,35 A15,15 0 1,0 100.01,35 M100,15 L100,10 M120,20 L125,17 M125,35 L130,35 M120,50 L125,55 M100,55 L100,60 M80,50 L75,55 M75,35 L70,35 M80,20 L75,17';
      case 'industry':
        // Building/factory
        return 'M40,70 L40,35 L60,25 L60,70 M65,70 L65,40 L85,30 L85,70 M90,70 L90,35 L130,35 L130,70 M105,70 L105,50 L115,50 L115,70 M45,45 L55,45 L55,55 L45,55 Z M95,45 L105,45 L105,55 L95,55 Z M115,45 L125,45 L125,55 L115,55 Z';
      default:
        return 'M60,50 L80,30 L100,50 L120,30 L140,50';
    }
  })();

  return (
    <svg
      viewBox="0 0 200 100"
      width={width}
      height={height}
      style={{ color: accentColor }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background grid */}
      {generateGrid(seed, 200)}

      {/* Scan lines */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`nsl-${i}`} x1="0" y1={i * 10} x2="200" y2={i * 10} stroke="currentColor" strokeWidth="0.3" opacity="0.04" />
      ))}

      {/* Category icon */}
      <path
        d={iconPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Corner decorations */}
      <path d="M5,5 L15,5 M5,5 L5,15" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <path d="M195,5 L185,5 M195,5 L195,15" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <path d="M5,95 L15,95 M5,95 L5,85" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <path d="M195,95 L185,95 M195,95 L195,85" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />

      {/* Category label */}
      <text
        x="100" y="90"
        fill="currentColor" opacity="0.15"
        fontSize="6" fontFamily="'JetBrains Mono', monospace"
        textAnchor="middle"
      >
        {category.toUpperCase().replace('-', '_')}
      </text>
    </svg>
  );
};

// Brand logo-style visual for brand analysis cards
export const BrandVisual: React.FC<{
  brand: string;
  share: number;
  accentColor?: string;
  width?: number;
  height?: number;
}> = ({ brand, share, accentColor = '#b8f53e', width = 80, height = 80 }) => {
  const seed = hashStr(brand);
  const angle = (share / 100) * 360;
  const rad = (angle * Math.PI) / 180;
  const r = 30;
  const cx = 40, cy = 40;
  const x = cx + r * Math.sin(rad);
  const y = cy - r * Math.cos(rad);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg
      viewBox="0 0 80 80"
      width={width}
      height={height}
      style={{ color: accentColor }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.08" />

      {/* Share arc */}
      {share > 0 && share < 100 && (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 ${largeArc},1 ${x.toFixed(1)},${y.toFixed(1)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.5"
          strokeLinecap="round"
        />
      )}

      {/* Center text */}
      <text
        x={cx} y={cy + 2}
        fill="currentColor" opacity="0.6"
        fontSize="8" fontFamily="'JetBrains Mono', monospace"
        textAnchor="middle" fontWeight="bold"
      >
        {brand.substring(0, 4)}
      </text>

      {/* Dots decoration */}
      {[0, 90, 180, 270].map((deg, i) => {
        const dr = (deg * Math.PI) / 180;
        return (
          <circle
            key={`d-${i}`}
            cx={cx + (r + 6) * Math.sin(dr)}
            cy={cy - (r + 6) * Math.cos(dr)}
            r="1"
            fill="currentColor"
            opacity={0.2}
          />
        );
      })}
    </svg>
  );
};
