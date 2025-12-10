// CSV 데이터 행 타입
export interface CSVRow {
  region: string;
  station_name: string;
  'Promotion Price': string;
  promo_statId: string;
  promo_chgerId: string;
  type: string;
  'speed(kwh)': string;
  address: string;
  location_detail: string;
  lati: string;
  longi: string;
  First_floor: string;
  is_fast: string;
  parking_free: string;
  only_taxi: string;
}

// 그룹화된 충전소 타입
export interface ChargerStation {
  id: string; // promo_statId
  stationName: string;
  region: string;
  address: string;
  locationDetail: string;
  latitude: number;
  longitude: number;
  promotionPrice: number;
  firstFloor: boolean;
  parkingFree: boolean;
  chargers: Array<{
    chgerId: string;
    type: string;
    speed: number;
    isFast: boolean;
  }>;
  hasFastCharger: boolean;
  minPrice: number;
  onlyTaxi: boolean;
}

// 필터 옵션
export interface FilterOptions {
  parkingFree: boolean;
  firstFloor: boolean;
  highSpeed: boolean;
}

// 검색 결과
export interface SearchResult {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

// API 충전기 정보
export interface ChargerInfoItem {
  statId: string;
  chgerId: string;
  statNm: string;
  addr: string;
  location: string;
  stat: string;
  chgerType: string;
  [key: string]: string | undefined;
}

// 충전기 상태 집계
export interface ChargerStatusSummary {
  fastChargers: {
    available: number;
    total: number;
  };
  regularChargers: {
    available: number;
    total: number;
  };
  allInUse: boolean;
}

// 통합된 충전소 정보 (CSV + API)
export interface MergedStation extends ChargerStation {
  statusSummary?: ChargerStatusSummary;
}

