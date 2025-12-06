# 프로모션 충전소 지도 (이미지 캡쳐용)

프로모션 대상 전기차 충전소 위치를 지도에 표시하는 웹 애플리케이션

## 기능

- 📍 **충전소 지도 표시**: 카카오맵을 활용한 지도 UI
- 🎯 **프로모션 충전소 핀**: CSV 데이터 기반으로 프로모션 충전소 위치 표시
- 📱 **이미지 캡쳐 최적화**: 지도와 핀만 표시하여 깔끔한 이미지 캡쳐 가능

## 설치 및 실행

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# 프로덕션 서버 실행 (빌드 후)
npm start
```

### Railway 배포

Railway에 배포하는 방법은 [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)를 참고하세요.

**빠른 배포:**
1. Railway에서 GitHub 저장소 연결
2. 환경변수 설정 (아래 참고)
3. 자동 배포 완료

## 프로젝트 구조

```
electro_search/
├── public/
│   └── stations.csv          # CSV 데이터 파일
├── src/
│   ├── App.tsx               # 메인 앱 컴포넌트
│   ├── MapView.tsx           # 카카오맵 뷰 컴포넌트
│   ├── utils.ts              # 유틸리티 함수 (CSV 파싱)
│   ├── types.ts              # TypeScript 타입 정의
│   ├── main.tsx              # 진입점
│   └── styles.css            # 전역 스타일
├── index.html                # HTML 진입점
├── package.json
├── vite.config.ts
├── server.js                  # Express 서버 (프로덕션용)
└── tsconfig.json
```

## 주요 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **카카오맵 JavaScript API** (지도)
- **Express** (프로덕션 서버)

## API 키 설정

### 환경변수 목록

1. **`VITE_KAKAO_MAP_APP_KEY`** - 카카오맵 JavaScript API 키 (지도 SDK용)

### 환경변수 설정 방법

1. **로컬 개발**: 프로젝트 루트에 `.env` 파일 생성
   ```
   VITE_KAKAO_MAP_APP_KEY=your_kakao_map_api_key
   ```

2. **Railway 배포**: Railway 대시보드의 Variables 탭에서 환경변수 추가

⚠️ **주의**: 
- `.env` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- Railway 배포 시 환경변수 변경 후 재배포 필요

## 데이터 흐름

1. **초기 로딩**: CSV 파일 로드 → 파싱 → 충전소 그룹화 → 지도에 핀 표시
2. **핀 표시**: CSV 데이터의 좌표 정보를 기반으로 지도에 핀 표시

## 브라우저 호환성

- 모바일 웹 브라우저 (iOS Safari, Chrome)
- 데스크톱 브라우저 (Chrome, Safari, Edge)

## 개발 참고사항

- 모든 컴포넌트는 `src/` 폴더의 루트 레벨에 위치 (Flat Structure)
- API 키는 환경변수로 관리됩니다 (보안)
- CSV 파일은 `public/stations.csv`에 위치
- 프로덕션 빌드는 `dist/` 폴더에 생성됩니다
- Railway 배포 시 Express 서버가 정적 파일을 서빙합니다
