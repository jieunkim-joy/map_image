import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// 카카오맵 SDK 로드
declare global {
  interface Window {
    kakao: any;
  }
}

function initKakaoMap() {
  return new Promise<void>((resolve) => {
    // SDK가 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    // 환경변수에서 카카오맵 API 키 가져오기
    const kakaoAppKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
    
    if (!kakaoAppKey) {
      console.error('❌ 카카오맵 API 키가 설정되지 않았습니다.');
      console.error('Railway에서 VITE_KAKAO_MAP_APP_KEY 환경변수를 설정하고 재배포하세요.');
      console.error('현재 도메인:', window.location.origin);
      resolve(); // 에러가 있어도 앱 실행
      return;
    }
    
    // API 키 유효성 검사 (기본적인 형식 체크)
    if (kakaoAppKey.length < 10) {
      console.warn('⚠️ 카카오맵 API 키가 너무 짧습니다. 올바른 키인지 확인하세요.');
    }

    // SDK 스크립트 동적 로드
    if (window.kakao) {
      window.kakao.maps.load(() => {
        resolve();
      });
    } else {
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        let checkKakao: number | null = null;
        let timeoutId: number | null = null;
        let isResolved = false;

        const cleanup = () => {
          if (checkKakao) {
            clearInterval(checkKakao);
            checkKakao = null;
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        };

        // SDK 로드 대기
        checkKakao = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            cleanup();
            if (!isResolved) {
              isResolved = true;
              window.kakao.maps.load(() => {
                resolve();
              });
            }
          }
        }, 100);

        // 타임아웃 (15초로 증가)
        timeoutId = setTimeout(() => {
          cleanup();
          if (!isResolved) {
            isResolved = true;
            // 타임아웃 발생 시에도 SDK가 로드되었는지 확인
            if (window.kakao && window.kakao.maps) {
              // SDK는 로드되었지만 maps.load가 호출되지 않은 경우
              window.kakao.maps.load(() => {
                resolve();
              });
            } else {
              // 실제로 SDK 로드 실패
              console.warn('⚠️ 카카오맵 SDK 로드 타임아웃 (지도는 계속 작동할 수 있습니다)');
              resolve(); // 에러가 있어도 앱 실행
            }
          }
        }, 15000);
      };
      script.onerror = () => {
        console.error('❌ 카카오맵 SDK 스크립트 로드 실패');
        console.error('가능한 원인:');
        console.error('1. API 키가 잘못되었거나 설정되지 않았습니다');
        console.error('2. 카카오 개발자 콘솔에서 도메인이 허용 목록에 등록되지 않았습니다');
        console.error('3. 네트워크 연결 문제가 있을 수 있습니다');
        console.error('현재 API 키:', kakaoAppKey ? `${kakaoAppKey.substring(0, 10)}...` : '없음');
        console.error('현재 도메인:', window.location.origin);
        // 에러가 있어도 앱 실행 (지도 없이 표시)
        resolve();
      };
      document.head.appendChild(script);
    }
  });
}

// 카카오맵 초기화 후 앱 시작
initKakaoMap().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

