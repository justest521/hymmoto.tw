import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL, SITE_NAME, breadcrumbJsonLd } from '@/lib/seo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const brandNameMap: Record<string, string> = {
  'HARLEY-D': 'HARLEY-DAVIDSON',
  'HARTFORD': 'HARTFORD',
  'MVAGUSTA': 'MV AGUSTA',
};

function displayBrand(raw: string): string {
  return brandNameMap[raw] || raw;
}

type Props = {
  params: Promise<{ brand: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const displayName = displayBrand(decodedBrand);

  // Get model count for this brand
  const { count } = await supabase
    .from('vehicle_specs')
    .select('id', { count: 'exact', head: true })
    .ilike('brand', decodedBrand);

  const title = `${displayName} 車款列表`;
  const description = `${displayName} 在台灣販售的${count || ''}款機車完整規格列表：排氣量、馬力、售價、座高等詳細資料，支援排序比較。`;

  return {
    title,
    description,
    keywords: [displayName, `${displayName}機車`, `${displayName}規格`, `${displayName}售價`, '台灣機車'],
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}`,
    },
    alternates: {
      canonical: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}`,
    },
  };
}

export default async function BrandLayout({ children, params }: Props) {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const displayName = displayBrand(decodedBrand);

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', url: SITE_URL },
    { name: '車款資料庫', url: `${SITE_URL}/bikes` },
    { name: displayName, url: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
