'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const C = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598', dim: '#504945',
};
const FONT = "'JetBrains Mono', monospace";
const FONT_CN = "'Noto Sans TC', sans-serif";

const BRAND_COLORS: Record<string, string> = {
  '三陽': '#b8f53e', 'SYM': '#b8f53e',
  '光陽': '#83a598', 'KYMCO': '#83a598',
  '山葉': '#fb4934', 'YAMAHA': '#fb4934',
  '睿能': '#3b82f6', 'GOGORO': '#3b82f6',
  '鈴木': '#fabd2f', 'SUZUKI': '#fabd2f',
  '中華': '#a78bfa', '比雅久': '#34d399', 'PGO': '#34d399',
  '哈特佛': '#f97316', '宏佳騰': '#ec4899', '川崎': '#22d3ee',
};

interface BrandData {
  brand: string;
  total: number;
  market_share: number;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      padding: '8px 12px', fontSize: 12, fontFamily: FONT,
    }}>
      <div style={{ color: C.text }}>{d.brand || d.name}</div>
      <div style={{ color: C.green }}>{d.total?.toLocaleString() || d.value?.toLocaleString()} 台</div>
      {d.market_share != null && (
        <div style={{ color: C.gold }}>市佔 {Number(d.market_share).toFixed(1)}%</div>
      )}
    </div>
  );
}

