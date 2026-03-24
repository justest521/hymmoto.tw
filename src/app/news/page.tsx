'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_label: string;
  excerpt: string | null;
  published_at: string;
  is_auto_generated: boolean;
}

const COLORS = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934', blue: '#83a598',
};

const categoryColors: Record<string, string> = {
  'data-report': '#b8f53e',
  'new-release': '#fabd2f',
  'review': '#fb4934',
  'modification': '#3b82f6',
  'industry': '#8b5cf6',
};

const categories = [
  { id: 'all', label: '全部', color: COLORS.text },
  { id: 'data-report', label: '數據報告', color: '#b8f53e' },
  { id: 'new-release', label: '新車速報', color: '#fabd2f' },
  { id: 'review', label: '評測分析', color: '#fb4934' },
  { id: 'modification', label: '改裝情報', color: '#3b82f6' },
  { id: 'industry', label: '產業動態', color: '#8b5cf6' },
];

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('news')
        .select('id, slug, title, category, category_label, excerpt, published_at, is_auto_generated')
        .order('published_at', { ascending: false })
        .limit(30);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data } = await query;
      setArticles(data || []);
      setLoading(false);
    };

    fetchArticles();
  }, [selectedCategory]);

  const getCatColor = (cat: string) => categoryColors[cat] || COLORS.text;
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div style={{
      backgroundColor: COLORS.bg, color: COLORS.text,
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: '100vh', padding: '30px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Terminal Header */}
        <div style={{ marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '20px' }}>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '8px' }}>
            guest@hymmoto.tw:~$ <span style={{ color: COLORS.green }}>news --latest</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: '2px' }}>
            LATEST NEWS
          </h1>
          <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '4px', fontFamily: "'Noto Sans TC', sans-serif" }}>
            AI 驅動的機車產業新聞
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{
          borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '20px',
          marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap',
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px', fontSize: '11px', cursor: 'pointer',
                borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace",
                fontWeight: selectedCategory === cat.id ? 700 : 400,
                transition: 'all 0.2s',
                backgroundColor: selectedCategory === cat.id ? cat.color : 'transparent',
                color: selectedCategory === cat.id ? COLORS.bg : cat.color,
                border: `1px solid ${cat.color}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: COLORS.muted }}>
            <p>$ loading news...</p>
            <p style={{ color: COLORS.green }}>▌</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: COLORS.muted }}>
            <p>$ no articles found</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <section style={{ marginBottom: '24px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '24px' }}>
                <Link href={`/news/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: '#1a1a1f', border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px', height: '240px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden',
                      background: `linear-gradient(135deg, ${getCatColor(featured.category)}10, ${getCatColor(featured.category)}05)`,
                    }}>
                      <span style={{ color: COLORS.muted, fontSize: '14px' }}>//</span>
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        backgroundColor: `${getCatColor(featured.category)}30`,
                        color: getCatColor(featured.category),
                        padding: '4px 10px', borderRadius: '3px',
                        fontSize: '10px', fontWeight: 700,
                      }}>
                        {featured.category_label}
                      </div>
                    </div>
                    <div>
                      <h2 style={{
                        fontSize: '20px', fontWeight: 700, margin: '0 0 12px 0',
                        color: COLORS.text, lineHeight: '1.5',
                        fontFamily: "'Noto Sans TC', sans-serif",
                      }}>
                        {featured.title}
                      </h2>
                      <p style={{ fontSize: '12px', color: COLORS.muted, margin: '0 0 10px 0' }}>
                        {new Date(featured.published_at).toLocaleDateString('zh-TW')}
                      </p>
                      {featured.excerpt && (
                        <p style={{
                          fontSize: '13px', color: '#a8a8b0', margin: '0 0 12px 0',
                          lineHeight: '1.7', fontFamily: "'Noto Sans TC', sans-serif",
                        }}>
                          {featured.excerpt}
                        </p>
                      )}
                      {featured.is_auto_generated && (
                        <div style={{
                          display: 'inline-block', backgroundColor: `${COLORS.green}20`,
                          color: COLORS.green, padding: '3px 10px', borderRadius: '3px',
                          fontSize: '10px', fontWeight: 700,
                        }}>
                          AI AUTO-GENERATED
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Articles Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px', marginBottom: '32px',
            }}>
              {rest.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', height: '100%',
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = getCatColor(article.category);
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  >
                    {/* Image area */}
                    <div style={{
                      height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                      background: `linear-gradient(135deg, ${getCatColor(article.category)}10, ${getCatColor(article.category)}05)`,
                    }}>
                      <span style={{ color: COLORS.muted, fontSize: '12px' }}>//</span>
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        backgroundColor: `${getCatColor(article.category)}30`,
                        color: getCatColor(article.category),
                        padding: '3px 8px', borderRadius: '3px',
                        fontSize: '10px', fontWeight: 700,
                      }}>
                        {article.category_label}
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '11px', color: COLORS.muted, margin: '0 0 6px 0' }}>
                        {new Date(article.published_at).toLocaleDateString('zh-TW')}
                      </p>
                      <h3 style={{
                        fontSize: '13px', fontWeight: 700, margin: '0 0 8px 0',
                        color: COLORS.text, lineHeight: '1.5',
                        fontFamily: "'Noto Sans TC', sans-serif",
                      }}>
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p style={{
                          fontSize: '11px', color: '#8b8b98', margin: '0 0 8px 0',
                          flex: 1, lineHeight: '1.5', overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          fontFamily: "'Noto Sans TC', sans-serif",
                        }}>
                          {article.excerpt}
                        </p>
                      )}
                      <div style={{ color: getCatColor(article.category), fontSize: '11px', fontWeight: 700 }}>
                        閱讀更多 →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${COLORS.border}`, paddingTop: '16px',
          textAlign: 'center', color: COLORS.muted, fontSize: '11px',
        }}>
          所有文章均由 AI 根據銷售數據自動生成 · HYMMOTO NEWS ENGINE
        </div>
      </div>
    </div>
  );
}
