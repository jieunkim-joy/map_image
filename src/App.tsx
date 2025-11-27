import { useState, useEffect } from 'react';
import { MapView } from './MapView';
import { SearchBar } from './SearchBar';
import { FilterButtons } from './FilterButtons';
import { BottomSheet } from './BottomSheet';
import { HowToUseModal } from './HowToUseModal';
import { MapControls } from './MapControls';
import { ZoomControls } from './ZoomControls';
import type { ChargerStation, FilterOptions, SearchResult, MergedStation } from './types';
import { parseCSVData } from './utils';
import { fetchChargerInfo, aggregateChargerStatus } from './api';

// Railway 빌드 트리거를 위한 변경
export default function App() {
  const [stations, setStations] = useState<ChargerStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ChargerStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<MergedStation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.2228599,
    lng: 128.681235,
  }); // 경남 지역 기본값
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [filters, setFilters] = useState<FilterOptions>({
    parkingFree: false,
    firstFloor: false,
    highSpeed: false,
  });

  // 초기 CSV 데이터 로드
  useEffect(() => {
    loadCSVData();

    // 사용자 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setMapCenter(loc);
          setZoomLevel(6); // 줌 레벨
          setLocationError(null);
        },
        (error) => {
          let errorMessage = '위치 정보를 가져올 수 없습니다.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 권한이 거부되었습니다.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
              break;
          }
          
          console.warn('위치 정보 에러:', errorMessage);
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  }, []);

  // CSV 데이터 로드
  async function loadCSVData() {
    try {
      const response = await fetch('/stations.csv');
      const csvText = await response.text();
      const parsedStations = parseCSVData(csvText);
      setStations(parsedStations);
      setFilteredStations(parsedStations);
    } catch (error) {
      console.error('CSV 데이터 로드 실패:', error);
    }
  }

  // 필터 적용
  useEffect(() => {
    let filtered = stations;

    if (filters.parkingFree) {
      filtered = filtered.filter((s) => s.parkingFree);
    }

    if (filters.firstFloor) {
      filtered = filtered.filter((s) => s.firstFloor);
    }

    if (filters.highSpeed) {
      filtered = filtered.filter((s) => s.hasFastCharger);
    }

    setFilteredStations(filtered);
    
    // 선택된 충전소가 필터링에서 제외되면 선택 해제
    if (selectedStation && !filtered.find((s) => s.id === selectedStation.id)) {
      setSelectedStation(null);
    }
  }, [filters, stations, selectedStation]);

  // 검색 결과 처리
  const handleSearchResult = (result: SearchResult) => {
    const searchLocation = { lat: result.lat, lng: result.lng };
    setMapCenter(searchLocation);
    setZoomLevel(6); // 줌 레벨
  };

  // 충전소 선택 핸들러
  const handleSelectStation = async (station: ChargerStation) => {
    setSelectedStation(station as MergedStation);

    try {
      // API 호출
      const apiChargers = await fetchChargerInfo(station.id);
      
      // 상태 집계
      const statusSummary = aggregateChargerStatus(station.chargers, apiChargers);
      
      // 상태 정보 업데이트
      setSelectedStation({
        ...station,
        statusSummary,
      } as MergedStation);
    } catch (error) {
      console.error('충전기 상태 조회 실패:', error);
      // 에러 발생 시에도 기본 정보는 표시
      setSelectedStation({
        ...station,
        statusSummary: undefined,
      } as MergedStation);
    }
  };

  // 현위치로 이동
  const handleGoToMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      // 위치 정보 재요청
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(loc);
            setMapCenter(loc);
            setLocationError(null);
          },
          (error) => {
            let errorMessage = '위치 정보를 가져올 수 없습니다.';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '위치 권한을 허용해주세요.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = '위치 정보를 사용할 수 없습니다.';
                break;
              case error.TIMEOUT:
                errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
                break;
            }
            
            alert(errorMessage);
            setLocationError(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      }
    }
  };

  // 확대/축소 핸들러
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev - 1, 1));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 14));
  };


  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* 메인 지도 */}
      <main className="relative flex-1 overflow-hidden">
        <MapView
          stations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
          center={mapCenter}
          userLocation={userLocation}
          zoomLevel={zoomLevel}
        />
        
        {/* 상단 플로팅 검색 및 필터 영역 - 모바일 최적화 */}
        <div 
          className="absolute z-20"
          style={{
            top: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <SearchBar onSearchResult={handleSearchResult} />
          <FilterButtons filters={filters} onFiltersChange={setFilters} />
          
          {/* 위치 에러 알림 */}
          {locationError && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-95">
              <div className="flex-shrink-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">
                !
              </div>
              <p className="text-sm text-amber-800 flex-1">{locationError}</p>
              <button
                onClick={() => setLocationError(null)}
                className="flex-shrink-0 text-amber-600 hover:text-amber-800"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
        {/* 지도 컨트롤 */}
        <MapControls
          onHowToUse={() => setShowHowToUse(true)}
          onGoToMyLocation={handleGoToMyLocation}
        />
        
        {/* 확대/축소 컨트롤 */}
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </main>

      {/* 하단 상세정보 시트 */}
      {selectedStation && (
        <BottomSheet
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}

      {/* 사용방법 모달 */}
      {showHowToUse && (
        <HowToUseModal onClose={() => setShowHowToUse(false)} />
      )}
    </div>
  );
}

