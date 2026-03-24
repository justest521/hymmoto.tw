'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  const categories = [
    { id: 'all', label: '全部', color: '#ebdbb2' },
    { id: 'data-report', label: '數據報告', color: '#b8f53e' },
    { id: 'new-release', label: '新車速報', color: '#fabd2f' },
    { id: 'review', label: '評測分析', color: '#fb4934' },
    { id: 'modification', label: '改裝情報', color: '#3b82f6' },
    { id: 'industry', label: '產業動態', color: '#8b5cf6' }
  ];

  const mockArticles: Article[] = [
    { id: 1, slug: 'kymco-k1-2026-launch', title: 'KYMCO 新K1 2026年式發表：全新引擎科技與智能化配置', category: 'new-release', date: '2026-03-22', excerpt: '台灣機車大廠KYMCO正式推出2026年式新K1，搭載全新水冷四衝程引擎，配備7吋儀表板。' },
    { id: 2, slug: 'march-sales-data', title: '2026年3月台灣機車銷售數據分析：電動車佔比創新高', category: 'data-report', date: '2026-03-20', excerpt: '根據最新統計，3月機車銷售總量達39,542台，其中電動車佔比達18.2%，創歷史新高。' },
    { id: 3, slug: 'yamaha-xmax-300-review', title: 'YAMAHA XMAX 300 深度評測：大排量速克達的新標準', category: 'review', date: '2026-03-19', excerpt: '我們深入測試了新一代YAMAHA XMAX 300，卓越的性能和舒適性重新定義了大排量速克達標準。' },
    { id: 4, slug: 'ktm-rc-8c-specs', title: 'KTM RC 8C 完全規格：888cc雙缸超級跑車的實力', category: 'new-release', date: '2026-03-18', excerpt: 'KTM推出全新RC 8C，搭載888cc水冷雙缸發動機，最大馬力高達120ps，售價368,000元起。' },
    { id: 5, slug: 'motorcycle-modification-law-2026', title: '2026年機車改裝新法規解讀：牌照稅與保險異動重點', category: 'modification', date: '2026-03-17', excerpt: '台灣公路總局發布新版機車改裝法規，關於排氣改裝、輪框尺寸等有重大調整，車主需特別注意。' },
    { id: 6, slug: 'gogoro-battery-technology', title: 'GOGORO S3 Pro 電池技術升級：續航破250公里新里程', category: 'industry', date: '2026-03-16', excerpt: 'GOGORO宣布新一代電池單次續航達到258公里，充電時間縮短至1.2小時，領先市場三年。' },
    { id: 7, slug: 'aprilia-rsv4-tuning-guide', title: 'APRILIA RSV4 改裝指南：打造專屬賽道怪獸的方法', category: 'modification', date: '2026-03-15', excerpt: '從Akrapovic排氣系統到Ohlins懸掛，詳細介紹APRILIA RSV4的各式改裝方案與搭配建議。' },
    { id: 8, slug: 'honda-cb500f-ownership-experience', title: 'HONDA CB500F 車主談感受：中量級運動車的日常騎行體驗', category: 'review', date: '2026-03-14', excerpt: '擁有CB500F一年的騎手分享其與愛車的故事，細節體驗與長期養護成本全揭露。' },
    { id: 9, slug: 'taiwan-motorcycle-market-outlook', title: '台灣機車市場2026展望：預期銷售600萬台創新高', category: 'industry', date: '2026-03-13', excerpt: '產業分析師預測2026年台灣機車市場將延續強勢成長，年度銷售量預期突破600萬台大關。' },
    { id: 10, slug: 'suzuki-gsx-r125-first-ride', title: 'SUZUKI GSX-R125 試駕體驗：入門級跑車的駕馭樂趣', category: 'review', date: '2026-03-12', excerpt: '輕量化設計與敏銳的操控讓GSX-R125成為新手騎士進入運動車領域的最佳選擇。' },
    { id: 11, slug: 'electric-scooter-charging-infrastructure', title: '電動機車充電基礎設施盤點：全台1,200個充電點地圖', category: 'industry', date: '2026-03-11', excerpt: '統整全台電動機車充電點資訊，GOGORO、Aeon、WeMo等品牌充電站位置與服務時間一覽。' },
    { id: 12, slug: 'kawasaki-ninja-650-review', title: 'KAWASAKI Ninja 650 深度試駕：中量級跑車的平衡美學', category: 'review', date: '2026-03-10', excerpt: '兼具運動性與實用性的Ninja 650，以親民價格提供雙缸引擎的駕馭快感，是騎士們的熱烈討論焦點。' }
  ];

  const filteredArticles = selectedCategory === 'all'
    ? mockArticles
    : mockArticles.filter(article => article.category === selectedCategory);

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const displayedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);
  const featuredArticle = filteredArticles[0];

  const getCategoryColor = (catId: string) => {
    return categories.find(c => c.id === catId)?.color || '#ebdbb2';
  };

  return (
    <div style={{
      backgroundColor: '#1d2021',
      color: '#ebdbb2',
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: '100vh'
    }}>
      {/* Header */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #3c3836'
      }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          color: '#ebdbb2',
          letterSpacing: '4px'
        }}>LATEST NEWS</h1>
        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '24px',
          margin: '0 0 8px 0',
          color: '#b8f53e'
        }}>最新動態</h2>
        <p style={{
          fontSize: '14px',
          color: '#928374',
          margin: '0',
          letterSpacing: '1px'
        }}>AI 驅動的機車產業新聞</p>
      </section>

      {/* Category Tabs */}
      <section style={{
        padding: '20px',
        borderBottom: '1px solid #3c3836',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCategory === cat.id ? cat.color : 'transparent',
                color: selectedCategory === cat.id ? '#1d2021' : cat.color,
                border: `1px solid ${cat.color}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section style={{
          padding: '40px 20px',
          backgroundColor: '#282828',
          borderBottom: '2px solid #3c3836'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link href={`/news/${featuredArticle.slug}`}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                {/* Image */}
                <div style={{
                  backgroundColor: '#1a1a1f',
                  border: '1px solid #3c3836',
                  borderRadius: '8px',
                  height: '280px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    background: 'linear-gradient(135deg, #b8f53e10, #fabd2f10)',
                  }} />
                  <span style={{ color: '#928374', fontSize: '14px', position: 'relative', zIndex: 1 }}>特色文章圖片</span>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: `${getCategoryColor(featuredArticle.category)}20`,
                    border: `1px solid ${getCategoryColor(featuredArticle.category)}`,
                    color: getCategoryColor(featuredArticle.category),
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {categories.find(c => c.id === featuredArticle.category)?.label}
                  </div>
                </div>

                {/* Content */}
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#ebdbb2',
                    lineHeight: '1.4'
                  }}>{featuredArticle.title}</h2>
                  <p style={{
                    fontSize: '12px',
                    color: '#928374',
                    margin: '0 0 12px 0'
                  }}>{new Date(featuredArticle.date).toLocaleDateString('zh-TW')}</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#a8a8b0',
                    margin: '0 0 16px 0',
                    lineHeight: '1.6'
                  }}>{featuredArticle.excerpt}</p>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#b8f53e20',
                    color: '#b8f53e',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>AI 自動生成</div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {displayedArticles.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`}>
              <div style={{
                backgroundColor: '#282828',
                border: '1px solid #3c3836',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = getCategoryColor(article.category);
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${getCategoryColor(article.category)}20`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3c3836';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
              >
                {/* Image Placeholder */}
                <div style={{
                  backgroundColor: '#1a1a1f',
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${getCategoryColor(article.category)}10, ${getCategoryColor(article.category)}05)`
                }}>
                  <span style={{ color: '#928374', fontSize: '12px' }}>圖片</span>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: `${getCategoryColor(article.category)}30`,
                    color: getCategoryColor(article.category),
                    padding: '3px 10px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {categories.find(c => c.id === article.category)?.label}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#928374',
                    margin: '0 0 8px 0'
                  }}>{new Date(article.date).toLocaleDateString('zh-TW')}</p>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    margin: '0 0 12px 0',
                    color: '#ebdbb2',
                    lineHeight: '1.4'
                  }}>{article.title}</h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#8b8b98',
                    margin: '0 0 12px 0',
                    flex: 1,
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{article.excerpt}</p>
                  <div style={{
                    color: getCategoryColor(article.category),
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>閱讀更多 →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === 1 ? 'transparent' : '#282828',
              border: `1px solid ${currentPage === 1 ? '#666666' : '#3c3836'}`,
              color: currentPage === 1 ? '#666666' : '#ebdbb2',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            « Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === page ? '#b8f53e' : 'transparent',
                border: `1px solid ${currentPage === page ? '#b8f53e' : '#3c3836'}`,
                color: currentPage === page ? '#1d2021' : '#ebdbb2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: currentPage === page ? 'bold' : 'normal'
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === totalPages ? 'transparent' : '#282828',
              border: `1px solid ${currentPage === totalPages ? '#666666' : '#3c3836'}`,
              color: currentPage === totalPages ? '#666666' : '#ebdbb2',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            Next »
          </button>
        </div>
      </section>

      {/* Footer */}
      <section style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#928374',
        fontSize: '12px',
        borderTop: '2px solid #3c3836',
        marginTop: '40px'
      }}>
        <p style={{ margin: '0', letterSpacing: '1px' }}>新聞更新時間 2026-03-24 | 所有文章均由 AI 模型生成</p>
      </section>
    </div>
  );
}
