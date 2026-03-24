'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface VehicleSpec {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number | null;
  max_horsepower: string | null;
  max_torque: string | null;
  wet_weight_kg: number | null;
  msrp: number | null;
  category: string | null;
  seat_height_mm: number | null;
  fuel_tank_l: number | null;
  image_url: string | null;
  features: string[] | null;
}

export default function MotodexPage() {
  const [vehicles, setVehicles] = useState<VehicleSpec[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(12);

  const supabase = createClient();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, selectedBrand, vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_specs')
        .select('*')
        .order('brand', { ascending: true })
        .order('model_name', { ascending: true });

      if (error) throw error;

      if (data) {
        setVehicles(data as VehicleSpec[]);

        // Extract unique brands
        const uniqueBrands = Array.from(
          new Set((data as VehicleSpec[]).map((v) => v.brand))
        ).sort();
        setBrands(uniqueBrands);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          (v.model_name || '').toLowerCase().includes(query) ||
          (v.brand || '').toLowerCase().includes(query) ||
          (v.category || '').toLowerCase().includes(query)
      );
    }

    // Filter by selected brand
    if (selectedBrand) {
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    }

    setFilteredVehicles(filtered);
  };

  const parseHorsepower = (hpText: string | null): number => {
    if (!hpText) return 0;
    const match = hpText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const formatPrice = (price: number | null): string => {
    if (!price) return '-';
    return `NT$${price.toLocaleString('zh-TW')}`;
  };

  const renderHpBar = (hp: number, maxHp: number = 215): string => {
    const barLength = 15;
    const filledLength = Math.round((hp / maxHp) * barLength);
    const emptyLength = barLength - filledLength;
    return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
  };

  const displayedVehicles = filteredVehicles.slice(0, displayCount);
  const hasMore = displayCount < filteredVehicles.length;

  return (
    <main style={{ backgroundColor: '#1d2021', color: '#ebdbb2', fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh', padding: '30px 24px' }}>
      {/* Outer container with max-width constraint */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Terminal Header */}
        <div style={{ marginBottom: '40px', borderBottom: '1px solid #3c3836', paddingBottom: '20px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>motodex --browse</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ebdbb2', margin: 0, letterSpacing: '2px' }}>
            MOTODEX
          </h1>
          <div style={{ color: '#928374', fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            車款圖鑑 · 台灣機車完整規格百科
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="$ search model / brand / category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(12);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '12px 16px',
              backgroundColor: '#282828',
              border: '1px solid #3c3836',
              color: '#ebdbb2',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '14px',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Brand Filter Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '12px' }}>
            [BRAND_FILTER]
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => {
                setSelectedBrand(null);
                setDisplayCount(12);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #3c3836',
                fontWeight: 'bold',
                backgroundColor: selectedBrand === null ? '#b8f53e' : '#282828',
                color: selectedBrand === null ? '#1d2021' : '#b8f53e',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                borderRadius: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedBrand === null) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ALL
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => {
                  setSelectedBrand(brand);
                  setDisplayCount(12);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  border: '1px solid #3c3836',
                  backgroundColor: selectedBrand === brand ? '#b8f53e' : '#282828',
                  color: selectedBrand === brand ? '#1d2021' : '#b8f53e',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedBrand !== brand) {
                    e.currentTarget.style.backgroundColor = '#3c3836';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedBrand === brand ? '#b8f53e' : '#282828';
                }}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px', color: '#928374' }}>
            <div style={{ fontSize: '14px' }}>
              [LOADING] initializing motodex database...
            </div>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && (
          <>
            <div style={{ marginBottom: '16px', fontSize: '12px', color: '#928374' }}>
              [ RESULTS: {filteredVehicles.length} / {vehicles.length} ]
            </div>

            {filteredVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px', color: '#928374' }}>
                <div style={{ fontSize: '14px' }}>
                  [ERROR] no vehicles matching query
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {displayedVehicles.map((vehicle) => {
                    const hp = parseHorsepower(vehicle.max_horsepower);
                    return (
                      <div
                        key={vehicle.id}
                        style={{
                          backgroundColor: '#282828',
                          border: '1px solid #3c3836',
                          borderRadius: '4px',
                          padding: '16px',
                        }}
                      >
                        {/* Model Name and Brand */}
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#b8f53e', margin: 0 }}>
                          {vehicle.model_name}
                        </h2>
                        <p style={{ fontSize: '12px', marginBottom: '16px', color: '#928374', margin: '4px 0 16px 0' }}>
                          {vehicle.brand}{vehicle.category ? ` | ${vehicle.category}` : ''}
                        </p>

                        {/* Stats Section */}
                        <div style={{ fontSize: '12px', color: '#ebdbb2' }}>
                          {/* Displacement */}
                          {vehicle.displacement_cc != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#928374' }}>displacement</span>
                              <span>{vehicle.displacement_cc} cc</span>
                            </div>
                          )}

                          {/* Horsepower with Bar */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: '#928374' }}>horsepower</span>
                              <span>{hp || '—'} hp</span>
                            </div>
                            <div style={{ color: '#b8f53e', letterSpacing: '0px', fontFamily: "'JetBrains Mono', monospace" }}>
                              {renderHpBar(hp)}
                            </div>
                          </div>

                          {/* Torque */}
                          {vehicle.max_torque != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#928374' }}>torque</span>
                              <span>{vehicle.max_torque}</span>
                            </div>
                          )}

                          {/* Weight */}
                          {vehicle.wet_weight_kg != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#928374' }}>wet_weight</span>
                              <span>{vehicle.wet_weight_kg} kg</span>
                            </div>
                          )}

                          {/* Price */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #3c3836', marginBottom: '8px' }}>
                            <span style={{ color: '#928374' }}>msrp</span>
                            <span style={{ color: '#fabd2f' }}>
                              {formatPrice(vehicle.msrp)}
                            </span>
                          </div>

                          {/* Additional Info */}
                          {vehicle.seat_height_mm != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '8px', color: '#928374', marginBottom: '4px' }}>
                              <span>seat_height: {vehicle.seat_height_mm}mm</span>
                            </div>
                          )}
                          {vehicle.fuel_tank_l != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#928374' }}>
                              <span>fuel_tank: {vehicle.fuel_tank_l}L</span>
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        {vehicle.features && vehicle.features.length > 0 && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #3c3836' }}>
                            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#83a598' }}>
                              [FEATURES]
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              {vehicle.features.map((feature, idx) => (
                                <div key={idx} style={{ color: '#928374', marginBottom: '4px' }}>
                                  - {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 12)}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        border: '1px solid #3c3836',
                        fontWeight: 'bold',
                        backgroundColor: '#282828',
                        color: '#b8f53e',
                        cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#b8f53e';
                        e.currentTarget.style.color = '#1d2021';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#282828';
                        e.currentTarget.style.color = '#b8f53e';
                      }}
                    >
                      $ load_more --count=12
                    </button>
                  </div>
                )}

                {/* Result Count */}
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#928374' }}>
                  showing {displayedVehicles.length} of {filteredVehicles.length} results
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
