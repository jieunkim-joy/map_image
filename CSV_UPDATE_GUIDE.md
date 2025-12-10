# CSV 업데이트 및 택시기사 전용 할인 태그 추가 가이드

## 📋 작업 개요

새로운 CSV 파일에 `only_taxi` 열이 추가되었습니다. 이 열을 활용하여 택시기사 전용 할인 충전소를 구분하고 태그를 표시합니다.

## 🔍 CSV 파일 구조 분석

### 기존 CSV 구조
```
region, station_name, Promotion Price, promo_statId, promo_chgerId, type, speed(kwh), 
address, location_detail, lati, longi, First_floor, is_fast, parking_free
```

### 새로운 CSV 구조
```
region, station_name, Promotion Price, promo_statId, promo_chgerId, type, speed(kwh), 
address, location_detail, lati, longi, First_floor, is_fast, parking_free, only_taxi
```

### `only_taxi` 열 정보
- **위치**: 15번째 열 (index: 14)
- **값 형식**: `TRUE` 또는 `FALSE` (대문자)
- **의미**: 
  - `TRUE`: 택시기사 전용 할인 요금 제공
  - `FALSE`: 일반 유저도 이용 가능한 프로모션 가격

## 📝 작업 단계

### 1단계: CSV 파일 교체

**작업 내용:**
- 새 CSV 파일을 `public/stations.csv`로 복사

**파일 경로:**
- 원본: `/Users/reo.kim/Desktop/맵 지도 이미지 제작/택시 프로모션 대상_지도제작용_수정(251209).csv`
- 대상: `/Users/reo.kim/Desktop/맵 지도 이미지 제작/map_2/electro_search/public/stations.csv`

**명령어:**
```bash
cp "/Users/reo.kim/Desktop/맵 지도 이미지 제작/택시 프로모션 대상_지도제작용_수정(251209).csv" \
   "/Users/reo.kim/Desktop/맵 지도 이미지 제작/map_2/electro_search/public/stations.csv"
```

### 2단계: TypeScript 타입 정의 업데이트

**파일**: `src/types.ts`

**수정 내용:**

1. **CSVRow 인터페이스에 `only_taxi` 필드 추가**
```typescript
export interface CSVRow {
  // ... 기존 필드들 ...
  parking_free: string;
  only_taxi: string;  // ← 추가
}
```

2. **ChargerStation 인터페이스에 `onlyTaxi` 필드 추가**
```typescript
export interface ChargerStation {
  // ... 기존 필드들 ...
  minPrice: number;
  onlyTaxi: boolean;  // ← 추가
}
```

### 3단계: CSV 파싱 로직 업데이트

**파일**: `src/utils.ts`

**수정 내용:**

1. **CSV 파싱 부분에서 `only_taxi` 값 읽기**
   - 현재 `values[13]`까지 읽고 있음
   - `values[14]`를 추가로 읽어야 함

2. **그룹화 로직에서 `onlyTaxi` 값 설정**
   - 충전소 그룹화 시 `only_taxi` 값을 boolean으로 변환하여 저장
   - 같은 충전소의 여러 충전기가 있을 경우, 하나라도 `TRUE`면 `onlyTaxi: true`로 설정

**수정 예시:**
```typescript
// CSVRow 생성 시
const row: CSVRow = {
  // ... 기존 필드들 ...
  parking_free: values[13] || '',
  only_taxi: values[14] || 'FALSE',  // ← 추가
};

// ChargerStation 생성 시
stationMap.set(statId, {
  // ... 기존 필드들 ...
  onlyTaxi: false,  // 초기값, 나중에 업데이트
});

// 충전기 추가 시
const isOnlyTaxi = parseBoolean(row.only_taxi);
if (isOnlyTaxi) {
  station.onlyTaxi = true;  // 하나라도 TRUE면 true
}
```

### 4단계: UI에 태그 표시 (선택사항)

현재 프로젝트는 이미지 캡쳐용이므로, 태그 표시는 선택사항입니다.

**옵션 1: 핀에 작은 배지 표시**
- 택시기사 전용 충전소 핀에 작은 배지 추가
- 예: 핀 위에 "택시" 또는 "TAXI" 텍스트 배지

**옵션 2: 데이터만 준비 (나중에 활용)**
- 데이터만 파싱하여 저장
- UI 표시는 나중에 필요할 때 추가

## 🔧 구체적인 코드 수정 사항

### `src/types.ts` 수정

```typescript
// CSVRow에 추가
export interface CSVRow {
  // ... 기존 필드들 ...
  parking_free: string;
  only_taxi: string;  // ← 추가
}

// ChargerStation에 추가
export interface ChargerStation {
  // ... 기존 필드들 ...
  minPrice: number;
  onlyTaxi: boolean;  // ← 추가
}
```

### `src/utils.ts` 수정

```typescript
// 1. CSVRow 생성 부분 (약 54-69줄)
const row: CSVRow = {
  // ... 기존 필드들 ...
  parking_free: values[13] || '',
  only_taxi: values[14] || 'FALSE',  // ← 추가
};

// 2. ChargerStation 초기 생성 부분 (약 86-100줄)
stationMap.set(statId, {
  // ... 기존 필드들 ...
  onlyTaxi: false,  // ← 추가 (초기값)
});

// 3. 충전기 추가 및 onlyTaxi 업데이트 부분 (약 103-116줄 이후)
const isOnlyTaxi = parseBoolean(row.only_taxi);
if (isOnlyTaxi) {
  station.onlyTaxi = true;  // ← 추가
}
```

## ✅ 검증 방법

1. **CSV 파싱 확인**
   - 브라우저 콘솔에서 `stations` 배열 확인
   - `onlyTaxi: true`인 충전소가 있는지 확인

2. **데이터 정확성 확인**
   - CSV 파일의 `only_taxi` 값과 파싱된 `onlyTaxi` 값이 일치하는지 확인

3. **UI 표시 확인** (태그를 추가한 경우)
   - 택시기사 전용 충전소에 태그가 표시되는지 확인

## 📌 주의사항

1. **CSV 파일 인코딩**
   - CSV 파일이 UTF-8 인코딩인지 확인
   - 한글이 깨지지 않는지 확인

2. **값 형식**
   - `only_taxi` 값은 대문자 `TRUE`/`FALSE` 형식
   - `parseBoolean` 함수가 이미 `TRUE`를 `true`로 변환하므로 그대로 사용 가능

3. **그룹화 로직**
   - 같은 충전소(`statId`)에 여러 충전기가 있을 경우
   - 하나의 충전기라도 `only_taxi: TRUE`이면 해당 충전소는 `onlyTaxi: true`
   - 모든 충전기가 `FALSE`일 때만 `onlyTaxi: false`

4. **빈 값 처리**
   - `only_taxi` 값이 없는 경우 기본값 `'FALSE'` 사용

## 🚀 다음 단계

1. CSV 파일 교체
2. 타입 정의 업데이트
3. 파싱 로직 업데이트
4. 테스트 및 검증
5. (선택) UI에 태그 표시

