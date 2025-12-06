import type { ChargerStation, CSVRow } from './types';

// 거리 계산 (Haversine 공식)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Boolean 문자열 변환
export function parseBoolean(value: string): boolean {
  return value === 'TRUE';
}

// CSV 데이터 파싱 및 그룹화
export function parseCSVData(csvText: string): ChargerStation[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  // 데이터 행 파싱
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV 파싱 (쉼표로 분리, 따옴표 처리)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length === headers.length) {
      const row: CSVRow = {
        region: values[0] || '',
        station_name: values[1] || '',
        'Promotion Price': values[2] || '',
        promo_statId: values[3] || '',
        promo_chgerId: values[4] || '',
        type: values[5] || '',
        'speed(kwh)': values[6] || '',
        address: values[7] || '',
        location_detail: values[8] || '',
        lati: values[9] || '',
        longi: values[10] || '',
        First_floor: values[11] || '',
        is_fast: values[12] || '',
        parking_free: values[13] || '',
      };
      rows.push(row);
    }
  }
  
  // 같은 충전소별로 그룹화
  const stationMap = new Map<string, ChargerStation>();
  
  rows.forEach((row) => {
    const statId = row.promo_statId;
    if (!statId) return;
    
    if (!stationMap.has(statId)) {
      const lat = parseFloat(row.lati) || 0;
      const lng = parseFloat(row.longi) || 0;
      const price = parseFloat(row['Promotion Price']) || 0;
      
      stationMap.set(statId, {
        id: statId,
        stationName: row.station_name,
        region: row.region,
        address: row.address,
        locationDetail: row.location_detail || '',
        latitude: lat,
        longitude: lng,
        promotionPrice: price,
        firstFloor: parseBoolean(row.First_floor),
        parkingFree: parseBoolean(row.parking_free),
        chargers: [],
        hasFastCharger: false,
        minPrice: price,
      });
    }
    
    const station = stationMap.get(statId)!;
    const speed = parseFloat(row['speed(kwh)']) || 0;
    const isFast = parseBoolean(row.is_fast);
    
    station.chargers.push({
      chgerId: row.promo_chgerId,
      type: row.type,
      speed: speed,
      isFast: isFast,
    });
    
    if (isFast) {
      station.hasFastCharger = true;
    }
    
    // 최저가 업데이트
    const price = parseFloat(row['Promotion Price']) || 0;
    if (price > 0 && (station.minPrice === 0 || price < station.minPrice)) {
      station.minPrice = price;
    }
  });
  
  return Array.from(stationMap.values());
}

