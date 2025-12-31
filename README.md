# 🌊 QuizRipple

**지식의 파도를 타고 즐기는 퀴즈!**

QuizRipple은 밝고 유쾌한 아케이드 스타일의 온라인 퀴즈 게임입니다. 다양한 카테고리의 퀴즈에 도전하고, 전 세계 사용자들과 실시간으로 경쟁하며, 콤보 보너스로 높은 점수를 획득하세요!

## ✨ 주요 기능

### 🎯 2단계 카테고리 시스템
- **루트 카테고리**: 일반 상식, 영화, 과학, 스포츠
- **서브 카테고리**: 스포츠 → 해외/국내 → 축구/야구/농구/배구
- 원하는 주제를 세밀하게 선택하여 퀴즈 플레이

### ⏱️ 시간 제한 퀴즈
- 각 문제당 30초의 제한 시간
- 빠르게 답할수록 높은 시간 보너스 획득
- 긴장감 넘치는 게임 플레이

### 🔥 콤보 보너스 시스템
- 연속으로 정답을 맞히면 콤보 증가
- 2콤보부터 보너스 점수 획득 (2콤보 = +50점, 4콤보 = +100점...)
- 최고 콤보 기록 저장

### 🏆 리더보드
- **전 세계 리더보드**: 모든 사용자와 경쟁
- **친구 리더보드**: 친구들과만 점수 비교
- 실시간 순위 업데이트

### 📊 사용자 프로필
- 게임 통계 확인 (총 게임 수, 평균 점수, 정답률)
- 게임 기록 조회
- 친구 관리

### 💡 정답 해설
- 각 문제마다 상세한 해설 제공
- 게임 종료 후 정답 리뷰 화면
- 틀린 문제를 다시 확인하며 학습

## 🎨 디자인

밝고 유쾌한 아케이드 스타일 UI로 구현되었습니다:
- **일렉트릭 블루**: 주요 액션 버튼 및 강조
- **선샤인 옐로우**: 콤보 보너스 및 경고
- **산호 핑크**: 오답 피드백 및 악센트

## 🛠️ 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS 4** - 스타일링
- **Wouter** - 라우팅
- **tRPC** - End-to-end 타입 안전 API
- **shadcn/ui** - UI 컴포넌트
- **Framer Motion** - 애니메이션

### Backend
- **Node.js** - 런타임
- **Express 4** - 웹 서버
- **tRPC 11** - API 레이어
- **Drizzle ORM** - 데이터베이스 ORM
- **MySQL/TiDB** - 데이터베이스
- **Manus OAuth** - 인증

### DevOps
- **Vite** - 빌드 도구
- **Vitest** - 테스트 프레임워크
- **pnpm** - 패키지 매니저

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 22.x 이상
- pnpm 10.x 이상
- MySQL 또는 TiDB 데이터베이스

### 1. 저장소 클론
```bash
git clone https://github.com/hdongug/quiz-website.git
cd quiz-website
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스
DATABASE_URL=mysql://user:password@localhost:3306/quizripple

# JWT 시크릿
JWT_SECRET=your-jwt-secret-key

# Manus OAuth (선택사항)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# 기타
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name
```

### 4. 데이터베이스 마이그레이션
```bash
pnpm db:push
```

### 5. 초기 데이터 시딩
```bash
# 기본 퀴즈 데이터 추가
pnpm exec tsx seed-quiz-data.mjs

# 서브 카테고리 및 추가 퀴즈 데이터
pnpm exec tsx seed-subcategories.mjs
```

### 6. 개발 서버 실행
```bash
pnpm dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 🧪 테스트

```bash
# 모든 테스트 실행
pnpm test

# 타입 체크
pnpm check
```

## 📁 프로젝트 구조

```
quiz-website/
├── client/                 # 프론트엔드 코드
│   ├── public/            # 정적 파일
│   └── src/
│       ├── components/    # UI 컴포넌트
│       ├── contexts/      # React 컨텍스트
│       ├── hooks/         # 커스텀 훅
│       ├── lib/           # 유틸리티 라이브러리
│       └── pages/         # 페이지 컴포넌트
├── server/                # 백엔드 코드
│   ├── _core/            # 프레임워크 코어
│   ├── db.ts             # 데이터베이스 쿼리
│   └── routers.ts        # tRPC 라우터
├── shared/               # 공유 타입 및 상수
├── drizzle/              # 데이터베이스 스키마
├── seed-quiz-data.mjs    # 초기 데이터 시딩
└── seed-subcategories.mjs # 서브 카테고리 시딩
```

## 🎮 사용 방법

1. **로그인**: 우측 상단의 "로그인" 버튼 클릭
2. **카테고리 선택**: 홈 화면에서 원하는 카테고리 선택
3. **서브 카테고리 선택**: 스포츠의 경우 해외/국내 → 종목 선택
4. **퀴즈 플레이**: 30초 안에 정답 선택
5. **결과 확인**: 게임 종료 후 점수 및 정답 해설 확인
6. **리더보드**: 전 세계 사용자와 순위 비교

## 📝 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보 및 인증
- **categories**: 퀴즈 카테고리 (2단계 계층 구조)
- **questions**: 퀴즈 질문 및 답변
- **gameSessions**: 게임 기록
- **friendships**: 친구 관계

## 🔧 개발 가이드

### 새로운 카테고리 추가
1. `seed-subcategories.mjs`에 카테고리 추가
2. 해당 카테고리의 퀴즈 질문 작성
3. 시딩 스크립트 실행: `pnpm exec tsx seed-subcategories.mjs`

### 새로운 기능 추가
1. `server/db.ts`에 데이터베이스 쿼리 함수 추가
2. `server/routers.ts`에 tRPC 프로시저 추가
3. 프론트엔드에서 `trpc.*.useQuery/useMutation` 사용
4. `server/*.test.ts`에 테스트 작성

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 👤 개발자

**hdongug**
- GitHub: [@hdongug](https://github.com/hdongug)

## 🙏 감사의 말

- [Manus](https://manus.im) - 개발 플랫폼 및 호스팅
- [shadcn/ui](https://ui.shadcn.com) - UI 컴포넌트
- [tRPC](https://trpc.io) - End-to-end 타입 안전 API

---

**즐거운 퀴즈 플레이 되세요! 🎉**
