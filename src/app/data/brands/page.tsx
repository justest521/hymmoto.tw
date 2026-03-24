'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const COLORS = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
};

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
  'HARLEY-DAVIDSON': 'HARLEY-DAVIDSON',
};

const brandColors: Record<string, string> = {
  SYM: COLORS.green, KYMCO: COLORS.blue, YAMAHA: COLORS.red,
  GOGORO: '#3b82f6', SUZUKI: COLORS.gold, HONDA: '#ef4444',
  PGO: '#a78bfa', PIAGGIO: '#34d399',
};

interface BrandRow { rawBrand: string; name: string; total: number; share: number }
interface TopModel { brand: string; display_name: string; model_code: string; total_sales: number }

function bar(v: number, max: number, w: number = 24): string {
  if (max === 0) return '░'.repeat(w);
  const f = Math.max(v > 0 ? 1 : 0, Math.min(w, Math.round((v / max) * w)));
  return '█'.repeat(f) + '░'.repeat(w - f);
}

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [topModelsByBrand, setTopModelsByBrand] = useState<Record<string, TopModel[]>>({});
  const [latestMonth, setLatestMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get latest month
      const { data: monthData } = await supabase
        .from('sales_brand_monthly')
        .select('year_month')
        .order('year_month', { ascending: false })
        .limit(1);

      const month = monthData?.[0]?.year_month || '2026-03';
      setLatestMonth(month);

      // Brand market share
      const { data: brandData } = await supabase
        .from('sales_brand_monthly')
        .select('brand, total, market_share')
        .eq('year_month', month)
        .order('total', { ascending: false });

      if (brandData) {
        const mapped = brandData
          .filter(b => b.total > 0)
          .map(b => ({
            rawBrand: b.brand,
            name: brandMap[b.brand] || b.brand,
            total: b.total,
            share: parseFloat(b.market_share) || 0,
          }));
        setBrands(mapped);

        // Fetch top 3 models per top 8 brands
        const topBrands = mapped.slice(0, 8);
        const modelMap: Record<string, TopModel[]> = {};

        // Get latest model month
        const { data: modelMonthData } = await supabase
          .from('vehicle_monthly_sales')
          .select('year_month')
          .order('year_month', { ascending: false })
          .limit(1);

        const modelMonth = modelMonthData?.[0]?.year_month || month;

        for (const brand of topBrands) {
          const { data: models } = await supabase
            .from('vehicle_monthly_sales')
            .select('brand, display_name, model_code, total_sales')
            .eq('year_month', modelMonth)
            .eq('brand', brand.rawBrand)
            .gt('total_sales', 0)
            .order('total_sales', { ascending: false })
            .limit(3);

          if (models) {
            modelMap[brand.name] = models as TopModel[];
          }
        }
        setTopModelsByBrand(modelMap);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const maxShare = brands[0]?.share || 1;
  const totalSales = brands.reduce((s, b) => s + b.total, 0);

  if (loading) {
    return (
      <div style={{
        backgroundColor: COLORS.bg, color: COLORS.green, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
      }}>
        $ loading brand analysis...
      </div>
    );
  }

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
            guest@hymmoto.tw:~$ <span style={{ color: COLORS.green }}>data --brands --analysis</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: '2px' }}>
            BRAND ANALYSIS
          </h1>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            品牌市佔率深度分析 · {latestMonth}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
          {[
            { label: 'TOTAL SALES', value: totalSales.toLocaleString(), sym: '>>' },
            { label: 'ACTIVE BRANDS', value: `${brands.length}`, sym: '>_' },
            { label: 'LATEST DATA', value: latestMonth, sym: '$>' },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
              padding: '16px', borderRadius: '4px',
            }}>
              <div style={{ color: COLORS.green, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{s.sym}</div>
              <div style={{ color: COLORS.text, fontSize: '20px', fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: COLORS.muted, fontSize: '10px', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Market Share Terminal View */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: COLORS.green }}>brand --share --bar</span>
          </div>
          <div style={{
            backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
            borderRadius: '4px', padding: '20px',
          }}>
            <div style={{ fontSize: '13px', whiteSpace: 'pre', lineHeight: '1.8', fontFamily: "'JetBrains Mono', monospace" }}>
              {brands.slice(0, 15).map((b, i) => (
                <div key={i}>
                  {`  ${b.name.padEnd(18)} ${bar(b.share, maxShare, 20)} ${`${b.share}%`.padStart(6)}  (${b.total.toLocaleString().padStart(6)})`}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Cards */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: COLORS.green }}>brand --profiles</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {brands.slice(0, 8).map((brand) => {
              const color = brandColors[brand.name] || COLORS.muted;
              const models = topModelsByBrand[brand.name] || [];
              return (
                <Link
                  key={brand.name}
                  href={`/bikes/${encodeURIComponent(brand.rawBrand)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      backgroundColor: COLORS.card,
                      border: `1px solid ${hoveredBrand === brand.name ? COLORS.green : COLORS.border}`,
                      padding: '20px', borderRadius: '4px',
                      transition: 'all 0.2s', cursor: 'pointer',
                      boxShadow: hoveredBrand === brand.name ? '0 0 12px rgba(184,245,62,0.15)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredBrand(brand.name)}
                    onMouseLeave={() => setHoveredBrand(null)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>{brand.name}</div>
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '2px',
                        backgroundColor: color,
                      }} />
                    </div>

                    <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.green, marginBottom: '4px' }}>
                      {brand.share}%
                    </div>
                    <div style={{ fontSize: '10px', color: COLORS.muted, marginBottom: '12px', fontFamily: "'Noto Sans TC', sans-serif" }}>
                      市場佔有率
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                      {brand.total.toLocaleString()} <span style={{ fontSize: '10px', color: COLORS.muted }}>台</span>
                    </div>

                    {models.length > 0 && (
                      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '12px', marginTop: '12px' }}>
                        <div style={{ fontSize: '10px', color: COLORS.muted, marginBottom: '8px', fontWeight: 700 }}>
                          TOP MODELS
                        </div>
                        {models.map((m, idx) => (
                          <div key={idx} style={{
                            fontSize: '11px', color: COLORS.text, marginBottom: '4px',
                            fontFamily: "'Noto Sans TC', sans-serif",
                          }}>
                            {idx + 1}. {m.display_name || m.model_code}
                            <span style={{ color: COLORS.gold, marginLeft: '8px' }}>
                              {m.total_sales.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Pie-like summary */}
        <section>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: COLORS.green }}>brand --insights</span>
          </div>
          <div style={{
            backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
            borderRadius: '4px', padding: '20px',
          }}>
            <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: "'Noto Sans TC', sans-serif", lineHeight: 2 }}>
              {brands.length >= 3 && (
                <>
                  <div>
                    • TOP 3 品牌（{brands.slice(0, 3).map(b => b.name).join('/')}）合計市佔 {brands.slice(0, 3).reduce((s, b) => s + b.share, 0).toFixed(1)}%
                  </div>
                  <div>
                    • 共 {brands.length} 個活躍品牌，總銷量 {totalSales.toLocaleString()} 台
                  </div>
                  <div>
                    • 市場龍頭 {brands[0].name} 以 {brands[0].share}% 市佔率領先
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BrandsPage;
