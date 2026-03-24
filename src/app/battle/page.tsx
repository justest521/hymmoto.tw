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
      <div className="border-b" style={{ borderColor: COLORS.border }}>
        <div
          className="px-4 py-2 text-sm"
          style={{ color: COLORS.muted, backgroundColor: COLORS.card }}
        >
          {label}
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 py-3">
          <div
            style={{
              backgroundColor: leftWins ? COLORS.green + '20' : rightWins ? COLORS.red + '20' : 'transparent',
              color: leftWins ? COLORS.green : rightWins ? COLORS.red : COLORS.text,
              padding: '0.75rem',
              borderRadius: '4px',
            }}
          >
            <div className="text-lg font-bold">{leftValue}</div>
            {unit && <div className="text-xs" style={{ color: COLORS.muted }}>{unit}</div>}
          </div>
          <div
            style={{
              backgroundColor: rightWins ? COLORS.green + '20' : leftWins ? COLORS.red + '20' : 'transparent',
              color: rightWins ? COLORS.green : leftWins ? COLORS.red : COLORS.text,
              padding: '0.75rem',
              borderRadius: '4px',
              textAlign: 'right',
            }}
          >
            <div className="text-lg font-bold">{rightValue}</div>
            {unit && <div className="text-xs" style={{ color: COLORS.muted }}>{unit}</div>}
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
      <div className="border-b" style={{ borderColor: COLORS.border }}>
        <div
          className="px-4 py-2 text-sm"
          style={{ color: COLORS.muted, backgroundColor: COLORS.card }}
        >
          {label}
        </div>
        <div className="px-4 py-3 space-y-2">
          <div>
            <div
              className="text-sm font-mono"
              style={{
                color: leftWins ? COLORS.green : rightWins ? COLORS.red : COLORS.text,
              }}
            >
              {createBar(leftValue, maxValue, leftWins)} {leftValue.toFixed(1)}
            </div>
          </div>
          <div>
            <div
              className="text-sm font-mono text-right"
              style={{
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
      style={{ backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh' }}
      className="font-mono"
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

      <div className="p-6 md:p-8">
        {/* Terminal Header */}
        <div className="mb-8">
          <div
            className="text-sm font-mono px-4 py-2"
            style={{
              color: COLORS.green,
              backgroundColor: COLORS.card,
              borderLeft: `2px solid ${COLORS.green}`,
            }}
          >
            guest@hymmoto.tw:~$ battle --versus
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">BATTLE MODE</h1>
          <h1 className="text-3xl font-bold mb-4 chinese-text" style={{ color: COLORS.gold }}>
            對戰模式
          </h1>
          <p className="text-sm chinese-text" style={{ color: COLORS.muted }}>
            車款規格對決 · 選擇兩台車進行比較
          </p>
        </div>

        {loading ? (
          <div
            className="text-center py-12"
            style={{ color: COLORS.muted }}
          >
            <p className="mb-2">$ loading vehicle_specs...</p>
            <p style={{ color: COLORS.green }}>▌</p>
          </div>
        ) : (
          <>
            {/* Search Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Left Side */}
              <div>
                <div className="mb-2 text-xs" style={{ color: COLORS.muted }}>
                  LEFT CONTENDER
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brand or model..."
                    value={leftSearch}
                    onChange={(e) => {
                      setLeftSearch(e.target.value)
                      setShowLeftDropdown(true)
                    }}
                    onFocus={() => setShowLeftDropdown(true)}
                    className="w-full px-4 py-2 rounded text-sm"
                  />
                  {showLeftDropdown && leftResults.length > 0 && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded z-10 max-h-64 overflow-y-auto"
                      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
                    >
                      {leftResults.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleLeftSelect(v)}
                          className="w-full text-left px-4 py-2 hover:bg-opacity-50 text-sm"
                          style={{
                            backgroundColor: COLORS.card,
                            color: COLORS.text,
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
                  <div className="mt-2 text-sm" style={{ color: COLORS.green }}>
                    ✓ {leftSelected.brand} {leftSelected.model_name}
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div>
                <div className="mb-2 text-xs" style={{ color: COLORS.muted }}>
                  RIGHT CONTENDER
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brand or model..."
                    value={rightSearch}
                    onChange={(e) => {
                      setRightSearch(e.target.value)
                      setShowRightDropdown(true)
                    }}
                    onFocus={() => setShowRightDropdown(true)}
                    className="w-full px-4 py-2 rounded text-sm"
                  />
                  {showRightDropdown && rightResults.length > 0 && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded z-10 max-h-64 overflow-y-auto"
                      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
                    >
                      {rightResults.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleRightSelect(v)}
                          className="w-full text-left px-4 py-2 hover:bg-opacity-50 text-sm"
                          style={{
                            backgroundColor: COLORS.card,
                            color: COLORS.text,
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
                  <div className="mt-2 text-sm" style={{ color: COLORS.green }}>
                    ✓ {rightSelected.brand} {rightSelected.model_name}
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Section */}
            {leftSelected && rightSelected && (
              <div>
                <div className="relative mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Card */}
                    <div
                      className="rounded overflow-hidden"
                      style={{ backgroundColor: COLORS.card, border: `2px solid ${COLORS.border}` }}
                    >
                      <div
                        className="px-4 py-3"
                        style={{ backgroundColor: COLORS.border }}
                      >
                        <div className="text-sm" style={{ color: COLORS.muted }}>
                          [LEFT]
                        </div>
                        <div className="text-xl font-bold">
                          {leftSelected.brand}
                        </div>
                        <div className="text-lg">{leftSelected.model_name}</div>
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

                      <div className="px-4 py-3" style={{ color: COLORS.muted, fontSize: '0.75rem' }}>
                        Engine: {leftSelected.engine_type}
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div
                        className="px-4 py-2 rounded font-bold text-lg"
                        style={{
                          backgroundColor: COLORS.card,
                          border: `2px solid ${COLORS.gold}`,
                          color: COLORS.gold,
                        }}
                      >
                        VS
                      </div>
                    </div>

                    {/* Right Card */}
                    <div
                      className="rounded overflow-hidden"
                      style={{ backgroundColor: COLORS.card, border: `2px solid ${COLORS.border}` }}
                    >
                      <div
                        className="px-4 py-3"
                        style={{ backgroundColor: COLORS.border }}
                      >
                        <div className="text-sm" style={{ color: COLORS.muted }}>
                          [RIGHT]
                        </div>
                        <div className="text-xl font-bold">
                          {rightSelected.brand}
                        </div>
                        <div className="text-lg">{rightSelected.model_name}</div>
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

                      <div className="px-4 py-3" style={{ color: COLORS.muted, fontSize: '0.75rem' }}>
                        Engine: {rightSelected.engine_type}
                      </div>
                    </div>
                  </div>

                  {/* Mobile VS Badge */}
                  <div className="md:hidden flex justify-center py-4">
                    <div
                      className="px-4 py-2 rounded font-bold text-lg"
                      style={{
                        backgroundColor: COLORS.card,
                        border: `2px solid ${COLORS.gold}`,
                        color: COLORS.gold,
                      }}
                    >
                      VS
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!leftSelected || !rightSelected ? (
              <div
                className="text-center py-12"
                style={{ color: COLORS.muted }}
              >
                <p className="text-sm">$ select two motorcycles to begin battle...</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default BattlePage
