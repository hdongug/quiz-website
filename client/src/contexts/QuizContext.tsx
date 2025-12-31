import React, { createContext, useContext, useState, useCallback } from "react";

interface QuizQuestion {
  id: number;
  categoryId: number;
  question: string;
  answers: string[];
  correctAnswer: string;
  difficulty: string;
}

interface QuizState {
  categoryId: number | null;
  categoryName: string | null;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  correctAnswers: number;
  userAnswers: { questionId: number; answer: string; isCorrect: boolean }[];
  timeLeft: number;
  isGameActive: boolean;
}

interface QuizContextType {
  state: QuizState;
  startGame: (categoryId: number, categoryName: string, questions: QuizQuestion[]) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  endGame: () => void;
  resetGame: () => void;
  updateTimer: (time: number) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const initialState: QuizState = {
  categoryId: null,
  categoryName: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  correctAnswers: 0,
  userAnswers: [],
  timeLeft: 30,
  isGameActive: false,
};

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuizState>(initialState);

  const startGame = useCallback(
    (categoryId: number, categoryName: string, questions: QuizQuestion[]) => {
      setState({
        ...initialState,
        categoryId,
        categoryName,
        questions,
        isGameActive: true,
        timeLeft: 30,
      });
    },
    []
  );

  const submitAnswer = useCallback(
    (answer: string) => {
      setState((prev) => {
        const currentQuestion = prev.questions[prev.currentQuestionIndex];
        if (!currentQuestion) return prev;

        const isCorrect = answer === currentQuestion.correctAnswer;
        const newCombo = isCorrect ? prev.combo + 1 : 0;
        const comboBonus = newCombo > 1 ? Math.floor(newCombo / 2) * 50 : 0;
        const baseScore = isCorrect ? 100 : 0;
        const timeBonus = isCorrect ? Math.floor(prev.timeLeft * 2) : 0;

        return {
          ...prev,
          score: prev.score + baseScore + timeBonus + comboBonus,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          userAnswers: [
            ...prev.userAnswers,
            { questionId: currentQuestion.id, answer, isCorrect },
          ],
        };
      });
    },
    []
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      timeLeft: 30,
    }));
  }, []);

  const endGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isGameActive: false,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const updateTimer = useCallback((time: number) => {
    setState((prev) => ({
      ...prev,
      timeLeft: time,
    }));
  }, []);

  return (
    <QuizContext.Provider
      value={{
        state,
        startGame,
        submitAnswer,
        nextQuestion,
        endGame,
        resetGame,
        updateTimer,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }
  return context;
}
