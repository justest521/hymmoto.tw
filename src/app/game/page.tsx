'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════
//  MOTO GARAGE — 機車改裝模擬器 Terminal Game
// ═══════════════════════════════════════════════

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
  ascii?: string;
}

interface Bike {
  name: string;
  brand: string;
  cc: number;
  baseStats: { power: number; handling: number; style: number; weight: number; sound: number };
  price: number;
  ascii: string[];
}

interface GameState {
  credits: number;
  xp: number;
  level: number;
  garageLevel: number;
  currentBike: number; // index into BIKES
  inventory: string[]; // part IDs owned
  installed: string[]; // part IDs installed
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
    ascii: [
      '         __',
      '    ----/  |___',
      '   /    |      \\',
      '  |  []  \\__    |',
      '   \\________\\   |',
      '   (O)      (O)',
    ],
  },
  {
    name: 'Street Hawk 150',
    brand: 'KYMCO',
    cc: 150,
    baseStats: { power: 35, handling: 50, style: 40, weight: 125, sound: 25 },
    price: 8000,
    ascii: [
      '          ___',
      '    =====/ / |__',
      '   /  __/ /     \\',
      '  | [##] /  __   |',
      '   \\____/\\_/  \\__|',
      '   (O)       (O)',
    ],
  },
  {
    name: 'Thunder 300',
    brand: 'SYM',
    cc: 300,
    baseStats: { power: 55, handling: 60, style: 55, weight: 170, sound: 40 },
    price: 25000,
    ascii: [
      '           ____',
      '    ======/   /|___',
      '   / ____/   /     \\',
      '  |[####]   / __    |',
      '   \\______/\\_/ |\\__|',
      '   (@@)        (@@)',
    ],
  },
  {
    name: 'Viper 600R',
    brand: 'YAMAHA',
    cc: 600,
    baseStats: { power: 80, handling: 75, style: 75, weight: 200, sound: 65 },
    price: 60000,
    ascii: [
      '            _____',
      '    ========/ __/|____',
      '   / ______/ /  |     \\',
      '  |[######] /   | __   |',
      '   \\_______/  \\_|/  \\__|',
      '   (@@@)          (@@@)',
    ],
  },
  {
    name: 'Dragon 1000RR',
    brand: 'HYMMOTO',
    cc: 1000,
    baseStats: { power: 100, handling: 85, style: 90, weight: 220, sound: 85 },
    price: 150000,
    ascii: [
      '             ________',
      '    =========/ ____/|_____',
      '   / _______/ / ## |      \\',
      '  |[########]/ ### |  __   |',
      '   \\_________\\ ___|_/  \\__|',
      '   (@@@@)            (@@@@)',
    ],
  },
];

