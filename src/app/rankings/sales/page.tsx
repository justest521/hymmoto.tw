'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ── Theme ───────────────────────────────────────────
const C = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
  dim: '#504945',
};

const FONT = "'JetBrains Mono', monospace";
const FONT_CN = "'Noto Sans TC', sans-serif";

// ── CC Segments ─────────────────────────────────────
const CC_FILTERS = [
  { id: 'all', label: '全部', min: -1, max: 99999 },
  { id: 'ev', label: '電動', min: -1, max: 0 },
  { id: '125', label: '≤125cc', min: 1, max: 125 },
  { id: '180', label: '126-180cc', min: 126, max: 180 },
  { id: '300', label: '181-300cc', min: 181, max: 300 },
  { id: '550', label: '301-550cc', min: 301, max: 550 },
  { id: '551+', label: '551cc+', min: 551, max: 99999 },
];

interface ModelSales {
  brand: string;
  model_code: string;
  display_name: string | null;
  total_sales: number;
  displacement_cc: number | null;
}

// ── Custom Tooltip ──────────────────────────────────
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      padding: '8px 12px', fontSize: '12px', fontFamily: FONT,
    }}>
      <div style={{ color: C.text }}>{d.name}</div>
      <div style={{ color: C.green }}>{d.sales?.toLocaleString()} 台</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════
