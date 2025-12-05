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
}
