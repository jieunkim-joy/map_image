# Railway 배포 문제 해결 가이드

## 지도가 표시되지 않는 경우

### 1. 환경변수 확인

Railway 대시보드에서 **Variables** 탭을 확인하세요:

필수 환경변수:
- `VITE_KAKAO_MAP_APP_KEY` - 카카오맵 JavaScript API 키
- `VITE_KAKAO_REST_API_KEY` - 카카오맵 REST API 키  
- `VITE_ENV_API_KEY` - 환경부 API 키

⚠️ **중요**: 환경변수를 추가/수정한 후 **반드시 재배포**해야 합니다!

### 2. 재배포 방법

1. Railway 대시보드에서 프로젝트 선택
2. **Deployments** 탭으로 이동
3. 우측 상단의 "..." 메뉴 → **"Redeploy"** 클릭
4. 또는 환경변수 수정 후 자동 재배포 대기

### 3. 브라우저 콘솔 확인

웹사이트를 열고 브라우저 개발자 도구(F12) → Console 탭에서 확인:

- `🔍 환경변수 확인:` 로그가 보이는지 확인
- `hasKakaoMapKey: true`인지 확인
- 에러 메시지가 있는지 확인

### 4. 카카오맵 API 도메인 설정 (401 에러 해결)

**401 Unauthorized 에러가 발생하는 경우:**

카카오맵 API는 보안상 특정 도메인에서만 사용할 수 있습니다. Railway 도메인을 등록해야 합니다.

**해결 방법:**

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 앱 선택 (API 키: `dc9b8bd337a4bbcdd54692e5c2a6a044`)
3. **앱 설정** → **플랫폼** 탭
4. **Web 플랫폼 등록** 클릭
5. **사이트 도메인**에 Railway 도메인 추가:
   - 정확한 도메인: `https://your-railway-domain.up.railway.app`
   - 또는 와일드카드: `https://*.up.railway.app` (모든 Railway 서브도메인 허용)
6. **저장** 클릭
7. 몇 분 대기 후 웹사이트 새로고침

**Railway 도메인 확인 방법:**
- Railway 대시보드 → Settings → Networking/Domains
- 또는 배포 상세 페이지에서 공개 URL 확인

### 5. Railway 로그 확인

Railway 대시보드에서:
1. **Deployments** 탭 → 배포 선택
2. **"View logs"** 버튼 클릭
3. 빌드 로그에서 환경변수 관련 에러 확인

### 6. 빌드 시점 환경변수 확인

Vite는 **빌드 시점**에 환경변수를 번들에 포함합니다.

환경변수를 추가한 후:
- ✅ **재배포 필수** (환경변수 변경만으로는 반영 안 됨)
- ✅ 빌드 로그에서 환경변수 확인
- ✅ 브라우저 콘솔에서 `import.meta.env` 확인

## 일반적인 문제

### 문제: "카카오맵 API 키가 설정되지 않았습니다"

**해결책:**
1. Railway Variables 탭에서 `VITE_KAKAO_MAP_APP_KEY` 확인
2. 값이 정확한지 확인 (공백 없이)
3. 재배포 실행

### 문제: "카카오맵 SDK 스크립트 로드 실패"

**해결책:**
1. 카카오맵 API 도메인 설정 확인
2. Railway 도메인을 카카오맵 허용 목록에 추가
3. 브라우저 네트워크 탭에서 스크립트 로드 실패 확인

### 문제: 지도는 보이지만 검색이 안 됨

**해결책:**
1. `VITE_KAKAO_REST_API_KEY` 환경변수 확인
2. Railway에서 재배포
3. 브라우저 콘솔에서 CORS 에러 확인

## 체크리스트

배포 전 확인:
- [ ] Railway Variables에 3개 환경변수 모두 설정
- [ ] 환경변수 값이 정확한지 확인 (공백, 따옴표 없이)
- [ ] 카카오맵 API 도메인에 Railway URL 추가
- [ ] 재배포 실행

배포 후 확인:
- [ ] 브라우저 콘솔에서 환경변수 로그 확인
- [ ] 지도가 정상적으로 로드되는지 확인
- [ ] 검색 기능이 작동하는지 확인
- [ ] Railway 로그에서 에러 확인

