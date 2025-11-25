import { useEffect, useRef } from 'react';
import type { ChargerStation } from './types';

interface MapViewProps {
  stations: ChargerStation[];
  selectedStation: ChargerStation | null;
  onSelectStation: (station: ChargerStation) => void;
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  zoomLevel: number;
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
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

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

    // 새 사용자 위치 마커 추가
    const marker = new window.kakao.maps.Marker({
      position: position,
      image: new window.kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        new window.kakao.maps.Size(50, 50),
        { offset: new window.kakao.maps.Point(25, 50) }
      ),
    });

    marker.setMap(mapRef.current);
    (marker as any).userLocation = true;
    overlaysRef.current.push(marker);
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
      
      // 클릭/터치 이벤트
      const handleClick = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        onSelectStation(station);
      };
      
      contentDiv.addEventListener('click', handleClick);
      contentDiv.addEventListener('touchend', handleClick);

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
  const cardShadow = isSelected 
    ? '0 0 0 4px #60a5fa, 0 12px 24px -6px rgba(0, 0, 0, 0.25)' 
    : '0 8px 16px -4px rgba(0, 0, 0, 0.2)';
  
  // 최저가: 글자색 빨간색, 일반: 검정색 (발광효과 없음)
  const priceColor = isLowestPrice ? '#dc2626' : '#1f2937';
  const priceShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // 모든 핀 동일한 그림자

  // 최저가 별 뱃지 (크기 축소)
  const badgeHTML = isLowestPrice
    ? '<div style="position: absolute; top: -8px; right: -8px; width: 28px; height: 28px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3); border: 2px solid white; font-weight: bold; z-index: 10;">★</div>'
    : '';

  const scale = isSelected ? 'scale(1.3)' : 'scale(1)';
  // 모든 핀: 흰색 배경, 초록색 테두리 통일
  const backgroundColor = '#ffffff'; // 흰색 배경
  const borderColor = '#22c55e'; // 초록색 테두리

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

