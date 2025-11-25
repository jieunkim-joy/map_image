import type { ChargerInfoItem, ChargerStatusSummary, ChargerStation } from './types';

/**
 * 충전소의 모든 충전기 정보 조회
 * 서버 프록시를 통해 호출 (CORS 및 Mixed Content 문제 해결)
 */
export async function fetchChargerInfo(statId: string): Promise<ChargerInfoItem[]> {
  try {
    // 서버 프록시 엔드포인트 사용
    const apiUrl = `/api/charger-info?statId=${encodeURIComponent(statId)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API 호출 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 서버에서 이미 처리된 데이터 반환
    return Array.isArray(data) ? data : [];
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

