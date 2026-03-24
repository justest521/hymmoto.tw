'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Vehicle {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number | null;
  max_horsepower: string | null;
  msrp: number | null;
  category: string | null;
}

type TabType = 'brand' | 'displacement' | 'price' | 'type';

interface Filters {
  brand: string | null;
  displacement: string | null;
  price: string | null;
  type: string | null;
}

const BikesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('brand');
  const [filters, setFilters] = useState<Filters>({
    brand: null,
    displacement: null,
    price: null,
    type: null,
  });
  const [displayCount, setDisplayCount] = useState(24);
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from('vehicle_specs')
        .select('id, brand, model_name, displacement_cc, max_horsepower, msrp, category')
        .order('created_at', { ascending: false });

      if (data) {
        setVehicles(data as Vehicle[]);

        // Extract unique brands
        const uniqueBrands = [...new Set(data.map(v => v.brand))].sort();
        setBrands(uniqueBrands);

        // Extract unique types
        const uniqueTypes = [...new Set(data.map(v => v.category).filter(c => c !== null))].sort();
        setTypes(uniqueTypes);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...vehicles];

    // Brand filter
    if (filters.brand && filters.brand !== '全部') {
      result = result.filter(v => v.brand === filters.brand);
    }

    // Displacement filter
    if (filters.displacement && filters.displacement !== '全部') {
      result = result.filter(v => {
        if (!v.displacement_cc) return false;
        const cc = v.displacement_cc;
        switch (filters.displacement) {
          case '~125':
            return cc <= 125;
          case '126-250':
            return cc >= 126 && cc <= 250;
          case '251-400':
            return cc >= 251 && cc <= 400;
          case '401-700':
            return cc >= 401 && cc <= 700;
          case '700+':
            return cc > 700;
          default:
            return true;
        }
      });
    }

    // Price filter
    if (filters.price && filters.price !== '全部') {
      result = result.filter(v => {
        if (!v.msrp) return false;
        const price = v.msrp / 10000; // Convert to 萬
        switch (filters.price) {
          case '~5':
            return price <= 5;
          case '5-10':
            return price > 5 && price <= 10;
          case '10-20':
            return price > 10 && price <= 20;
          case '20-40':
            return price > 20 && price <= 40;
          case '40+':
            return price > 40;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (filters.type && filters.type !== '全部') {
      result = result.filter(v => v.category === filters.type);
    }

    setFilteredVehicles(result);
    setDisplayCount(24);
  }, [filters, vehicles]);

  const parseHP = (hpText: string | null): number | null => {
    if (!hpText) return null;
    const match = hpText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const formatPrice = (msrp: number | null): string => {
    if (!msrp) return '未標價';
    return (msrp / 10000).toFixed(1) + '萬';
  };

  const encodeParam = (str: string): string => {
    return encodeURIComponent(str);
  };

  const handleFilterClick = (filterType: TabType, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === '全部' || prev[filterType] === value ? (filterType === 'brand' ? null : '全部') : value,
    }));
  };

  const getFilterOptions = (tab: TabType) => {
    switch (tab) {
      case 'brand':
        return ['全部', ...brands];
      case 'displacement':
        return ['全部', '~125', '126-250', '251-400', '401-700', '700+'];
      case 'price':
        return ['全部', '~5', '5-10', '10-20', '20-40', '40+'];
      case 'type':
        return ['全部', ...types];
      default:
        return [];
    }
  };

  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'brand':
        return '品牌';
      case 'displacement':
        return '排量';
      case 'price':
        return '價格';
      case 'type':
        return '車型';
      default:
        return '';
    }
  };

  const getActiveFilterValue = (tab: TabType): string => {
    const value = filters[tab];
    return value === null ? '全部' : value;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1d2021',
        color: '#b8f53e',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '14px',
      }}>
        Loading vehicle database...
      </div>
    );
  }

  const visibleVehicles = filteredVehicles.slice(0, displayCount);
  const hasMore = displayCount < filteredVehicles.length;

  return (
    <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <section style={{ padding: '40px 24px 30px', borderBottom: '1px solid #3c3836', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ color: '#928374', fontSize: '12px', marginBottom: '8px' }}>
          guest@hymmoto.tw:~$ <span style={{ color: '#b8f53e' }}>bikes --database</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', color: '#ebdbb2', letterSpacing: '2px' }}>
          VEHICLE DATABASE
        </h1>
        <div style={{ color: '#928374', fontSize: '12px', fontFamily: "'Noto Sans TC', sans-serif" }}>
          車款資料庫 · {vehicles.length}+ 台灣在售車款完整規格
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 24px' }}>
        {/* Filter Tabs */}
        <section style={{ marginBottom: '30px' }}>
          <div style={{ color: '#928374', fontSize: '12px', marginBottom: '16px' }}>
            $ <span style={{ color: '#b8f53e' }}>filter --by</span> [品牌] [排量] [價格] [車型]
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {(['brand', 'displacement', 'price', 'type'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: activeTab === tab ? '#b8f53e' : 'transparent',
                  color: activeTab === tab ? '#1d2021' : '#928374',
                  border: activeTab === tab ? 'none' : '1px solid #3c3836',
                  borderRadius: '4px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.borderColor = '#b8f53e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.borderColor = '#3c3836';
                  }
                }}
              >
                {getTabLabel(tab as TabType)}
              </button>
            ))}
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {getFilterOptions(activeTab).map(option => {
              const isActive = getActiveFilterValue(activeTab) === option;
              return (
                <button
                  key={option}
                  onClick={() => handleFilterClick(activeTab, option)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isActive ? '#b8f53e' : 'transparent',
                    color: isActive ? '#1d2021' : '#ebdbb2',
                    border: isActive ? 'none' : '1px solid #3c3836',
                    borderRadius: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#b8f53e';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#3c3836';
                    }
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Summary */}
        <section style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #3c3836' }}>
          <div style={{ color: '#928374', fontSize: '12px' }}>
            $ <span style={{ color: '#b8f53e' }}>results</span>
            <span style={{ marginLeft: '12px' }}>
              顯示 {Math.min(displayCount, filteredVehicles.length)} / {filteredVehicles.length} 台
            </span>
          </div>
        </section>

        {/* Vehicles Grid */}
        <section style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {visibleVehicles.map(v => {
              const hp = parseHP(v.max_horsepower);
              const encodedBrand = encodeParam(v.brand);
              const encodedModel = encodeParam(v.model_name);

              return (
                <Link
                  key={v.id}
                  href={`/bikes/${encodedBrand}/${encodedModel}`}
                  style={{
                    padding: '16px',
                    backgroundColor: '#282828',
                    border: '1px solid #3c3836',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#b8f53e';
                    e.currentTarget.style.backgroundColor = '#3c3836';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3c3836';
                    e.currentTarget.style.backgroundColor = '#282828';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: '#b8f53e',
                      color: '#1d2021',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '2px',
                    }}>
                      {v.brand}
                    </span>
                    {v.displacement_cc && (
                      <span style={{ color: '#928374', fontSize: '10px' }}>
                        {v.displacement_cc}cc
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ebdbb2',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {v.model_name}
                  </div>

                  {v.category && (
                    <div style={{ color: '#fabd2f', fontSize: '11px', marginBottom: '6px' }}>
                      {v.category}
                    </div>
                  )}

                  {hp !== null && (
                    <div style={{ color: '#928374', fontSize: '11px', marginBottom: '6px' }}>
                      {hp} hp
                    </div>
                  )}

                  {v.msrp && (
                    <div style={{ color: '#b8f53e', fontSize: '12px', fontWeight: 'bold', marginTop: 'auto' }}>
                      {formatPrice(v.msrp)}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Load More Button */}
        {hasMore && (
          <section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <button
              onClick={() => setDisplayCount(prev => prev + 24)}
              style={{
                padding: '12px 32px',
                backgroundColor: '#282828',
                border: '1px solid #b8f53e',
                color: '#b8f53e',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
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
              $ load --more 24 vehicles
            </button>
          </section>
        )}

        {/* No Results */}
        {filteredVehicles.length === 0 && (
          <section style={{ textAlign: 'center', padding: '40px 0', color: '#928374' }}>
            <div style={{ fontSize: '13px' }}>
              $ no vehicles found with current filters
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section style={{ paddingTop: '30px', borderTop: '1px solid #3c3836' }}>
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
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '4px',
                padding: '14px 20px',
                textDecoration: 'none',
                color: '#ebdbb2',
                flex: '1',
                minWidth: '180px',
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
