'use client';

import { useParams } from 'next/navigation';

const ModelPage = () => {
  const params = useParams();
  const brandSlug = (params.brand as string).toLowerCase();
  const modelSlug = (params.model as string).toLowerCase();

  const vehicleData: Record<string, Record<string, any>> = {
    yamaha: {
      'xmax-300': {
        brand: 'YAMAHA',
        model: 'XMAX 300',
        cc: 300,
        hp: 23,
        torque: 27,
        weight: 210,
        seatHeight: 795,
        price: '17.8萬',
        jobClass: '大速克達',
        rank: 'A',
        specs: [
          ['引擎形式', '水冷4ストローク単気筒'],
          ['排氣量', '292cc'],
          ['最大馬力', '23ps'],
          ['最大扭力', '27kgf·m'],
          ['車重', '210kg'],
          ['座高', '795mm'],
          ['油箱容量', '13.5L'],
          ['輪胎規格', '120/70-14 / 130/70-14'],
        ],
        attributes: [
          { name: 'POWER', value: 7, label: '動力' },
          { name: 'TORQUE', value: 8, label: '扭力' },
          { name: 'SPEED', value: 8, label: '速度' },
          { name: 'HANDLING', value: 9, label: '操控' },
          { name: 'DEFENSE', value: 8, label: '耐久' },
          { name: 'ENDURANCE', value: 9, label: '續航' },
        ],
        overallScore: 8,
        suggestedPrice: 178000,
        usedMin: 120000,
        usedMax: 160000,
        residualRate: '72%',
        salesTrend: [1240, 1580, 1890, 2100, 2340, 2560],
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        similarModels: [
          { brand: 'YAMAHA', model: 'NMAX 155', cc: 155, price: '9.8萬', rank: 'B' },
          { brand: 'YAMAHA', model: 'TMAX 560', cc: 560, price: '32.8萬', rank: 'A' },
          { brand: 'KYMCO', model: 'Xciting 400', cc: 400, price: '18.8萬', rank: 'S' },
          { brand: 'KYMCO', model: 'G-Dink 300', cc: 300, price: '16.8萬', rank: 'A' },
        ],
      },
      'mt-07': {
        brand: 'YAMAHA',
        model: 'MT-07',
        cc: 689,
        hp: 55,
        torque: 68,
        weight: 184,
        seatHeight: 820,
        price: '29.8萬',
        jobClass: '街車',
        rank: 'S',
        specs: [
          ['引擎形式', '水冷4ストロークV型2気筒'],
          ['排氣量', '689cc'],
          ['最大馬力', '55ps'],
          ['最大扭力', '68kgf·m'],
          ['車重', '184kg'],
          ['座高', '820mm'],
          ['油箱容量', '14L'],
          ['輪胎規格', '120/70ZR17 / 180/55ZR17'],
        ],
        attributes: [
          { name: 'POWER', value: 9, label: '動力' },
          { name: 'TORQUE', value: 9, label: '扭力' },
          { name: 'SPEED', value: 9, label: '速度' },
          { name: 'HANDLING', value: 9, label: '操控' },
          { name: 'DEFENSE', value: 7, label: '耐久' },
          { name: 'ENDURANCE', value: 8, label: '續航' },
        ],
        overallScore: 9,
        suggestedPrice: 298000,
        usedMin: 220000,
        usedMax: 280000,
        residualRate: '78%',
        salesTrend: [890, 950, 1100, 1250, 1350, 1420],
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        similarModels: [
          { brand: 'HONDA', model: 'CB500F', cc: 500, price: '24.8萬', rank: 'A' },
          { brand: 'KAWASAKI', model: 'Ninja 400', cc: 400, price: '19.8萬', rank: 'B' },
          { brand: 'SUZUKI', model: 'GSX-S750', cc: 750, price: '30.8萬', rank: 'S' },
          { brand: 'KYMCO', model: 'Venox 250', cc: 250, price: '13.8萬', rank: 'B' },
        ],
      },
    },
    kymco: {
      'xciting-400': {
        brand: 'KYMCO',
        model: 'Xciting 400',
        cc: 400,
        hp: 31,
        torque: 36,
        weight: 202,
        seatHeight: 790,
        price: '18.8萬',
        jobClass: '大速克達',
        rank: 'S',
        specs: [
          ['引擎形式', '水冷4ストローク単気筒'],
          ['排氣量', '399cc'],
          ['最大馬力', '31ps'],
          ['最大扭力', '36kgf·m'],
          ['車重', '202kg'],
          ['座高', '790mm'],
          ['油箱容量', '10L'],
          ['輪胎規格', '130/70-13 / 160/60-13'],
        ],
        attributes: [
          { name: 'POWER', value: 9, label: '動力' },
          { name: 'TORQUE', value: 8, label: '扭力' },
          { name: 'SPEED', value: 9, label: '速度' },
          { name: 'HANDLING', value: 8, label: '操控' },
          { name: 'DEFENSE', value: 8, label: '耐久' },
          { name: 'ENDURANCE', value: 8, label: '續航' },
        ],
        overallScore: 8,
        suggestedPrice: 188000,
        usedMin: 140000,
        usedMax: 170000,
        residualRate: '75%',
        salesTrend: [1560, 1720, 1950, 2150, 2380, 2540],
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        similarModels: [
          { brand: 'KYMCO', model: 'Xciting 300', cc: 300, price: '15.8萬', rank: 'A' },
          { brand: 'KYMCO', model: 'AK 550', cc: 550, price: '19.8萬', rank: 'A' },
          { brand: 'YAMAHA', model: 'XMAX 300', cc: 300, price: '17.8萬', rank: 'A' },
          { brand: 'SYM', model: 'GTS 250', cc: 250, price: '12.8萬', rank: 'B' },
        ],
      },
    },
    honda: {
      'cb500f': {
        brand: 'HONDA',
        model: 'CB500F',
        cc: 500,
        hp: 47,
        torque: 51,
        weight: 189,
        seatHeight: 792,
        price: '24.8萬',
        jobClass: '中型街車',
        rank: 'A',
        specs: [
          ['引擎形式', '水冷4ストロークV型2気筒'],
          ['排氣量', '471cc'],
          ['最大馬力', '47ps'],
          ['最大扭力', '51kgf·m'],
          ['車重', '189kg'],
          ['座高', '792mm'],
          ['油箱容量', '15L'],
          ['輪胎規格', '120/70ZR17 / 160/60ZR17'],
        ],
        attributes: [
          { name: 'POWER', value: 8, label: '動力' },
          { name: 'TORQUE', value: 8, label: '扭力' },
          { name: 'SPEED', value: 8, label: '速度' },
          { name: 'HANDLING', value: 9, label: '操控' },
          { name: 'DEFENSE', value: 8, label: '耐久' },
          { name: 'ENDURANCE', value: 9, label: '續航' },
        ],
        overallScore: 8,
        suggestedPrice: 248000,
        usedMin: 180000,
        usedMax: 220000,
        residualRate: '76%',
        salesTrend: [1100, 1250, 1380, 1520, 1650, 1780],
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        similarModels: [
          { brand: 'YAMAHA', model: 'MT-07', cc: 689, price: '29.8萬', rank: 'S' },
          { brand: 'KAWASAKI', model: 'Ninja 500', cc: 500, price: '22.8萬', rank: 'A' },
          { brand: 'SUZUKI', model: 'GSX-S500', cc: 500, price: '23.8萬', rank: 'B' },
          { brand: 'KYMCO', model: 'AK 550', cc: 550, price: '19.8萬', rank: 'A' },
        ],
      },
    },
  };

  const vehicle = vehicleData[brandSlug]?.[modelSlug];

  if (!vehicle) {
    return (
      <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '32px' }}>車款未找到</h1>
      </div>
    );
  }

  const maxSales = Math.max(...vehicle.salesTrend);

  return (
    <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Hero Section */}
      <section style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
        <div style={{
          width: '100%',
          height: '250px',
          background: 'linear-gradient(135deg, #3c3836 0%, #282828 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          marginBottom: '30px',
          fontSize: '36px',
          fontFamily: "'Orbitron', monospace",
          color: '#b8f53e',
          fontWeight: 'bold',
        }}>
          //
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#ebdbb2', letterSpacing: '2px' }}>
          {vehicle.model}
        </h1>
        <div style={{ display: 'inline-block', backgroundColor: '#b8f53e', color: '#1d2021', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', marginTop: '15px', fontSize: '13px', letterSpacing: '1px' }}>
          {vehicle.brand}
        </div>
      </section>

      {/* Quick Stats */}
      <section style={{ padding: '30px 20px', borderBottom: '1px solid #3c3836', textAlign: 'center' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          justifyContent: 'center',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>CC</p>
            <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.cc}cc</p>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>HP</p>
            <p style={{ fontSize: '16px', color: '#fabd2f', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.hp}ps</p>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>扭力</p>
            <p style={{ fontSize: '16px', color: '#fb4934', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.torque}kgf·m</p>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>車重</p>
            <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.weight}kg</p>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>座高</p>
            <p style={{ fontSize: '16px', color: '#fabd2f', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.seatHeight}mm</p>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>售價</p>
            <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.price}</p>
          </div>
        </div>
      </section>

      {/* RPG CHARACTER CARD */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          RPG CHARACTER CARD
        </h2>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '25px',
          backgroundColor: '#282828',
          border: '2px solid #b8f53e',
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(184, 245, 62, 0.2)',
        }}>
          {/* Job Class & Rank */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <p style={{ fontSize: '13px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>Job Class</p>
            <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#b8f53e', letterSpacing: '1px' }}>
              {vehicle.jobClass.toUpperCase()} / {vehicle.jobClass}
            </h3>
            <div style={{ display: 'inline-block', backgroundColor: vehicle.rank === 'S' ? '#b8f53e' : vehicle.rank === 'A' ? '#fabd2f' : '#fb4934', color: '#1d2021', padding: '8px 16px', borderRadius: '3px', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
              {vehicle.rank} RANK
            </div>
          </div>

          {/* Attribute Bars */}
          <div style={{ marginBottom: '25px' }}>
            {vehicle.attributes.map((attr: any) => (
              <div key={attr.name} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#ebdbb2', fontWeight: 'bold', letterSpacing: '0.5px' }}>{attr.name}</span>
                  <span style={{ fontSize: '12px', color: '#b8f53e', fontWeight: 'bold' }}>{attr.value}/10</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#3c3836',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(attr.value / 10) * 100}%`,
                    background: 'linear-gradient(90deg, #b8f53e 0%, #fabd2f 100%)',
                    borderRadius: '2px',
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Score */}
          <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #3c3836' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>OVERALL SCORE</p>
            <p style={{ fontFamily: "'Orbitron', monospace", fontSize: '28px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '1px' }}>
              {vehicle.overallScore}/10
            </p>
          </div>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          SPECIFICATIONS 規格
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0',
          maxWidth: '900px',
          margin: '0 auto',
          border: '1px solid #3c3836',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          {vehicle.specs.map((spec: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: '15px',
                backgroundColor: idx % 2 === 0 ? '#282828' : '#1a1a1f',
                borderBottom: idx < vehicle.specs.length - 1 ? '1px solid #3c3836' : 'none',
                borderRight: idx % 2 === 0 && idx < vehicle.specs.length - 1 ? '1px solid #3c3836' : 'none',
              }}
            >
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
                {spec[0]}
              </p>
              <p style={{ fontSize: '14px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                {spec[1]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICE & VALUATION */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          PRICE & VALUATION 價格估值
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div style={{ padding: '20px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>建議售價</p>
            <p style={{ fontSize: '18px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>NT${vehicle.suggestedPrice.toLocaleString()}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>中古行情</p>
            <p style={{ fontSize: '14px', color: '#fabd2f', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>NT${vehicle.usedMin.toLocaleString()} - ${vehicle.usedMax.toLocaleString()}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>殘值率</p>
            <p style={{ fontSize: '18px', color: '#fb4934', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>{vehicle.residualRate}</p>
          </div>
        </div>
      </section>

      {/* SALES TREND */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          SALES TREND 銷售趨勢
        </h2>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '25px',
          backgroundColor: '#282828',
          border: '1px solid #3c3836',
          borderRadius: '4px',
          height: '250px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          gap: '10px',
        }}>
          {vehicle.salesTrend.map((sales: number, idx: number) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${(sales / maxSales) * 200}px`,
                  background: 'linear-gradient(180deg, #b8f53e 0%, #fabd2f 100%)',
                  borderRadius: '2px',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(184, 245, 62, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              ></div>
              <span style={{ fontSize: '11px', color: '#928374', letterSpacing: '0.5px' }}>{vehicle.months[idx]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SIMILAR MODELS */}
      <section style={{ padding: '40px 20px' }}>
        <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px 0', color: '#ebdbb2', letterSpacing: '1px' }}>
          SIMILAR MODELS 類似車款
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          {vehicle.similarModels.map((model: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: '15px',
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#b8f53e';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(184, 245, 62, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '100%',
                height: '100px',
                background: 'linear-gradient(135deg, #3c3836 0%, #282828 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                marginBottom: '10px',
                fontSize: '20px',
                fontFamily: "'Orbitron', monospace",
                color: '#b8f53e',
                fontWeight: 'bold',
              }}>
                //
              </div>
              <p style={{ fontSize: '13px', color: '#928374', margin: '0 0 3px 0', letterSpacing: '0.5px' }}>{model.brand}</p>
              <h4 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ebdbb2', letterSpacing: '0.5px' }}>
                {model.model}
              </h4>
              <div style={{ fontSize: '11px', color: '#928374', marginBottom: '8px', textAlign: 'center' }}>
                {model.cc}cc
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <p style={{ fontSize: '12px', color: '#b8f53e', fontWeight: 'bold', margin: '0' }}>NT${model.price}</p>
                <span style={{
                  backgroundColor: model.rank === 'S' ? '#b8f53e' : model.rank === 'A' ? '#fabd2f' : '#fb4934',
                  color: model.rank === 'S' || model.rank === 'A' ? '#1d2021' : '#fff',
                  padding: '3px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '2px',
                  letterSpacing: '0.5px',
                }}>
                  {model.rank}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid #3c3836' }}>
        <p style={{ fontSize: '12px', color: '#928374', margin: '0', letterSpacing: '0.5px' }}>
          分享你的騎乘故事 SHARE YOUR RIDE STORY
        </p>
      </section>
    </div>
  );
};

export default ModelPage;
