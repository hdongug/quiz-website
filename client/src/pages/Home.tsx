import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, User, Clock, Users, Loader2, ChevronLeft } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [selectedParentCategory, setSelectedParentCategory] = useState<number | null>(null);

  const { data: rootCategories, isLoading: loadingRoot } = trpc.quiz.rootCategories.useQuery();
  const { data: subCategories } = trpc.quiz.subCategories.useQuery(
    { parentId: selectedParentCategory! },
    { enabled: selectedParentCategory !== null }
  );

  const handleCategoryClick = (categoryId: number, hasSubCategories: boolean) => {
    if (hasSubCategories) {
      setSelectedParentCategory(categoryId);
    } else {
      // Navigate to quiz game
      navigate(`/quiz/${categoryId}`);
    }
  };

  const handleBackToRoot = () => {
    setSelectedParentCategory(null);
  };

  if (loadingRoot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const displayCategories = selectedParentCategory ? subCategories : rootCategories;
  const selectedParent = rootCategories?.find(c => c.id === selectedParentCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌊</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-yellow-500 to-pink-500 bg-clip-text text-transparent">
                QuizRipple
              </h1>
              <p className="text-sm text-muted-foreground">지식의 파도를 타고 즐기는 퀴즈!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/leaderboard")}>
              <Trophy className="w-4 h-4 mr-2" />
              리더보드
            </Button>
            {user && (
              <Button variant="outline" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                내 기록
              </Button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())}>
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {selectedParentCategory ? (
            <>
              <Button
                variant="ghost"
                onClick={handleBackToRoot}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                뒤로 가기
              </Button>
              <h2 className="text-4xl font-bold mb-4">
                {selectedParent?.name} 세부 카테고리
              </h2>
              <p className="text-lg text-muted-foreground">
                원하는 종목을 선택하세요!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-4">카테고리를 선택하세요</h2>
              <p className="text-lg text-muted-foreground">
                다양한 주제의 퀴즈에 도전하고 전 세계 사용자와 경쟁하세요!
              </p>
            </>
          )}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {displayCategories?.map((category) => {
            const hasSubCategories = !selectedParentCategory && rootCategories?.some(c => c.id === category.id) || false;
            const isSubCategory = selectedParentCategory !== null;
            
            return (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-6xl mb-4">{category.icon || '📚'}</div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => handleCategoryClick(category.id, hasSubCategories && !isSubCategory)}
                  >
                    {hasSubCategories && !isSubCategory ? '선택하기' : '시작하기'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        {!selectedParentCategory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">글로벌 리더보드</h3>
              <p className="text-muted-foreground">전 세계 사용자와 실시간으로 경쟁하세요</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">친구와 경쟁</h3>
              <p className="text-muted-foreground">친구를 추가하고 함께 즐기세요</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">콤보 보너스</h3>
              <p className="text-muted-foreground">
                연속으로 정답을 맞혀 보너스 점수를 획득하세요
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
