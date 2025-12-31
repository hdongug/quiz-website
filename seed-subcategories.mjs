import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log('서브 카테고리 데이터 시딩 시작...');

  // 기존 스포츠 카테고리 ID 확인
  const [existingCategories] = await conn.query(
    "SELECT id FROM categories WHERE name = '스포츠'"
  );

  let sportsId;
  if (existingCategories.length > 0) {
    sportsId = existingCategories[0].id;
    console.log(`기존 스포츠 카테고리 ID: ${sportsId}`);
    
    // 기존 스포츠 카테고리를 부모 카테고리로 유지
  } else {
    // 스포츠 카테고리가 없으면 생성
    const [result] = await conn.query(
      "INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)",
      ['스포츠', '스포츠에 관한 흥미로운 퀴즈', '⚽', '#10b981']
    );
    sportsId = result.insertId;
    console.log(`새 스포츠 카테고리 생성 ID: ${sportsId}`);
  }

  // 해외 스포츠 서브 카테고리
  const [overseasResult] = await conn.query(
    "INSERT INTO categories (name, description, icon, color, parentId) VALUES (?, ?, ?, ?, ?)",
    ['해외 스포츠', '세계 스포츠에 관한 퀴즈', '🌍', '#3b82f6', sportsId]
  );
  const overseasId = overseasResult.insertId;
  console.log(`해외 스포츠 카테고리 생성 ID: ${overseasId}`);

  // 국내 스포츠 서브 카테고리
  const [domesticResult] = await conn.query(
    "INSERT INTO categories (name, description, icon, color, parentId) VALUES (?, ?, ?, ?, ?)",
    ['국내 스포츠', '한국 스포츠에 관한 퀴즈', '🇰🇷', '#ef4444', sportsId]
  );
  const domesticId = domesticResult.insertId;
  console.log(`국내 스포츠 카테고리 생성 ID: ${domesticId}`);

  // 해외 스포츠 종목별 서브 카테고리
  const overseasSports = [
    { name: '해외 축구', icon: '⚽', description: '세계 축구 리그와 선수들' },
    { name: '해외 야구', icon: '⚾', description: 'MLB와 세계 야구' },
    { name: '해외 농구', icon: '🏀', description: 'NBA와 세계 농구' },
    { name: '해외 테니스', icon: '🎾', description: '세계 테니스 대회와 선수들' },
  ];

  for (const sport of overseasSports) {
    const [result] = await conn.query(
      "INSERT INTO categories (name, description, icon, color, parentId) VALUES (?, ?, ?, ?, ?)",
      [sport.name, sport.description, sport.icon, '#3b82f6', overseasId]
    );
    console.log(`${sport.name} 카테고리 생성 ID: ${result.insertId}`);
  }

  // 국내 스포츠 종목별 서브 카테고리
  const domesticSports = [
    { name: '국내 축구', icon: '⚽', description: 'K리그와 한국 축구' },
    { name: '국내 야구', icon: '⚾', description: 'KBO와 한국 야구' },
    { name: '국내 농구', icon: '🏀', description: 'KBL과 한국 농구' },
    { name: '국내 배구', icon: '🏐', description: 'V리그와 한국 배구' },
  ];

  for (const sport of domesticSports) {
    const [result] = await conn.query(
      "INSERT INTO categories (name, description, icon, color, parentId) VALUES (?, ?, ?, ?, ?)",
      [sport.name, sport.description, sport.icon, '#ef4444', domesticId]
    );
    console.log(`${sport.name} 카테고리 생성 ID: ${result.insertId}`);
  }

  // 각 서브 카테고리에 샘플 퀴즈 추가
  console.log('\n서브 카테고리별 샘플 퀴즈 추가 중...');

  // 해외 축구 퀴즈
  const [overseasSoccerCat] = await conn.query(
    "SELECT id FROM categories WHERE name = '해외 축구'"
  );
  if (overseasSoccerCat.length > 0) {
    const soccerQuestions = [
      {
        question: '2022 FIFA 월드컵 우승국은?',
        correct: '아르헨티나',
        wrong: ['브라질', '프랑스', '독일'],
        explanation: '아르헨티나가 카타르에서 열린 2022 FIFA 월드컵에서 우승했습니다.',
        difficulty: 'easy'
      },
      {
        question: '리오넬 메시가 뛰고 있는 클럽은? (2024년 기준)',
        correct: '인터 마이애미',
        wrong: ['바르셀로나', 'PSG', '맨체스터 시티'],
        explanation: '메시는 2023년부터 미국 MLS의 인터 마이애미에서 뛰고 있습니다.',
        difficulty: 'medium'
      },
      {
        question: 'UEFA 챔피언스리그 최다 우승 팀은?',
        correct: '레알 마드리드',
        wrong: ['바르셀로나', 'AC 밀란', '리버풀'],
        explanation: '레알 마드리드는 UEFA 챔피언스리그를 14회 우승한 최다 우승 팀입니다.',
        difficulty: 'medium'
      },
      {
        question: '프리미어리그는 어느 나라의 축구 리그인가?',
        correct: '영국',
        wrong: ['스페인', '이탈리아', '독일'],
        explanation: '프리미어리그는 영국(잉글랜드)의 최상위 축구 리그입니다.',
        difficulty: 'easy'
      },
      {
        question: '발롱도르를 가장 많이 수상한 선수는?',
        correct: '리오넬 메시',
        wrong: ['크리스티아누 호날두', '미셸 플라티니', '요한 크루이프'],
        explanation: '리오넬 메시는 2023년까지 8회 발롱도르를 수상했습니다.',
        difficulty: 'easy'
      },
    ];

    for (const q of soccerQuestions) {
      await conn.query(
        "INSERT INTO questions (categoryId, question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [overseasSoccerCat[0].id, q.question, q.correct, q.wrong[0], q.wrong[1], q.wrong[2], q.explanation, q.difficulty]
      );
    }
    console.log(`해외 축구 퀴즈 ${soccerQuestions.length}개 추가 완료`);
  }

  // 국내 축구 퀴즈
  const [domesticSoccerCat] = await conn.query(
    "SELECT id FROM categories WHERE name = '국내 축구'"
  );
  if (domesticSoccerCat.length > 0) {
    const kSoccerQuestions = [
      {
        question: 'K리그1의 최다 우승 팀은?',
        correct: '전북 현대',
        wrong: ['수원 삼성', '포항 스틸러스', '울산 현대'],
        explanation: '전북 현대 모터스는 K리그1에서 9회 우승을 차지한 최다 우승 팀입니다.',
        difficulty: 'medium'
      },
      {
        question: '2002 한일 월드컵에서 한국의 최종 순위는?',
        correct: '4위',
        wrong: ['3위', '8위', '16위'],
        explanation: '한국은 2002 월드컵에서 역사적인 4강 진출을 이루었습니다.',
        difficulty: 'easy'
      },
      {
        question: '손흥민이 소속된 프리미어리그 팀은?',
        correct: '토트넘',
        wrong: ['첼시', '아스널', '맨체스터 유나이티드'],
        explanation: '손흥민은 2015년부터 토트넘 핫스퍼에서 활약하고 있습니다.',
        difficulty: 'easy'
      },
      {
        question: 'K리그는 몇 년에 창설되었나?',
        correct: '1983년',
        wrong: ['1980년', '1990년', '1995년'],
        explanation: 'K리그는 1983년에 창설되어 아시아에서 가장 오래된 프로 축구 리그 중 하나입니다.',
        difficulty: 'hard'
      },
      {
        question: '2022 카타르 월드컵에서 한국의 16강 진출을 결정지은 선수는?',
        correct: '황희찬',
        wrong: ['손흥민', '이강인', '김영권'],
        explanation: '황희찬이 포르투갈전에서 결승골을 넣어 한국의 16강 진출을 이끌었습니다.',
        difficulty: 'medium'
      },
    ];

    for (const q of kSoccerQuestions) {
      await conn.query(
        "INSERT INTO questions (categoryId, question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [domesticSoccerCat[0].id, q.question, q.correct, q.wrong[0], q.wrong[1], q.wrong[2], q.explanation, q.difficulty]
      );
    }
    console.log(`국내 축구 퀴즈 ${kSoccerQuestions.length}개 추가 완료`);
  }

  // 해외 야구 퀴즈
  const [overseasBaseballCat] = await conn.query(
    "SELECT id FROM categories WHERE name = '해외 야구'"
  );
  if (overseasBaseballCat.length > 0) {
    const mlbQuestions = [
      {
        question: 'MLB에서 가장 많은 월드 시리즈 우승을 차지한 팀은?',
        correct: '뉴욕 양키스',
        wrong: ['보스턴 레드삭스', 'LA 다저스', '세인트루이스 카디널스'],
        explanation: '뉴욕 양키스는 27회의 월드 시리즈 우승을 차지한 최다 우승 팀입니다.',
        difficulty: 'medium'
      },
      {
        question: '베이브 루스가 활약한 팀은?',
        correct: '뉴욕 양키스',
        wrong: ['보스턴 레드삭스', '시카고 컵스', 'LA 다저스'],
        explanation: '베이브 루스는 보스턴에서 시작했지만 뉴욕 양키스에서 전설이 되었습니다.',
        difficulty: 'easy'
      },
      {
        question: 'MLB 정규 시즌은 몇 경기인가?',
        correct: '162경기',
        wrong: ['150경기', '180경기', '144경기'],
        explanation: 'MLB 정규 시즌은 팀당 162경기를 치릅니다.',
        difficulty: 'medium'
      },
      {
        question: '2023년 월드 시리즈 우승 팀은?',
        correct: '텍사스 레인저스',
        wrong: ['애리조나 다이아몬드백스', '휴스턴 애스트로스', '애틀랜타 브레이브스'],
        explanation: '텍사스 레인저스가 2023년 월드 시리즈에서 우승했습니다.',
        difficulty: 'medium'
      },
      {
        question: '오타니 쇼헤이가 2024년 시즌을 뛰는 팀은?',
        correct: 'LA 다저스',
        wrong: ['LA 에인절스', '뉴욕 양키스', '샌디에이고 파드리스'],
        explanation: '오타니 쇼헤이는 2024년부터 LA 다저스에서 뛰고 있습니다.',
        difficulty: 'easy'
      },
    ];

    for (const q of mlbQuestions) {
      await conn.query(
        "INSERT INTO questions (categoryId, question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [overseasBaseballCat[0].id, q.question, q.correct, q.wrong[0], q.wrong[1], q.wrong[2], q.explanation, q.difficulty]
      );
    }
    console.log(`해외 야구 퀴즈 ${mlbQuestions.length}개 추가 완료`);
  }

  // 국내 야구 퀴즈
  const [domesticBaseballCat] = await conn.query(
    "SELECT id FROM categories WHERE name = '국내 야구'"
  );
  if (domesticBaseballCat.length > 0) {
    const kboQuestions = [
      {
        question: 'KBO 리그 최다 우승 팀은?',
        correct: '삼성 라이온즈',
        wrong: ['두산 베어스', 'SK 와이번스', 'LG 트윈스'],
        explanation: '삼성 라이온즈는 KBO 리그에서 8회 우승을 차지한 최다 우승 팀입니다.',
        difficulty: 'medium'
      },
      {
        question: 'KBO 리그는 몇 년에 출범했나?',
        correct: '1982년',
        wrong: ['1980년', '1985년', '1990년'],
        explanation: 'KBO 리그는 1982년에 6개 팀으로 출범했습니다.',
        difficulty: 'medium'
      },
      {
        question: '2023년 KBO 정규시즌 우승 팀은?',
        correct: 'LG 트윈스',
        wrong: ['삼성 라이온즈', 'KT 위즈', 'SSG 랜더스'],
        explanation: 'LG 트윈스가 2023년 KBO 정규시즌에서 우승했습니다.',
        difficulty: 'medium'
      },
      {
        question: 'KBO 리그의 정규 시즌은 몇 경기인가?',
        correct: '144경기',
        wrong: ['130경기', '150경기', '162경기'],
        explanation: 'KBO 리그는 팀당 144경기의 정규 시즌을 치릅니다.',
        difficulty: 'hard'
      },
      {
        question: '한국 야구 국가대표팀이 WBC에서 거둔 최고 성적은?',
        correct: '준우승',
        wrong: ['우승', '4강', '8강'],
        explanation: '한국은 2009년 WBC에서 준우승을 차지했습니다.',
        difficulty: 'medium'
      },
    ];

    for (const q of kboQuestions) {
      await conn.query(
        "INSERT INTO questions (categoryId, question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [domesticBaseballCat[0].id, q.question, q.correct, q.wrong[0], q.wrong[1], q.wrong[2], q.explanation, q.difficulty]
      );
    }
    console.log(`국내 야구 퀴즈 ${kboQuestions.length}개 추가 완료`);
  }

  console.log('\n✅ 서브 카테고리 데이터 시딩 완료!');
} catch (error) {
  console.error('❌ 시딩 중 오류 발생:', error);
} finally {
  await conn.end();
}
