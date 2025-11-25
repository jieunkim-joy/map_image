# 빠른 시작 가이드

## ✅ 문제 해결됨!

의존성 설치가 완료되었습니다. 이제 다음 단계를 따라주세요:

## 1. 개발 서버 실행

터미널에서 다음 명령어를 실행하세요:

```bash
cd map_code
npm run dev
```

## 2. 브라우저에서 접속

**중요**: 파일을 직접 열지 마세요!

다음 URL로 접속하세요:
```
http://localhost:3000
```

## 3. 문제 해결

만약 여전히 MIME type 에러가 발생한다면:

### 해결 1: 서버 재시작
```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### 해결 2: 캐시 클리어
```bash
rm -rf node_modules/.vite
npm run dev
```

### 해결 3: 다른 포트 사용
```bash
npm run dev -- --port 3001
```
그리고 `http://localhost:3001`로 접속

## 주의사항

⚠️ **절대 파일을 직접 열지 마세요!** (`file://` 프로토콜)
- 브라우저에서 `index.html`을 직접 열면 MIME type 에러가 발생합니다
- 반드시 Vite 개발 서버를 통해 접속해야 합니다 (`http://localhost:3000`)

## 실행 확인

개발 서버가 정상적으로 실행되면 터미널에 다음과 같은 메시지가 표시됩니다:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

이제 브라우저에서 위 URL로 접속하면 앱이 정상적으로 실행됩니다!

