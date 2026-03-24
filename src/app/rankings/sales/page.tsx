'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Ranking {
  rank: number;
  model: string;
  brand: string;
  cc: string;
  sales: number;
  marketShare: string;
  change: number;
}

export default function SalesRankingsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const ccClasses = [
    { id: 'all', label: '全部' },
    { id: '50cc', label: '50cc' },
    { id: '125cc', label: '125cc' },
    { id: '150cc', label: '150cc' },
    { id: '250cc', label: '250cc' },
    { id: '300cc+', label: '300cc+' }
  ];

  const fullRankingData: Ranking[] = [
    { rank: 1, model: 'KYMCO 新K1', brand: 'KYMCO', cc: '125cc', sales: 3245, marketShare: '8.2%', change: 12 },
    { rank: 2, model: 'YAMAHA FORCE', brand: 'YAMAHA', cc: '150cc', sales: 2890, marketShare: '7.3%', change: 5 },
    { rank: 3, model: 'HONDA CB150R', brand: 'HONDA', cc: '150cc', sales: 2567, marketShare: '6.5%', change: -3 },
    { rank: 4, model: 'SYM VF3i', brand: 'SYM', cc: '125cc', sales: 2345, marketShare: '5.9%', change: 8 },
    { rank: 5, model: 'YAMAHA CYGNUS-X', brand: 'YAMAHA', cc: '125cc', sales: 2123, marketShare: '5.4%', change: 2 },
    { rank: 6, model: 'HONDA PCX160', brand: 'HONDA', cc: '160cc', sales: 1987, marketShare: '5.0%', change: -1 },
    { rank: 7, model: 'SUZUKI GSX-R150', brand: 'SUZUKI', cc: '150cc', sales: 1756, marketShare: '4.4%', change: 3 },
    { rank: 8, model: 'KYMCO DOWNTOWN170i', brand: 'KYMCO', cc: '170cc', sales: 1645, marketShare: '4.2%', change: 6 },
    { rank: 9, model: 'SYM GTS300i', brand: 'SYM', cc: '300cc', sales: 1534, marketShare: '3.9%', change: 4 },
    { rank: 10, model: 'AEON ELITE', brand: 'AEON', cc: '125cc', sales: 1423, marketShare: '3.6%', change: -2 },
    { rank: 11, model: 'HONDA Dio110', brand: 'HONDA', cc: '110cc', sales: 1312, marketShare: '3.3%', change: 1 },
    { rank: 12, model: 'SUZUKI LETS4', brand: 'SUZUKI', cc: '110cc', sales: 1201, marketShare: '3.0%', change: 0 },
    { rank: 13, model: 'YAMAHA BWSX', brand: 'YAMAHA', cc: '125cc', sales: 1098, marketShare: '2.8%', change: -4 },
    { rank: 14, model: 'KYMCO K-Pipe125', brand: 'KYMCO', cc: '125cc', sales: 987, marketShare: '2.5%', change: 2 },
    { rank: 15, model: 'SYM JETPOWER', brand: 'SYM', cc: '110cc', sales: 876, marketShare: '2.2%', change: -1 },
    { rank: 16, model: 'HONDA LEAD110', brand: 'HONDA', cc: '110cc', sales: 765, marketShare: '1.9%', change: 3 },
    { rank: 17, model: 'KAWASAKI NINJA', brand: 'KAWASAKI', cc: '250cc', sales: 654, marketShare: '1.7%', change: 5 },
    { rank: 18, model: 'YAMAHA MT-07', brand: 'YAMAHA', cc: '700cc', sales: 543, marketShare: '1.4%', change: 7 },
    { rank: 19, model: 'APRILIA RSV4', brand: 'APRILIA', cc: '1000cc', sales: 432, marketShare: '1.1%', change: 2 },
    { rank: 20, model: 'DUCATI PANIGALE', brand: 'DUCATI', cc: '1200cc', sales: 321, marketShare: '0.8%', change: 4 }
  ];

  const podiumData = fullRankingData.slice(0, 3);
  const totalSales = fullRankingData.reduce((sum, item) => sum + item.sales, 0);

  const getRankColor = (rank: number) => {
    if (rank === 1) return { border: '#fabd2f', bg: '#fabd2f20', medal: '🥇' };
    if (rank === 2) return { border: '#a8a8b0', bg: '#a8a8b020', medal: '🥈' };
    if (rank === 3) return { border: '#cd7f32', bg: '#cd7f3220', medal: '🥉' };
    return { border: '#3c3836', bg: 'transparent', medal: '' };
  };

  return (
    <div style={{
      backgroundColor: '#1d2021',
      color: '#ebdbb2',
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Header */}
      <section style={{
        backgroundColor: '#282828',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '2px solid #3c3836'
      }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          color: '#ebdbb2',
          letterSpacing: '4px'
        }}>SALES KING</h1>
        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '24px',
          margin: '0 0 8px 0',
          color: '#b8f53e'
        }}>銷售排行榜</h2>
        <p style={{
          fontSize: '14px',
          color: '#928374',
          margin: '0',
          letterSpacing: '1px'
        }}>2026-03 月份數據</p>
      </section>

      {/* Filter Bar */}
      <section style={{
        padding: '20px',
        backgroundColor: '#282828',
        borderBottom: '2px solid #3c3836',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 12px 0', textAlign: 'center' }}>CC分級</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {ccClasses.map((cc) => (
            <button
              key={cc.id}
              onClick={() => setActiveTab(cc.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === cc.id ? '#b8f53e' : 'transparent',
                color: activeTab === cc.id ? '#1d2021' : '#ebdbb2',
                border: `1px solid ${activeTab === cc.id ? '#b8f53e' : '#3c3836'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: activeTab === cc.id ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {cc.label}
            </button>
          ))}
        </div>
      </section>

      {/* Podium Section */}
      <section style={{
        padding: '40px 20px',
        backgroundColor: '#282828',
        borderBottom: '2px solid #3c3836',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '28px',
          margin: '0 0 30px 0',
          color: '#ebdbb2',
          letterSpacing: '2px'
        }}>TOP 3 領獎台</h2>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'flex-end' }}>
          {/* 2nd Place */}
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <div style={{
              backgroundColor: '#1d2021',
              border: `3px solid ${getRankColor(2).border}`,
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{getRankColor(2).medal}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ebdbb2' }}>{podiumData[1].model}</h3>
              <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 12px 0' }}>{podiumData[1].brand}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#b8f53e' }}>{podiumData[1].sales.toLocaleString()}</p>
            </div>
            <div style={{ backgroundColor: '#a8a8b020', padding: '12px', borderRadius: '4px', fontSize: '32px', fontWeight: 'bold', color: '#a8a8b0' }}>2</div>
          </div>

          {/* 1st Place */}
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <div style={{
              backgroundColor: '#1d2021',
              border: `3px solid ${getRankColor(1).border}`,
              padding: '28px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: `0 0 20px ${getRankColor(1).border}40`
            }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>{getRankColor(1).medal}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ebdbb2' }}>{podiumData[0].model}</h3>
              <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 12px 0' }}>{podiumData[0].brand}</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#b8f53e' }}>{podiumData[0].sales.toLocaleString()}</p>
            </div>
            <div style={{ backgroundColor: '#fabd2f20', padding: '16px', borderRadius: '4px', fontSize: '40px', fontWeight: 'bold', color: '#fabd2f' }}>1</div>
          </div>

          {/* 3rd Place */}
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <div style={{
              backgroundColor: '#1d2021',
              border: `3px solid ${getRankColor(3).border}`,
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{getRankColor(3).medal}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ebdbb2' }}>{podiumData[2].model}</h3>
              <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 12px 0' }}>{podiumData[2].brand}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#b8f53e' }}>{podiumData[2].sales.toLocaleString()}</p>
            </div>
            <div style={{ backgroundColor: '#cd7f3220', padding: '12px', borderRadius: '4px', fontSize: '32px', fontWeight: 'bold', color: '#cd7f32' }}>3</div>
          </div>
        </div>
      </section>

      {/* Full Ranking Table */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '24px',
          margin: '0 0 24px 0',
          color: '#ebdbb2',
          textAlign: 'center',
          letterSpacing: '2px'
        }}>完整排行榜</h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #3c3836', backgroundColor: '#282828' }}>
                <th style={{ padding: '12px', textAlign: 'center', color: '#928374', fontWeight: 'bold', width: '8%' }}>排名</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#928374', fontWeight: 'bold', width: '22%' }}>車款</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#928374', fontWeight: 'bold', width: '14%' }}>品牌</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#928374', fontWeight: 'bold', width: '10%' }}>CC</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#928374', fontWeight: 'bold', width: '14%' }}>銷售量</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#928374', fontWeight: 'bold', width: '12%' }}>市場佔比</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#928374', fontWeight: 'bold', width: '10%' }}>變化</th>
              </tr>
            </thead>
            <tbody>
              {fullRankingData.map((item, idx) => {
                const bgColor = idx % 2 === 0 ? '#1d2021' : '#282828';
                const rankColor = getRankColor(item.rank);
                const changeColor = item.change > 0 ? '#b8f53e' : item.change < 0 ? '#fb4934' : '#928374';
                return (
                  <tr key={item.rank} style={{
                    backgroundColor: bgColor,
                    borderBottom: `1px solid #3c3836`,
                    borderLeft: `3px solid ${rankColor.border}`
                  }}>
                    <td style={{ padding: '12px', textAlign: 'center', color: rankColor.border, fontWeight: 'bold' }}>
                      {item.rank <= 3 ? rankColor.medal : ''} #{item.rank}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left', color: '#ebdbb2', fontWeight: '500' }}>{item.model}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#a8a8b0' }}>{item.brand}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#928374' }}>{item.cc}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#b8f53e', fontWeight: 'bold' }}>
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: '#b8f53e20',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '0',
                          height: '100%',
                          backgroundColor: '#b8f53e10',
                          borderRadius: '4px',
                          width: `${(item.sales / fullRankingData[0].sales) * 100}%`
                        }} />
                        <span style={{ position: 'relative', zIndex: 1 }}>{item.sales.toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#a8a8b0' }}>{item.marketShare}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: changeColor, fontWeight: 'bold' }}>
                      {item.change > 0 ? '↑' : item.change < 0 ? '↓' : '→'} {Math.abs(item.change)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Summary Stats */}
      <section style={{
        padding: '40px 20px',
        backgroundColor: '#282828',
        borderTop: '2px solid #3c3836',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '20px',
          margin: '0 0 24px 0',
          color: '#ebdbb2',
          letterSpacing: '2px'
        }}>市場統計</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: '#1d2021', padding: '16px', borderRadius: '8px', border: '1px solid #3c3836' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>總銷量</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#b8f53e', margin: '0' }}>{totalSales.toLocaleString()}</p>
            <p style={{ fontSize: '11px', color: '#928374', margin: '4px 0 0 0' }}>台/月</p>
          </div>
          <div style={{ backgroundColor: '#1d2021', padding: '16px', borderRadius: '8px', border: '1px solid #3c3836' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>平均銷量</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fabd2f', margin: '0' }}>{Math.round(totalSales / fullRankingData.length).toLocaleString()}</p>
            <p style={{ fontSize: '11px', color: '#928374', margin: '4px 0 0 0' }}>台/車款</p>
          </div>
          <div style={{ backgroundColor: '#1d2021', padding: '16px', borderRadius: '8px', border: '1px solid #3c3836' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>排行車款</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fb4934', margin: '0' }}>{fullRankingData.length}</p>
            <p style={{ fontSize: '11px', color: '#928374', margin: '4px 0 0 0' }}>款/本月</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#928374',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0', letterSpacing: '1px' }}>數據更新 2026-03-24 23:59 | 資料來源: Taiwan Insurance & Dealership Database</p>
      </section>
    </div>
  );
}
