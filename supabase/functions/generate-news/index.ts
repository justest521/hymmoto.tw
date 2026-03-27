// Supabase Edge Function: generate-news
// Generates news articles from monthly sales data
// Trigger: POST /generate-news?year_month=2026-03
// Or called after vehicle-sales-import completes

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandSales {
  brand: string;
  total: number;
  market_share: number;
  yoy_ratio: number | null;
}

interface ModelSales {
  brand: string;
  model_code: string;
  display_name: string | null;
  total_sales: number;
  displacement_cc: number | null;
}

// ═══════════════════════════════════════
//  BRAND NAME MAPPING (中文 ↔ 英文)
// ═══════════════════════════════════════

const brandNameMap: Record<string, string[]> = {
  '光陽': ['KYMCO'],
  '三陽': ['SYM'],
  '山葉': ['YAMAHA'],
  '睿能': ['GOGORO'],
  '鈴木': ['SUZUKI'],
  '中華': ['CMC', 'EMOVING', 'E-MOVING'],
  '哈特佛': ['HARTFORD'],
  '宏佳騰': ['AEON'],
  '川崎': ['KAWASAKI'],
  '台鈴': ['SUZUKI'],
  '本田': ['HONDA'],
  '比雅久': ['PGO'],
  'PGO': ['PGO'],
  'KYMCO': ['KYMCO', '光陽'],
  'SYM': ['SYM', '三陽'],
  'YAMAHA': ['YAMAHA', '山葉'],
  'GOGORO': ['GOGORO', '睿能'],
  'SUZUKI': ['SUZUKI', '鈴木'],
  'HONDA': ['HONDA', '本田'],
  'KAWASAKI': ['KAWASAKI', '川崎'],
  'HARTFORD': ['HARTFORD', '哈特佛'],
  'AEON': ['AEON', '宏佳騰'],
  'HARLEY-D': ['HARLEY-D', 'HARLEY-DAVIDSON', 'HARLEY'],
  'BMW': ['BMW'],
  'DUCATI': ['DUCATI'],
  'TRIUMPH': ['TRIUMPH'],
  'KTM': ['KTM'],
  'APRILIA': ['APRILIA'],
  'VESPA': ['VESPA'],
  'INDIAN': ['INDIAN'],
};

// Get all possible name variants for a brand
function getBrandAliases(brand: string): string[] {
  const upper = brand.toUpperCase();
  const aliases = new Set<string>([brand, upper]);
  // Check direct mapping
  if (brandNameMap[brand]) {
    brandNameMap[brand].forEach(a => aliases.add(a));
  }
  if (brandNameMap[upper]) {
    brandNameMap[upper].forEach(a => aliases.add(a));
  }
  // Reverse lookup: find any key whose values include this brand
  for (const [key, values] of Object.entries(brandNameMap)) {
    if (values.some(v => v.toUpperCase() === upper) || key.toUpperCase() === upper) {
      aliases.add(key);
      values.forEach(v => aliases.add(v));
    }
  }
  return [...aliases];
}

// Check if brand is EV-related
function isEVBrand(brand: string): boolean {
  const evNames = ['GOGORO', 'IONEX', 'EMOVING', 'E-MOVING', 'VESTON', '睿能'];
  const aliases = getBrandAliases(brand);
  return aliases.some(a => evNames.includes(a.toUpperCase()));
}

// ═══════════════════════════════════════
//  ARTICLE GENERATORS
// ═══════════════════════════════════════

