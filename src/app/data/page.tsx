'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

function bar(value: number, max: number, width: number = 20): string {
  if (max === 0) return '░'.repeat(width);
  const filled = Math.max(value > 0 ? 1 : 0, Math.round((value / max) * width));
  return '█'.repeat(Math.min(width, filled)) + '░'.repeat(Math.max(0, width - filled));
}

function sparkline(values: number[]): string {
  if (values.length === 0) return '';
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map(v => chars[Math.min(7, Math.floor(((v - min) / range) * 7))]).join('');
}

interface VmsRow {
  year_month: string;
  brand: string;
  model_code: string;
  display_name: string | null;
  total_sales: number;
  displacement: string | null;
  displacement_cc: number | null;
}

interface BrandMonthly {
  year_month: string;
  brand: string;
  total: number;
  market_share: number;
}

const CC_SEGMENTS = [
  { id: 'all', label: '全部' },
  { id: 'ev', label: '電動', match: (d: string | null) => d === '電動機車' },
  { id: '50', label: '≤50cc', match: (d: string | null) => d === '50cc以下' },
  { id: '125', label: '51-125', match: (d: string | null) => d === '50-125cc' },
  { id: '250', label: '126-250', match: (d: string | null) => d === '126-250cc' },
  { id: '550', label: '251-550', match: (d: string | null) => d === '251-550cc' },
  { id: '551', label: '551cc+', match: (d: string | null) => d === '551cc以上' },
];

function fmtMonth(m: string): string {
  const [y, mm] = m.split('-');
  return `${y}年${parseInt(mm)}月`;
}

function fmtShortMonth(m: string): string {
  const [, mm] = m.split('-');
  return `${parseInt(mm)}月`;
}

// Animated counter hook
function useAnimatedNumber(target: number, duration: number = 800): number {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (start === target) { setCurrent(target); return; }
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return current;
}

// Blinking cursor component
const Cursor = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setVisible(v => !v), 530);
    return () => clearInterval(iv);
  }, []);
  return <span style={{ color: '#b8f53e', opacity: visible ? 1 : 0 }}>█</span>;
};

// Typing text animation
const TypeWriter = ({ text, speed = 40 }: { text: string; speed?: number }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(iv);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <>{displayed}<Cursor /></>;
};

