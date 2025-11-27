import { useState } from 'react';
import { Navigation, X, Zap } from 'lucide-react';
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

      {/* 바텀 시트 */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-4xl shadow-2xl z-50 transition-transform relative"
        style={{
          height: '50dvh', // Dynamic Viewport Height: 모바일 브라우저 UI 고려
          maxHeight: '50dvh',
          transform: `translateY(${currentY}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 닫기 버튼 - 카드 우측 상단 모서리 */}
        <button
          onClick={onClose}
          className="absolute right-5 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 active:bg-gray-200 z-30"
          style={{ 
            top: '15px',
            width: '25px', 
            height: '25px',
            minWidth: '25px',
            minHeight: '25px',
          }}
          aria-label="닫기"
        >
          <X 
            className="text-gray-500" 
            style={{ width: '16px', height: '16px' }} 
            strokeWidth={2.5}
          />
        </button>

        {/* 헤더 영역 (드래그 핸들) */}
        <div 
          className="sticky top-0 bg-white rounded-t-4xl flex items-center justify-center border-b-2 border-gray-200 z-20 flex-shrink-0"
          style={{ paddingTop: '8px', paddingBottom: '6px', minHeight: '40px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 드래그 핸들 */}
          <div 
            className="bg-gray-300 rounded-full"
            style={{ width: '48px', height: '6px' }}
          />
        </div>

        {/* 스크롤 가능한 내용 영역 */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
          }}
        >

          {/* 내용 - 모바일 최적화 디자인 */}
          <div className="px-4 pt-4 pb-8 space-y-3">
            {/* 1. 충전소 이름 및 태그 */}
            <div>
              <h2 
                className="text-gray-900 mb-2"
                style={{ fontSize: '25px', fontWeight: 700, lineHeight: '1.3' }}
              >
                {station.stationName}
              </h2>
              <div className="flex gap-1.5 flex-wrap">
                {station.parkingFree && (
                  <span 
                    className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg"
                    style={{ fontSize: '18px', fontWeight: 700 }}
                  >
                    주차무료
                  </span>
                )}
                {station.firstFloor && (
                  <span 
                    className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-lg"
                    style={{ fontSize: '18px', fontWeight: 700 }}
                  >
                    지상
                  </span>
                )}
              </div>
            </div>

            {/* 2. 충전기 현황 */}
            <div>
              {/* 라벨 */}
              <div className="flex items-center gap-2 mb-0">
                <Zap 
                  style={{ width: '18px', height: '18px' }}
                  className={isAllBusy ? 'text-red-600' : 'text-green-600'} 
                />
                <h3 
                  className="text-gray-900"
                  style={{ fontSize: '19px', fontWeight: 600 }}
                >
                  충전기 현황
                </h3>
              </div>
              
              {/* 정보 박스 */}
              {statusSummary ? (
                <div 
                  className="rounded-xl p-2"
                  style={{
                    marginTop: '-4px',
                    backgroundColor: isAllBusy ? '#fef2f2' : '#f8fafc',
                    border: isAllBusy ? '2px solid #fecaca' : '2px solid #e2e8f0',
                  }}
                >
                  {/* 경고 메시지 */}
                  {isAllBusy && (
                    <div 
                      className="rounded-xl p-2.5 mb-2.5 text-center"
                      style={{
                        backgroundColor: '#fee2e2',
                        border: '1.5px solid #fca5a5',
                      }}
                    >
                      <p 
                        className="text-red-800"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        ⚠️ 모든 충전기 사용 중
                      </p>
                    </div>
                  )}

                  {/* 충전기 타입 정보 */}
                  <div className="space-y-2">
                    {statusSummary.regularChargers.total > 0 && (
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-gray-900"
                          style={{ fontSize: '16px', fontWeight: 700, minWidth: '70px' }}
                        >
                          급속
                        </span>
                        <span 
                          style={{ 
                            width: '1px',
                            height: '18px',
                            backgroundColor: '#d1d5db'
                          }}
                        />
                        <div className="flex items-center gap-0">
                          <span 
                            style={{ 
                              fontSize: '18px',
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
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-gray-900"
                          style={{ fontSize: '16px', fontWeight: 700, minWidth: '70px' }}
                        >
                          초급속
                        </span>
                        <span 
                          style={{ 
                            width: '1px',
                            height: '18px',
                            backgroundColor: '#d1d5db'
                          }}
                        />
                        <div className="flex items-center gap-0">
                          <span 
                            style={{ 
                              fontSize: '18px',
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
                <div 
                  className="rounded-xl p-2 bg-gray-50 text-center"
                  style={{ 
                    marginTop: '-4px',
                    border: '2px solid #e2e8f0' 
                  }}
                >
                  <p 
                    className="text-gray-500"
                    style={{ fontSize: '14px' }}
                  >
                    충전기 상태 정보를 불러오는 중...
                  </p>
                </div>
              )}
            </div>

            {/* 3. 가격 정보 */}
            <div>
              {/* 구분선 */}
              <div 
                style={{ 
                  borderTop: '1px dashed #d1d5db',
                  marginTop: '12px',
                  marginBottom: '4px'
                }}
              />
              
              {/* 라벨 */}
              <div className="flex items-center gap-2 mb-0">
                <span style={{ fontSize: '18px' }}>💰</span>
                <h3 
                  className="text-gray-900"
                  style={{ fontSize: '19px', fontWeight: 600 }}
                >
                  요금
                </h3>
              </div>
              
              {/* 정보 박스 */}
              <div 
                className="rounded-xl p-2"
                style={{
                  marginTop: '-4px',
                  backgroundColor: '#fef9c3',
                  border: '2px solid #fbbf24',
                }}
              >
                <div className="flex items-baseline gap-1.5">
                  <span 
                    className="text-amber-900"
                    style={{ fontSize: '26px', fontWeight: 700, lineHeight: '1' }}
                  >
                    {station.minPrice}원
                  </span>
                  <span 
                    className="text-gray-500"
                    style={{ fontSize: '13px', fontWeight: 400 }}
                  >
                    /kWh
                  </span>
                </div>
              </div>
            </div>

            {/* 4. 주소 정보 */}
            <div>
              {/* 구분선 */}
              <div 
                style={{ 
                  borderTop: '1px dashed #d1d5db',
                  marginTop: '12px',
                  marginBottom: '4px'
                }}
              />
              
              {/* 라벨 */}
              <div className="flex items-center gap-2 mb-0">
                <span style={{ fontSize: '18px' }}>📍</span>
                <h3 
                  className="text-gray-900"
                  style={{ fontSize: '19px', fontWeight: 600 }}
                >
                  위치
                </h3>
              </div>
              
              {/* 정보 박스 */}
              <div 
                className="rounded-xl p-2"
                style={{
                  marginTop: '-4px',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                }}
              >
                <p 
                  className="text-gray-900 mb-1"
                  style={{ fontSize: '15px', lineHeight: '1.4', fontWeight: 400 }}
                >
                  {station.address}
                </p>
                {station.locationDetail && (
                  <p 
                    className="text-gray-500"
                    style={{ fontSize: '13px', lineHeight: '1.4' }}
                  >
                    {station.locationDetail}
                  </p>
                )}
              </div>
            </div>

            {/* 5. 길안내 버튼 */}
            <button
              onClick={handleNavigation}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              style={{ 
                minHeight: '52px',
                height: '52px',
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '24px'
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
      </div>
    </>
  );
}
