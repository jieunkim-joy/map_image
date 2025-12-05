# Railway 배포 문제 해결 가이드

## 카카오맵 SDK 로드 실패 오류 해결

### 증상
```
카카오맵 SDK 스크립트 로드 실패
```

### 해결 방법

#### 1. Railway 환경변수 확인

Railway 대시보드에서 다음을 확인하세요:

1. **Variables 탭**으로 이동
2. 다음 환경변수가 설정되어 있는지 확인:
   - `VITE_KAKAO_MAP_APP_KEY` (필수)
   - 값이 올바르게 입력되어 있는지 확인 (공백, 따옴표 없이)

#### 2. 카카오 개발자 콘솔 설정 확인

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 앱 설정 > 플랫폼
3. **Web 플랫폼** 등록 확인:
   - Railway 도메인 추가 (예: `your-app.railway.app`)
   - 또는 `*` (모든 도메인 허용) - 개발용
4. **JavaScript 키** 확인:
   - 앱 키 > JavaScript 키 복사
   - 이 키를 `VITE_KAKAO_MAP_APP_KEY`에 설정

#### 3. 환경변수 형식 확인

✅ **올바른 형식:**
```
VITE_KAKAO_MAP_APP_KEY=dc9b8bd337a4bbcdd54692e5c2a6a044
```

❌ **잘못된 형식:**
```
VITE_KAKAO_MAP_APP_KEY="dc9b8bd337a4bbcdd54692e5c2a6a044"  # 따옴표 제거
VITE_KAKAO_MAP_APP_KEY = dc9b8bd337a4bbcdd54692e5c2a6a044  # 공백 제거
```

#### 4. 재배포

환경변수를 변경한 후:
1. Railway에서 **Redeploy** 클릭
2. 또는 새 커밋을 푸시하여 자동 재배포

#### 5. 브라우저 콘솔 확인

배포 후 브라우저 개발자 도구 콘솔에서 다음을 확인:

```javascript
// 환경변수 확인 로그
🔍 환경변수 확인: {
  hasKakaoMapKey: true,  // true여야 함
  keyLength: 40,         // API 키 길이
  keyPrefix: "dc9b8bd337" // API 키 앞 10자
}
```

#### 6. 일반적인 문제들

**문제: API 키가 undefined**
- Railway에서 환경변수 이름이 정확한지 확인 (`VITE_KAKAO_MAP_APP_KEY`)
- 재배포 필요

**문제: SDK 스크립트 로드 실패**
- 카카오 개발자 콘솔에서 플랫폼 도메인 설정 확인
- JavaScript 키가 활성화되어 있는지 확인
- API 키가 올바른지 확인

**문제: CORS 오류**
- 카카오 개발자 콘솔에서 Railway 도메인을 플랫폼에 추가

### 디버깅 팁

1. **로컬에서 테스트:**
   ```bash
   # .env 파일 생성
   VITE_KAKAO_MAP_APP_KEY=your_key_here
   
   # 개발 서버 실행
   npm run dev
   ```

2. **Railway 로그 확인:**
   - Railway 대시보드 > Deployments > 로그 확인
   - 빌드 과정에서 환경변수가 제대로 주입되는지 확인

3. **브라우저 네트워크 탭:**
   - 개발자 도구 > Network 탭
   - `sdk.js` 요청이 실패하는지 확인
   - 응답 상태 코드 확인 (200이어야 함)

