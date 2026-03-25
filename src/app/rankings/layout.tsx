import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '排行榜 — 台灣機車銷售排行',
  description: '台灣機車銷售排行榜：月度 Top 10 熱銷車款、品牌銷量排名、各級距銷售冠軍，資料來源公路局登錄數據即時更新。',
  keywords: ['機車排行榜', '機車銷量排名', '熱銷機車', '台灣機車銷售', '機車Top10'],
  openGraph: {
    title: '排行榜 — 台灣機車銷售排行 | HYMMOTO.TW',
    description: '台灣機車月度銷售排行榜，即時更新熱銷車款。',
  },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
