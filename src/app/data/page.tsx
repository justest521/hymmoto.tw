'use client';

import React from 'react';
import Link from 'next/link';

function bar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

// CJK-aware pad: Chinese chars are double-width in monospace
function visualWidth(str: string): number {
  let w = 0
  for (const ch of str) {
    w += ch.charCodeAt(0) > 0x7f ? 2 : 1
  }
  return w
}

function padEndCJK(str: string, len: number): string {
  const diff = len - visualWidth(str)
  return diff > 0 ? str + ' '.repeat(diff) : str
}

const DataPage: React.FC = () => {
  const brands = [
    { name: 'KYMCO',    share: 28.3, sales: 5420 },
    { name: 'YAMAHA',   share: 24.1, sales: 4615 },
    { name: 'SYM',      share: 18.7, sales: 3581 },
    { name: 'GOGORO',   share: 8.2,  sales: 1571 },
    { name: 'HONDA',    share: 7.5,  sales: 1437 },
    { name: 'SUZUKI',   share: 3.8,  sales: 728 },
    { name: 'KAWASAKI', share: 2.9,  sales: 556 },
    { name: 'BMW',      share: 1.8,  sales: 345 },
    { name: 'DUCATI',   share: 1.2,  sales: 230 },
    { name: 'KTM',      share: 1.1,  sales: 211 },
    { name: 'AEON',     share: 1.5,  sales: 287 },
    { name: 'TRIUMPH',  share: 0.9,  sales: 172 },
  ];

  const topModels = [
    { rank: 1,  model: 'KYMCO 新K1 150',       sales: 2202 },
    { rank: 2,  model: 'YAMAHA FORCE 2.0',      sales: 1891 },
    { rank: 3,  model: 'SYM JET SL+',           sales: 1756 },
    { rank: 4,  model: 'KYMCO GP125',            sales: 1698 },
    { rank: 5,  model: 'YAMAHA LIMI 125',        sales: 1542 },
    { rank: 6,  model: 'SYM 迪爵 DUKE 125',     sales: 1489 },
    { rank: 7,  model: 'GOGORO VIVA MIX',        sales: 1356 },
    { rank: 8,  model: 'KYMCO MANY 125',         sales: 1298 },
    { rank: 9,  model: 'HONDA SUPER CUB 50',     sales: 1245 },
    { rank: 10, model: 'YAMAHA CYGNUS GRYPHUS',  sales: 1201 },
  ];

  const ccTiers = [
    { label: '≤50cc',     leader: 'HONDA SUPER CUB 50', sales: 1245, total: 3200 },
    { label: '100-115cc', leader: 'SYM WOO 115',        sales: 1286, total: 4100 },
    { label: '125cc',     leader: 'SYM 迪爵 DUKE 125',  sales: 2061, total: 8500 },
    { label: '150-250cc', leader: 'KYMCO 新K1 150',     sales: 2202, total: 5800 },
    { label: '300-400cc', leader: 'KAWASAKI NINJA 400',  sales: 876,  total: 1900 },
    { label: '500cc+',    leader: 'YAMAHA MT-07',        sales: 987,  total: 2100 },
  ];

  const maxShare = brands[0].share;
  const maxSales = topModels[0].sales;

  const mono: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
  };

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
        <div style={{ marginBottom: '40px', borderBottom: '1px solid #3c3836', paddingBottom: '20px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>data --dashboard</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
            DATA CENTER
          </h1>
          <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            台灣機車市場即時數據分析平台 · 2026-03
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '40px',
        }}>
          {[
            { label: 'TOTAL SALES', value: '190,938', sym: '>>' },
            { label: 'BRANDS', value: '32+', sym: '>_' },
            { label: 'MODELS', value: '566+', sym: '::' },
            { label: 'LATEST', value: '2026-03', sym: '$>' },
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

        {/* Brand Market Share - Terminal Progress Bars */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>brand --market-share</span>
          </div>
          <div style={{
            backgroundColor: '#282828',
            border: '1px solid #3c3836',
            borderRadius: '4px',
            padding: '20px',
          }}>
            <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
              BRAND MARKET SHARE · 2026-03
            </div>
            <div style={{ ...mono, fontSize: '13px', whiteSpace: 'pre', lineHeight: '1.8' }}>
              {brands.map((b, i) => (
                <div key={i}>{`  ${b.name.padEnd(10)} ${bar(b.share, maxShare, 20)} ${`${b.share}%`.padStart(6)}  (${b.sales.toLocaleString().padStart(5)})`}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Top 10 Sales - Terminal Table */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>top 10 --month 2026-03</span>
          </div>
          <div style={{
            backgroundColor: '#282828',
            border: '1px solid #3c3836',
            borderRadius: '4px',
            padding: '20px',
          }}>
            <div style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>
              MONTHLY SALES TOP 10
            </div>
            <div style={{ ...mono, fontSize: '13px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', color: '#928374', gap: '0' }}>
                <span style={{ width: '48px', textAlign: 'right' }}>RANK</span>
                <span style={{ width: '16px' }}></span>
                <span style={{ flex: '0 0 220px' }}>MODEL</span>
                <span style={{ width: '60px', textAlign: 'right' }}>SALES</span>
                <span style={{ width: '16px' }}></span>
                <span>BAR</span>
              </div>
              <div style={{ color: '#504945', whiteSpace: 'pre' }}>{'  ' + '-'.repeat(56)}</div>
              {topModels.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '0' }}>
                  <span style={{ width: '48px', textAlign: 'right', color: '#928374' }}>#{m.rank}</span>
                  <span style={{ width: '16px' }}></span>
                  <span style={{ flex: '0 0 220px' }}>{m.model}</span>
                  <span style={{ width: '60px', textAlign: 'right', color: '#fabd2f' }}>{m.sales.toLocaleString()}</span>
                  <span style={{ width: '16px' }}></span>
                  <span style={{ whiteSpace: 'pre' }}>{bar(m.sales, maxSales, 16)}</span>
                </div>
              ))}
              <div style={{ color: '#504945', whiteSpace: 'pre' }}>{'  ' + '-'.repeat(56)}</div>
            </div>
          </div>
        </section>

        {/* CC Tier Overview */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>data --cc-tiers</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '12px',
          }}>
            {ccTiers.map((tier, i) => (
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
                  <span style={{ color: '#fabd2f', marginLeft: '8px' }}>{tier.sales.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '12px', whiteSpace: 'pre', color: '#b8f53e' }}>
                  {bar(tier.sales, tier.total, 24)}{' '}
                  <span style={{ color: '#928374' }}>{Math.round((tier.sales / tier.total) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Navigation */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>ls ./data/</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { href: '/data/sales', sym: '>_', label: 'sales/', desc: '銷售排行' },
              { href: '/data/brands', sym: '/^', label: 'brands/', desc: '品牌分析' },
              { href: '/rankings', sym: '#1', label: 'rankings/', desc: '排行榜' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '4px',
                padding: '14px 20px',
                textDecoration: 'none',
                color: '#ebdbb2',
                transition: 'all 0.2s',
                flex: '1',
                minWidth: '200px',
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
