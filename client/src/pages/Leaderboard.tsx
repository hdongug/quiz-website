import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Home, Loader2 } from "lucide-react";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");

  const { data: globalLeaderboard, isLoading: globalLoading } =
    trpc.leaderboard.global.useQuery({ limit: 50 });

  const { data: friendsLeaderboard, isLoading: friendsLoading } =
    trpc.leaderboard.friends.useQuery(
      { limit: 50 },
      { enabled: !!user }
    );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  const LeaderboardTable = ({ data, loading }: { data: any[] | undefined; loading: boolean }) => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          아직 기록이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-4 rounded-lg border ${
              entry.userId === user?.id ? "bg-blue-50 border-blue-200" : "bg-white"
            }`}
          >
            <div className="w-12 flex justify-center">{getRankIcon(index + 1)}</div>

            <div className="flex-1">
              <div className="font-medium">{entry.userName || "익명"}</div>
              <div className="text-sm text-muted-foreground">{entry.categoryName}</div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{entry.score}</div>
              <div className="text-xs text-muted-foreground">
                {entry.correctAnswers}/{entry.totalQuestions} 정답
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-yellow-600">
                🔥 {entry.maxCombo} 콤보
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.completedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">리더보드</h1>
            <p className="text-muted-foreground">최고 점수를 확인하고 경쟁하세요!</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>

        {/* Leaderboard Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>순위표</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="global">
                  <Trophy className="w-4 h-4 mr-2" />
                  전 세계
                </TabsTrigger>
                <TabsTrigger value="friends" disabled={!user}>
                  <Award className="w-4 h-4 mr-2" />
                  친구
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global">
                <LeaderboardTable data={globalLeaderboard} loading={globalLoading} />
              </TabsContent>

              <TabsContent value="friends">
                {user ? (
                  <LeaderboardTable data={friendsLeaderboard} loading={friendsLoading} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    로그인하여 친구 리더보드를 확인하세요.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
