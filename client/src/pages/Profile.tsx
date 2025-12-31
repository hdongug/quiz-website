import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Loader2, Trophy, Zap, Target, TrendingUp } from "lucide-react";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = trpc.user.stats.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: history, isLoading: historyLoading } = trpc.user.history.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  if (authLoading || statsLoading || historyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>로그인이 필요합니다.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">내 프로필</h1>
            <p className="text-muted-foreground">{user.name}</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalScore || 0}
              </div>
              <div className="text-sm text-muted-foreground">총 점수</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {stats?.totalGames || 0}
              </div>
              <div className="text-sm text-muted-foreground">플레이 횟수</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.bestCombo || 0}
              </div>
              <div className="text-sm text-muted-foreground">최고 콤보</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-600">
                {stats?.totalCorrect && stats?.totalQuestions
                  ? Math.round((Number(stats.totalCorrect) / Number(stats.totalQuestions)) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">평균 정확도</div>
            </CardContent>
          </Card>
        </div>

        {/* Game History */}
        <Card>
          <CardHeader>
            <CardTitle>게임 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-white"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{game.categoryName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(game.completedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{game.score}</div>
                      <div className="text-xs text-muted-foreground">
                        {game.correctAnswers}/{game.totalQuestions} 정답
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-sm font-medium text-yellow-600">
                        🔥 {game.maxCombo}
                      </div>
                      <div className="text-xs text-muted-foreground">콤보</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                아직 게임 기록이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
