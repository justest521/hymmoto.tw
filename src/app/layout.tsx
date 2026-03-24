'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import './globals.css'

// Navigation items
const navItems = [
  { sym: '~/', label: 'HOME', chinese: '首頁', href: '/' },
  { sym: '>_', label: 'DATA', chinese: '數據中心', href: '/data' },
  { sym: '::', label: 'BIKES', chinese: '車款資料庫', href: '/bikes' },
  { sym: '#1', label: 'RANKINGS', chinese: '排行榜', href: '/rankings' },
  { sym: '//', label: 'USED', chinese: '中古車', href: '/used' },
  { sym: '$>', label: 'NEWS', chinese: '最新動態', href: '/news' },
  { sym: '##', label: 'MOTODEX', chinese: '角色圖鑑', href: '/motodex' },
  { sym: '<>', label: 'BATTLE', chinese: '對戰模式', href: '/battle' },
]

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      width: collapsed ? '60px' : '220px',
      height: '100vh',
      backgroundColor: '#1d2021',
      borderRight: '2px solid #3c3836',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.3s ease',
      zIndex: 40,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid #3c3836', textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
          {collapsed ? (
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#b8f53e', fontFamily: "'JetBrains Mono', monospace" }}>H~</div>
          ) : (
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', lineHeight: 1.4 }}>
              <span style={{ color: '#fabd2f' }}>HYM</span>
              <span style={{ color: '#b8f53e' }}>MOTO</span>
              <br />
              <span style={{ fontSize: '11px', color: '#928374' }}>.TW</span>
            </div>
          )}
        </Link>
      </div>

      {/* Collapse */}
      <div style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent', border: 'none', color: '#928374',
            cursor: 'pointer', fontSize: '12px', padding: '4px 8px', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = '#b8f53e' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = '#928374' }}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Nav Label */}
      {!collapsed && (
        <div style={{
          padding: '10px 16px', fontSize: '10px', color: '#928374',
          letterSpacing: '2px', textTransform: 'uppercase',
          borderBottom: '1px solid #3c3836',
        }}>
          NAVIGATION
        </div>
      )}

      {/* Nav Links */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: collapsed ? '10px 8px' : '10px 16px',
                color: isActive ? '#b8f53e' : '#928374',
                textDecoration: 'none',
                transition: 'all 0.2s',
                borderLeft: isActive ? '2px solid #b8f53e' : '2px solid transparent',
                backgroundColor: isActive ? 'rgba(184, 245, 62, 0.06)' : 'transparent',
                fontSize: '12px',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#b8f53e';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(184, 245, 62, 0.04)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#928374';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ fontWeight: 'bold', color: '#b8f53e', fontSize: '13px', letterSpacing: '1px', minWidth: '20px' }}>{item.sym}</span>
              {!collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#ebdbb2' : '#a89984' }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: isActive ? '#928374' : '#665c54', fontFamily: "'Noto Sans TC', sans-serif" }}>
                    {item.chinese}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px', borderTop: '1px solid #3c3836',
          textAlign: 'center', fontSize: '10px', color: '#665c54',
          letterSpacing: '0.5px',
        }}>
          v2.0 · TERMINAL
        </div>
      )}
    </aside>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="HYMMOTO.TW - 台灣機車數據平台" />
        <title>HYMMOTO.TW - Motorcycle Data Terminal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0, padding: 0,
        backgroundColor: '#1d2021',
        color: '#ebdbb2',
        fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace",
        fontSize: '14px',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {isHome ? (
          /* Homepage: full terminal, no sidebar */
          <main style={{ width: '100%', height: '100vh', padding: '16px', boxSizing: 'border-box' }}>
            {children}
          </main>
        ) : (
          /* Sub-pages: sidebar + content */
          <>
            <Sidebar />
            <main style={{
              marginLeft: '220px',
              transition: 'margin-left 0.3s ease',
              minHeight: '100vh',
            }}>
              {children}
            </main>
            <style>{`
              @media (max-width: 768px) {
                main { margin-left: 0 !important; }
              }
            `}</style>
          </>
        )}
      </body>
    </html>
  )
}