function generateMonthlyOverview(
  yearMonth: string,
  brands: BrandSales[],
  topModels: ModelSales[],
  totalMarket: number,
  prevMonthTotal: number | null,
): ArticleDraft {
  const [year, month] = yearMonth.split('-');
  const monthNum = parseInt(month);
  const top3 = brands.slice(0, 3);
  const top3Share = top3.reduce((s, b) => s + (b.market_share || 0), 0).toFixed(1);
  const evBrands = brands.filter(b => isEVBrand(b.brand));
  const evTotal = evBrands.reduce((s, b) => s + b.total, 0);
  const evShare = totalMarket > 0 ? ((evTotal / totalMarket) * 100).toFixed(1) : '0';

  const momChange = prevMonthTotal && prevMonthTotal > 0
    ? ((totalMarket - prevMonthTotal) / prevMonthTotal * 100).toFixed(1)
    : null;

  const momText = momChange
    ? (parseFloat(momChange) >= 0 ? `較上月成長 ${momChange}%` : `較上月衰退 ${Math.abs(parseFloat(momChange))}%`)
    : '';

  const top10 = topModels.slice(0, 10);
  const top10Table = top10.map((m, i) =>
    `| ${i + 1} | ${m.display_name || m.model_code} | ${m.brand} | ${m.total_sales.toLocaleString()} |`
  ).join('\n');

  const content = `## 市場總覽

${year}年${monthNum}月全台機車新領牌登錄共 ${totalMarket.toLocaleString()} 台${momText ? `，${momText}` : ''}。三大品牌 ${top3.map(b => b.brand).join('、')} 合計市佔率達 ${top3Share}%，市場集中度${parseFloat(top3Share) > 85 ? '持續提高' : '維持穩定'}。

## 品牌排名

| 排名 | 品牌 | 銷量 | 市佔率 |
|------|------|------|--------|
${brands.slice(0, 10).map((b, i) =>
    `| ${i + 1} | ${b.brand} | ${b.total.toLocaleString()} | ${(b.market_share || 0).toFixed(1)}% |`
  ).join('\n')}

## Top 10 熱銷車款

| 排名 | 車款 | 品牌 | 銷量 |
|------|------|------|------|
${top10Table}

## 電動車市場

電動車品牌合計銷售 ${evTotal.toLocaleString()} 台，市佔率 ${evShare}%${parseFloat(evShare) > 3 ? '，持續展現成長動能' : ''}。${evBrands.length > 0 ? evBrands.map(b => `${b.brand} ${b.total.toLocaleString()} 台`).join('、') : ''}。

## 級距觀察

${generateCCSegmentText(topModels)}

## 未來展望

${monthNum >= 3 && monthNum <= 5 ? '春季傳統旺季持續，預期下月銷量有望維持高檔。' : monthNum >= 6 && monthNum <= 8 ? '夏季為傳統淡季，各品牌可能推出促銷方案刺激買氣。' : monthNum >= 9 && monthNum <= 11 ? '秋季新車發表季，預期各品牌將推出年式新款。' : '年末購車潮退場，市場回歸常態觀望期。'}各品牌新車型佈局與電動車政策補助將是影響後續銷量的關鍵因素。`;

  return {
    slug: `${yearMonth}-monthly-sales-report`,
    title: `${year}年${monthNum}月台灣機車銷售報告：${top3[0].brand} ${top3[0].market_share?.toFixed(1)}% 領先、全月 ${totalMarket.toLocaleString()} 台`,
    category: 'data-report',
    category_label: '數據報告',
    excerpt: `${monthNum}月全台機車新領牌 ${totalMarket.toLocaleString()} 台，${top3[0].brand} 以 ${top3[0].total.toLocaleString()} 台（${top3[0].market_share?.toFixed(1)}%）居冠，${top3[1].brand} ${top3[1].market_share?.toFixed(1)}% 緊追在後。`,
    content,
    tags: ['銷售數據', '市場分析', ...top3.map(b => b.brand), '月度報告'],
    is_auto_generated: true,
  };
}

