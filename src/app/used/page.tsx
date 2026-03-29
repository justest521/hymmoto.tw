'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

// ═══ Types ═══
interface UsedListing {
  id: number;
  brand: string;
  model_name: string;
  title: string;
  year: number;
  plate_date: string | null;
  mileage_km: number | null;
  color: string | null;
  condition: string | null;
  vehicle_type: string | null;
  license_type: string | null;
  origin: string | null;
  displacement_cc: number | null;
  price: number;
  negotiable: boolean;
  includes_shipping: boolean;
  includes_transfer: boolean;
  city: string;
  district: string | null;
  images: string[];
  tags: string[];
  status: string;
  view_count: number;
  favorite_count: number;
  published_at: string | null;
  created_at: string;
  // Joined
  dealer_name?: string;
  dealer_certified?: boolean;
  seller_name?: string;
  seller_role?: string;
}

interface Filters {
  brand: string | null;
  model: string;
  vehicleType: string | null;
  priceRange: string | null;
  ageRange: string | null;
  mileageRange: string | null;
  licenseType: string | null;
  origin: string | null;
  city: string | null;
  cylinders: string | null;
  fuelType: string | null;
  status: string | null;
}

type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'views';
type QuickTab = 'all' | 'newest' | 'cheapest' | 'low_mileage' | 'price_drop';

// ═══ Constants ═══
const VEHICLE_TYPES = ['檔車', '速克達', '跑車', '街車', '休旅車', '越野車', '美式嬉皮車', '復古車', '電動車', '小檔車'];
const LICENSE_TYPES = ['白牌', '黃牌', '紅牌', '電動'];
const PRICE_RANGES = [
  { label: '10萬以下', min: 0, max: 100000 },
  { label: '10-30萬', min: 100000, max: 300000 },
  { label: '30-50萬', min: 300000, max: 500000 },
  { label: '50-80萬', min: 500000, max: 800000 },
  { label: '80-100萬', min: 800000, max: 1000000 },
  { label: '100萬以上', min: 1000000, max: 99999999 },
];
const AGE_RANGES = [
  { label: '準新車', maxAge: 1 },
  { label: '1年', maxAge: 1 },
  { label: '2年', maxAge: 2 },
  { label: '3年', maxAge: 3 },
  { label: '3年以上', maxAge: 99 },
];
const MILEAGE_RANGES = [
  { label: '0-1,000 Km', min: 0, max: 1000 },
  { label: '1,000-10,000 Km', min: 1000, max: 10000 },
  { label: '1萬-2萬 Km', min: 10000, max: 20000 },
  { label: '2萬-5萬 Km', min: 20000, max: 50000 },
  { label: '5萬 Km以上', min: 50000, max: 9999999 },
];
const TW_CITIES = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣',
  '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣',
];
const ORIGINS = ['進口', '國產'];
const CHECKBOX_TAGS = [
  { key: 'import_white', label: '進口白牌' },
  { key: 'domestic_white', label: '國產白牌' },
  { key: 'import_heavy', label: '進口黃紅牌' },
  { key: 'domestic_heavy', label: '國產黃紅牌' },
  { key: 'electric', label: '電動車' },
  { key: 'shipping', label: '含運費' },
  { key: 'modded', label: '精品改裝' },
  { key: 'all_in', label: '辦到好' },
];

const c = {
  bg: '#1d2021',
  card: '#282828',
  cardAlt: '#1a1a1f',
  border: '#3c3836',
  text: '#ebdbb2',
  muted: '#928374',
  green: '#b8f53e',
  gold: '#fabd2f',
  red: '#fb4934',
  blue: '#83a598',
};

function formatPrice(p: number): string {
  if (p >= 10000) return `${(p / 10000).toFixed(p % 10000 === 0 ? 0 : 1)}萬`;
  return p.toLocaleString();
}

