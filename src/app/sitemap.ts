import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://hymmototw.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/data`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/data/sales`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/data/brands`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/bikes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/rankings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/rankings/sales`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/used`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/motodex`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/battle`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Dynamic: brand pages
  const { data: brands } = await supabase
    .from('vehicle_specs')
    .select('brand')
    .order('brand');

  const uniqueBrands = [...new Set((brands || []).map(b => b.brand))];
  const brandPages: MetadataRoute.Sitemap = uniqueBrands.map(brand => ({
    url: `${SITE_URL}/bikes/${encodeURIComponent(brand)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic: model pages
  const { data: models } = await supabase
    .from('vehicle_specs')
    .select('brand, model_name');

  const modelPages: MetadataRoute.Sitemap = (models || []).map(m => ({
    url: `${SITE_URL}/bikes/${encodeURIComponent(m.brand)}/${encodeURIComponent(m.model_name)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic: news articles
  const { data: articles } = await supabase
    .from('news')
    .select('slug, published_at')
    .order('published_at', { ascending: false });

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(a => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: new Date(a.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...modelPages, ...articlePages];
}
