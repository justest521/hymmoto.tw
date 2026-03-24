'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface SalesRow {
  brand: string;
  model_code: string;
  display_name: string | null;
  total_sales: number;
  displacement: string | null;
}

const COLORS = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
};

function bar(v: number, max: number, w: number = 16): string {
  if (max === 0) return '░'.repeat(w);
  const f = Math.max(v > 0 ? 1 : 0, Math.min(w, Math.round((v / max) * w)));
  return '█'.repeat(f) + '░'.repeat(w - f);
}

const SalesPage: React.FC = () => {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCc, setSelectedCc] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const supabase = createClient();

  const ccCategories = [
    { label: '全部', value: 'all' },
    { label: '電動', value: '電動機車' },
    { label: '125cc', value: '125cc' },
    { label: '150-250cc', value: '150-250cc' },
    { label: '251-550cc', value: '251-550cc' },
    { label: '551cc+', value: '551cc+' },
  ];

  // Fetch available months
  useEffect(() => {
    const fetchMonths = async () => {
      const { data } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month')
        .order('year_month', { ascending: false })
        .limit(100);

      if (data) {
        const unique = [...new Set(data.map(d => d.year_month))].slice(0, 12);
        setMonths(unique);
        if (unique.length > 0) setSelectedMonth(unique[0]);
      }
    };
    fetchMonths();
  }, []);

  // Fetch sales data when month or cc changes
  useEffect(() => {
    if (!selectedMonth) return;
    const fetchSales = async () => {
      setLoading(true);
      let query = supabase
        .from('vehicle_monthly_sales')
        .select('brand, model_code, display_name, total_sales, displacement')
        .eq('year_month', selectedMonth)
        .gt('total_sales', 0)
        .order('total_sales', { ascending: false })
        .limit(50);

      if (selectedCc !== 'all') {
        if (selectedCc === '150-250cc') {
          query = query.in('displacement', ['150cc', '150-250cc', '250cc']);
        } else if (selectedCc === '251-550cc') {
          query = query.in('displacement', ['251-550cc', '300cc+']);
        } else if (selectedCc === '551cc+') {
          query = query.in('displacement', ['551-1000cc', '1000cc+']);
        } else {
          query = query.eq('displacement', selectedCc);
        }
      }

      const { data } = await query;
      setRows(data || []);
      setLoading(false);
    };
    fetchSales();
  }, [selectedMonth, selectedCc]);

  const totalSales = rows.reduce((s, r) => s + r.total_sales, 0);
  const maxSales = rows[0]?.total_sales || 1;

  return (
    <div style={{
      backgroundColor: COLORS.bg, color: COLORS.text,
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: '100vh', padding: '30px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Terminal Header */}
        <div style={{ marginBottom: '40px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '20px' }}>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: COLORS.green }}>data --sales --rank</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: '2px' }}>
            SALES RANKINGS
          </h1>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            月度銷售排行 · {selectedMonth || '...'}
          </div>
        </div>

        {/* Month Selector */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {months.map((m) => (
            <button key={m} onClick={() => setSelectedMonth(m)} style={{
              padding: '6px 14px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px',
              fontFamily: "'JetBrains Mono', monospace",
              border: `1px solid ${selectedMonth === m ? COLORS.green : COLORS.border}`,
              backgroundColor: selectedMonth === m ? COLORS.green : COLORS.card,
              color: selectedMonth === m ? COLORS.bg : COLORS.text,
            }}>
              {m}
            </button>
          ))}
        </div>

        {/* CC Filter */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ccCategories.map((cat) => (
            <button key={cat.value} onClick={() => setSelectedCc(cat.value)} style={{
              padding: '6px 12px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px',
              fontFamily: "'JetBrains Mono', monospace",
              border: `1px solid ${selectedCc === cat.value ? COLORS.gold : COLORS.border}`,
              backgroundColor: selectedCc === cat.value ? COLORS.gold : COLORS.card,
              color: selectedCc === cat.value ? COLORS.bg : COLORS.text,
            }}>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: COLORS.muted }}>
            <p>$ loading sales data...</p>
            <p style={{ color: COLORS.green }}>▌</p>
          </div>
        ) : (
          <div style={{
            backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
            borderRadius: '4px', overflow: 'hidden',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '50px 1fr 100px 80px 200px',
              padding: '10px 16px', backgroundColor: COLORS.bg,
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: '11px', color: COLORS.muted, fontWeight: 700, letterSpacing: '1px',
            }}>
              <div>#</div>
              <div>MODEL</div>
              <div style={{ textAlign: 'right' }}>SALES</div>
              <div style={{ textAlign: 'right' }}>SHARE</div>
              <div style={{ textAlign: 'center' }}>BAR</div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => {
              const rank = i + 1;
              const share = totalSales > 0 ? ((row.total_sales / totalSales) * 100) : 0;
              let borderColor = COLORS.border;
              if (rank === 1) borderColor = COLORS.gold;
              else if (rank === 2) borderColor = '#b8b8b8';
              else if (rank === 3) borderColor = '#d4913d';

              return (
                <Link
                  key={`${row.brand}-${row.model_code}-${i}`}
                  href={`/bikes/${encodeURIComponent(row.brand)}/${encodeURIComponent(row.display_name || row.model_code)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      display: 'grid', gridTemplateColumns: '50px 1fr 100px 80px 200px',
                      padding: '10px 16px', fontSize: '12px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      borderLeft: `3px solid ${borderColor}`,
                      backgroundColor: hoveredRow === i ? 'rgba(184,245,62,0.06)' : COLORS.card,
                      transition: 'background 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div style={{
                      color: rank <= 3 ? COLORS.gold : COLORS.muted,
                      fontWeight: rank <= 3 ? 700 : 400,
                    }}>
                      #{rank}
                    </div>
                    <div>
                      <span style={{ color: COLORS.muted, fontSize: '11px' }}>{row.brand} </span>
                      <span style={{ color: COLORS.text }}>{row.display_name || row.model_code}</span>
                      {row.displacement && (
                        <span style={{ color: COLORS.muted, fontSize: '10px', marginLeft: '8px' }}>
                          {row.displacement}
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', color: COLORS.gold, fontWeight: 700 }}>
                      {row.total_sales.toLocaleString()}
                    </div>
                    <div style={{ textAlign: 'right', color: COLORS.muted }}>
                      {share.toFixed(1)}%
                    </div>
                    <div style={{ textAlign: 'center', whiteSpace: 'pre', color: COLORS.green }}>
                      {bar(row.total_sales, maxSales, 16)}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Footer */}
            <div style={{
              display: 'grid', gridTemplateColumns: '50px 1fr 100px 80px 200px',
              padding: '10px 16px', backgroundColor: COLORS.bg,
              borderTop: `1px solid ${COLORS.border}`,
              fontSize: '12px', fontWeight: 700, color: COLORS.green,
            }}>
              <div></div>
              <div>TOTAL ({rows.length} models)</div>
              <div style={{ textAlign: 'right' }}>{totalSales.toLocaleString()}</div>
              <div style={{ textAlign: 'right' }}>100%</div>
              <div></div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: '4px', fontSize: '11px', color: COLORS.muted,
        }}>
          數據來源: 公路局機車新領牌登錄 · HYMMOTO 市場監測系統
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
