'use client';

import React, { useEffect, useState } from 'react';

interface MarketShareBarProps {
  brand: string;
  percentage: number;
  color: string;
}

export default function MarketShareBar({
  brand,
  percentage,
  color,
}: MarketShareBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // Animate the bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full">
      {/* Brand Name */}
      <div className="text-center mb-2">
        <span className="font-semibold text-white">{brand}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-10 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        {/* Animated Fill */}
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out flex items-center"
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />

        {/* Percentage Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-white text-center drop-shadow-lg">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
