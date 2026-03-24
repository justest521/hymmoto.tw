'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface VehicleSpec {
  id: number;
  brand: string;
  model_name: string;
  engine_type: string | null;
  displacement_cc: number | null;
  max_horsepower: string | null;
  max_torque: string | null;
  wet_weight_kg: number | null;
  seat_height_mm: number | null;
  fuel_tank_l: number | null;
  front_brake: string | null;
  rear_brake: string | null;
  abs_type: string | null;
  cooling_system: string | null;
  msrp: number | null;
  [key: string]: any;
}

interface CPOValuation {
  id: number;
  brand: string;
  model_name: string;
  used_price_min: number | null;
  used_price_max: number | null;
  [key: string]: any;
}

interface RPGAttribute {
  name: string;
  value: number;
  label: string;
}

interface SimilarModel {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number | null;
  max_horsepower: string | null;
  msrp: number | null;
}

const ModelPage = () => {
  const params = useParams();
  const [vehicle, setVehicle] = useState<VehicleSpec | null>(null);
  const [cpoData, setCpoData] = useState<CPOValuation | null>(null);
  const [similarModels, setSimilarModels] = useState<SimilarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [attributes, setAttributes] = useState<RPGAttribute[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [rank, setRank] = useState('');

  const decodedBrand = decodeURIComponent(params.brand as string);
  const decodedModel = decodeURIComponent(params.model as string);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      try {
        let { data: vehicleData, error } = await supabase
          .from('vehicle_specs')
          .select('*')
          .ilike('brand', decodedBrand)
          .ilike('model_name', decodedModel)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('vehicle_specs')
            .select('*')
            .ilike('brand', decodedBrand)
            .ilike('model_name', `%${decodedModel}%`)
            .single();

          if (fallbackError) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          vehicleData = fallbackData;
        } else if (error) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setVehicle(vehicleData);

        const calculatedAttributes = calculateRPGAttributes(vehicleData);
        setAttributes(calculatedAttributes.attributes);
        setOverallScore(calculatedAttributes.overallScore);
        setRank(calculatedAttributes.rank);

        const { data: cpoData } = await supabase
          .from('cpo_valuations')
          .select('*')
          .ilike('brand', vehicleData.brand)
          .ilike('model_name', vehicleData.model_name)
          .single();

        if (cpoData) {
          setCpoData(cpoData);
        }

        const cc = vehicleData.displacement_cc || 0;
        const { data: similar } = await supabase
          .from('vehicle_specs')
          .select('*')
          .or(
            `and(ilike(brand,${vehicleData.brand}),not.eq(id,${vehicleData.id})),and(displacement_cc.gte.${Math.max(0, cc - 100)},displacement_cc.lte.${cc + 100},not.eq(id,${vehicleData.id}))`
          )
          .limit(4);

        if (similar) {
          setSimilarModels(similar);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [decodedBrand, decodedModel]);

  const calculateRPGAttributes = (
    spec: VehicleSpec
  ): { attributes: RPGAttribute[]; overallScore: number; rank: string } => {
    const hpMatch = spec.max_horsepower?.match(/(\d+(?:\.\d+)?)\s*(?:hp|ps|kw)/i);
    const hp = hpMatch ? parseFloat(hpMatch[1]) : 0;
    const cc = spec.displacement_cc || 1;
    const weight = spec.wet_weight_kg || 100;
    const seatHeight = spec.seat_height_mm || 800;
    const torqueMatch = spec.max_torque?.match(/(\d+(?:\.\d+)?)/);
    const torque = torqueMatch ? parseFloat(torqueMatch[1]) : 0;
    const fuelTank = spec.fuel_tank_l || 10;

    const powerScore = Math.min(10, (hp / cc) * 2 + 2);
    const torqueScore = Math.min(10, (torque / 50) * 10);
    const speedScore = Math.min(10, ((hp / weight) * 20) + 1);
    const handlingScore = Math.min(10, (150 / weight) * 10 + (850 - seatHeight) / 100);
    const defenseScore = Math.min(10, (weight / 250) * 10);
    const enduranceScore = Math.min(10, (fuelTank / 15) * 10);

    const scores = [
      { name: 'POWER', value: Math.round(powerScore), label: '動力' },
      { name: 'TORQUE', value: Math.round(torqueScore), label: '扭力' },
      { name: 'SPEED', value: Math.round(speedScore), label: '速度' },
      { name: 'HANDLING', value: Math.round(handlingScore), label: '操控' },
      { name: 'DEFENSE', value: Math.round(defenseScore), label: '耐久' },
      { name: 'ENDURANCE', value: Math.round(enduranceScore), label: '續航' },
    ];

    const avgScore = scores.reduce((sum, attr) => sum + attr.value, 0) / scores.length;
    let rankStr = 'D';
    if (avgScore >= 8.5) rankStr = 'S';
    else if (avgScore >= 7) rankStr = 'A';
    else if (avgScore >= 5.5) rankStr = 'B';
    else if (avgScore >= 4) rankStr = 'C';

    return {
      attributes: scores,
      overallScore: Math.round(avgScore * 10) / 10,
      rank: rankStr,
    };
  };

  const parseHP = (hpString: string | null): number => {
    if (!hpString) return 0;
    const match = hpString.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getRPGBar = (value: number): string => {
    const filled = Math.round((value / 10) * 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#1d2021',
          color: '#ebdbb2',
          minHeight: '100vh',
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div>
          <pre style={{ fontSize: '14px', margin: '0', whiteSpace: 'pre-wrap' }}>
            {`guest@hymmoto.tw:~$ bikes --load ${decodedBrand}/${decodedModel}\nLoading... ⏳`}
          </pre>
        </div>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div
        style={{
          backgroundColor: '#1d2021',
          color: '#ebdbb2',
          minHeight: '100vh',
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <pre style={{ fontSize: '14px', margin: '0', whiteSpace: 'pre-wrap' }}>
            {`guest@hymmoto.tw:~$ bikes --inspect ${decodedBrand}/${decodedModel}\n\nerror: vehicle not found in database\nstatus: 404\n\nplease verify the brand and model names`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1d2021', color: '#ebdbb2', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Terminal Header */}
      <section style={{ padding: '20px 20px', backgroundColor: '#282828', borderBottom: '1px solid #3c3836' }}>
        <pre style={{ fontSize: '13px', margin: '0', color: '#b8f53e', whiteSpace: 'pre-wrap' }}>
          {`guest@hymmoto.tw:~$ bikes --inspect ${vehicle.brand.toUpperCase()}/${vehicle.model_name.toUpperCase()}`}
        </pre>
      </section>

      {/* Hero Section */}
      <section style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
        <div
          style={{
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
          }}
        >
          //
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#ebdbb2', letterSpacing: '2px' }}>
          {vehicle.model_name}
        </h1>
        <div style={{ display: 'inline-block', backgroundColor: '#b8f53e', color: '#1d2021', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', marginTop: '15px', fontSize: '13px', letterSpacing: '1px' }}>
          {vehicle.brand}
        </div>
      </section>

      {/* Quick Stats */}
      <section style={{ padding: '30px 20px', borderBottom: '1px solid #3c3836', textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            justifyContent: 'center',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {vehicle.displacement_cc !== null && (
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>CC</p>
              <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                {vehicle.displacement_cc}cc
              </p>
            </div>
          )}
          {vehicle.max_horsepower !== null && (
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>HP</p>
              <p style={{ fontSize: '16px', color: '#fabd2f', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                {vehicle.max_horsepower}
              </p>
            </div>
          )}
          {vehicle.max_torque !== null && (
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>扭力</p>
              <p style={{ fontSize: '16px', color: '#fb4934', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                {vehicle.max_torque}
              </p>
            </div>
          )}
          {vehicle.wet_weight_kg !== null && (
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>車重</p>
              <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                {vehicle.wet_weight_kg}kg
              </p>
            </div>
          )}
          {vehicle.seat_height_mm !== null && (
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>座高</p>
              <p style={{ fontSize: '16px', color: '#fabd2f', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                {vehicle.seat_height_mm}mm
              </p>
            </div>
          )}
          {vehicle.msrp !== null && (
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>售價</p>
              <p style={{ fontSize: '16px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                NT${vehicle.msrp.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RPG CHARACTER CARD */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 30px 0',
            color: '#ebdbb2',
            letterSpacing: '1px',
          }}
        >
          RPG CHARACTER CARD
        </h2>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '25px',
            backgroundColor: '#282828',
            border: '2px solid #b8f53e',
            borderRadius: '4px',
            boxShadow: '0 0 20px rgba(184, 245, 62, 0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <p style={{ fontSize: '13px', color: '#928374', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>RANK</p>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: rank === 'S' ? '#b8f53e' : rank === 'A' ? '#fabd2f' : rank === 'B' ? '#83a598' : '#fb4934',
                color: '#1d2021',
                padding: '8px 16px',
                borderRadius: '3px',
                fontWeight: 'bold',
                fontSize: '13px',
                letterSpacing: '1px',
              }}
            >
              {rank} RANK
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            {attributes.map((attr) => (
              <div key={attr.name} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#ebdbb2', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {attr.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#b8f53e', fontWeight: 'bold' }}>
                    {getRPGBar(attr.value)}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#928374', margin: '0', letterSpacing: '0.5px' }}>
                  {attr.value}/10
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #3c3836' }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
              OVERALL SCORE
            </p>
            <p
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '28px',
                color: '#b8f53e',
                fontWeight: 'bold',
                margin: '0',
                letterSpacing: '1px',
              }}
            >
              {overallScore}/10
            </p>
          </div>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 30px 0',
            color: '#ebdbb2',
            letterSpacing: '1px',
          }}
        >
          SPECIFICATIONS 規格
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0',
            maxWidth: '1100px',
            margin: '0 auto',
            border: '1px solid #3c3836',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {Object.entries(vehicle)
            .filter(([key, value]) => {
              const excludeKeys = ['id', 'brand', 'model_name', 'created_at', 'updated_at'];
              return !excludeKeys.includes(key) && value !== null && value !== undefined;
            })
            .map(([key, value], idx) => (
              <div
                key={key}
                style={{
                  padding: '15px',
                  backgroundColor: idx % 2 === 0 ? '#282828' : '#1a1a1f',
                  borderBottom: '1px solid #3c3836',
                  borderRight: idx % 2 === 0 ? '1px solid #3c3836' : 'none',
                }}
              >
                <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p style={{ fontSize: '14px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                  {String(value)}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* PRICE & VALUATION */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #3c3836' }}>
        <h2
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 30px 0',
            color: '#ebdbb2',
            letterSpacing: '1px',
          }}
        >
          PRICE & VALUATION 價格估值
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {vehicle.msrp !== null && (
            <div style={{ padding: '20px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>新車售價</p>
              <p style={{ fontSize: '18px', color: '#b8f53e', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                NT${vehicle.msrp.toLocaleString()}
              </p>
            </div>
          )}
          {cpoData && cpoData.used_price_min !== null && cpoData.used_price_max !== null && (
            <div style={{ padding: '20px', backgroundColor: '#282828', border: '1px solid #3c3836', borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>中古行情</p>
              <p style={{ fontSize: '14px', color: '#fabd2f', fontWeight: 'bold', margin: '0', letterSpacing: '0.5px' }}>
                NT${cpoData.used_price_min.toLocaleString()} - NT${cpoData.used_price_max.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SIMILAR MODELS */}
      {similarModels.length > 0 && (
        <section style={{ padding: '40px 20px' }}>
          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '0 0 30px 0',
              color: '#ebdbb2',
              letterSpacing: '1px',
            }}
          >
            SIMILAR MODELS 類似車款
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >
            {similarModels.map((model) => {
              const modelHP = parseHP(model.max_horsepower);
              const modelCC = model.displacement_cc || 1;
              const modelPowerScore = Math.min(10, (modelHP / modelCC) * 2 + 2);
              let modelRank = 'D';
              if (modelPowerScore >= 8.5) modelRank = 'S';
              else if (modelPowerScore >= 7) modelRank = 'A';
              else if (modelPowerScore >= 5.5) modelRank = 'B';
              else if (modelPowerScore >= 4) modelRank = 'C';

              return (
                <Link
                  key={model.id}
                  href={`/bikes/${encodeURIComponent(model.brand)}/${encodeURIComponent(model.model_name)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      padding: '15px',
                      backgroundColor: '#282828',
                      border: '1px solid #3c3836',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: '100%',
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
                    <div
                      style={{
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
                      }}
                    >
                      //
                    </div>
                    <p style={{ fontSize: '13px', color: '#928374', margin: '0 0 3px 0', letterSpacing: '0.5px' }}>
                      {model.brand}
                    </p>
                    <h4
                      style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: '13px',
                        fontWeight: 'bold',
                        margin: '0 0 8px 0',
                        color: '#ebdbb2',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {model.model_name}
                    </h4>
                    {model.displacement_cc !== null && (
                      <div style={{ fontSize: '11px', color: '#928374', marginBottom: '8px', textAlign: 'center' }}>
                        {model.displacement_cc}cc
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {model.msrp !== null && (
                        <p style={{ fontSize: '12px', color: '#b8f53e', fontWeight: 'bold', margin: '0' }}>
                          NT${model.msrp.toLocaleString()}
                        </p>
                      )}
                      <span
                        style={{
                          backgroundColor:
                            modelRank === 'S' ? '#b8f53e' : modelRank === 'A' ? '#fabd2f' : modelRank === 'B' ? '#83a598' : '#fb4934',
                          color: modelRank === 'S' || modelRank === 'A' ? '#1d2021' : '#fff',
                          padding: '3px 6px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          borderRadius: '2px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {modelRank}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
