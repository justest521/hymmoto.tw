'use client'

import Link from 'next/link'

const footerSections = [
  {
    title: '關於我們',
    links: [
      { label: '公司介紹', href: '#' },
      { label: '團隊成員', href: '#' },
      { label: '發展歷程', href: '#' },
      { label: '聯繫我們', href: '#' },
    ],
  },
  {
    title: '數據服務',
    links: [
      { label: '機車數據庫', href: '/models' },
      { label: '市場分析', href: '/data-center' },
      { label: '性能對比', href: '/data-center' },
      { label: 'API 服務', href: '#' },
    ],
  },
  {
    title: '中古車服務',
    links: [
      { label: '中古車查詢', href: '/used-bikes' },
      { label: '行情報告', href: '/used-bikes' },
      { label: '估價工具', href: '#' },
      { label: '交易指南', href: '#' },
    ],
  },
  {
    title: '聯繫我們',
    links: [
      { label: '客服支持', href: '#' },
      { label: '意見回饋', href: '#' },
      { label: '商務合作', href: '#' },
      { label: '廣告合作', href: '#' },
    ],
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-accent/20">
      {/* Main Footer Content */}
      <div className="section-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title} className="text-center">
              <h3 className="font-display text-lg font-semibold text-accent mb-4 tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/70 hover:text-accent transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="section-container py-6 text-center">
          <p className="text-sm text-foreground/60">
            © {currentYear} HYMMOTO.TW - 台灣機車數據平台. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <Link
              href="#"
              className="text-xs text-foreground/50 hover:text-accent transition-colors"
            >
              隱私政策
            </Link>
            <span className="text-foreground/30">|</span>
            <Link
              href="#"
              className="text-xs text-foreground/50 hover:text-accent transition-colors"
            >
              使用條款
            </Link>
            <span className="text-foreground/30">|</span>
            <Link
              href="#"
              className="text-xs text-foreground/50 hover:text-accent transition-colors"
            >
              聯繫我們
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
