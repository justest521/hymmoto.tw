'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface VehicleSpec {
  id: string
  brand: string
  model_name: string
  displacement_cc: number
  max_horsepower: string
  max_torque: string
  wet_weight_kg: number
  msrp: number
  seat_height_mm: number
  fuel_tank_l: number
  front_brake: string
  rear_brake: string
  abs_type: string
  cooling_system: string
  engine_type: string
  features: string[]
}

const COLORS = {
  bg: '#1d2021',
  card: '#282828',
  border: '#3c3836',
  text: '#ebdbb2',
  muted: '#928374',
  green: '#b8f53e',
  gold: '#fabd2f',
  red: '#fb4934',
  blue: '#83a598',
}

const parseHorsepower = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)\s*hp/i)
  return match ? parseFloat(match[1]) : null
}

const parseTorque = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:nm|n\/m)/i)
  return match ? parseFloat(match[1]) : null
}

const createBar = (value: number, max: number, winner: boolean = false): string => {
  const filled = Math.round((value / max) * 10)
  const empty = 10 - filled
  const char = winner ? '█' : '░'
  return '█'.repeat(filled) + '░'.repeat(empty)
}

const BattlePage = () => {
  const [vehicles, setVehicles] = useState<VehicleSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [leftSearch, setLeftSearch] = useState('')
  const [rightSearch, setRightSearch] = useState('')
  const [leftResults, setLeftResults] = useState<VehicleSpec[]>([])
  const [rightResults, setRightResults] = useState<VehicleSpec[]>([])
  const [leftSelected, setLeftSelected] = useState<VehicleSpec | null>(null)
  const [rightSelected, setRightSelected] = useState<VehicleSpec | null>(null)
  const [showLeftDropdown, setShowLeftDropdown] = useState(false)
  const [showRightDropdown, setShowRightDropdown] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_specs')
          .select('*')
          .limit(1000)

        if (error) throw error
        setVehicles(data || [])
      } catch (err) {
        console.error('Error fetching vehicles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const filterVehicles = (query: string): VehicleSpec[] => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return vehicles
      .filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model_name.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }

  useEffect(() => {
    setLeftResults(filterVehicles(leftSearch))
  }, [leftSearch, vehicles])

  useEffect(() => {
    setRightResults(filterVehicles(rightSearch))
  }, [rightSearch, vehicles])

  const handleLeftSelect = (vehicle: VehicleSpec) => {
    setLeftSelected(vehicle)
    setShowLeftDropdown(false)
    setLeftSearch('')
  }

  const handleRightSelect = (vehicle: VehicleSpec) => {
    setRightSelected(vehicle)
    setShowRightDropdown(false)
    setRightSearch('')
  }

  const ComparisonValue = ({
    label,
    leftValue,
    rightValue,
    unit = '',
    numeric = false,
    isNumeric = false,
  }: {
    label: string
    leftValue: string | number
    rightValue: string | number
    unit?: string
    numeric?: boolean
    isNumeric?: boolean
  }) => {
    let leftWins = false
    let rightWins = false

    if (isNumeric && typeof leftValue === 'number' && typeof rightValue === 'number') {
      leftWins = leftValue > rightValue
      rightWins = rightValue > leftValue
    }

    return (
      <div style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div
          style={{
            color: COLORS.muted,
            backgroundColor: COLORS.card,
            padding: '8px 16px',
            fontSize: '14px',
          }}
        >
          {label}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '12px 16px' }}>
          <div
            style={{
              backgroundColor: leftWins ? COLORS.green + '20' : rightWins ? COLORS.red + '20' : 'transparent',
              color: leftWins ? COLORS.green : rightWins ? COLORS.red : COLORS.text,
              padding: '12px',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{leftValue}</div>
            {unit && <div style={{ fontSize: '12px', color: COLORS.muted }}>{unit}</div>}
          </div>
          <div
            style={{
              backgroundColor: rightWins ? COLORS.green + '20' : leftWins ? COLORS.red + '20' : 'transparent',
              color: rightWins ? COLORS.green : leftWins ? COLORS.red : COLORS.text,
              padding: '12px',
              borderRadius: '4px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{rightValue}</div>
            {unit && <div style={{ fontSize: '12px', color: COLORS.muted }}>{unit}</div>}
          </div>
        </div>
      </div>
    )
  }

  const BarComparison = ({
    label,
    leftValue,
    rightValue,
  }: {
    label: string
    leftValue: number
    rightValue: number
  }) => {
    const maxValue = Math.max(leftValue, rightValue)
    const leftWins = leftValue > rightValue
    const rightWins = rightValue > leftValue

    return (
      <div style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div
          style={{
            color: COLORS.muted,
            backgroundColor: COLORS.card,
            padding: '8px 16px',
            fontSize: '14px',
          }}
        >
          {label}
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', monospace",
                color: leftWins ? COLORS.green : rightWins ? COLORS.red : COLORS.text,
              }}
            >
              {createBar(leftValue, maxValue, leftWins)} {leftValue.toFixed(1)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: 'right',
                color: rightWins ? COLORS.green : leftWins ? COLORS.red : COLORS.text,
              }}
            >
              {rightValue.toFixed(1)} {createBar(rightValue, maxValue, rightWins)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'JetBrains Mono', monospace",
        minHeight: '100vh',
        padding: '30px 24px',
      }}
    >
      <style>
        {`
          * {
            font-family: 'JetBrains Mono', monospace;
          }
          .chinese-text {
            font-family: 'Noto Sans TC', sans-serif;
          }
          input {
            background-color: ${COLORS.card};
            color: ${COLORS.text};
            border: 1px solid ${COLORS.border};
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            border-radius: 4px;
            padding: 12px 16px;
          }
          input::placeholder {
            color: ${COLORS.muted};
          }
          input:focus {
            outline: none;
            border-color: ${COLORS.green};
          }
        `}
      </style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Terminal Header */}
        <div style={{ marginBottom: '40px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '20px' }}>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: COLORS.green }}>battle --versus</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: '2px' }}>
            BATTLE MODE
          </h1>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            對戰模式 · 車款規格對決
          </div>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: COLORS.muted,
            }}
          >
            <p style={{ marginBottom: '8px' }}>$ loading vehicle_specs...</p>
            <p style={{ color: COLORS.green }}>▌</p>
          </div>
        ) : (
          <>
            {/* Search Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
              {/* Left Side */}
              <div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: COLORS.muted }}>
                  LEFT CONTENDER
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search brand or model..."
                    value={leftSearch}
                    onChange={(e) => {
                      setLeftSearch(e.target.value)
                      setShowLeftDropdown(true)
                    }}
                    onFocus={() => setShowLeftDropdown(true)}
                    style={{ width: '100%' }}
                  />
                  {showLeftDropdown && leftResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        borderRadius: '4px',
                        zIndex: 10,
                        maxHeight: '256px',
                        overflowY: 'auto',
                        backgroundColor: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {leftResults.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleLeftSelect(v)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 16px',
                            backgroundColor: COLORS.card,
                            color: COLORS.text,
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.border
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.card
                          }}
                        >
                          {v.brand} {v.model_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {leftSelected && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: COLORS.green }}>
                    ✓ {leftSelected.brand} {leftSelected.model_name}
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: COLORS.muted }}>
                  RIGHT CONTENDER
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search brand or model..."
                    value={rightSearch}
                    onChange={(e) => {
                      setRightSearch(e.target.value)
                      setShowRightDropdown(true)
                    }}
                    onFocus={() => setShowRightDropdown(true)}
                    style={{ width: '100%' }}
                  />
                  {showRightDropdown && rightResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        borderRadius: '4px',
                        zIndex: 10,
                        maxHeight: '256px',
                        overflowY: 'auto',
                        backgroundColor: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {rightResults.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleRightSelect(v)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 16px',
                            backgroundColor: COLORS.card,
                            color: COLORS.text,
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.border
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.card
                          }}
                        >
                          {v.brand} {v.model_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {rightSelected && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: COLORS.green }}>
                    ✓ {rightSelected.brand} {rightSelected.model_name}
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Section */}
            {leftSelected && rightSelected && (
              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Left Card */}
                  <div
                    style={{
                      backgroundColor: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: COLORS.border,
                        padding: '12px 16px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: COLORS.muted }}>
                        [LEFT]
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {leftSelected.brand}
                      </div>
                      <div style={{ fontSize: '16px' }}>{leftSelected.model_name}</div>
                    </div>

                    {/* Comparison Rows */}
                    <ComparisonValue
                      label="Displacement"
                      leftValue={leftSelected.displacement_cc}
                      rightValue={rightSelected.displacement_cc}
                      unit="cc"
                      isNumeric={true}
                    />

                    {(() => {
                      const leftHp = parseHorsepower(leftSelected.max_horsepower)
                      const rightHp = parseHorsepower(rightSelected.max_horsepower)
                      return leftHp !== null && rightHp !== null ? (
                        <BarComparison
                          label="Horsepower"
                          leftValue={leftHp}
                          rightValue={rightHp}
                        />
                      ) : (
                        <ComparisonValue
                          label="Horsepower"
                          leftValue={leftSelected.max_horsepower}
                          rightValue={rightSelected.max_horsepower}
                        />
                      )
                    })()}

                    {(() => {
                      const leftTorque = parseTorque(leftSelected.max_torque)
                      const rightTorque = parseTorque(rightSelected.max_torque)
                      return leftTorque !== null && rightTorque !== null ? (
                        <BarComparison
                          label="Torque"
                          leftValue={leftTorque}
                          rightValue={rightTorque}
                        />
                      ) : (
                        <ComparisonValue
                          label="Torque"
                          leftValue={leftSelected.max_torque}
                          rightValue={rightSelected.max_torque}
                        />
                      )
                    })()}

                    <BarComparison
                      label="Weight"
                      leftValue={leftSelected.wet_weight_kg}
                      rightValue={rightSelected.wet_weight_kg}
                    />

                    <ComparisonValue
                      label="Price (NTD)"
                      leftValue={leftSelected.msrp.toLocaleString()}
                      rightValue={rightSelected.msrp.toLocaleString()}
                      isNumeric={true}
                    />

                    <BarComparison
                      label="Seat Height"
                      leftValue={leftSelected.seat_height_mm}
                      rightValue={rightSelected.seat_height_mm}
                    />

                    <BarComparison
                      label="Fuel Tank"
                      leftValue={leftSelected.fuel_tank_l}
                      rightValue={rightSelected.fuel_tank_l}
                    />

                    <ComparisonValue
                      label="Front Brake"
                      leftValue={leftSelected.front_brake}
                      rightValue={rightSelected.front_brake}
                    />

                    <ComparisonValue
                      label="Rear Brake"
                      leftValue={leftSelected.rear_brake}
                      rightValue={rightSelected.rear_brake}
                    />

                    <ComparisonValue
                      label="ABS"
                      leftValue={leftSelected.abs_type}
                      rightValue={rightSelected.abs_type}
                    />

                    <ComparisonValue
                      label="Cooling"
                      leftValue={leftSelected.cooling_system}
                      rightValue={rightSelected.cooling_system}
                    />

                    <div style={{ padding: '12px 16px', color: COLORS.muted, fontSize: '12px' }}>
                      Engine: {leftSelected.engine_type}
                    </div>
                  </div>

                  {/* Right Card */}
                  <div
                    style={{
                      backgroundColor: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: COLORS.border,
                        padding: '12px 16px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: COLORS.muted }}>
                        [RIGHT]
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {rightSelected.brand}
                      </div>
                      <div style={{ fontSize: '16px' }}>{rightSelected.model_name}</div>
                    </div>

                    {/* Comparison Rows - Mirror */}
                    <ComparisonValue
                      label="Displacement"
                      leftValue={leftSelected.displacement_cc}
                      rightValue={rightSelected.displacement_cc}
                      unit="cc"
                      isNumeric={true}
                    />

                    {(() => {
                      const leftHp = parseHorsepower(leftSelected.max_horsepower)
                      const rightHp = parseHorsepower(rightSelected.max_horsepower)
                      return leftHp !== null && rightHp !== null ? (
                        <BarComparison
                          label="Horsepower"
                          leftValue={leftHp}
                          rightValue={rightHp}
                        />
                      ) : (
                        <ComparisonValue
                          label="Horsepower"
                          leftValue={leftSelected.max_horsepower}
                          rightValue={rightSelected.max_horsepower}
                        />
                      )
                    })()}

                    {(() => {
                      const leftTorque = parseTorque(leftSelected.max_torque)
                      const rightTorque = parseTorque(rightSelected.max_torque)
                      return leftTorque !== null && rightTorque !== null ? (
                        <BarComparison
                          label="Torque"
                          leftValue={leftTorque}
                          rightValue={rightTorque}
                        />
                      ) : (
                        <ComparisonValue
                          label="Torque"
                          leftValue={leftSelected.max_torque}
                          rightValue={rightSelected.max_torque}
                        />
                      )
                    })()}

                    <BarComparison
                      label="Weight"
                      leftValue={leftSelected.wet_weight_kg}
                      rightValue={rightSelected.wet_weight_kg}
                    />

                    <ComparisonValue
                      label="Price (NTD)"
                      leftValue={leftSelected.msrp.toLocaleString()}
                      rightValue={rightSelected.msrp.toLocaleString()}
                      isNumeric={true}
                    />

                    <BarComparison
                      label="Seat Height"
                      leftValue={leftSelected.seat_height_mm}
                      rightValue={rightSelected.seat_height_mm}
                    />

                    <BarComparison
                      label="Fuel Tank"
                      leftValue={leftSelected.fuel_tank_l}
                      rightValue={rightSelected.fuel_tank_l}
                    />

                    <ComparisonValue
                      label="Front Brake"
                      leftValue={leftSelected.front_brake}
                      rightValue={rightSelected.front_brake}
                    />

                    <ComparisonValue
                      label="Rear Brake"
                      leftValue={leftSelected.rear_brake}
                      rightValue={rightSelected.rear_brake}
                    />

                    <ComparisonValue
                      label="ABS"
                      leftValue={leftSelected.abs_type}
                      rightValue={rightSelected.abs_type}
                    />

                    <ComparisonValue
                      label="Cooling"
                      leftValue={leftSelected.cooling_system}
                      rightValue={rightSelected.cooling_system}
                    />

                    <div style={{ padding: '12px 16px', color: COLORS.muted, fontSize: '12px' }}>
                      Engine: {rightSelected.engine_type}
                    </div>
                  </div>
                </div>

                {/* VS Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      backgroundColor: COLORS.card,
                      border: `2px solid ${COLORS.gold}`,
                      color: COLORS.gold,
                    }}
                  >
                    VS
                  </div>
                </div>
              </div>
            )}

            {!leftSelected || !rightSelected ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: COLORS.muted,
                }}
              >
                <p style={{ fontSize: '14px' }}>$ select two motorcycles to begin battle...</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default BattlePage
