'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
//  HYMMOTO GARAGE — Visual 2D Motorcycle Customization Simulator
// ═══════════════════════════════════════════════════════════════

// Color theme: Gruvbox Dark
const COLORS = {
  bg: '#1d2021',
  card: '#282828',
  border: '#3c3836',
  text: '#ebdbb2',
  muted: '#928374',
  accent: '#b8f53e',
  gold: '#fabd2f',
  red: '#fb4934',
  blue: '#83a598',
  purple: '#d3869b',
};

// ─── Types ───

interface Part {
  id: string;
  name: string;
  nameTw: string;
  category: 'exhaust' | 'suspension' | 'tires' | 'ecu' | 'bodykit' | 'lights' | 'engine' | 'intake';
  tier: 1 | 2 | 3;
  price: number;
  stats: { power?: number; handling?: number; style?: number; weight?: number; sound?: number };
  desc: string;
}

interface Bike {
  name: string;
  brand: string;
  cc: number;
  baseStats: { power: number; handling: number; style: number; weight: number; sound: number };
  price: number;
}

interface GameState {
  credits: number;
  xp: number;
  level: number;
  garageLevel: number;
  currentBike: number;
  inventory: string[];
  installed: string[];
  raceWins: number;
  raceLosses: number;
  totalRaces: number;
  achievements: string[];
  odometer: number;
}

// ─── Game Data ───

const BIKES: Bike[] = [
  {
    name: 'City Runner 125',
    brand: 'GENERIC',
    cc: 125,
    baseStats: { power: 25, handling: 40, style: 20, weight: 110, sound: 15 },
    price: 0,
  },
  {
    name: 'Street Hawk 150',
    brand: 'KYMCO',
    cc: 150,
    baseStats: { power: 35, handling: 50, style: 40, weight: 125, sound: 25 },
    price: 8000,
  },
  {
    name: 'Thunder 300',
    brand: 'SYM',
    cc: 300,
    baseStats: { power: 55, handling: 60, style: 55, weight: 170, sound: 40 },
    price: 25000,
  },
  {
    name: 'Viper 600R',
    brand: 'YAMAHA',
    cc: 600,
    baseStats: { power: 80, handling: 75, style: 75, weight: 200, sound: 65 },
    price: 60000,
  },
  {
    name: 'Dragon 1000RR',
    brand: 'HYMMOTO',
    cc: 1000,
    baseStats: { power: 100, handling: 85, style: 90, weight: 220, sound: 85 },
    price: 150000,
  },
];

