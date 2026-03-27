'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';

const C = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598', dim: '#504945',
};
const FONT = "'JetBrains Mono', monospace";
const FONT_CN = "'Noto Sans TC', sans-serif";

const SEGMENTS = [
  { id: 'ev', label: '電動', min: -1, max: 0, color: '#3b82f6' },
  { id: '125', label: '≤125cc', min: 1, max: 125, color: '#b8f53e' },
  { id: '180', label: '126-180cc', min: 126, max: 180, color: '#fabd2f' },
  { id: '300', label: '181-300cc', min: 181, max: 300, color: '#fb4934' },
  { id: '550', label: '301-550cc', min: 301, max: 550, color: '#a78bfa' },
  { id: '551+', label: '551cc+', min: 551, max: 99999, color: '#f97316' },
];

interface ModelSales {
  brand: string;
  model_code: string;
  display_name: string | null;
  total_sales: number;
  displacement_cc: number | null;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      padding: '8px 12px', fontSize: 12, fontFamily: FONT,
    }}>
      <div style={{ color: C.text }}>{d.name || d.label}</div>
      <div style={{ color: C.green }}>{(d.total || d.value)?.toLocaleString()} 台</div>
      {d.share != null && <div style={{ color: C.gold }}>市佔 {d.share}%</div>}
    </div>
  );
}

