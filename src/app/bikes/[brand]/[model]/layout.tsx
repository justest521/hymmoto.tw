import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL, SITE_NAME, breadcrumbJsonLd, vehicleProductJsonLd } from '@/lib/seo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const brandNameMap: Record<string, string> = {
  'HARLEY-D': 'HARLEY-DAVIDSON',
  'MVAGUSTA': 'MV AGUSTA',
};

function displayBrand(raw: string): string {
  return brandNameMap[raw] || raw;
}

type Props = {
  params: Promise<{ brand: string; model: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ brand: string; model: string }> }): Promise<Metadata> {
  const { brand, model } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const decodedModel = decodeURIComponent(model);

  const { data: vehicle } = await supabase
    .from('vehicle_specs')
    .select('brand, model_name, displacement_cc, max_horsepower, msrp, category, engine_type, seat_height_mm')
    .ilike('brand', decodedBrand)
    .ilike('model_name', decodedModel)
    .limit(1)
    .single();

  if (!vehicle) {
    return { title: `${decodedModel} | ${decodedBrand}` };
  }

  const displayName = displayBrand(vehicle.brand);
  const cc = vehicle.displacement_cc ? `${vehicle.displacement_cc}cc` : '';
  const hp = vehicle.max_horsepower || '';
  const price = vehicle.msrp ? `NT$${vehicle.msrp.toLocaleString()}` : '';

  const title = `${displayName} ${vehicle.model_name} ${cc} 規格表`;
  const desc = `${displayName} ${vehicle.model_name} ${cc} 完整規格：${hp ? `最大馬力 ${hp}` : ''}${price ? `，建議售價 ${price}` : ''}。含 RPG 能力值、中古車行情、同級車比較。`;

  return {
    title,
    description: desc,
    keywords: [
      `${displayName} ${vehicle.model_name}`, `${vehicle.model_name}規格`, `${vehicle.model_name}售價`,
      `${vehicle.model_name}評價`, cc, displayName,
    ],
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: desc,
      url: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}/${encodeURIComponent(decodedModel)}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${displayName} ${vehicle.model_name} ${cc}`,
      description: desc,
    },
    alternates: {
      canonical: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}/${encodeURIComponent(decodedModel)}`,
    },
  };
}

export default async function ModelLayout({ children, params }: Props) {
  const { brand, model } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const decodedModel = decodeURIComponent(model);

  const { data: vehicle } = await supabase
    .from('vehicle_specs')
    .select('brand, model_name, displacement_cc, msrp, category')
    .ilike('brand', decodedBrand)
    .ilike('model_name', decodedModel)
    .limit(1)
    .single();

  const displayName = displayBrand(decodedBrand);

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', url: SITE_URL },
    { name: '車款資料庫', url: `${SITE_URL}/bikes` },
    { name: displayName, url: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}` },
    { name: decodedModel, url: `${SITE_URL}/bikes/${encodeURIComponent(decodedBrand)}/${encodeURIComponent(decodedModel)}` },
  ]);

  const schemas: object[] = [breadcrumb];

  if (vehicle) {
    schemas.push(vehicleProductJsonLd(vehicle));
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
