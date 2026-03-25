import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL, SITE_NAME, breadcrumbJsonLd, articleJsonLd } from '@/lib/seo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const { data: article } = await supabase
    .from('news')
    .select('title, excerpt, category_label, tags, published_at')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (!article) {
    return { title: '文章不存在' };
  }

  const title = article.title;
  const desc = article.excerpt || article.title;

  return {
    title,
    description: desc,
    keywords: article.tags || [],
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: desc,
      url: `${SITE_URL}/news/${slug}`,
      type: 'article',
      publishedTime: article.published_at,
      section: article.category_label,
      tags: article.tags || [],
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
    alternates: {
      canonical: `${SITE_URL}/news/${slug}`,
    },
  };
}

export default async function ArticleLayout({ children, params }: Props) {
  const { slug } = await params;

  const { data: article } = await supabase
    .from('news')
    .select('title, slug, excerpt, category_label, tags, published_at')
    .eq('slug', slug)
    .limit(1)
    .single();

  const schemas: object[] = [];

  schemas.push(breadcrumbJsonLd([
    { name: '首頁', url: SITE_URL },
    { name: '最新動態', url: `${SITE_URL}/news` },
    { name: article?.title || slug, url: `${SITE_URL}/news/${slug}` },
  ]));

  if (article) {
    schemas.push(articleJsonLd(article));
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={`ld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      {children}
    </>
  );
}