function formatMileage(km: number | null): string {
  if (km === null) return '—';
  if (km >= 10000) return `${(km / 10000).toFixed(1)}萬 Km`;
  return `${km.toLocaleString()} Km`;
}

function conditionLabel(cond: string | null): string {
  const map: Record<string, string> = { new: '全新', like_new: '準新車', good: '良好', fair: '普通', poor: '待整理' };
  return map[cond || ''] || '';
}

// ═══ Component ═══
export default function UsedPage() {
  const [listings, setListings] = useState<UsedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(24);
  const [quickTab, setQuickTab] = useState<QuickTab>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checkboxTags, setCheckboxTags] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>({
    brand: null, model: '', vehicleType: null, priceRange: null,
    ageRange: null, mileageRange: null, licenseType: null,
    origin: null, city: null, cylinders: null, fuelType: null, status: null,
  });

  // Fetch listings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('used_listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      // Apply filters
      if (filters.brand) query = query.eq('brand', filters.brand);
      if (filters.model) query = query.ilike('model_name', `%${filters.model}%`);
      if (filters.vehicleType) query = query.eq('vehicle_type', filters.vehicleType);
      if (filters.licenseType) query = query.eq('license_type', filters.licenseType);
      if (filters.origin) query = query.eq('origin', filters.origin);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.cylinders) query = query.eq('cylinders', filters.cylinders);
      if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType);

      if (filters.priceRange) {
        const range = PRICE_RANGES.find(r => r.label === filters.priceRange);
        if (range) {
          query = query.gte('price', range.min).lte('price', range.max);
        }
      }
      if (filters.mileageRange) {
        const range = MILEAGE_RANGES.find(r => r.label === filters.mileageRange);
        if (range) {
          query = query.gte('mileage_km', range.min).lte('mileage_km', range.max);
        }
      }
      if (filters.ageRange) {
        const currentYear = new Date().getFullYear();
        const ageConfig = AGE_RANGES.find(r => r.label === filters.ageRange);
        if (ageConfig) {
          if (ageConfig.maxAge === 99) {
            query = query.lte('year', currentYear - 3);
          } else {
            query = query.gte('year', currentYear - ageConfig.maxAge);
          }
        }
      }

      // Checkbox tag filters
      if (checkboxTags.has('shipping')) query = query.eq('includes_shipping', true);
      if (checkboxTags.has('all_in')) query = query.eq('includes_transfer', true);

      // Sort
      switch (sortBy) {
        case 'newest': query = query.order('published_at', { ascending: false, nullsFirst: false }); break;
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'mileage_asc': query = query.order('mileage_km', { ascending: true, nullsFirst: false }); break;
        case 'views': query = query.order('view_count', { ascending: false }); break;
      }

      query = query.limit(100);

      const { data, count } = await query;
      setListings((data || []) as UsedListing[]);
      setTotalCount(count || 0);

      // Fetch unique brands for filter
      const { data: brandData } = await supabase
        .from('used_listings')
        .select('brand')
        .eq('status', 'active');
      if (brandData) {
        const uniqueBrands = [...new Set(brandData.map(b => b.brand))].sort();
        setBrands(uniqueBrands);
      }

      setLoading(false);
    };
    fetchData();
  }, [filters, sortBy, checkboxTags]);

  const resetFilters = () => {
    setFilters({ brand: null, model: '', vehicleType: null, priceRange: null, ageRange: null, mileageRange: null, licenseType: null, origin: null, city: null, cylinders: null, fuelType: null, status: null });
    setCheckboxTags(new Set());
    setQuickTab('all');
    setSortBy('newest');
  };

  const toggleCheckbox = (key: string) => {
    setCheckboxTags(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const visibleListings = listings.slice(0, displayCount);
  const activeFilterCount = Object.values(filters).filter(v => v !== null && v !== '').length + checkboxTags.size;

  // ═══ Filter chip component ═══
  const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        backgroundColor: active ? c.green : 'transparent',
        color: active ? c.bg : c.muted,
        border: `1px solid ${active ? c.green : c.border}`,
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  // ═══ Filter row component ═══
  const FilterRow = ({ label, options, value, onChange }: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
      <div style={{ width: '60px', flexShrink: 0, fontSize: '12px', color: c.text, fontWeight: 'bold', paddingTop: '6px' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
        <FilterChip label="不限" active={value === null} onClick={() => onChange(null)} />
        {options.map(opt => (
          <FilterChip key={opt} label={opt} active={value === opt} onClick={() => onChange(value === opt ? null : opt)} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh' }}>
      {/* Terminal Header */}
      <section style={{ padding: '20px', backgroundColor: c.card, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <pre style={{ fontSize: '13px', margin: '0', color: c.green, whiteSpace: 'pre-wrap' }}>
            guest@hymmoto.tw:~$ used --marketplace
          </pre>
        </div>
      </section>

      {/* Hero */}
      <section style={{ padding: '40px 20px 30px', textAlign: 'center', borderBottom: `1px solid ${c.border}` }}>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: c.text, letterSpacing: '3px' }}>
          USED MARKETPLACE
        </h1>
        <p style={{ fontSize: '13px', color: c.muted, margin: '0 0 20px 0', fontFamily: "'Noto Sans TC', sans-serif" }}>
          中古車刊登平台 — 全台二手重機即時刊登
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/used/publish" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: c.green, color: c.bg, padding: '10px 24px',
            borderRadius: '4px', fontWeight: 'bold', fontSize: '13px',
            textDecoration: 'none', letterSpacing: '1px',
          }}>
            + 我要刊登
          </Link>
          <Link href="/auth/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'transparent', color: c.text, padding: '10px 24px',
            borderRadius: '4px', fontWeight: 'bold', fontSize: '13px',
            textDecoration: 'none', border: `1px solid ${c.border}`, letterSpacing: '1px',
          }}>
            註冊 / 登入
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* ═══ Filter System ═══ */}
        <section style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px', padding: '16px 20px', marginBottom: '20px' }}>
          {/* Brand + Model */}
          <FilterRow label="品牌" options={brands.length > 0 ? brands : ['BMW', 'DUCATI', 'HONDA', 'KAWASAKI', 'KTM', 'SUZUKI', 'YAMAHA', 'HARLEY-DAVIDSON', 'GOGORO', 'KYMCO', 'SYM']} value={filters.brand} onChange={(v) => setFilters(f => ({ ...f, brand: v }))} />

          <FilterRow label="車型" options={VEHICLE_TYPES} value={filters.vehicleType} onChange={(v) => setFilters(f => ({ ...f, vehicleType: v }))} />

          <FilterRow label="價格" options={PRICE_RANGES.map(r => r.label)} value={filters.priceRange} onChange={(v) => setFilters(f => ({ ...f, priceRange: v }))} />

          <FilterRow label="車齡" options={AGE_RANGES.map(r => r.label)} value={filters.ageRange} onChange={(v) => setFilters(f => ({ ...f, ageRange: v }))} />

          <FilterRow label="里程" options={MILEAGE_RANGES.map(r => r.label)} value={filters.mileageRange} onChange={(v) => setFilters(f => ({ ...f, mileageRange: v }))} />

          {/* Advanced toggle */}
          <div style={{ padding: '10px 0' }}>
            <button onClick={() => setShowAdvanced(!showAdvanced)} style={{
              background: 'none', border: 'none', color: c.green, cursor: 'pointer',
              fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", padding: 0,
            }}>
              {showAdvanced ? '▼' : '▶'} 更多篩選
            </button>
          </div>

          {showAdvanced && (
            <>
              <FilterRow label="牌照" options={LICENSE_TYPES} value={filters.licenseType} onChange={(v) => setFilters(f => ({ ...f, licenseType: v }))} />
              <FilterRow label="產地" options={ORIGINS} value={filters.origin} onChange={(v) => setFilters(f => ({ ...f, origin: v }))} />
              <FilterRow label="缸數" options={['單缸', '雙缸', '多缸']} value={filters.cylinders} onChange={(v) => setFilters(f => ({ ...f, cylinders: v }))} />
              <FilterRow label="能源" options={['汽油', '純電']} value={filters.fuelType} onChange={(v) => setFilters(f => ({ ...f, fuelType: v }))} />
              <FilterRow label="地區" options={TW_CITIES} value={filters.city} onChange={(v) => setFilters(f => ({ ...f, city: v }))} />
            </>
          )}

          {/* Checkbox tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '12px 0 4px', borderTop: `1px solid ${c.border}`, marginTop: '4px' }}>
            {CHECKBOX_TAGS.map(tag => (
              <label key={tag.key} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', color: checkboxTags.has(tag.key) ? c.green : c.muted }}>
                <input type="checkbox" checked={checkboxTags.has(tag.key)} onChange={() => toggleCheckbox(tag.key)}
                  style={{ accentColor: c.green }} />
                {tag.label}
              </label>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <div style={{ paddingTop: '8px' }}>
              <button onClick={resetFilters} style={{
                background: 'none', border: `1px solid ${c.red}`, color: c.red,
                padding: '4px 12px', borderRadius: '3px', cursor: 'pointer',
                fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
              }}>
                清除所有篩選 ({activeFilterCount})
              </button>
            </div>
          )}
        </section>

        {/* ═══ Quick Tabs + Sort ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '2px', overflow: 'auto' }}>
            {([
              { key: 'all', label: '所有車輛' },
              { key: 'newest', label: '最新上架' },
              { key: 'cheapest', label: '市場最低' },
              { key: 'low_mileage', label: '低里程' },
            ] as { key: QuickTab; label: string }[]).map(tab => (
              <button key={tab.key} onClick={() => {
                setQuickTab(tab.key);
                if (tab.key === 'newest') setSortBy('newest');
                if (tab.key === 'cheapest') setSortBy('price_asc');
                if (tab.key === 'low_mileage') setSortBy('mileage_asc');
                if (tab.key === 'all') setSortBy('newest');
              }} style={{
                padding: '8px 16px', fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor: quickTab === tab.key ? c.green : 'transparent',
                color: quickTab === tab.key ? c.bg : c.muted,
                border: `1px solid ${quickTab === tab.key ? c.green : c.border}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: c.muted }}>
              共 <b style={{ color: c.green }}>{totalCount}</b> 台
            </span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} style={{
              backgroundColor: c.card, color: c.text, border: `1px solid ${c.border}`,
              padding: '6px 10px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
              borderRadius: '3px',
            }}>
              <option value="newest">更新時間</option>
              <option value="price_asc">金額 ↑</option>
              <option value="price_desc">金額 ↓</option>
              <option value="mileage_asc">里程 ↑</option>
              <option value="views">瀏覽次數</option>
            </select>
          </div>
        </div>

        {/* ═══ Listings Grid ═══ */}
        {loading ? (
          <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, padding: '40px', textAlign: 'center', borderRadius: '4px' }}>
            <pre style={{ color: c.muted, fontSize: '13px', margin: 0 }}>Loading listings... ⏳</pre>
          </div>
        ) : visibleListings.length === 0 ? (
          <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, padding: '60px 20px', textAlign: 'center', borderRadius: '4px' }}>
            <pre style={{ color: c.muted, fontSize: '14px', margin: '0 0 12px 0' }}>
              {`$ used --search\n\n目前沒有符合條件的中古車刊登`}
            </pre>
            <p style={{ color: c.muted, fontSize: '12px', margin: '0 0 20px 0', fontFamily: "'Noto Sans TC', sans-serif" }}>
              成為第一個刊登者，讓你的車被看見！
            </p>
            <Link href="/used/publish" style={{
              display: 'inline-block', backgroundColor: c.green, color: c.bg,
              padding: '10px 24px', borderRadius: '4px', fontWeight: 'bold',
              fontSize: '13px', textDecoration: 'none',
            }}>
              + 立即刊登
            </Link>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {visibleListings.map(listing => (
                <Link key={listing.id} href={`/used/${listing.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: c.card,
                    border: `1px solid ${c.border}`,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.green; e.currentTarget.style.boxShadow = `0 0 12px rgba(184, 245, 62, 0.15)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '100%', height: '180px', backgroundColor: c.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {listing.images && listing.images.length > 0 ? (
                        <img src={listing.images[0]} alt={listing.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ color: c.muted, fontSize: '32px' }}>🏍</div>
                      )}
                      {/* Tags overlay */}
                      {listing.tags && listing.tags.length > 0 && (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {listing.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} style={{
                              backgroundColor: i === 0 ? c.red : c.gold,
                              color: c.bg, padding: '2px 8px', fontSize: '10px',
                              fontWeight: 'bold', borderRadius: '2px',
                            }}>{tag}</span>
                          ))}
                        </div>
                      )}
                      {/* Image count */}
                      {listing.images && listing.images.length > 1 && (
                        <div style={{
                          position: 'absolute', bottom: '8px', right: '8px',
                          backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff',
                          padding: '2px 8px', fontSize: '10px', borderRadius: '2px',
                        }}>
                          📷 {listing.images.length}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Brand badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          backgroundColor: c.green, color: c.bg,
                          padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '2px',
                        }}>{listing.brand}</span>
                        {listing.condition && (
                          <span style={{ fontSize: '10px', color: c.gold }}>{conditionLabel(listing.condition)}</span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: '13px', fontWeight: 600, color: c.text,
                        marginBottom: '10px', lineHeight: '1.4',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                        fontFamily: "'Noto Sans TC', sans-serif",
                      }}>
                        {listing.title}
                      </div>

                      {/* Info rows */}
                      <div style={{ fontSize: '11px', color: c.muted, display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', flex: 1 }}>
                        <div>👁 瀏覽 {listing.view_count || 0}</div>
                        <div>🏍 里程 {formatMileage(listing.mileage_km)}</div>
                        <div>📍 {listing.city}{listing.district ? ` ${listing.district}` : ''}</div>
                      </div>

                      {/* Price + buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${c.border}`, paddingTop: '10px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: c.green, fontFamily: "'Orbitron', monospace" }}>
                          {formatPrice(listing.price)}<small style={{ fontSize: '11px', color: c.muted, fontFamily: "'Noto Sans TC', sans-serif" }}>{listing.negotiable ? ' 可議' : ''}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {listing.includes_shipping && <span style={{ fontSize: '9px', backgroundColor: c.blue, color: c.bg, padding: '2px 6px', borderRadius: '2px' }}>含運</span>}
                          {listing.includes_transfer && <span style={{ fontSize: '9px', backgroundColor: c.gold, color: c.bg, padding: '2px 6px', borderRadius: '2px' }}>辦到好</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more */}
            {displayCount < listings.length && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button onClick={() => setDisplayCount(d => d + 24)} style={{
                  backgroundColor: 'transparent', color: c.green, border: `1px solid ${c.green}`,
                  padding: '10px 32px', borderRadius: '4px', cursor: 'pointer',
                  fontSize: '13px', fontFamily: "'JetBrains Mono', monospace",
                }}>
                  載入更多 ({listings.length - displayCount} 台)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <section style={{ padding: '40px 20px', textAlign: 'center', borderTop: `1px solid ${c.border}`, marginTop: '40px' }}>
        <p style={{ fontSize: '12px', color: c.muted, margin: 0 }}>
          HYMMOTO.TW USED MARKETPLACE — 台灣最大中古機車刊登平台
        </p>
      </section>
    </div>
  );
}
