# 전기차 충전소 지도 (MVP)

어르신 친화적인 모바일 웹 전기차 충전소 찾기 서비스

## 기능

- 📍 **충전소 지도 표시**: 카카오맵을 활용한 직관적인 지도 UI
- 🔍 **목적지 검색**: 키워드 검색 및 자동완성
- 🎯 **필터링**: 주차무료, 지상, 초급속 조건으로 필터링
- ⚡ **실시간 상태**: 핀 클릭 시 충전기 상태 확인 (Lazy Loading)
- 📱 **모바일 최적화**: 터치 친화적 UI, 큰 버튼/텍스트

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
map_code/
├── public/
│   └── stations.csv          # CSV 데이터 파일
├── src/
│   ├── App.tsx               # 메인 앱 컴포넌트
│   ├── MapView.tsx           # 카카오맵 뷰 컴포넌트
│   ├── SearchBar.tsx         # 검색창 컴포넌트
│   ├── FilterButtons.tsx     # 필터 버튼 컴포넌트
│   ├── BottomSheet.tsx       # 하단 상세 정보 시트
│   ├── StationPin.tsx        # 충전소 핀 컴포넌트 (참고용)
│   ├── MapControls.tsx       # 지도 컨트롤 (현위치, 도움말)
│   ├── ZoomControls.tsx      # 줌 컨트롤
│   ├── HowToUseModal.tsx     # 사용방법 모달
│   ├── api.ts                # 환경부 API 호출 함수
│   ├── utils.ts              # 유틸리티 함수 (CSV 파싱, 거리 계산)
│   ├── types.ts              # TypeScript 타입 정의
│   ├── main.tsx              # 진입점
│   └── styles.css            # 전역 스타일
├── index.html                # HTML 진입점
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 주요 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **카카오맵 JavaScript API** (지도)
- **카카오맵 REST API** (Geocoding 검색)
- **환경부 전기차 충전소 API** (실시간 상태)

## API 키 설정

모든 API 키는 환경변수로 관리됩니다. `.env` 파일을 생성하고 다음 변수들을 설정하세요:

### 환경변수 목록

1. **`VITE_KAKAO_MAP_APP_KEY`** - 카카오맵 JavaScript API 키 (지도 SDK용)
2. **`VITE_KAKAO_REST_API_KEY`** - 카카오맵 REST API 키 (검색 API용)
3. **`VITE_ENV_API_KEY`** - 환경부 전기차 충전소 API 키 (인코딩된 버전)

### 환경변수 설정 방법

1. 프로젝트 루트에 `.env` 파일 생성
2. `.env.example` 파일을 참고하여 실제 키 값 입력
3. Railway 등 배포 플랫폼에서는 환경변수 설정에서 추가

⚠️ **주의**: 
- `.env` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- 환경부 API 키는 이미 URL 인코딩된 상태로 사용됩니다 (이중 인코딩 방지)

## 데이터 흐름

1. **초기 로딩**: CSV 파일 로드 → 파싱 → 충전소 그룹화 → 지도에 핀 표시
2. **검색**: 카카오맵 Geocoding API → 좌표 검색 → 지도 이동 → 반경 내 핀 자동 포커스
3. **필터링**: CSV 데이터 필터링 → 핀 재렌더링
4. **핀 클릭**: 환경부 API 호출 (Lazy Loading) → 상태 집계 → Bottom Sheet 표시

## 브라우저 호환성

- 모바일 웹 브라우저 (iOS Safari, Chrome)
- 데스크톱 브라우저 (Chrome, Safari, Edge)

## 개발 참고사항

- 모든 컴포넌트는 `src/` 폴더의 루트 레벨에 위치 (Flat Structure)
- API 키는 보안을 위해 하드코딩되어 있음 (프로덕션 배포 시 환경변수 사용 권장)
- CSV 파일은 `public/stations.csv`에 위치