const PARTS: Part[] = [
  // Exhaust
  { id: 'exh1', name: 'Sport Slip-On', nameTw: '運動型排氣管', category: 'exhaust', tier: 1, price: 1200, stats: { power: 3, sound: 10, style: 5 }, desc: '入門改裝排氣管，聲浪提升明顯' },
  { id: 'exh2', name: 'Racing Full System', nameTw: '競技全段排氣', category: 'exhaust', tier: 2, price: 4500, stats: { power: 8, sound: 20, style: 10, weight: -3 }, desc: '鈦合金全段，馬力躍升' },
  { id: 'exh3', name: 'Akrapovic Evo', nameTw: '蠍子管旗艦款', category: 'exhaust', tier: 3, price: 12000, stats: { power: 15, sound: 30, style: 20, weight: -5 }, desc: '頂級蠍子管，賽道級性能' },
  { id: 'sus1', name: 'Sport Springs', nameTw: '運動彈簧', category: 'suspension', tier: 1, price: 800, stats: { handling: 8 }, desc: '降低重心，過彎更穩' },
  { id: 'sus2', name: 'Adjustable Coilovers', nameTw: '可調避震器', category: 'suspension', tier: 2, price: 3500, stats: { handling: 18, style: 5 }, desc: '32段阻尼可調，高低軟硬隨心' },
  { id: 'sus3', name: 'Ohlins TTX', nameTw: 'Ohlins 頂級避震', category: 'suspension', tier: 3, price: 15000, stats: { handling: 30, style: 10 }, desc: 'MotoGP 等級避震，極致操控' },
  { id: 'tir1', name: 'Sport Compound', nameTw: '運動膠質輪胎', category: 'tires', tier: 1, price: 600, stats: { handling: 5, style: 3 }, desc: '抓地力提升，日常好用' },
  { id: 'tir2', name: 'Semi-Slick', nameTw: '半熱熔胎', category: 'tires', tier: 2, price: 2000, stats: { handling: 12, power: 2 }, desc: '賽道日必備，熱胎快' },
  { id: 'tir3', name: 'Pirelli Supercorsa', nameTw: '倍耐力旗艦熱熔', category: 'tires', tier: 3, price: 5000, stats: { handling: 22, power: 5, style: 5 }, desc: 'WSBK 指定用胎' },
  { id: 'ecu1', name: 'Stage 1 Flash', nameTw: '一階電腦', category: 'ecu', tier: 1, price: 1500, stats: { power: 5 }, desc: '解除原廠限制，釋放隱藏馬力' },
  { id: 'ecu2', name: 'Race ECU Tune', nameTw: '競技電腦調校', category: 'ecu', tier: 2, price: 5000, stats: { power: 12, sound: 5 }, desc: '供油點火全面優化' },
  { id: 'ecu3', name: 'Motec M1 Kit', nameTw: 'MoTeC 全取代', category: 'ecu', tier: 3, price: 18000, stats: { power: 25, sound: 10, handling: 5 }, desc: 'F1 等級引擎管理系統' },
  { id: 'bdy1', name: 'Carbon Mirrors', nameTw: '碳纖維後照鏡', category: 'bodykit', tier: 1, price: 500, stats: { style: 10, weight: -1 }, desc: '輕量化碳纖鏡面' },
  { id: 'bdy2', name: 'Race Fairing Kit', nameTw: '競技整流罩', category: 'bodykit', tier: 2, price: 3000, stats: { style: 20, power: 3, weight: -4 }, desc: '風阻降低，速度提升' },
  { id: 'bdy3', name: 'Full Carbon Package', nameTw: '全碳纖維套件', category: 'bodykit', tier: 3, price: 20000, stats: { style: 35, power: 5, weight: -10 }, desc: '整車碳纖維化，輕到飛起' },
  { id: 'lit1', name: 'LED Headlight', nameTw: 'LED 大燈', category: 'lights', tier: 1, price: 400, stats: { style: 8 }, desc: '白光 LED 照明升級' },
  { id: 'lit2', name: 'RGB Underglow', nameTw: '底盤氛圍燈', category: 'lights', tier: 2, price: 1200, stats: { style: 15 }, desc: '七彩底盤燈，夜騎必備' },
  { id: 'lit3', name: 'DRL Projector Kit', nameTw: '魚眼日行燈組', category: 'lights', tier: 3, price: 3500, stats: { style: 25 }, desc: '超跑級魚眼燈組' },
  { id: 'int1', name: 'High-Flow Filter', nameTw: '高流量濾芯', category: 'intake', tier: 1, price: 300, stats: { power: 2, sound: 3 }, desc: '進氣量提升，油門更直接' },
  { id: 'int2', name: 'Ram Air Intake', nameTw: '衝壓進氣', category: 'intake', tier: 2, price: 2000, stats: { power: 7, sound: 8 }, desc: '高速時進氣加壓效果明顯' },
  { id: 'int3', name: 'Velocity Stack Kit', nameTw: '喇叭口進氣組', category: 'intake', tier: 3, price: 8000, stats: { power: 12, sound: 15, style: 5 }, desc: '直噴式進氣，聲浪如咆哮' },
  { id: 'eng1', name: 'Big Bore Kit', nameTw: '加大汽缸組', category: 'engine', tier: 1, price: 3000, stats: { power: 10, weight: 2 }, desc: '排氣量提升，扭力倍增' },
  { id: 'eng2', name: 'Forged Internals', nameTw: '鍛造活塞連桿', category: 'engine', tier: 2, price: 8000, stats: { power: 18, weight: -2 }, desc: '高轉耐用，拉轉更順' },
  { id: 'eng3', name: 'Race-Built Engine', nameTw: '全競技引擎', category: 'engine', tier: 3, price: 35000, stats: { power: 35, weight: -5, sound: 15 }, desc: '工廠賽車級引擎，極限性能' },
];

