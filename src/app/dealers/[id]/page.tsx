'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Dealer {
  id: number;
  user_id: string;
  shop_name: string;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  business_hours: string | null;
  description: string | null;
  website_url: string | null;
  line_id: string | null;
  facebook_url: string | null;
  is_certified: boolean;
  rating: number;
  total_sales: number;
  created_at: string;
}

interface Listing {
  id: number;
  brand: string;
  model_name: string;
  title: string;
  year: number;
  mileage_km: number | null;
  price: number;
  city: string;
  images: string[];
  tags: string[];
  view_count: number;
  published_at: string | null;
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

export default function DealerPage() {
  const params = useParams();
  const dealerId = params.id as string;
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: dealerData, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', parseInt(dealerId))
        .single();

      if (error || !dealerData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setDealer(dealerData as Dealer);

      // Fetch dealer's listings
      const { data: listingsData } = await supabase
        .from('used_listings')
        .select('id, brand, model_name, title, year, mileage_km, price, city, images, tags, view_count, published_at')
        .eq('dealer_id', dealerData.id)
        .eq('status', 'active')
        .order('published_at', { ascending: false });

      if (listingsData) setListings(listingsData as Listing[]);
      setLoading(false);
    };
    fetchData();
  }, [dealerId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <pre style={{ fontSize: '14px', color: c.muted }}>Loading dealer #{dealerId}... ⏳</pre>
      </div>
    );
  }

  if (notFound || !dealer) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: '14px', color: c.muted, margin: '0 0 16px 0' }}>{`error: dealer not found\nstatus: 404`}</pre>
          <Link href="/used" style={{ color: c.green, fontSize: '13px' }}>← 回到中古車列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh' }}>
      {/* Terminal Header */}
      <section style={{ padding: '16px 20px', backgroundColor: c.card, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <pre style={{ fontSize: '12px', margin: 0, color: c.green }}>
            guest@hymmoto.tw:~$ dealers --profile #{dealer.id}
          </pre>
          <Link href="/used" style={{ color: c.muted, fontSize: '12px', textDecoration: 'none' }}>← 返回列表</Link>
        </div>
      </section>

      {/* Cover + Profile */}
      <section style={{
        position: 'relative',
        height: '200px',
        backgroundColor: c.card,
        backgroundImage: dealer.cover_url ? `url(${dealer.cover_url})` : 'linear-gradient(135deg, #3c383640 0%, #282828 100%)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{
          position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
          width: '80px', height: '80px', borderRadius: '50%', backgroundColor: c.bg,
          border: `3px solid ${dealer.is_certified ? c.green : c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', zIndex: 1,
        }}>
          {dealer.logo_url ? (
            <img src={dealer.logo_url} alt={dealer.shop_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '32px' }}>🏪</span>
          )}
        </div>
      </section>

      {/* Dealer Info */}
      <section style={{ textAlign: 'center', paddingTop: '50px', paddingBottom: '30px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: c.text, fontFamily: "'Noto Sans TC', sans-serif" }}>
            {dealer.shop_name}
          </h1>
          {dealer.is_certified && (
            <span style={{ backgroundColor: c.green, color: c.bg, padding: '3px 10px', fontSize: '10px', fontWeight: 'bold', borderRadius: '3px' }}>
              平台認證
            </span>
          )}
        </div>
        {dealer.city && <p style={{ fontSize: '12px', color: c.muted, margin: '4px 0' }}>📍 {dealer.city}{dealer.district ? ` ${dealer.district}` : ''}</p>}
        {dealer.description && <p style={{ fontSize: '13px', color: c.text, margin: '12px auto', maxWidth: '600px', lineHeight: 1.6, fontFamily: "'Noto Sans TC', sans-serif" }}>{dealer.description}</p>}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: c.green, fontFamily: "'Orbitron', monospace" }}>{listings.length}</div>
            <div style={{ fontSize: '11px', color: c.muted }}>在售車輛</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: c.gold, fontFamily: "'Orbitron', monospace" }}>{dealer.total_sales}</div>
            <div style={{ fontSize: '11px', color: c.muted }}>累計成交</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: c.blue, fontFamily: "'Orbitron', monospace" }}>{dealer.rating}</div>
            <div style={{ fontSize: '11px', color: c.muted }}>評分</div>
          </div>
        </div>

        {/* Contact buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          {dealer.phone && (
            <a href={`tel:${dealer.phone}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: c.green, color: c.bg, padding: '8px 20px',
              borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none',
            }}>
              📞 {dealer.phone}
            </a>
          )}
          {dealer.line_id && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#06C755', color: '#fff', padding: '8px 20px',
              borderRadius: '4px', fontWeight: 'bold', fontSize: '12px',
            }}>
              LINE: {dealer.line_id}
            </span>
          )}
          {dealer.facebook_url && (
            <a href={dealer.facebook_url} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#1877F2', color: '#fff', padding: '8px 20px',
              borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none',
            }}>
              Facebook
            </a>
          )}
        </div>

        {/* Business info */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', fontSize: '11px', color: c.muted, flexWrap: 'wrap' }}>
          {dealer.address && <span>📍 {dealer.address}</span>}
          {dealer.business_hours && <span>🕐 {dealer.business_hours}</span>}
          {dealer.website_url && <a href={dealer.website_url} target="_blank" rel="noreferrer" style={{ color: c.blue }}>🌐 官網</a>}
        </div>
      </section>

      {/* Dealer Listings */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', color: c.text, marginBottom: '20px', letterSpacing: '1px' }}>
          INVENTORY 在售車輛 ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, padding: '40px', textAlign: 'center', borderRadius: '4px' }}>
            <p style={{ color: c.muted, fontSize: '13px' }}>目前沒有在售車輛</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {listings.map(item => (
              <Link key={item.id} href={`/used/${item.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '4px',
                  overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = c.green}
                onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
                >
                  <div style={{ height: '160px', backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: c.muted, fontSize: '32px' }}>🏍</span>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ backgroundColor: c.green, color: c.bg, padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '2px' }}>{item.brand}</span>
                      <span style={{ fontSize: '10px', color: c.muted }}>{item.year}年</span>
                    </div>
                    <div style={{ fontSize: '13px', color: c.text, fontWeight: 'bold', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Noto Sans TC', sans-serif" }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: c.green, fontFamily: "'Orbitron', monospace" }}>
                        {formatPrice(item.price)}
                      </div>
                      <span style={{ fontSize: '10px', color: c.muted }}>👁 {item.view_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <section style={{ padding: '40px 20px', textAlign: 'center', borderTop: `1px solid ${c.border}`, marginTop: '20px' }}>
        <p style={{ fontSize: '12px', color: c.muted, margin: 0 }}>HYMMOTO.TW DEALER PROFILE</p>
      </section>
    </div>
  );
}
