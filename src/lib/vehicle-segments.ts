/**
 * 車型市場分類對照表 (小老婆汽機車分類標準)
 *
 * 分類來源: 小老婆汽機車 2026/02 月度銷售報表
 * 同步於 Supabase vehicle_categories 表
 */

export type VehicleSegment =
  | '入門100'
  | '入門125'
  | '小型125'
  | '高階125'
  | '高階150'
  | '商用速克達'
  | '大型速克達'
  | '電動機車'
  | 'PBGN';

export interface SegmentEntry {
  segment: VehicleSegment;
  brand: string;
  modelName: string;
}

/** All known segment labels, ordered by market size */
export const SEGMENT_LABELS: { id: VehicleSegment; label: string; desc: string }[] = [
  { id: '入門125', label: '入門125', desc: '國民代步車款 (勁豪、活力、GP125...)' },
  { id: '高階150', label: '高階150', desc: '運動/旗艦速克達 (DRG II、Cygnus XR、KRV...)' },
  { id: '高階125', label: '高階125', desc: '運動型125 (勁戰、Jet SL、BWS...)' },
  { id: '大型速克達', label: '大型速克達', desc: '黃紅牌速克達 (TMAX、XMAX、AK575...)' },
  { id: 'PBGN', label: 'PBGN', desc: 'Powered by Gogoro Network 換電聯盟' },
  { id: '電動機車', label: '電動機車', desc: 'Gogoro 自有品牌電動車' },
  { id: '商用速克達', label: '商用速克達', desc: '商用/外送車款 (4MICA、大樂、金牌...)' },
  { id: '小型125', label: '小型125', desc: '輕巧車身125 (Z1 Attila、Rs Neo、VJR...)' },
  { id: '入門100', label: '入門100', desc: '100-115cc入門款 (Woo 115、Nice XL...)' },
];

