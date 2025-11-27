import { useEffect, useRef } from 'react';
import type { ChargerStation } from './types';

interface MapViewProps {
  stations: ChargerStation[];
  selectedStation: ChargerStation | null;
  onSelectStation: (station: ChargerStation) => void;
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  zoomLevel: number;
  onMapReady?: (map: any) => void; // map 인스턴스 전달 콜백
}

declare global {
  interface Window {
    kakao: any;
  }
}

export function MapView({
  stations,
  selectedStation,
  onSelectStation,
  center,
  userLocation,
  zoomLevel,
  onMapReady,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);
  const isMapDraggingRef = useRef(false); // 지도 드래그 상태 추적

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapContainerRef.current || !window.kakao || isInitializedRef.current) return;

    window.kakao.maps.load(() => {
      const container = mapContainerRef.current!;
      
      // 모바일 터치 최적화 옵션
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: zoomLevel,
        // 드래그 활성화 (모바일 터치 드래그 지원)
        draggable: true,
        // 마우스 휠 줌 활성화
        scrollwheel: true,
        // 더블클릭 줌 활성화
        disableDoubleClick: false,
        disableDoubleClickZoom: false,
        // 키보드 단축키 활성화 (선택사항)
        keyboardShortcuts: true,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;
      isInitializedRef.current = true;
      
      // map 인스턴스를 부모 컴포넌트에 전달
      if (onMapReady) {
        onMapReady(map);
      }

      // 지도 드래그 이벤트 리스너 추가
      window.kakao.maps.event.addListener(map, 'dragstart', () => {
        isMapDraggingRef.current = true;
      });
      
      window.kakao.maps.event.addListener(map, 'dragend', () => {
        // 드래그 종료 후 약간의 지연을 두어 클릭 이벤트와 구분
        setTimeout(() => {
          isMapDraggingRef.current = false;
        }, 100);
      });

      // 지도 타입 컨트롤 제거 (커스텀 UI 사용)
      // 줌 컨트롤 제거 (커스텀 UI 사용)
      
      // 모바일 터치 제스처 최적화
      // 핀치 줌을 위한 터치 이벤트 최적화
      const mapContainer = map.getNode();
      if (mapContainer) {
        // 터치 액션 설정 (핀치 줌, 드래그 허용)
        mapContainer.style.touchAction = 'none';
        // 부드러운 스크롤링을 위한 CSS
        mapContainer.style.willChange = 'transform';
      }
    });
  }, []);

  // 바텀시트 열림/닫힘에 따라 지도 조작 제어
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current || !window.kakao) return;

    // 바텀시트가 열려있으면 (selectedStation이 null이 아니면) 지도 조작 막기
    if (selectedStation) {
      mapRef.current.setZoomable(false); // 핀치 줌 비활성화
      mapRef.current.setDraggable(false); // 지도 이동 비활성화
    } else {
      mapRef.current.setZoomable(true); // 핀치 줌 활성화
      mapRef.current.setDraggable(true); // 지도 이동 활성화
    }
  }, [selectedStation]);

  // 지도 중심 변경
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.panTo(moveLatLon);
  }, [center]);

  // 줌 레벨 변경
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    mapRef.current.setLevel(zoomLevel);
  }, [zoomLevel]);

  // 사용자 위치 마커
  useEffect(() => {
    if (!mapRef.current || !userLocation || !window.kakao || !isInitializedRef.current) return;

    const position = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    
    // 기존 사용자 위치 마커 제거
    const existingIndex = overlaysRef.current.findIndex((m) => m.userLocation);
    if (existingIndex >= 0) {
      overlaysRef.current[existingIndex].setMap(null);
      overlaysRef.current.splice(existingIndex, 1);
    }

    // 커스텀 사용자 위치 마커 HTML 생성
    const markerDiv = document.createElement('div');
    markerDiv.innerHTML = createUserLocationMarkerHTML();
    markerDiv.style.cursor = 'pointer';
    markerDiv.style.userSelect = 'none';
    markerDiv.style.pointerEvents = 'none'; // 클릭 이벤트 방지

    // 커스텀 오버레이로 사용자 위치 마커 생성
    const overlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: markerDiv,
      yAnchor: 1, // 하단 기준
      zIndex: 10,
    });

    overlay.setMap(mapRef.current);
    (overlay as any).userLocation = true;
    overlaysRef.current.push(overlay);
  }, [userLocation]);

  // 충전소 핀 렌더링
  useEffect(() => {
    if (!mapRef.current || !window.kakao || stations.length === 0 || !isInitializedRef.current) return;

    // 기존 충전소 오버레이 제거
    overlaysRef.current.forEach((overlay) => {
      if (!overlay.userLocation) {
        overlay.setMap(null);
      }
    });
    overlaysRef.current = overlaysRef.current.filter((o) => o.userLocation);

    // 최저가 계산 (전체 필터된 충전소 기준)
    const prices = stations.map((s) => s.minPrice).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // 각 충전소에 커스텀 오버레이 추가
    stations.forEach((station) => {
      const position = new window.kakao.maps.LatLng(
        station.latitude,
        station.longitude
      );

      const isLowestPrice = station.minPrice === minPrice && minPrice > 0;
      const isSelected = selectedStation?.id === station.id;

      // 커스텀 오버레이 HTML 생성
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = createPinHTML(station, isLowestPrice, isSelected);
      contentDiv.style.cursor = 'pointer';
      contentDiv.style.userSelect = 'none';
      contentDiv.style.touchAction = 'manipulation';
      
      // 드래그 감지를 위한 변수
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let isDragging = false;
      const DRAG_THRESHOLD = 10; // 픽셀 단위 이동 거리 임계값
      const CLICK_TIME_THRESHOLD = 300; // 밀리초 단위 클릭 시간 임계값
      
      // 터치 시작
      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        isDragging = false;
      };
      
      // 터치 이동 (드래그 감지)
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - touchStartX);
          const deltaY = Math.abs(touch.clientY - touchStartY);
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // 일정 거리 이상 이동하면 드래그로 판단
          if (distance > DRAG_THRESHOLD) {
            isDragging = true;
          }
        }
      };
      
      // 클릭 영역 체크 (중앙부 50% 영역만 클릭 가능)
      const isClickInCenterArea = (e: MouseEvent | TouchEvent): boolean => {
        const rect = contentDiv.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clickX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0].clientX : e.clientX;
        const clickY = 'touches' in e ? e.touches[0]?.clientY || e.changedTouches[0].clientY : e.clientY;
        
        // 중앙부 50% 영역 계산
        const allowedWidth = rect.width * 0.5;
        const allowedHeight = rect.height * 0.5;
        const deltaX = Math.abs(clickX - centerX);
        const deltaY = Math.abs(clickY - centerY);
        
        return deltaX <= allowedWidth / 2 && deltaY <= allowedHeight / 2;
      };
      
      // 클릭/터치 이벤트 처리
      const handleClick = (e: MouseEvent) => {
        // 지도가 드래그 중이면 클릭으로 간주하지 않음
        if (isMapDraggingRef.current) {
          return;
        }
        
        // 중앙부 영역 체크
        if (!isClickInCenterArea(e)) {
          return;
        }
        
        e.stopPropagation();
        e.preventDefault();
        onSelectStation(station);
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // 지도가 드래그 중이면 클릭으로 간주하지 않음
        if (isMapDraggingRef.current) {
          return;
        }
        
        // 드래그 중이거나 시간이 너무 길면 클릭으로 간주하지 않음
        if (isDragging || touchDuration > CLICK_TIME_THRESHOLD) {
          return;
        }
        
        // 중앙부 영역 체크
        if (!isClickInCenterArea(e)) {
          return;
        }
        
        e.stopPropagation();
        e.preventDefault();
        onSelectStation(station);
      };
      
      // 이벤트 리스너 등록
      contentDiv.addEventListener('click', handleClick);
      contentDiv.addEventListener('touchstart', handleTouchStart, { passive: true });
      contentDiv.addEventListener('touchmove', handleTouchMove, { passive: true });
      contentDiv.addEventListener('touchend', handleTouchEnd);

      // 커스텀 오버레이 생성
      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: contentDiv,
        yAnchor: 1,
        zIndex: isSelected ? 30 : 20,
      });

      overlay.setMap(mapRef.current);
      (overlay as any).stationId = station.id;
      overlaysRef.current.push(overlay);
    });

    // 선택된 충전소로 지도 이동
    if (selectedStation) {
      const position = new window.kakao.maps.LatLng(
        selectedStation.latitude,
        selectedStation.longitude
      );
      mapRef.current.panTo(position);
    }
  }, [stations, selectedStation, onSelectStation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ 
        width: '100%', 
        height: '100%',
        // 모바일 터치 최적화
        touchAction: 'none',
        // 부드러운 스크롤링
        overscrollBehavior: 'none',
        // 터치 이벤트 성능 최적화
        willChange: 'transform',
        // iOS Safari 터치 동작 개선
        WebkitTapHighlightColor: 'transparent',
      }}
    />
  );
}

