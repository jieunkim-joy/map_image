// 빌드 시점 환경변수 확인 스크립트
console.log('\n========================================');
console.log('🔍 빌드 시점 환경변수 확인 시작');
console.log('========================================\n');

const envVars = {
  VITE_KAKAO_MAP_APP_KEY: process.env.VITE_KAKAO_MAP_APP_KEY,
  VITE_KAKAO_REST_API_KEY: process.env.VITE_KAKAO_REST_API_KEY,
  VITE_ENV_API_KEY: process.env.VITE_ENV_API_KEY,
};

console.log('VITE_KAKAO_MAP_APP_KEY:', envVars.VITE_KAKAO_MAP_APP_KEY 
  ? `✅ 설정됨 (${envVars.VITE_KAKAO_MAP_APP_KEY.length}자)` 
  : '❌ 없음');
console.log('VITE_KAKAO_REST_API_KEY:', envVars.VITE_KAKAO_REST_API_KEY 
  ? `✅ 설정됨 (${envVars.VITE_KAKAO_REST_API_KEY.length}자)` 
  : '❌ 없음');
console.log('VITE_ENV_API_KEY:', envVars.VITE_ENV_API_KEY 
  ? `✅ 설정됨 (${envVars.VITE_ENV_API_KEY.length}자)` 
  : '❌ 없음');

console.log('\n모든 VITE_ 접두사 환경변수:');
const viteEnvVars = Object.keys(process.env).filter(key => key.startsWith('VITE_'));
if (viteEnvVars.length > 0) {
  viteEnvVars.forEach(key => {
    console.log(`  - ${key}: ${process.env[key] ? '설정됨' : '없음'}`);
  });
} else {
  console.log('  (없음)');
}

// 환경변수가 없으면 경고
let hasError = false;
if (!envVars.VITE_KAKAO_MAP_APP_KEY) {
  console.error('\n❌ ERROR: VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다!');
  hasError = true;
}
if (!envVars.VITE_KAKAO_REST_API_KEY) {
  console.error('❌ ERROR: VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다!');
  hasError = true;
}
if (!envVars.VITE_ENV_API_KEY) {
  console.error('❌ ERROR: VITE_ENV_API_KEY가 설정되지 않았습니다!');
  hasError = true;
}

console.log('\n========================================');
if (hasError) {
  console.error('⚠️ 경고: 일부 환경변수가 설정되지 않았습니다.');
  console.error('Railway Variables 탭에서 환경변수를 확인하세요.');
} else {
  console.log('✅ 모든 필수 환경변수가 설정되었습니다.');
}
console.log('========================================\n');

