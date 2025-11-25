# 🚀 시작하기

## ✅ 현재 상태 확인

현재 터미널이 **이미 `map_code` 폴더 안**에 있습니다!

따라서 `cd map_code` 명령어를 실행할 필요가 없습니다.

## 실행 방법

### 옵션 1: 바로 실행 (권장)
```bash
npm run dev
```

### 옵션 2: 다른 터미널에서 시작하는 경우
```bash
cd /Users/reo.kim/Desktop/new_map_4/map_code
npm run dev
```

## 확인 사항

현재 위치 확인:
```bash
pwd
```

이 명령어가 다음을 출력하면 정상입니다:
```
/Users/reo.kim/Desktop/new_map_4/map_code
```

## 문제 해결

### "cd: no such file or directory: map_code" 에러
→ 이미 `map_code` 폴더 안에 있으므로 `cd map_code` 명령어를 실행하지 마세요!

### "package.json을 찾을 수 없습니다" 에러
→ `map_code` 폴더가 아닌 다른 곳에서 실행하고 있는 것입니다.
→ 다음 명령어로 올바른 위치로 이동하세요:
```bash
cd /Users/reo.kim/Desktop/new_map_4/map_code
```

## 실행 확인

`npm run dev` 실행 후 터미널에 다음과 같은 메시지가 표시됩니다:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

이제 브라우저에서 `http://localhost:3000`으로 접속하세요!

