import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  Filter,
  Save,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizResult } from '../types';
import { saveLeaderboardEntry, saveStudentInfo } from '../utils/storage';

interface QuizReviewProps {
  result: QuizResult;
  onRetakeQuiz: () => void;
  onNewQuiz: () => void;
  onViewLeaderboard: () => void;
}

export const QuizReview: React.FC<QuizReviewProps> = ({
  result,
  onRetakeQuiz,
  onNewQuiz,
  onViewLeaderboard,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');
  const [studentName, setStudentName] = useState(result.studentName || '');
  const [studentClass, setStudentClass] = useState(result.studentClass || '12A1');
  const [hasSavedLeaderboard, setHasSavedLeaderboard] = useState(false);

  // Set of question IDs that have their explanation toggled open.
  // Requirement: "các câu sai sẽ có nút giải thích hiển thị chi tiết đáp án đúng và lời giải thích logic ngay dưới từng câu hỏi."
  // By default, open all wrong questions for convenience, while keeping the toggle button interactive.
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    result.questions.forEach((q) => {
      const isWrong = result.userAnswers[q.id] !== q.correctAnswer;
      if (isWrong) {
        initial[q.id] = true;
      }
    });
    return initial;
  });

  // Confetti if high score (>= 70%)
  useEffect(() => {
    if (result.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if canvas-confetti is not rendered
      }
    }
  }, [result.percentage]);

  const toggleExplanation = (questionId: number) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleSaveToLeaderboard = () => {
    if (!studentName.trim()) return;

    saveStudentInfo(studentName, studentClass);

    saveLeaderboardEntry({
      id: `entry_${Date.now()}`,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      quizTitle: result.quizTitle,
      score: result.score,
      totalQuestions: result.totalQuestions,
      accuracy: result.percentage,
      timeSpentSeconds: result.timeSpentSeconds,
      difficulty: result.difficulty,
      completedAt: new Date().toISOString(),
    });

    setHasSavedLeaderboard(true);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} phút ${s} giây`;
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  const filteredQuestions = result.questions.filter((q) => {
    const isCorrect = result.userAnswers[q.id] === q.correctAnswer;
    if (filterMode === 'wrong') return !isCorrect;
    if (filterMode === 'correct') return isCorrect;
    return true;
  });

  const getScoreMessage = () => {
    if (result.percentage >= 90) return 'Xuất sắc! Bạn đã nắm rất vững kiến thức tài liệu.';
    if (result.percentage >= 70) return 'Tốt lắm! Bạn đã hiểu phần lớn nội dung tài liệu.';
    if (result.percentage >= 50) return 'Khá! Cần xem lại các câu giải thích để củng cố thêm.';
    return 'Cần cố gắng hơn! Hãy đọc kỹ tài liệu và phần giải thích chi tiết bên dưới.';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. Summary Scoreboard */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-6">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-2">
            Kết quả bài làm trắc nghiệm
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {result.quizTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            {getScoreMessage()}
          </p>
        </div>

        {/* Big Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Total Score (1 pt each) */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
            <span className="text-xs text-indigo-600 font-semibold block">
              Tổng điểm số
            </span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-900">
                {result.score}
              </span>
              <span className="text-xs font-semibold text-indigo-500">
                / {result.totalQuestions} điểm
              </span>
            </div>
            <span className="text-[11px] text-indigo-700/80 mt-0.5 block">
              (Mỗi câu đúng = 1 điểm)
            </span>
          </div>

          {/* Correct Questions */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Số câu đúng
            </span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                {result.correctCount}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700/80 mt-0.5 block">
              Tỉ lệ: {result.percentage}%
            </span>
          </div>

          {/* Wrong Questions */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 text-center">
            <span className="text-xs text-rose-700 font-semibold flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Số câu sai
            </span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-800">
                {result.wrongCount}
              </span>
            </div>
            <span className="text-[11px] text-rose-700/80 mt-0.5 block">
              Cần xem giải thích
            </span>
          </div>

          {/* Time spent */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-600 font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Thời gian làm
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">
                {formatSeconds(result.timeSpentSeconds)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Hạn: {result.timeLimitMinutes} phút
            </span>
          </div>
        </div>

        {/* Save to Leaderboard Section */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ghi danh vào Bảng Xếp Hạng
              </h3>
              <p className="text-xs text-slate-600">
                Lưu thành tích {result.score}/{result.totalQuestions} điểm vào bảng vàng vinh danh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Tên học sinh"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              disabled={hasSavedLeaderboard}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 sm:w-36"
            />
            <input
              type="text"
              placeholder="Lớp (vd: 12A1)"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              disabled={hasSavedLeaderboard}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-24"
            />
            <button
              type="button"
              id="save-leaderboard-btn"
              onClick={handleSaveToLeaderboard}
              disabled={hasSavedLeaderboard || !studentName.trim()}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                hasSavedLeaderboard
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50'
              }`}
            >
              {hasSavedLeaderboard ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu điểm</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition-colors"
            >
              Xem BXH
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onRetakeQuiz}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Làm lại đề này</span>
          </button>

          <button
            type="button"
            onClick={onNewQuiz}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Biên soạn đề thi mới</span>
          </button>
        </div>
      </div>

      {/* 2. Detailed Review Section with Explanations */}
      <div className="space-y-4">
        {/* Section Title & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Chi tiết câu hỏi & Lời giải thích logic
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({result.totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'wrong'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Chỉ câu sai ({result.wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Chỉ câu đúng ({result.correctCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.map((q) => {
          const userAnswerIndex = result.userAnswers[q.id];
          const isCorrect = userAnswerIndex === q.correctAnswer;
          const isExpanded = expandedExplanations[q.id] || false;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                isCorrect
                  ? 'border-emerald-200 shadow-xs'
                  : 'border-rose-200/90 shadow-sm'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center text-white ${
                      isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {q.id}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Câu {q.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đúng (+1 điểm)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sai (0 điểm)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Question Statement */}
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed mb-4">
                {q.question}
              </h3>

              {/* 4 Options with Status Indicators */}
              <div className="space-y-2 mb-4">
                {q.options.map((opt, idx) => {
                  const isThisCorrect = idx === q.correctAnswer;
                  const isThisUserSelected = idx === userAnswerIndex;
                  const letter = optionLetters[idx];

                  let optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';

                  if (isThisCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-500';
                  } else if (isThisUserSelected && !isThisCorrect) {
                    optionStyle = 'border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400';
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 transition-all ${optionStyle}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isThisCorrect
                            ? 'bg-emerald-600 text-white'
                            : isThisUserSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </div>

                      <div className="flex-1 leading-snug">
                        <span>{opt}</span>
                      </div>

                      <div className="shrink-0 text-xs font-semibold">
                        {isThisCorrect && (
                          <span className="text-emerald-700 flex items-center gap-1 text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> Đáp án đúng
                          </span>
                        )}
                        {isThisUserSelected && !isThisCorrect && (
                          <span className="text-rose-700 flex items-center gap-1 text-[11px] bg-rose-100/80 px-2 py-0.5 rounded">
                            Lựa chọn của bạn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Button & Logic Explanation Box */}
              {/* Requirement: "các câu sai sẽ có nút giải thích hiển thị chi tiết đáp án đúng và lời giải thích logic ngay dưới từng câu hỏi." */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleExplanation(q.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    isExpanded
                      ? 'bg-indigo-600 text-white'
                      : !isCorrect
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>
                    {isExpanded ? 'Thu gọn giải thích' : '💡 Xem giải thích chi tiết & dẫn chứng'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-3 animate-in fade-in-50 duration-200">
                    {/* Correct answer indicator */}
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Đáp án đúng: Phương án {optionLetters[q.correctAnswer]} ({q.options[q.correctAnswer]})
                      </span>
                    </div>

                    {/* Logical Explanation */}
                    <div>
                      <span className="font-bold text-slate-900 block mb-1 text-xs uppercase tracking-wide text-indigo-700 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" /> Lời giải thích logic chi tiết:
                      </span>
                      <p className="text-slate-700 leading-relaxed pl-1 border-l-2 border-indigo-400">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Quote reference from document */}
                    {q.quoteReference && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                        <span className="font-bold text-slate-900 block mb-1 text-[11px] uppercase tracking-wide text-amber-700 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Căn cứ trích dẫn từ tài liệu:
                        </span>
                        <blockquote className="italic text-slate-600 text-xs leading-relaxed pl-2 border-l-2 border-amber-400">
                          "{q.quoteReference}"
                        </blockquote>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
