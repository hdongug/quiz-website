import { drizzle } from "drizzle-orm/mysql2";
import { categories, questions } from "./drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

const seedData = async () => {
  console.log("🌱 Starting quiz data seeding...");

  // Insert categories
  const categoryData = [
    {
      name: "일반 상식",
      description: "다양한 분야의 일반 상식 퀴즈",
      icon: "🌍",
      color: "#00D9FF",
    },
    {
      name: "영화",
      description: "영화와 관련된 재미있는 퀴즈",
      icon: "🎬",
      color: "#FFD700",
    },
    {
      name: "과학",
      description: "과학 지식을 테스트하는 퀴즈",
      icon: "🔬",
      color: "#FF6B9D",
    },
    {
      name: "스포츠",
      description: "스포츠에 관한 흥미로운 퀴즈",
      icon: "⚽",
      color: "#00D9FF",
    },
  ];

  const insertedCategories = await db.insert(categories).values(categoryData);
  console.log("✅ Categories seeded");

  // Insert questions for each category
  const questionsData = [
    // 일반 상식 (categoryId: 1)
    {
      categoryId: 1,
      question: "세계에서 가장 높은 산은 무엇인가요?",
      correctAnswer: "에베레스트",
      wrongAnswer1: "K2",
      wrongAnswer2: "킬리만자로",
      wrongAnswer3: "후지산",
      explanation: "에베레스트는 해발 8,849m로 세계에서 가장 높은 산입니다.",
      difficulty: "easy",
    },
    {
      categoryId: 1,
      question: "대한민국의 수도는 어디인가요?",
      correctAnswer: "서울",
      wrongAnswer1: "부산",
      wrongAnswer2: "인천",
      wrongAnswer3: "대구",
      explanation: "서울은 대한민국의 수도이자 최대 도시입니다.",
      difficulty: "easy",
    },
    {
      categoryId: 1,
      question: "태양계에서 가장 큰 행성은?",
      correctAnswer: "목성",
      wrongAnswer1: "토성",
      wrongAnswer2: "지구",
      wrongAnswer3: "화성",
      explanation: "목성은 태양계에서 가장 큰 행성으로 지구의 약 11배 크기입니다.",
      difficulty: "medium",
    },
    {
      categoryId: 1,
      question: "세계에서 가장 긴 강은?",
      correctAnswer: "나일강",
      wrongAnswer1: "아마존강",
      wrongAnswer2: "양쯔강",
      wrongAnswer3: "미시시피강",
      explanation: "나일강은 약 6,650km로 세계에서 가장 긴 강입니다.",
      difficulty: "medium",
    },
    {
      categoryId: 1,
      question: "인간의 뼈는 총 몇 개인가요?",
      correctAnswer: "206개",
      wrongAnswer1: "195개",
      wrongAnswer2: "215개",
      wrongAnswer3: "180개",
      explanation: "성인의 인체에는 총 206개의 뼈가 있습니다.",
      difficulty: "hard",
    },

    // 영화 (categoryId: 2)
    {
      categoryId: 2,
      question: "영화 '타이타닉'의 감독은 누구인가요?",
      correctAnswer: "제임스 카메론",
      wrongAnswer1: "스티븐 스필버그",
      wrongAnswer2: "크리스토퍼 놀란",
      wrongAnswer3: "마틴 스콜세지",
      explanation: "제임스 카메론은 타이타닉과 아바타를 감독한 유명 영화감독입니다.",
      difficulty: "easy",
    },
    {
      categoryId: 2,
      question: "'반지의 제왕' 시리즈는 총 몇 편인가요?",
      correctAnswer: "3편",
      wrongAnswer1: "2편",
      wrongAnswer2: "4편",
      wrongAnswer3: "5편",
      explanation: "반지의 제왕은 반지 원정대, 두 개의 탑, 왕의 귀환 총 3편으로 구성되어 있습니다.",
      difficulty: "easy",
    },
    {
      categoryId: 2,
      question: "영화 '인셉션'에서 꿈 속의 시간은 현실보다 얼마나 느리게 흐르나요?",
      correctAnswer: "약 20배",
      wrongAnswer1: "약 10배",
      wrongAnswer2: "약 50배",
      wrongAnswer3: "약 100배",
      explanation: "인셉션에서 꿈 1단계는 현실보다 약 20배 느리게 시간이 흐릅니다.",
      difficulty: "medium",
    },
    {
      categoryId: 2,
      question: "아카데미 시상식에서 가장 많은 상을 받은 영화는?",
      correctAnswer: "벤허, 타이타닉, 반지의 제왕: 왕의 귀환 (11개)",
      wrongAnswer1: "쉰들러 리스트 (7개)",
      wrongAnswer2: "라라랜드 (6개)",
      wrongAnswer3: "기생충 (4개)",
      explanation: "벤허(1959), 타이타닉(1997), 반지의 제왕: 왕의 귀환(2003)이 각각 11개의 오스카상을 수상했습니다.",
      difficulty: "hard",
    },
    {
      categoryId: 2,
      question: "마블 시네마틱 유니버스(MCU)의 첫 번째 영화는?",
      correctAnswer: "아이언맨",
      wrongAnswer1: "헐크",
      wrongAnswer2: "토르",
      wrongAnswer3: "캡틴 아메리카",
      explanation: "2008년 개봉한 아이언맨이 MCU의 시작을 알린 첫 번째 영화입니다.",
      difficulty: "medium",
    },

    // 과학 (categoryId: 3)
    {
      categoryId: 3,
      question: "물의 화학식은 무엇인가요?",
      correctAnswer: "H2O",
      wrongAnswer1: "CO2",
      wrongAnswer2: "O2",
      wrongAnswer3: "H2SO4",
      explanation: "물은 수소 2개와 산소 1개로 이루어진 H2O입니다.",
      difficulty: "easy",
    },
    {
      categoryId: 3,
      question: "빛의 속도는 약 얼마인가요?",
      correctAnswer: "초속 30만 km",
      wrongAnswer1: "초속 10만 km",
      wrongAnswer2: "초속 50만 km",
      wrongAnswer3: "초속 100만 km",
      explanation: "빛의 속도는 진공에서 약 초속 299,792km입니다.",
      difficulty: "medium",
    },
    {
      categoryId: 3,
      question: "DNA의 이중나선 구조를 발견한 과학자는?",
      correctAnswer: "왓슨과 크릭",
      wrongAnswer1: "아인슈타인",
      wrongAnswer2: "뉴턴",
      wrongAnswer3: "다윈",
      explanation: "제임스 왓슨과 프랜시스 크릭이 1953년 DNA의 이중나선 구조를 발견했습니다.",
      difficulty: "medium",
    },
    {
      categoryId: 3,
      question: "주기율표에서 원자번호 1번 원소는?",
      correctAnswer: "수소",
      wrongAnswer1: "헬륨",
      wrongAnswer2: "산소",
      wrongAnswer3: "탄소",
      explanation: "수소(H)는 주기율표에서 가장 가벼운 원소로 원자번호 1번입니다.",
      difficulty: "easy",
    },
    {
      categoryId: 3,
      question: "양자역학의 불확정성 원리를 제안한 과학자는?",
      correctAnswer: "하이젠베르크",
      wrongAnswer1: "슈뢰딩거",
      wrongAnswer2: "보어",
      wrongAnswer3: "파인만",
      explanation: "베르너 하이젠베르크가 1927년 불확정성 원리를 제안했습니다.",
      difficulty: "hard",
    },

    // 스포츠 (categoryId: 4)
    {
      categoryId: 4,
      question: "올림픽은 몇 년마다 개최되나요?",
      correctAnswer: "4년",
      wrongAnswer1: "2년",
      wrongAnswer2: "3년",
      wrongAnswer3: "5년",
      explanation: "하계 올림픽과 동계 올림픽 모두 4년마다 개최됩니다.",
      difficulty: "easy",
    },
    {
      categoryId: 4,
      question: "축구에서 한 팀은 몇 명의 선수로 구성되나요?",
      correctAnswer: "11명",
      wrongAnswer1: "9명",
      wrongAnswer2: "10명",
      wrongAnswer3: "12명",
      explanation: "축구는 골키퍼를 포함하여 한 팀당 11명의 선수가 경기를 진행합니다.",
      difficulty: "easy",
    },
    {
      categoryId: 4,
      question: "테니스 그랜드슬램 대회가 아닌 것은?",
      correctAnswer: "올림픽",
      wrongAnswer1: "윔블던",
      wrongAnswer2: "US 오픈",
      wrongAnswer3: "프랑스 오픈",
      explanation: "그랜드슬램은 호주 오픈, 프랑스 오픈, 윔블던, US 오픈 4개 대회입니다.",
      difficulty: "medium",
    },
    {
      categoryId: 4,
      question: "NBA 역사상 가장 많은 우승을 차지한 팀은?",
      correctAnswer: "보스턴 셀틱스 (17회)",
      wrongAnswer1: "LA 레이커스 (17회)",
      wrongAnswer2: "시카고 불스 (6회)",
      wrongAnswer3: "골든스테이트 워리어스 (7회)",
      explanation: "보스턴 셀틱스와 LA 레이커스가 각각 17회로 공동 1위입니다.",
      difficulty: "hard",
    },
    {
      categoryId: 4,
      question: "마라톤의 공식 거리는?",
      correctAnswer: "42.195km",
      wrongAnswer1: "40km",
      wrongAnswer2: "45km",
      wrongAnswer3: "50km",
      explanation: "마라톤의 공식 거리는 42.195km(26마일 385야드)입니다.",
      difficulty: "medium",
    },
  ];

  await db.insert(questions).values(questionsData);
  console.log("✅ Questions seeded");

  console.log("🎉 Quiz data seeding completed successfully!");
  process.exit(0);
};

seedData().catch((error) => {
  console.error("❌ Error seeding quiz data:", error);
  process.exit(1);
});
