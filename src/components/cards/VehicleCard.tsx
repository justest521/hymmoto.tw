'use client';

interface VehicleCardProps {
  image: string;
  brand: string;
  model: string;
  cc: number;
  price: number;
  rank: string;
  rarity: string;
}

const getRarityColor = (rarity: string) => {
  const colors: Record<string, string> = {
    common: 'bg-gray-600/40 border-gray-500/40 text-gray-300',
    rare: 'bg-blue-600/40 border-blue-500/40 text-blue-300',
    epic: 'bg-purple-600/40 border-purple-500/40 text-purple-300',
    legendary: 'bg-[#b8f53e]/20 border-[#b8f53e]/40 text-[#b8f53e]',
  };
  return colors[rarity] || colors.common;
};

const getRarityLabel = (rarity: string) => {
  const labels: Record<string, string> = {
    common: 'コモン',
    rare: 'レア',
    epic: 'エピック',
    legendary: 'レジェンダリー',
  };
  return labels[rarity] || rarity;
};

export default function VehicleCard({
  image,
  brand,
  model,
  cc,
  price,
  rank,
  rarity,
}: VehicleCardProps) {
  return (
    <div className="group relative h-full bg-[#1a1a1f] border border-[#b8f53e]/20 rounded-lg overflow-hidden hover:border-[#b8f53e]/60 hover:shadow-[0_0_20px_rgba(184,245,62,0.2)] transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-48 md:h-56 bg-gradient-to-b from-[#2a2a30] to-[#1a1a1f] overflow-hidden">
        {/* Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:opacity-0 transition-opacity">
          <span className="text-sm">圖片</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

        {/* Brand Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-block px-3 py-1 bg-[#b8f53e]/10 border border-[#b8f53e]/30 rounded-full text-[#b8f53e] text-xs font-bold">
            {brand.substring(0, 3)}
          </span>
        </div>

        {/* Rarity Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-block px-3 py-1 border rounded-full text-xs font-bold ${getRarityColor(
              rarity
            )}`}
          >
            {getRarityLabel(rarity)}
          </span>
        </div>

        {/* Rank Badge - Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="w-10 h-10 bg-[#b8f53e] text-[#0a0a0c] rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
            {rank}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 text-center">
        {/* Model Name */}
        <h3 className="text-center text-lg md:text-xl font-bold mb-2 group-hover:text-[#b8f53e] transition-colors line-clamp-2">
          {model}
        </h3>

        {/* CC and Price */}
        <div className="space-y-2 mb-4">
          <p className="text-center text-gray-400 text-sm">
            {cc > 0 ? `${cc}cc` : '電動'}
          </p>
          <p className="text-center text-[#b8f53e] font-bold text-lg">
            NT${price.toLocaleString()}
          </p>
        </div>

        {/* Hover Action Button */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-full px-4 py-2 bg-[#b8f53e] text-[#0a0a0c] rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(184,245,62,0.4)] transition-all">
            查看詳情
          </button>
        </div>
      </div>
    </div>
  );
}
