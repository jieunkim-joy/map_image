import type { ChargerInfoItem, ChargerStatusSummary, ChargerStation } from './types';

/**
 * API 요청 타임아웃 설정 (10초)
 * 네트워크 지연이나 서버 응답 지연 시 무한 대기를 방지
 */
const API_TIMEOUT = 10000;

/**
 * 타임아웃이 있는 fetch 래퍼 함수
 * Promise.race를 사용하여 fetch 요청과 타임아웃 중 먼저 완료되는 것을 반환
 * 
 * @param url - 요청할 API URL
 * @param options - fetch 옵션 (headers, method 등)
 * @param timeout - 타임아웃 시간 (밀리초, 기본값: API_TIMEOUT)
 * @returns Promise<Response> - fetch 응답 또는 타임아웃 에러
 */
function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = API_TIMEOUT
): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('API 요청 시간 초과')), timeout)
    ),
  ]);
}

/**
 * 충전소의 모든 충전기 정보 조회
 * 서버 프록시를 통해 호출 (CORS 및 Mixed Content 문제 해결)
 * 
 * 개선 사항:
 * - 타임아웃 처리 추가: 10초 내 응답이 없으면 에러 발생
 * - 사용자 친화적 에러 메시지 제공
 * 
 * @param statId - 충전소 ID (statId)
 * @returns Promise<ChargerInfoItem[]> - 충전기 정보 배열
 * @throws Error - API 호출 실패 또는 타임아웃 시 에러 발생
 */
export async function fetchChargerInfo(statId: string): Promise<ChargerInfoItem[]> {
  try {
    // 서버 프록시 엔드포인트 사용
    const apiUrl = `/api/charger-info?statId=${encodeURIComponent(statId)}`;
    
    // 타임아웃이 적용된 fetch 호출
    const response = await fetchWithTimeout(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API 호출 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 서버에서 이미 처리된 데이터 반환
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // 타임아웃 에러 구분하여 사용자 친화적 메시지 제공
    if (error instanceof Error && error.message === 'API 요청 시간 초과') {
      console.error('충전기 정보 조회 시간 초과:', statId);
      throw new Error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    }
    
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

