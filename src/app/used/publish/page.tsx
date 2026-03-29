'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

const TAIWAN_CITIES = [
  '台北市',
  '新北市',
  '桃園市',
  '台中市',
  '台南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '台東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
]

const VEHICLE_TYPES = [
  '通勤車',
  '休旅車',
  '運動車',
  '轎車',
  '跑車',
  '商用車',
  '越野車',
  '家庭用車',
  '豪華車',
  '其他',
]

const LICENSE_TYPES = ['白牌', '黃牌', '紅牌', '電動']
const ORIGINS = ['進口', '國產']
const FUEL_TYPES = ['汽油', '柴油', '電動', '油電混合']
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor']

interface FormData {
  brand: string
  model_name: string
  title: string
  year: number
  plate_date: string
  mileage_km: number
  color: string
  condition: string
  exterior_score: number
  scratches: boolean
  engine_status: string
  modifications: string
  accident_history: boolean
  warranty: string
  vehicle_type: string
  license_type: string
  origin: string
  displacement_cc: number
  cylinders: number
  fuel_type: string
  price: number
  negotiable: boolean
  includes_shipping: boolean
  includes_transfer: boolean
  city: string
  district: string
  address: string
  images: string
  tags: string
}

export default function PublishPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model_name: '',
    title: '',
    year: new Date().getFullYear(),
    plate_date: '',
    mileage_km: 0,
    color: '',
    condition: 'good',
    exterior_score: 5,
    scratches: false,
    engine_status: '',
    modifications: '',
    accident_history: false,
    warranty: '',
    vehicle_type: '',
    license_type: '',
    origin: '',
    displacement_cc: 0,
    cylinders: 0,
    fuel_type: '',
    price: 0,
    negotiable: false,
    includes_shipping: false,
    includes_transfer: false,
    city: '',
    district: '',
    address: '',
    images: '',
    tags: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth/login')
        } else {
          setUser(session.user)
        }
      } catch (err) {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as any
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Parse images and tags
      const images = formData.images
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Insert listing
      const { data: listing, error: listingError } = await supabase
        .from('used_listings')
        .insert({
          seller_id: user.id,
          brand: formData.brand,
          model_name: formData.model_name,
          title: formData.title,
          year: formData.year,
          plate_date: formData.plate_date,
          mileage_km: formData.mileage_km,
          color: formData.color,
          condition: formData.condition,
          exterior_score: formData.exterior_score,
          scratches: formData.scratches,
          engine_status: formData.engine_status,
          modifications: formData.modifications,
          accident_history: formData.accident_history,
          warranty: formData.warranty,
          vehicle_type: formData.vehicle_type,
          license_type: formData.license_type,
          origin: formData.origin,
          displacement_cc: formData.displacement_cc,
          cylinders: formData.cylinders,
          fuel_type: formData.fuel_type,
          price: formData.price,
          negotiable: formData.negotiable,
          includes_shipping: formData.includes_shipping,
          includes_transfer: formData.includes_transfer,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          images,
          tags,
          status: 'active',
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (listingError) throw listingError

      // Upsert user profile
      const { error: profileError } = await supabase.from('user_profiles').upsert(
        {
          id: user.id,
          user_id: user.id,
        },
        { onConflict: 'user_id' }
      )

      if (profileError) throw profileError

      // Redirect to listing page
      router.push(`/used/${listing.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish listing')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: COLORS.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.text,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        fontFamily: 'JetBrains Mono, monospace',
        color: COLORS.text,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Terminal Header */}
        <div
          style={{
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ color: COLORS.green, marginBottom: '10px' }}>
            guest@hymmoto.tw:~$ used --publish
          </div>
          <h1 style={{ margin: '0', fontSize: '28px', marginTop: '10px' }}>
            PUBLISH LISTING 刊登中古車
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: `${COLORS.red}20`,
              border: `1px solid ${COLORS.red}`,
              color: COLORS.red,
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '30px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Vehicle Basic Info */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              車輛基本資訊
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Model Name
                </label>
                <input
                  type="text"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Plate Date
                </label>
                <input
                  type="date"
                  name="plate_date"
                  value={formData.plate_date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Condition */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              車況
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Mileage (KM)
                </label>
                <input
                  type="number"
                  name="mileage_km"
                  value={formData.mileage_km}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Exterior Score (1-10): {formData.exterior_score}
                </label>
                <input
                  type="range"
                  name="exterior_score"
                  min="1"
                  max="10"
                  value={formData.exterior_score}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Engine Status
                </label>
                <input
                  type="text"
                  name="engine_status"
                  value={formData.engine_status}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Modifications
                </label>
                <input
                  type="text"
                  name="modifications"
                  value={formData.modifications}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Warranty
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="scratches"
                    checked={formData.scratches}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: COLORS.muted, fontSize: '12px', textTransform: 'uppercase' }}>
                    Has Scratches
                  </span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="accident_history"
                    checked={formData.accident_history}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: COLORS.muted, fontSize: '12px', textTransform: 'uppercase' }}>
                    Accident History
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Classification */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              分類
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select Vehicle Type</option>
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  License Type
                </label>
                <select
                  name="license_type"
                  value={formData.license_type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select License Type</option>
                  {LICENSE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Origin
                </label>
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select Origin</option>
                  {ORIGINS.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Fuel Type
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select Fuel Type</option>
                  {FUEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Displacement (CC)
                </label>
                <input
                  type="number"
                  name="displacement_cc"
                  value={formData.displacement_cc}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Cylinders
                </label>
                <input
                  type="number"
                  name="cylinders"
                  value={formData.cylinders}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Price */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              價格
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Price (TWD)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: COLORS.muted, fontSize: '12px', textTransform: 'uppercase' }}>
                    Negotiable
                  </span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="includes_transfer"
                    checked={formData.includes_transfer}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: COLORS.muted, fontSize: '12px', textTransform: 'uppercase' }}>
                    Includes Transfer
                  </span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="includes_shipping"
                    checked={formData.includes_shipping}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: COLORS.muted, fontSize: '12px', textTransform: 'uppercase' }}>
                    Includes Shipping
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Location */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              地點
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select City</option>
                  {TAIWAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: COLORS.muted,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 6: Images */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              圖片
            </h2>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: COLORS.muted,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Image URLs (one per line)
              </label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  backgroundColor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  color: COLORS.text,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px',
                  minHeight: '120px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Section 7: Tags */}
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                color: COLORS.gold,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: '12px',
              }}
            >
              標籤
            </h2>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: COLORS.muted,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  backgroundColor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  color: COLORS.text,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: COLORS.blue,
                border: `1px solid ${COLORS.blue}`,
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 32px',
                backgroundColor: COLORS.green,
                color: COLORS.bg,
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                textTransform: 'uppercase',
              }}
            >
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