export default function SegmentsPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [models, setModels] = useState<ModelSales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month')
        .order('year_month', { ascending: false });
      const unique = [...new Set((data || []).map(d => d.year_month))];
      setMonths(unique);
      if (unique.length > 0) setSelectedMonth(unique[0]);
    })();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('vehicle_monthly_sales')
        .select('brand, model_code, display_name, total_sales, displacement_cc')
        .eq('year_month', selectedMonth)
        .gt('total_sales', 0)
        .order('total_sales', { ascending: false })
        .limit(500);
      setModels((data || []) as ModelSales[]);
      setLoading(false);
    })();
  }, [selectedMonth]);

  const totalMarket = models.reduce((s, m) => s + m.total_sales, 0);

  // Segment analysis
  const segmentData = useMemo(() => {
    return SEGMENTS.map(seg => {
      const matched = models.filter(m => {
        const cc = m.displacement_cc || 0;
        if (seg.id === 'ev') return cc === 0;
        return cc >= seg.min && cc <= seg.max;
      });
      const total = matched.reduce((s, m) => s + m.total_sales, 0);
      const share = totalMarket > 0 ? ((total / totalMarket) * 100).toFixed(1) : '0';
      const top3 = matched.slice(0, 3);
      const brandCount = new Set(matched.map(m => m.brand)).size;
      const modelCount = matched.length;
      return { ...seg, total, share, top3, brandCount, modelCount };
    }).filter(s => s.total > 0);
  }, [models, totalMarket]);

  // Bar chart data
  const barData = segmentData.map(s => ({
    name: s.label, total: s.total, share: s.share, fill: s.color,
  }));

  // Pie chart data
  const pieData = segmentData.map(s => ({
    name: s.label, value: s.total, fill: s.color,
  }));

  const [y, mo] = selectedMonth.split('-');
  const monthLabel = selectedMonth ? `${y}年${parseInt(mo)}月` : '';

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: FONT, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '30px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>
            guest@hymmoto.tw:~$ <span style={{ color: C.green }}>rankings --segments</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: 2 }}>
            CC SEGMENTS <span style={{ color: C.blue, fontSize: 16, fontFamily: FONT_CN }}>級距分析</span>
          </h1>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 4, fontFamily: FONT_CN }}>
            {monthLabel} · 各排氣量級距銷量分佈
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

        {/* Month Selector */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24,
          padding: '12px 16px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
        }}>
          <span style={{ color: C.muted, fontSize: 11, lineHeight: '28px', marginRight: 8 }}>MONTH:</span>
          {months.map(m => (
            <button key={m} onClick={() => setSelectedMonth(m)} style={{
              padding: '4px 12px', fontSize: 11, fontFamily: FONT, cursor: 'pointer', borderRadius: 2,
              backgroundColor: m === selectedMonth ? C.green : 'transparent',
              color: m === selectedMonth ? C.bg : C.text,
              border: `1px solid ${m === selectedMonth ? C.green : C.border}`,
            }}>
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.green }}>Loading...</div>
        ) : (
          <>
            {/* Charts: Bar + Pie side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Bar Chart */}
              <div style={{
                backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '20px 16px',
              }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
                  $ <span style={{ color: C.green }}>chart --segment-sales</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                    <XAxis dataKey="name" stroke={C.dim} tick={{ fill: C.muted, fontSize: 10 }} />
                    <YAxis stroke={C.dim} tick={{ fill: C.muted, fontSize: 10 }}
                      tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {barData.map((d, i) => (
                        <Cell key={i} fill={d.fill} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div style={{
                backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '20px 16px',
              }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
                  $ <span style={{ color: C.green }}>chart --pie-share</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={35} outerRadius={75} paddingAngle={2}
                      stroke={C.border} strokeWidth={1}>
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {segmentData.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                      <div style={{ width: 8, height: 8, backgroundColor: s.color, borderRadius: 2 }} />
                      <span style={{ color: C.muted }}>{s.label} {s.share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Segment Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {segmentData.map((seg, i) => (
                <div key={i} style={{
                  backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
                  padding: 16, borderTop: `3px solid ${seg.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ color: seg.color, fontSize: 14, fontWeight: 700 }}>{seg.label}</span>
                    <span style={{ color: C.gold, fontSize: 18, fontWeight: 700 }}>{seg.share}%</span>
                  </div>
                  <div style={{ color: C.green, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {seg.total.toLocaleString()} <span style={{ color: C.dim, fontSize: 11, fontWeight: 400 }}>台</span>
                  </div>
                  <div style={{ color: C.dim, fontSize: 10, marginBottom: 12 }}>
                    {seg.modelCount} 款 · {seg.brandCount} 品牌
                  </div>

                  {/* Top 3 in segment */}
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    <div style={{ color: C.muted, fontSize: 9, marginBottom: 6 }}>TOP 3</div>
                    {seg.top3.map((m, j) => (
                      <div key={j} style={{
                        display: 'flex', justifyContent: 'space-between', fontSize: 11, lineHeight: '1.8',
                      }}>
                        <span style={{ color: j === 0 ? C.text : C.muted }}>
                          {j + 1}. {m.display_name || m.model_code}
                        </span>
                        <span style={{ color: C.green }}>{m.total_sales.toLocaleString()}</span>
                      </div>
                    ))}
                    {seg.top3.length === 0 && (
                      <div style={{ color: C.dim, fontSize: 11 }}>無資料</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20, marginBottom: 16,
            }}>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
                $ <span style={{ color: C.green }}>summary --segments</span>
              </div>
              <div style={{ fontSize: 12, lineHeight: 2, color: C.text }}>
                {segmentData[0] && (
                  <div>
                    <span style={{ color: C.muted }}>最大級距　</span>
                    <span style={{ color: segmentData[0].color }}>{segmentData[0].label}</span>
                    <span style={{ color: C.muted }}> · </span>
                    <span style={{ color: C.green }}>{segmentData[0].total.toLocaleString()} 台</span>
                    <span style={{ color: C.muted }}> ({segmentData[0].share}%)</span>
                  </div>
                )}
                <div>
                  <span style={{ color: C.muted }}>全市場　　</span>
                  <span style={{ color: C.green }}>{totalMarket.toLocaleString()} 台</span>
                  <span style={{ color: C.muted }}> · {models.length} 款 · {segmentData.length} 級距</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: C.dim, fontSize: 11, padding: '0 0 20px' }}>
              資料來源：公路局機車新領牌登錄統計 · {selectedMonth}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
