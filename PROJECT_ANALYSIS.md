# 프로젝트 분석 문서

## 📋 목차
1. [사용자 액션과 웹사이트 반응](#1-사용자-액션과-웹사이트-반응)
2. [정보 요소 분석](#2-정보-요소-분석)
3. [데이터 처리 흐름](#3-데이터-처리-흐름)

---

## 1. 사용자 액션과 웹사이트 반응

### 1.1 앱 초기 진입

**사용자 액션:**
- 웹 브라우저에서 앱 URL 접속

**웹사이트 반응:**
1. **위치 정보 요청**
   - `navigator.geolocation.getCurrentPosition()` 호출
   - 성공 시: 사용자 위치를 중심으로 지도 표시 (줌 레벨 5 = 반경 1km)
   - 실패 시: 기본 위치(경남 지역: 35.2228599, 128.681235)로 설정
   - 에러 타입별 메시지 표시 (권한 거부, 위치 불가, 타임아웃)

2. **CSV 데이터 로드**
   - `/stations.csv` 파일을 fetch하여 로드
   - CSV 파싱: `parseCSVData()` 함수 실행
   - 같은 `promo_statId`를 가진 충전기들을 그룹화하여 충전소 단위로 변환
   - 각 충전소별 최저가(`minPrice`) 계산

3. **지도 초기화**
   - 카카오맵 API 로드 후 지도 렌더링
   - `isLocationReady` 상태가 `true`가 될 때까지 지도 렌더링 대기
   - 모든 충전소를 지도에 핀(Marker)으로 표시

4. **사용 방법 모달 표시 여부**
   - 최초 진입 시 표시 여부는 현재 코드에서 명시적으로 구현되지 않음
   - 도움말 버튼 클릭 시에만 표시

---

### 1.2 검색 기능 사용

**사용자 액션:**
- 상단 검색창에 목적지 키워드 입력 (최소 2자 이상)

**웹사이트 반응:**
1. **디바운싱 적용 (500ms)**
   - 입력 후 500ms 대기 후 API 호출
   - 빠른 타이핑 시 불필요한 API 호출 방지

2. **카카오맵 키워드 검색 API 호출**
   - 엔드포인트: `https://dapi.kakao.com/v2/local/search/keyword.json`
   - 검색어 자동완성 결과 10개까지 제공

3. **검색 결과 표시**
   - 검색창 하단에 드롭다운 목록 표시
   - 각 결과 아이템: 장소명, 주소 표시
   - 로딩 상태 표시 ("검색 중...")

4. **검색 결과 선택 시**
   - 검색창 값 업데이트
   - 모바일 키보드 자동 닫기 (`input.blur()`)
   - 지도 중심을 선택한 위치로 이동 (`panTo`)
   - 줌 레벨 5로 설정 (반경 1km 표시)
   - 드롭다운 목록 닫기

**참고:** 검색 후 가장 가까운 핀 자동 포커스 기능은 현재 구현되지 않음

---

### 1.3 필터 버튼 클릭

**사용자 액션:**
- `[주차무료]`, `[지상]`, `[100kW 이상]` 버튼 클릭 (토글 방식)

**웹사이트 반응:**
1. **필터 상태 토글**
   - `filters` state 업데이트 (parkingFree, firstFloor, highSpeed)

2. **필터링 로직 실행 (AND 조건)**
   - `useMemo`로 메모이제이션된 `filteredStations` 자동 재계산
   - 주차무료 필터: `parkingFree === true`인 충전소만 표시
   - 지상 필터: `firstFloor === true`인 충전소만 표시
   - 초급속 필터: `hasFastCharger === true`인 충전소만 표시

3. **지도 핀 업데이트 (증분 업데이트)**
   - 전체 핀을 재생성하지 않고 증분 업데이트
   - 제거할 핀만 제거, 추가할 핀만 추가
   - 변경된 핀만 업데이트 (성능 최적화)

4. **선택된 충전소 처리**
   - 필터링 결과에서 선택된 충전소가 제외되면 자동으로 선택 해제

---

### 1.4 충전소 핀 클릭

**사용자 액션:**
- 지도 위 충전소 핀 클릭 또는 터치

**웹사이트 반응:**

1. **드래그 감지 로직**
   - 터치 시작 위치와 이동 거리 계산
   - 10px 이상 이동 시 드래그로 판단 (클릭 무시)
   - 지도 드래그 중일 때는 핀 클릭 무시

2. **중앙 영역 클릭만 허용**
   - 핀의 중앙부 50% 영역만 클릭 가능
   - 가장자리 클릭은 무시 (실수 방지)

3. **즉시 UI 피드백**
   - 선택된 핀 강조 (파란색 테두리, 크기 확대 1.3배)
   - 선택되지 않은 핀은 기본 상태로 복귀

4. **API 호출 (Lazy Loading)**
   - **캐시 체크**: 동일 충전소를 5분 이내에 재조회하면 캐시에서 즉시 반환 (60-80% API 호출 절감)
   - **중복 요청 방지**: 이미 진행 중인 요청이 있으면 해당 Promise 재사용
   - **서버 프록시 호출**: `/api/charger-info?statId={statId}` 엔드포인트 호출
   - **타임아웃**: 10초 내 응답 없으면 에러 처리

5. **충전기 상태 집계**
   - API 응답 데이터와 CSV 데이터를 매핑
   - 초급속/급속 구분하여 대기 가능한 충전기 수 집계
   - `stat === "2"`인 충전기가 "대기" 상태

6. **Bottom Sheet 표시**
   - 하단에서 슬라이드업 애니메이션
   - 지도 조작 비활성화 (드래그, 줌 막기)

7. **에러 처리**
   - API 호출 실패 시 에러 메시지 상단에 표시
   - 3초 후 자동 제거
   - 기본 정보는 표시 (API 에러가 있어도 사용 가능)

---

### 1.5 Bottom Sheet 상호작용

**사용자 액션:**
- Bottom Sheet 드래그 (아래로 당기기)
- 닫기 버튼 클릭
- 배경 오버레이 클릭
- 길안내 버튼 클릭

**웹사이트 반응:**

1. **드래그로 닫기**
   - 100px 이상 아래로 드래그 시 닫힘
   - 드래그 핸들(회색 막대) 영역에서만 드래그 가능

2. **닫기 시**
   - Bottom Sheet 닫힘
   - 지도 조작 다시 활성화
   - 선택된 충전소 상태 유지 (재클릭 시 즉시 표시)

3. **길안내 버튼 클릭**
   - 카카오내비 URL Scheme 호출: `kakaomap://route?ep={lng},{lat}&by=CAR`
   - 앱 미설치 시 1초 후 확인 대화상자 표시

---

### 1.6 지도 컨트롤 사용

**사용자 액션:**
- 현위치 버튼 클릭
- 줌 인/아웃 버튼 클릭
- 지도 핀치 줌
- 지도 드래그

**웹사이트 반응:**

1. **현위치 버튼**
   - `navigator.geolocation.getCurrentPosition()` 재호출
   - 지도 중심을 현재 위치로 이동 (`panTo`)
   - 줌 레벨 5로 설정

2. **줌 인/아웃 버튼**
   - 줌 레벨 1씩 증가/감소
   - 최소 레벨 1, 최대 레벨 14
   - 150ms 쓰로틀링 적용 (빠른 조작 시 성능 최적화)

3. **핀치 줌**
   - Bottom Sheet가 열려있으면 비활성화
   - 기본적으로 활성화 (`scrollwheel: true`)

4. **지도 드래그**
   - Bottom Sheet가 열려있으면 비활성화
   - 기본적으로 활성화 (`draggable: true`)
   - 드래그 시작/종료 이벤트로 핀 클릭과 구분

---

### 1.7 사용 방법 모달

**사용자 액션:**
- 도움말 버튼(왼쪽 하단) 클릭
- 모달 내 확인 버튼 클릭 또는 X 버튼 클릭

**웹사이트 반응:**
- 모달 오버레이 표시/숨김
- 사용 방법 5단계 안내 표시

---

## 2. 정보 요소 분석

### 2.1 지도 화면 정보 요소

#### 상단 영역 (플로팅)
- **검색창**
  - 검색 아이콘 (왼쪽)
  - 입력 필드: "목적지를 검색하세요" 플레이스홀더
  - 삭제 버튼 (X 아이콘, 입력값이 있을 때만 표시)
  - 자동완성 드롭다운 (검색 결과 목록)

- **필터 버튼 3개**
  - `[주차무료]` - 활성화 시 파란색 배경
  - `[지상]` - 활성화 시 파란색 배경
  - `[100kW 이상]` - 활성화 시 파란색 배경

- **에러 알림 배너** (조건부 표시)
  - API 에러: 빨간색 배경
  - 위치 에러: 노란색 배경
  - 닫기 버튼 포함

#### 지도 영역
- **충전소 핀 (Marker)**
  - 가격 정보 표시 (최저가 `minPrice`)
  - 최저가 핀: 가격 텍스트 빨간색, 별 뱃지(★)
  - 선택된 핀: 파란색 테두리, 크기 1.3배 확대
  - 흰색 배경 카드 형태, 그림자 효과

- **사용자 위치 마커**
  - 파란색 물방울 모양 핀
  - 상단 중앙 흰색 원 표시
  - z-index 40 (충전소 핀보다 위에 표시)

#### 하단 컨트롤 영역
- **왼쪽 하단**
  - 도움말 버튼 (흰색 원, 물음표 아이콘)
  - 현위치 버튼 (파란색 원, 나침반 아이콘)

- **오른쪽 하단**
  - 줌 인 버튼 (흰색 원, + 아이콘)
  - 줌 아웃 버튼 (흰색 원, - 아이콘)

---

### 2.2 Bottom Sheet 정보 요소

**헤더 영역:**
- 드래그 핸들 (회색 막대)
- 닫기 버튼 (X 아이콘, 우측 상단)

**내용 영역 (스크롤 가능):**

1. **충전소 이름 및 태그**
   - 충전소 이름 (큰 글씨, 25px)
   - 태그: `[주차무료]` (파란색), `[지상]` (초록색)

2. **충전기 현황**
   - 라벨: "충전기 현황" (번개 아이콘)
   - 정보 박스:
     - 급속: "대기 N대 / 전체 M대" (대기 가능 시 초록색, 불가 시 빨간색)
     - 초급속: "대기 N대 / 전체 M대" (대기 가능 시 초록색, 불가 시 빨간색)
   - 경고 메시지: "⚠️ 모든 충전기 사용 중" (전부 사용 중일 때만, 빨간색 박스)

3. **요금 정보**
   - 라벨: "요금" (돈 아이콘)
   - 정보 박스: "{가격}원 /kWh" (노란색 배경)

4. **위치 정보**
   - 라벨: "위치" (위치 아이콘)
   - 정보 박스:
     - 주소 (큰 글씨)
     - 상세 위치 (작은 글씨, 회색)

5. **길안내 버튼**
   - 파란색 배경, 흰색 텍스트
   - 길안내 아이콘 포함

---

### 2.3 데이터 소스별 정보 요소

#### CSV 데이터 (정적 데이터)
- `region`: 지역명
- `station_name`: 충전소명
- `Promotion Price`: 프로모션 가격
- `promo_statId`: 충전소 ID (API 연동 키)
- `promo_chgerId`: 충전기 ID (API 연동 키)
- `type`: 충전기 타입
- `speed(kwh)`: 충전 속도
- `address`: 주소
- `location_detail`: 상세 위치
- `lati`, `longi`: 좌표
- `First_floor`: 지상 여부 (TRUE/FALSE)
- `is_fast`: 초급속 여부 (TRUE/FALSE)
- `parking_free`: 주차 무료 여부 (TRUE/FALSE)

#### API 데이터 (동적 데이터)
- `statId`: 충전소 ID
- `chgerId`: 충전기 ID
- `statNm`: 충전소명
- `addr`: 주소
- `location`: 상세 위치
- `stat`: 충전기 상태 코드 (`"2"` = 충전 대기)
- `chgerType`: 충전기 타입

---

## 3. 데이터 처리 흐름

### 3.1 초기 로딩 흐름

```
[1] 앱 시작
    ↓
[2] CSV 파일 로드 (/stations.csv)
    ↓
[3] CSV 파싱 (parseCSVData)
    - 쉼표 분리, 따옴표 처리
    - 각 행을 CSVRow 타입으로 변환
    ↓
[4] 충전소 그룹화
    - promo_statId 기준으로 그룹화
    - 같은 충전소의 여러 충전기 정보를 하나의 ChargerStation으로 병합
    ↓
[5] 데이터 변환
    - 문자열 → 숫자 변환 (가격, 좌표, 속도)
    - 문자열 → 불리언 변환 (TRUE/FALSE → boolean)
    - 최저가 계산 (minPrice)
    ↓
[6] ChargerStation[] 배열 생성
    ↓
[7] 지도에 핀 렌더링 (증분 업데이트 방식)
```

---

### 3.2 필터링 흐름

```
[1] 필터 버튼 클릭
    ↓
[2] filters state 업데이트
    ↓
[3] useMemo 트리거 (filteredStations 재계산)
    ↓
[4] AND 조건 필터링
    - parkingFree 필터: parkingFree === true
    - firstFloor 필터: firstFloor === true
    - highSpeed 필터: hasFastCharger === true
    ↓
[5] 필터링된 stations 배열 반환
    ↓
[6] MapView 컴포넌트 리렌더링
    ↓
[7] 증분 업데이트 로직 실행
    - 제거할 핀 식별 (기존에는 있지만 새 배열에는 없음)
    - 추가할 핀 식별 (새 배열에는 있지만 기존에는 없음)
    - 변경된 핀만 업데이트
    ↓
[8] 지도에 핀 업데이트
```

---

### 3.3 충전소 선택 및 API 호출 흐름

```
[1] 사용자가 핀 클릭
    ↓
[2] 드래그 감지 (10px 이상 이동 시 스킵)
    ↓
[3] 중앙 영역 클릭 확인 (50% 영역)
    ↓
[4] 즉시 UI 피드백 (핀 선택 상태 업데이트)
    ↓
[5] 캐시 체크
    - apiCacheRef에서 statId 조회
    - 5분 이내 데이터가 있으면 → [13] 캐시 데이터 사용
    - 없으면 → [6] 계속
    ↓
[6] 중복 요청 체크
    - pendingRequestsRef에서 진행 중인 요청 확인
    - 있으면 → [12] Promise 재사용
    - 없으면 → [7] 계속
    ↓
[7] API 요청 시작
    - requestPromise 생성
    - pendingRequestsRef에 저장
    ↓
[8] 서버 프록시 호출
    GET /api/charger-info?statId={statId}
    ↓
[9] 서버에서 환경부 API 호출
    GET http://apis.data.go.kr/B552584/EvCharger/getChargerInfo
    - serviceKey: 인코딩된 API 키 (URL에 직접 삽입)
    - statId: 충전소 ID
    ↓
[10] API 응답 처리
    - JSON 파싱
    - items.item 배열 추출
    - 에러 처리 (resultCode !== '00')
    ↓
[11] 캐시 저장
    - apiCacheRef에 데이터 저장 (timestamp 포함)
    ↓
[12] 데이터 매핑 및 집계
    - CSV의 chargers 배열과 API 응답 매핑
    - chgerId 기준으로 매칭
    - stat === "2"인 충전기 수 계산 (대기 가능)
    - 초급속/급속 구분
    ↓
[13] 상태 집계 객체 생성 (ChargerStatusSummary)
    {
      fastChargers: { available: N, total: M },
      regularChargers: { available: N, total: M },
      allInUse: boolean
    }
    ↓
[14] MergedStation 객체 생성
    - ChargerStation + statusSummary 병합
    ↓
[15] selectedStation state 업데이트
    ↓
[16] Bottom Sheet 표시
```

---

### 3.4 검색 흐름

```
[1] 사용자가 검색어 입력 (2자 이상)
    ↓
[2] 디바운싱 (500ms 대기)
    ↓
[3] 카카오맵 키워드 검색 API 호출
    GET https://dapi.kakao.com/v2/local/search/keyword.json
    - query: 검색어
    - size: 10
    ↓
[4] 응답 파싱
    - documents 배열 추출
    - 각 결과를 SearchResult 타입으로 변환
    {
      name: place_name,
      lat: y (위도),
      lng: x (경도),
      address: address_name
    }
    ↓
[5] 자동완성 목록 표시
    ↓
[6] 사용자가 검색 결과 선택
    ↓
[7] 검색창 값 업데이트
    ↓
[8] 모바일 키보드 닫기 (blur)
    ↓
[9] 지도 중심 이동
    - mapCenter state 업데이트
    - 줌 레벨 5로 설정
    ↓
[10] 지도 애니메이션
    - panTo로 중심 이동
    - 100ms 디바운싱 적용
```

---

### 3.5 데이터 구조 변환

#### CSV → ChargerStation 변환

```
CSVRow (단일 행)
    ↓
그룹화 (promo_statId 기준)
    ↓
ChargerStation (충전소 단위)
{
  id: "HM000117",
  stationName: "창원엠포리움빌딩 급속",
  region: "경남",
  address: "경상남도 창원시...",
  locationDetail: "지하2층 B02기둥",
  latitude: 35.2228599,
  longitude: 128.681235,
  promotionPrice: 299,
  firstFloor: false,
  parkingFree: false,
  chargers: [
    { chgerId: "02", type: "초급속", speed: 100, isFast: true },
    { chgerId: "01", type: "초급속", speed: 100, isFast: true }
  ],
  hasFastCharger: true,
  minPrice: 299
}
```

#### CSV + API → MergedStation 변환

```
ChargerStation (CSV 기반)
    +
ChargerInfoItem[] (API 응답)
    ↓
매핑 (chgerId 기준)
    ↓
집계 (aggregateChargerStatus)
    ↓
MergedStation
{
  ...ChargerStation (모든 속성)
  +
  statusSummary?: {
    fastChargers: { available: 1, total: 2 },
    regularChargers: { available: 0, total: 1 },
    allInUse: false
  }
}
```

---

### 3.6 성능 최적화 전략

#### 1. API 캐싱
- **목적**: 동일 충전소 재조회 시 API 호출 방지
- **구현**: `apiCacheRef` (Map 자료구조)
- **유효 기간**: 5분 (300,000ms)
- **효과**: 60-80% API 호출 절감

#### 2. 중복 요청 방지
- **목적**: 빠른 연속 클릭 시 중복 API 호출 방지
- **구현**: `pendingRequestsRef` (Map<statId, Promise>)
- **효과**: 동시 요청 방지, 네트워크 비용 절감

#### 3. 증분 업데이트
- **목적**: 불필요한 DOM 조작 최소화
- **구현**: `markersMapRef` (마커 캐시)
- **효과**: 렌더링 시간 50% 단축

#### 4. 메모이제이션
- **필터링 결과**: `useMemo`로 재계산 방지
- **최저가 계산**: `useMemo`로 한 번만 계산
- **콜백 함수**: `useCallback`으로 참조 고정

#### 5. 디바운싱/쓰로틀링
- **검색어 입력**: 500ms 디바운싱
- **지도 중심 변경**: 100ms 디바운싱
- **줌 레벨 변경**: 150ms 쓰로틀링

#### 6. 이벤트 리스너 관리
- **목적**: 메모리 누수 방지
- **구현**: `eventListenersRef`로 추적, cleanup 함수로 제거
- **효과**: 장시간 사용 시에도 성능 유지

---

### 3.7 에러 처리 흐름

#### 위치 정보 에러
```
[1] navigator.geolocation.getCurrentPosition() 호출
    ↓
[2] 에러 발생
    ↓
[3] 에러 코드별 메시지 생성
    - PERMISSION_DENIED: "위치 권한이 거부되었습니다."
    - POSITION_UNAVAILABLE: "위치 정보를 사용할 수 없습니다."
    - TIMEOUT: "위치 정보 요청 시간이 초과되었습니다."
    ↓
[4] locationError state 업데이트
    ↓
[5] 상단에 노란색 알림 배너 표시
    ↓
[6] 기본 위치로 지도 렌더링
```

#### API 호출 에러
```
[1] fetchChargerInfo() 호출
    ↓
[2] 타임아웃 (10초) 또는 네트워크 에러
    ↓
[3] 에러 타입별 메시지 생성
    - 타임아웃: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요."
    - 기타: "충전기 상태를 불러올 수 없습니다. 네트워크 연결을 확인해주세요."
    ↓
[4] apiError state 업데이트
    ↓
[5] 상단에 빨간색 알림 배너 표시
    ↓
[6] 3초 후 자동 제거
    ↓
[7] 기본 정보는 표시 (statusSummary 없이)
```

---

## 4. 주요 개선 포인트 (참고)

### 현재 미구현 기능
1. 검색 후 가장 가까운 핀 자동 포커스
2. 앱 최초 진입 시 사용 방법 모달 자동 표시

### 성능 최적화 적용됨
1. ✅ API 캐싱 (5분)
2. ✅ 중복 요청 방지
3. ✅ 증분 업데이트
4. ✅ 메모이제이션
5. ✅ 디바운싱/쓰로틀링
6. ✅ 이벤트 리스너 cleanup

### 코드 구조
- **컴포넌트**: React 함수형 컴포넌트, Hooks 사용
- **상태 관리**: useState, useRef
- **비동기 처리**: async/await
- **타입 안정성**: TypeScript
- **스타일링**: Tailwind CSS + 인라인 스타일

---

## 5. 데이터 흐름 다이어그램 요약

```
[CSV 파일] → [파싱] → [그룹화] → [ChargerStation[]]
                                              ↓
[지도 렌더링] ← [필터링] ← [필터 변경]
                                              ↓
[핀 클릭] → [캐시 체크] → [API 호출] → [상태 집계]
                                              ↓
[Bottom Sheet] ← [MergedStation]
```

---

**문서 작성일**: 2024년
**프로젝트 버전**: MVP v2.1
**분석 기준**: `/Users/reo.kim/Desktop/map_github/map_2/electro_search`

