import { useLocation } from "wouter";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, Target, Home, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function Results() {
  const [, navigate] = useLocation();
  const { resetGame } = useQuiz();
  const [gameResults, setGameResults] = useState<any>(null);
  const [questionDetails, setQuestionDetails] = useState<any[]>([]);

  // Load results from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('quizResults');
    if (stored) {
      const results = JSON.parse(stored);
      setGameResults(results);
      localStorage.removeItem('quizResults'); // Clean up after loading
    }
  }, []);

  const accuracy = gameResults && gameResults.totalQuestions > 0
    ? Math.round((gameResults.correctAnswers / gameResults.totalQuestions) * 100)
    : 0;

  // Fetch question details for explanations
  useEffect(() => {
    if (gameResults && gameResults.userAnswers && gameResults.userAnswers.length > 0) {
      const details = gameResults.userAnswers.map((ua: any) => {
        const question = gameResults.questions.find((q: any) => q.id === ua.questionId);
        return {
          ...ua,
          question: question?.question,
        };
      });
      setQuestionDetails(details);
    }
  }, [gameResults]);

  const handlePlayAgain = () => {
    resetGame();
    navigate("/");
  };

  if (!gameResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>게임 결과를 찾을 수 없습니다.</p>
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
        {/* Results Header */}
        <Card className="mb-6 text-center">
          <CardHeader>
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl">게임 완료!</CardTitle>
            <p className="text-muted-foreground">{gameResults?.categoryName}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{gameResults?.score || 0}</div>
                <div className="text-sm text-muted-foreground">총 점수</div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{gameResults?.maxCombo || 0}</div>
                <div className="text-sm text-muted-foreground">최고 콤보</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">정확도</div>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {gameResults?.correctAnswers || 0}/{gameResults?.totalQuestions || 0}
                </div>
                <div className="text-sm text-muted-foreground">정답 수</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={handlePlayAgain} size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                다시 플레이
              </Button>
              <Button onClick={() => navigate("/leaderboard")} variant="outline" size="lg">
                <Trophy className="w-4 h-4 mr-2" />
                리더보드
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="lg">
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review */}
        <Card>
          <CardHeader>
            <CardTitle>정답 리뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionDetails.map((detail, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    detail.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        detail.isCorrect ? "bg-green-500" : "bg-red-500"
                      } text-white font-bold`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{detail.question}</p>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">내 답변:</span>{" "}
                          <span
                            className={detail.isCorrect ? "text-green-700" : "text-red-700"}
                          >
                            {detail.answer || "(시간 초과)"}
                          </span>
                        </p>
                        {!detail.isCorrect && (
                          <p>
                            <span className="font-medium">정답:</span>{" "}
                            <span className="text-green-700">
                              {gameResults?.questions.find((q: any) => q.id === detail.questionId)
                                ?.correctAnswer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
