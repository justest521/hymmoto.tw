export const SITE_URL = 'https://hymmototw.vercel.app';
export const SITE_NAME = 'HYMMOTO.TW';

// Breadcrumb helper for JSON-LD
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Product JSON-LD for vehicle pages
export function vehicleProductJsonLd(vehicle: {
  brand: string;
  model_name: string;
  msrp: number | null;
  displacement_cc: number | null;
  category: string | null;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.brand} ${vehicle.model_name}`,
    brand: { '@type': 'Brand', name: vehicle.brand },
    category: vehicle.category ? `機車 > ${vehicle.category}` : '機車',
    description: vehicle.description || `${vehicle.brand} ${vehicle.model_name} ${vehicle.displacement_cc ? vehicle.displacement_cc + 'cc' : ''} 台灣規格、售價、詳細規格表`,
    ...(vehicle.msrp && vehicle.msrp > 0 ? {
      offers: {
        '@type': 'Offer',
        price: vehicle.msrp,
        priceCurrency: 'TWD',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/bikes/${encodeURIComponent(vehicle.brand)}/${encodeURIComponent(vehicle.model_name)}`,
      },
    } : {}),
    additionalProperty: vehicle.displacement_cc ? [{
      '@type': 'PropertyValue',
      name: '排氣量',
      value: `${vehicle.displacement_cc}cc`,
    }] : [],
  };
}

// Article JSON-LD for news pages
export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  category_label: string;
  tags: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    url: `${SITE_URL}/news/${article.slug}`,
    datePublished: article.published_at,
    dateModified: article.published_at,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    articleSection: article.category_label,
    keywords: article.tags.join(', '),
    inLanguage: 'zh-TW',
  };
}
