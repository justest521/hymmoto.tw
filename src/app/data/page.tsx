'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

function bar(value: number, max: number, width: number = 20): string {
  if (max === 0) return '░'.repeat(width);
  const filled = Math.max(value > 0 ? 1 : 0, Math.round((value / max) * width));
  return '█'.repeat(Math.min(width, filled)) + '░'.repeat(Math.max(0, width - filled));
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

const CC_SEGMENTS = [
  { id: 'all', label: '全部' },
  { id: 'ev', label: '電動', match: (d: string | null) => d === '電動機車' },
  { id: '50', label: '≤50cc', match: (d: string | null) => d === '50cc以下' },
  { id: '125', label: '51-125', match: (d: string | null) => d === '50-125cc' },
  { id: '250', label: '126-250', match: (d: string | null) => d === '126-250cc' },
  { id: '550', label: '251-550', match: (d: string | null) => d === '251-550cc' },
  { id: '551', label: '551cc+', match: (d: string | null) => d === '551cc以上' },
];

const DataPage: React.FC = () => {
  const [allData, setAllData] = useState<VmsRow[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCC, setSelectedCC] = useState('all');
  const [searchModel, setSearchModel] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all months list + selected month data
  useEffect(() => {
    const fetchMonths = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month')
        .order('year_month', { ascending: false });
      if (data) {
        const unique = [...new Set(data.map(d => d.year_month))];
        setMonths(unique);
        if (!selectedMonth && unique.length > 0) setSelectedMonth(unique[0]);
      }
    };
    fetchMonths();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month, brand, model_code, display_name, total_sales, displacement, displacement_cc')
        .eq('year_month', selectedMonth)
        .gt('total_sales', 0)
        .order('total_sales', { ascending: false });
      setAllData(data || []);
      setLoading(false);
    };
    fetchData();
  }, [selectedMonth]);

  // Derived: brands list
  const brands = useMemo(() => {
    const map = new Map<string, number>();
    allData.forEach(r => map.set(r.brand, (map.get(r.brand) || 0) + r.total_sales));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  }, [allData]);

  // Filtered data
  const filtered = useMemo(() => {
    let d = allData;
    if (selectedBrand !== 'all') d = d.filter(r => r.brand === selectedBrand);
    if (selectedCC !== 'all') {
      const seg = CC_SEGMENTS.find(s => s.id === selectedCC);
      if (seg?.match) d = d.filter(r => seg.match!(r.displacement));
    }
    if (searchModel.trim()) {
      const q = searchModel.trim().toLowerCase();
      d = d.filter(r =>
        (r.display_name || '').toLowerCase().includes(q) ||
        r.model_code.toLowerCase().includes(q)
      );
    }
    return d;
  }, [allData, selectedBrand, selectedCC, searchModel]);

  // Stats
  const totalSales = filtered.reduce((s, r) => s + r.total_sales, 0);
  const brandCount = new Set(filtered.map(r => r.brand)).size;
  const modelCount = filtered.length;
  const maxSales = filtered[0]?.total_sales || 1;

  // Brand summary
  const brandSummary = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(r => map.set(r.brand, (map.get(r.brand) || 0) + r.total_sales));
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const total = arr.reduce((s, [, v]) => s + v, 0);
    return arr.map(([name, sales]) => ({
      name,
      sales,
      share: total > 0 ? Math.round((sales / total) * 1000) / 10 : 0,
    }));
  }, [filtered]);

  const maxShare = brandSummary[0]?.share || 1;

  // CC segment summary
  const ccSummary = useMemo(() => {
    return CC_SEGMENTS.filter(s => s.id !== 'all').map(seg => {
      const rows = filtered.filter(r => seg.match!(r.displacement));
      const total = rows.reduce((s, r) => s + r.total_sales, 0);
      const top = rows[0];
      return {
        label: seg.label,
        total,
        leader: top ? `${top.brand} ${top.display_name || top.model_code}` : '-',
        leaderSales: top?.total_sales || 0,
      };
    }).filter(s => s.total > 0);
  }, [filtered]);

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#282828',
    color: '#b8f53e',
    border: '1px solid #3c3836',
    borderRadius: '4px',
    padding: '8px 12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '120px',
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? '#b8f53e' : '#282828',
    color: active ? '#1d2021' : '#928374',
    border: `1px solid ${active ? '#b8f53e' : '#3c3836'}`,
    borderRadius: '4px',
    padding: '6px 14px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  const [y, mo] = selectedMonth ? selectedMonth.split('-') : ['', ''];
  const monthLabel = selectedMonth ? `${y}年${parseInt(mo)}月` : '';

  if (!selectedMonth) {
    return (
      <div style={{
        backgroundColor: '#1d2021', color: '#b8f53e', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
      }}>Loading...</div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1d2021',
      color: '#ebdbb2',
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: '100vh',
      padding: '30px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #3c3836', paddingBottom: '20px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>data --dashboard</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
            DATA CENTER
          </h1>
          <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            台灣機車市場即時數據分析平台 · {monthLabel}
          </div>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div style={{
          backgroundColor: '#282828',
          border: '1px solid #3c3836',
          borderRadius: '4px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}>
          <div style={{ color: '#928374', fontSize: '11px', marginBottom: '12px', letterSpacing: '1px' }}>
            $ <span style={{ color: '#b8f53e' }}>filter --interactive</span>
          </div>

          {/* Row 1: Month + Brand */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#928374', fontSize: '11px' }}>月份</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={selectStyle}
              >
                {months.map(m => {
                  const [yy, mm] = m.split('-');
                  return <option key={m} value={m}>{yy}年{parseInt(mm)}月</option>;
                })}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#928374', fontSize: '11px' }}>品牌</span>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                style={selectStyle}
              >
                <option value="all">全部品牌</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
              <span style={{ color: '#928374', fontSize: '11px' }}>車型</span>
              <input
                type="text"
                value={searchModel}
                onChange={e => setSearchModel(e.target.value)}
                placeholder="搜尋車型名稱或代碼..."
                style={{
                  ...selectStyle,
                  flex: 1,
                  color: '#ebdbb2',
                }}
              />
            </div>
          </div>

          {/* Row 2: CC segments */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#928374', fontSize: '11px', marginRight: '4px' }}>CC</span>
            {CC_SEGMENTS.map(seg => (
              <button
                key={seg.id}
                onClick={() => setSelectedCC(seg.id)}
                style={pillStyle(selectedCC === seg.id)}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'TOTAL SALES', value: totalSales.toLocaleString(), sym: '>>' },
            { label: 'BRANDS', value: `${brandCount}`, sym: '>_' },
            { label: 'MODELS', value: `${modelCount}`, sym: '::' },
            { label: 'MONTH', value: selectedMonth, sym: '$>' },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: '#282828',
              border: '1px solid #3c3836',
              padding: '16px',
              borderRadius: '4px',
            }}>
              <div style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{s.sym}</div>
              <div style={{ color: '#ebdbb2', fontSize: '20px', fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: '#928374', fontSize: '10px', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Brand Market Share */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>brand --market-share{selectedBrand !== 'all' ? ` --brand=${selectedBrand}` : ''}{selectedCC !== 'all' ? ` --cc=${selectedCC}` : ''}</span>
          </div>
          <div style={{
            backgroundColor: '#282828',
            border: '1px solid #3c3836',
            borderRadius: '4px',
            padding: '20px',
          }}>
            <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
              BRAND MARKET SHARE · {monthLabel}
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
          <div style={{
            backgroundColor: '#282828',
            border: '1px solid #3c3836',
            borderRadius: '4px',
            padding: '20px',
            overflowX: 'auto',
          }}>
            <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
              VEHICLE SALES RANKING · {monthLabel}
              <span style={{ color: '#928374', fontWeight: 400, fontSize: '11px', marginLeft: '12px' }}>
                {filtered.length} models
              </span>
            </div>

            {/* Table header */}
            <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ display: 'flex', color: '#928374', borderBottom: '1px solid #3c3836', paddingBottom: '8px', marginBottom: '4px', gap: '0' }}>
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
                  <div key={`${r.brand}-${r.model_code}`} style={{
                    display: 'flex',
                    gap: '0',
                    lineHeight: '2',
                    color: i < 3 ? '#fabd2f' : '#ebdbb2',
                  }}>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '12px',
            }}>
              {ccSummary.map((tier, i) => (
                <div key={i} style={{
                  backgroundColor: '#282828',
                  border: '1px solid #3c3836',
                  borderRadius: '4px',
                  padding: '16px',
                }}>
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
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '4px',
                padding: '14px 20px',
                textDecoration: 'none',
                color: '#ebdbb2',
                transition: 'all 0.15s',
                flex: '1',
                minWidth: '180px',
              }}>
                <div style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{link.sym} {link.label}</div>
                <div style={{ color: '#928374', fontSize: '11px', fontFamily: "'Noto Sans TC', sans-serif" }}>{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DataPage;