const DataPage: React.FC = () => {
  const [allData, setAllData] = useState<VmsRow[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCC, setSelectedCC] = useState('all');
  const [searchModel, setSearchModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [rangePreset, setRangePreset] = useState('1');
  const [brandMonthlyData, setBrandMonthlyData] = useState<BrandMonthly[]>([]);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  // Fetch months list + brand monthly data for sidebar
  useEffect(() => {
    const fetchInit = async () => {
      const supabase = createClient();
      const [monthsRes, brandRes] = await Promise.all([
        supabase.from('sales_brand_monthly').select('year_month').order('year_month', { ascending: false }),
        supabase.from('sales_brand_monthly').select('*').order('year_month', { ascending: false }).limit(5000),
      ]);
      if (monthsRes.data) {
        const unique = [...new Set(monthsRes.data.map(d => d.year_month))];
        setMonths(unique);
        if (unique.length > 0) {
          setEndMonth(unique[0]);
          setStartMonth(unique[0]);
        }
      }
      if (brandRes.data) setBrandMonthlyData(brandRes.data);
    };
    fetchInit();
  }, []);

  // System log animation
  useEffect(() => {
    if (months.length === 0) return;
    const lines = [
      `[SYS] connecting to hymmoto.tw database...`,
      `[SYS] connection established ✓`,
      `[DATA] loading ${months.length} months of data...`,
      `[DATA] vehicle_monthly_sales: online`,
      `[DATA] sales_brand_monthly: online`,
      `[SCAN] scanning market trends...`,
      `[OK] data pipeline ready`,
    ];
    setLogLines([]);
    let i = 0;
    const iv = setInterval(() => {
      if (i < lines.length) {
        setLogLines(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(iv);
      }
    }, 600);
    return () => clearInterval(iv);
  }, [months.length]);

  // Cycling market facts in log
  useEffect(() => {
    if (!brandMonthlyData.length || !endMonth) return;
    const timer = setInterval(() => {
      setLogIndex(prev => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [brandMonthlyData, endMonth]);

  const applyPreset = useCallback((preset: string) => {
    if (months.length === 0) return;
    setRangePreset(preset);
    const latest = months[0];
    setEndMonth(latest);
    if (preset === '1') setStartMonth(latest);
    else if (preset === '3') setStartMonth(months[Math.min(2, months.length - 1)]);
    else if (preset === '6') setStartMonth(months[Math.min(5, months.length - 1)]);
    else if (preset === '12') setStartMonth(months[Math.min(11, months.length - 1)]);
    else if (preset === 'all') setStartMonth(months[months.length - 1]);
  }, [months]);

  // Fetch data for selected range
  useEffect(() => {
    if (!startMonth || !endMonth) return;
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const from = startMonth <= endMonth ? startMonth : endMonth;
      const to = startMonth <= endMonth ? endMonth : startMonth;
      const { data } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month, brand, model_code, display_name, total_sales, displacement, displacement_cc')
        .gte('year_month', from)
        .lte('year_month', to)
        .gt('total_sales', 0)
        .order('total_sales', { ascending: false })
        .limit(10000);
      setAllData(data || []);
      setLoading(false);
    };
    fetchData();
  }, [startMonth, endMonth]);

  const isRange = startMonth !== endMonth && startMonth && endMonth;

  const aggregatedData = useMemo(() => {
    if (!isRange) return allData;
    const map = new Map<string, VmsRow>();
    allData.forEach(r => {
      const key = `${r.brand}|${r.model_code}`;
      const existing = map.get(key);
      if (existing) existing.total_sales += r.total_sales;
      else map.set(key, { ...r });
    });
    return [...map.values()].sort((a, b) => b.total_sales - a.total_sales);
  }, [allData, isRange]);

  const brands = useMemo(() => {
    const map = new Map<string, number>();
    aggregatedData.forEach(r => map.set(r.brand, (map.get(r.brand) || 0) + r.total_sales));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  }, [aggregatedData]);

  const filtered = useMemo(() => {
    let d = aggregatedData;
    if (selectedBrand !== 'all') d = d.filter(r => r.brand === selectedBrand);
    if (selectedCC !== 'all') {
      const seg = CC_SEGMENTS.find(s => s.id === selectedCC);
      if (seg?.match) d = d.filter(r => seg.match!(r.displacement));
    }
    if (searchModel.trim()) {
      const q = searchModel.trim().toLowerCase();
      d = d.filter(r => (r.display_name || '').toLowerCase().includes(q) || r.model_code.toLowerCase().includes(q));
    }
    return d;
  }, [aggregatedData, selectedBrand, selectedCC, searchModel]);

  const totalSales = filtered.reduce((s, r) => s + r.total_sales, 0);
  const brandCount = new Set(filtered.map(r => r.brand)).size;
  const modelCount = filtered.length;
  const maxSales = filtered[0]?.total_sales || 1;
  const animatedTotal = useAnimatedNumber(totalSales);

  const rangeMonthCount = useMemo(() => {
    if (!startMonth || !endMonth) return 0;
    const from = startMonth <= endMonth ? startMonth : endMonth;
    const to = startMonth <= endMonth ? endMonth : startMonth;
    return months.filter(m => m >= from && m <= to).length;
  }, [months, startMonth, endMonth]);

  const brandSummary = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(r => map.set(r.brand, (map.get(r.brand) || 0) + r.total_sales));
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const total = arr.reduce((s, [, v]) => s + v, 0);
    return arr.map(([name, sales]) => ({
      name, sales,
      share: total > 0 ? Math.round((sales / total) * 1000) / 10 : 0,
    }));
  }, [filtered]);

  const maxShare = brandSummary[0]?.share || 1;

  const ccSummary = useMemo(() => {
    return CC_SEGMENTS.filter(s => s.id !== 'all').map(seg => {
      const rows = filtered.filter(r => seg.match!(r.displacement));
      const total = rows.reduce((s, r) => s + r.total_sales, 0);
      const top = rows[0];
      return {
        label: seg.label, total,
        leader: top ? `${top.brand} ${top.display_name || top.model_code}` : '-',
        leaderSales: top?.total_sales || 0,
      };
    }).filter(s => s.total > 0);
  }, [filtered]);

  const monthlyTrend = useMemo(() => {
    if (!isRange) return [];
    const from = startMonth <= endMonth ? startMonth : endMonth;
    const to = startMonth <= endMonth ? endMonth : startMonth;
    const rangeMonths = months.filter(m => m >= from && m <= to).reverse();
    const map = new Map<string, number>();
    let d = allData;
    if (selectedBrand !== 'all') d = d.filter(r => r.brand === selectedBrand);
    if (selectedCC !== 'all') {
      const seg = CC_SEGMENTS.find(s => s.id === selectedCC);
      if (seg?.match) d = d.filter(r => seg.match!(r.displacement));
    }
    d.forEach(r => map.set(r.year_month, (map.get(r.year_month) || 0) + r.total_sales));
    return rangeMonths.map(m => ({ month: m, sales: map.get(m) || 0 }));
  }, [allData, months, startMonth, endMonth, isRange, selectedBrand, selectedCC]);

  const maxTrend = Math.max(...monthlyTrend.map(t => t.sales), 1);

  // ═══ Sidebar computed data ═══

  // MoM: compare endMonth with previous month
  const momData = useMemo(() => {
    if (!endMonth || months.length < 2) return null;
    const curIdx = months.indexOf(endMonth);
    if (curIdx < 0 || curIdx >= months.length - 1) return null;
    const prevMonth = months[curIdx + 1];
    const curTotal = brandMonthlyData.filter(d => d.year_month === endMonth).reduce((s, d) => s + d.total, 0);
    const prevTotal = brandMonthlyData.filter(d => d.year_month === prevMonth).reduce((s, d) => s + d.total, 0);
    if (prevTotal === 0) return null;
    const change = ((curTotal - prevTotal) / prevTotal * 100);
    return { curTotal, prevTotal, prevMonth, change };
  }, [endMonth, months, brandMonthlyData]);

  // YoY: compare endMonth with same month last year
  const yoyData = useMemo(() => {
    if (!endMonth) return null;
    const [y, m] = endMonth.split('-');
    const lastYear = `${parseInt(y) - 1}-${m}`;
    const curTotal = brandMonthlyData.filter(d => d.year_month === endMonth).reduce((s, d) => s + d.total, 0);
    const prevTotal = brandMonthlyData.filter(d => d.year_month === lastYear).reduce((s, d) => s + d.total, 0);
    if (prevTotal === 0) return null;
    const change = ((curTotal - prevTotal) / prevTotal * 100);
    return { curTotal, prevTotal, prevYear: lastYear, change };
  }, [endMonth, brandMonthlyData]);

  // Recent 6 months sparkline data
  const recentSparkData = useMemo(() => {
    const recent = months.slice(0, Math.min(12, months.length)).reverse();
    return recent.map(m => ({
      month: m,
      total: brandMonthlyData.filter(d => d.year_month === m).reduce((s, d) => s + d.total, 0),
    }));
  }, [months, brandMonthlyData]);

  // Brand movers: biggest share changes MoM
  const brandMovers = useMemo(() => {
    if (!endMonth || months.length < 2) return [];
    const curIdx = months.indexOf(endMonth);
    if (curIdx < 0 || curIdx >= months.length - 1) return [];
    const prevMonth = months[curIdx + 1];
    const curMap = new Map<string, number>();
    const prevMap = new Map<string, number>();
    brandMonthlyData.filter(d => d.year_month === endMonth).forEach(d => curMap.set(d.brand, d.total));
    brandMonthlyData.filter(d => d.year_month === prevMonth).forEach(d => prevMap.set(d.brand, d.total));
    const allBrands = new Set([...curMap.keys(), ...prevMap.keys()]);
    const changes: { brand: string; cur: number; prev: number; change: number }[] = [];
    allBrands.forEach(b => {
      const cur = curMap.get(b) || 0;
      const prev = prevMap.get(b) || 0;
      if (prev > 50 || cur > 50) {
        changes.push({ brand: b, cur, prev, change: prev > 0 ? ((cur - prev) / prev * 100) : 999 });
      }
    });
    changes.sort((a, b) => b.change - a.change);
    return changes;
  }, [endMonth, months, brandMonthlyData]);

  // Brand sparklines for top 3
  const brandSparklines = useMemo(() => {
    const topBrands = ['SYM', 'KYMCO', 'YAMAHA'];
    const recent = months.slice(0, Math.min(12, months.length)).reverse();
    return topBrands.map(brand => {
      const values = recent.map(m => {
        const row = brandMonthlyData.find(d => d.year_month === m && d.brand === brand);
        return row?.total || 0;
      });
      return { brand, values, spark: sparkline(values) };
    });
  }, [months, brandMonthlyData]);

  // Cycling status messages
  const statusMessages = useMemo(() => {
    if (!brandMonthlyData.length || !endMonth) return [];
    const msgs: string[] = [];
    if (momData) msgs.push(`MoM: ${momData.change >= 0 ? '+' : ''}${momData.change.toFixed(1)}%`);
    if (yoyData) msgs.push(`YoY: ${yoyData.change >= 0 ? '+' : ''}${yoyData.change.toFixed(1)}%`);
    if (brandMovers.length > 0) {
      const top = brandMovers[0];
      msgs.push(`${top.brand} 漲幅最大 +${top.change.toFixed(0)}%`);
    }
    if (brandMovers.length > 1) {
      const bot = brandMovers[brandMovers.length - 1];
      if (bot.change < 0) msgs.push(`${bot.brand} 跌幅最大 ${bot.change.toFixed(0)}%`);
    }
    msgs.push(`共 ${months.length} 個月數據`);
    return msgs;
  }, [brandMonthlyData, endMonth, momData, yoyData, brandMovers, months.length]);

  const currentStatus = statusMessages.length > 0 ? statusMessages[logIndex % statusMessages.length] : '';

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#282828', color: '#b8f53e', border: '1px solid #3c3836',
    borderRadius: '4px', padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px', outline: 'none', cursor: 'pointer', minWidth: '120px',
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? '#b8f53e' : '#282828',
    color: active ? '#1d2021' : '#928374',
    border: `1px solid ${active ? '#b8f53e' : '#3c3836'}`,
    borderRadius: '4px', padding: '6px 14px', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px', cursor: 'pointer', fontWeight: active ? 700 : 400,
    transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  });

  const sideCardStyle: React.CSSProperties = {
    backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px',
    padding: '14px', marginBottom: '12px',
  };

  const rangeLabel = isRange
    ? `${fmtMonth(startMonth <= endMonth ? startMonth : endMonth)} ~ ${fmtMonth(startMonth <= endMonth ? endMonth : startMonth)}`
    : fmtMonth(endMonth || startMonth);

  if (!endMonth) {
    return (
      <div style={{
        backgroundColor: '#1d2021', color: '#b8f53e', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
      }}><TypeWriter text="Connecting to hymmoto.tw database..." speed={30} /></div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1d2021', color: '#ebdbb2',
      fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh', padding: '30px 24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '24px' }}>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #3c3836', paddingBottom: '20px' }}>
            <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
              guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>data --dashboard</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
              DATA CENTER
            </h1>
            <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
              台灣機車市場即時數據分析平台 · {rangeLabel}
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ color: '#928374', fontSize: '11px', marginBottom: '12px', letterSpacing: '1px' }}>
              $ <span style={{ color: '#b8f53e' }}>filter --interactive</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
              <span style={{ color: '#928374', fontSize: '11px' }}>區間</span>
              {[{ id: '1', label: '單月' }, { id: '3', label: '近3月' }, { id: '6', label: '近6月' }, { id: '12', label: '近12月' }, { id: 'all', label: '全部' }].map(p => (
                <button key={p.id} onClick={() => applyPreset(p.id)} style={pillStyle(rangePreset === p.id)}>{p.label}</button>
              ))}
              <div style={{ width: '1px', height: '20px', backgroundColor: '#3c3836', margin: '0 4px' }} />
              <select value={startMonth} onChange={e => { setStartMonth(e.target.value); setRangePreset('custom'); }} style={{ ...selectStyle, minWidth: '100px' }}>
                {months.map(m => <option key={m} value={m}>{fmtMonth(m)}</option>)}
              </select>
              <span style={{ color: '#928374', fontSize: '12px' }}>~</span>
              <select value={endMonth} onChange={e => { setEndMonth(e.target.value); setRangePreset('custom'); }} style={{ ...selectStyle, minWidth: '100px' }}>
                {months.map(m => <option key={m} value={m}>{fmtMonth(m)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#928374', fontSize: '11px' }}>品牌</span>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={selectStyle}>
                  <option value="all">全部品牌</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                <span style={{ color: '#928374', fontSize: '11px' }}>車型</span>
                <input type="text" value={searchModel} onChange={e => setSearchModel(e.target.value)} placeholder="搜尋車型名稱或代碼..."
                  style={{ ...selectStyle, flex: 1, color: '#ebdbb2' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#928374', fontSize: '11px', marginRight: '4px' }}>CC</span>
              {CC_SEGMENTS.map(seg => (
                <button key={seg.id} onClick={() => setSelectedCC(seg.id)} style={pillStyle(selectedCC === seg.id)}>{seg.label}</button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'TOTAL SALES', value: animatedTotal.toLocaleString(), sym: '>>' },
              { label: 'BRANDS', value: `${brandCount}`, sym: '>_' },
              { label: 'MODELS', value: `${modelCount}`, sym: '::' },
              { label: 'PERIOD', value: isRange ? `${rangeMonthCount}個月` : fmtMonth(endMonth), sym: '$>' },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: '#282828', border: '1px solid #3c3836', padding: '16px', borderRadius: '4px' }}>
                <div style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{s.sym}</div>
                <div style={{ color: '#ebdbb2', fontSize: '20px', fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: '#928374', fontSize: '10px', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Monthly Trend (range mode) */}
          {isRange && monthlyTrend.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
                $ <span style={{ color: '#b8f53e' }}>trend --monthly{selectedBrand !== 'all' ? ` --brand=${selectedBrand}` : ''}{selectedCC !== 'all' ? ` --cc=${selectedCC}` : ''}</span>
              </div>
              <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px' }}>
                <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
                  MONTHLY TREND · {rangeLabel}
                </div>
                <div style={{ fontSize: '12px', whiteSpace: 'pre', lineHeight: '2', fontFamily: "'JetBrains Mono', monospace" }}>
                  {monthlyTrend.map((t, i) => (
                    <div key={i}>{`  ${fmtMonth(t.month).padEnd(10)} ${bar(t.sales, maxTrend, 28)} ${t.sales.toLocaleString().padStart(7)}`}</div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Brand Market Share */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
              $ <span style={{ color: '#b8f53e' }}>brand --market-share{selectedBrand !== 'all' ? ` --brand=${selectedBrand}` : ''}{selectedCC !== 'all' ? ` --cc=${selectedCC}` : ''}</span>
            </div>
            <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px' }}>
              <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
                BRAND MARKET SHARE · {rangeLabel}
              </div>
              <div style={{ fontSize: '13px', whiteSpace: 'pre', lineHeight: '1.8', fontFamily: "'JetBrains Mono', monospace" }}>
                {brandSummary.length === 0 && <div style={{ color: '#928374' }}>  No data found.</div>}
                {brandSummary.slice(0, 15).map((b, i) => (
                  <div key={i}>{`  ${b.name.padEnd(18)} ${bar(b.share, maxShare, 20)} ${`${b.share}%`.padStart(6)}  (${b.sales.toLocaleString().padStart(6)})`}</div>
                ))}
                {brandSummary.length > 15 && (
                  <div style={{ color: '#928374' }}>{`  ... +${brandSummary.length - 15} more brands`}</div>
                )}
              </div>
            </div>
          </section>

          {/* Top Models Table */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
              $ <span style={{ color: '#b8f53e' }}>top --models{searchModel ? ` --search="${searchModel}"` : ''}</span>
            </div>
            <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px', overflowX: 'auto' }}>
              <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
                VEHICLE SALES RANKING · {rangeLabel}
                <span style={{ color: '#928374', fontWeight: 400, fontSize: '11px', marginLeft: '12px' }}>
                  {filtered.length} models{isRange ? ` · ${rangeMonthCount}個月累計` : ''}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ display: 'flex', color: '#928374', borderBottom: '1px solid #3c3836', paddingBottom: '8px', marginBottom: '4px' }}>
                  <span style={{ width: '40px', textAlign: 'right' }}>#</span>
                  <span style={{ width: '12px' }}></span>
                  <span style={{ width: '100px' }}>BRAND</span>
                  <span style={{ flex: 1, minWidth: '160px' }}>MODEL</span>
                  <span style={{ width: '70px', textAlign: 'right' }}>SALES</span>
                  <span style={{ width: '12px' }}></span>
                  <span style={{ width: '80px' }}>CC</span>
                  <span style={{ width: '12px' }}></span>
                  <span style={{ width: '120px' }}>BAR</span>
                </div>
                {loading ? (
                  <div style={{ color: '#928374', padding: '16px 0' }}>  Loading...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ color: '#928374', padding: '16px 0' }}>  No matching models.</div>
                ) : (
                  filtered.slice(0, 30).map((r, i) => (
                    <div key={`${r.brand}-${r.model_code}`} style={{ display: 'flex', lineHeight: '2', color: i < 3 ? '#fabd2f' : '#ebdbb2' }}>
                      <span style={{ width: '40px', textAlign: 'right', color: '#928374' }}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                      </span>
                      <span style={{ width: '12px' }}></span>
                      <span style={{ width: '100px', color: '#b8f53e' }}>{r.brand}</span>
                      <span style={{ flex: 1, minWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.display_name || r.model_code}
                      </span>
                      <span style={{ width: '70px', textAlign: 'right', color: '#fabd2f', fontWeight: 700 }}>
                        {r.total_sales.toLocaleString()}
                      </span>
                      <span style={{ width: '12px' }}></span>
                      <span style={{ width: '80px', color: '#928374', fontSize: '11px' }}>
                        {r.displacement_cc ? `${r.displacement_cc}cc` : r.displacement === '電動機車' ? 'EV' : '-'}
                      </span>
                      <span style={{ width: '12px' }}></span>
                      <span style={{ width: '120px', whiteSpace: 'pre', fontSize: '11px' }}>{bar(r.total_sales, maxSales, 14)}</span>
                    </div>
                  ))
                )}
                {filtered.length > 30 && (
                  <div style={{ color: '#928374', padding: '8px 0 0', borderTop: '1px solid #3c3836', marginTop: '4px' }}>
                    {`  ... 顯示前 30 筆，共 ${filtered.length} 筆`}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CC Tier Overview */}
          {ccSummary.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
                $ <span style={{ color: '#b8f53e' }}>data --cc-tiers</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {ccSummary.map((tier, i) => (
                  <div key={i} style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '14px' }}>{tier.label}</span>
                      <span style={{ color: '#928374', fontSize: '12px' }}>{tier.total.toLocaleString()} 台</span>
                    </div>
                    <div style={{ color: '#ebdbb2', fontSize: '12px', marginBottom: '8px' }}>
                      #1 {tier.leader}
                      <span style={{ color: '#fabd2f', marginLeft: '8px' }}>{tier.leaderSales.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '12px', whiteSpace: 'pre', color: '#b8f53e' }}>
                      {bar(tier.leaderSales, tier.total, 24)}{' '}
                      <span style={{ color: '#928374' }}>{tier.total > 0 ? Math.round((tier.leaderSales / tier.total) * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick Navigation */}
          <section style={{ marginBottom: '40px' }}>
            <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
              $ <span style={{ color: '#b8f53e' }}>ls ./data/</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { href: '/rankings/sales', sym: '>_', label: 'sales/', desc: '銷售排行' },
                { href: '/rankings/brands', sym: '/^', label: 'brands/', desc: '品牌分析' },
                { href: '/rankings/segments', sym: '##', label: 'segments/', desc: '級距分析' },
                { href: '/data/brands', sym: '::', label: 'brand-data/', desc: '品牌資料' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{
                  backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px',
                  padding: '14px 20px', textDecoration: 'none', color: '#ebdbb2',
                  transition: 'all 0.15s', flex: '1', minWidth: '180px',
                }}>
                  <div style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{link.sym} {link.label}</div>
                  <div style={{ color: '#928374', fontSize: '11px', fontFamily: "'Noto Sans TC', sans-serif" }}>{link.desc}</div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '30px' }}>

            {/* System Log */}
            <div style={{ ...sideCardStyle, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ color: '#fabd2f', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                SYSTEM LOG
              </div>
              <div style={{ fontSize: '10px', lineHeight: '1.8', maxHeight: '120px', overflow: 'hidden' }}>
                {logLines.map((line, i) => (
                  <div key={i} style={{ color: line.includes('✓') || line.includes('OK') ? '#b8f53e' : line.includes('SYS') ? '#928374' : '#83a598' }}>
                    {line}
                  </div>
                ))}
                {logLines.length >= 7 && (
                  <div style={{ color: '#fabd2f' }}>
                    [LIVE] <TypeWriter text={currentStatus} speed={35} />
                  </div>
                )}
              </div>
            </div>

            {/* MoM Change */}
            {momData && (
              <div style={sideCardStyle}>
                <div style={{ color: '#fabd2f', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                  MoM CHANGE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    color: momData.change >= 0 ? '#b8bb26' : '#fb4934',
                    fontSize: '22px', fontWeight: 700,
                  }}>
                    {momData.change >= 0 ? '+' : ''}{momData.change.toFixed(1)}%
                  </span>
                  <span style={{ color: '#928374', fontSize: '10px' }}>vs {fmtMonth(momData.prevMonth)}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#928374', lineHeight: '1.6' }}>
                  {fmtMonth(endMonth)}: {momData.curTotal.toLocaleString()}<br />
                  {fmtMonth(momData.prevMonth)}: {momData.prevTotal.toLocaleString()}
                </div>
              </div>
            )}

            {/* YoY Change */}
            {yoyData && (
              <div style={sideCardStyle}>
                <div style={{ color: '#fabd2f', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                  YoY CHANGE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    color: yoyData.change >= 0 ? '#b8bb26' : '#fb4934',
                    fontSize: '22px', fontWeight: 700,
                  }}>
                    {yoyData.change >= 0 ? '+' : ''}{yoyData.change.toFixed(1)}%
                  </span>
                  <span style={{ color: '#928374', fontSize: '10px' }}>vs {fmtMonth(yoyData.prevYear)}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#928374', lineHeight: '1.6' }}>
                  {fmtMonth(endMonth)}: {yoyData.curTotal.toLocaleString()}<br />
                  {fmtMonth(yoyData.prevYear)}: {yoyData.prevTotal.toLocaleString()}
                </div>
              </div>
            )}

            {/* Market Pulse Sparkline */}
            {recentSparkData.length > 0 && (
              <div style={sideCardStyle}>
                <div style={{ color: '#fabd2f', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                  MARKET PULSE
                </div>
                <div style={{ fontSize: '16px', letterSpacing: '2px', color: '#b8f53e', marginBottom: '8px' }}>
                  {sparkline(recentSparkData.map(d => d.total))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#928374' }}>
                  <span>{fmtShortMonth(recentSparkData[0]?.month || '')}</span>
                  <span>{fmtShortMonth(recentSparkData[recentSparkData.length - 1]?.month || '')}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#928374', marginTop: '8px' }}>
                  高: {Math.max(...recentSparkData.map(d => d.total)).toLocaleString()} ·
                  低: {Math.min(...recentSparkData.map(d => d.total)).toLocaleString()}
                </div>
              </div>
            )}

            {/* Brand Sparklines */}
            <div style={sideCardStyle}>
              <div style={{ color: '#fabd2f', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                BRAND TRENDS
              </div>
              {brandSparklines.map((bs, i) => (
                <div key={i} style={{ marginBottom: i < brandSparklines.length - 1 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: '#b8f53e', fontSize: '11px', fontWeight: 700 }}>{bs.brand}</span>
                    <span style={{ color: '#928374', fontSize: '10px' }}>
                      {bs.values.length > 0 ? bs.values[bs.values.length - 1].toLocaleString() : '-'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', letterSpacing: '1px', color: ['#fb4934', '#fabd2f', '#83a598'][i] }}>
                    {bs.spark}
                  </div>
                </div>
              ))}
            </div>

            {/* Top Movers */}
            {brandMovers.length > 0 && (
              <div style={sideCardStyle}>
                <div style={{ color: '#fabd2f', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                  TOP MOVERS (MoM)
                </div>
                <div style={{ fontSize: '11px', lineHeight: '2' }}>
                  {brandMovers.slice(0, 3).map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#ebdbb2' }}>{m.brand}</span>
                      <span style={{ color: '#b8bb26', fontWeight: 700 }}>
                        +{m.change > 999 ? 'NEW' : `${m.change.toFixed(0)}%`}
                      </span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #3c3836', marginTop: '4px', paddingTop: '4px' }}>
                    {brandMovers.filter(m => m.change < 0).slice(-3).reverse().map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ebdbb2' }}>{m.brand}</span>
                        <span style={{ color: '#fb4934', fontWeight: 700 }}>{m.change.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DataPage;
