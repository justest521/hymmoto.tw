'use client';

import Link from 'next/link';

function bar(value: number, max: number, width: number = 16): string {
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

function visualWidth(str: string): number {
  let w = 0
  for (const ch of str) { w += ch.charCodeAt(0) > 0x7f ? 2 : 1 }
  return w
}

function padEndCJK(str: string, len: number): string {
  const diff = len - visualWidth(str)
  return diff > 0 ? str + ' '.repeat(diff) : str
}

export default function RankingsPage() {
  const salesTop = [
    { rank: 1,  model: 'KYMCO 新K1 150',       sales: 2202 },
    { rank: 2,  model: 'YAMAHA FORCE 2.0',      sales: 1891 },
    { rank: 3,  model: 'SYM JET SL+',           sales: 1756 },
    { rank: 4,  model: 'KYMCO GP125',            sales: 1698 },
    { rank: 5,  model: 'YAMAHA LIMI 125',        sales: 1542 },
  ];

  const powerTop = [
    { rank: 1, model: 'DUCATI PANIGALE V4',  hp: 215 },
    { rank: 2, model: 'APRILIA RSV4',        hp: 210 },
    { rank: 3, model: 'BMW S1000RR',         hp: 205 },
    { rank: 4, model: 'KAWASAKI ZX-10R',     hp: 203 },
    { rank: 5, model: 'YAMAHA YZF-R1',       hp: 200 },
  ];

  const valueTop = [
    { rank: 1, model: 'YAMAHA MT-07',       score: 9.2 },
    { rank: 2, model: 'KAWASAKI NINJA 400', score: 9.0 },
    { rank: 3, model: 'SYM JET SL+',        score: 8.8 },
    { rank: 4, model: 'HONDA CB500F',       score: 8.7 },
    { rank: 5, model: 'KTM 390 DUKE',       score: 8.5 },
  ];

  const trendingTop = [
    { rank: 1, model: 'GOGORO CROSSOVER',   mentions: 12800 },
    { rank: 2, model: 'YAMAHA MT-09 SP',    mentions: 9650 },
    { rank: 3, model: 'BMW R1300GS',        mentions: 8900 },
    { rank: 4, model: 'KTM 990 DUKE',       mentions: 7200 },
    { rank: 5, model: 'HONDA TRANSALP',     mentions: 6100 },
  ];

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
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>rankings --all</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
            RANKINGS
          </h1>
          <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            多維度車款排名系統 · 2026-03
          </div>
        </div>

        {/* 4-panel Rankings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '40px' }}>

          {/* Sales King */}
          <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '16px' }}>#1 SALES KING</span>
                <span style={{ color: '#928374', fontSize: '12px', marginLeft: '8px', fontFamily: "'Noto Sans TC', sans-serif" }}>銷售王</span>
              </div>
              <Link href="/rankings/sales" style={{ color: '#b8f53e', fontSize: '11px', textDecoration: 'none' }}>VIEW ALL →</Link>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '2' }}>
              {salesTop.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '28px', textAlign: 'right', color: '#928374' }}>#{m.rank}</span>
                  <span style={{ width: '8px' }}></span>
                  <span style={{ flex: '0 0 170px' }}>{m.model}</span>
                  <span style={{ width: '50px', textAlign: 'right', color: '#fabd2f' }}>{m.sales.toLocaleString()}</span>
                  <span style={{ width: '8px' }}></span>
                  <span>{bar(m.sales, 2202)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Power King */}
          <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#fabd2f', fontWeight: 'bold', fontSize: '16px' }}>{'>>'} POWER KING</span>
                <span style={{ color: '#928374', fontSize: '12px', marginLeft: '8px', fontFamily: "'Noto Sans TC', sans-serif" }}>動力王</span>
              </div>
              <Link href="/rankings/power" style={{ color: '#fabd2f', fontSize: '11px', textDecoration: 'none' }}>VIEW ALL →</Link>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '2' }}>
              {powerTop.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '28px', textAlign: 'right', color: '#928374' }}>#{m.rank}</span>
                  <span style={{ width: '8px' }}></span>
                  <span style={{ flex: '0 0 170px' }}>{m.model}</span>
                  <span style={{ width: '50px', textAlign: 'right', color: '#fabd2f' }}>{m.hp}hp</span>
                  <span style={{ width: '8px' }}></span>
                  <span>{bar(m.hp, 215)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value King */}
          <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#fb4934', fontWeight: 'bold', fontSize: '16px' }}>$&gt; VALUE KING</span>
                <span style={{ color: '#928374', fontSize: '12px', marginLeft: '8px', fontFamily: "'Noto Sans TC', sans-serif" }}>CP值王</span>
              </div>
              <Link href="/rankings/value" style={{ color: '#fb4934', fontSize: '11px', textDecoration: 'none' }}>VIEW ALL →</Link>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '2' }}>
              {valueTop.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '28px', textAlign: 'right', color: '#928374' }}>#{m.rank}</span>
                  <span style={{ width: '8px' }}></span>
                  <span style={{ flex: '0 0 170px' }}>{m.model}</span>
                  <span style={{ width: '56px', textAlign: 'right', color: '#fabd2f' }}>{m.score.toFixed(1)}/10</span>
                  <span style={{ width: '8px' }}></span>
                  <span>{bar(m.score, 10)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div style={{ backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#83a598', fontWeight: 'bold', fontSize: '16px' }}>** TRENDING</span>
                <span style={{ color: '#928374', fontSize: '12px', marginLeft: '8px', fontFamily: "'Noto Sans TC', sans-serif" }}>話題王</span>
              </div>
              <Link href="/rankings/trending" style={{ color: '#83a598', fontSize: '11px', textDecoration: 'none' }}>VIEW ALL →</Link>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '2' }}>
              {trendingTop.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '28px', textAlign: 'right', color: '#928374' }}>#{m.rank}</span>
                  <span style={{ width: '8px' }}></span>
                  <span style={{ flex: '0 0 170px' }}>{m.model}</span>
                  <span style={{ width: '56px', textAlign: 'right', color: '#fabd2f' }}>{m.mentions.toLocaleString()}</span>
                  <span style={{ width: '8px' }}></span>
                  <span>{bar(m.mentions, 12800)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{
          backgroundColor: '#282828',
          border: '1px solid #3c3836',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '40px',
        }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>rankings --summary</span>
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#ebdbb2', whiteSpace: 'pre', fontFamily: 'inherit' }}>
            <div>{'  本月銷售冠軍    KYMCO 新K1 150        2,202 台'}</div>
            <div>{'  動力最強車款    DUCATI PANIGALE V4      215 HP'}</div>
            <div>{'  最高CP值       YAMAHA MT-07            9.2/10'}</div>
            <div>{'  最熱議車款     GOGORO CROSSOVER       12,800 則'}</div>
            <div style={{ color: '#504945' }}>{'  ' + '─'.repeat(52)}</div>
            <div>{'  資料更新時間    2026-03-24'}</div>
            <div>{'  資料來源       公路局 · 社群分析 · AI 評分'}</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#665c54', fontSize: '11px', paddingBottom: '20px' }}>
          guest@hymmoto.tw:~$ <span style={{ color: '#928374' }}>排行榜每月自動更新</span>
        </div>

      </div>
    </div>
  );
}
