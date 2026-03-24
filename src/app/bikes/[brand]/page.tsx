'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

const BrandPage = () => {
  const params = useParams();
  const brandSlug = (params.brand as string).toLowerCase();
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'cc-asc' | 'sales'>('price-asc');

  const brandData: Record<string, any> = {
    yamaha: {
      name: 'YAMAHA',
      models: 24,
      avgPrice: '19.8萬',
      mostPopular: 'XMAX 300',
      marketShare: '18%',
      vehicles: [
        { id: 1, model: 'XMAX 300', cc: 300, price: '17.8萬', hp: 23, weight: 210, rank: 'A' },
        { id: 2, model: 'MT-07', cc: 689, price: '29.8萬', hp: 55, weight: 184, rank: 'S' },
        { id: 3, model: 'YZF-R7', cc: 689, price: '29.8萬', hp: 55, weight: 184, rank: 'S' },
        { id: 4, model: 'NMAX 155', cc: 155, price: '9.8萬', hp: 15, weight: 142, rank: 'B' },
        { id: 5, model: 'TMAX 560', cc: 560, price: '32.8萬', hp: 48, weight: 205, rank: 'A' },
        { id: 6, model: 'SR400', cc: 399, price: '22.8萬', hp: 30, weight: 197, rank: 'B' },
        { id: 7, model: 'YZF-R1', cc: 998, price: '48.8萬', hp: 79, weight: 199, rank: 'S' },
        { id: 8, model: 'FJR1300', cc: 1298, price: '59.8萬', hp: 113, weight: 269, rank: 'S' },
      ],
    },
    kymco: {
      name: 'KYMCO',
      models: 24,
      avgPrice: '15.8萬',
      mostPopular: 'Xciting 400',
      marketShare: '16%',
      vehicles: [
        { id: 1, model: 'Xciting 400', cc: 400, price: '18.8萬', hp: 31, weight: 202, rank: 'S' },
        { id: 2, model: 'Xciting 300', cc: 300, price: '15.8萬', hp: 25, weight: 192, rank: 'A' },
        { id: 3, model: 'G-Dink 300', cc: 300, price: '16.8萬', hp: 24, weight: 195, rank: 'A' },
        { id: 4, model: 'Like 150', cc: 150, price: '8.8萬', hp: 11, weight: 112, rank: 'C' },
        { id: 5, model: 'Venox 250', cc: 250, price: '13.8萬', hp: 20, weight: 162, rank: 'B' },
        { id: 6, model: 'AK 550', cc: 550, price: '19.8萬', hp: 42, weight: 208, rank: 'A' },
        { id: 7, model: 'Xciting S400', cc: 400, price: '19.8萬', hp: 33, weight: 210, rank: 'A' },
        { id: 8, model: 'People S 200', cc: 200, price: '12.8萬', hp: 18, weight: 145, rank: 'B' },
      ],
    },
    honda: {
      name: 'HONDA',
      models: 35,
      avgPrice: '21.8萬',
      mostPopular: 'PCX 160',
      marketShare: '22%',
      vehicles: [
        { id: 1, model: 'CB500X', cc: 500, price: '25.8萬', hp: 47, weight: 189, rank: 'A' },
        { id: 2, model: 'PCX 160', cc: 160, price: '8.8萬', hp: 13, weight: 131, rank: 'B' },
        { id: 3, model: 'CB1000BK', cc: 998, price: '42.8萬', hp: 87, weight: 212, rank: 'S' },
        { id: 4, model: 'ADV 150', cc: 150, price: '9.8萬', hp: 12, weight: 130, rank: 'B' },
        { id: 5, model: 'CB150R', cc: 150, price: '7.8萬', hp: 13, weight: 130, rank: 'C' },
        { id: 6, model: 'NC750X', cc: 745, price: '31.8萬', hp: 55, weight: 238, rank: 'A' },
        { id: 7, model: 'CB500F', cc: 471, price: '24.8萬', hp: 44, weight: 188, rank: 'A' },
        { id: 8, model: 'CBR650R', cc: 649, price: '28.8萬', hp: 60, weight: 209, rank: 'A' },
      ],
    },
  };

  const data = brandData[brandSlug];

  if (!data) {
    return (
      <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '32px', margin: '0 0 20px 0' }}>品牌未找到</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Brand Header */}
      <section style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#ebdbb2', letterSpacing: '2px' }}>
          {data.name}
        </h1>
        <p style={{ fontSize: '16px', color: '#b8f53e', margin: '0 0 20px 0', letterSpacing: '1px' }}>
          車款列表
        </p>
        <p style={{ fontSize: '14px', color: '#928374', margin: '0', letterSpacing: '0.5px' }}>
          共 {data.models} 款車型
        </p>
      </section>

      {/* Brand Stats */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div style={{ padding: '15px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>車款數</p>
            <p style={{ fontSize: '18px', color: '#b8f53e', fontWeight: 'bold', margin: '0' }}>{data.models}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>平均售價</p>
            <p style={{ fontSize: '18px', color: '#fabd2f', fontWeight: 'bold', margin: '0' }}>{data.avgPrice}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>最熱門</p>
            <p style={{ fontSize: '18px', color: '#fb4934', fontWeight: 'bold', margin: '0' }}>{data.mostPopular}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0' }}>市佔率</p>
            <p style={{ fontSize: '18px', color: '#b8f53e', fontWeight: 'bold', margin: '0' }}>{data.marketShare}</p>
          </div>
        </div>
      </section>

      {/* Sort/Filter Bar */}
      <section style={{ padding: '25px 20px', borderBottom: '1px solid #3c3836', textAlign: 'center' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', color: '#928374', marginRight: '10px', letterSpacing: '0.5px' }}>排序:</label>
          {['price-asc', 'price-desc', 'cc-asc', 'sales'].map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt as any)}
              style={{
                padding: '6px 12px',
                margin: '0 5px',
                backgroundColor: sortBy === opt ? '#b8f53e' : '#282828',
                color: sortBy === opt ? '#1d2021' : '#ebdbb2',
                border: `1px solid ${sortBy === opt ? '#b8f53e' : '#3c3836'}`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                cursor: 'pointer',
                borderRadius: '3px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
            >
              {opt === 'price-asc' && '價格↑'}
              {opt === 'price-desc' && '價格↓'}
              {opt === 'cc-asc' && 'CC↑'}
              {opt === 'sales' && '銷量'}
            </button>
          ))}
        </div>
      </section>

      {/* Vehicle Grid */}
      <section style={{ padding: '40px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {data.vehicles.map((vehicle: any) => (
            <div
              key={vehicle.id}
              style={{
                padding: '20px',
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#b8f53e';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(184, 245, 62, 0.2)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {/* Image Placeholder */}
              <div style={{
                width: '100%',
                height: '150px',
                background: 'linear-gradient(135deg, #3c3836 0%, #282828 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                marginBottom: '15px',
                fontSize: '28px',
                fontFamily: "'Orbitron', monospace",
                color: '#b8f53e',
                fontWeight: 'bold',
              }}>
                //
              </div>

              {/* Rank Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: vehicle.rank === 'S' ? '#b8f53e' : vehicle.rank === 'A' ? '#fabd2f' : '#fb4934',
                color: vehicle.rank === 'S' || vehicle.rank === 'A' ? '#1d2021' : '#fff',
                padding: '6px 12px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}>
                {vehicle.rank} RANK
              </div>

              {/* Model Name */}
              <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#ebdbb2', letterSpacing: '0.5px' }}>
                {vehicle.model}
              </h3>

              {/* Specs */}
              <div style={{ fontSize: '12px', color: '#928374', marginBottom: '10px', textAlign: 'center', lineHeight: '1.8' }}>
                <div>{vehicle.cc}cc / {vehicle.hp}hp</div>
                <div>重量: {vehicle.weight}kg</div>
              </div>

              {/* Price */}
              <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', textAlign: 'center', letterSpacing: '0.5px' }}>
                NT${vehicle.price}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BrandPage;
