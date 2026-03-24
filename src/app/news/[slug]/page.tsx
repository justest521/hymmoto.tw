'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_label: string;
  excerpt: string | null;
  content: string | null;
  tags: string[] | null;
  published_at: string;
  is_auto_generated: boolean;
}

interface RelatedArticle {
  id: number;
  slug: string;
  title: string;
  published_at: string;
  category_label: string;
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

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArticle(data as Article);

      // Fetch related articles (same category, excluding current)
      const { data: relatedData } = await supabase
        .from('news')
        .select('id, slug, title, published_at, category_label')
        .eq('category', data.category)
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(3);

      // If not enough from same category, fill with recent
      let allRelated = relatedData || [];
      if (allRelated.length < 3) {
        const { data: moreData } = await supabase
          .from('news')
          .select('id, slug, title, published_at, category_label')
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(3);

        const existingIds = new Set(allRelated.map(r => r.id));
        for (const m of (moreData || [])) {
          if (!existingIds.has(m.id) && allRelated.length < 3) {
            allRelated.push(m);
          }
        }
      }

      setRelated(allRelated as RelatedArticle[]);
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/news/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div>
          <div style={{ color: COLORS.muted, fontSize: '14px' }}>$ loading article...</div>
          <div style={{ color: COLORS.green, marginTop: '8px' }}>▌</div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div style={{
        backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div>
          <pre style={{ fontSize: '14px', margin: 0 }}>
            {`guest@hymmoto.tw:~$ news --read "${slug}"\n\nerror: article not found\nstatus: 404`}
          </pre>
          <Link href="/news" style={{ color: COLORS.green, fontSize: '12px', marginTop: '16px', display: 'block' }}>
            &gt; back to news
          </Link>
        </div>
      </div>
    );
  }

  const catColor = categoryColors[article.category] || COLORS.text;

  // Render markdown-like content
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, idx) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={idx} style={{
            fontSize: '18px', fontWeight: 700, margin: '32px 0 12px 0',
            color: catColor, letterSpacing: '1px',
          }}>
            {block.substring(3)}
          </h2>
        );
      }
      if (block.startsWith('| ')) {
        // Simple table rendering
        const rows = block.split('\n').filter(r => r.trim() && !r.startsWith('|---'));
        return (
          <div key={idx} style={{
            overflowX: 'auto', margin: '12px 0',
            border: `1px solid ${COLORS.border}`, borderRadius: '4px',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <tbody>
                {rows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim());
                  return (
                    <tr key={ri} style={{
                      backgroundColor: ri === 0 ? COLORS.bg : COLORS.card,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}>
                      {cells.map((cell, ci) => (
                        <td key={ci} style={{
                          padding: '8px 12px',
                          fontWeight: ri === 0 ? 700 : 400,
                          color: ri === 0 ? COLORS.gold : COLORS.text,
                        }}>
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      if (block.trim()) {
        return (
          <p key={idx} style={{
            fontSize: '14px', color: '#a8a8b0', margin: '0 0 16px 0',
            lineHeight: '1.8', fontFamily: "'Noto Sans TC', sans-serif",
          }}>
            {block.trim()}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div style={{
      backgroundColor: COLORS.bg, color: COLORS.text,
      fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh',
    }}>
      {/* Article Header */}
      <section style={{
        backgroundColor: COLORS.card, padding: '48px 24px',
        borderBottom: `2px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Category Badge */}
          <div style={{
            display: 'inline-block',
            backgroundColor: `${catColor}20`, border: `1px solid ${catColor}`,
            color: catColor, padding: '4px 12px', borderRadius: '4px',
            fontSize: '11px', fontWeight: 700, marginBottom: '20px',
          }}>
            {article.category_label}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '28px', fontWeight: 700, margin: '0 0 16px 0',
            color: COLORS.text, lineHeight: '1.5',
            fontFamily: "'Noto Sans TC', sans-serif",
          }}>
            {article.title}
          </h1>

          {/* Meta */}
          <p style={{ fontSize: '12px', color: COLORS.muted, margin: '0 0 16px 0' }}>
            {new Date(article.published_at).toLocaleDateString('zh-TW')}
            {article.is_auto_generated && ' · AI AUTO-GENERATED'}
          </p>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            style={{
              padding: '6px 14px', backgroundColor: `${COLORS.muted}20`,
              border: `1px solid ${COLORS.muted}`, color: COLORS.muted,
              borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {copied ? '✓ copied' : 'copy link'}
          </button>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
        {article.content && renderContent(article.content)}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{
            marginTop: '40px', paddingTop: '20px',
            borderTop: `1px solid ${COLORS.border}`,
          }}>
            <p style={{ fontSize: '11px', color: COLORS.muted, margin: '0 0 10px 0' }}>TAGS</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {article.tags.map((tag, idx) => (
                <span key={idx} style={{
                  backgroundColor: COLORS.card, border: `1px solid ${catColor}`,
                  color: catColor, padding: '3px 10px', borderRadius: '3px',
                  fontSize: '10px', fontWeight: 700,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Related Articles */}
      {related.length > 0 && (
        <section style={{
          padding: '40px 24px', backgroundColor: COLORS.card,
          borderTop: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0',
              color: COLORS.text, letterSpacing: '2px',
            }}>
              RELATED
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {related.map((r) => (
                <Link key={r.id} href={`/news/${r.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px', padding: '16px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = COLORS.green; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = COLORS.border; }}
                  >
                    <p style={{ fontSize: '10px', color: COLORS.muted, margin: '0 0 6px 0' }}>
                      {r.category_label} · {new Date(r.published_at).toLocaleDateString('zh-TW')}
                    </p>
                    <h3 style={{
                      fontSize: '12px', fontWeight: 700, color: COLORS.text, margin: 0,
                      lineHeight: '1.5', fontFamily: "'Noto Sans TC', sans-serif",
                    }}>
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back */}
      <section style={{ padding: '24px', textAlign: 'center' }}>
        <Link href="/news" style={{ color: COLORS.green, textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
          ← back to news
        </Link>
      </section>
    </div>
  );
}
