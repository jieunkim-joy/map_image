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
      console.error('카카오맵 API 키가 설정되지 않았습니다. VITE_KAKAO_MAP_APP_KEY 환경변수를 확인하세요.');
      resolve(); // 에러가 있어도 앱 실행
      return;
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
        // SDK 로드 대기
        const checkKakao = setInterval(() => {
          if (window.kakao) {
            clearInterval(checkKakao);
            window.kakao.maps.load(() => {
              resolve();
            });
          }
        }, 100);

        // 타임아웃 (10초)
        setTimeout(() => {
          clearInterval(checkKakao);
          console.error('카카오맵 SDK 로드 실패');
          resolve(); // 에러가 있어도 앱 실행
        }, 10000);
      };
      script.onerror = () => {
        console.error('카카오맵 SDK 스크립트 로드 실패');
        resolve(); // 에러가 있어도 앱 실행
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

