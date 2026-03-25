import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '最新動態 — AI 驅動機車產業新聞',
  description: 'AI 自動生成的台灣機車產業新聞：月度銷售報告、新車速報、品牌策略分析、級距趨勢解讀，基於公路局登錄數據即時產出。',
  keywords: ['機車新聞', '機車銷售報告', '新車速報', '機車產業動態', '台灣機車市場分析'],
  openGraph: {
    title: '最新動態 — AI 驅動機車產業新聞 | HYMMOTO.TW',
    description: 'AI 自動生成的台灣機車產業新聞與銷售數據分析。',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
