import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import LayoutShell from '@/components/LayoutShell';
import './globals.css';

const SITE_URL = 'https://hymmototw.vercel.app';
const SITE_NAME = 'HYMMOTO.TW';
const SITE_DESC = 'HYMMOTO.TW 台灣機車數據平台 — 即時銷售排行、566+ 車款規格對比、CPO 中古車行情、品牌市佔分析，以終端機風格呈現完整台灣機車市場數據。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'HYMMOTO.TW — 台灣機車數據終端',
    template: '%s | HYMMOTO.TW',
  },
  description: SITE_DESC,
  keywords: [
    '台灣機車', '機車銷售數據', '機車排行榜', '機車規格比較', '機車市佔率',
    '中古機車行情', '機車對比', 'SYM', 'KYMCO', 'YAMAHA', 'GOGORO',
    '機車數據平台', 'motorcycle data', 'Taiwan motorcycle', 'HYMMOTO',
  ],
  authors: [{ name: 'HYMMOTO.TW' }],
  creator: 'HYMMOTO.TW',
  publisher: 'HYMMOTO.TW',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'HYMMOTO.TW — 台灣機車數據終端',
    description: SITE_DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HYMMOTO.TW — 台灣機車數據終端',
    description: SITE_DESC,
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    'google-site-verification': '',
  },
};

// JSON-LD: WebSite + Organization schema
function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESC,
        inLanguage: 'zh-TW',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/bikes?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: '台灣機車數據分析平台',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <JsonLd />
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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
