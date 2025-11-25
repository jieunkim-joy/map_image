# MVP 분석 보고서

## 📋 프로젝트 개요
- **프로젝트명**: 전기차 충전소 지도 (Senior-Friendly EV Charging Map)
- **기술 스택**: React + TypeScript + Vite + 카카오맵 API
- **타겟**: 모바일 웹 환경, 고령층 사용자 최적화

---

## 🎯 1. 유저 액션별 웹사이트 반응 분석

### 1.1 앱 초기 진입 시
**사용자 액션**: 웹사이트 접속

**시스템 반응**:
1. **CSV 데이터 로드** (`loadCSVData()`)
   - `/public/stations.csv` 파일을 fetch하여 파싱
   - `parseCSVData()` 함수로 CSV → `ChargerStation[]` 변환
   - 같은 `promo_statId`를 가진 행들을 하나의 충전소로 그룹화
   - 각 충전소의 최저가(`minPrice`) 계산

2. **사용자 위치 요청** (Geolocation API)
   - 성공 시: `userLocation` 상태 업데이트, 지도 중심을 사용자 위치로 설정
   - 실패 시: `locationError` 상태에 에러 메시지 저장, 기본값(경남 지역) 사용
   - 기본 지도 중심: `{ lat: 35.2228599, lng: 128.681235 }` (경남 지역)

3. **카카오맵 초기화**
   - 카카오맵 SDK 로드 대기 후 지도 렌더링
   - 드래그, 줌, 더블클릭 줌 활성화

4. **핀 렌더링**
   - 필터링된 충전소들을 지도에 커스텀 오버레이로 표시
   - 최저가 충전소는 빨간색 텍스트 + 별 뱃지로 강조
   - 각 핀에 가격(`minPrice`) 표시

---

### 1.2 검색 액션
**사용자 액션**: 검색창에 키워드 입력 (2글자 이상)

**시스템 반응**:
1. **자동완성 검색** (`SearchBar.tsx`)
   - 입력 2글자 이상 시 카카오맵 키워드 검색 API 호출
   - 최대 5개 결과를 드롭다운으로 표시
   - 각 결과: 장소명, 주소 표시

2. **검색 결과 선택 시** (`handleSearchResult()`)
   - 지도 중심을 검색 위치로 이동 (`setMapCenter`)
   - 검색 위치 기준 1km 반경 내 충전소 찾기 (`calculateDistance`)
   - 거리순 정렬 후 **가장 가까운 충전소 자동 선택**
   - 선택된 충전소에 대해 API 호출 및 Bottom Sheet 오픈

---

### 1.3 필터 액션
**사용자 액션**: 필터 버튼 클릭 (`[주차무료]`, `[지상]`, `[초급속]`)

**시스템 반응**:
1. **필터 상태 업데이트** (`FilterButtons.tsx`)
   - Toggle 방식: 클릭 시 해당 필터 on/off
   - `filters` 상태 업데이트

2. **필터링 로직** (`useEffect` in `App.tsx`)
   - AND 조건으로 필터링:
     - `parkingFree`: `station.parkingFree === true`
     - `firstFloor`: `station.firstFloor === true`
     - `highSpeed`: `station.hasFastCharger === true`
   - 필터링된 결과로 `filteredStations` 업데이트

3. **핀 재렌더링**
   - 필터링된 충전소만 지도에 표시
   - 최저가 재계산 (필터링된 충전소 기준)
   - 선택된 충전소가 필터에서 제외되면 자동으로 선택 해제

---

### 1.4 핀 클릭 액션
**사용자 액션**: 지도의 충전소 핀 클릭/터치

**시스템 반응**:
1. **즉시 반응** (`MapView.tsx`)
   - 선택된 핀 스타일 변경 (scale 1.3배, 파란색 테두리)
   - 지도 중심을 선택된 충전소로 이동 (`panTo`)

2. **API 호출** (`handleSelectStation()`)
   - **Lazy Loading**: 이 시점에만 API 호출
   - `fetchChargerInfo(statId)` 호출
   - 한국환경공단 API에서 해당 충전소의 모든 충전기 정보 조회

3. **상태 집계** (`aggregateChargerStatus()`)
   - CSV의 충전기 정보와 API 응답을 매핑
   - `chgerId`로 매칭하여 각 충전기의 `stat` 확인
   - `stat === "2"` = 충전 대기 (사용 가능)
   - 초급속/급속별로 사용 가능/전체 개수 집계
   - 모든 충전기가 사용 중인지 판단 (`allInUse`)

4. **Bottom Sheet 표시**
   - 선택된 충전소 정보와 API 상태 정보를 통합하여 표시
   - 스와이프 다운으로 닫기 가능