// 핀 HTML 생성 함수
function createPinHTML(
  station: ChargerStation,
  isLowestPrice: boolean,
  isSelected: boolean
): string {
  // 모든 핀 동일한 그림자 (선택된 핀의 파란색 외곽 테두리 제거)
  const cardShadow = '0 8px 16px -4px rgba(0, 0, 0, 0.2)';
  
  // 최저가: 글자색 빨간색, 일반: 검정색 (발광효과 없음)
  const priceColor = isLowestPrice ? '#dc2626' : '#1f2937';
  const priceShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // 모든 핀 동일한 그림자

  // 최저가 별 뱃지 (크기 축소)
  const badgeHTML = isLowestPrice
    ? '<div style="position: absolute; top: -8px; right: -8px; width: 28px; height: 28px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3); border: 2px solid white; font-weight: bold; z-index: 10;">★</div>'
    : '';

  const scale = isSelected ? 'scale(1.3)' : 'scale(1)';
  // 흰색 배경, 선택 여부에 따라 테두리 색상 변경
  const backgroundColor = '#ffffff'; // 흰색 배경
  const borderColor = isSelected ? '#2563eb' : '#CCCCC4'; // 선택 시 파란색, 미선택 시 회색

  return `
    <div style="position: relative; display: inline-block; transform: ${scale}; transition: transform 0.25s ease-out; z-index: ${isSelected ? 30 : 20}; cursor: pointer;">
      <div style="position: relative; min-width: 80px; border-radius: 1rem; box-shadow: ${cardShadow}; background-color: ${backgroundColor}; border: 3px solid ${borderColor};">
        <div style="padding: 12px 16px; text-align: center;">
          <div style="line-height: 1.2; font-size: 18px; font-weight: 800; color: ${priceColor}; text-shadow: ${priceShadow}; letter-spacing: -0.5px;">${station.minPrice}원</div>
        </div>
        ${badgeHTML}
      </div>
      <div style="position: relative; margin-top: -3px; display: flex; justify-content: center;">
        <svg width="28" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12L4 0H20L12 12Z" fill="${borderColor}" opacity="0.4"/>
          <path d="M12 10L5 0H19L12 10Z" fill="${borderColor}"/>
        </svg>
      </div>
    </div>
  `;
}

// 사용자 위치 마커 HTML 생성 함수
function createUserLocationMarkerHTML(): string {
  return `
    <div style="position: relative; display: inline-block; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));">
      <svg width="24" height="29" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 물방울 모양 핀 (상단 둥글고 하단 뾰족) -->
        <path d="M18 0C24.6274 0 30 5.37258 30 12C30 18.6274 18 44 18 44C18 44 6 18.6274 6 12C6 5.37258 11.3726 0 18 0Z" fill="#0080FF"/>
        <!-- 상단 중앙 흰색 원 -->
        <circle cx="18" cy="12" r="5" fill="white"/>
      </svg>
    </div>
  `;
}

