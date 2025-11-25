import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 환경부 API 프록시 엔드포인트
const ENV_API_KEY = process.env.VITE_ENV_API_KEY || '';
const ENV_API_BASE_URL = 'http://apis.data.go.kr/B552584/EvCharger/getChargerInfo';

app.get('/api/charger-info', async (req, res) => {
  try {
    const { statId } = req.query;
    
    if (!statId) {
      return res.status(400).json({ error: 'statId 파라미터가 필요합니다.' });
    }
    
    if (!ENV_API_KEY) {
      console.error('환경부 API 키가 설정되지 않았습니다.');
      return res.status(500).json({ error: '서버 설정 오류: API 키가 없습니다.' });
    }
    
    const apiUrl = `${ENV_API_BASE_URL}?serviceKey=${ENV_API_KEY}&pageNo=1&numOfRows=9999&dataType=JSON&statId=${statId}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`환경부 API 호출 실패: ${response.status}`);
      return res.status(response.status).json({ error: `API 호출 실패: ${response.status}` });
    }
    
    const data = await response.json();
    
    if (data.resultCode !== '00') {
      console.error(`환경부 API 에러: ${data.resultMsg} (코드: ${data.resultCode})`);
      return res.status(400).json({ error: data.resultMsg, code: data.resultCode });
    }
    
    res.json(data.items?.item || []);
  } catch (error) {
    console.error('환경부 API 프록시 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 정적 파일 서빙
app.use(express.static(join(__dirname, 'dist')));

// SPA 라우팅: 모든 경로를 index.html로 리다이렉트
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📦 정적 파일 서빙: ${join(__dirname, 'dist')}`);
  console.log(`🔌 환경부 API 프록시: /api/charger-info`);
});

