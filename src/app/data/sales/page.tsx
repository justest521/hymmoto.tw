'use client';

import React, { useState } from 'react';

interface SalesData {
  rank: number;
  brand: string;
  model: string;
  cc: string;
  sales: number;
  marketShare: number;
  monthGrowth: number;
}

const SalesPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [selectedCc, setSelectedCc] = useState('all');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const mockData: SalesData[] = [
    { rank: 1, brand: 'YAMAHA', model: 'JOG', cc: '125', sales: 3245, marketShare: 8.2, monthGrowth: 12.5 },
    { rank: 2, brand: 'HONDA', model: 'PCX160', cc: '160', sales: 2890, marketShare: 7.3, monthGrowth: -2.3 },
    { rank: 3, brand: 'SYM', model: 'VF3i', cc: '125', sales: 2567, marketShare: 6.5, monthGrowth: 5.8 },
    { rank: 4, brand: 'KYMCO', model: 'Activ125', cc: '125', sales: 2345, marketShare: 5.9, monthGrowth: 3.2 },
    { rank: 5, brand: 'YAMAHA', model: 'FORCE155', cc: '155', sales: 2123, marketShare: 5.4, monthGrowth: -1.5 },
    { rank: 6, brand: 'HONDA', model: 'CB150R', cc: '150', sales: 1987, marketShare: 5.0, monthGrowth: 8.7 },
    { rank: 7, brand: 'SUZUKI', model: 'GSX-R150', cc: '150', sales: 1756, marketShare: 4.4, monthGrowth: 6.2 },
    { rank: 8, brand: 'KYMCO', model: 'DOWNTOWN170i', cc: '170', sales: 1645, marketShare: 4.2, monthGrowth: -3.1 },
    { rank: 9, brand: 'SYM', model: 'GTS300i', cc: '300', sales: 1534, marketShare: 3.9, monthGrowth: 11.3 },
    { rank: 10, brand: 'YAMAHA', model: 'CYGNUS-X', cc: '125', sales: 1423, marketShare: 3.6, monthGrowth: 2.1 },
    { rank: 11, brand: 'HONDA', model: 'Dio110', cc: '110', sales: 1312, marketShare: 3.3, monthGrowth: -4.2 },
    { rank: 12, brand: 'SUZUKI', model: 'LETS4', cc: '110', sales: 1201, marketShare: 3.0, monthGrowth: 1.8 },
    { rank: 13, brand: 'AEON', model: 'Pony110', cc: '110', sales: 1098, marketShare: 2.8, monthGrowth: 7.5 },
    { rank: 14, brand: 'KYMCO', model: 'K-Pipe125', cc: '125', sales: 987, marketShare: 2.5, monthGrowth: 4.3 },
    { rank: 15, brand: 'YAMAHA', model: 'BWSX', cc: '125', sales: 876, marketShare: 2.2, monthGrowth: 9.1 },
    { rank: 16, brand: 'SYM', model: 'Jetpower110', cc: '110', sales: 765, marketShare: 1.9, monthGrowth: 0.5 },
    { rank: 17, brand: 'HONDA', model: 'LEAD110', cc: '110', sales: 654, marketShare: 1.7, monthGrowth: -2.8 },
    { rank: 18, brand: 'SUZUKI', model: 'AN110', cc: '110', sales: 543, marketShare: 1.4, monthGrowth: 3.6 },
    { rank: 19, brand: 'KYMCO', model: 'Rectrix150', cc: '150', sales: 432, marketShare: 1.1, monthGrowth: 6.9 },
    { rank: 20, brand: 'AEON', model: 'Sense110', cc: '110', sales: 321, marketShare: 0.8, monthGrowth: -1.2 },
  ];

  const months = ['2026-03', '2026-02', '2026-01', '2025-12', '2025-11', '2025-10'];
  const ccCategories = [
    { label: '全部', value: 'all' },
    { label: '125cc', value: '125' },
    { label: '150-250cc', value: '150-250' },
    { label: '251-550cc', value: '251-550' },
    { label: '551-1000cc', value: '551-1000' },
    { label: '1000cc+', value: '1000+' },
    { label: '電動', value: 'electric' },
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
    marginBottom: '32px',
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

  const controlsStyle: React.CSSProperties = {
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const monthButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const monthButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    border: '1px solid',
    borderColor: isActive ? '#b8f53e' : '#3c3836',
    backgroundColor: isActive ? '#b8f53e' : '#282828',
    color: isActive ? '#1d2021' : '#ebdbb2',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  });

  const ccTabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const ccTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    border: '1px solid',
    borderColor: isActive ? '#fabd2f' : '#3c3836',
    backgroundColor: isActive ? '#fabd2f' : '#282828',
    color: isActive ? '#1d2021' : '#ebdbb2',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  });

  const tableContainerStyle: React.CSSProperties = {
    backgroundColor: '#282828',
    border: '1px solid #3c3836',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '24px',
    maxWidth: '1200px',
    margin: '0 auto 24px',
  };

  const tableHeaderStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '6% 14% 16% 12% 14% 14% 14%',
    backgroundColor: '#1d2021',
    borderBottom: '1px solid #3c3836',
    padding: '12px 8px',
    fontSize: '11px',
    color: '#928374',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const tableBodyStyle: React.CSSProperties = {
    maxHeight: '600px',
    overflowY: 'auto',
  };

  const getRowStyle = (rank: number, isHovered: boolean): React.CSSProperties => {
    let borderLeftColor = '#3c3836';
    if (rank === 1) borderLeftColor = '#fabd2f';
    else if (rank === 2) borderLeftColor = '#b8b8b8';
    else if (rank === 3) borderLeftColor = '#d4913d';

    return {
      display: 'grid',
      gridTemplateColumns: '6% 14% 16% 12% 14% 14% 14%',
      padding: '12px 8px',
      fontSize: '12px',
      borderBottom: '1px solid #3c3836',
      borderLeft: `3px solid ${borderLeftColor}`,
      backgroundColor: isHovered ? 'rgba(184, 245, 62, 0.08)' : '#282828',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    };
  };

  const cellStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const rankBadgeStyle = (rank: number): React.CSSProperties => {
    let bg = '#1d2021';
    let color = '#ebdbb2';
    if (rank === 1) {
      bg = 'rgba(245, 214, 62, 0.2)';
      color = '#fabd2f';
    } else if (rank === 2) {
      bg = 'rgba(184, 184, 184, 0.2)';
      color = '#b8b8b8';
    } else if (rank === 3) {
      bg = 'rgba(212, 145, 61, 0.2)';
      color = '#d4913d';
    }
    return {
      padding: '4px 8px',
      backgroundColor: bg,
      color: color,
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: 700,
    };
  };

  const positiveStyle: React.CSSProperties = {
    color: '#b8f53e',
  };

  const negativeStyle: React.CSSProperties = {
    color: '#fb4934',
  };

  const filteredData = mockData;
  const totalSales = filteredData.reduce((sum, row) => sum + row.sales, 0);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <section style={headerStyle}>
        <h1 style={titleStyle}>SALES RANKINGS</h1>
        <p style={subtitleStyle}>月度銷售排行 · {selectedMonth}</p>
      </section>

      {/* Controls */}
      <div style={controlsStyle}>
        {/* Month Selector */}
        <div style={monthButtonsStyle}>
          {months.map((month) => (
            <button
              key={month}
              style={monthButtonStyle(selectedMonth === month)}
              onClick={() => setSelectedMonth(month)}
              onMouseEnter={(e) => {
                if (selectedMonth !== month) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#b8f53e';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMonth !== month) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                }
              }}
            >
              {month}
            </button>
          ))}
        </div>

        {/* CC Category Tabs */}
        <div style={ccTabsStyle}>
          {ccCategories.map((cat) => (
            <button
              key={cat.value}
              style={ccTabStyle(selectedCc === cat.value)}
              onClick={() => setSelectedCc(cat.value)}
              onMouseEnter={(e) => {
                if (selectedCc !== cat.value) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#fabd2f';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCc !== cat.value) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking Table */}
      <div style={tableContainerStyle}>
        <div style={tableHeaderStyle}>
          <div style={cellStyle}>#</div>
          <div style={cellStyle}>車型</div>
          <div style={cellStyle}>品牌</div>
          <div style={cellStyle}>級距</div>
          <div style={cellStyle}>銷量</div>
          <div style={cellStyle}>市佔%</div>
          <div style={cellStyle}>變化</div>
        </div>

        <div style={tableBodyStyle}>
          {filteredData.map((row) => (
            <div
              key={row.rank}
              style={getRowStyle(row.rank, hoveredRow === row.rank)}
              onMouseEnter={() => setHoveredRow(row.rank)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div style={cellStyle}>
                <div style={rankBadgeStyle(row.rank)}>#{row.rank}</div>
              </div>
              <div style={cellStyle}>{row.model}</div>
              <div style={cellStyle}>{row.brand}</div>
              <div style={cellStyle}>{row.cc}cc</div>
              <div style={cellStyle}>{row.sales.toLocaleString()}</div>
              <div style={cellStyle}>{row.marketShare.toFixed(1)}%</div>
              <div style={cellStyle}>
                <span style={row.monthGrowth > 0 ? positiveStyle : negativeStyle}>
                  {row.monthGrowth > 0 ? '+' : ''}{row.monthGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '6% 14% 16% 12% 14% 14% 14%',
            padding: '12px 8px',
            backgroundColor: '#1d2021',
            borderTop: '1px solid #3c3836',
            fontSize: '12px',
            fontWeight: 700,
            color: '#b8f53e',
          }}
        >
          <div style={cellStyle}></div>
          <div style={cellStyle}></div>
          <div style={cellStyle}>TOTAL</div>
          <div style={cellStyle}></div>
          <div style={cellStyle}>{totalSales.toLocaleString()}</div>
          <div style={cellStyle}>100.0%</div>
          <div style={cellStyle}></div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px',
          backgroundColor: '#282828',
          border: '1px solid #3c3836',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#928374',
        }}
      >
        <div style={{ marginBottom: '8px' }}>共 {filteredData.length} 款車型 | 總銷量 {totalSales.toLocaleString()} 台</div>
        <div>數據更新時間: {selectedMonth} · HYMMOTO 市場監測系統</div>
      </div>
    </div>
  );
};

export default SalesPage;
