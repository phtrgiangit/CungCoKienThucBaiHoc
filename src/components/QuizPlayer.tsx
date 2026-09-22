import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Award,
} from 'lucide-react';
import { QuizData, QuizQuestion } from '../types';

interface QuizPlayerProps {
  quiz: QuizData;
  userAnswers: Record<number, number>;
  onSelectAnswer: (questionId: number, optionIndex: number) => void;
  onSubmitQuiz: (timeSpentSeconds: number) => void;
  onQuit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  userAnswers,
  onSelectAnswer,
  onSubmitQuiz,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(
    quiz.timeMinutes * 60
  );
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  const totalQuestions = quiz.questions.length;
  const currentQuestion: QuizQuestion = quiz.questions[currentIndex];
  const selectedOption = userAnswers[currentQuestion.id];

  // Count answered questions
  const answeredCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[Number(k)] !== undefined && userAnswers[Number(k)] >= 0
  ).length;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmitQuiz(quiz.timeMinutes * 60);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.timeMinutes, onSubmitQuiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds <= 120; // less than 2 minutes

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Header Bar: Progress & Timer */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {quiz.title}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-800">
                Câu {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Đã trả lời: {answeredCount}/{totalQuestions} câu
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border transition-colors ${
              isLowTime
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-amber-600'}`} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-5">
        {/* Question Header */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Câu hỏi trắc nghiệm
            </span>
          </div>

          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {currentQuestion.difficultyLabel || quiz.difficulty}
          </span>
        </div>

        {/* Question Statement */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* 4 Multiple Choice Options (A, B, C, D) */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isChosen = selectedOption === idx;
            const letter = optionLetters[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAnswer(currentQuestion.id, idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                  isChosen
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 bg-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                    isChosen
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                  }`}
                >
                  {letter}
                </div>
                <div className="flex-1 pt-0.5">
                  <span
                    className={`text-sm leading-relaxed ${
                      isChosen ? 'font-semibold text-indigo-950' : 'text-slate-800'
                    }`}
                  >
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation and Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-sm flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài ({answeredCount}/{totalQuestions})</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>Tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Nộp bài & Xem điểm</span>
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Question Palette */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700">
          <span>Danh sách câu hỏi:</span>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-normal">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
              Đã làm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
              Chưa làm
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] >= 0;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'ring-2 ring-indigo-600 ring-offset-2'
                    : ''
                } ${
                  isAnswered
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Xác nhận nộp bài thi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
              Bạn đã hoàn thành <strong>{answeredCount}</strong> trên tổng số <strong>{totalQuestions}</strong> câu hỏi.
            </p>

            {answeredCount < totalQuestions && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Bạn còn <strong>{totalQuestions - answeredCount} câu chưa chọn đáp án</strong>. Các câu này sẽ bị tính là câu trả lời sai (0 điểm).
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmitQuiz(timeSpent);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