const ACHIEVEMENTS: { id: string; name: string; desc: string; check: (g: GameState) => boolean }[] = [
  { id: 'first_mod', name: '初次改裝', desc: '安裝第一個改裝部品', check: g => g.installed.length >= 1 },
  { id: 'first_win', name: '初勝', desc: '贏得第一場比賽', check: g => g.raceWins >= 1 },
  { id: 'five_wins', name: '連勝好手', desc: '累計 5 場勝利', check: g => g.raceWins >= 5 },
  { id: 'ten_wins', name: '賽道之王', desc: '累計 10 場勝利', check: g => g.raceWins >= 10 },
  { id: 'full_mod', name: '全部位改裝', desc: '所有改裝分類都有安裝', check: g => {
    const cats = new Set(PARTS.filter(p => g.installed.includes(p.id)).map(p => p.category));
    return cats.size >= 6;
  }},
  { id: 'tier3', name: '旗艦收藏家', desc: '安裝任一 Tier 3 部品', check: g => g.installed.some(id => PARTS.find(p => p.id === id)?.tier === 3) },
  { id: 'rich', name: '大富翁', desc: '累計持有 $100,000', check: g => g.credits >= 100000 },
  { id: 'bike5', name: '終極座駕', desc: '購入 Dragon 1000RR', check: g => g.currentBike >= 4 },
  { id: 'odo_1000', name: '千里之行', desc: '總里程達 1000 km', check: g => g.odometer >= 1000 },
  { id: 'collector', name: '改裝狂人', desc: '擁有 10 個以上部品', check: g => g.inventory.length >= 10 },
];

const RACE_TRACKS = [
  { name: '台北市區賽', emoji: '🏙️', difficulty: 1, reward: 800, statWeight: { handling: 0.5, power: 0.3, style: 0.2 }, desc: '穿梭台北街頭' },
  { name: '北宜公路挑戰', emoji: '🏔️', difficulty: 2, reward: 1500, statWeight: { handling: 0.6, power: 0.3, style: 0.1 }, desc: '九彎十八拐' },
  { name: '西濱快速道路', emoji: '🌊', difficulty: 2, reward: 1800, statWeight: { power: 0.6, handling: 0.2, style: 0.2 }, desc: '海邊直線加速' },
  { name: '大鵬灣賽車場', emoji: '🏁', difficulty: 3, reward: 3000, statWeight: { power: 0.4, handling: 0.4, style: 0.2 }, desc: '正規賽車場計時賽' },
  { name: '武嶺極限爬坡', emoji: '⛰️', difficulty: 4, reward: 5000, statWeight: { power: 0.5, handling: 0.3, style: 0.2 }, desc: '台灣公路最高點' },
  { name: '麗寶國際賽道', emoji: '🏆', difficulty: 5, reward: 8000, statWeight: { power: 0.35, handling: 0.45, style: 0.2 }, desc: 'FIA 等級國際賽道' },
];

const INITIAL_STATE: GameState = {
  credits: 5000,
  xp: 0,
  level: 1,
  garageLevel: 1,
  currentBike: 0,
  inventory: [],
  installed: [],
  raceWins: 0,
  raceLosses: 0,
  totalRaces: 0,
  achievements: [],
  odometer: 0,
};

// ─── Helpers ───

function calcStats(bike: Bike, installed: string[]): { power: number; handling: number; style: number; weight: number; sound: number } {
  const stats = { ...bike.baseStats };
  installed.forEach(id => {
    const part = PARTS.find(p => p.id === id);
    if (part) {
      stats.power += part.stats.power || 0;
      stats.handling += part.stats.handling || 0;
      stats.style += part.stats.style || 0;
      stats.weight += part.stats.weight || 0;
      stats.sound += part.stats.sound || 0;
    }
  });
  return stats;
}

function xpForLevel(level: number): number {
  return level * level * 100;
}

function useIsMobile(bp: number = 768): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < bp);
    c();
    window.addEventListener('resize', c);
    return () => window.removeEventListener('resize', c);
  }, [bp]);
  return m;
}

// ─── Canvas Bike Renderer ───

