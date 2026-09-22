import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard, clearLeaderboard } from '../utils/storage';

interface LeaderboardProps {
  onBackToSetup: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToSetup }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại bảng xếp hạng?')) {
      clearLeaderboard();
      setEntries([]);
    }
  };

  const filtered = entries.filter((item) => {
    if (filterDifficulty === 'all') return true;
    return item.difficulty === filterDifficulty;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}p ${secs}s`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-300">
          🥇
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-300">
          🥈
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-800/10 text-amber-800 flex items-center justify-center font-bold text-sm border border-amber-700/30">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                Bảng Vàng Danh Dự
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Bảng Xếp Hạng Học Sinh THPT
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Vinh danh học sinh đạt điểm cao và hoàn thành trắc nghiệm nhanh nhất
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToSetup}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tạo đề thi mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Clear Table Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setFilterDifficulty('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterDifficulty === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả mức độ ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterDifficulty('easy')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterDifficulty === 'easy'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Mức Dễ
          </button>
          <button
            type="button"
            onClick={() => setFilterDifficulty('normal')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterDifficulty === 'normal'
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            Mức Bình Thường
          </button>
          <button
            type="button"
            onClick={() => setFilterDifficulty('hard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterDifficulty === 'hard'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Mức Khó
          </button>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Chưa có kết quả nào trong danh sách
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy hoàn thành một bài trắc nghiệm và nhấn nút "Lưu điểm" để ghi danh!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-16">Hạng</th>
                  <th className="py-3 px-4">Học sinh & Lớp</th>
                  <th className="py-3 px-4 hidden md:table-cell">Chủ đề đề thi</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-center">Tỉ lệ đúng</th>
                  <th className="py-3 px-4 text-center">Thời gian</th>
                  <th className="py-3 px-4 text-center">Mức độ</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Ngày thi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.map((item, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <tr
                      key={item.id || idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop3 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center">{getRankBadge(idx)}</div>
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.studentName}
                        </div>
                        {item.studentClass && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Lớp {item.studentClass}
                          </div>
                        )}
                      </td>

                      {/* Quiz Topic */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="text-xs text-slate-700 line-clamp-1 max-w-xs">
                          {item.quizTitle}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-indigo-700 text-sm">
                          {item.score} / {item.totalQuestions}
                        </div>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            item.accuracy >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.accuracy >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.accuracy}%
                        </span>
                      </td>

                      {/* Time taken */}
                      <td className="py-3.5 px-4 text-center text-slate-600 font-mono text-xs">
                        {formatDuration(item.timeSpentSeconds)}
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.difficulty === 'easy'
                            ? 'Dễ'
                            : item.difficulty === 'hard'
                            ? 'Khó'
                            : 'Bình thường'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-slate-400 text-xs hidden sm:table-cell">
                        {formatDate(item.completedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
