import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '車款資料庫 — 566+ 台灣在售機車規格',
  description: '台灣在售 566+ 款機車完整規格資料庫，涵蓋 SYM、KYMCO、YAMAHA、GOGORO 等 28 品牌，含排氣量、馬力、售價、座高、重量等詳細規格。',
  keywords: ['機車規格', '機車資料庫', '台灣機車', '機車比較', '機車售價'],
  openGraph: {
    title: '車款資料庫 — 566+ 台灣在售機車規格 | HYMMOTO.TW',
    description: '台灣 28 品牌 566+ 款機車完整規格資料庫，支援比較與搜尋。',
  },
};

export default function BikesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
