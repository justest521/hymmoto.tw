'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      }
      router.push('/used')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth failed')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        color: COLORS.text,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: COLORS.card,
          border: `2px solid ${COLORS.border}`,
          borderRadius: '8px',
          padding: '40px',
          boxShadow: `0 0 20px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ color: COLORS.green, marginBottom: '10px' }}>
            guest@hymmoto.tw:~$ auth --login
          </div>
          <h1 style={{ margin: '0', fontSize: '24px', marginTop: '10px' }}>
            LOGIN / REGISTER 登入註冊
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: `${COLORS.red}20`,
              border: `1px solid ${COLORS.red}`,
              color: COLORS.red,
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth}>
          {/* Email Input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: COLORS.muted,
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '4px',
                color: COLORS.text,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: isRegister ? '16px' : '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: COLORS.muted,
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '4px',
                color: COLORS.text,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Display Name Input (Register Mode) */}
          {isRegister && (
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: COLORS.muted,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isRegister}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  backgroundColor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  color: COLORS.text,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: COLORS.green,
              color: COLORS.bg,
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '16px',
              textTransform: 'uppercase',
            }}
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        {/* Toggle Register/Login */}
        <button
          onClick={() => {
            setIsRegister(!isRegister)
            setError('')
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: COLORS.blue,
            border: `1px solid ${COLORS.blue}`,
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}
        >
          {isRegister ? 'Back to Login' : 'Create Account'}
        </button>

        {/* Divider */}
        <div
          style={{
            textAlign: 'center',
            color: COLORS.muted,
            marginBottom: '20px',
            fontSize: '12px',
          }}
        >
          --- or ---
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: COLORS.gold,
            color: COLORS.bg,
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            textTransform: 'uppercase',
          }}
        >
          {loading ? 'Processing...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
