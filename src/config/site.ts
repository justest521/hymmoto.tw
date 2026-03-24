/**
 * HYMMOTO.TW Site Configuration
 * Central configuration for site metadata, navigation, colors, and settings
 */

export const siteConfig = {
  // Basic site information
  name: 'HYMMOTO.TW',
  description: '台灣重型機車數據平台 - 深度RPG風格的機車數據探險',
  descriptionEn: 'Taiwan Motorcycle Data Platform - Dark RPG Themed Data Explorer',
  url: 'https://hymmoto.tw',
  locale: 'zh-TW',

  // Social links
  socials: {
    github: 'https://github.com/hymmoto',
    twitter: 'https://twitter.com/hymmoto_tw',
    facebook: 'https://facebook.com/hymmoto.tw',
    instagram: 'https://instagram.com/hymmoto.tw',
    youtube: 'https://youtube.com/hymmototw',
    line: 'https://line.me/R/ti/p/hymmoto',
  },

  // Color constants
  colors: {
    background: '#0a0a0c',
    card: '#1a1a1f',
    foreground: '#e4e4e7',
    border: '#27272a',
    accent: '#b8f53e',
    accentDark: '#8bc62e',
    muted: '#71717a',
    mutedForeground: '#a1a1a9',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#eab308',
    info: '#0ea5e9',
  },

  // Navigation menu items
  navigation: [
    {
      label: '首頁',
      labelEn: 'Home',
      href: '/',
      icon: 'Home',
    },
    {
      label: '品牌列表',
      labelEn: 'Brands',
      href: '/brands',
      icon: 'Grid',
    },
    {
      label: '車型資料庫',
      labelEn: 'Models',
      href: '/models',
      icon: 'Database',
    },
    {
      label: '銷售數據',
      labelEn: 'Sales',
      href: '/sales',
      icon: 'BarChart3',
    },
    {
      label: '中古估價',
      labelEn: 'Valuation',
      href: '/valuation',
      icon: 'TrendingUp',
    },
    {
      label: '中古買賣',
      labelEn: 'Used Market',
      href: '/market',
      icon: 'ShoppingCart',
    },
    {
      label: '文章',
      labelEn: 'Articles',
      href: '/articles',
      icon: 'BookOpen',
    },
    {
      label: '頻道',
      labelEn: 'Channel',
      href: '/channel',
      icon: 'Radio',
    },
  ],

  // Secondary navigation
  secondaryNav: [
    {
      label: '關於我們',
      labelEn: 'About Us',
      href: '/about',
    },
    {
      label: '聯絡我們',
      labelEn: 'Contact',
      href: '/contact',
    },
    {
      label: '隱私政策',
      labelEn: 'Privacy',
      href: '/privacy',
    },
    {
      label: '服務條款',
      labelEn: 'Terms',
      href: '/terms',
    },
    {
      label: 'API 文件',
      labelEn: 'API Docs',
      href: '/api/docs',
    },
  ],

  // Footer sections
  footerSections: [
    {
      title: '資料',
      titleEn: 'Data',
      links: [
        { label: '品牌', labelEn: 'Brands', href: '/brands' },
        { label: '車型', labelEn: 'Models', href: '/models' },
        { label: '銷售', labelEn: 'Sales', href: '/sales' },
        { label: '估價', labelEn: 'Valuation', href: '/valuation' },
      ],
    },
    {
      title: '社群',
      titleEn: 'Community',
      links: [
        { label: '中古市場', labelEn: 'Used Market', href: '/market' },
        { label: '討論區', labelEn: 'Forum', href: '/forum' },
        { label: '會員', labelEn: 'Members', href: '/members' },
        { label: '商家', labelEn: 'Shops', href: '/shops' },
      ],
    },
    {
      title: '內容',
      titleEn: 'Content',
      links: [
        { label: '文章', labelEn: 'Articles', href: '/articles' },
        { label: '評測', labelEn: 'Reviews', href: '/reviews' },
        { label: '新聞', labelEn: 'News', href: '/news' },
        { label: '頻道', labelEn: 'Channel', href: '/channel' },
      ],
    },
  ],

  // SEO defaults
  seo: {
    ogImage: '/og-image.png',
    twitterHandle: '@hymmoto_tw',
    keywords: [
      '台灣',
      '機車',
      '重型機車',
      '數據',
      '銷售',
      '估價',
      'motorcycle',
      'Taiwan',
      'CPO',
      'Used bike',
    ],
  },

  // Feature flags
  features: {
    salesData: true,
    valuationCalculator: true,
    usedMarket: true,
    articles: true,
    forum: true,
    channel: true,
    businessShops: true,
    api: false, // Coming soon
  },

  // API endpoints
  api: {
    base: process.env.NEXT_PUBLIC_API_URL || 'https://api.hymmoto.tw',
    version: 'v1',
  },

  // Pagination
  pagination: {
    defaultPerPage: 20,
    defaultPerPageMobile: 10,
    maxPerPage: 100,
  },

  // Cache durations (in seconds)
  cache: {
    brands: 86400, // 24 hours
    models: 86400,
    sales: 3600, // 1 hour
    articles: 86400,
    shortLived: 300, // 5 minutes
  },

  // Form validation
  validation: {
    minPasswordLength: 8,
    maxUsernameLength: 30,
    minUsernameLength: 3,
    maxBioLength: 500,
    maxTitleLength: 200,
  },

  // Display settings
  display: {
    itemsPerRow: {
      desktop: 4,
      tablet: 2,
      mobile: 1,
    },
    defaultTheme: 'dark',
    enableAnimations: true,
  },

  // Motorcycle categories
  categories: {
    scooter: 'Scooter',
    naked: 'Naked',
    cruiser: 'Cruiser',
    sportbike: 'Sportbike',
    tourer: 'Tourer',
    adventure: 'Adventure',
    dualsport: 'Dual-sport',
    offroad: 'Off-road',
    atv: 'ATV',
    scooter_auto: 'Automatic Scooter',
    scooter_manual: 'Manual Scooter',
  },

  // Engine types
  engineTypes: {
    single: 'Single Cylinder',
    parallel_twin: 'Parallel Twin',
    v_twin: 'V-Twin',
    triple: 'Triple',
    inline_four: 'Inline Four',
    flat: 'Flat',
  },

  // Fuel types
  fuelTypes: {
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
    cng: 'CNG',
  },

  // Transmission types
  transmissions: {
    manual: 'Manual',
    auto: 'Automatic',
    cvt: 'CVT',
    dct: 'DCT',
    semi_auto: 'Semi-Automatic',
  },

  // Condition ratings
  conditions: [
    { value: 'excellent', label: '優秀', color: 'green' },
    { value: 'good', label: '良好', color: 'blue' },
    { value: 'fair', label: '一般', color: 'yellow' },
    { value: 'poor', label: '待修', color: 'red' },
  ],

  // Member types
  memberTypes: [
    { value: 'individual', label: '個人會員' },
    { value: 'dealer', label: '商家會員' },
    { value: 'admin', label: '管理員' },
  ],

  // Listing statuses
  listingStatuses: [
    { value: 'available', label: '上架中', color: 'green' },
    { value: 'pending', label: '待確認', color: 'yellow' },
    { value: 'sold', label: '已售出', color: 'gray' },
  ],

  // Demand levels
  demandLevels: [
    { value: 'high', label: '高需求', color: 'green' },
    { value: 'medium', label: '中等需求', color: 'yellow' },
    { value: 'low', label: '低需求', color: 'red' },
  ],

  // Toast notifications defaults
  toast: {
    duration: 3000,
    position: 'bottom-right' as const,
  },

  // Mobile breakpoints (should match Tailwind)
  breakpoints: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

export type SiteConfig = typeof siteConfig;