function drawBike(
  ctx: CanvasRenderingContext2D,
  bikeIndex: number,
  installed: string[],
  animOffset: number,
  w: number,
  h: number
) {
  const cx = w / 2;
  const cy = h / 2 + animOffset * 3;
  const bike = BIKES[bikeIndex];
  const scale = 0.4 + (bikeIndex * 0.15);

  // Garage floor
  ctx.fillStyle = COLORS.card;
  ctx.fillRect(0, 0, w, h);

  // Grid background
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }
  for (let i = 0; i < h; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  // Bike body (scaled by cc)
  const bodyW = 80 * scale;
  const bodyH = 50 * scale;

  // Check for mods
  const hasCarbon = installed.some(id => id.includes('bdy'));
  const hasExhaust = installed.some(id => id.includes('exh'));
  const hasLights = installed.some(id => id.includes('lit'));
  const hasSuspension = installed.some(id => id.includes('sus'));
  const hasTires = installed.some(id => id.includes('tir'));
  const hasEngine = installed.some(id => id.includes('eng'));

  // Main body
  ctx.fillStyle = hasCarbon ? '#444444' : '#666666';
  ctx.fillRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH);

  // Headlight
  const headlightX = cx - bodyW / 2 - 10;
  const headlightY = cy - bodyH / 3;
  ctx.fillStyle = hasLights ? COLORS.accent : '#999999';
  ctx.beginPath();
  ctx.arc(headlightX, headlightY, hasLights ? 12 : 8, 0, Math.PI * 2);
  ctx.fill();

  // Front wheel
  const frontWheelX = cx - bodyW / 2 - 20;
  const wheelR = 25 * scale;
  ctx.fillStyle = hasTires ? '#222222' : '#444444';
  ctx.beginPath();
  ctx.arc(frontWheelX, cy + bodyH / 2, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rear wheel
  const rearWheelX = cx + bodyW / 2 + 20;
  ctx.fillStyle = hasTires ? '#222222' : '#444444';
  ctx.beginPath();
  ctx.arc(rearWheelX, cy + bodyH / 2, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Exhaust pipe (rear)
  if (hasExhaust) {
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx + bodyW / 2 - 10, cy);
    ctx.quadraticCurveTo(cx + bodyW / 2 + 10, cy + 20, rearWheelX - 5, cy + bodyH / 2 - 15);
    ctx.stroke();
  }

  // Suspension coils (if mod)
  if (hasSuspension) {
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 2;
    const suspX = cx - bodyW / 3;
    for (let i = 0; i < 4; i++) {
      const y = cy - bodyH / 2 + (i * 8);
      ctx.beginPath();
      ctx.arc(suspX, y, 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Engine glow (if upgraded)
  if (hasEngine) {
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, bodyW / 2 + 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bike name
  ctx.fillStyle = COLORS.text;
  ctx.font = `12px "JetBrains Mono"`;
  ctx.textAlign = 'center';
  ctx.fillText(bike.name, cx, cy + bodyH / 2 + 50);
  ctx.fillText(`${bike.cc}cc`, cx, cy + bodyH / 2 + 65);
}

// ─── Toast Component ───

function Toast({
  message,
  duration = 3000,
  onClose,
}: {
  message: string;
  duration?: number;
  onClose: () => void;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: show ? '20px' : '-100px',
        right: '20px',
        backgroundColor: COLORS.accent,
        color: COLORS.bg,
        padding: '12px 20px',
        borderRadius: '4px',
        fontFamily: '"JetBrains Mono"',
        fontSize: '14px',
        transition: 'bottom 0.3s',
        zIndex: 1000,
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {message}
    </div>
  );
}

// ─── Main Game Component ───

const GamePage: React.FC = () => {
  const isMobile = useIsMobile();
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [toast, setToast] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<'bikes' | 'races' | 'achievements' | null>(null);
  const [shopTab, setShopTab] = useState<'shop' | 'inventory'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('exhaust');
  const [draggedPart, setDraggedPart] = useState<string | null>(null);
  const [dropHovering, setDropHovering] = useState(false);
  const [raceAnimating, setRaceAnimating] = useState(false);
  const [raceResult, setRaceResult] = useState<{ won: boolean; reward: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const [animOffset, setAnimOffset] = useState(0);

  // Load saved game
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hymmoto_garage');
      if (saved) {
        setGame(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save game
  useEffect(() => {
    try {
      localStorage.setItem('hymmoto_garage', JSON.stringify(game));
    } catch {}
  }, [game]);

  // Canvas animation loop
  useEffect(() => {
    const animate = () => {
      setAnimOffset(o => (o + 0.1) % (Math.PI * 2));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBike(ctx, game.currentBike, game.installed, Math.sin(animOffset), canvas.width, canvas.height);
  }, [game.currentBike, game.installed, animOffset]);

  const bike = BIKES[game.currentBike];
  const stats = useMemo(() => calcStats(bike, game.installed), [bike, game.installed]);
  const currentXpNeeded = xpForLevel(game.level);
  const xpProgress = (game.xp % currentXpNeeded) / currentXpNeeded;

  const handleBuyPart = (partId: string) => {
    const part = PARTS.find(p => p.id === partId);
    if (!part) return;
    if (game.credits < part.price) {
      setToast('💰 Not enough credits!');
      return;
    }
    if (game.inventory.includes(partId)) {
      setToast('✓ Already owned!');
      return;
    }

    setGame({
      ...game,
      credits: game.credits - part.price,
      inventory: [...game.inventory, partId],
    });
    setToast(`✓ Bought ${part.name}!`);
  };

  const handleDropPart = (partId: string) => {
    if (!game.inventory.includes(partId)) return;

    const part = PARTS.find(p => p.id === partId);
    if (!part) return;

    // Check if already installed in same category
    const sameCategory = game.installed.find(id => {
      const p = PARTS.find(x => x.id === id);
      return p?.category === part.category;
    });

    let newInstalled = game.installed.filter(id => id !== sameCategory);
    newInstalled.push(partId);

    setGame({
      ...game,
      installed: newInstalled,
    });
    setToast(`✓ Installed ${part.name}!`);
  };

  const handleUninstallPart = (partId: string) => {
    setGame({
      ...game,
      installed: game.installed.filter(id => id !== partId),
    });
    const part = PARTS.find(p => p.id === partId);
    setToast(`✓ Uninstalled ${part?.name}!`);
  };

  const handleRace = async (trackIdx: number) => {
    setShowModal(null);
    setRaceAnimating(true);

    // Simulate race
    await new Promise(r => setTimeout(r, 3000));

    const track = RACE_TRACKS[trackIdx];
    const bikeScore = (stats.power * (track.statWeight.power || 0)) +
                      (stats.handling * (track.statWeight.handling || 0)) +
                      (stats.style * (track.statWeight.style || 0));
    const difficulty = track.difficulty;
    const opponentScore = 50 + difficulty * 25 + Math.random() * 30;
    const won = bikeScore > opponentScore;
    const reward = won ? track.reward : Math.floor(track.reward * 0.3);

    setRaceResult({ won, reward });

    if (won) {
      setGame(g => ({
        ...g,
        credits: g.credits + reward,
        raceWins: g.raceWins + 1,
        totalRaces: g.totalRaces + 1,
        xp: g.xp + 100,
      }));
      setToast(`🏆 Won! +$${reward}`);
    } else {
      setGame(g => ({
        ...g,
        credits: g.credits + reward,
        raceLosses: g.raceLosses + 1,
        totalRaces: g.totalRaces + 1,
        xp: g.xp + 20,
      }));
      setToast(`😢 Lost. +$${reward}`);
    }

    await new Promise(r => setTimeout(r, 2000));
    setRaceAnimating(false);
    setRaceResult(null);
  };

  const handleRide = () => {
    setGame(g => ({
      ...g,
      odometer: g.odometer + 10,
      xp: g.xp + 15,
      credits: g.credits + 50,
    }));
    setToast('🏍️ Rode 10 km, +50 credits!');
  };

  const handleBuyBike = (bikeIdx: number) => {
    const targetBike = BIKES[bikeIdx];
    if (game.currentBike === bikeIdx) {
      setToast('✓ Already riding this bike!');
      return;
    }
    if (game.credits < targetBike.price) {
      setToast('💰 Not enough credits!');
      return;
    }

    setGame({
      ...game,
      credits: game.credits - targetBike.price,
      currentBike: bikeIdx,
      installed: [],
    });
    setToast(`✓ Switched to ${targetBike.name}!`);
    setShowModal(null);
  };

  // Category icons
  const categoryIcons: { [k: string]: string } = {
    exhaust: '💨',
    suspension: '🛞',
    tires: '🚙',
    ecu: '⚙️',
    bodykit: '🎨',
    lights: '💡',
    engine: '⚡',
    intake: '🌬️',
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: '"JetBrains Mono", monospace',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `2px solid ${COLORS.border}`,
          backgroundColor: COLORS.card,
          fontSize: '12px',
          color: COLORS.muted,
        }}
      >
        guest@hymmoto.tw:~/garage$ <span style={{ color: COLORS.accent }}>./simulator</span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '16px',
          padding: '16px',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
        }}
      >
        {/* Left Panel - Stats */}
        {!isMobile && (
          <div
            style={{
              flex: '0 0 200px',
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.border}`,
              padding: '16px',
              borderRadius: '4px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '12px', marginBottom: '12px' }}>
              <div style={{ color: COLORS.accent, marginBottom: '8px' }}>
                {bike.name}
              </div>
              <div style={{ color: COLORS.muted, fontSize: '10px', marginBottom: '12px' }}>
                Lv.{game.level} • XP {game.xp}/{currentXpNeeded}
              </div>

              {/* XP bar */}
              <div style={{ backgroundColor: COLORS.bg, padding: '4px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: `${xpProgress * 100}%`,
                    height: '6px',
                    backgroundColor: COLORS.accent,
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              <div style={{ color: COLORS.gold, marginBottom: '12px' }}>
                ${game.credits.toLocaleString()}
              </div>

              {/* Stats bars */}
              <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ marginBottom: '2px' }}>Power {Math.round(stats.power)}</div>
                  <div
                    style={{
                      backgroundColor: COLORS.bg,
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (stats.power / 150) * 100)}%`,
                        height: '100%',
                        backgroundColor: COLORS.red,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <div style={{ marginBottom: '2px' }}>Handling {Math.round(stats.handling)}</div>
                  <div
                    style={{
                      backgroundColor: COLORS.bg,
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (stats.handling / 150) * 100)}%`,
                        height: '100%',
                        backgroundColor: COLORS.blue,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <div style={{ marginBottom: '2px' }}>Style {Math.round(stats.style)}</div>
                  <div
                    style={{
                      backgroundColor: COLORS.bg,
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (stats.style / 150) * 100)}%`,
                        height: '100%',
                        backgroundColor: COLORS.purple,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <div style={{ marginBottom: '2px' }}>Weight {Math.round(stats.weight)}</div>
                  <div
                    style={{
                      backgroundColor: COLORS.bg,
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, ((220 - stats.weight) / 150) * 100)}%`,
                        height: '100%',
                        backgroundColor: COLORS.accent,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <div style={{ marginBottom: '2px' }}>Sound {Math.round(stats.sound)}</div>
                  <div
                    style={{
                      backgroundColor: COLORS.bg,
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (stats.sound / 150) * 100)}%`,
                        height: '100%',
                        backgroundColor: COLORS.gold,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Installed parts */}
              <div style={{ fontSize: '10px', marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${COLORS.border}` }}>
                <div style={{ marginBottom: '8px', color: COLORS.accent }}>INSTALLED</div>
                {game.installed.length === 0 ? (
                  <div style={{ color: COLORS.muted, fontSize: '9px' }}>No mods</div>
                ) : (
                  game.installed.map(partId => {
                    const part = PARTS.find(p => p.id === partId);
                    return (
                      <div
                        key={partId}
                        style={{
                          padding: '6px',
                          backgroundColor: COLORS.bg,
                          marginBottom: '4px',
                          borderLeft: `2px solid ${COLORS.accent}`,
                          cursor: 'pointer',
                          fontSize: '9px',
                        }}
                        onClick={() => handleUninstallPart(partId)}
                        title="Click to uninstall"
                      >
                        {categoryIcons[part?.category || '']} {part?.name}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Center - Bike Canvas */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            width={isMobile ? 300 : 400}
            height={isMobile ? 250 : 300}
            style={{
              border: `2px solid ${COLORS.border}`,
              borderRadius: '4px',
              backgroundColor: COLORS.card,
              cursor: dropHovering ? 'copy' : 'default',
            }}
            onDragOver={e => {
              e.preventDefault();
              setDropHovering(true);
            }}
            onDragLeave={() => setDropHovering(false)}
            onDrop={e => {
              e.preventDefault();
              setDropHovering(false);
              if (draggedPart) {
                handleDropPart(draggedPart);
                setDraggedPart(null);
              }
            }}
          />

          {/* Odometer */}
          <div
            style={{
              marginTop: '12px',
              fontSize: '11px',
              color: COLORS.muted,
            }}
          >
            Odometer: {game.odometer} km
          </div>
        </div>

        {/* Right Panel - Shop/Inventory */}
        {!isMobile && (
          <div
            style={{
              flex: '0 0 240px',
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.border}`,
              padding: '12px',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', marginBottom: '12px', gap: '4px' }}>
              <button
                onClick={() => setShopTab('shop')}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: shopTab === 'shop' ? COLORS.accent : COLORS.bg,
                  color: shopTab === 'shop' ? COLORS.bg : COLORS.text,
                  border: 'none',
                  fontFamily: '"JetBrains Mono"',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                SHOP
              </button>
              <button
                onClick={() => setShopTab('inventory')}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: shopTab === 'inventory' ? COLORS.accent : COLORS.bg,
                  color: shopTab === 'inventory' ? COLORS.bg : COLORS.text,
                  border: 'none',
                  fontFamily: '"JetBrains Mono"',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                INVENTORY
              </button>
            </div>

            {shopTab === 'shop' ? (
              <>
                {/* Category selector */}
                <div style={{ fontSize: '10px', marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {['exhaust', 'suspension', 'tires', 'ecu', 'bodykit', 'lights', 'engine', 'intake'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: selectedCategory === cat ? COLORS.accent : COLORS.bg,
                        color: selectedCategory === cat ? COLORS.bg : COLORS.text,
                        border: 'none',
                        fontFamily: '"JetBrains Mono"',
                        fontSize: '9px',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {categoryIcons[cat]}
                    </button>
                  ))}
                </div>

                {/* Parts list */}
                <div style={{ flex: 1, overflowY: 'auto', fontSize: '9px' }}>
                  {PARTS.filter(p => p.category === selectedCategory).map(part => (
                    <button
                      key={part.id}
                      onClick={() => handleBuyPart(part.id)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '6px',
                        backgroundColor: COLORS.bg,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                        fontFamily: '"JetBrains Mono"',
                        fontSize: '9px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                      title={part.desc}
                    >
                      <div style={{ color: COLORS.accent, marginBottom: '2px' }}>{part.name}</div>
                      <div style={{ color: COLORS.gold }}>${part.price}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Inventory */
              <div style={{ flex: 1, overflowY: 'auto', fontSize: '9px' }}>
                {game.inventory.length === 0 ? (
                  <div style={{ color: COLORS.muted }}>No parts owned</div>
                ) : (
                  game.inventory.map(partId => {
                    const part = PARTS.find(p => p.id === partId);
                    const isInstalled = game.installed.includes(partId);
                    return (
                      <div
                        key={partId}
                        draggable
                        onDragStart={() => setDraggedPart(partId)}
                        style={{
                          padding: '8px',
                          marginBottom: '6px',
                          backgroundColor: isInstalled ? COLORS.border : COLORS.bg,
                          border: `1px solid ${isInstalled ? COLORS.accent : COLORS.border}`,
                          color: COLORS.text,
                          fontFamily: '"JetBrains Mono"',
                          cursor: 'grab',
                          borderRadius: '2px',
                        }}
                        title={part?.desc}
                      >
                        <div style={{ marginBottom: '2px' }}>
                          {categoryIcons[part?.category || '']} {part?.name}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '8px' }}>
                          {isInstalled ? '✓ Installed' : 'Drag to install'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile layout - panels below canvas */}
      {isMobile && (
        <div style={{ overflowY: 'auto', maxHeight: '30%', padding: '12px' }}>
          <div style={{ fontSize: '11px', marginBottom: '12px' }}>
            <div style={{ color: COLORS.accent, marginBottom: '6px' }}>{bike.name} | Lv.{game.level}</div>
            <div style={{ color: COLORS.gold, marginBottom: '6px' }}>${game.credits.toLocaleString()}</div>
            <div style={{ fontSize: '10px', marginBottom: '6px' }}>
              Power: {Math.round(stats.power)} | Handling: {Math.round(stats.handling)}
            </div>
          </div>

          {/* Quick shop */}
          <div style={{ fontSize: '10px' }}>
            <div style={{ color: COLORS.accent, marginBottom: '6px' }}>QUICK PARTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {PARTS.slice(0, 4).map(part => (
                <button
                  key={part.id}
                  onClick={() => handleBuyPart(part.id)}
                  style={{
                    padding: '6px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontFamily: '"JetBrains Mono"',
                    fontSize: '9px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  {part.name} ${part.price}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          borderTop: `2px solid ${COLORS.border}`,
          backgroundColor: COLORS.card,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={handleRide}
          style={{
            padding: '10px 20px',
            backgroundColor: COLORS.accent,
            color: COLORS.bg,
            border: 'none',
            fontFamily: '"JetBrains Mono"',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          🏍️ RIDE
        </button>
        <button
          onClick={() => setShowModal('races')}
          style={{
            padding: '10px 20px',
            backgroundColor: COLORS.blue,
            color: COLORS.bg,
            border: 'none',
            fontFamily: '"JetBrains Mono"',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          🏁 RACE
        </button>
        <button
          onClick={() => setShowModal('bikes')}
          style={{
            padding: '10px 20px',
            backgroundColor: COLORS.purple,
            color: COLORS.bg,
            border: 'none',
            fontFamily: '"JetBrains Mono"',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          🏍️ BIKES
        </button>
        <button
          onClick={() => setShowModal('achievements')}
          style={{
            padding: '10px 20px',
            backgroundColor: COLORS.gold,
            color: COLORS.bg,
            border: 'none',
            fontFamily: '"JetBrains Mono"',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          🏆 ACHIEVEMENTS
        </button>
        <Link href="/data" style={{ textDecoration: 'none' }}>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: COLORS.muted,
              color: COLORS.bg,
              border: 'none',
              fontFamily: '"JetBrains Mono"',
              fontSize: '12px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            ← DATA
          </button>
        </Link>
      </div>

      {/* Modals */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.border}`,
              padding: '20px',
              borderRadius: '4px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              fontSize: '12px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {showModal === 'races' && (
              <>
                <div style={{ color: COLORS.accent, marginBottom: '12px', fontSize: '14px' }}>
                  SELECT RACE TRACK
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {RACE_TRACKS.map((track, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRace(idx)}
                      style={{
                        padding: '12px',
                        backgroundColor: COLORS.bg,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                        fontFamily: '"JetBrains Mono"',
                        fontSize: '11px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      <div style={{ marginBottom: '4px' }}>
                        {track.emoji} {track.name}
                      </div>
                      <div style={{ color: COLORS.muted, fontSize: '10px' }}>
                        Difficulty: {'⭐'.repeat(track.difficulty)} | Reward: ${track.reward}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {showModal === 'bikes' && (
              <>
                <div style={{ color: COLORS.accent, marginBottom: '12px', fontSize: '14px' }}>
                  BIKE SELECTION
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {BIKES.map((b, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleBuyBike(idx)}
                      style={{
                        padding: '12px',
                        backgroundColor: game.currentBike === idx ? COLORS.border : COLORS.bg,
                        border: `2px solid ${game.currentBike === idx ? COLORS.accent : COLORS.border}`,
                        color: COLORS.text,
                        fontFamily: '"JetBrains Mono"',
                        fontSize: '11px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      <div style={{ marginBottom: '4px' }}>
                        {b.name} {game.currentBike === idx && '✓'}
                      </div>
                      <div style={{ color: COLORS.muted, fontSize: '10px', marginBottom: '4px' }}>
                        {b.cc}cc • {b.brand}
                      </div>
                      <div style={{ color: COLORS.gold, fontSize: '10px' }}>
                        {b.price === 0 ? 'Starter bike' : `$${b.price.toLocaleString()}`}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {showModal === 'achievements' && (
              <>
                <div style={{ color: COLORS.accent, marginBottom: '12px', fontSize: '14px' }}>
                  ACHIEVEMENTS ({game.achievements.length}/{ACHIEVEMENTS.length})
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {ACHIEVEMENTS.map(ach => {
                    const unlocked = ach.check(game);
                    return (
                      <div
                        key={ach.id}
                        style={{
                          padding: '10px',
                          backgroundColor: COLORS.bg,
                          border: `1px solid ${unlocked ? COLORS.accent : COLORS.border}`,
                          borderRadius: '2px',
                          opacity: unlocked ? 1 : 0.5,
                        }}
                      >
                        <div style={{ marginBottom: '4px' }}>
                          {unlocked ? '🔓' : '🔒'} {ach.name}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '10px' }}>
                          {ach.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Race Animation Overlay */}
      {raceAnimating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            color: COLORS.text,
            fontFamily: '"JetBrains Mono"',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '20px' }}>🏁</div>
          {!raceResult ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: COLORS.accent }}>
                RACING...
              </div>
              <div
                style={{
                  width: '200px',
                  height: '8px',
                  backgroundColor: COLORS.border,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: COLORS.accent,
                    width: '100%',
                    animation: 'progress 2s ease-in-out infinite',
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  color: raceResult.won ? COLORS.accent : COLORS.red,
                }}
              >
                {raceResult.won ? '🏆 VICTORY!' : '😢 DEFEAT'}
              </div>
              <div style={{ fontSize: '20px', color: COLORS.gold }}>
                +${raceResult.reward}
              </div>
            </>
          )}
          <style>{`
            @keyframes progress {
              0% { width: 0%; }
              50% { width: 100%; }
              100% { width: 0%; }
            }
          `}</style>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default GamePage;
