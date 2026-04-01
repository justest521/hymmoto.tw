'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import SearchBar from '@/components/SearchBar';

interface Vehicle {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number | null;
  max_horsepower: string | null;
  max_torque: string | null;
  msrp: number | null;
  category: string | null;
  image_url: string | null;
  fuel_type: string | null;
  transmission: string | null;
  year_introduced: number | null;
}

const c = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
};

const DISPLACEMENT_RANGES = [
  { label: '全部', value: 'all' },
  { label: '~125cc', value: '~125' },
  { label: '126-250cc', value: '126-250' },
  { label: '251-400cc', value: '251-400' },
  { label: '401-700cc', value: '401-700' },
  { label: '701cc+', value: '700+' },
];

const PRICE_RANGES = [
  { label: '全部', value: 'all' },
  { label: '5萬以下', value: '~5' },
  { label: '5-10萬', value: '5-10' },
  { label: '10-20萬', value: '10-20' },
  { label: '20-40萬', value: '20-40' },
  { label: '40-80萬', value: '40-80' },
  { label: '80萬以上', value: '80+' },
];

const SORT_OPTIONS = [
  { label: '相關度', value: 'relevance' },
  { label: '價格低→高', value: 'price_asc' },
  { label: '價格高→低', value: 'price_desc' },
  { label: '排氣量低→高', value: 'cc_asc' },
  { label: '排氣量高→低', value: 'cc_desc' },
  { label: '品牌 A-Z', value: 'brand_az' },
];

function formatPrice(p: number): string {
  if (p >= 10000) return `${(p / 10000).toFixed(p % 10000 === 0 ? 0 : 1)}萬`;
  return p.toLocaleString();
}

function matchesDisplacement(cc: number | null, range: string): boolean {
  if (range === 'all' || !cc) return range === 'all';
  switch (range) {
    case '~125': return cc <= 125;
    case '126-250': return cc >= 126 && cc <= 250;
    case '251-400': return cc >= 251 && cc <= 400;
    case '401-700': return cc >= 401 && cc <= 700;
    case '700+': return cc > 700;
    default: return true;
  }
}

