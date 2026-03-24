'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface CPOValuation {
  brand: string;
  model_name: string;
  buy_year: number;
  price: number | null;
  quantity: number;
}

const gruvboxColors = {
  bg: '#1d2021',
  card: '#282828',
  border: '#3c3836',
  text: '#ebdbb2',
  muted: '#928374',
  green: '#b8f53e',
  gold: '#fabd2f',
};

function bar(value: number, max: number = 10): string {
  const filled = Math.round((value / max) * 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export default function UsedPage() {
  const [valuations, setValuations] = useState<CPOValuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchValuations = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('cpo_valuations')
          .select('brand, model_name, buy_year, price, quantity')
          .order('brand', { ascending: true });

        if (error) throw error;

        const typedData = (data || []) as CPOValuation[];
        setValuations(typedData);

        // Extract unique brands with model count
        const brandMap = new Map<string, number>();
        typedData.forEach((item) => {
          brandMap.set(item.brand, (brandMap.get(item.brand) || 0) + 1);
        });

        const brandList = Array.from(brandMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setBrands(brandList);
      } catch (error) {
        console.error('Error fetching valuations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchValuations();
  }, []);

  // Filter valuations by search term
  const filteredValuations = valuations.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.brand.toLowerCase().includes(search) ||
      item.model_name.toLowerCase().includes(search)
    );
  });

  // Filter brands by search term
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get recent valuations for display
  const recentValuations = filteredValuations
    .slice(0, 20)
    .sort((a, b) => b.buy_year - a.buy_year);

  return (
    <div
      style={{
        backgroundColor: gruvboxColors.bg,
        color: gruvboxColors.text,
        fontFamily: 'JetBrains Mono, monospace',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      {/* Terminal Header */}
      <div
        style={{
          borderBottom: `1px solid ${gruvboxColors.border}`,
          paddingBottom: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ fontSize: '0.875rem', color: gruvboxColors.muted }}>
          guest@hymmoto.tw:~$ used --valuations
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: gruvboxColors.green,
            marginBottom: '0.5rem',
          }}
        >
          USED VEHICLE CENTER
        </h1>
        <p style={{ fontSize: '0.875rem', color: gruvboxColors.muted }}>
          / 中古車估價中心
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            backgroundColor: gruvboxColors.card,
            border: `1px solid ${gruvboxColors.border}`,
            padding: '1.5rem',
            marginBottom: '2rem',
            color: gruvboxColors.muted,
            fontSize: '0.875rem',
          }}
        >
          Loading valuations from Supabase...
        </div>
      )}

      {!loading && (
        <>
          {/* Search Section */}
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="輸入品牌或車型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: gruvboxColors.card,
                color: gruvboxColors.text,
                border: `1px solid ${gruvboxColors.border}`,
                padding: '0.75rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Brand Cards Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div
              style={{
                color: gruvboxColors.gold,
                fontSize: '0.875rem',
                marginBottom: '1rem',
                fontWeight: 'bold',
              }}
            >
              [ BRANDS ]
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem',
              }}
            >
              {filteredBrands.map((brand) => (
                <div
                  key={brand.name}
                  style={{
                    backgroundColor: gruvboxColors.card,
                    border: `1px solid ${gruvboxColors.border}`,
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      gruvboxColors.green;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      gruvboxColors.border;
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: gruvboxColors.text,
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {brand.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: gruvboxColors.muted,
                    }}
                  >
                    {brand.count} model{brand.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Valuations Section */}
          <div>
            <div
              style={{
                color: gruvboxColors.gold,
                fontSize: '0.875rem',
                marginBottom: '1rem',
                fontWeight: 'bold',
              }}
            >
              [ RECENT VALUATIONS ]
            </div>

            {recentValuations.length === 0 ? (
              <div
                style={{
                  backgroundColor: gruvboxColors.card,
                  border: `1px solid ${gruvboxColors.border}`,
                  padding: '1.5rem',
                  color: gruvboxColors.muted,
                  fontSize: '0.875rem',
                }}
              >
                No valuations found.
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {recentValuations.map((valuation, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: gruvboxColors.card,
                      border: `1px solid ${gruvboxColors.border}`,
                      padding: '1rem',
                      fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <span style={{ color: gruvboxColors.green }}>
                          {valuation.brand}
                        </span>
                        <span style={{ color: gruvboxColors.muted }}>
                          {' '}
                          /{' '}
                        </span>
                        <span style={{ color: gruvboxColors.text }}>
                          {valuation.model_name}
                        </span>
                      </div>
                      <div style={{ color: gruvboxColors.gold }}>
                        {valuation.buy_year}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: gruvboxColors.muted }}>
                        qty:
                      </span>
                      <span style={{ color: gruvboxColors.green }}>
                        {bar(valuation.quantity)}
                      </span>
                      <span style={{ color: gruvboxColors.text }}>
                        {valuation.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
