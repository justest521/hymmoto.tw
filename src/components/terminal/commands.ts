// HYMMOTO.TW Terminal Command System

const VERSION = '2.0.0'

function visualWidth(str: string): number {
  let w = 0
  for (const ch of str) { w += ch.charCodeAt(0) > 0x7f ? 2 : 1 }
  return w
}

function padEndCJK(str: string, len: number): string {
  const diff = len - visualWidth(str)
  return diff > 0 ? str + ' '.repeat(diff) : str
}

const BANNER = `
██╗  ██╗██╗   ██╗███╗   ███╗███╗   ███╗ ██████╗ ████████╗ ██████╗
██║  ██║╚██╗ ██╔╝████╗ ████║████╗ ████║██╔═══██╗╚══██╔══╝██╔═══██╗
███████║ ╚████╔╝ ██╔████╔██║██╔████╔██║██║   ██║   ██║   ██║   ██║
██╔══██║  ╚██╔╝  ██║╚██╔╝██║██║╚██╔╝██║██║   ██║   ██║   ██║   ██║
██║  ██║   ██║   ██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╔╝   ██║   ╚██████╔╝
╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝    ╚═╝    ╚═════╝
                                              .TW  v${VERSION}

Type 'help' to see list of available commands.

--
台灣第一機車數據暨交易平台
即時銷售數據 · 566+ 車款規格 · AI 自動分析 · 中古車行情
`

export interface CommandResult {
  output: string
  isHTML?: boolean
  navigate?: string
}

type CommandFn = (args: string[]) => CommandResult | Promise<CommandResult>

const text = (output: string): CommandResult => ({ output })
const nav = (output: string, navigate: string): CommandResult => ({ output, navigate })

