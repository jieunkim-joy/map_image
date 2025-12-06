import type { ChargerStation } from './types';
import { Zap } from 'lucide-react';

interface StationPinProps {
  station: ChargerStation;
  isLowestPrice: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function StationPin({ station, isLowestPrice, isSelected, onClick }: StationPinProps) {
  return (
    <button
      onClick={onClick}
      className={`relative transition-all duration-200 hover:scale-110 active:scale-95 ${
        isSelected ? 'scale-125 z-30' : 'z-20'
      }`}
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      {/* 핀 컨테이너 */}
      <div className="relative flex flex-col items-center">
        {/* 메인 핀 바디 */}
        <div className="relative">
          {/* 외곽 테두리 (그림자 효과) */}
          <div
            className={`absolute inset-0 rounded-2xl blur-md transition-all ${
              isSelected
                ? 'bg-green-400 opacity-60'
                : 'bg-green-400 opacity-40'
            }`}
          />
          
          {/* 메인 핀 카드 */}
          <div
            className={`relative min-w-[68px] rounded-2xl shadow-lg transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-green-500 to-green-600 ring-3 ring-green-300'
                : 'bg-gradient-to-br from-green-500 to-green-600'
            }`}
          >
            {/* 상단: 아이콘 */}
            <div className="px-3 pt-2 pb-1 flex items-center justify-center">
              <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Zap className="size-4 text-white" fill="white" />
              </div>
            </div>
            
            {/* 구분선 */}
            <div className="mx-2 border-t border-white/30" />
            
            {/* 하단: 가격 */}
            <div className="px-3 py-2">
              {/* 가격 */}
              <div
                className={`text-center leading-none ${
                  isLowestPrice ? 'text-red-400' : 'text-white'
                }`}
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  textShadow: isLowestPrice ? '0 0 12px rgba(248, 113, 113, 0.9), 0 0 4px rgba(248, 113, 113, 1)' : 'none',
                }}
              >
                {station.minPrice}원
              </div>
            </div>
            
            {/* 최저가 뱃지 */}
            {isLowestPrice && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg ring-2 ring-white">
                ★
              </div>
            )}
          </div>
        </div>
        
        {/* 핀 꼬리 (화살표) */}
        <div className="relative -mt-1">
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            {/* 그림자 */}
            <path
              d="M12 12L4 0H20L12 12Z"
              fill="#22C55E"
              opacity="0.3"
            />
            {/* 메인 화살표 */}
            <path
              d="M12 10L5 0H19L12 10Z"
              fill="url(#gradient-green)"
            />
            <defs>
              <linearGradient id="gradient-green" x1="12" y1="0" x2="12" y2="10" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22C55E" />
                <stop offset="1" stopColor="#16A34A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* 선택 시 펄스 애니메이션 */}
        {isSelected && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-24 rounded-2xl bg-green-400 animate-ping opacity-20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-28 rounded-2xl bg-green-300 animate-pulse opacity-10" />
          </>
        )}
      </div>
    </button>
  );
}

