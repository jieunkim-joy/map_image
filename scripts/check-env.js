// 빌드 시점 환경변수 확인 스크립트
console.log('🔍 빌드 시점 환경변수 확인:');
console.log({
  VITE_KAKAO_MAP_APP_KEY: process.env.VITE_KAKAO_MAP_APP_KEY 
    ? `설정됨 (${process.env.VITE_KAKAO_MAP_APP_KEY.length}자)` 
    : '❌ 없음',
  VITE_KAKAO_REST_API_KEY: process.env.VITE_KAKAO_REST_API_KEY 
    ? `설정됨 (${process.env.VITE_KAKAO_REST_API_KEY.length}자)` 
    : '❌ 없음',
  VITE_ENV_API_KEY: process.env.VITE_ENV_API_KEY 
    ? `설정됨 (${process.env.VITE_ENV_API_KEY.length}자)` 
    : '❌ 없음',
});

// 환경변수가 없으면 경고
if (!process.env.VITE_KAKAO_MAP_APP_KEY) {
  console.warn('⚠️ VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다!');
}
if (!process.env.VITE_KAKAO_REST_API_KEY) {
  console.warn('⚠️ VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다!');
}
if (!process.env.VITE_ENV_API_KEY) {
  console.warn('⚠️ VITE_ENV_API_KEY가 설정되지 않았습니다!');
}

