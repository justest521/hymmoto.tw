import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '數據中心 — 台灣機車市場即時數據',
  description: '台灣機車市場即時數據中心：品牌市佔率排行、月度銷售統計、Top 10 熱銷車款、各級距銷售趨勢，資料來源為公路局每月登錄數據。',
  keywords: ['機車銷售數據', '品牌市佔率', '月度銷量', '台灣機車市場', '機車排行榜'],
  openGraph: {
    title: '數據中心 — 台灣機車市場即時數據 | HYMMOTO.TW',
    description: '台灣機車市場即時數據：品牌市佔率、月度銷售統計、熱銷車款排行。',
  },
};

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return children;
}
