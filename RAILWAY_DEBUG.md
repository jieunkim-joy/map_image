# Railway 지도 표시 문제 진단 가이드

## 🔍 문제 진단 체크리스트

### 1단계: 브라우저 콘솔 확인

Railway 도메인에 접속한 후 **F12 → Console 탭**에서 다음을 확인:

#### ✅ 정상적인 경우
```
현재 API 키: dc9b8bd3...
현재 도메인: https://your-project.railway.app
```

#### ❌ 문제가 있는 경우

**케이스 1: API 키가 없음**
```
❌ 카카오맵 API 키가 설정되지 않았습니다.
현재 도메인: https://your-project.railway.app
```
→ **해결**: Railway Variables에 `VITE_KAKAO_MAP_APP_KEY` 추가 후 재배포

**케이스 2: SDK 로드 실패**
```
❌ 카카오맵 SDK 스크립트 로드 실패
현재 API 키: dc9b8bd3...
현재 도메인: https://your-project.railway.app
```
→ **해결**: 카카오 개발자 콘솔에서 도메인 등록 필요

**케이스 3: SDK는 로드되었지만 지도가 안 보임**
```
❌ 카카오맵 SDK가 로드되지 않았습니다.
```
→ **해결**: Network 탭에서 SDK 스크립트 로드 상태 확인

### 2단계: Network 탭 확인

**F12 → Network 탭**에서:

1. **`v2/maps/sdk.js` 요청 확인**
   - 상태 코드가 **200**: 정상 로드
   - 상태 코드가 **403**: 도메인 미등록 또는 API 키 오류
   - 상태 코드가 **404**: API 키가 잘못됨
   - 요청 자체가 없음: 스크립트 태그 생성 실패

2. **요청 URL 확인**
   - `https://dapi.kakao.com/v2/maps/sdk.js?appkey=...`
   - `appkey` 파라미터에 값이 있는지 확인

### 3단계: Railway 환경변수 확인

Railway 대시보드에서:

1. **Variables 탭** 확인
   - `VITE_KAKAO_MAP_APP_KEY` 존재 여부
   - 값이 정확한지 확인 (공백, 따옴표 없이)
   - 예: `dc9b8bd337a4bbcdd54692e5c2a6a044`

2. **환경변수 추가 후 재배포 필수**
   - Variables 탭에서 환경변수 추가/수정
   - **Deployments 탭** → 최신 배포의 **"..."** → **"Redeploy"** 클릭
   - ⚠️ **중요**: Vite는 빌드 시점에 환경변수를 번들에 포함하므로 재배포 필수!

### 4단계: 카카오 개발자 콘솔 확인

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 앱 선택
3. **앱 설정** → **플랫폼** 탭
4. **Web 플랫폼**에 Railway 도메인이 등록되어 있는지 확인
   - 예: `https://your-project.railway.app`
   - 또는 와일드카드: `https://*.railway.app`
5. 등록되지 않았다면 추가 후 저장

### 5단계: Railway 빌드 로그 확인

Railway 대시보드에서:

1. **Deployments 탭** → 최신 배포 선택
2. **"View logs"** 클릭
3. 빌드 로그에서 에러 확인
4. 환경변수 관련 에러가 있는지 확인

## 🐛 일반적인 문제와 해결책

### 문제 1: 환경변수가 빌드에 포함되지 않음

**증상**: 브라우저 콘솔에 "API 키가 설정되지 않았습니다"

**원인**: 
- Railway Variables에 환경변수가 없음
- 환경변수 이름이 잘못됨 (`VITE_` 접두사 필수)
- 환경변수 추가 후 재배포를 하지 않음

**해결**:
1. Railway Variables에 `VITE_KAKAO_MAP_APP_KEY` 추가
2. 값 확인 (공백 없이)
3. **재배포 필수** (Deployments → Redeploy)

### 문제 2: 카카오맵 API 도메인 미등록

**증상**: Network 탭에서 SDK 스크립트가 403 에러

**원인**: Railway 도메인이 카카오맵 허용 목록에 없음

**해결**:
1. 카카오 개발자 콘솔 접속
2. Web 플랫폼에 Railway 도메인 추가
3. 저장 후 몇 분 대기
4. 브라우저 새로고침

### 문제 3: API 키가 잘못됨

**증상**: Network 탭에서 SDK 스크립트가 404 에러

**원인**: 
- 잘못된 API 키 사용
- JavaScript 키가 아닌 REST API 키 사용

**해결**:
1. 카카오 개발자 콘솔에서 **JavaScript 키** 확인
2. Railway Variables에 올바른 키 입력
3. 재배포

## 📋 빠른 체크리스트

배포 전:
- [ ] Railway Variables에 `VITE_KAKAO_MAP_APP_KEY` 설정
- [ ] API 키 값이 정확한지 확인
- [ ] 카카오 개발자 콘솔에 Railway 도메인 등록

배포 후:
- [ ] 재배포 완료 확인
- [ ] 브라우저 콘솔에서 API 키 로드 확인
- [ ] Network 탭에서 SDK 스크립트 로드 확인
- [ ] 지도 표시 확인

## 🔧 디버깅 코드

브라우저 콘솔에서 다음을 실행하여 환경변수 확인:

```javascript
console.log('API Key:', import.meta.env.VITE_KAKAO_MAP_APP_KEY);
console.log('All env vars:', import.meta.env);
```




