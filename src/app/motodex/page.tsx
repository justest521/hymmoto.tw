'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface VehicleSpec {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number;
  max_horsepower: string;
  max_torque: string;
  wet_weight_kg: number;
  msrp: number;
  category: string;
  seat_height_mm: number;
  fuel_tank_l: number;
  image_url: string;
  features: string[];
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
          v.model_name.toLowerCase().includes(query) ||
          v.brand.toLowerCase().includes(query) ||
          v.category.toLowerCase().includes(query)
      );
    }

    // Filter by selected brand
    if (selectedBrand) {
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    }

    setFilteredVehicles(filtered);
  };

  const parseHorsepower = (hpText: string): number => {
    const match = hpText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const formatPrice = (price: number): string => {
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
    <main className="min-h-screen p-6" style={{ backgroundColor: '#1d2021', fontFamily: '"JetBrains Mono", monospace' }}>
      <style>{`
        * {
          font-family: "JetBrains Mono", monospace;
        }

        body {
          background-color: #1d2021;
          color: #ebdbb2;
        }

        input, button {
          font-family: "JetBrains Mono", monospace;
        }

        /* Chinese text font */
        .chinese-text {
          font-family: "Noto Sans TC", "JetBrains Mono", monospace;
        }
      `}</style>

      {/* Terminal Header */}
      <div className="mb-8 border-b-2 pb-4" style={{ borderColor: '#3c3836' }}>
        <div className="text-sm mb-2" style={{ color: '#928374' }}>
          guest@hymmoto.tw:~$
        </div>
        <div className="text-lg font-bold" style={{ color: '#b8f53e' }}>
          motodex --browse
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#b8f53e' }}>
          MOTODEX / <span className="chinese-text">車款圖鑑</span>
        </h1>
        <p className="text-sm" style={{ color: '#928374' }}>
          <span className="chinese-text">台灣機車完整規格百科 · 566+ 車款</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="$ search model / brand / category..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setDisplayCount(12);
          }}
          className="w-full px-4 py-3 text-sm border-2"
          style={{
            backgroundColor: '#282828',
            borderColor: '#3c3836',
            color: '#ebdbb2',
          }}
        />
      </div>

      {/* Brand Filter Buttons */}
      <div className="mb-8">
        <div className="text-xs mb-3" style={{ color: '#928374' }}>
          [BRAND_FILTER]
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedBrand(null);
              setDisplayCount(12);
            }}
            className="px-4 py-2 text-sm border-2 font-bold transition-colors"
            style={{
              backgroundColor: selectedBrand === null ? '#b8f53e' : '#282828',
              borderColor: '#3c3836',
              color: selectedBrand === null ? '#1d2021' : '#b8f53e',
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
              className="px-4 py-2 text-sm border-2 transition-colors"
              style={{
                backgroundColor: selectedBrand === brand ? '#b8f53e' : '#282828',
                borderColor: '#3c3836',
                color: selectedBrand === brand ? '#1d2021' : '#b8f53e',
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12" style={{ color: '#928374' }}>
          <div className="text-sm">
            [LOADING] initializing motodex database...
          </div>
        </div>
      )}

      {/* Vehicle Grid */}
      {!loading && (
        <>
          <div className="mb-4 text-xs" style={{ color: '#928374' }}>
            [ RESULTS: {filteredVehicles.length} / {vehicles.length} ]
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#928374' }}>
              <div className="text-sm">
                [ERROR] no vehicles matching query
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {displayedVehicles.map((vehicle) => {
                  const hp = parseHorsepower(vehicle.max_horsepower);
                  return (
                    <div
                      key={vehicle.id}
                      className="p-4 border-2"
                      style={{
                        backgroundColor: '#282828',
                        borderColor: '#3c3836',
                      }}
                    >
                      {/* Model Name and Brand */}
                      <h2 className="text-lg font-bold mb-1" style={{ color: '#b8f53e' }}>
                        {vehicle.model_name}
                      </h2>
                      <p className="text-xs mb-4" style={{ color: '#928374' }}>
                        {vehicle.brand} | {vehicle.category}
                      </p>

                      {/* Stats Section */}
                      <div className="space-y-2 text-xs" style={{ color: '#ebdbb2' }}>
                        {/* Displacement */}
                        <div className="flex justify-between">
                          <span style={{ color: '#928374' }}>displacement</span>
                          <span>{vehicle.displacement_cc} cc</span>
                        </div>

                        {/* Horsepower with Bar */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span style={{ color: '#928374' }}>horsepower</span>
                            <span>{hp} hp</span>
                          </div>
                          <div style={{ color: '#b8f53e', letterSpacing: '0px' }}>
                            {renderHpBar(hp)}
                          </div>
                        </div>

                        {/* Torque */}
                        <div className="flex justify-between">
                          <span style={{ color: '#928374' }}>torque</span>
                          <span>{vehicle.max_torque}</span>
                        </div>

                        {/* Weight */}
                        <div className="flex justify-between">
                          <span style={{ color: '#928374' }}>wet_weight</span>
                          <span>{vehicle.wet_weight_kg} kg</span>
                        </div>

                        {/* Price */}
                        <div className="flex justify-between pt-2 border-t-2" style={{ borderColor: '#3c3836' }}>
                          <span style={{ color: '#928374' }}>msrp</span>
                          <span style={{ color: '#fabd2f' }}>
                            {formatPrice(vehicle.msrp)}
                          </span>
                        </div>

                        {/* Additional Info */}
                        <div className="flex justify-between text-xs pt-2" style={{ color: '#928374' }}>
                          <span>seat_height: {vehicle.seat_height_mm}mm</span>
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: '#928374' }}>
                          <span>fuel_tank: {vehicle.fuel_tank_l}L</span>
                        </div>
                      </div>

                      {/* Features */}
                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="mt-4 pt-4 border-t-2" style={{ borderColor: '#3c3836' }}>
                          <div className="text-xs mb-2" style={{ color: '#83a598' }}>
                            [FEATURES]
                          </div>
                          <div className="text-xs space-y-1">
                            {vehicle.features.map((feature, idx) => (
                              <div key={idx} style={{ color: '#928374' }}>
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
                <div className="flex justify-center mb-8">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 12)}
                    className="px-6 py-3 text-sm border-2 font-bold transition-colors"
                    style={{
                      backgroundColor: '#282828',
                      borderColor: '#3c3836',
                      color: '#b8f53e',
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
              <div className="text-center text-xs" style={{ color: '#928374' }}>
                showing {displayedVehicles.length} of {filteredVehicles.length} results
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