function matchesPrice(msrp: number | null, range: string): boolean {
  if (range === 'all' || !msrp) return range === 'all';
  const w = msrp / 10000;
  switch (range) {
    case '~5': return w <= 5;
    case '5-10': return w > 5 && w <= 10;
    case '10-20': return w > 10 && w <= 20;
    case '20-40': return w > 20 && w <= 40;
    case '40-80': return w > 40 && w <= 80;
    case '80+': return w > 80;
    default: return true;
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQ);

  // Filters
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ccFilter, setCcFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [displayCount, setDisplayCount] = useState(24);

  // Derived lists
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch all vehicles once
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('vehicle_specs')
        .select('id, brand, model_name, displacement_cc, max_horsepower, max_torque, msrp, category, image_url, fuel_type, transmission, year_introduced')
        .order('brand', { ascending: true });

      if (data) {
        setAllVehicles(data as Vehicle[]);
        setBrands([...new Set(data.map(v => v.brand))].sort());
        setCategories([...new Set(data.map(v => v.category).filter(Boolean))].sort() as string[]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtered + sorted results
  const results = useMemo(() => {
    let filtered = [...allVehicles];
    const q = query.trim().toLowerCase();

    // Text search
    if (q) {
      filtered = filtered.filter(v =>
        v.brand.toLowerCase().includes(q) ||
        v.model_name.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q))
      );
    }

    // Brand
    if (brandFilter !== 'all') {
      filtered = filtered.filter(v => v.brand === brandFilter);
    }

    // Category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(v => v.category === categoryFilter);
    }

    // Displacement
    if (ccFilter !== 'all') {
      filtered = filtered.filter(v => matchesDisplacement(v.displacement_cc, ccFilter));
    }

    // Price
    if (priceFilter !== 'all') {
      filtered = filtered.filter(v => matchesPrice(v.msrp, priceFilter));
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.msrp ?? 999999999) - (b.msrp ?? 999999999));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.msrp ?? 0) - (a.msrp ?? 0));
        break;
      case 'cc_asc':
        filtered.sort((a, b) => (a.displacement_cc ?? 0) - (b.displacement_cc ?? 0));
        break;
      case 'cc_desc':
        filtered.sort((a, b) => (b.displacement_cc ?? 0) - (a.displacement_cc ?? 0));
        break;
      case 'brand_az':
        filtered.sort((a, b) => a.brand.localeCompare(b.brand) || a.model_name.localeCompare(b.model_name));
        break;
      default: // relevance — put matches with images first, exact brand match first
        if (q) {
          filtered.sort((a, b) => {
            const aExact = a.brand.toLowerCase() === q || a.model_name.toLowerCase() === q ? 1 : 0;
            const bExact = b.brand.toLowerCase() === q || b.model_name.toLowerCase() === q ? 1 : 0;
            if (bExact !== aExact) return bExact - aExact;
            const aImg = a.image_url ? 1 : 0;
            const bImg = b.image_url ? 1 : 0;
            return bImg - aImg;
          });
        }
        break;
    }

    return filtered;
  }, [allVehicles, query, brandFilter, categoryFilter, ccFilter, priceFilter, sortBy]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setDisplayCount(24);
    // Update URL without reload
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  };

  const resetFilters = () => {
    setBrandFilter('all');
    setCategoryFilter('all');
    setCcFilter('all');
    setPriceFilter('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = brandFilter !== 'all' || categoryFilter !== 'all' || ccFilter !== 'all' || priceFilter !== 'all';
  const displayed = results.slice(0, displayCount);

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh' }}>
      {/* Terminal Header */}
      <section style={{ padding: '16px 20px', backgroundColor: c.card, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <pre style={{ fontSize: '12px', margin: '0 0 12px 0', color: c.green }}>
            guest@hymmoto.tw:~$ search {query ? `"${query}"` : '--interactive'}
          </pre>
          <SearchBar
            initialValue={query}
            onSearch={handleSearch}
            placeholder="搜尋車款、品牌、型號..."
            autoFocus={!initialQ}
            showHot={!query}
          />
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Filter Panel */}
        <section style={{
          backgroundColor: c.card, border: `1px solid ${c.border}`,
          borderRadius: '4px', padding: '16px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: c.green, letterSpacing: '1px' }}>FILTERS 進階篩選</span>
            {hasActiveFilters && (
              <button onClick={resetFilters} style={{
                background: 'transparent', border: `1px solid ${c.border}`,
                color: c.muted, fontSize: '11px', padding: '3px 10px',
                borderRadius: '3px', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                清除篩選
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Brand */}
            <div>
              <label style={{ fontSize: '10px', color: c.muted, display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>BRAND 品牌</label>
              <select
                value={brandFilter}
                onChange={e => { setBrandFilter(e.target.value); setDisplayCount(24); }}
                style={{
                  width: '100%', backgroundColor: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: '3px',
                  padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">全部品牌</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ fontSize: '10px', color: c.muted, display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>CATEGORY 車種</label>
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setDisplayCount(24); }}
                style={{
                  width: '100%', backgroundColor: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: '3px',
                  padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">全部車種</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Displacement */}
            <div>
              <label style={{ fontSize: '10px', color: c.muted, display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>CC 排氣量</label>
              <select
                value={ccFilter}
                onChange={e => { setCcFilter(e.target.value); setDisplayCount(24); }}
                style={{
                  width: '100%', backgroundColor: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: '3px',
                  padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                {DISPLACEMENT_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Price */}
            <div>
              <label style={{ fontSize: '10px', color: c.muted, display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>PRICE 價格</label>
              <select
                value={priceFilter}
                onChange={e => { setPriceFilter(e.target.value); setDisplayCount(24); }}
                style={{
                  width: '100%', backgroundColor: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: '3px',
                  padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: c.muted }}>
            {loading ? '搜尋中...' : (
              <>
                找到 <span style={{ color: c.green, fontWeight: 'bold' }}>{results.length}</span> 輛車款
                {query && <> · 關鍵字「<span style={{ color: c.gold }}>{query}</span>」</>}
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '10px', color: c.muted }}>SORT</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                backgroundColor: c.bg, color: c.text,
                border: `1px solid ${c.border}`, borderRadius: '3px',
                padding: '6px 10px', fontSize: '11px', fontFamily: 'inherit',
                outline: 'none', cursor: 'pointer',
              }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: c.muted }}>
            <pre style={{ fontSize: '13px', margin: 0 }}>Loading vehicle database... ⏳</pre>
          </div>
        ) : results.length === 0 ? (
          <div style={{
            backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px',
            padding: '60px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: c.muted, fontSize: '13px', margin: '0 0 8px 0' }}>
              {query ? `找不到符合「${query}」的車款` : '請輸入關鍵字或調整篩選條件'}
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} style={{
                backgroundColor: c.green, color: c.bg, border: 'none',
                padding: '8px 20px', borderRadius: '3px', fontSize: '12px',
                fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px',
              }}>
                清除所有篩選
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {displayed.map(v => (
                <Link
                  key={v.id}
                  href={`/bikes/${encodeURIComponent(v.brand)}/${encodeURIComponent(v.model_name)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      backgroundColor: c.card, border: `1px solid ${c.border}`,
                      borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = c.green; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '100%', height: '140px', backgroundColor: c.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {v.image_url ? (
                        <img
                          src={v.image_url}
                          alt={`${v.brand} ${v.model_name}`}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: '36px', opacity: 0.3 }}>🏍</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                          backgroundColor: c.green, color: c.bg,
                          padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '2px',
                        }}>{v.brand}</span>
                        {v.displacement_cc && (
                          <span style={{ fontSize: '10px', color: c.muted }}>{v.displacement_cc}cc</span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '13px', color: c.text, fontWeight: 600, marginBottom: '6px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontFamily: "'Noto Sans TC', sans-serif",
                      }}>
                        {v.model_name}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {v.msrp ? (
                          <span style={{ fontSize: '15px', fontWeight: 'bold', color: c.green, fontFamily: "'Orbitron', monospace" }}>
                            NT${formatPrice(v.msrp)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: c.muted }}>價格洽詢</span>
                        )}
                        {v.category && (
                          <span style={{
                            fontSize: '10px', color: c.muted,
                            backgroundColor: c.bg, padding: '2px 6px', borderRadius: '2px',
                          }}>{v.category}</span>
                        )}
                      </div>

                      {/* Specs row */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '10px', color: c.muted, flexWrap: 'wrap' }}>
                        {v.max_horsepower && <span>{v.max_horsepower}</span>}
                        {v.fuel_type && <span>· {v.fuel_type}</span>}
                        {v.transmission && <span>· {v.transmission}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more */}
            {displayCount < results.length && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => setDisplayCount(prev => prev + 24)}
                  style={{
                    backgroundColor: 'transparent', border: `1px solid ${c.green}`,
                    color: c.green, padding: '10px 32px', borderRadius: '4px',
                    fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                    fontFamily: 'inherit', letterSpacing: '1px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = c.green; e.currentTarget.style.color = c.bg; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = c.green; }}
                >
                  LOAD MORE ({results.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <section style={{ padding: '30px 20px', textAlign: 'center', borderTop: `1px solid ${c.border}`, marginTop: '20px' }}>
        <p style={{ fontSize: '11px', color: '#665c54', margin: 0 }}>
          HYMMOTO.TW SEARCH · {results.length} results indexed
        </p>
      </section>
    </div>
  );
}
