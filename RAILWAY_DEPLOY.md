# Railway 배포 가이드

## 배포 전 준비사항

### 1. GitHub 저장소 연결
- Railway 대시보드에서 "New Project" → "Deploy from GitHub repo" 선택
- `Castlehungo/electro_search` 저장소 선택

### 2. 환경변수 설정
Railway 대시보드의 **Variables** 탭에서 다음 환경변수를 추가하세요:

```
VITE_KAKAO_MAP_APP_KEY=dc9b8bd337a4bbcdd54692e5c2a6a044
VITE_KAKAO_REST_API_KEY=2593b2e75d34733f4d2bdfafc70fd001
VITE_ENV_API_KEY=YpTJD6AvEhKYwklChyF8W6zutK228pAkbKgy3qGNa18%2FmyJTkQxtCDLAJvMLnQPQCm5JlYeCUgX2Yy0HS8fNgw%3D%3D
```

⚠️ **중요**: 
- Vite는 **빌드 시점**에 환경변수를 번들에 포함합니다
- 환경변수를 추가/수정한 후 **반드시 재배포**해야 합니다!
- 재배포 방법: Deployments 탭 → "..." 메뉴 → "Redeploy"

### 3. 빌드 설정 확인
Railway는 자동으로 다음을 감지합니다:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: Railway가 자동으로 `PORT` 환경변수 제공

## 배포 프로세스

1. **빌드 단계**
   - `npm ci` (의존성 설치)
   - `npm run build` (프로덕션 빌드)
   - `dist/` 폴더에 정적 파일 생성

2. **실행 단계**
   - `npm start` (Express 서버 실행)
   - `PORT` 환경변수로 동적 포트 사용

## 배포 후 확인사항

1. Railway가 제공하는 도메인으로 접속
2. 카카오맵이 정상적으로 로드되는지 확인
3. 검색 기능이 작동하는지 확인
4. 충전소 핀 클릭 시 API 호출이 정상인지 확인

## 문제 해결

### 빌드 실패 시
- Railway 로그에서 에러 확인
- 환경변수가 제대로 설정되었는지 확인
- `package.json`의 스크립트 확인

### 런타임 에러 시
- 서버 로그 확인
- 환경변수 값 확인 (특히 API 키)
- 포트 설정 확인

## 참고사항

- Railway는 자동으로 HTTPS를 제공합니다
- 카카오맵 API 설정에서 Railway 도메인을 허용 목록에 추가해야 할 수 있습니다
- **환경변수 변경 후 수동으로 재배포해야 합니다** (자동 재배포 안 됨)
- 지도가 표시되지 않으면 [TROUBLESHOOTING_RAILWAY.md](./TROUBLESHOOTING_RAILWAY.md) 참고

