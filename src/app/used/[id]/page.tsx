'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Listing {
  id: number;
  seller_id: string;
  dealer_id: number | null;
  brand: string;
  model_name: string;
  title: string;
  year: number;
  plate_date: string | null;
  mileage_km: number | null;
  color: string | null;
  condition: string | null;
  exterior_score: number | null;
  scratches: string | null;
  engine_status: string | null;
  modifications: string | null;
  accident_history: boolean;
  warranty: string | null;
  platform_inspected: boolean;
  vehicle_type: string | null;
  license_type: string | null;
  origin: string | null;
  displacement_cc: number | null;
  cylinders: string | null;
  fuel_type: string | null;
  price: number;
  negotiable: boolean;
  includes_shipping: boolean;
  includes_transfer: boolean;
  city: string;
  district: string | null;
  address: string | null;
  images: string[];
  video_url: string | null;
  tags: string[];
  status: string;
  featured: boolean;
  view_count: number;
  favorite_count: number;
  published_at: string | null;
  created_at: string;
}

interface Dealer {
  id: number;
  shop_name: string;
  logo_url: string | null;
  phone: string | null;
  city: string | null;
  is_certified: boolean;
  rating: number;
  total_sales: number;
}

interface Seller {
  display_name: string | null;
  role: string;
  city: string | null;
  is_verified: boolean;
}

const c = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
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
  return map[cond || ''] || '—';
}

