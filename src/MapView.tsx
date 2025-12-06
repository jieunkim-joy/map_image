import { useEffect, useRef } from 'react';
import type { ChargerStation } from './types';

interface MapViewProps {
  stations: ChargerStation[];
  center: { lat: number; lng: number };
  zoomLevel: number;
  onMapReady?: (map: any) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export function MapView({
  stations,
  center,
  zoomLevel,
  onMapReady,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const isInitializedRef = useRef(false);

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapContainerRef.current || isInitializedRef.current) return;
    
    // 카카오맵 SDK가 로드되지 않은 경우
    if (!window.kakao || !window.kakao.maps) {
      console.error('❌ 카카오맵 SDK가 로드되지 않았습니다.');
      console.error('브라우저 콘솔에서 이전 에러 메시지를 확인하세요.');
      return;
    }

    window.kakao.maps.load(() => {
      const container = mapContainerRef.current!;
      
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: zoomLevel,
        draggable: true, // 지도 드래그 활성화
        scrollwheel: true, // 스크롤 줌 활성화
        disableDoubleClick: true,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
      };
      
      // 카카오맵 생성
      const map = new window.kakao.maps.Map(container, options);
      
      // 줌은 활성화 (스크롤 줌 사용 가능)
      map.setZoomable(true);

      mapRef.current = map;
      isInitializedRef.current = true;
      
      if (onMapReady) {
        onMapReady(map);
      }
    });
  }, []);

  // 지도 중심 변경
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    const timeoutId = setTimeout(() => {
      if (mapRef.current) {
        const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
        mapRef.current.panTo(moveLatLon);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [center]);

  // 줌 레벨 변경
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    const timeoutId = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.setLevel(zoomLevel, { animate: true });
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [zoomLevel]);

  // 충전소 핀 렌더링 (빨간색 물방울 모양 + 번개 아이콘)
  useEffect(() => {
    if (!mapRef.current || !window.kakao || stations.length === 0 || !isInitializedRef.current) return;

    // 제거할 마커 식별 및 제거
    const currentStationIds = new Set(stations.map(s => s.id));
    const existingStationIds = new Set(markersMapRef.current.keys());

    existingStationIds.forEach(stationId => {
      if (!currentStationIds.has(stationId)) {
        const marker = markersMapRef.current.get(stationId);
        if (marker) {
          marker.setMap(null);
          markersMapRef.current.delete(stationId);
        }
      }
    });

    // 새 마커 추가
    stations.forEach((station) => {
      const existingMarker = markersMapRef.current.get(station.id);
      
      if (existingMarker) {
        return; // 이미 존재하면 스킵
      }

      const position = new window.kakao.maps.LatLng(
        station.latitude,
        station.longitude
      );

      // 빨간색 물방울 모양 핀 HTML 생성
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = createTeardropPinHTML();
      contentDiv.style.cursor = 'pointer';
      contentDiv.style.userSelect = 'none';

      // 커스텀 오버레이 생성
      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: contentDiv,
        yAnchor: 1, // 하단 기준 (물방울 끝부분이 위치에 맞춰짐)
        xAnchor: 0.5,
        zIndex: 20,
      });

      overlay.setMap(mapRef.current);
      markersMapRef.current.set(station.id, overlay);
    });

    // Cleanup
    return () => {
      markersMapRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersMapRef.current.clear();
    };
  }, [stations]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ 
        width: '100%', 
        height: '100%',
        touchAction: 'none',
        overscrollBehavior: 'none',
        willChange: 'transform',
        WebkitTapHighlightColor: 'transparent',
      }}
    />
  );
}

// 어두운 파란색 물방울 모양 핀 HTML 생성 함수 (노란색 번개 아이콘 포함)
function createTeardropPinHTML(): string {
  return `
    <div style="position: relative; display: inline-block;">
      <svg width="42" height="36" viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 물방울 모양 핀 (상단 둥글고 하단 뾰족) - 어두운 파란색 본체 (가로로 더 넓게) -->
        <path d="M24 0C32.2843 0 38 5.37258 38 12C38 18.6274 24 44 24 44C24 44 10 18.6274 10 12C10 5.37258 15.7157 0 24 0Z" 
              fill="#1D2650" 
              stroke="#708090" 
              stroke-width="1.5"/>
        <!-- 노란색 번개 아이콘 -->
        <path d="M26 7L18 19H22L20 29L29 17H24L26 7Z" 
              fill="#FAE100" 
              stroke="none"/>
      </svg>
    </div>
  `;
}
