import { useState } from 'react';
import { Navigation, X } from 'lucide-react';
import type { MergedStation } from './types';

interface BottomSheetProps {
  station: MergedStation;
  onClose: () => void;
}

export function BottomSheet({ station, onClose }: BottomSheetProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const statusSummary = station.statusSummary;
  const isAllBusy = statusSummary?.allInUse || false;

  // 드래그 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  // 드래그 중
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  // 드래그 종료
  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
    setIsDragging(false);
  };

  // 카카오내비 길안내 URL Scheme
  const handleNavigation = () => {
    const url = `kakaomap://route?ep=${station.longitude},${station.latitude}&by=CAR`;
    window.location.href = url;
    
    // 카카오내비가 설치되지 않은 경우 대체
    setTimeout(() => {
      if (confirm('카카오내비 앱이 필요합니다. 설치하시겠습니까?')) {
        window.open('https://kakaonavi.kakao.com/', '_blank');
      }
    }, 1000);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* 바텀 시트 - 스크롤 없는 컴팩트 디자인 */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transition-transform relative"
        style={{
          maxHeight: 'auto',
          transform: `translateY(${currentY}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 닫기 버튼 - 오른쪽 상단에 위치 */}
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center rounded-full transition-all hover:bg-gray-100 active:bg-gray-200 z-30"
          style={{ 
            top: '12px',
            right: '12px',
            width: '20px', 
            height: '20px',
            minWidth: '20px',
            minHeight: '20px',
          }}
          aria-label="닫기"
        >
          <X 
            className="text-gray-500" 
            style={{ width: '12px', height: '12px' }} 
            strokeWidth={2.5}
          />
        </button>

        {/* 컴팩트 헤더 (드래그 핸들) */}
        <div 
          className="relative flex items-center justify-center px-4 pt-2 pb-1 border-b border-gray-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 드래그 핸들 */}
          <div 
            className="bg-gray-300 rounded-full"
            style={{ width: '40px', height: '4px' }}
          />
        </div>

        {/* 내용 영역 - 블록형 그리드 구조 */}
        <div className="flex-1 px-4 py-4" style={{ overflow: 'hidden' }}>
          {/* 1. 헤더 영역: 충전소 이름 + 태그 */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {station.stationName}
            </h2>
            <div className="flex flex-row gap-1.5 flex-wrap">
              {station.parkingFree && (
                <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  주차무료
                </span>
              )}
              {station.firstFloor && (
                <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  지상
                </span>
              )}
            </div>
          </div>

          {/* 2. 메인 정보 영역 (Row 1): 비대칭 레이아웃 2:1 - 모바일에서도 강제 가로 배치 */}
          <div 
            className="grid mb-3"
            style={{
              gridTemplateColumns: '2fr 1fr',
              gap: '8px',
            }}
          >
            {/* Left Box: 이용 가능 현황 (2/3 너비) */}
            <div 
              className="bg-gray-50 rounded-lg p-3 flex flex-col" 
              style={{ 
                minHeight: '100px',
                minWidth: 0,
              }}
            >
              <p className="text-xs text-gray-500 mb-1.5">이용 가능 충전기</p>
              <div className="flex-1 flex flex-col justify-center">
                {statusSummary ? (
                  <div className="space-y-1">
                    {isAllBusy && (
                      <p className="text-xs text-red-600 font-medium mb-1">⚠️ 전부 사용중</p>
                    )}
                    <div className="space-y-1.5">
                      {statusSummary.fastChargers.total > 0 && (
                        <p className="text-lg font-bold text-gray-900 break-words">
                          100kW 이상 | {statusSummary.fastChargers.available}/{statusSummary.fastChargers.total}
                        </p>
                      )}
                      {statusSummary.regularChargers.total > 0 && (
                        <p className="text-lg font-bold text-gray-900 break-words">
                          50kW | {statusSummary.regularChargers.available}/{statusSummary.regularChargers.total}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">로딩중...</p>
                )}
              </div>
            </div>

            {/* Right Box: 요금 정보 (1/3 너비) */}
            <div 
              className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center" 
              style={{ 
                minHeight: '100px',
                minWidth: 0,
              }}
            >
              <p className="text-xs text-gray-500 mb-1.5">요금</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-gray-900">
                  {station.minPrice}원
                </span>
                <span className="text-lg font-medium text-gray-500">
                  /kWh
                </span>
              </div>
            </div>
          </div>

          {/* 3. 주소 정보 영역 (Row 2): Full Width */}
          <div className="w-full bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-1.5">
              <span className="text-base">📍</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate" title={station.address}>
                  {station.address}
                </p>
                {station.locationDetail && (
                  <p className="text-sm text-gray-500 truncate mt-0.5" title={station.locationDetail}>
                    {station.locationDetail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 4. 하단 버튼 영역 (Row 3): Action Button */}
          <button
            onClick={handleNavigation}
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Navigation 
              style={{ width: '18px', height: '18px' }} 
              strokeWidth={2.5}
            />
            길안내 시작
          </button>
        </div>
      </div>
    </>
  );
}