export default function SalesRankingsPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [ccFilter, setCcFilter] = useState('all');
  const [allModels, setAllModels] = useState<ModelSales[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available months on mount
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

  // Fetch models when month changes
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
        .limit(200);
      setAllModels((data || []) as ModelSales[]);
      setLoading(false);
    })();
  }, [selectedMonth]);

  // Filtered + ranked models
  const filtered = useMemo(() => {
    const seg = CC_FILTERS.find(f => f.id === ccFilter) || CC_FILTERS[0];
    if (seg.id === 'all') return allModels;
    return allModels.filter(m => {
      const cc = m.displacement_cc || 0;
      if (seg.id === 'ev') return cc === 0;
      return cc >= seg.min && cc <= seg.max;
    });
  }, [allModels, ccFilter]);

  const totalFiltered = filtered.reduce((s, m) => s + m.total_sales, 0);
  const totalAll = allModels.reduce((s, m) => s + m.total_sales, 0);
  const top3 = filtered.slice(0, 3);
  const top20 = filtered.slice(0, 20);

  // Chart data (top 10)
  const chartData = filtered.slice(0, 10).map(m => ({
    name: m.display_name || m.model_code,
    sales: m.total_sales,
    brand: m.brand,
  }));

  const [y, mo] = selectedMonth.split('-');
  const monthLabel = selectedMonth ? `${y}年${parseInt(mo)}月` : '';

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { border: C.gold, color: C.gold, label: '1st' };
    if (rank === 2) return { border: '#a8a8b0', color: '#a8a8b0', label: '2nd' };
    if (rank === 3) return { border: '#cd7f32', color: '#cd7f32', label: '3rd' };
    return { border: C.border, color: C.muted, label: '' };
  };

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: FONT, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '30px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>
            guest@hymmoto.tw:~$ <span style={{ color: C.green }}>rankings --sales</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: 2 }}>
            SALES KING <span style={{ color: C.green, fontSize: 16, fontFamily: FONT_CN }}>銷售排行榜</span>
          </h1>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 4, fontFamily: FONT_CN }}>
            {monthLabel} · 即時銷量排名
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

        {/* ── Month Selector ── */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16,
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

        {/* ── CC Filter ── */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24,
          padding: '12px 16px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
        }}>
          <span style={{ color: C.muted, fontSize: 11, lineHeight: '28px', marginRight: 8 }}>CC:</span>
          {CC_FILTERS.map(f => (
            <button key={f.id} onClick={() => setCcFilter(f.id)} style={{
              padding: '4px 12px', fontSize: 11, fontFamily: FONT, cursor: 'pointer', borderRadius: 2,
              backgroundColor: f.id === ccFilter ? C.gold : 'transparent',
              color: f.id === ccFilter ? C.bg : C.text,
              border: `1px solid ${f.id === ccFilter ? C.gold : C.border}`,
              fontWeight: f.id === ccFilter ? 700 : 400,
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.green, fontSize: 14 }}>
            Loading sales data...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 13 }}>
            此級距在 {selectedMonth} 無銷售資料
          </div>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'TOTAL', value: totalFiltered.toLocaleString(), unit: '台', color: C.green },
                { label: 'MODELS', value: filtered.length.toString(), unit: '款', color: C.gold },
                { label: 'TOP 1', value: top3[0] ? (top3[0].display_name || top3[0].model_code) : '-', unit: `${top3[0]?.total_sales.toLocaleString() || 0} 台`, color: C.text },
                { label: 'SHARE', value: totalAll > 0 ? `${(totalFiltered / totalAll * 100).toFixed(1)}%` : '-', unit: '佔全市場', color: C.blue },
              ].map((s, i) => (
                <div key={i} style={{
                  backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '16px 14px',
                }}>
                  <div style={{ color: C.muted, fontSize: 10, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>{s.unit}</div>
                </div>
              ))}
            </div>

            {/* ── Recharts Bar Chart ── */}
            <div style={{
              backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
              padding: '20px 16px', marginBottom: 24,
            }}>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
                $ <span style={{ color: C.green }}>chart --bar --top10</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20, top: 4, bottom: 4 }}>
                  <XAxis type="number" stroke={C.dim} tick={{ fill: C.muted, fontSize: 10 }} />
                  <YAxis
                    type="category" dataKey="name" width={110}
                    tick={{ fill: C.text, fontSize: 11, fontFamily: FONT }}
                    stroke={C.dim}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? C.green : i < 3 ? C.gold : C.blue} fillOpacity={i < 3 ? 0.9 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Top 3 Podium ── */}
            {top3.length >= 3 && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 12, marginBottom: 24,
                alignItems: 'end',
              }}>
                {[1, 0, 2].map(idx => {
                  const m = top3[idx];
                  const rank = idx + 1;
                  const realRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                  const rs = getRankStyle(realRank);
                  const isFirst = realRank === 1;
                  return (
                    <div key={idx} style={{
                      backgroundColor: C.card, border: `2px solid ${rs.border}`,
                      borderRadius: 4, padding: isFirst ? '24px 16px' : '18px 14px',
                      textAlign: 'center',
                      boxShadow: isFirst ? `0 0 20px ${rs.border}30` : 'none',
                    }}>
                      <div style={{ color: rs.color, fontSize: isFirst ? 32 : 24, fontWeight: 700, marginBottom: 4 }}>
                        {rs.label}
                      </div>
                      <div style={{ color: C.text, fontSize: isFirst ? 15 : 13, fontWeight: 600, marginBottom: 4 }}>
                        {m.display_name || m.model_code}
                      </div>
                      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>{m.brand}</div>
                      <div style={{ color: C.green, fontSize: isFirst ? 22 : 18, fontWeight: 700 }}>
                        {m.total_sales.toLocaleString()}
                      </div>
                      <div style={{ color: C.dim, fontSize: 10 }}>台</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Full Ranking Table ── */}
            <div style={{
              backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
              overflow: 'hidden', marginBottom: 24,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.muted, fontSize: 11 }}>
                  $ <span style={{ color: C.green }}>rankings --list --limit 50</span>
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: C.muted, width: 50 }}>#</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: C.muted }}>車款</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: C.muted, width: 80 }}>品牌</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: C.muted, width: 70 }}>排氣量</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: C.muted, width: 90 }}>銷量</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: C.muted, width: 70 }}>市佔</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, width: 140 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {top20.map((m, i) => {
                    const rank = i + 1;
                    const rs = getRankStyle(rank);
                    const cc = m.displacement_cc || 0;
                    const ccText = cc === 0 ? '電動' : `${cc}cc`;
                    const share = totalAll > 0 ? ((m.total_sales / totalAll) * 100).toFixed(1) : '0';
                    const barW = top20[0] ? (m.total_sales / top20[0].total_sales) * 100 : 0;
                    return (
                      <tr key={i} style={{
                        borderBottom: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${rs.border}`,
                        backgroundColor: i % 2 === 0 ? C.bg : C.card,
                      }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: rs.color, fontWeight: 700 }}>
                          {rank}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Link href={`/bikes/${m.brand}/${encodeURIComponent(m.display_name || m.model_code)}`}
                            style={{ color: C.text, textDecoration: 'none' }}>
                            {m.display_name || m.model_code}
                          </Link>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: C.muted }}>{m.brand}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: C.dim }}>{ccText}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: C.green, fontWeight: 600 }}>
                          {m.total_sales.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: C.muted }}>
                          {share}%
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{
                            height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 3,
                              width: `${barW}%`,
                              backgroundColor: rank <= 3 ? C.green : C.blue,
                              opacity: rank <= 3 ? 0.8 : 0.5,
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length > 20 && (
                <div style={{ padding: '12px 16px', color: C.dim, fontSize: 11, textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
                  顯示前 20 名 / 共 {filtered.length} 款
                </div>
              )}
            </div>

            {/* ── Footer Stats ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16,
            }}>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16, textAlign: 'center' }}>
                <div style={{ color: C.muted, fontSize: 10 }}>篩選總銷量</div>
                <div style={{ color: C.green, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{totalFiltered.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16, textAlign: 'center' }}>
                <div style={{ color: C.muted, fontSize: 10 }}>車款數</div>
                <div style={{ color: C.gold, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{filtered.length}</div>
              </div>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16, textAlign: 'center' }}>
                <div style={{ color: C.muted, fontSize: 10 }}>平均銷量</div>
                <div style={{ color: C.blue, fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                  {filtered.length > 0 ? Math.round(totalFiltered / filtered.length).toLocaleString() : 0}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: C.dim, fontSize: 11, padding: '12px 0 20px' }}>
              資料來源：公路局機車新領牌登錄統計 · {selectedMonth}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
