import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '對戰模式 — 機車規格 PK 比較',
  description: '選擇兩台機車進行規格 PK 對戰：馬力、扭力、重量、座高、油箱容量等數據視覺化對比，找出最適合你的車款。',
  keywords: ['機車比較', '機車對比', '機車PK', '規格比較', '機車選購'],
  openGraph: {
    title: '對戰模式 — 機車規格 PK 比較 | HYMMOTO.TW',
    description: '機車規格視覺化 PK 對比工具，選兩台車直接比較。',
  },
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
