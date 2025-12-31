import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Clock, Zap, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function QuizGame() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { state, startGame, submitAnswer, nextQuestion, endGame, updateTimer } = useQuiz();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { data: categories } = trpc.quiz.categories.useQuery();
  const { data: questions, isLoading } = trpc.quiz.questions.useQuery({
    categoryId: parseInt(categoryId || "0"),
    limit: 5,
  });

  const submitGameMutation = trpc.quiz.submitGame.useMutation();

  const category = categories?.find((c) => c.id === parseInt(categoryId || "0"));
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

  // Initialize game when questions are loaded
  useEffect(() => {
    if (questions && questions.length > 0 && !state.isGameActive && category) {
      startGame(parseInt(categoryId || "0"), category.name, questions);
    }
  }, [questions, state.isGameActive, categoryId, category, startGame]);

  // Timer countdown
  useEffect(() => {
    if (!state.isGameActive || showFeedback) return;

    const timer = setInterval(() => {
      if (state.timeLeft > 0) {
        updateTimer(state.timeLeft - 1);
      } else {
        // Time's up - auto submit wrong answer
        handleAnswerSubmit("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isGameActive, state.timeLeft, showFeedback, updateTimer]);

  const handleAnswerSubmit = (answer: string) => {
    if (showFeedback) return;

    console.log('=== Answer Submit Debug ===');
    console.log('Selected answer:', answer);
    console.log('Correct answer:', currentQuestion.correctAnswer);
    console.log('Current question:', currentQuestion);
    
    const correct = answer === currentQuestion.correctAnswer;
    console.log('Is correct?', correct);
    
    setIsCorrect(correct);
    setSelectedAnswer(answer);
    setShowFeedback(true);
    submitAnswer(answer);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (isLastQuestion) {
      // Use setTimeout to ensure state updates are complete before ending game
      setTimeout(() => {
        handleGameEnd();
      }, 100);
    } else {
      nextQuestion();
    }
  };

  const handleGameEnd = async () => {
    // Save current state before ending game
    const gameResults = {
      categoryId: state.categoryId!,
      categoryName: state.categoryName!,
      score: state.score,
      maxCombo: state.maxCombo,
      correctAnswers: state.correctAnswers,
      totalQuestions: state.questions.length,
      questions: state.questions,
      userAnswers: state.userAnswers,
    };

    // Store results in localStorage for Results page
    localStorage.setItem('quizResults', JSON.stringify(gameResults));

    endGame();

    // Submit game session if user is logged in
    if (user) {
      try {
        await submitGameMutation.mutateAsync({
          categoryId: gameResults.categoryId,
          score: gameResults.score,
          maxCombo: gameResults.maxCombo,
          correctAnswers: gameResults.correctAnswers,
          totalQuestions: gameResults.totalQuestions,
        });
      } catch (error) {
        console.error("Failed to submit game:", error);
      }
    }

    navigate("/results");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>문제를 불러올 수 없습니다.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{state.score}</div>
              <div className="text-sm text-muted-foreground">점수</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-600">{state.combo}</div>
              </div>
              <div className="text-sm text-muted-foreground">콤보</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <div className="text-2xl font-bold text-pink-600">{state.timeLeft}s</div>
              </div>
              <div className="text-sm text-muted-foreground">남은 시간</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>
              문제 {state.currentQuestionIndex + 1} / {state.questions.length}
            </span>
            <span>{category?.name}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === answer;
                const isCorrectAnswer = answer === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    variant={showCorrect ? "default" : showWrong ? "destructive" : "outline"}
                    size="lg"
                    className={`justify-start text-left h-auto py-4 px-6 ${
                      showCorrect ? "bg-green-500 hover:bg-green-600" : ""
                    }`}
                    onClick={() => handleAnswerSubmit(answer)}
                    disabled={showFeedback}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{answer}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5" />}
                      {showWrong && <XCircle className="w-5 h-5" />}
                    </div>
                  </Button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-600">정답입니다!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-red-600">오답입니다!</span>
                    </>
                  )}
                </div>
                {state.combo > 1 && isCorrect && (
                  <div className="text-sm text-yellow-600 font-bold mb-2">
                    🔥 {state.combo} 콤보! +{Math.floor(state.combo / 2) * 50} 보너스!
                  </div>
                )}
                <Button onClick={handleNextQuestion} className="w-full mt-4">
                  {isLastQuestion ? "결과 보기" : "다음 문제"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
