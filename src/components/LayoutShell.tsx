'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { sym: '~/', label: 'HOME', chinese: '首頁', href: '/' },
  { sym: '>_', label: 'DATA', chinese: '數據中心', href: '/data' },
  { sym: '::', label: 'BIKES', chinese: '車款資料庫', href: '/bikes' },
  { sym: '#1', label: 'RANKINGS', chinese: '排行榜', href: '/rankings' },
  { sym: '//', label: 'USED', chinese: '中古車', href: '/used' },
  { sym: '$>', label: 'NEWS', chinese: '最新動態', href: '/news' },
  { sym: '##', label: 'MOTODEX', chinese: '角色圖鑑', href: '/motodex' },
  { sym: '<>', label: 'BATTLE', chinese: '對戰模式', href: '/battle' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarWidth = isMobile ? '260px' : (collapsed ? '60px' : '220px');
  const isVisible = isMobile ? mobileOpen : true;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 49,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      <aside style={{
        position: 'fixed', left: 0, top: 0,
        width: sidebarWidth,
        height: '100vh',
        backgroundColor: '#1d2021',
        borderRight: '2px solid #3c3836',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, width 0.3s ease',
        transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
        zIndex: 50,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Logo */}
        <div style={{ padding: '16px', borderBottom: '1px solid #3c3836', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
            {collapsed && !isMobile ? (
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
          {/* Mobile close button */}
          {isMobile && (
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', color: '#928374',
              cursor: 'pointer', fontSize: '18px', padding: '4px 8px',
            }}>✕</button>
          )}
        </div>

        {/* Desktop collapse */}
        {!isMobile && (
          <div style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #3c3836' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent', border: 'none', color: '#928374',
                cursor: 'pointer', fontSize: '12px', padding: '4px 8px', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#b8f53e'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = '#928374'; }}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          </div>
        )}

        {/* Nav Label */}
        {(!collapsed || isMobile) && (
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
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            const showLabel = !collapsed || isMobile;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: showLabel ? '12px 16px' : '10px 8px',
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
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(184, 245, 62, 0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = '#928374';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#b8f53e', fontSize: '13px', letterSpacing: '1px', minWidth: '20px' }}>{item.sym}</span>
                {showLabel && (
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isActive ? '#ebdbb2' : '#a89984' }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: isActive ? '#928374' : '#665c54', fontFamily: "'Noto Sans TC', sans-serif" }}>
                      {item.chinese}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {(!collapsed || isMobile) && (
          <div style={{
            padding: '12px', borderTop: '1px solid #3c3836',
            textAlign: 'center', fontSize: '10px', color: '#665c54',
            letterSpacing: '0.5px',
          }}>
            v2.0 · TERMINAL
          </div>
        )}
      </aside>
    </>
  );
}

// Mobile top bar with hamburger
function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header style={{
      position: 'sticky', top: 0,
      height: '48px',
      backgroundColor: '#1d2021',
      borderBottom: '1px solid #3c3836',
      display: 'flex', alignItems: 'center',
      padding: '0 12px',
      zIndex: 30,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <button onClick={onMenuClick} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: '#b8f53e', fontSize: '20px', padding: '4px 8px',
        display: 'flex', alignItems: 'center',
      }}>
        ☰
      </button>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fabd2f', letterSpacing: '1px' }}>HYM</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#b8f53e', letterSpacing: '1px' }}>MOTO</span>
        <span style={{ fontSize: '10px', color: '#928374' }}>.TW</span>
      </Link>
    </header>
  );
}

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {isHome ? (
        <main style={{ width: '100%', minHeight: '100vh', padding: isMobile ? '8px' : '16px', boxSizing: 'border-box' }}>
          {children}
        </main>
      ) : (
        <>
          <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          {isMobile && <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />}
          <main style={{
            marginLeft: isMobile ? 0 : '220px',
            transition: 'margin-left 0.3s ease',
            minHeight: '100vh',
          }}>
            {children}
          </main>
        </>
      )}

      {/* Global responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          /* Grid fixes */
          [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          /* Two-column grids */
          .grid-2col {
            grid-template-columns: 1fr !important;
          }
          /* Tables scroll */
          table { display: block; overflow-x: auto; }
          /* Font size adjustments */
          h1 { font-size: 22px !important; }
          h2 { font-size: 16px !important; }
          pre { font-size: 11px !important; white-space: pre-wrap !important; word-break: break-all !important; }
          /* Filter chips scroll */
          .filter-scroll { overflow-x: auto; flex-wrap: nowrap !important; }
          /* Detail page 2-col to 1-col */
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
