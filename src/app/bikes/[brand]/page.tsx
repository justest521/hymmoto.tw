'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Vehicle {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number | null;
  max_horsepower: string | null;
  wet_weight_kg: number | null;
  msrp: number | null;
  engine_type: string | null;
  category: string | null;
}

const COLORS = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
};

const parseHP = (hp: string | null): number => {
  if (!hp) return 0;
  const m = hp.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
};

const getRank = (hp: number, cc: number): string => {
  const score = Math.min(10, (hp / Math.max(cc, 1)) * 2 + 2);
  if (score >= 8.5) return 'S';
  if (score >= 7) return 'A';
  if (score >= 5.5) return 'B';
  if (score >= 4) return 'C';
  return 'D';
};

const BrandPage = () => {
  const params = useParams();
  const decodedBrand = decodeURIComponent(params.brand as string);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'cc-asc' | 'cc-desc'>('cc-asc');

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('vehicle_specs')
        .select('id, brand, model_name, displacement_cc, max_horsepower, wet_weight_kg, msrp, engine_type, category')
        .ilike('brand', decodedBrand)
        .order('displacement_cc', { ascending: true });

      if (!error && data) {
        setVehicles(data as Vehicle[]);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [decodedBrand]);

  // Sort vehicles
  const sorted = [...vehicles].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return (a.msrp ?? 999999999) - (b.msrp ?? 999999999);
      case 'price-desc': return (b.msrp ?? 0) - (a.msrp ?? 0);
      case 'cc-asc': return (a.displacement_cc ?? 0) - (b.displacement_cc ?? 0);
      case 'cc-desc': return (b.displacement_cc ?? 0) - (a.displacement_cc ?? 0);
      default: return 0;
    }
  });

  const brandDisplay = vehicles[0]?.brand || decodedBrand;
  const avgPrice = vehicles.filter(v => v.msrp != null).length > 0
    ? Math.round(vehicles.filter(v => v.msrp != null).reduce((s, v) => s + (v.msrp || 0), 0) / vehicles.filter(v => v.msrp != null).length)
    : null;

  if (loading) {
    return (
      <div style={{
        backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div>
          <div style={{ color: COLORS.muted, fontSize: '14px' }}>$ loading {decodedBrand} vehicles...</div>
          <div style={{ color: COLORS.green, marginTop: '8px' }}>▌</div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div style={{
        backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div>
          <pre style={{ fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>
            {`guest@hymmoto.tw:~$ bikes --brand "${decodedBrand}"\n\nerror: brand not found in database\nstatus: 404`}
          </pre>
          <Link href="/bikes" style={{ color: COLORS.green, fontSize: '12px', marginTop: '16px', display: 'block' }}>
            &gt; back to all bikes
          </Link>
        </div>
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
            guest@hymmoto.tw:~$ <span style={{ color: COLORS.green }}>bikes --brand &quot;{brandDisplay}&quot;</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: '2px' }}>
            {brandDisplay.toUpperCase()}
          </h1>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            品牌車款列表
          </div>
        </div>

        {/* Brand Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px', marginBottom: '32px',
        }}>
          <div style={{ padding: '16px', backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '6px' }}>MODELS</div>
            <div style={{ fontSize: '20px', color: COLORS.green, fontWeight: 700 }}>{vehicles.length}</div>
          </div>
          {avgPrice != null && (
            <div style={{ padding: '16px', backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '6px' }}>AVG PRICE</div>
              <div style={{ fontSize: '20px', color: COLORS.gold, fontWeight: 700 }}>
                {avgPrice >= 10000 ? `${(avgPrice / 10000).toFixed(1)}萬` : `NT$${avgPrice.toLocaleString()}`}
              </div>
            </div>
          )}
          <div style={{ padding: '16px', backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '6px' }}>CC RANGE</div>
            <div style={{ fontSize: '20px', color: COLORS.blue, fontWeight: 700 }}>
              {Math.min(...vehicles.map(v => v.displacement_cc ?? 0).filter(c => c > 0))}
              -
              {Math.max(...vehicles.map(v => v.displacement_cc ?? 0))}
            </div>
          </div>
        </div>

        {/* Sort Bar */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: COLORS.muted, marginRight: '4px' }}>排序:</span>
          {([
            { key: 'cc-asc', label: 'CC ↑' },
            { key: 'cc-desc', label: 'CC ↓' },
            { key: 'price-asc', label: '價格 ↑' },
            { key: 'price-desc', label: '價格 ↓' },
          ] as const).map((opt) => (
            <button key={opt.key} onClick={() => setSortBy(opt.key)} style={{
              padding: '6px 12px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px',
              fontFamily: "'JetBrains Mono', monospace",
              border: `1px solid ${sortBy === opt.key ? COLORS.green : COLORS.border}`,
              backgroundColor: sortBy === opt.key ? COLORS.green : COLORS.card,
              color: sortBy === opt.key ? COLORS.bg : COLORS.text,
            }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Vehicle Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {sorted.map((v) => {
            const hp = parseHP(v.max_horsepower);
            const rank = getRank(hp, v.displacement_cc || 1);
            const rankColor = rank === 'S' ? COLORS.green : rank === 'A' ? COLORS.gold : rank === 'B' ? COLORS.blue : COLORS.red;

            return (
              <Link
                key={v.id}
                href={`/bikes/${encodeURIComponent(v.brand)}/${encodeURIComponent(v.model_name)}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  padding: '16px', backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`, borderRadius: '4px',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.green;
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(184,245,62,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Image placeholder */}
                  <div style={{
                    width: '100%', height: '120px',
                    background: `linear-gradient(135deg, ${COLORS.border} 0%, ${COLORS.card} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '3px', marginBottom: '12px',
                    fontSize: '24px', color: COLORS.green, fontWeight: 'bold',
                  }}>
                    //
                  </div>

                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    backgroundColor: rankColor,
                    color: rank === 'S' || rank === 'A' ? COLORS.bg : '#fff',
                    padding: '4px 8px', borderRadius: '3px',
                    fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                  }}>
                    {rank}
                  </div>

                  {/* Model info */}
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                    {v.model_name}
                  </div>
                  <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '8px', lineHeight: '1.6' }}>
                    {v.displacement_cc != null && <span>{v.displacement_cc}cc</span>}
                    {v.max_horsepower && <span> · {v.max_horsepower}</span>}
                    {v.wet_weight_kg != null && <div>重量: {v.wet_weight_kg}kg</div>}
                  </div>

                  {v.msrp != null && (
                    <div style={{ fontSize: '14px', color: COLORS.green, fontWeight: 700 }}>
                      NT${v.msrp.toLocaleString()}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default BrandPage;
