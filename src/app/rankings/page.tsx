'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

function bar(value: number, max: number, width: number = 16): string {
  if (max === 0) return '░'.repeat(width)
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

interface SalesItem { rank: number; model: string; sales: number }
interface SpecItem { rank: number; model: string; hp: string; msrp: number; score: number }

export default function RankingsPage() {
  const [salesTop, setSalesTop] = useState<SalesItem[]>([])
  const [powerTop, setPowerTop] = useState<SpecItem[]>([])
  const [valueTop, setValueTop] = useState<SpecItem[]>([])
  const [latestMonth, setLatestMonth] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // 1. Sales King - from vehicle_monthly_sales
      const { data: monthData } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month')
        .order('year_month', { ascending: false })
        .limit(1)

      const month = monthData?.[0]?.year_month || '2026-02'
      setLatestMonth(month)

      const { data: salesData } = await supabase
        .from('vehicle_monthly_sales')
        .select('brand, model_code, display_name, total_sales')
        .eq('year_month', month)
        .gt('total_sales', 0)
        .order('total_sales', { ascending: false })
        .limit(5)

      if (salesData) {
        setSalesTop(salesData.map((m, i) => ({
          rank: i + 1,
          model: `${m.brand} ${m.display_name || m.model_code}`,
          sales: m.total_sales || 0,
        })))
      }

      // 2. Power King - from vehicle_specs (max_horsepower)
      const { data: powerData } = await supabase
        .from('vehicle_specs')
        .select('brand, model_name, max_horsepower, msrp')
        .not('max_horsepower', 'is', null)
        .order('displacement_cc', { ascending: false })
        .limit(50)

      if (powerData) {
        const sorted = powerData
          .map(p => {
            const hpMatch = p.max_horsepower?.match(/[\d.]+/)
            return { ...p, hpNum: hpMatch ? parseFloat(hpMatch[0]) : 0 }
          })
          .filter(p => p.hpNum > 0)
          .sort((a, b) => b.hpNum - a.hpNum)
          .slice(0, 5)

        setPowerTop(sorted.map((p, i) => ({
          rank: i + 1,
          model: `${p.brand} ${p.model_name}`,
          hp: p.max_horsepower || '',
          msrp: p.msrp || 0,
          score: 0,
        })))
      }

      // 3. Value King - specs with msrp and horsepower, compute hp-per-dollar score
      const { data: valueData } = await supabase
        .from('vehicle_specs')
        .select('brand, model_name, max_horsepower, msrp, displacement_cc')
        .not('max_horsepower', 'is', null)
        .not('msrp', 'is', null)
        .gt('msrp', 0)

      if (valueData) {
        const scored = valueData
          .map(v => {
            const hpMatch = v.max_horsepower?.match(/[\d.]+/)
            const hp = hpMatch ? parseFloat(hpMatch[0]) : 0
            // Score: HP per 10k NTD, weighted by displacement accessibility
            const hpPerPrice = hp > 0 && v.msrp > 0 ? (hp / (v.msrp / 10000)) : 0
            return { ...v, hp, hpPerPrice, score: Math.min(hpPerPrice * 0.8, 10) }
          })
          .filter(v => v.hpPerPrice > 0 && v.msrp < 800000) // exclude ultra-premium
          .sort((a, b) => b.hpPerPrice - a.hpPerPrice)
          .slice(0, 5)

        setValueTop(scored.map((v, i) => ({
          rank: i + 1,
          model: `${v.brand} ${v.model_name}`,
          hp: '',
          msrp: v.msrp,
          score: parseFloat(v.score.toFixed(1)),
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Trending stays mock for now (needs social data source)
  const trendingTop = [
    { rank: 1, model: 'GOGORO CROSSOVER',   mentions: 12800 },
    { rank: 2, model: 'YAMAHA MT-09 SP',    mentions: 9650 },
    { rank: 3, model: 'BMW R1300GS',        mentions: 8900 },
    { rank: 4, model: 'KTM 990 DUKE',       mentions: 7200 },
    { rank: 5, model: 'HONDA TRANSALP',     mentions: 6100 },
  ];

  const maxSales = salesTop[0]?.sales || 1
  const maxHp = powerTop[0]?.hp ? parseFloat(powerTop[0].hp) : 1

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1d2021', color: '#b8f53e', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
      }}>
        Loading rankings from Supabase...
      </div>
    )
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
        <div style={{ marginBottom: '40px', borderBottom: '1px solid #3c3836', paddingBottom: '20px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>rankings --all</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
            RANKINGS
          </h1>
          <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            多維度車款排名系統 · {latestMonth}
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
                  <span>{bar(m.sales, maxSales)}</span>
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
              {powerTop.map((m, i) => {
                const hpNum = parseFloat(m.hp) || 0
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '28px', textAlign: 'right', color: '#928374' }}>#{m.rank}</span>
                    <span style={{ width: '8px' }}></span>
                    <span style={{ flex: '0 0 170px' }}>{m.model}</span>
                    <span style={{ width: '50px', textAlign: 'right', color: '#fabd2f' }}>{hpNum}hp</span>
                    <span style={{ width: '8px' }}></span>
                    <span>{bar(hpNum, maxHp)}</span>
                  </div>
                )
              })}
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

        {/* Summary */}
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
            <div>{`  本月銷售冠軍    ${salesTop[0]?.model || '-'}    ${salesTop[0]?.sales.toLocaleString() || '0'} 台`}</div>
            <div>{`  動力最強車款    ${powerTop[0]?.model || '-'}    ${powerTop[0]?.hp || '-'}`}</div>
            <div>{`  最高CP值       ${valueTop[0]?.model || '-'}    ${valueTop[0]?.score.toFixed(1) || '-'}/10`}</div>
            <div style={{ color: '#504945' }}>{'  ' + '─'.repeat(52)}</div>
            <div>{`  資料更新月份    ${latestMonth}`}</div>
            <div>{'  資料來源       公路局 · vehicle_specs · AI 評分'}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#665c54', fontSize: '11px', paddingBottom: '20px' }}>
          guest@hymmoto.tw:~$ <span style={{ color: '#928374' }}>排行榜每月自動更新</span>
        </div>

      </div>
    </div>
  );
}
