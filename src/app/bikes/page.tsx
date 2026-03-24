'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface BrandInfo { name: string; count: number }

const BikesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<BrandInfo[]>([]);
  const [totalModels, setTotalModels] = useState(0);
  const [latestVehicles, setLatestVehicles] = useState<Array<{
    id: number; brand: string; model_name: string; displacement_cc: number; msrp: number | null;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get brand counts from vehicle_specs
      const { data: specsData } = await supabase
        .from('vehicle_specs')
        .select('brand');

      if (specsData) {
        const brandCounts: Record<string, number> = {};
        specsData.forEach(s => {
          brandCounts[s.brand] = (brandCounts[s.brand] || 0) + 1;
        });
        const sorted = Object.entries(brandCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setBrands(sorted);
        setTotalModels(specsData.length);
      }

      // Get latest added vehicles
      const { data: latest } = await supabase
        .from('vehicle_specs')
        .select('id, brand, model_name, displacement_cc, msrp')
        .order('created_at', { ascending: false })
        .limit(6);

      if (latest) setLatestVehicles(latest as typeof latestVehicles);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredBrands = searchQuery
    ? brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands;

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1d2021', color: '#b8f53e', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
      }}>
        Loading vehicle database...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <section style={{ padding: '40px 20px 30px', borderBottom: '1px solid #3c3836', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
          guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>bikes --database</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', color: '#ebdbb2', letterSpacing: '2px' }}>
          VEHICLE DATABASE
        </h1>
        <div style={{ color: '#928374', fontSize: '12px', fontFamily: "'Noto Sans TC', sans-serif" }}>
          車款資料庫 · {totalModels}+ 台灣在售車款完整規格
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        {/* Search */}
        <section style={{ padding: '30px 0', borderBottom: '1px solid #3c3836' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>search --query</span>
          </div>
          <input
            type="text"
            placeholder="$ search YAMAHA MT-07..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', maxWidth: '500px', padding: '12px 16px',
              backgroundColor: '#282828', border: '1px solid #3c3836', color: '#ebdbb2',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
              borderRadius: '4px', outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#b8f53e' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#3c3836' }}
          />
        </section>

        {/* Brands Grid */}
        <section style={{ padding: '30px 0', borderBottom: '1px solid #3c3836' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '16px' }}>
            $ <span style={{ color: '#b8f53e' }}>ls ./brands/</span>
            <span style={{ color: '#928374', marginLeft: '16px' }}>{filteredBrands.length} brands found</span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {filteredBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/bikes/${brand.name.toLowerCase()}`}
                style={{
                  padding: '16px', backgroundColor: '#282828', border: '1px solid #3c3836',
                  textAlign: 'center', textDecoration: 'none', borderRadius: '4px',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#b8f53e' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3c3836' }}
              >
                <div style={{ color: '#b8f53e', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>//</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ebdbb2', letterSpacing: '1px' }}>
                  {brand.name}
                </div>
                <div style={{ fontSize: '11px', color: '#928374', marginTop: '4px' }}>
                  {brand.count} 車款
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Vehicles */}
        <section style={{ padding: '30px 0', borderBottom: '1px solid #3c3836' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '16px' }}>
            $ <span style={{ color: '#b8f53e' }}>bikes --latest 6</span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {latestVehicles.map((v) => (
              <div key={v.id} style={{
                padding: '16px', backgroundColor: '#282828', border: '1px solid #3c3836',
                borderRadius: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    backgroundColor: '#b8f53e', color: '#1d2021', padding: '2px 6px',
                    fontSize: '10px', fontWeight: 'bold', borderRadius: '2px',
                  }}>{v.brand}</span>
                  {v.displacement_cc && (
                    <span style={{ color: '#928374', fontSize: '11px' }}>{v.displacement_cc}cc</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ebdbb2', marginBottom: '8px' }}>
                  {v.model_name}
                </div>
                {v.msrp && (
                  <div style={{ color: '#fabd2f', fontSize: '12px', fontWeight: 'bold' }}>
                    NT$ {(v.msrp).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section style={{ padding: '30px 0 40px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '16px' }}>
            $ <span style={{ color: '#b8f53e' }}>ls ./related/</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { href: '/motodex', sym: '##', label: 'motodex/', desc: '車款圖鑑' },
              { href: '/battle', sym: '<>', label: 'battle/', desc: '對戰模式' },
              { href: '/rankings', sym: '#1', label: 'rankings/', desc: '排行榜' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                backgroundColor: '#282828', border: '1px solid #3c3836',
                borderRadius: '4px', padding: '14px 20px', textDecoration: 'none',
                color: '#ebdbb2', flex: '1', minWidth: '180px',
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

export default BikesPage;
