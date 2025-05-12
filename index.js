const express = require('express');
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 라우트 설정
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/exam', (req, res) => {
    res.render('exam');
});

app.post('/result', (req, res) => {
    const answers = req.body;
    let score = 0;
    
    // 정답 체크 (예시)
    if (answers.q1 === '3') score += 50; // 시설물의 관리와 운영이 정답
    if (answers.q2 === '1') score += 50; // 국가배상법이 정답
    
    const message = score >= 80 ? '합격을 축하합니다!' : '불합격입니다. 다시 도전해주세요.';
    
    res.render('result', { score, message });
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 