---

### 1.5 지도 조작 액션
**사용자 액션**: 
- 현위치 버튼 클릭
- 확대/축소 버튼 클릭
- 지도 드래그/핀치 줌

**시스템 반응**:
1. **현위치 버튼** (`handleGoToMyLocation()`)
   - 저장된 위치가 있으면 해당 위치로 이동
   - 없으면 위치 정보 재요청 (고정밀도 모드)
   - 성공 시 지도 중심 이동, 실패 시 alert 표시

2. **확대/축소 버튼** (`handleZoomIn/Out()`)
   - 줌 레벨 상태 업데이트 (1~14 레벨)
   - 카카오맵 `setLevel()` 호출

3. **지도 드래그/핀치 줌**
   - 카카오맵 기본 기능 사용
   - 별도 상태 관리 없음

---

### 1.6 Bottom Sheet 액션
**사용자 액션**: 
- Bottom Sheet 드래그 다운
- 닫기 버튼 클릭
- 배경 오버레이 클릭
- 길안내 버튼 클릭

**시스템 반응**:
1. **드래그 다운** (`BottomSheet.tsx`)
   - 터치 이벤트로 드래그 거리 계산
   - 100px 이상 드래그 시 자동 닫기

2. **닫기**
   - `selectedStation` 상태를 `null`로 설정
   - Bottom Sheet 사라짐

3. **길안내 버튼** (`handleNavigation()`)
   - 카카오내비 스키마 URL 생성: `kakaomap://route?ep={lng},{lat}&by=CAR`
   - 카카오내비 앱 실행 시도
   - 앱이 없으면 1초 후 설치 페이지 안내

---

### 1.7 사용방법 모달 액션
**사용자 액션**: 사용방법 버튼 클릭

**시스템 반응**:
- `showHowToUse` 상태를 `true`로 설정
- 모달 오버레이와 함께 사용법 안내 표시
- 확인 버튼 클릭 시 모달 닫기

---

## 📊 2. 웹사이트 정보 요소 분석

### 2.1 지도 영역
**표시 정보**:
- **충전소 핀 (Marker)**
  - 가격 정보: `minPrice` (원 단위)
  - 최저가 강조: 빨간색 텍스트 + 별(★) 뱃지
  - 선택 상태: 파란색 테두리 + 확대 효과
  - 디자인: 흰색 배경 + 초록색 테두리 + 가격 텍스트

- **사용자 위치 마커**
  - 빨간색 마커로 표시
  - 사용자 위치 정보가 있을 때만 표시

---

### 2.2 상단 검색/필터 영역
**표시 정보**:
- **검색창**
  - 입력 필드: "목적지를 검색하세요" 플레이스홀더
  - 검색 아이콘 (왼쪽)
  - 삭제 버튼 (입력 시 오른쪽 표시)
  - 자동완성 드롭다운:
    - 장소명 (18px, 굵게)
    - 주소 (15px, 회색)

- **필터 버튼**
  - `[주차무료]`, `[지상]`, `[초급속]` (3개)
  - 활성화 시: 파란색 배경 + 흰색 텍스트
  - 비활성화 시: 흰색 배경 + 회색 테두리

- **위치 에러 알림** (조건부)
  - 위치 정보를 가져올 수 없을 때 표시
  - 노란색 배경의 경고 박스

---

### 2.3 Bottom Sheet (충전소 상세 정보)
**표시 정보** (순서대로):

1. **충전소 이름**
   - `station.stationName` (25px, 굵게)

2. **태그**
   - `[주차무료]`: `station.parkingFree === true`일 때만 표시 (파란색)
   - `[지상]`: `station.firstFloor === true`일 때만 표시 (초록색)

3. **충전기 현황** (실시간 API 데이터)
   - **Case 1: 충전 가능 시**
     - 급속: `대기 {available}대 / 전체 {total}대`
     - 초급속: `대기 {available}대 / 전체 {total}대`
     - 사용 가능 개수는 초록색, 사용 중은 빨간색
   
   - **Case 2: 전부 사용 중**
     - "⚠️ 모든 충전기 사용 중" 경고 메시지 (빨간색 박스)
     - 숫자 정보와 함께 표시

   - **로딩 중**: "충전기 상태 정보를 불러오는 중..." 메시지

4. **요금 정보**
   - `{minPrice}원 / kWh` (26px, 굵게, 노란색 박스)

5. **위치 정보**
   - 주소: `station.address` (15px)
   - 상세 위치: `station.locationDetail` (13px, 회색, 조건부)

6. **길안내 버튼**
   - 파란색 배경, 흰색 텍스트
   - 카카오내비 앱 실행

---

