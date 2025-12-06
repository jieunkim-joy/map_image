import { useState, useEffect, useRef } from 'react';
import { MapView } from './MapView';
import type { ChargerStation } from './types';
import { parseCSVData } from './utils';

export default function App() {
  const [stations, setStations] = useState<ChargerStation[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.2228599,
    lng: 128.681235,
  }); // 경남 지역 기본값
  const [zoomLevel, setZoomLevel] = useState(5);
  const mapInstanceRef = useRef<any>(null);

  // CSV 데이터 로드
  useEffect(() => {
    loadCSVData();
  }, []);

  async function loadCSVData() {
    try {
      const response = await fetch('/stations.csv');
      const csvText = await response.text();
      const parsedStations = parseCSVData(csvText);
      setStations(parsedStations);
    } catch (error) {
      console.error('CSV 데이터 로드 실패:', error);
    }
  }

  return (
    <div style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MapView
        stations={stations}
        center={mapCenter}
        zoomLevel={zoomLevel}
        onMapReady={(map) => {
          mapInstanceRef.current = map;
        }}
      />
    </div>
  );
}
