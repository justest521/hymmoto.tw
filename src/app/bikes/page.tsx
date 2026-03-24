'use client';

import { useState } from 'react';

const BikesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const brands = [
    { name: 'KYMCO', models: 24, icon: '//' },
    { name: 'YAMAHA', models: 31, icon: '//' },
    { name: 'SYM', models: 28, icon: '//' },
    { name: 'GOGORO', models: 12, icon: '>>' },
    { name: 'HONDA', models: 35, icon: '//' },
    { name: 'SUZUKI', models: 18, icon: '//' },
    { name: 'KAWASAKI', models: 16, icon: '//' },
    { name: 'BMW', models: 9, icon: '//' },
    { name: 'DUCATI', models: 11, icon: '//' },
    { name: 'KTM', models: 14, icon: '//' },
    { name: 'TRIUMPH', models: 8, icon: '//' },
    { name: 'AEON', models: 22, icon: '//' },
  ];

  const ccClasses = [
    { label: '50cc', value: '50' },
    { label: '125cc', value: '125' },
    { label: '250cc', value: '250' },
    { label: '400cc', value: '400' },
    { label: '500cc', value: '500' },
    { label: '600cc', value: '600' },
    { label: '1000cc', value: '1000' },
    { label: '1200cc+', value: '1200' },
  ];

  const latestVehicles = [
    { id: 1, brand: 'YAMAHA', model: 'YZF-R7', cc: 689, price: '29.8萬', image: '//' },
    { id: 2, brand: 'SUZUKI', model: 'GSX-S1000', cc: 999, price: '52.5萬', image: '//' },
    { id: 3, brand: 'KAWASAKI', model: 'Ninja 400', cc: 399, price: '18.9萬', image: '//' },
    { id: 4, brand: 'KTM', model: '390 Duke', cc: 390, price: '16.8萬', image: '//' },
    { id: 5, brand: 'HONDA', model: 'CB500F', cc: 471, price: '24.5萬', image: '//' },
    { id: 6, brand: 'YAMAHA', model: 'MT-07', cc: 689, price: '31.2萬', image: '//' },
  ];

  return (
    <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Hero Section */}
      <section style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#ebdbb2', letterSpacing: '2px' }}>
          VEHICLE DATABASE
        </h1>
        <p style={{ fontSize: '16px', color: '#b8f53e', margin: '0 0 5px 0', letterSpacing: '1px' }}>
          車款資料庫
        </p>
        <p style={{ fontSize: '14px', color: '#928374', margin: '0', letterSpacing: '0.5px' }}>
          566+ 台灣在售車款完整規格
        </p>
      </section>

      {/* Search Bar */}
      <section style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
        <input
          type="text"
          placeholder="搜尋車款、品牌..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 16px',
            backgroundColor: '#282828',
            border: '1px solid #3c3836',
            color: '#ebdbb2',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '14px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            borderRadius: '4px',
            outline: 'none',
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#b8f53e';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(184, 245, 62, 0.3)';
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        />
      </section>

      {/* Brands Grid */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          BRANDS 品牌
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {brands.map((brand) => (
            <div
              key={brand.name}
              style={{
                padding: '20px',
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#b8f53e';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(184, 245, 62, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '24px', fontFamily: "'Orbitron', monospace", color: '#b8f53e', fontWeight: 'bold', marginBottom: '10px' }}>{brand.icon}</div>
              <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
                {brand.name}
              </h3>
              <p style={{ fontSize: '13px', color: '#928374', margin: '0 0 8px 0' }}>
                {brand.models} 車款
              </p>
              <p style={{ fontSize: '14px', color: '#b8f53e', margin: '0', fontWeight: 'bold' }}>→</p>
            </div>
          ))}
        </div>
      </section>

      {/* CC Class Shortcuts */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 25px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          CC CLASSES 排氣量級距
        </h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {ccClasses.map((cc) => (
            <button
              key={cc.value}
              style={{
                padding: '10px 16px',
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                color: '#ebdbb2',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#fabd2f';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(245, 214, 62, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {cc.label}
            </button>
          ))}
        </div>
      </section>

      {/* Latest Vehicles */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          LATEST ADDED 最新上架
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {latestVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              style={{
                position: 'relative',
                padding: '15px',
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#b8f53e';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(184, 245, 62, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* NEW Badge */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#fb4934',
                color: '#1d2021',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '2px',
                letterSpacing: '0.5px',
              }}>
                NEW
              </div>

              {/* Image Placeholder */}
              <div style={{
                width: '100%',
                height: '140px',
                backgroundColor: 'linear-gradient(135deg, #3c3836 0%, #282828 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                marginBottom: '12px',
                fontSize: '48px',
              }}>
                {vehicle.image}
              </div>

              {/* Model Name */}
              <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ebdbb2', textAlign: 'center', letterSpacing: '0.5px' }}>
                {vehicle.model}
              </h3>

              {/* Brand Badge */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#b8f53e',
                  color: '#1d2021',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: '2px',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.5px',
                }}>
                  {vehicle.brand}
                </span>
              </div>

              {/* Specs */}
              <div style={{ fontSize: '12px', color: '#928374', marginBottom: '8px', textAlign: 'center' }}>
                <span>{vehicle.cc}cc</span>
              </div>

              {/* Price */}
              <p style={{ fontSize: '14px', color: '#b8f53e', fontWeight: 'bold', margin: '0', textAlign: 'center', letterSpacing: '0.5px' }}>
                {vehicle.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Spacing */}
      <section style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#928374', margin: '0', letterSpacing: '0.5px' }}>
          分享你的騎乘故事 SHARE YOUR RIDE
        </p>
      </section>
    </div>
  );
};

export default BikesPage;
