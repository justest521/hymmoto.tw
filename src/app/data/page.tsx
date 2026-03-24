'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

function bar(value: number, max: number, width: number = 20, hasData: boolean = false): string {
  if (max === 0) return '░'.repeat(width)
  const raw = Math.round((value / max) * width)
  const filled = hasData && value > 0 ? Math.max(1, raw) : Math.min(width, Math.max(0, raw))
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

// Brand name mapping: Chinese → English
const brandMap: Record<string, string> = {
  '三陽': 'SYM', '光陽': 'KYMCO', '山葉': 'YAMAHA', '睿能': 'GOGORO',
  '鈴木': 'SUZUKI', '比雅久': 'PGO', '宏佳騰': 'AEON', '威速登': 'VESTON',
  '中華': 'CMC', '其他': 'OTHER',
  'HONDA': 'HONDA', 'KAWASAKI': 'KAWASAKI', 'PLAGGIO': 'PIAGGIO',
  'TRIUMPH': 'TRIUMPH', 'APRILIA': 'APRILIA', 'BMW': 'BMW',
  'DUCATI': 'DUCATI', 'KTM': 'KTM', 'HUSQVARNA': 'HUSQVARNA',
  'CFMOTO': 'CFMOTO', 'INDIAN': 'INDIAN', 'MOTO GUZZI': 'MOTOGUZZI',
  'MV AGUSTA': 'MVAGUSTA', 'GAS GAS': 'GAS GAS', 'CPI': 'CPI',
  'Benelli': 'BENELLI', 'BRIXTON': 'BRIXTON', '哈特佛': 'HARTFORD',
  'HARLEY-DAVIDSON': 'HARLEY-DAVIDSON', 'HARLEY-D': 'HARLEY-DAVIDSON',
}

interface BrandData { name: string; share: number; sales: number }
interface ModelData { rank: number; model: string; sales: number }
interface TierData { label: string; leader: string; sales: number; total: number }

const DataPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandData[]>([])
  const [topModels, setTopModels] = useState<ModelData[]>([])
  const [ccTiers, setCcTiers] = useState<TierData[]>([])
  const [stats, setStats] = useState({ totalSales: 0, brandCount: 0, modelCount: 0, latestMonth: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // 1. Get latest month from sales_brand_monthly
      const { data: monthData } = await supabase
        .from('sales_brand_monthly')
        .select('year_month')
        .order('year_month', { ascending: false })
        .limit(1)

      const latestBrandMonth = monthData?.[0]?.year_month || '2026-03'

      // 2. Brand market share
      const { data: brandData } = await supabase
        .from('sales_brand_monthly')
        .select('brand, total, market_share')
        .eq('year_month', latestBrandMonth)
        .order('total', { ascending: false })

      if (brandData) {
        const mapped = brandData
          .filter(b => b.total > 0)
          .map(b => ({
            name: brandMap[b.brand] || b.brand,
            share: parseFloat(b.market_share) || 0,
            sales: b.total,
          }))
        setBrands(mapped)
      }

      // 3. Get latest month from vehicle_monthly_sales
      const { data: modelMonthData } = await supabase
        .from('vehicle_monthly_sales')
        .select('year_month')
        .order('year_month', { ascending: false })
        .limit(1)

      const latestModelMonth = modelMonthData?.[0]?.year_month || '2026-02'

      // 4. Top 10 models
      const { data: modelData } = await supabase
        .from('vehicle_monthly_sales')
        .select('brand, model_code, display_name, total_sales, displacement')
        .eq('year_month', latestModelMonth)
        .gt('total_sales', 0)
        .order('total_sales', { ascending: false })
        .limit(10)

      if (modelData) {
        setTopModels(modelData.map((m, i) => ({
          rank: i + 1,
          model: `${m.brand} ${m.display_name || m.model_code}`,
          sales: m.total_sales || 0,
        })))

        // 5. CC tier aggregation from same query but all models
        const { data: allModels } = await supabase
          .from('vehicle_monthly_sales')
          .select('brand, display_name, model_code, total_sales, displacement')
          .eq('year_month', latestModelMonth)
          .gt('total_sales', 0)
          .order('total_sales', { ascending: false })

        if (allModels) {
          const tierDefs = [
            { label: '電動機車', match: (d: string | null) => d === '電動機車' },
            { label: '≤50cc', match: (d: string | null) => d === '≤50cc' },
            { label: '100-115cc', match: (d: string | null) => d === '100-115cc' },
            { label: '125cc', match: (d: string | null) => d === '125cc' },
            { label: '150-250cc', match: (d: string | null) => d === '150-250cc' || d === '150cc' || d === '250cc' },
            { label: '251cc+', match: (d: string | null) => d === '251-550cc' || d === '551-1000cc' || d === '1000cc+' || d === '300cc+' },
          ]

          const tiers: TierData[] = tierDefs.map(td => {
            const models = allModels.filter(m => td.match(m.displacement))
            const total = models.reduce((s, m) => s + (m.total_sales || 0), 0)
            const top = models[0]
            return {
              label: td.label,
              leader: top ? `${top.brand} ${top.display_name || top.model_code}` : '-',
              sales: top?.total_sales || 0,
              total,
            }
          }).filter(t => t.total > 0)

          setCcTiers(tiers)
        }
      }

      // 6. Stats
      const totalSales = brandData?.reduce((s, b) => s + b.total, 0) || 0
      const brandCount = brandData?.filter(b => b.total > 0).length || 0

      const { count: modelCount } = await supabase
        .from('vehicle_specs')
        .select('id', { count: 'exact', head: true })

      setStats({
        totalSales,
        brandCount,
        modelCount: modelCount || 566,
        latestMonth: latestBrandMonth,
      })

      setLoading(false)
    }

    fetchData()
  }, [])

  const maxShare = brands[0]?.share || 1
  const maxSales = topModels[0]?.sales || 1

  const mono: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1d2021', color: '#b8f53e', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
      }}>
        Loading data from Supabase...
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
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>data --dashboard</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
            DATA CENTER
          </h1>
          <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            台灣機車市場即時數據分析平台 · {stats.latestMonth}
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
            { label: 'TOTAL SALES', value: stats.totalSales.toLocaleString(), sym: '>>' },
            { label: 'BRANDS', value: `${stats.brandCount}`, sym: '>_' },
            { label: 'MODELS', value: `${stats.modelCount}+`, sym: '::' },
            { label: 'LATEST', value: stats.latestMonth, sym: '$>' },
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
              BRAND MARKET SHARE · {stats.latestMonth}
            </div>
            <div style={{ ...mono, fontSize: '13px', whiteSpace: 'pre', lineHeight: '1.8' }}>
              {brands.map((b, i) => (
                <div key={i}>{`  ${b.name.padEnd(18)} ${bar(b.share, maxShare, 20, b.sales > 0)} ${`${b.share}%`.padStart(6)}  (${b.sales.toLocaleString().padStart(6)})`}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Top 10 Sales */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>top 10 --month {stats.latestMonth}</span>
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
                  <span style={{ color: '#928374' }}>{tier.total > 0 ? Math.round((tier.sales / tier.total) * 100) : 0}%</span>
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