function generateBrandAnalysis(
  yearMonth: string,
  brandData: BrandSales,
  brandModels: ModelSales[],
  rank: number,
  totalMarket: number,
): ArticleDraft | null {
  if (brandModels.length === 0) return null;

  const [year, month] = yearMonth.split('-');
  const monthNum = parseInt(month);
  const topModels = brandModels.slice(0, 5);
  const brandModelShare = topModels.slice(0, 2);

  const rankText = rank === 1 ? '蟬聯龍頭' : rank === 2 ? '穩守第二' : rank === 3 ? '穩居第三' : `位居第${rank}`;

  // Analyze displacement distribution
  const ccGroups: Record<string, number> = {};
  brandModels.forEach(m => {
    const cc = m.displacement_cc || 0;
    const group = cc === 0 ? '電動' : cc <= 125 ? '125cc以下' : cc <= 160 ? '126-160cc' : cc <= 300 ? '161-300cc' : '300cc以上';
    ccGroups[group] = (ccGroups[group] || 0) + m.total_sales;
  });
  const mainCC = Object.entries(ccGroups).sort((a, b) => b[1] - a[1])[0];

  const content = `## ${brandData.brand} 市場表現

${brandData.brand} 在 ${monthNum} 月以 ${brandData.total.toLocaleString()} 台銷量${rankText}，市佔率 ${(brandData.market_share || 0).toFixed(1)}%。${brandData.yoy_ratio ? `年增率 ${brandData.yoy_ratio > 0 ? '+' : ''}${brandData.yoy_ratio.toFixed(1)}%。` : ''}

## 熱銷車款

| 排名 | 車款 | 銷量 | 佔品牌比 |
|------|------|------|----------|
${topModels.map((m, i) => {
    const brandPct = brandData.total > 0 ? ((m.total_sales / brandData.total) * 100).toFixed(1) : '0';
    return `| ${i + 1} | ${m.display_name || m.model_code} | ${m.total_sales.toLocaleString()} | ${brandPct}% |`;
  }).join('\n')}

## 級距佈局

${brandData.brand} 的銷量主力集中在${mainCC ? `${mainCC[0]}級距（${mainCC[1].toLocaleString()} 台）` : '多元級距'}。${brandModelShare.length >= 2 ? `${brandModelShare[0].display_name || brandModelShare[0].model_code} 與 ${brandModelShare[1].display_name || brandModelShare[1].model_code} 合計貢獻超過品牌${brandData.total > 0 ? ((brandModelShare.reduce((s, m) => s + m.total_sales, 0) / brandData.total * 100).toFixed(0)) : 0}% 銷量。` : ''}

## 競爭態勢

${rank <= 3 ? `作為台灣機車市場前三大品牌，${brandData.brand} 持續在主力級距深耕。` : `${brandData.brand} 在特定市場區塊擁有忠實客群。`}後續需關注新車型推出時程與行銷策略調整。`;

  return {
    slug: `${yearMonth}-${brandData.brand.toLowerCase().replace(/\s+/g, '-')}-analysis`,
    title: `${brandData.brand} ${monthNum}月${rankText}：${topModels[0] ? (topModels[0].display_name || topModels[0].model_code) : ''}${topModels[1] ? ` 與 ${topModels[1].display_name || topModels[1].model_code}` : ''} 為銷售主力`,
    category: 'data-report',
    category_label: '數據報告',
    excerpt: `${brandData.brand} 以 ${brandData.total.toLocaleString()} 台銷量拿下 ${(brandData.market_share || 0).toFixed(1)}% 市佔率${topModels[0] ? `，${topModels[0].display_name || topModels[0].model_code} 為銷售主力` : ''}。`,
    content,
    tags: [brandData.brand, ...topModels.slice(0, 3).map(m => m.display_name || m.model_code), '品牌分析'],
    is_auto_generated: true,
  };
}

