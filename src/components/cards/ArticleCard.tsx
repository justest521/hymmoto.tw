'use client';

interface ArticleCardProps {
  image: string;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
}

const getCategoryBadge = (category: string) => {
  const categories: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    'new-release': {
      label: '新車速報',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/40',
    },
    'data-report': {
      label: '數據報告',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/40',
    },
    review: {
      label: '評測',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/40',
    },
    modification: {
      label: '改裝',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border-purple-500/40',
    },
    industry: {
      label: '產業',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/40',
    },
  };
  return categories[category] || categories['news-release'];
};

export default function ArticleCard({
  image,
  category,
  title,
  date,
  excerpt,
  slug,
}: ArticleCardProps) {
  const categoryInfo = getCategoryBadge(category);

  return (
    <div className="group relative h-full bg-[#1a1a1f] border border-[#b8f53e]/20 rounded-lg overflow-hidden hover:border-[#b8f53e]/60 hover:shadow-[0_0_20px_rgba(184,245,62,0.2)] transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-40 md:h-48 bg-gradient-to-b from-[#2a2a30] to-[#1a1a1f] overflow-hidden">
        {/* Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:opacity-0 transition-opacity">
          <span className="text-sm">文章圖片</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

        {/* Category Badge - Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-block px-3 py-1 border rounded-full text-xs font-bold ${categoryInfo.color} ${categoryInfo.bgColor}`}
          >
            {categoryInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 flex flex-col h-[calc(100%-160px)] md:h-[calc(100%-192px)]">
        {/* Title */}
        <h3 className="text-center text-base md:text-lg font-bold mb-3 group-hover:text-[#b8f53e] transition-colors line-clamp-3 flex-grow">
          {title}
        </h3>

        {/* Date */}
        <p className="text-center text-gray-400 text-xs md:text-sm mb-3">
          {new Date(date).toLocaleDateString('zh-TW')}
        </p>

        {/* Excerpt */}
        <p className="text-center text-gray-400 text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Read More Link */}
        <div className="mt-auto">
          <button className="w-full px-4 py-2 text-[#b8f53e] border border-[#b8f53e]/30 rounded-lg font-semibold hover:bg-[#b8f53e] hover:text-[#0a0a0c] transition-all">
            閱讀全文
          </button>
        </div>
      </div>
    </div>
  );
}
