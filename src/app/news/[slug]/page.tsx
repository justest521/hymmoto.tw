'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface Article {
  title: string;
  category: string;
  categoryLabel: string;
  date: string;
  content: string;
  tags: string[];
  relatedArticles: Array<{ slug: string; title: string; date: string }>;
}

const newsDatabase: Record<string, Article> = {
  'kymco-k1-2026-launch': {
    title: 'KYMCO 新K1 2026年式發表：全新引擎科技與智能化配置',
    category: 'new-release',
    categoryLabel: '新車速報',
    date: '2026-03-22',
    content: `KYMCO新K1 2026年式正式發表，搭載全新水冷四衝程引擎，排氣量125cc，最大馬力11ps，最大扭力10.3kgf·m。新車採用7吋彩色儀表板，支援藍牙連接與導航功能。

## 引擎與性能

新一代K1引擎採用最新的燃燒室設計，在保持低轉扭力的同時，提升了高轉速的動力輸出。平均油耗可達4.2L/100km，遠優於同級競品。

## 智能化配置

配備全新的電控燃油噴射系統（EFI），確保冷啟動流暢。儀表板支援APP控制，騎手可遠程查看機車狀態與行駛數據。

## 舒適性提升

新型座墊採用人體工學設計，長時間騎行不易疲勞。前後懸掛系統經過優化，在城市路況與山區道路上都表現穩定。

## 安全配置

標配ABS防抱死制動系統，LED日行燈與自動頭燈，確保騎行安全。車身採用高強度鋼材，保護系數超過業界平均。

## 上市定價

KYMCO 新K1 2026年式建議售價為119,800元，較前一代小幅上調，但配置與性能提升明顯，性價比仍然優秀。`,
    tags: ['KYMCO', '新車發表', '125cc', '2026年式', '智能化'],
    relatedArticles: [
      { slug: 'march-sales-data', title: '2026年3月台灣機車銷售數據分析：電動車佔比創新高', date: '2026-03-20' },
      { slug: 'yamaha-xmax-300-review', title: 'YAMAHA XMAX 300 深度評測：大排量速克達的新標準', date: '2026-03-19' }
    ]
  },
  'march-sales-data': {
    title: '2026年3月台灣機車銷售數據分析：電動車佔比創新高',
    category: 'data-report',
    categoryLabel: '數據報告',
    date: '2026-03-20',
    content: `根據台灣機車工業同業公會統計，2026年3月機車銷售總量達39,542台，環比成長12.3%，電動車佔比首次突破18.2%，創下歷史新高。

## 市場概況

傳統燃油機車銷售32,324台，佔81.8%。電動機車銷售7,218台，佔18.2%。與去年同月相比，燃油機車成長7.5%，電動車成長96.4%。

## 品牌排名

KYMCO以2,847台銷售量位居第一，YAMAHA 2,124台次之，HONDA 1,987台排名第三。電動車品牌中，GOGORO以4,523台遙遙領先其他品牌。

## CC級別分析

125cc級別銷售最熱，佔比37.2%，共14,700台。150cc級別佔比28.5%，11,248台。250cc以上級別佔比8.4%，3,320台。小排量輕巧的設計仍是市場主流。

## 消費者趨勢

年輕消費者對智能化配置需求提升，配備藍牙、GPS導航的車型銷售成長45%。環保意識提升帶動電動車銷售，政府補助政策效果明顯。

## 未來預測

預計2026年全年機車銷售量將達550-600萬台，電動車份額將進一步提升至25-30%。`,
    tags: ['銷售數據', '市場分析', '電動車', '品牌排名', '消費趨勢'],
    relatedArticles: [
      { slug: 'kymco-k1-2026-launch', title: 'KYMCO 新K1 2026年式發表：全新引擎科技與智能化配置', date: '2026-03-22' },
      { slug: 'gogoro-battery-technology', title: 'GOGORO S3 Pro 電池技術升級：續航破250公里新里程', date: '2026-03-16' }
    ]
  },
  'yamaha-xmax-300-review': {
    title: 'YAMAHA XMAX 300 深度評測：大排量速克達的新標準',
    category: 'review',
    categoryLabel: '評測分析',
    date: '2026-03-19',
    content: `YAMAHA XMAX 300是目前大排量速克達市場上最成熟的選擇，優秀的動力性能、舒適的乘坐感受與可靠的品質使其成為騎手的首選。

## 外形設計

XMAX 300採用新穎的設計語言，流線型的車身與凌厲的線條相結合，整車重量控制在210kg，輕量化設計不犧牲剛性。

## 引擎表現

搭載水冷4衝程單缸引擎，排氣量292cc，最大馬力23ps/6,750rpm，最大扭力27kgf·m/4,750rpm。實際騎行中加速流暢，中段扭力充沛，油耗表現優異。

## 舒適與安全

寬敞的座墊與充足的腿部空間確保長時間騎行的舒適性。ABS防抱死系統、LED頭尾燈、TCS牽引力控制系統提供完善的安全保護。

## 懸掛操控

採用前置式液壓減震器與後置單臂搖臂，在城市騎行與高速行駛中都展現出優秀的穩定性與靈活性。

## 市場定位

作為城市通勤與週末遊玩的完美選擇，XMAX 300建議售價178,000元，性價比相當出色，值得購買。`,
    tags: ['YAMAHA', 'XMAX 300', '速克達', '評測', '性能'],
    relatedArticles: [
      { slug: 'ktm-rc-8c-specs', title: 'KTM RC 8C 完全規格：888cc雙缸超級跑車的實力', date: '2026-03-18' },
      { slug: 'kawasaki-ninja-650-review', title: 'KAWASAKI Ninja 650 深度試駕：中量級跑車的平衡美學', date: '2026-03-10' }
    ]
  }
};

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = newsDatabase[slug];
  const [copied, setCopied] = useState(false);

  if (!article) {
    return (
      <div style={{
        backgroundColor: '#1d2021',
        color: '#ebdbb2',
        fontFamily: "'JetBrains Mono', monospace",
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '36px',
            margin: '0 0 24px 0'
          }}>文章未找到</h1>
          <Link href="/news" style={{
            color: '#b8f53e',
            textDecoration: 'none',
            fontSize: '14px'
          }}>← 返回新聞列表</Link>
        </div>
      </div>
    );
  }

  const categoryColor = {
    'new-release': '#fabd2f',
    'data-report': '#b8f53e',
    'review': '#fb4934',
    'modification': '#3b82f6',
    'industry': '#8b5cf6'
  }[article.category] || '#ebdbb2';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/news/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      backgroundColor: '#1d2021',
      color: '#ebdbb2',
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: '100vh'
    }}>
      {/* Article Header */}
      <section style={{
        backgroundColor: '#282828',
        padding: '60px 20px',
        borderBottom: '2px solid #3c3836',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Category Badge */}
          <div style={{
            display: 'inline-block',
            backgroundColor: `${categoryColor}20`,
            border: `1px solid ${categoryColor}`,
            color: categoryColor,
            padding: '6px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            {article.categoryLabel}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            color: '#ebdbb2',
            lineHeight: '1.4'
          }}>{article.title}</h1>

          {/* Meta Info */}
          <p style={{
            fontSize: '13px',
            color: '#928374',
            margin: '0 0 20px 0'
          }}>
            {new Date(article.date).toLocaleDateString('zh-TW')} | AI 自動生成
          </p>

          {/* Share Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button style={{
              padding: '8px 16px',
              backgroundColor: '#b8f53e20',
              border: `1px solid #b8f53e`,
              color: '#b8f53e',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 'bold'
            }}>
              📱 LINE
            </button>
            <button style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f620',
              border: `1px solid #3b82f6`,
              color: '#3b82f6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 'bold'
            }}>
              f Facebook
            </button>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '8px 16px',
                backgroundColor: '#92837420',
                border: `1px solid #928374`,
                color: '#928374',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 'bold'
              }}
            >
              {copied ? '✓ 已複製' : '🔗 複製連結'}
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{
        padding: '60px 20px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <article style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              backgroundColor: '#1a1a1f',
              border: '1px solid #3c3836',
              borderRadius: '8px',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px'
            }}>
              <span style={{ color: '#928374' }}>文章頭圖</span>
            </div>

            {/* Article Body */}
            <div style={{ textAlign: 'left', lineHeight: '1.8' }}>
              {article.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: '32px 0 16px 0',
                      color: categoryColor,
                      letterSpacing: '1px'
                    }}>
                      {paragraph.substring(3)}
                    </h2>
                  );
                }
                if (paragraph.trim()) {
                  return (
                    <p key={idx} style={{
                      fontSize: '14px',
                      color: '#a8a8b0',
                      margin: '0 0 16px 0'
                    }}>
                      {paragraph.trim()}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Tags */}
          <div style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #3c3836'
          }}>
            <p style={{ fontSize: '12px', color: '#928374', margin: '0 0 12px 0' }}>標籤</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {article.tags.map((tag, idx) => (
                <span key={idx} style={{
                  backgroundColor: '#282828',
                  border: `1px solid ${categoryColor}`,
                  color: categoryColor,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* Related Articles */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: '#282828',
        borderTop: '2px solid #3c3836',
        borderBottom: '2px solid #3c3836'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 30px 0',
            color: '#ebdbb2',
            textAlign: 'center',
            letterSpacing: '2px'
          }}>相關文章</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {article.relatedArticles.map((related, idx) => (
              <Link key={idx} href={`/news/${related.slug}`}>
                <div style={{
                  backgroundColor: '#1d2021',
                  border: '1px solid #3c3836',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = categoryColor;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${categoryColor}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
                >
                  <p style={{ fontSize: '11px', color: '#928374', margin: '0 0 8px 0' }}>
                    {new Date(related.date).toLocaleDateString('zh-TW')}
                  </p>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ebdbb2',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    {related.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section style={{
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <Link href="/news" style={{
          color: '#b8f53e',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 'bold'
        }}>
          ← 返回新聞列表
        </Link>
      </section>
    </div>
  );
}