function generateCCTrendAnalysis(
  yearMonth: string,
  topModels: ModelSales[],
  totalMarket: number,
): ArticleDraft {
  const [year, month] = yearMonth.split('-');
  const monthNum = parseInt(month);

  // Group by CC segment
  const segments: Record<string, { models: ModelSales[]; total: number }> = {
    '電動': { models: [], total: 0 },
    '125cc以下': { models: [], total: 0 },
    '126-180cc': { models: [], total: 0 },
    '181-300cc': { models: [], total: 0 },
    '301-550cc': { models: [], total: 0 },
    '551cc以上': { models: [], total: 0 },
  };

  topModels.forEach(m => {
    const cc = m.displacement_cc || 0;
    let seg = '電動';
    if (cc > 0 && cc <= 125) seg = '125cc以下';
    else if (cc > 125 && cc <= 180) seg = '126-180cc';
    else if (cc > 180 && cc <= 300) seg = '181-300cc';
    else if (cc > 300 && cc <= 550) seg = '301-550cc';
    else if (cc > 550) seg = '551cc以上';
    segments[seg].models.push(m);
    segments[seg].total += m.total_sales;
  });

  const segEntries = Object.entries(segments).filter(([, v]) => v.total > 0).sort((a, b) => b[1].total - a[1].total);
  const topSeg = segEntries[0];

  const segTable = segEntries.map(([name, data]) => {
    const share = totalMarket > 0 ? ((data.total / totalMarket) * 100).toFixed(1) : '0';
    const topModel = data.models[0];
    return `| ${name} | ${data.total.toLocaleString()} | ${share}% | ${topModel ? (topModel.display_name || topModel.model_code) : '-'} |`;
  }).join('\n');

  const content = `## 級距分佈總覽

${monthNum}月台灣機車市場各級距銷售分析，${topSeg[0]}級距以 ${topSeg[1].total.toLocaleString()} 台居冠，佔整體市場 ${(topSeg[1].total / totalMarket * 100).toFixed(1)}%。

## 各級距銷售數據

| 級距 | 銷量 | 市佔 | 級距冠軍 |
|------|------|------|----------|
${segTable}

${segEntries.map(([name, data]) => {
    if (data.models.length === 0) return '';
    const top3 = data.models.slice(0, 3);
    return `## ${name}級距

銷量 ${data.total.toLocaleString()} 台，${totalMarket > 0 ? `佔比 ${(data.total / totalMarket * 100).toFixed(1)}%` : ''}。${top3.length > 0 ? `前三名：${top3.map((m, i) => `${m.display_name || m.model_code}（${m.total_sales.toLocaleString()} 台）`).join('、')}。` : ''}${name === '125cc以下' ? ' 此級距仍為台灣機車市場最大宗，通勤代步需求穩定。' : name === '電動' ? ' 電動車在補助政策支持下持續成長，換電站佈建密度提升有助銷量。' : name.includes('551') ? ' 大型重機市場以進口品牌為主，消費者注重品牌價值與騎乘體驗。' : ''}`;
  }).filter(Boolean).join('\n\n')}

## 趨勢觀察

${topSeg[0] === '125cc以下' ? '125cc 通勤車仍是主流，但 150-180cc 運動速克達持續侵蝕市場。' : '消費升級趨勢明顯，中大排量車款需求成長。'}電動車滲透率${segments['電動'].total > 0 ? `達 ${(segments['電動'].total / totalMarket * 100).toFixed(1)}%` : '持續觀望中'}，是未來最值得關注的變數。`;

  return {
    slug: `${yearMonth}-cc-segment-analysis`,
    title: `級距分析：${topSeg[0]}仍是主流，${segEntries.length > 2 ? segEntries[1][0] : ''}${segEntries.length > 2 ? '穩定成長' : ''}`,
    category: 'data-report',
    category_label: '數據報告',
    excerpt: `${monthNum}月銷售數據顯示 ${topSeg[0]} 級距佔比最高，${segEntries.slice(0, 3).map(([name]) => name).join('、')}為前三大級距。`,
    content,
    tags: ['級距分析', '市場趨勢', ...segEntries.slice(0, 3).map(([name]) => name), '數據分析'],
    is_auto_generated: true,
  };
}

function generateTop10Article(
  yearMonth: string,
  topModels: ModelSales[],
  totalMarket: number,
): ArticleDraft {
  const [year, month] = yearMonth.split('-');
  const monthNum = parseInt(month);
  const top10 = topModels.slice(0, 10);
  const top10Total = top10.reduce((s, m) => s + m.total_sales, 0);
  const top10Share = totalMarket > 0 ? ((top10Total / totalMarket) * 100).toFixed(1) : '0';

  const content = `## ${monthNum}月 Top 10 熱銷車款

${monthNum}月前十名車款合計銷售 ${top10Total.toLocaleString()} 台，佔全市場 ${top10Share}%。

| 排名 | 車款 | 品牌 | 排氣量 | 銷量 | 佔比 |
|------|------|------|--------|------|------|
${top10.map((m, i) => {
    const share = totalMarket > 0 ? ((m.total_sales / totalMarket) * 100).toFixed(1) : '0';
    const ccText = m.displacement_cc ? `${m.displacement_cc}cc` : '電動';
    return `| ${i + 1} | ${m.display_name || m.model_code} | ${m.brand} | ${ccText} | ${m.total_sales.toLocaleString()} | ${share}% |`;
  }).join('\n')}

${top10.slice(0, 3).map((m, i) => {
    const share = totalMarket > 0 ? ((m.total_sales / totalMarket) * 100).toFixed(1) : '0';
    return `## 第${i + 1}名：${m.display_name || m.model_code}

${m.brand} ${m.display_name || m.model_code}${m.displacement_cc ? `（${m.displacement_cc}cc）` : ''} 以 ${m.total_sales.toLocaleString()} 台拿下${i === 0 ? '單月銷售冠軍' : `第${i + 1}名`}，市佔 ${share}%。${i === 0 ? '持續展現強勁的市場競爭力。' : '表現穩定，為品牌重要銷量支柱。'}`;
  }).join('\n\n')}

## 觀察重點

前三名車款皆為${top10[0]?.displacement_cc && top10[0].displacement_cc <= 160 ? '小排量通勤車型，反映台灣市場以實用導向為主' : '主流級距車型'}。Top 10 中${(() => { const brands = [...new Set(top10.map(m => m.brand))]; return `涵蓋 ${brands.length} 個品牌（${brands.join('、')}）`; })()}，市場競爭激烈。`;

  return {
    slug: `${yearMonth}-top-10-models`,
    title: `${monthNum}月 Top 10 熱銷機車：${top10[0] ? (top10[0].display_name || top10[0].model_code) : ''} 稱霸、前十佔比 ${top10Share}%`,
    category: 'data-report',
    category_label: '數據報告',
    excerpt: `${monthNum}月熱銷 Top 10 出爐，${top10[0] ? `${top10[0].display_name || top10[0].model_code}（${top10[0].total_sales.toLocaleString()} 台）居冠` : ''}，前十名合計佔全市場 ${top10Share}%。`,
    content,
    tags: ['Top10', '熱銷車款', ...top10.slice(0, 5).map(m => m.display_name || m.model_code).filter(Boolean)],
    is_auto_generated: true,
  };
}