### 2.4 지도 컨트롤 영역
**표시 정보**:
- **사용방법 버튼** (왼쪽 하단)
  - 회색 원형 버튼, 물음표 아이콘

- **현위치 버튼** (왼쪽 하단, 사용방법 버튼 아래)
  - 파란색 원형 버튼, 나침반 아이콘

- **확대 버튼** (오른쪽 하단)
  - 흰색 원형 버튼, + 아이콘

- **축소 버튼** (오른쪽 하단, 확대 버튼 아래)
  - 흰색 원형 버튼, - 아이콘

---

### 2.5 사용방법 모달
**표시 정보**:
- 5단계 사용법 안내:
  1. 목적지 검색
  2. 조건으로 필터
  3. 핀 색상 확인 (초록색 = 충전 가능, 빨간색 가격 = 최저가)
  4. 핀 클릭
  5. 현위치 버튼

---

## 🔄 3. 데이터 처리 흐름 분석

### 3.1 데이터 소스 구조

#### 3.1.1 정적 데이터 (CSV)
**파일**: `/public/stations.csv`

**컬럼 구조**:
```
region, station_name, Promotion Price, promo_statId, promo_chgerId,
type, speed(kwh), address, location_detail, lati, longi,
First_floor, is_fast, parking_free
```

**특징**:
- 한 충전소에 여러 충전기가 있는 경우 여러 행으로 저장
- 같은 `promo_statId`를 가진 행들이 하나의 충전소를 구성
- Boolean 값은 "TRUE"/"FALSE" 문자열로 저장

---

#### 3.1.2 동적 데이터 (API)
**API**: 한국환경공단 전기자동차 충전소 정보 API
- **Endpoint**: `http://apis.data.go.kr/B552584/EvCharger/getChargerInfo`
- **호출 시점**: 핀 클릭 시에만 (Lazy Loading)
- **매핑 키**: `promo_statId` (CSV) == `statId` (API), `promo_chgerId` (CSV) == `chgerId` (API)

**응답 구조**:
```typescript
{
  resultCode: string;
  resultMsg: string;
  items: {
    item: ChargerInfoItem[];
  }
}

ChargerInfoItem {
  statId: string;
  chgerId: string;
  statNm: string;
  addr: string;
  location: string;
  stat: string;  // "2" = 충전 대기 (사용 가능)
  chgerType: string;
}
```

---

### 3.2 데이터 변환 파이프라인

#### 3.2.1 CSV → ChargerStation 변환
**함수**: `parseCSVData()` (`utils.ts`)

**처리 과정**:
1. **CSV 파싱**
   - 줄바꿈으로 분리
   - 첫 줄을 헤더로 사용
   - 따옴표 처리하여 값 추출

2. **그룹화** (`Map<string, ChargerStation>`)
   - `promo_statId`를 키로 사용
   - 같은 충전소의 여러 충전기 정보를 하나의 객체로 통합

3. **타입 변환**
   - `lati`, `longi` → `latitude`, `longitude` (number)
   - `Promotion Price` → `promotionPrice` (number)
   - `First_floor`, `parking_free` → `firstFloor`, `parkingFree` (boolean)
   - `is_fast` → `hasFastCharger` (boolean, 충전소 레벨)
   - `speed(kwh)` → `speed` (number, 충전기 레벨)

4. **집계 정보 계산**
   - `minPrice`: 충전소 내 최저가
   - `hasFastCharger`: 초급속 충전기 존재 여부
   - `chargers[]`: 충전기 목록 (chgerId, type, speed, isFast)

**결과**: `ChargerStation[]` 배열

---

#### 3.2.2 API 응답 → 상태 집계
**함수**: `aggregateChargerStatus()` (`api.ts`)

**처리 과정**:
1. **매핑**
   - CSV의 `chargers[]`와 API의 `items.item[]`를 `chgerId`로 매칭

2. **상태 판단**
   - `stat === "2"` → 사용 가능
   - 그 외 → 사용 중/점검 중

3. **타입별 집계**
   - 초급속 (`isFast === true`): 사용 가능/전체 개수
   - 급속 (`isFast === false`): 사용 가능/전체 개수

4. **전체 사용 중 판단**
   - 모든 충전기가 사용 중인지 확인 (`allInUse`)

**결과**: `ChargerStatusSummary` 객체

---

### 3.3 데이터 흐름 다이어그램

```
[CSV 파일]
    ↓
[parseCSVData()]
    ↓
[ChargerStation[]] → [필터링] → [filteredStations]
    ↓
[지도에 핀 렌더링]
    ↓
[사용자 핀 클릭]
    ↓
[fetchChargerInfo(statId)] → [API 호출]
    ↓
[aggregateChargerStatus()] → [상태 집계]
    ↓
[MergedStation] → [Bottom Sheet 표시]
```