export default function UsedDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      // Fetch listing
      const { data, error } = await supabase
        .from('used_listings')
        .select('*')
        .eq('id', parseInt(listingId))
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const listingData = data as Listing;
      setListing(listingData);

      // Increment view count
      await supabase.from('used_listings').update({ view_count: (listingData.view_count || 0) + 1 }).eq('id', listingData.id);

      // Fetch seller profile
      const { data: sellerData } = await supabase
        .from('user_profiles')
        .select('display_name, role, city, is_verified')
        .eq('id', listingData.seller_id)
        .single();
      if (sellerData) setSeller(sellerData as Seller);

      // Fetch dealer if exists
      if (listingData.dealer_id) {
        const { data: dealerData } = await supabase
          .from('dealers')
          .select('id, shop_name, logo_url, phone, city, is_certified, rating, total_sales')
          .eq('id', listingData.dealer_id)
          .single();
        if (dealerData) setDealer(dealerData as Dealer);
      }

      // Fetch similar listings
      const { data: similar } = await supabase
        .from('used_listings')
        .select('*')
        .eq('status', 'active')
        .eq('brand', listingData.brand)
        .neq('id', listingData.id)
        .order('published_at', { ascending: false })
        .limit(4);
      if (similar) setSimilarListings(similar as Listing[]);

      setLoading(false);
    };
    fetchData();
  }, [listingId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <pre style={{ fontSize: '14px', color: c.muted }}>Loading listing #{listingId}... ⏳</pre>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: '14px', color: c.muted, margin: '0 0 16px 0' }}>{`error: listing #${listingId} not found\nstatus: 404`}</pre>
          <Link href="/used" style={{ color: c.green, fontSize: '13px' }}>← 回到中古車列表</Link>
        </div>
      </div>
    );
  }

  const infoRows: { label: string; value: string }[] = [
    { label: '行駛里程', value: formatMileage(listing.mileage_km) },
    { label: '領牌', value: listing.plate_date || '—' },
    { label: '車型', value: listing.vehicle_type || '—' },
    { label: '車身顏色', value: listing.color || '—' },
    { label: '外觀新舊', value: listing.exterior_score ? `${listing.exterior_score}/10` : conditionLabel(listing.condition) },
    { label: '劃痕', value: listing.scratches || '無' },
    { label: '發動機', value: listing.engine_status || '—' },
    { label: '商家質保', value: listing.warranty || '無' },
    { label: '平台驗車', value: listing.platform_inspected ? '已驗車 ✓' : '未驗車' },
    { label: '改裝', value: listing.modifications || '原廠無改動' },
    { label: '事故紀錄', value: listing.accident_history ? '有事故' : '無事故 ✓' },
    { label: '排氣量', value: listing.displacement_cc ? `${listing.displacement_cc}cc` : '—' },
    { label: '缸數', value: listing.cylinders || '—' },
    { label: '能源', value: listing.fuel_type || '—' },
    { label: '牌照類型', value: listing.license_type || '—' },
    { label: '產地', value: listing.origin || '—' },
  ].filter(r => r.value !== '—');

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh' }}>
      {/* Terminal Header */}
      <section style={{ padding: '16px 20px', backgroundColor: c.card, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <pre style={{ fontSize: '12px', margin: 0, color: c.green }}>
            guest@hymmoto.tw:~$ used --inspect #{listing.id}
          </pre>
          <Link href="/used" style={{ color: c.muted, fontSize: '12px', textDecoration: 'none' }}>← 返回列表</Link>
        </div>
      </section>

      {/* Title bar */}
      <section style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: c.text, fontFamily: "'Noto Sans TC', sans-serif", lineHeight: 1.4 }}>
            {listing.title}
          </h1>
          {/* Nav tabs */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '12px', overflow: 'auto' }}>
            {['基本參數', '規格配備', '留言板', '車型圖片'].map((tab, i) => (
              <span key={tab} style={{
                padding: '6px 14px', fontSize: '11px',
                backgroundColor: i === 0 ? c.green : 'transparent',
                color: i === 0 ? c.bg : c.muted,
                border: `1px solid ${i === 0 ? c.green : c.border}`,
                borderRadius: '3px', cursor: 'pointer',
              }}>{tab}</span>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

          {/* Left: Images */}
          <div>
            <div style={{
              width: '100%', aspectRatio: '4/3', backgroundColor: c.card,
              borderRadius: '4px', overflow: 'hidden', position: 'relative',
              border: `1px solid ${c.border}`,
            }}>
              {listing.images && listing.images.length > 0 ? (
                <>
                  <img src={listing.images[currentImg]} alt={listing.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = ''; }}
                  />
                  <div style={{
                    position: 'absolute', bottom: '10px', right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff',
                    padding: '4px 10px', fontSize: '11px', borderRadius: '3px',
                  }}>
                    {currentImg + 1} / {listing.images.length}
                  </div>
                  {/* Prev/Next */}
                  {listing.images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImg(i => i > 0 ? i - 1 : listing.images.length - 1)}
                        style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
                      <button onClick={() => setCurrentImg(i => i < listing.images.length - 1 ? i + 1 : 0)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>›</button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.muted, fontSize: '48px' }}>🏍</div>
              )}
            </div>
            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', overflow: 'auto' }}>
                {listing.images.map((img, i) => (
                  <div key={i} onClick={() => setCurrentImg(i)} style={{
                    width: '60px', height: '45px', borderRadius: '3px', overflow: 'hidden',
                    cursor: 'pointer', border: `2px solid ${currentImg === i ? c.green : c.border}`,
                    flexShrink: 0, opacity: currentImg === i ? 1 : 0.6,
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px', padding: '20px' }}>
              {/* Key info */}
              <div style={{ fontSize: '12px', color: c.muted, marginBottom: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
                車型年份: {listing.year}款 &nbsp;&nbsp; 領牌: {listing.plate_date || '—'}
              </div>
              <div style={{ fontSize: '12px', color: c.muted, marginBottom: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
                行駛里程: {formatMileage(listing.mileage_km)}
              </div>

              {/* Price */}
              <div style={{ margin: '16px 0', padding: '16px 0', borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
                <div style={{ fontSize: '12px', color: c.muted, marginBottom: '6px' }}>商家報價</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '32px', color: c.green, fontWeight: 'bold' }}>
                  ${listing.price.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>
                  {listing.negotiable && '可議價 · '}
                  {listing.includes_shipping && '含運費 · '}
                  {listing.includes_transfer && '辦到好 · '}
                  *實際售價以當地經銷商價格為準
                </div>
              </div>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {listing.tags.map((tag, i) => (
                    <span key={i} style={{
                      backgroundColor: i === 0 ? c.red : c.gold,
                      color: c.bg, padding: '3px 10px', fontSize: '11px',
                      fontWeight: 'bold', borderRadius: '3px',
                    }}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button style={{
                  flex: 1, padding: '10px', backgroundColor: c.green, color: c.bg,
                  border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px',
                  cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif",
                }}>
                  📞 詢車況
                </button>
                <button style={{
                  flex: 1, padding: '10px', backgroundColor: 'transparent', color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: '4px', fontSize: '13px',
                  cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif",
                }}>
                  🏠 聯絡商家
                </button>
                <button style={{
                  padding: '10px 14px', backgroundColor: 'transparent', color: c.red,
                  border: `1px solid ${c.red}`, borderRadius: '4px', fontSize: '13px',
                  cursor: 'pointer',
                }}>
                  ♥ 收藏
                </button>
              </div>
            </div>

            {/* Location */}
            <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px', padding: '14px 20px', marginTop: '12px', fontSize: '12px' }}>
              <span style={{ color: c.muted }}>📍 </span>
              <span style={{ color: c.text }}>{listing.city}{listing.district ? ` ${listing.district}` : ''}{listing.address ? ` ${listing.address}` : ''}</span>
            </div>

            {/* View / Fav counts */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: c.muted }}>
              <span>👁 瀏覽 {listing.view_count}</span>
              <span>♥ 收藏 {listing.favorite_count}</span>
              <span>📅 {listing.published_at ? new Date(listing.published_at).toLocaleDateString('zh-TW') : new Date(listing.created_at).toLocaleDateString('zh-TW')}</span>
            </div>
          </div>
        </div>

        {/* ═══ Vehicle Condition Table ═══ */}
        <section style={{ marginTop: '30px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', color: c.text, marginBottom: '16px', letterSpacing: '1px' }}>
            VEHICLE CONDITION 車況訊息
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            border: `1px solid ${c.border}`, borderRadius: '4px', overflow: 'hidden',
          }}>
            {infoRows.map((row, i) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: i % 2 === 0 ? c.card : '#1a1a1f',
                borderBottom: `1px solid ${c.border}`,
              }}>
                <span style={{ fontSize: '12px', color: c.muted }}>{row.label}</span>
                <span style={{ fontSize: '12px', color: row.value.includes('✓') ? c.green : c.text, fontWeight: 'bold' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Dealer Section ═══ */}
        {dealer && (
          <section style={{ marginTop: '30px' }}>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', color: c.text, marginBottom: '16px', letterSpacing: '1px' }}>
              DEALER 經銷商
            </h2>
            <div style={{
              backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px',
              padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', backgroundColor: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                border: `2px solid ${dealer.is_certified ? c.green : c.border}`,
              }}>
                {dealer.logo_url ? (
                  <img src={dealer.logo_url} alt={dealer.shop_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '24px' }}>🏪</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: c.text, fontFamily: "'Noto Sans TC', sans-serif" }}>
                    {dealer.shop_name}
                  </span>
                  {dealer.is_certified && (
                    <span style={{ backgroundColor: c.green, color: c.bg, padding: '2px 8px', fontSize: '9px', fontWeight: 'bold', borderRadius: '2px' }}>認證</span>
                  )}
                  {dealer.city && <span style={{ fontSize: '11px', color: c.muted }}>{dealer.city}</span>}
                </div>
                <div style={{ fontSize: '11px', color: c.muted }}>
                  累計成交 {dealer.total_sales} 台 · 評分 {dealer.rating}/5
                </div>
              </div>
              <button style={{
                padding: '8px 20px', backgroundColor: c.green, color: c.bg,
                border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px',
                cursor: 'pointer', fontFamily: "'Noto Sans TC', sans-serif",
              }}>
                聯絡商家
              </button>
            </div>
          </section>
        )}

        {/* ═══ Similar Listings ═══ */}
        {similarListings.length > 0 && (
          <section style={{ marginTop: '30px' }}>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', color: c.text, marginBottom: '16px', letterSpacing: '1px' }}>
              SIMILAR LISTINGS 相似車輛
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {similarListings.map(item => (
                <Link key={item.id} href={`/used/${item.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px',
                    overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = c.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
                  >
                    <div style={{ height: '120px', backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: c.muted, fontSize: '24px' }}>🏍</span>
                      )}
                    </div>
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontSize: '11px', color: c.muted, marginBottom: '4px' }}>{item.brand}</div>
                      <div style={{ fontSize: '12px', color: c.text, fontWeight: 'bold', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Noto Sans TC', sans-serif" }}>{item.title}</div>
                      <div style={{ fontSize: '14px', color: c.green, fontWeight: 'bold', fontFamily: "'Orbitron', monospace" }}>
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <section style={{ padding: '40px 20px', textAlign: 'center', borderTop: `1px solid ${c.border}`, marginTop: '40px' }}>
        <p style={{ fontSize: '12px', color: c.muted, margin: 0 }}>
          HYMMOTO.TW USED MARKETPLACE
        </p>
      </section>
    </div>
  );
}