function generateEVReport(
  yearMonth: string,
  brands: BrandSales[],
  evModels: ModelSales[],
  totalMarket: number,
): ArticleDraft | null {
  const evBrands = brands.filter(b => isEVBrand(b.brand));
  const evTotal = evBrands.reduce((s, b) => s + b.total, 0);
  if (evTotal === 0 && evModels.length === 0) return null;

  const [year, month] = yearMonth.split('-');
  const monthNum = parseInt(month);
  const evShare = totalMarket > 0 ? ((evTotal / totalMarket) * 100).toFixed(1) : '0';

  const content = `## 電動車市場概況

${monthNum}月電動機車合計銷售 ${evTotal.toLocaleString()} 台，市佔率 ${evShare}%。

## 電動車品牌銷量

| 品牌 | 銷量 | 市佔率 |
|------|------|--------|
${evBrands.map(b => `| ${b.brand} | ${b.total.toLocaleString()} | ${(b.market_share || 0).toFixed(1)}% |`).join('\n')}

${evModels.length > 0 ? `## 電動車款排行

| 排名 | 車款 | 品牌 | 銷量 |
|------|------|------|------|
${evModels.slice(0, 10).map((m, i) => `| ${i + 1} | ${m.display_name || m.model_code} | ${m.brand} | ${m.total_sales.toLocaleString()} |`).join('\n')}` : ''}

## 趨勢分析

電動機車在台灣市場${parseFloat(evShare) > 5 ? '已站穩腳跟' : '仍處於成長階段'}。${evBrands[0] ? `${evBrands[0].brand} 以 ${evBrands[0].total.toLocaleString()} 台持續領導電動車市場` : ''}。換電站與充電基礎建設的完善程度，將是影響電動車滲透率的關鍵因素。

## 政策影響

政府電動機車購車補助持續實施中，各縣市加碼補助金額不一。消費者在選購電動機車時，除了車輛本身性能外，換電站/充電站的便利性仍是最主要的考量因素。`;

  return {
    slug: `${yearMonth}-ev-market-report`,
    title: `電動車${monthNum}月報：${evBrands[0] ? evBrands[0].brand : '電動車'}銷售 ${evTotal.toLocaleString()} 台、市佔 ${evShare}%`,
    category: 'industry',
    category_label: '產業動態',
    excerpt: `${monthNum}月電動機車銷售 ${evTotal.toLocaleString()} 台，市佔率 ${evShare}%。${evBrands[0] ? `${evBrands[0].brand} ${evBrands[0].total.toLocaleString()} 台居冠。` : ''}`,
    content,
    tags: ['電動車', ...evBrands.map(b => b.brand), 'EV', '市場趨勢'],
    is_auto_generated: true,
  };
}

// Helper: CC segment text
function generateCCSegmentText(models: ModelSales[]): string {
  const seg125 = models.filter(m => (m.displacement_cc || 0) > 0 && (m.displacement_cc || 0) <= 125);
  const seg150 = models.filter(m => (m.displacement_cc || 0) > 125 && (m.displacement_cc || 0) <= 180);
  const texts: string[] = [];

  if (seg125.length > 0) {
    const total = seg125.reduce((s, m) => s + m.total_sales, 0);
    texts.push(`125cc 以下級距共 ${total.toLocaleString()} 台，仍為最大宗。`);
  }
  if (seg150.length > 0) {
    const total = seg150.reduce((s, m) => s + m.total_sales, 0);
    texts.push(`150-180cc 運動速克達共 ${total.toLocaleString()} 台，持續展現成長動能。`);
  }
  return texts.join('') || '各級距維持穩定銷售。';
}

