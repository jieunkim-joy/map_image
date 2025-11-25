import type { ChargerInfoItem, ChargerStatusSummary, ChargerStation } from './types';

// API 키 (인코딩된 버전 - URL에 직접 사용)
const ENCODED_API_KEY = import.meta.env.VITE_ENV_API_KEY || '';
const BASE_URL = 'http://apis.data.go.kr/B552584/EvCharger/getChargerInfo';

/**
 * 충전소의 모든 충전기 정보 조회
 */
export async function fetchChargerInfo(statId: string): Promise<ChargerInfoItem[]> {
  try {
    // ⚠️ 인코딩된 API 키를 URL에 직접 사용 (이중 인코딩 방지)
    const apiUrl = `${BASE_URL}?serviceKey=${ENCODED_API_KEY}&pageNo=1&numOfRows=9999&dataType=JSON&statId=${statId}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.resultCode !== '00') {
      throw new Error(`API 에러: ${data.resultMsg} (코드: ${data.resultCode})`);
    }
    
    return data.items?.item || [];
  } catch (error) {
    console.error('충전기 정보 조회 실패:', error);
    throw error;
  }
}

/**
 * CSV 데이터와 API 응답을 매핑하여 충전기 상태 집계
 */
export function aggregateChargerStatus(
  csvChargers: ChargerStation['chargers'],
  apiChargers: ChargerInfoItem[]
): ChargerStatusSummary {
  let fastAvailable = 0;
  let fastTotal = 0;
  let regularAvailable = 0;
  let regularTotal = 0;
  
  csvChargers.forEach((csvCharger) => {
    const apiCharger = apiChargers.find(
      (item) => item.chgerId === csvCharger.chgerId
    );
    
    if (!apiCharger) {
      return;
    }
    
    const isAvailable = apiCharger.stat === '2'; // stat === "2" = 충전 대기
    
    if (csvCharger.isFast) {
      fastTotal++;
      if (isAvailable) {
        fastAvailable++;
      }
    } else {
      regularTotal++;
      if (isAvailable) {
        regularAvailable++;
      }
    }
  });
  
  const allInUse = 
    (fastTotal > 0 && fastAvailable === 0 && regularTotal === 0) ||
    (regularTotal > 0 && regularAvailable === 0 && fastTotal === 0) ||
    (fastTotal > 0 && fastAvailable === 0 && regularTotal > 0 && regularAvailable === 0);
  
  return {
    fastChargers: {
      available: fastAvailable,
      total: fastTotal,
    },
    regularChargers: {
      available: regularAvailable,
      total: regularTotal,
    },
    allInUse,
  };
}

