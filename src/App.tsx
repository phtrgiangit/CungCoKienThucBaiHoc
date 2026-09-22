import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuizSetup } from './components/QuizSetup';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizReview } from './components/QuizReview';
import { Leaderboard } from './components/Leaderboard';
import {
  AppView,
  QuizConfig,
  QuizData,
  QuizResult,
} from './types';
import {
  getSavedApiKey,
  saveApiKey,
  getSavedModel,
  saveModel,
  getSavedStudentInfo,
} from './utils/storage';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('setup');

  const [config, setConfig] = useState<QuizConfig>(() => {
    return {
      apiKey: getSavedApiKey(),
      model: getSavedModel(),
      numQuestions: 10,
      timeMinutes: 15,
      difficulty: 'normal',
      documentText: '',
      documentFileName: '',
      documentFile: null,
      topicName: '',
    };
  });

  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync apiKey and model to localStorage
  const handleConfigChange = (newConfig: Partial<QuizConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.apiKey !== undefined) {
        saveApiKey(newConfig.apiKey);
      }
      if (newConfig.model !== undefined) {
        saveModel(newConfig.model);
      }
      return updated;
    });
  };

  // Generate Quiz API call
  const handleGenerateQuiz = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep('Đang đọc tài liệu & trích xuất dữ kiện...');

    try {
      // Small progress animation steps for UX
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Đang biên soạn câu hỏi trắc nghiệm chuẩn THPT...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Đang sinh đáp án & phân tích giải thích logic chi tiết...');
      }, 2500);

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          model: config.model,
          documentText: config.documentText,
          documentFile: config.documentFile,
          numQuestions: config.numQuestions,
          difficulty: config.difficulty,
          timeMinutes: config.timeMinutes,
          topicName: config.topicName,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Không thể tạo đề trắc nghiệm. Vui lòng kiểm tra lại tài liệu hoặc API Key.'
        );
      }

      setActiveQuiz(data.quiz);
      setUserAnswers({});
      setQuizResult(null);
      setCurrentView('quiz');
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      setErrorMessage(err.message || 'Đã xảy ra lỗi trong quá trình tạo đề thi.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Answer selection
  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit quiz & calculate scores
  // Requirement: "mỗi câu đúng tương ứng 1 điểm"
  const handleSubmitQuiz = (timeSpentSeconds: number) => {
    if (!activeQuiz) return;

    let correctCount = 0;
    let wrongCount = 0;

    activeQuiz.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected === q.correctAnswer) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    });

    const total = activeQuiz.questions.length;
    const score = correctCount; // 1 point per correct answer
    const percentage = Math.round((correctCount / total) * 100);

    const studentInfo = getSavedStudentInfo();

    const resultData: QuizResult = {
      id: `result_${Date.now()}`,
      studentName: studentInfo.name || '',
      studentClass: studentInfo.schoolClass || '12A1',
      quizTitle: activeQuiz.title,
      totalQuestions: total,
      correctCount,
      wrongCount,
      score,
      percentage,
      timeSpentSeconds,
      timeLimitMinutes: activeQuiz.timeMinutes,
      difficulty: activeQuiz.difficulty,
      completedAt: new Date().toISOString(),
      userAnswers,
      questions: activeQuiz.questions,
    };

    setQuizResult(resultData);
    setCurrentView('result');
  };

  // Retake same quiz
  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setQuizResult(null);
    setCurrentView('quiz');
  };

  // Setup a new quiz
  const handleNewQuiz = () => {
    setActiveQuiz(null);
    setUserAnswers({});
    setQuizResult(null);
    setCurrentView('setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setErrorMessage(null);
          setCurrentView(view);
        }}
        selectedModel={config.model}
        hasCustomKey={Boolean(config.apiKey && config.apiKey.trim())}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-sm animate-in fade-in-50">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Đã xảy ra lỗi</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Views */}
      <main className="flex-1">
        {currentView === 'setup' && (
          <QuizSetup
            config={config}
            onChangeConfig={handleConfigChange}
            onGenerateQuiz={handleGenerateQuiz}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        )}

        {currentView === 'quiz' && activeQuiz && (
          <QuizPlayer
            quiz={activeQuiz}
            userAnswers={userAnswers}
            onSelectAnswer={handleSelectAnswer}
            onSubmitQuiz={handleSubmitQuiz}
            onQuit={handleNewQuiz}
          />
        )}

        {currentView === 'result' && quizResult && (
          <QuizReview
            result={quizResult}
            onRetakeQuiz={handleRetakeQuiz}
            onNewQuiz={handleNewQuiz}
            onViewLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}

        {currentView === 'leaderboard' && (
          <Leaderboard onBackToSetup={() => setCurrentView('setup')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hệ thống củng cố kiến thức trắc nghiệm THPT • Đề thi bám sát tài liệu
          </span>
          <span className="text-slate-400">
            Ứng dụng công nghệ AI Google Gemini • Phân tích dữ kiện & giải thích logic
          </span>
        </div>
      </footer>
    </div>
  );
}
