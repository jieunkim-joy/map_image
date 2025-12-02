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

        {/* 내용 영역 - 스크롤 없음, 모든 정보 한 화면에 */}
        <div className="flex-1 px-4 py-3" style={{ overflow: 'hidden' }}>
          {/* 1. 충전소 이름 + 태그 */}
          <div className="mb-3">
            <h2 
              className="text-gray-900 mb-1.5"
              style={{ fontSize: '22px', fontWeight: 700, lineHeight: '1.2' }}
            >
              {station.stationName}
            </h2>
            <div className="flex gap-1.5">
              {station.parkingFree && (
                <span 
                  className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md"
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  주차무료
                </span>
              )}
              {station.firstFloor && (
                <span 
                  className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-md"
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  지상
                </span>
              )}
            </div>
          </div>

          {/* 2. 2열 그리드: 충전기 현 상태 + 가격 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* 왼쪽: 이용 가능 충전기 */}
            <div>
              <div 
                className="rounded-lg p-2.5 h-full flex flex-col justify-center"
                style={{
                  backgroundColor: isAllBusy ? '#fef2f2' : '#f8fafc',
                  border: isAllBusy ? '1.5px solid #fecaca' : '1.5px solid #e2e8f0',
                  minHeight: '100px',
                }}
              >
                {statusSummary ? (
                  <div className="flex flex-col justify-center items-center gap-2">
                    {/* 경고 메시지 */}
                    {isAllBusy && (
                      <div 
                        className="rounded px-1.5 py-1 text-center"
                        style={{
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fca5a5',
                        }}
                      >
                        <p 
                          className="text-red-800"
                          style={{ fontSize: '14px', fontWeight: 600 }}
                        >
                          ⚠️ 전부 사용중
                        </p>
                      </div>
                    )}

                    {/* 충전기 정보 */}
                    <div className="space-y-1.5 w-full">
                      {statusSummary.regularChargers.total > 0 && (
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-gray-700"
                            style={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            50kW
                          </span>
                          <div className="flex items-center gap-0.5">
                            <span 
                              style={{ 
                                fontSize: '14px',
                                fontWeight: 700,
                                color: statusSummary.regularChargers.available > 0 ? '#16a34a' : '#dc2626',
                              }}
                            >
                              {statusSummary.regularChargers.available}
                            </span>
                            <span 
                              className="text-gray-500"
                              style={{ fontSize: '14px', fontWeight: 400 }}
                            >
                              /{statusSummary.regularChargers.total}
                            </span>
                          </div>
                        </div>
                      )}

                      {statusSummary.fastChargers.total > 0 && (
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-gray-700"
                            style={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            100kW+
                          </span>
                          <div className="flex items-center gap-0.5">
                            <span 
                              style={{ 
                                fontSize: '14px',
                                fontWeight: 700,
                                color: statusSummary.fastChargers.available > 0 ? '#16a34a' : '#dc2626',
                              }}
                            >
                              {statusSummary.fastChargers.available}
                            </span>
                            <span 
                              className="text-gray-500"
                              style={{ fontSize: '14px', fontWeight: 400 }}
                            >
                              /{statusSummary.fastChargers.total}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p 
                      className="text-gray-400 text-center"
                      style={{ fontSize: '14px' }}
                    >
                      로딩중...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 요금 정보 */}
            <div>
              <div 
                className="rounded-lg p-2.5 h-full flex flex-col justify-center items-center"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  minHeight: '100px',
                }}
              >
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span 
                      className="text-gray-900"
                      style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1' }}
                    >
                      {station.minPrice}
                    </span>
                    <span 
                      className="text-gray-600"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    >
                      원/kWh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 주소 정보 (한 줄) */}
          <div 
            className="rounded-lg p-2 mb-3 flex flex-col justify-center"
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              minHeight: '60px',
            }}
          >
            <p 
              className="text-gray-900 truncate"
              style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: 400 }}
              title={station.address}
            >
              {station.address}
            </p>
            {station.locationDetail && (
              <p 
                className="text-gray-500 truncate mt-0.5"
                style={{ fontSize: '14px', lineHeight: '1.3' }}
                title={station.locationDetail}
              >
                {station.locationDetail}
              </p>
            )}
          </div>

          {/* 4. 길안내 버튼 */}
          <button
            onClick={handleNavigation}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
            style={{ 
              minHeight: '48px',
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            <Navigation 
              style={{ width: '18px', height: '18px' }} 
              strokeWidth={2.5}
            />
            길안내
          </button>
        </div>
      </div>
    </>
  );
}