export default function BrandRankingsPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('sales_brand_monthly')
        .select('year_month')
        .order('year_month', { ascending: false });
      const unique = [...new Set((data || []).map(d => d.year_month))];
      setMonths(unique);
      if (unique.length > 0) setSelectedMonth(unique[0]);
    })();
  }, []);

  // Fetch brand data for selected month
  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('sales_brand_monthly')
        .select('brand, total, market_share')
        .eq('year_month', selectedMonth)
        .order('total', { ascending: false });
      setBrands((data || []).map(b => ({
        ...b,
        market_share: Number(b.market_share) || 0,
      })) as BrandData[]);
      setLoading(false);
    })();
  }, [selectedMonth]);

  // Fetch trend data (last 6 months, top 5 brands)
  useEffect(() => {
    if (months.length === 0) return;
    (async () => {
      const supabase = createClient();
      const recentMonths = months.slice(0, 6).reverse();
      const { data } = await supabase
        .from('sales_brand_monthly')
        .select('brand, total, market_share, year_month')
        .in('year_month', recentMonths)
        .order('year_month', { ascending: true });

      if (!data) return;

      // Get top 5 brands from latest month
      const latestBrands = data
        .filter(d => d.year_month === months[0])
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .slice(0, 5)
        .map(b => b.brand);

      // Build trend lines
      const trend = recentMonths.map(m => {
        const row: any = { month: m.slice(5) + '月' };
        latestBrands.forEach(brand => {
          const found = data.find(d => d.year_month === m && d.brand === brand);
          row[brand] = found ? Number(found.market_share) || 0 : 0;
        });
        return row;
      });
      setTrendData(trend);
    })();
  }, [months]);

  const totalMarket = brands.reduce((s, b) => s + b.total, 0);
  const top10 = brands.slice(0, 10);

  // Pie chart data
  const pieData = useMemo(() => {
    const top5 = brands.slice(0, 5);
    const othersTotal = brands.slice(5).reduce((s, b) => s + b.total, 0);
    const result = top5.map(b => ({
      name: b.brand, value: b.total,
      fill: BRAND_COLORS[b.brand] || C.muted,
    }));
    if (othersTotal > 0) result.push({ name: '其他', value: othersTotal, fill: C.dim });
    return result;
  }, [brands]);

  const [y, mo] = selectedMonth.split('-');
  const monthLabel = selectedMonth ? `${y}年${parseInt(mo)}月` : '';

  // Top 5 brand keys for trend chart
  const trendBrands = brands.slice(0, 5).map(b => b.brand);

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: FONT, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '30px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>
            guest@hymmoto.tw:~$ <span style={{ color: C.green }}>rankings --brands</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: 2 }}>
            BRAND RANKING <span style={{ color: C.gold, fontSize: 16, fontFamily: FONT_CN }}>品牌市佔排行</span>
          </h1>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 4, fontFamily: FONT_CN }}>
            {monthLabel} · 各品牌銷量與市佔率
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
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
                <div style={{ color: C.muted, fontSize: 10 }}>TOTAL MARKET</div>
                <div style={{ color: C.green, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{totalMarket.toLocaleString()}</div>
                <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>台</div>
              </div>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
                <div style={{ color: C.muted, fontSize: 10 }}>BRANDS</div>
                <div style={{ color: C.gold, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{brands.length}</div>
                <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>個品牌</div>
              </div>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
                <div style={{ color: C.muted, fontSize: 10 }}>#1 BRAND</div>
                <div style={{ color: C.text, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{brands[0]?.brand || '-'}</div>
                <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>{brands[0]?.market_share.toFixed(1)}%</div>
              </div>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
                <div style={{ color: C.muted, fontSize: 10 }}>TOP3 SHARE</div>
                <div style={{ color: C.blue, fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                  {brands.slice(0, 3).reduce((s, b) => s + b.market_share, 0).toFixed(1)}%
                </div>
                <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>集中度</div>
              </div>
            </div>

            {/* Charts Grid: Bar + Pie */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Bar Chart */}
              <div style={{
                backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '20px 16px',
              }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
                  $ <span style={{ color: C.green }}>chart --brand-share</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10} margin={{ left: 60, right: 20, top: 4, bottom: 4 }} layout="vertical">
                    <XAxis type="number" stroke={C.dim} tick={{ fill: C.muted, fontSize: 10 }}
                      tickFormatter={(v: number) => `${v.toLocaleString()}`} />
                    <YAxis type="category" dataKey="brand" width={50}
                      tick={{ fill: C.text, fontSize: 11, fontFamily: FONT }} stroke={C.dim} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                      {top10.map((b, i) => (
                        <Cell key={i} fill={BRAND_COLORS[b.brand] || C.muted} fillOpacity={0.8} />
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
                  $ <span style={{ color: C.green }}>chart --pie</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={40} outerRadius={80} paddingAngle={2}
                      stroke={C.border} strokeWidth={1}>
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                      <div style={{ width: 8, height: 8, backgroundColor: d.fill, borderRadius: 2 }} />
                      <span style={{ color: C.muted }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend Chart (if we have data) */}
            {trendData.length > 1 && (
              <div style={{
                backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
                padding: '20px 16px', marginBottom: 24,
              }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
                  $ <span style={{ color: C.green }}>chart --trend --top5</span>
                  <span style={{ color: C.dim, marginLeft: 12 }}>市佔率趨勢（%）</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData} margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" stroke={C.dim} tick={{ fill: C.muted, fontSize: 10 }} />
                    <YAxis stroke={C.dim} tick={{ fill: C.muted, fontSize: 10 }}
                      tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: C.card, border: `1px solid ${C.border}`, fontSize: 11, fontFamily: FONT }}
                      formatter={(val: number) => [`${val.toFixed(1)}%`]}
                    />
                    {trendBrands.map(brand => (
                      <Line key={brand} type="monotone" dataKey={brand}
                        stroke={BRAND_COLORS[brand] || C.muted}
                        strokeWidth={2} dot={{ r: 3 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                  {trendBrands.map(brand => (
                    <div key={brand} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                      <div style={{ width: 12, height: 3, backgroundColor: BRAND_COLORS[brand] || C.muted }} />
                      <span style={{ color: C.muted }}>{brand}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Table */}
            <div style={{
              backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
              overflow: 'hidden', marginBottom: 24,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.muted, fontSize: 11 }}>
                  $ <span style={{ color: C.green }}>brands --rank</span>
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: C.muted, width: 50 }}>#</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: C.muted }}>品牌</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: C.muted, width: 100 }}>銷量</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: C.muted, width: 80 }}>市佔率</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, width: 200 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b, i) => {
                    const barW = brands[0] ? (b.total / brands[0].total) * 100 : 0;
                    const color = BRAND_COLORS[b.brand] || C.muted;
                    return (
                      <tr key={i} style={{
                        borderBottom: `1px solid ${C.border}`,
                        backgroundColor: i % 2 === 0 ? C.bg : C.card,
                      }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: i < 3 ? C.gold : C.muted, fontWeight: i < 3 ? 700 : 400 }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 2 }} />
                            <span style={{ color: C.text }}>{b.brand}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: C.green, fontWeight: 600 }}>
                          {b.total.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: C.gold }}>
                          {b.market_share.toFixed(1)}%
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 3, width: `${barW}%`,
                              backgroundColor: color, opacity: 0.7,
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
