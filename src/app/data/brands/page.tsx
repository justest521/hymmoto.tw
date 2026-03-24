'use client';

import React, { useState } from 'react';

interface BrandData {
  name: string;
  marketShare: number;
  totalSales: number;
  color: string;
  topModels: Array<{ name: string; sales: number }>;
  trend: number;
  prevYear: number;
}

const BrandsPage: React.FC = () => {
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  const brandData: BrandData[] = [
    {
      name: 'KYMCO',
      marketShare: 30.2,
      totalSales: 57840,
      color: '#b8f53e',
      topModels: [
        { name: 'Activ125', sales: 5234 },
        { name: 'DOWNTOWN170i', sales: 4156 },
        { name: 'K-Pipe125', sales: 3890 },
      ],
      trend: 3.2,
      prevYear: 28.5,
    },
    {
      name: 'SYM',
      marketShare: 28.5,
      totalSales: 54560,
      color: '#fabd2f',
      topModels: [
        { name: 'VF3i', sales: 6123 },
        { name: 'GTS300i', sales: 5401 },
        { name: 'Jetpower110', sales: 3876 },
      ],
      trend: 2.8,
      prevYear: 27.1,
    },
    {
      name: 'YAMAHA',
      marketShare: 22.1,
      totalSales: 42345,
      color: '#fb4934',
      topModels: [
        { name: 'JOG', sales: 3245 },
        { name: 'FORCE155', sales: 2890 },
        { name: 'CYGNUS-X', sales: 2234 },
      ],
      trend: -1.5,
      prevYear: 23.2,
    },
    {
      name: 'GOGORO',
      marketShare: 6.8,
      totalSales: 13045,
      color: '#3b82f6',
      topModels: [
        { name: 'GOGORO 3', sales: 4234 },
        { name: 'GOGORO 2', sales: 3892 },
        { name: 'GOGORO S', sales: 2134 },
      ],
      trend: 5.2,
      prevYear: 3.8,
    },
    {
      name: 'HONDA',
      marketShare: 4.2,
      totalSales: 8043,
      color: '#ef4444',
      topModels: [
        { name: 'PCX160', sales: 2890 },
        { name: 'CB150R', sales: 1987 },
        { name: 'Dio110', sales: 1312 },
      ],
      trend: -2.3,
      prevYear: 5.1,
    },
    {
      name: '其他',
      marketShare: 8.2,
      totalSales: 15710,
      color: '#928374',
      topModels: [
        { name: 'SUZUKI LETS4', sales: 1201 },
        { name: 'AEON Pony110', sales: 1098 },
        { name: 'SUZUKI AN110', sales: 543 },
      ],
      trend: 1.2,
      prevYear: 6.8,
    },
  ];

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#1d2021',
    color: '#ebdbb2',
    fontFamily: "'JetBrains Mono', monospace",
    minHeight: '100vh',
    padding: '40px 20px',
    textAlign: 'center',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '48px',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Orbitron', monospace",
    fontSize: '36px',
    fontWeight: 700,
    letterSpacing: '3px',
    color: '#ebdbb2',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#928374',
    fontFamily: "'Noto Sans TC', sans-serif",
    margin: '0',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "'Orbitron', monospace",
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#ebdbb2',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    textAlign: 'center',
  };

  const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#928374',
    fontFamily: "'Noto Sans TC', sans-serif",
    marginBottom: '24px',
    textAlign: 'center',
  };

  const shareBarContainerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto 48px',
  };

  const barRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  };

  const brandNameStyle: React.CSSProperties = {
    width: '80px',
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'right',
    color: '#ebdbb2',
  };

  const barTrackStyle: React.CSSProperties = {
    flex: 1,
    height: '20px',
    backgroundColor: '#282828',
    border: '1px solid #3c3836',
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative',
  };

  const getBarFillStyle = (percentage: number): React.CSSProperties => ({
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: brandData.find((b) => b.marketShare === percentage)?.color || '#b8f53e',
    transition: 'all 0.4s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '6px',
  });

  const percentageStyle: React.CSSProperties = {
    width: '50px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#ebdbb2',
    textAlign: 'left',
  };

  const brandCardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto 48px',
  };

  const brandCardStyle: React.CSSProperties = {
    backgroundColor: '#282828',
    border: '1px solid #3c3836',
    padding: '20px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const getBrandCardHoverStyle = (brandName: string): React.CSSProperties => {
    if (hoveredBrand === brandName) {
      return {
        ...brandCardStyle,
        borderColor: '#b8f53e',
        boxShadow: '0 0 12px rgba(184, 245, 62, 0.15)',
      };
    }
    return brandCardStyle;
  };

  const cardBrandNameStyle: React.CSSProperties = {
    fontFamily: "'Orbitron', monospace",
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#ebdbb2',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
  };

  const cardShareStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#b8f53e',
    margin: '0 0 4px 0',
  };

  const cardShareLabelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#928374',
    fontFamily: "'Noto Sans TC', sans-serif",
    marginBottom: '12px',
  };

  const topModelsStyle: React.CSSProperties = {
    borderTop: '1px solid #3c3836',
    paddingTop: '12px',
    marginTop: '12px',
  };

  const modelItemStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#ebdbb2',
    fontFamily: "'Noto Sans TC', sans-serif",
    marginBottom: '6px',
    textAlign: 'left',
  };

  const trendStyle = (trend: number): React.CSSProperties => ({
    fontSize: '11px',
    color: trend > 0 ? '#b8f53e' : '#fb4934',
    fontWeight: 700,
  });

  const comparisonGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto 48px',
  };

  const comparisonCardStyle: React.CSSProperties = {
    backgroundColor: '#282828',
    border: '1px solid #3c3836',
    padding: '16px',
    borderRadius: '4px',
  };

  const comparisonBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    alignItems: 'flex-end',
  };

  const comparisonBarItemStyle = (height: number): React.CSSProperties => ({
    flex: 1,
    height: `${height}px`,
    backgroundColor: '#b8f53e',
    borderRadius: '2px',
  });

  const insightsBoxStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#282828',
    border: '1px solid #3c3836',
    padding: '20px',
    borderRadius: '4px',
  };

  const insightListStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#ebdbb2',
    fontFamily: "'Noto Sans TC', sans-serif",
    lineHeight: '1.8',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <section style={headerStyle}>
        <h1 style={titleStyle}>BRAND ANALYSIS</h1>
        <p style={subtitleStyle}>品牌市佔率深度分析</p>
      </section>

      {/* Market Share Bars Section */}
      <section style={shareBarContainerStyle}>
        <h2 style={sectionTitleStyle}>MARKET SHARE</h2>
        <p style={sectionSubtitleStyle}>品牌市佔率排行</p>

        {brandData.map((brand) => (
          <div key={brand.name} style={barRowStyle}>
            <div style={brandNameStyle}>{brand.name}</div>
            <div style={barTrackStyle}>
              <div
                style={getBarFillStyle(brand.marketShare)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
              >
                <span style={{ fontSize: '10px', color: '#1d2021', fontWeight: 700 }}>
                  {brand.marketShare.toFixed(1)}%
                </span>
              </div>
            </div>
            <div style={percentageStyle}>{brand.marketShare.toFixed(1)}%</div>
          </div>
        ))}
      </section>

      {/* Brand Cards Section */}
      <section>
        <h2 style={sectionTitleStyle}>BRAND PROFILES</h2>
        <p style={sectionSubtitleStyle}>品牌詳細資訊</p>

        <div style={brandCardGridStyle}>
          {brandData.slice(0, 6).map((brand) => (
            <div
              key={brand.name}
              style={getBrandCardHoverStyle(brand.name)}
              onMouseEnter={() => setHoveredBrand(brand.name)}
              onMouseLeave={() => setHoveredBrand(null)}
            >
              <h3 style={cardBrandNameStyle}>{brand.name}</h3>

              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: brand.color,
                  borderRadius: '4px',
                  margin: '0 auto 12px',
                  opacity: 0.8,
                }}
              ></div>

              <div style={cardShareStyle}>{brand.marketShare.toFixed(1)}%</div>
              <div style={cardShareLabelStyle}>市場佔有率</div>

              <div style={{ fontSize: '13px', color: '#ebdbb2', fontWeight: 700, marginBottom: '12px' }}>
                {brand.totalSales.toLocaleString()} 台
              </div>
              <div style={{ fontSize: '10px', color: '#928374', fontFamily: "'Noto Sans TC', sans-serif", marginBottom: '12px' }}>
                累計銷量
              </div>

              <div style={topModelsStyle}>
                <div style={{ fontSize: '10px', color: '#928374', fontFamily: "'Noto Sans TC', sans-serif", marginBottom: '8px', fontWeight: 700 }}>
                  TOP 3 MODELS
                </div>
                {brand.topModels.map((model, idx) => (
                  <div key={idx} style={modelItemStyle}>
                    {idx + 1}. {model.name} ({model.sales})
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '12px', ...trendStyle(brand.trend) }}>
                {brand.trend > 0 ? '↑' : '↓'} {Math.abs(brand.trend)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Year-over-Year Comparison */}
      <section>
        <h2 style={sectionTitleStyle}>YEAR-OVER-YEAR</h2>
        <p style={sectionSubtitleStyle}>2025 vs 2026 市佔率對比</p>

        <div style={comparisonGridStyle}>
          {brandData.slice(0, 6).map((brand) => {
            const maxValue = Math.max(brand.marketShare, brand.prevYear);
            const curr = (brand.marketShare / maxValue) * 120;
            const prev = (brand.prevYear / maxValue) * 120;

            return (
              <div key={brand.name} style={comparisonCardStyle}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ebdbb2' }}>
                  {brand.name}
                </div>
                <div style={comparisonBarStyle}>
                  <div style={comparisonBarItemStyle(prev)}></div>
                  <div style={{ ...comparisonBarItemStyle(curr), backgroundColor: '#fabd2f' }}></div>
                </div>
                <div style={{ fontSize: '10px', color: '#928374', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>2025: {brand.prevYear.toFixed(1)}%</span>
                  <span>2026: {brand.marketShare.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Insights Box */}
      <section>
        <h2 style={sectionTitleStyle}>KEY INSIGHTS</h2>
        <p style={sectionSubtitleStyle}>關鍵數據洞察</p>

        <div style={insightsBoxStyle}>
          <ul style={{ ...insightListStyle, listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              • KYMCO 與 SYM 合占市場 58.7%，龍頭地位穩固
            </li>
            <li style={{ marginBottom: '8px' }}>
              • 電動機車品牌 GOGORO 年增幅 5.2%，成長最快
            </li>
            <li style={{ marginBottom: '8px' }}>
              • TOP 3 品牌（KYMCO/SYM/YAMAHA）市佔率 80.8%，市場集中度高
            </li>
            <li style={{ marginBottom: '8px' }}>
              • 其他小品牌合計 8.2%，市場仍有多元化空間
            </li>
            <li>
              • 傳統燃油機車仍占市場 91.8%，綠能轉型加速中
            </li>
          </ul>
        </div>
      </section>

      {/* Footer Spacer */}
      <div style={{ height: '40px' }}></div>
    </div>
  );
};

export default BrandsPage;