// ═══════════════════════════════════════
//  ARTICLE DRAFT INTERFACE
// ═══════════════════════════════════════

interface ArticleDraft {
  slug: string;
  title: string;
  category: string;
  category_label: string;
  excerpt: string;
  content: string;
  tags: string[];
  is_auto_generated: boolean;
}

// ═══════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const yearMonth = url.searchParams.get('year_month');

    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid year_month parameter (format: YYYY-MM)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Fetch brand sales data
    const { data: brands, error: brandsErr } = await supabase
      .from('sales_brand_monthly')
      .select('brand, total, market_share, yoy_ratio')
      .eq('year_month', yearMonth)
      .order('total', { ascending: false });

    if (brandsErr || !brands || brands.length === 0) {
      return new Response(
        JSON.stringify({ error: `No sales data found for ${yearMonth}`, detail: brandsErr }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalMarket = brands.reduce((s, b) => s + (b.total || 0), 0);

    // Normalize market_share: auto-detect ratio (0~1) vs percentage (0~100)
    const sumShare = brands.reduce((s, b) => s + (b.market_share || 0), 0);
    if (sumShare > 0 && sumShare < 2) {
      // ratio format (0~1), convert to percentage
      brands.forEach(b => { b.market_share = (b.market_share || 0) * 100; });
    } else if (sumShare > 200) {
      // corrupted data, recalculate from totals
      brands.forEach(b => {
        b.market_share = totalMarket > 0 ? (b.total / totalMarket) * 100 : 0;
      });
    }

    // 2. Fetch model sales data
    const { data: models } = await supabase
      .from('vehicle_monthly_sales')
      .select('brand, model_code, display_name, total_sales, displacement_cc')
      .eq('year_month', yearMonth)
      .order('total_sales', { ascending: false })
      .limit(200);

    const topModels: ModelSales[] = (models || []) as ModelSales[];

    // 3. Get previous month total for MoM comparison
    const [y, m] = yearMonth.split('-').map(Number);
    const prevMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    const { data: prevBrands } = await supabase
      .from('sales_brand_monthly')
      .select('total')
      .eq('year_month', prevMonth);
    const prevMonthTotal = prevBrands ? prevBrands.reduce((s, b) => s + (b.total || 0), 0) : null;

    // 4. Generate articles
    const articles: ArticleDraft[] = [];

    // Article 1: Monthly overview
    articles.push(generateMonthlyOverview(yearMonth, brands, topModels, totalMarket, prevMonthTotal));

    // Article 2-4: Top 3 brand analyses
    for (let i = 0; i < Math.min(3, brands.length); i++) {
      const aliases = getBrandAliases(brands[i].brand);
      const brandModels = topModels.filter(m =>
        aliases.some(a => a.toUpperCase() === m.brand.toUpperCase())
      );
      const article = generateBrandAnalysis(yearMonth, brands[i], brandModels, i + 1, totalMarket);
      if (article) articles.push(article);
    }

    // Article 5: CC segment trend analysis
    articles.push(generateCCTrendAnalysis(yearMonth, topModels, totalMarket));

    // Article 6: Top 10 models
    articles.push(generateTop10Article(yearMonth, topModels, totalMarket));

    // Article 7: EV report (only if EV data exists)
    const evModels = topModels.filter(m => (m.displacement_cc || 0) === 0);
    const evArticle = generateEVReport(yearMonth, brands, evModels, totalMarket);
    if (evArticle) articles.push(evArticle);

    // 5. Upsert articles (conflict on slug)
    const now = new Date().toISOString();
    const rows = articles.map((a, i) => ({
      ...a,
      published_at: new Date(
        new Date(`${yearMonth}-15`).getTime() + (articles.length - i) * 86400000
      ).toISOString(),
      source: `auto-generate-${yearMonth}`,
      created_at: now,
      updated_at: now,
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from('news')
      .upsert(rows, { onConflict: 'slug' })
      .select('slug, title');

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to insert articles', detail: insertErr }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        year_month: yearMonth,
        total_market: totalMarket,
        articles_generated: articles.length,
        articles: (inserted || []).map(a => ({ slug: a.slug, title: a.title })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
