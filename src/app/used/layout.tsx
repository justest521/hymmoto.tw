import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '中古車行情 — CPO 認證中古車估價',
  description: '台灣機車中古車行情查詢：CPO 認證車商收購價格資料庫，依品牌、車型、年份查詢中古機車合理價格區間。',
  keywords: ['中古機車', '二手機車', '機車行情', 'CPO認證', '中古車估價', '機車收購價'],
  openGraph: {
    title: '中古車行情 — CPO 認證中古車估價 | HYMMOTO.TW',
    description: '台灣機車中古車 CPO 認證行情查詢，查詢合理收購價格。',
  },
};

export default function UsedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