---

### 3.4 상태 관리 구조

**주요 상태** (`App.tsx`):
- `stations`: 원본 CSV 데이터 (필터링 전)
- `filteredStations`: 필터링된 충전소 목록
- `selectedStation`: 현재 선택된 충전소 (API 데이터 포함)
- `userLocation`: 사용자 현재 위치
- `mapCenter`: 지도 중심 좌표
- `zoomLevel`: 지도 줌 레벨
- `filters`: 필터 옵션 (parkingFree, firstFloor, highSpeed)
- `showHowToUse`: 사용방법 모달 표시 여부
- `locationError`: 위치 에러 메시지

**상태 업데이트 트리거**:
- `stations`: CSV 로드 완료 시
- `filteredStations`: `filters` 또는 `stations` 변경 시 (useEffect)
- `selectedStation`: 핀 클릭 또는 검색 결과 선택 시
- `mapCenter`: 검색, 현위치 버튼, 핀 선택 시
- `zoomLevel`: 확대/축소 버튼 클릭 시

---

### 3.5 성능 최적화 전략

1. **Lazy Loading**
   - API 호출은 핀 클릭 시에만 수행
   - 초기 로딩 시 API 호출 없음

2. **데이터 그룹화**
   - CSV의 여러 행을 하나의 충전소로 그룹화하여 중복 제거
   - 지도에 표시되는 핀 수 최소화

3. **필터링 최적화**
   - 원본 데이터(`stations`)는 유지
   - 필터링 결과만 별도 상태(`filteredStations`)로 관리
   - 필터 변경 시에만 재계산

4. **지도 렌더링 최적화**
   - 기존 오버레이 제거 후 새로 생성 (메모리 누수 방지)
   - 선택된 핀만 z-index 상승

---

## 🎨 4. UI/UX 특징

### 4.1 모바일 최적화
- **터치 타겟 크기**: 최소 44px × 44px
- **폰트 크기**: 16px 이상 (주요 정보는 18px+)
- **버튼 크기**: 52px~64px 높이
- **터치 제스처**: 드래그, 핀치 줌 지원

### 4.2 시각적 피드백
- **선택 상태**: 핀 확대 + 파란색 테두리
- **최저가 강조**: 빨간색 텍스트 + 별 뱃지
- **필터 활성화**: 파란색 배경
- **충전 가능/불가능**: 초록색/빨간색 숫자

### 4.3 접근성
- **명확한 라벨**: 모든 버튼에 aria-label
- **큰 텍스트**: 고령층을 위한 큰 폰트
- **높은 대비**: 텍스트와 배경 색상 대비 확보

---

## 🔍 5. 주요 발견 사항 및 개선 포인트

### 5.1 현재 구현 상태
✅ **잘 구현된 부분**:
- CSV 파싱 및 그룹화 로직
- Lazy Loading으로 API 호출 최소화
- 필터링 로직 (AND 조건)
- 검색 후 가장 가까운 충전소 자동 선택
- 모바일 터치 최적화

### 5.2 잠재적 개선 영역
⚠️ **개선 가능한 부분**:
1. **에러 처리**: API 호출 실패 시 사용자에게 명확한 피드백 부족
2. **로딩 상태**: API 호출 중 로딩 인디케이터 부족
3. **캐싱**: 같은 충전소를 다시 클릭 시 API 재호출 (캐싱 없음)
4. **검색 성능**: 검색어 입력 시 디바운싱 없음 (2글자마다 즉시 호출)
5. **반응형**: 데스크톱 환경 최적화 부족
6. **접근성**: 키보드 네비게이션 지원 부족

---

## 📝 6. 기술 스택 요약

- **프레임워크**: React 18.3.1
- **언어**: TypeScript 5.4.5
- **빌드 도구**: Vite 5.2.11
- **지도 API**: 카카오맵 SDK
- **아이콘**: Lucide React
- **스타일링**: 인라인 스타일 + 커스텀 CSS (Tailwind 유사 클래스)

---

## 🎯 7. 다음 단계 제안

1. **사용성 개선**
   - 검색 디바운싱 추가
   - API 응답 캐싱
   - 로딩 상태 표시
   - 에러 처리 강화

2. **성능 개선**
   - 가상화된 리스트 (많은 핀 표시 시)
   - 지도 뷰포트 기반 핀 필터링

3. **기능 추가**
   - 즐겨찾기 기능
   - 최근 검색 기록
   - 충전소 리스트 뷰

---

**분석 완료일**: 2024년
**분석 대상**: `/new_map` 폴더