const PARTS: Part[] = [
  // Exhaust
  { id: 'exh1', name: 'Sport Slip-On', nameTw: '運動型排氣管', category: 'exhaust', tier: 1, price: 1200, stats: { power: 3, sound: 10, style: 5 }, desc: '入門改裝排氣管，聲浪提升明顯' },
  { id: 'exh2', name: 'Racing Full System', nameTw: '競技全段排氣', category: 'exhaust', tier: 2, price: 4500, stats: { power: 8, sound: 20, style: 10, weight: -3 }, desc: '鈦合金全段，馬力躍升' },
  { id: 'exh3', name: 'Akrapovic Evo', nameTw: '蠍子管旗艦款', category: 'exhaust', tier: 3, price: 12000, stats: { power: 15, sound: 30, style: 20, weight: -5 }, desc: '頂級蠍子管，賽道級性能' },

  // Suspension
  { id: 'sus1', name: 'Sport Springs', nameTw: '運動彈簧', category: 'suspension', tier: 1, price: 800, stats: { handling: 8 }, desc: '降低重心，過彎更穩' },
  { id: 'sus2', name: 'Adjustable Coilovers', nameTw: '可調避震器', category: 'suspension', tier: 2, price: 3500, stats: { handling: 18, style: 5 }, desc: '32段阻尼可調，高低軟硬隨心' },
  { id: 'sus3', name: 'Ohlins TTX', nameTw: 'Ohlins 頂級避震', category: 'suspension', tier: 3, price: 15000, stats: { handling: 30, style: 10 }, desc: 'MotoGP 等級避震，極致操控' },

  // Tires
  { id: 'tir1', name: 'Sport Compound', nameTw: '運動膠質輪胎', category: 'tires', tier: 1, price: 600, stats: { handling: 5, style: 3 }, desc: '抓地力提升，日常好用' },
  { id: 'tir2', name: 'Semi-Slick', nameTw: '半熱熔胎', category: 'tires', tier: 2, price: 2000, stats: { handling: 12, power: 2 }, desc: '賽道日必備，熱胎快' },
  { id: 'tir3', name: 'Pirelli Supercorsa', nameTw: '倍耐力旗艦熱熔', category: 'tires', tier: 3, price: 5000, stats: { handling: 22, power: 5, style: 5 }, desc: 'WSBK 指定用胎' },

  // ECU
  { id: 'ecu1', name: 'Stage 1 Flash', nameTw: '一階電腦', category: 'ecu', tier: 1, price: 1500, stats: { power: 5 }, desc: '解除原廠限制，釋放隱藏馬力' },
  { id: 'ecu2', name: 'Race ECU Tune', nameTw: '競技電腦調校', category: 'ecu', tier: 2, price: 5000, stats: { power: 12, sound: 5 }, desc: '供油點火全面優化' },
  { id: 'ecu3', name: 'Motec M1 Kit', nameTw: 'MoTeC 全取代', category: 'ecu', tier: 3, price: 18000, stats: { power: 25, sound: 10, handling: 5 }, desc: 'F1 等級引擎管理系統' },

  // Body Kit
  { id: 'bdy1', name: 'Carbon Mirrors', nameTw: '碳纖維後照鏡', category: 'bodykit', tier: 1, price: 500, stats: { style: 10, weight: -1 }, desc: '輕量化碳纖鏡面' },
  { id: 'bdy2', name: 'Race Fairing Kit', nameTw: '競技整流罩', category: 'bodykit', tier: 2, price: 3000, stats: { style: 20, power: 3, weight: -4 }, desc: '風阻降低，速度提升' },
  { id: 'bdy3', name: 'Full Carbon Package', nameTw: '全碳纖維套件', category: 'bodykit', tier: 3, price: 20000, stats: { style: 35, power: 5, weight: -10 }, desc: '整車碳纖維化，輕到飛起' },

  // Lights
  { id: 'lit1', name: 'LED Headlight', nameTw: 'LED 大燈', category: 'lights', tier: 1, price: 400, stats: { style: 8 }, desc: '白光 LED 照明升級' },
  { id: 'lit2', name: 'RGB Underglow', nameTw: '底盤氛圍燈', category: 'lights', tier: 2, price: 1200, stats: { style: 15 }, desc: '七彩底盤燈，夜騎必備' },
  { id: 'lit3', name: 'DRL Projector Kit', nameTw: '魚眼日行燈組', category: 'lights', tier: 3, price: 3500, stats: { style: 25 }, desc: '超跑級魚眼燈組' },

  // Intake
  { id: 'int1', name: 'High-Flow Filter', nameTw: '高流量濾芯', category: 'intake', tier: 1, price: 300, stats: { power: 2, sound: 3 }, desc: '進氣量提升，油門更直接' },
  { id: 'int2', name: 'Ram Air Intake', nameTw: '衝壓進氣', category: 'intake', tier: 2, price: 2000, stats: { power: 7, sound: 8 }, desc: '高速時進氣加壓效果明顯' },
  { id: 'int3', name: 'Velocity Stack Kit', nameTw: '喇叭口進氣組', category: 'intake', tier: 3, price: 8000, stats: { power: 12, sound: 15, style: 5 }, desc: '直噴式進氣，聲浪如咆哮' },

  // Engine
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

function statBar(value: number, max: number = 100, width: number = 20): string {
  const filled = Math.min(width, Math.max(0, Math.round((value / max) * width)));
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
}

function xpForLevel(level: number): number {
  return level * level * 100;
}

// ─── Mobile Hook ───

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

// ─── Game Component ───

const GamePage: React.FC = () => {
  const isMobile = useIsMobile();
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [history, setHistory] = useState<{ type: 'cmd' | 'output' | 'ascii' | 'success' | 'error' | 'achievement' | 'race'; text: string }[]>([]);
  const [cmd, setCmd] = useState('');
  const [raceAnimating, setRaceAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved game from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hymmoto_garage');
      if (saved) {
        const parsed = JSON.parse(saved);
        setGame(parsed);
      }
    } catch {}
  }, []);

  // Save game on changes
  useEffect(() => {
    try {
      localStorage.setItem('hymmoto_garage', JSON.stringify(game));
    } catch {}
  }, [game]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  // Boot message
  useEffect(() => {
    const bootLines = [
      { type: 'output' as const, text: '╔══════════════════════════════════════════════╗' },
      { type: 'ascii' as const, text: '║  MOTO GARAGE v1.0 — 機車改裝模擬器          ║' },
      { type: 'ascii' as const, text: '║  by HYMMOTO.TW                               ║' },
      { type: 'output' as const, text: '╚══════════════════════════════════════════════╝' },
      { type: 'output' as const, text: '' },
      { type: 'success' as const, text: `歡迎來到你的機車車庫！你有一台 ${BIKES[0].name} 和 $${INITIAL_STATE.credits.toLocaleString()} 改裝基金。` },
      { type: 'output' as const, text: '輸入 help 查看指令，或輸入 status 看看你的愛車。' },
      { type: 'output' as const, text: '' },
    ];
    setHistory(bootLines);
  }, []);

  const bike = BIKES[game.currentBike];
  const stats = useMemo(() => calcStats(bike, game.installed), [bike, game.installed]);

  const addOutput = useCallback((lines: { type: 'cmd' | 'output' | 'ascii' | 'success' | 'error' | 'achievement' | 'race'; text: string }[]) => {
    setHistory(prev => [...prev, ...lines]);
  }, []);

  const checkAchievements = useCallback((newState: GameState) => {
    const newAch: string[] = [];
    ACHIEVEMENTS.forEach(a => {
      if (!newState.achievements.includes(a.id) && a.check(newState)) {
        newAch.push(a.id);
      }
    });
    if (newAch.length > 0) {
      const updated = { ...newState, achievements: [...newState.achievements, ...newAch] };
      newAch.forEach(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id)!;
        addOutput([
          { type: 'achievement', text: `🏆 成就解鎖: ${ach.name} — ${ach.desc}` },
        ]);
      });
      return updated;
    }
    return newState;
  }, [addOutput]);

  const execute = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addOutput([{ type: 'cmd', text: trimmed }]);
    const parts = trimmed.toLowerCase().split(/\s+/);
    const command = parts[0];

    if (command === 'help') {
      addOutput([
        { type: 'output', text: '┌─── MOTO GARAGE 指令列表 ───┐' },
        { type: 'output', text: '│                             │' },
        { type: 'output', text: '│  status    查看愛車狀態      │' },
        { type: 'output', text: '│  shop      瀏覽改裝商店      │' },
        { type: 'output', text: '│  buy [id]  購買部品          │' },
        { type: 'output', text: '│  install [id] 安裝部品       │' },
        { type: 'output', text: '│  uninstall [id] 卸載部品     │' },
        { type: 'output', text: '│  inventory 查看倉庫          │' },
        { type: 'output', text: '│  bikes     查看可購買車輛     │' },
        { type: 'output', text: '│  upgrade [n] 升級座駕        │' },
        { type: 'output', text: '│  race      進入比賽選單      │' },
        { type: 'output', text: '│  race [n]  參加第 N 場比賽   │' },
        { type: 'output', text: '│  garage    查看車庫等級       │' },
        { type: 'output', text: '│  achievements 查看成就       │' },
        { type: 'output', text: '│  ride      出去兜風          │' },
        { type: 'output', text: '│  reset     重置遊戲          │' },
        { type: 'output', text: '│  clear     清除畫面          │' },
        { type: 'output', text: '│  help      顯示此選單        │' },
        { type: 'output', text: '│                             │' },
        { type: 'output', text: '└─────────────────────────────┘' },
      ]);
    } else if (command === 'clear') {
      setHistory([]);
    } else if (command === 'reset') {
      setGame(INITIAL_STATE);
      setHistory([]);
      addOutput([{ type: 'success', text: '遊戲已重置。輸入 help 開始。' }]);
    } else if (command === 'status') {
      const b = BIKES[game.currentBike];
      const s = calcStats(b, game.installed);
      const installedParts = game.installed.map(id => PARTS.find(p => p.id === id)!).filter(Boolean);
      const bw = isMobile ? 12 : 20;
      addOutput([
        { type: 'output', text: `┌─── ${b.name} (${b.cc}cc) ───` },
        { type: 'output', text: `│ Brand: ${b.brand}` },
        ...b.ascii.map(line => ({ type: 'ascii' as const, text: `│  ${line}` })),
        { type: 'output', text: '│' },
        { type: 'output', text: `│  POWER    ${statBar(s.power, 150, bw)} ${s.power}` },
        { type: 'output', text: `│  HANDLING ${statBar(s.handling, 150, bw)} ${s.handling}` },
        { type: 'output', text: `│  STYLE    ${statBar(s.style, 150, bw)} ${s.style}` },
        { type: 'output', text: `│  SOUND    ${statBar(s.sound, 150, bw)} ${s.sound}` },
        { type: 'output', text: `│  WEIGHT   ${s.weight} kg` },
        { type: 'output', text: '│' },
        { type: 'output', text: `│  已安裝 (${installedParts.length}):` },
        ...(installedParts.length === 0
          ? [{ type: 'output' as const, text: '│    (原廠狀態)' }]
          : installedParts.map(p => ({ type: 'output' as const, text: `│    ✓ ${p.nameTw} [${p.category}]` }))),
        { type: 'output', text: '│' },
        { type: 'output', text: `│  💰 $${game.credits.toLocaleString()}  ⭐ Lv.${game.level}  🏁 ${game.raceWins}W/${game.raceLosses}L  📏 ${game.odometer}km` },
        { type: 'output', text: '└────────────────────' },
      ]);
    } else if (command === 'shop') {
      const cat = parts[1];
      const categories = ['exhaust', 'suspension', 'tires', 'ecu', 'bodykit', 'lights', 'intake', 'engine'];
      const catLabels: Record<string, string> = {
        exhaust: '排氣管', suspension: '避震', tires: '輪胎', ecu: '電腦',
        bodykit: '外觀', lights: '燈組', intake: '進氣', engine: '引擎',
      };

      if (!cat || !categories.includes(cat)) {
        addOutput([
          { type: 'output', text: '┌─── 改裝商店分類 ───' },
          ...categories.map(c => ({
            type: 'output' as const,
            text: `│  shop ${c.padEnd(12)} ${catLabels[c]}  (${PARTS.filter(p => p.category === c).length} 件)`,
          })),
          { type: 'output', text: '│' },
          { type: 'output', text: '│  用法: shop exhaust' },
          { type: 'output', text: '└────────────────────' },
        ]);
      } else {
        const items = PARTS.filter(p => p.category === cat);
        addOutput([
          { type: 'output', text: `┌─── ${catLabels[cat]} 商店 ───` },
          ...items.map(p => {
            const owned = game.inventory.includes(p.id);
            const installed = game.installed.includes(p.id);
            const tag = installed ? ' [已裝]' : owned ? ' [已有]' : '';
            const statsStr = Object.entries(p.stats).map(([k, v]) => `${k}${(v as number) >= 0 ? '+' : ''}${v}`).join(' ');
            return { type: 'output' as const, text: `│  ${p.id.padEnd(5)} T${p.tier} $${p.price.toLocaleString().padStart(6)}  ${p.nameTw}${tag}\n│         ${statsStr}\n│         ${p.desc}` };
          }),
          { type: 'output', text: '│' },
          { type: 'output', text: `│  💰 你有: $${game.credits.toLocaleString()}` },
          { type: 'output', text: '│  用法: buy exh1' },
          { type: 'output', text: '└────────────────────' },
        ]);
      }
    } else if (command === 'buy') {
      const partId = parts[1];
      if (!partId) {
        addOutput([{ type: 'error', text: '用法: buy [部品ID] (例: buy exh1)' }]);
        return;
      }
      const part = PARTS.find(p => p.id === partId);
      if (!part) {
        addOutput([{ type: 'error', text: `找不到部品: ${partId}` }]);
        return;
      }
      if (game.inventory.includes(partId)) {
        addOutput([{ type: 'error', text: `你已經有 ${part.nameTw} 了` }]);
        return;
      }
      if (game.credits < part.price) {
        addOutput([{ type: 'error', text: `資金不足！需要 $${part.price.toLocaleString()}，你只有 $${game.credits.toLocaleString()}` }]);
        return;
      }
      let newState = {
        ...game,
        credits: game.credits - part.price,
        inventory: [...game.inventory, partId],
      };
      newState = checkAchievements(newState);
      setGame(newState);
      addOutput([
        { type: 'success', text: `✓ 購買成功: ${part.nameTw} ($${part.price.toLocaleString()})` },
        { type: 'output', text: `  餘額: $${newState.credits.toLocaleString()}` },
        { type: 'output', text: `  輸入 install ${partId} 來安裝` },
      ]);
    } else if (command === 'install') {
      const partId = parts[1];
      if (!partId) {
        addOutput([{ type: 'error', text: '用法: install [部品ID] (例: install exh1)' }]);
        return;
      }
      const part = PARTS.find(p => p.id === partId);
      if (!part) {
        addOutput([{ type: 'error', text: `找不到部品: ${partId}` }]);
        return;
      }
      if (!game.inventory.includes(partId)) {
        addOutput([{ type: 'error', text: `你沒有 ${part.nameTw}，先用 buy ${partId} 購買` }]);
        return;
      }
      if (game.installed.includes(partId)) {
        addOutput([{ type: 'error', text: `${part.nameTw} 已經安裝了` }]);
        return;
      }
      // Remove same category lower tier
      const sameCategory = game.installed.filter(id => {
        const p = PARTS.find(pp => pp.id === id);
        return p?.category === part.category;
      });
      const newInstalled = game.installed.filter(id => !sameCategory.includes(id));
      newInstalled.push(partId);

      let newState = { ...game, installed: newInstalled };
      newState = checkAchievements(newState);
      setGame(newState);

      const statsStr = Object.entries(part.stats).map(([k, v]) => `${k}${(v as number) >= 0 ? '+' : ''}${v}`).join(' ');
      addOutput([
        { type: 'success', text: `🔧 安裝完成: ${part.nameTw}` },
        { type: 'output', text: `   效果: ${statsStr}` },
        ...(sameCategory.length > 0 ? [{ type: 'output' as const, text: `   已替換: ${sameCategory.map(id => PARTS.find(p => p.id === id)?.nameTw).join(', ')}` }] : []),
      ]);
    } else if (command === 'uninstall') {
      const partId = parts[1];
      if (!partId) {
        addOutput([{ type: 'error', text: '用法: uninstall [部品ID]' }]);
        return;
      }
      if (!game.installed.includes(partId)) {
        addOutput([{ type: 'error', text: `${partId} 未安裝` }]);
        return;
      }
      const part = PARTS.find(p => p.id === partId)!;
      setGame(g => ({ ...g, installed: g.installed.filter(id => id !== partId) }));
      addOutput([{ type: 'success', text: `卸載完成: ${part.nameTw}` }]);
    } else if (command === 'inventory') {
      const owned = game.inventory.map(id => PARTS.find(p => p.id === id)!).filter(Boolean);
      if (owned.length === 0) {
        addOutput([{ type: 'output', text: '倉庫是空的。去 shop 逛逛吧！' }]);
      } else {
        addOutput([
          { type: 'output', text: `┌─── 倉庫 (${owned.length} 件) ───` },
          ...owned.map(p => {
            const installed = game.installed.includes(p.id);
            return { type: 'output' as const, text: `│  ${p.id.padEnd(5)} ${p.nameTw.padEnd(14)} T${p.tier}  ${installed ? '✓已裝' : '  未裝'}` };
          }),
          { type: 'output', text: '└────────────────────' },
        ]);
      }
    } else if (command === 'bikes') {
      addOutput([
        { type: 'output', text: '┌─── 車輛展示間 ───' },
        ...BIKES.map((b, i) => {
          const owned = i <= game.currentBike;
          const current = i === game.currentBike;
          const tag = current ? ' ◄ 現在座駕' : owned ? ' [已有]' : '';
          return { type: 'output' as const, text: `│  ${(i + 1).toString().padEnd(3)} ${b.name.padEnd(18)} ${b.cc}cc  $${b.price.toLocaleString().padStart(7)}${tag}` };
        }),
        { type: 'output', text: '│' },
        { type: 'output', text: '│  用法: upgrade 2 (升級到第 2 台)' },
        { type: 'output', text: '└────────────────────' },
      ]);
    } else if (command === 'upgrade') {
      const n = parseInt(parts[1]) - 1;
      if (isNaN(n) || n < 0 || n >= BIKES.length) {
        addOutput([{ type: 'error', text: `用法: upgrade [1-${BIKES.length}]` }]);
        return;
      }
      if (n <= game.currentBike) {
        addOutput([{ type: 'error', text: '你已經有這台或更好的車了' }]);
        return;
      }
      if (n > game.currentBike + 1) {
        addOutput([{ type: 'error', text: '必須按順序升級 (先買下一台)' }]);
        return;
      }
      const newBike = BIKES[n];
      if (game.credits < newBike.price) {
        addOutput([{ type: 'error', text: `資金不足！需要 $${newBike.price.toLocaleString()}` }]);
        return;
      }
      let newState = {
        ...game,
        credits: game.credits - newBike.price,
        currentBike: n,
        installed: [] as string[], // reset installed parts when switching bike
      };
      newState = checkAchievements(newState);
      setGame(newState);
      addOutput([
        { type: 'success', text: `🏍 恭喜入手 ${newBike.name}！` },
        ...newBike.ascii.map(line => ({ type: 'ascii' as const, text: `   ${line}` })),
        { type: 'output', text: `   已安裝的部品已卸載（可重新安裝）` },
      ]);
    } else if (command === 'race') {
      const trackNum = parseInt(parts[1]);

      if (isNaN(trackNum)) {
        // Show race menu
        addOutput([
          { type: 'output', text: '┌─── 賽事選單 ───' },
          ...RACE_TRACKS.map((t, i) => {
            const stars = '★'.repeat(t.difficulty) + '☆'.repeat(5 - t.difficulty);
            const locked = t.difficulty > game.level + 1;
            return { type: 'output' as const, text: `│  ${(i + 1).toString().padEnd(3)} ${t.emoji} ${t.name.padEnd(14)} ${stars}  $${t.reward.toLocaleString()}${locked ? '  🔒 等級不足' : ''}` };
          }),
          { type: 'output', text: '│' },
          { type: 'output', text: `│  你的等級: Lv.${game.level}  戰力: ${stats.power + stats.handling + Math.floor(stats.style / 2)}` },
          { type: 'output', text: '│  用法: race 1' },
          { type: 'output', text: '└────────────────────' },
        ]);
        return;
      }

      const trackIdx = trackNum - 1;
      if (trackIdx < 0 || trackIdx >= RACE_TRACKS.length) {
        addOutput([{ type: 'error', text: `選擇 1-${RACE_TRACKS.length}` }]);
        return;
      }

      const track = RACE_TRACKS[trackIdx];
      if (track.difficulty > game.level + 1) {
        addOutput([{ type: 'error', text: `需要 Lv.${track.difficulty - 1} 才能參加 ${track.name}` }]);
        return;
      }

      if (raceAnimating) {
        addOutput([{ type: 'error', text: '比賽進行中...' }]);
        return;
      }

      setRaceAnimating(true);
      const playerScore = stats.power * (track.statWeight.power || 0) +
        stats.handling * (track.statWeight.handling || 0) +
        stats.style * (track.statWeight.style || 0) +
        (Math.random() * 30 - 15); // luck factor

      const opponentBase = 20 + track.difficulty * 25 + Math.random() * 20;

      addOutput([
        { type: 'race', text: `🏁 ${track.emoji} ${track.name} — ${track.desc}` },
        { type: 'race', text: '   3...' },
      ]);

      setTimeout(() => {
        addOutput([{ type: 'race', text: '   2...' }]);
      }, 600);

      setTimeout(() => {
        addOutput([{ type: 'race', text: '   1...' }]);
      }, 1200);

      setTimeout(() => {
        addOutput([{ type: 'race', text: '   GO! 🏍💨' }]);
      }, 1800);

      setTimeout(() => {
        const raceChars = '─═─═─═─═─═─═─═─═─═─═─═─═─═─═─═─═';
        const progress = isMobile ? raceChars.slice(0, 20) : raceChars;
        addOutput([
          { type: 'race', text: `   You: ${progress}🏍 ${playerScore.toFixed(0)}pts` },
          { type: 'race', text: `   CPU: ${progress}🛵 ${opponentBase.toFixed(0)}pts` },
        ]);
      }, 2400);

      setTimeout(() => {
        const won = playerScore > opponentBase;
        const xpGain = won ? track.difficulty * 30 : track.difficulty * 10;
        const creditsGain = won ? track.reward : Math.floor(track.reward * 0.2);
        const odoGain = 20 + track.difficulty * 15;

        let newState = {
          ...game,
          credits: game.credits + creditsGain,
          xp: game.xp + xpGain,
          raceWins: won ? game.raceWins + 1 : game.raceWins,
          raceLosses: won ? game.raceLosses : game.raceLosses + 1,
          totalRaces: game.totalRaces + 1,
          odometer: game.odometer + odoGain,
        };

        // Level up check
        while (newState.xp >= xpForLevel(newState.level)) {
          newState.xp -= xpForLevel(newState.level);
          newState.level += 1;
          addOutput([{ type: 'achievement', text: `⬆️ 升級! 你現在是 Lv.${newState.level}` }]);
        }

        newState = checkAchievements(newState);
        setGame(newState);

        if (won) {
          addOutput([
            { type: 'success', text: `🏆 勝利！你贏得了 ${track.name}！` },
            { type: 'output', text: `   獎金: +$${creditsGain.toLocaleString()}  經驗: +${xpGain}XP  里程: +${odoGain}km` },
          ]);
        } else {
          addOutput([
            { type: 'error', text: `💥 落敗... ${track.name} 下次再來！` },
            { type: 'output', text: `   安慰獎: +$${creditsGain.toLocaleString()}  經驗: +${xpGain}XP  里程: +${odoGain}km` },
          ]);
        }
        setRaceAnimating(false);
      }, 3200);
    } else if (command === 'garage') {
      const totalValue = game.inventory.reduce((s, id) => s + (PARTS.find(p => p.id === id)?.price || 0), 0) + BIKES[game.currentBike].price;
      addOutput([
        { type: 'output', text: '┌─── 車庫資訊 ───' },
        { type: 'output', text: `│  🏍 座駕: ${bike.name} (${bike.cc}cc)` },
        { type: 'output', text: `│  💰 資金: $${game.credits.toLocaleString()}` },
        { type: 'output', text: `│  💎 總資產: $${(game.credits + totalValue).toLocaleString()}` },
        { type: 'output', text: `│  ⭐ 等級: Lv.${game.level} (${game.xp}/${xpForLevel(game.level)} XP)` },
        { type: 'output', text: `│  🏁 戰績: ${game.raceWins}W / ${game.raceLosses}L (${game.totalRaces} 場)` },
        { type: 'output', text: `│  📏 里程: ${game.odometer.toLocaleString()} km` },
        { type: 'output', text: `│  🔧 部品: ${game.inventory.length} 件 (${game.installed.length} 已裝)` },
        { type: 'output', text: `│  🏆 成就: ${game.achievements.length}/${ACHIEVEMENTS.length}` },
        { type: 'output', text: '└────────────────────' },
      ]);
    } else if (command === 'achievements') {
      addOutput([
        { type: 'output', text: `┌─── 成就 (${game.achievements.length}/${ACHIEVEMENTS.length}) ───` },
        ...ACHIEVEMENTS.map(a => {
          const unlocked = game.achievements.includes(a.id);
          return { type: 'output' as const, text: `│  ${unlocked ? '🏆' : '🔒'} ${a.name.padEnd(12)} ${a.desc}` };
        }),
        { type: 'output', text: '└────────────────────' },
      ]);
    } else if (command === 'ride') {
      const odoGain = 10 + Math.floor(Math.random() * 30);
      const events = [
        `兜了一圈市區，里程 +${odoGain}km`,
        `跑了一趟山路，引擎嘶吼著 🏔️ +${odoGain}km`,
        `去便利商店買了杯咖啡 ☕ +${odoGain}km`,
        `在河濱公園繞了幾圈 🌊 +${odoGain}km`,
        `和路上的騎士點了個頭 🤝 +${odoGain}km`,
        `在紅燈被旁邊的車友搭訕了 😎 +${odoGain}km`,
        `不小心壓到水坑濺了一身 💦 +${odoGain}km`,
        `深夜跑山，星空超美 ⭐ +${odoGain}km`,
      ];
      const event = events[Math.floor(Math.random() * events.length)];
      const xpGain = 5;
      let newState = { ...game, odometer: game.odometer + odoGain, xp: game.xp + xpGain };
      while (newState.xp >= xpForLevel(newState.level)) {
        newState.xp -= xpForLevel(newState.level);
        newState.level += 1;
        addOutput([{ type: 'achievement', text: `⬆️ 升級! Lv.${newState.level}` }]);
      }
      newState = checkAchievements(newState);
      setGame(newState);
      addOutput([{ type: 'success', text: `🛣️ ${event}` }]);
    } else {
      addOutput([{ type: 'error', text: `command not found: ${trimmed}。輸入 help 查看指令。` }]);
    }

    setCmd('');
  }, [game, addOutput, checkAchievements, isMobile, bike, stats, raceAnimating]);

  const lineColor = (type: string): string => {
    switch (type) {
      case 'cmd': return '#928374';
      case 'ascii': return '#b8f53e';
      case 'success': return '#b8bb26';
      case 'error': return '#fb4934';
      case 'achievement': return '#fabd2f';
      case 'race': return '#83a598';
      default: return '#ebdbb2';
    }
  };

  return (
    <div style={{
      backgroundColor: '#1d2021', color: '#ebdbb2',
      fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh',
      padding: isMobile ? '16px 10px' : '30px 24px',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #3c3836', paddingBottom: '16px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>game --moto-garage</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
              MOTO GARAGE
              <span style={{ color: '#928374', fontSize: '12px', fontWeight: 400, marginLeft: '12px' }}>機車改裝模擬器</span>
            </h1>
            <Link href="/data" style={{ color: '#928374', fontSize: '11px', textDecoration: 'none' }}>
              ← 返回 DATA CENTER
            </Link>
          </div>
          {/* Status bar */}
          <div style={{
            display: 'flex', gap: isMobile ? '8px' : '16px', marginTop: '12px',
            fontSize: isMobile ? '10px' : '11px', color: '#928374', flexWrap: 'wrap',
          }}>
            <span>🏍 {bike.name}</span>
            <span>💰 ${game.credits.toLocaleString()}</span>
            <span>⭐ Lv.{game.level}</span>
            <span>🏁 {game.raceWins}W/{game.raceLosses}L</span>
            <span>📏 {game.odometer}km</span>
            <span>🏆 {game.achievements.length}/{ACHIEVEMENTS.length}</span>
          </div>
        </div>

        {/* Terminal output */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          style={{
            backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px',
            padding: isMobile ? '12px' : '20px',
            height: isMobile ? '55vh' : '60vh',
            overflowY: 'auto', cursor: 'text',
            fontSize: isMobile ? '10px' : '12px',
            lineHeight: '1.7',
            /* CRT scanlines */
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        >
          {history.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre-wrap', color: lineColor(line.type) }}>
              {line.type === 'cmd' ? (
                <><span style={{ color: '#928374' }}>garage@{bike.name.split(' ')[0].toLowerCase()}:~$ </span><span style={{ color: '#b8f53e' }}>{line.text}</span></>
              ) : (
                line.text
              )}
            </div>
          ))}

          {/* Input line */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ color: '#928374', whiteSpace: 'nowrap', fontSize: isMobile ? '9px' : '12px' }}>
              garage@{bike.name.split(' ')[0].toLowerCase()}:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={cmd}
              onChange={e => setCmd(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') execute(cmd); }}
              style={{
                flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
                color: '#b8f53e', fontFamily: "'JetBrains Mono', monospace",
                fontSize: isMobile ? '10px' : '12px',
                padding: '0 0 0 6px', caretColor: '#b8f53e',
              }}
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>

        {/* Quick action buttons (mobile-friendly) */}
        <div style={{
          display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap',
        }}>
          {['status', 'shop', 'inventory', 'race', 'ride', 'garage', 'help'].map(c => (
            <button
              key={c}
              onClick={() => { setCmd(c); execute(c); }}
              style={{
                backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '3px',
                padding: isMobile ? '6px 10px' : '6px 14px',
                color: '#b8f53e', fontFamily: "'JetBrains Mono', monospace",
                fontSize: isMobile ? '10px' : '11px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', color: '#504945', fontSize: '10px', textAlign: 'center' }}>
          MOTO GARAGE v1.0 · 遊戲進度自動儲存 · <Link href="/data" style={{ color: '#504945' }}>返回數據中心</Link>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