/** Complete model → segment mapping */
export const VEHICLE_SEGMENT_MAP: SegmentEntry[] = [
  // ═══ 入門100 ═══
  { segment: '入門100', brand: 'SYM', modelName: 'Woo 115' },
  { segment: '入門100', brand: 'KYMCO', modelName: 'Nice XL 115' },

  // ═══ 入門125 ═══
  { segment: '入門125', brand: 'YAMAHA', modelName: '勁豪' },
  { segment: '入門125', brand: 'YAMAHA', modelName: 'Jog 125' },
  { segment: '入門125', brand: 'SYM', modelName: '新迪爵125' },
  { segment: '入門125', brand: 'SYM', modelName: '活力125' },
  { segment: '入門125', brand: 'SYM', modelName: '全新迪爵' },
  { segment: '入門125', brand: 'KYMCO', modelName: 'GP 125' },
  { segment: '入門125', brand: 'KYMCO', modelName: 'K1' },
  { segment: '入門125', brand: 'KYMCO', modelName: '新豪邁125' },
  { segment: '入門125', brand: 'KYMCO', modelName: '大地名流2.0' },
  { segment: '入門125', brand: 'KYMCO', modelName: '大地名流' },

  // ═══ 小型125 ═══
  { segment: '小型125', brand: 'SYM', modelName: 'Z1 Attila 125' },
  { segment: '小型125', brand: 'YAMAHA', modelName: 'Rs Neo' },
  { segment: '小型125', brand: 'KYMCO', modelName: 'VJR 125' },

  // ═══ 高階125 ═══
  { segment: '高階125', brand: 'YAMAHA', modelName: '六代勁戰' },
  { segment: '高階125', brand: 'YAMAHA', modelName: '七代勁戰' },
  { segment: '高階125', brand: 'YAMAHA', modelName: 'BWS 125' },
  { segment: '高階125', brand: 'SYM', modelName: 'Jet SL SuperC' },
  { segment: '高階125', brand: 'SYM', modelName: 'Jet SR 125' },
  { segment: '高階125', brand: 'SYM', modelName: 'KRN 125' },
  { segment: '高階125', brand: 'KYMCO', modelName: 'RTS 135' },
  { segment: '高階125', brand: 'KYMCO', modelName: 'RTS 125' },
  { segment: '高階125', brand: 'SUZUKI', modelName: 'GSR / Swish' },

  // ═══ 高階150 ═══
  { segment: '高階150', brand: 'YAMAHA', modelName: 'Force 2.0' },
  { segment: '高階150', brand: 'YAMAHA', modelName: 'NMAX' },
  { segment: '高階150', brand: 'YAMAHA', modelName: 'Cygnus XR' },
  { segment: '高階150', brand: 'YAMAHA', modelName: 'AUGUR' },
  { segment: '高階150', brand: 'SYM', modelName: 'Jet SL+' },
  { segment: '高階150', brand: 'SYM', modelName: 'Jet SL+ SuperC' },
  { segment: '高階150', brand: 'SYM', modelName: 'DRG II' },
  { segment: '高階150', brand: 'SYM', modelName: 'MMBCU' },
  { segment: '高階150', brand: 'SYM', modelName: 'Fiddle DX 158' },
  { segment: '高階150', brand: 'PGO', modelName: 'TIGRA 250' },
  { segment: '高階150', brand: 'PGO', modelName: 'TIG' },
  { segment: '高階150', brand: 'AEON', modelName: 'STR 250' },
  { segment: '高階150', brand: 'AEON', modelName: 'Brera X 250' },
  { segment: '高階150', brand: 'KYMCO', modelName: 'KRV MOTO' },
  { segment: '高階150', brand: 'KYMCO', modelName: 'ROMA GT' },
  { segment: '高階150', brand: 'KYMCO', modelName: 'RTS R 165' },
  { segment: '高階150', brand: 'KYMCO', modelName: 'RCS MOTO' },
  { segment: '高階150', brand: 'KYMCO', modelName: 'ST 250' },

  // ═══ 商用速克達 ═══
  { segment: '商用速克達', brand: 'SYM', modelName: '4MICA 125 / ABS' },
  { segment: '商用速克達', brand: 'SYM', modelName: '4MICA 150 / ABS' },
  { segment: '商用速克達', brand: 'KYMCO', modelName: '大樂 125 / ABS' },
  { segment: '商用速克達', brand: 'KYMCO', modelName: '大樂 150 / ABS' },
  { segment: '商用速克達', brand: 'KYMCO', modelName: '金牌 125' },
  { segment: '商用速克達', brand: 'KYMCO', modelName: '金牌 150' },

  // ═══ 大型速克達 ═══
  { segment: '大型速克達', brand: 'YAMAHA', modelName: 'TMAX 560' },
  { segment: '大型速克達', brand: 'YAMAHA', modelName: 'XMAX 300' },
  { segment: '大型速克達', brand: 'SYM', modelName: 'CruiSYM 300' },
  { segment: '大型速克達', brand: 'SYM', modelName: 'ADXTG' },
  { segment: '大型速克達', brand: 'SYM', modelName: 'TTLBT' },
  { segment: '大型速克達', brand: 'SYM', modelName: 'MAXSYM GT' },
  { segment: '大型速克達', brand: 'PGO', modelName: 'TIGRA 251' },
  { segment: '大型速克達', brand: 'AEON', modelName: 'STR' },
  { segment: '大型速克達', brand: 'AEON', modelName: 'Brera X' },
  { segment: '大型速克達', brand: 'KYMCO', modelName: 'AK 550 Premium' },
  { segment: '大型速克達', brand: 'KYMCO', modelName: 'AK 575 Premium' },
  { segment: '大型速克達', brand: 'KYMCO', modelName: 'Xciting X350' },
  { segment: '大型速克達', brand: 'KYMCO', modelName: 'GDINK CT300' },

  // ═══ 電動機車 (Gogoro) ═══
  { segment: '電動機車', brand: 'GOGORO', modelName: 'Gogoro 2 / S2' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'VIVA XL' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'Delight' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'Crossover' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'VIVA MIX' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'PULSE' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'VIVA' },
  { segment: '電動機車', brand: 'GOGORO', modelName: 'JEGO / EZZY' },

  // ═══ PBGN ═══
  { segment: 'PBGN', brand: 'PGO', modelName: 'Ur1' },
  { segment: 'PBGN', brand: 'PGO', modelName: 'Ur2' },
  { segment: 'PBGN', brand: 'EREADY', modelName: 'Fun' },
  { segment: 'PBGN', brand: 'EREADY', modelName: 'Run / mini' },
  { segment: 'PBGN', brand: 'YAMAHA', modelName: 'CUXiE' },
  { segment: 'PBGN', brand: 'YAMAHA', modelName: 'EC05' },
  { segment: 'PBGN', brand: 'AEON', modelName: 'Ai-1 Sport/U' },
  { segment: 'PBGN', brand: 'AEON', modelName: 'Ai-2 Gather' },
  { segment: 'PBGN', brand: 'AEON', modelName: 'Ai-3 More' },
  { segment: 'PBGN', brand: 'AEON', modelName: 'Ai-3 Lite' },
  { segment: 'PBGN', brand: 'AEON', modelName: 'Ai-4 Ever' },
  { segment: 'PBGN', brand: 'AEON', modelName: 'EV-C1' },
  { segment: 'PBGN', brand: '威速登', modelName: '電動三輪' },
  { segment: 'PBGN', brand: 'CMC', modelName: 'EZ-1' },
  { segment: 'PBGN', brand: 'CMC', modelName: 'EZ-R' },
];

/**
 * Quick lookup: model name → segment
 * Normalizes to lowercase for fuzzy matching
 */
export const MODEL_TO_SEGMENT: Map<string, VehicleSegment> = new Map(
  VEHICLE_SEGMENT_MAP.map(e => [e.modelName.toLowerCase(), e.segment])
);

/**
 * Get segment for a model name (fuzzy match)
 * Tries exact match first, then partial includes
 */
export function getSegment(modelName: string): VehicleSegment | null {
  const lower = modelName.toLowerCase().trim();

  // Exact match
  const exact = MODEL_TO_SEGMENT.get(lower);
  if (exact) return exact;

  // Partial match: check if any key is included in the model name or vice versa
  for (const [key, segment] of MODEL_TO_SEGMENT) {
    if (lower.includes(key) || key.includes(lower)) {
      return segment;
    }
  }

  return null;
}

/**
 * Get all models in a segment
 */
export function getModelsInSegment(segment: VehicleSegment): SegmentEntry[] {
  return VEHICLE_SEGMENT_MAP.filter(e => e.segment === segment);
}

/**
 * Get all segments for a brand
 */
export function getSegmentsForBrand(brand: string): VehicleSegment[] {
  const upper = brand.toUpperCase();
  const segments = new Set(
    VEHICLE_SEGMENT_MAP
      .filter(e => e.brand.toUpperCase() === upper)
      .map(e => e.segment)
  );
  return [...segments];
}
