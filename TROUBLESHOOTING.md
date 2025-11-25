# 문제 해결 가이드

## MIME type 에러 해결 방법

### 증상
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"
```

### 해결 방법

1. **의존성 설치 확인**
   ```bash
   cd map_code
   npm install
   ```

2. **Vite 개발 서버 실행**
   ```bash
   npm run dev
   ```
   
   ⚠️ **중요**: 브라우저에서 `http://localhost:3000`으로 접속해야 합니다.
   파일을 직접 열면 (file://) MIME type 에러가 발생합니다.

3. **서버 재시작**
   - 서버를 중지 (Ctrl+C)
   - `node_modules` 폴더 삭제
   - `npm install` 재실행
   - `npm run dev` 재실행

4. **캐시 클리어**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

5. **포트 충돌 확인**
   - 3000번 포트가 사용 중인지 확인
   - 다른 포트 사용: `npm run dev -- --port 3001`