export const commands: Record<string, CommandFn> = {
  help: () => {
    return text(`Available commands:

  Navigation:
    data          數據中心 - 銷售排行、品牌分析
    bikes         車款資料庫 - 566+ 車款規格
    rankings      排行榜 - 銷售王、動力王、CP值王
    news          最新動態 - AI 自動生成新聞
    used          中古車 - 行情查詢、刊登
    motodex       車款圖鑑 - RPG 風格數據卡
    battle        對戰模式 - 車款 PK 比較

  System:
    help          顯示可用指令
    banner        顯示 HYMMOTO ASCII Banner
    about         關於本站
    clear         清除畫面
    date          顯示日期時間
    whoami        你是誰？
    theme         切換主題色
    version       版本資訊

  Data:
    top [n]       本月銷售 TOP N（預設 10）
    brand [name]  查詢品牌銷售（如: brand yamaha）
    search [kw]   搜尋車款（如: search ninja）
    stats         顯示平台統計

  [tab]   trigger completion.
  [↑/↓]   history navigation.
  [ctrl+l] clear terminal.`)
  },

  banner: () => text(BANNER),

  about: () => text(`
  HYMMOTO.TW - 台灣機車數據平台 v${VERSION}
  ─────────────────────────────────────

  >_ 190,938+ 筆銷售紀錄
  :: 566+ 車款完整規格
  #1 32+ 品牌即時分析
  $> 270+ 中古車行情

  Powered by Supabase + Next.js + AI
  Data source: 公路局機車登錄統計

  Repository: github.com/hymmoto
  Contact: justest521@gmail.com`),

  clear: () => text('__CLEAR__'),

  date: () => text(new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })),

  whoami: () => text('guest'),

  version: () => text(`HYMMOTO.TW v${VERSION} (Next.js 14 / React 18 / Supabase)`),

  theme: (args: string[]) => {
    if (args.length === 0) {
      return text(`Usage: theme [set] [name]
Available themes: gruvbox (default), matrix, cyberpunk, monokai
Example: theme set matrix`)
    }
    return text(`Theme switching coming soon...`)
  },

  // Navigation commands
  data: () => nav('Entering DATA CENTER...', '/data'),
  bikes: () => nav('Entering VEHICLE DATABASE...', '/bikes'),
  rankings: () => nav('Entering RANKINGS...', '/rankings'),
  news: () => nav('Entering NEWS...', '/news'),
  used: () => nav('Entering USED MARKET...', '/used'),
  motodex: () => nav('Entering MOTODEX...', '/motodex'),
  battle: () => nav('Entering BATTLE MODE...', '/battle'),

  // Data commands
  top: (args: string[]) => {
    const n = parseInt(args[0]) || 10
    const data = [
      { rank: 1,  model: 'KYMCO 新K1 150',       sales: 2202 },
      { rank: 2,  model: 'YAMAHA FORCE 2.0',      sales: 1891 },
      { rank: 3,  model: 'SYM JET SL+',           sales: 1756 },
      { rank: 4,  model: 'KYMCO GP125',            sales: 1698 },
      { rank: 5,  model: 'YAMAHA LIMI 125',        sales: 1542 },
      { rank: 6,  model: 'SYM 迪爵 DUKE 125',     sales: 1489 },
      { rank: 7,  model: 'GOGORO VIVA MIX',        sales: 1356 },
      { rank: 8,  model: 'KYMCO MANY 125',         sales: 1298 },
      { rank: 9,  model: 'HONDA SUPER CUB 50',     sales: 1245 },
      { rank: 10, model: 'YAMAHA CYGNUS GRYPHUS',  sales: 1201 },
      { rank: 11, model: 'SYM JET SR',             sales: 1156 },
      { rank: 12, model: 'KYMCO RACING S 150',     sales: 1098 },
      { rank: 13, model: 'YAMAHA MT-07',           sales: 987 },
      { rank: 14, model: 'KAWASAKI NINJA 400',     sales: 876 },
      { rank: 15, model: 'HONDA CB350',            sales: 812 },
    ]
    const display = data.slice(0, Math.min(n, 15))

    let output = `\n  2026-03 月銷售 TOP ${n}\n  ${'─'.repeat(48)}\n`
    display.forEach(d => {
      const rankStr = `#${d.rank}`.padStart(3)
      const modelStr = padEndCJK(d.model, 28)
      const salesStr = d.sales.toLocaleString().padStart(6)
      output += `  ${rankStr}  ${modelStr} ${salesStr}\n`
    })
    output += `  ${'─'.repeat(48)}\n  Type 'data' for full analytics.\n`
    return text(output)
  },

  brand: (args: string[]) => {
    if (args.length === 0) {
      return text(`Usage: brand [name]
Available: kymco, yamaha, sym, gogoro, honda, suzuki, kawasaki, bmw, ducati, ktm, triumph, aeon
Example: brand yamaha`)
    }
    const name = args[0].toUpperCase()
    const brands: Record<string, { share: string, top: string, models: number }> = {
      'KYMCO':    { share: '28.3%', top: '新K1 150',       models: 24 },
      'YAMAHA':   { share: '24.1%', top: 'FORCE 2.0',      models: 31 },
      'SYM':      { share: '18.7%', top: 'JET SL+',        models: 28 },
      'GOGORO':   { share: '8.2%',  top: 'VIVA MIX',       models: 12 },
      'HONDA':    { share: '7.5%',  top: 'SUPER CUB 50',   models: 35 },
      'SUZUKI':   { share: '3.8%',  top: 'GSX-S150',       models: 18 },
      'KAWASAKI': { share: '2.9%',  top: 'NINJA 400',      models: 16 },
      'BMW':      { share: '1.8%',  top: 'R 1250 GS',      models: 9 },
      'DUCATI':   { share: '1.2%',  top: 'PANIGALE V4',    models: 11 },
      'KTM':      { share: '1.1%',  top: '390 DUKE',       models: 14 },
      'TRIUMPH':  { share: '0.9%',  top: 'SPEED TWIN',     models: 8 },
      'AEON':     { share: '1.5%',  top: 'COIN 125',       models: 22 },
    }
    const b = brands[name]
    if (!b) return text(`Brand '${name}' not found. Type 'brand' for available brands.`)

    return text(`
  ${name}
  ${'─'.repeat(36)}
  市場佔有率    ${b.share}
  本月熱銷      ${b.top}
  收錄車款      ${b.models} 款
  ${'─'.repeat(36)}
  Type 'bikes' for full vehicle database.`)
  },

  search: (args: string[]) => {
    if (args.length === 0) {
      return nav('Redirecting to search page...', '/search')
    }
    const kw = args.join(' ')
    return nav(`Searching for "${kw}"...`, `/search?q=${encodeURIComponent(kw)}`)
  },

  stats: () => text(`
  HYMMOTO.TW Platform Stats
  ${'─'.repeat(36)}
  銷售紀錄      190,938+
  收錄車款      566+
  品牌分析      32+
  中古行情      270+
  最新數據      2026-03
  資料來源      公路局登錄統計
  更新頻率      每月自動
  ${'─'.repeat(36)}`),

  // Easter eggs
  sudo: () => text('Permission denied: nice try 😏'),
  vim: () => text(`why use vim? try 'emacs'`),
  emacs: () => text(`why use emacs? try 'vim'`),
  echo: (args: string[]) => text(args.join(' ')),
  exit: () => text('Please close the tab to exit.'),
  ls: () => text(`data/  bikes/  rankings/  news/  used/  motodex/  battle/`),
  cd: (args: string[]) => {
    const dir = args[0]
    if (!dir) return text('Usage: cd [directory]')
    const valid = ['data', 'bikes', 'rankings', 'news', 'used', 'motodex', 'battle']
    const clean = dir.replace(/\//g, '')
    if (valid.includes(clean)) {
      return nav(`Navigating to /${clean}...`, `/${clean}`)
    }
    return text(`cd: no such directory: ${dir}`)
  },
  pwd: () => text('/hymmoto.tw'),
  cat: (args: string[]) => {
    if (!args[0]) return text('Usage: cat [file]')
    return text(`cat: ${args[0]}: use specific commands instead (top, brand, stats)`)
  },
}

export function getCompletions(partial: string): string[] {
  return Object.keys(commands).filter(cmd => cmd.startsWith(partial))
}
