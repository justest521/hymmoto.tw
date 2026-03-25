import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MOTODEX 角色圖鑑 — 機車 RPG 能力值',
  description: '將台灣在售機車轉化為 RPG 角色卡：動力、操控、舒適、CP值等六角能力值評分，用遊戲化方式認識每台車的特色。',
  keywords: ['機車圖鑑', '機車評分', '機車能力值', 'MOTODEX', '機車角色卡'],
  openGraph: {
    title: 'MOTODEX 角色圖鑑 — 機車 RPG 能力值 | HYMMOTO.TW',
    description: '機車 RPG 角色卡圖鑑，六角能力值評分系統。',
  },
};

export default function MotodexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
