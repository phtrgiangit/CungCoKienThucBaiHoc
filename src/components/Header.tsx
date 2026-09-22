import React from 'react';
import { GraduationCap, Trophy, FileText, Sparkles, KeyRound } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  selectedModel: string;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedModel,
  hasCustomKey,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div
          id="brand-logo"
          onClick={() => onNavigate('setup')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Luyện Thi THPT
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                AI Trắc Nghiệm
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Tạo đề từ tài liệu • Lời giải logic • Bảng vàng thành tích
            </p>
          </div>
        </div>

        {/* Right side navigation & status badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Model & Key Indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono font-medium">{selectedModel}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-medium">
              <KeyRound className="w-3 h-3 text-slate-500" />
              {hasCustomKey ? (
                <span className="text-emerald-700 font-semibold">Khóa tùy chỉnh</span>
              ) : (
                <span className="text-slate-600">Khóa mặc định</span>
              )}
            </span>
          </div>

          {/* Navigation Buttons */}
          <button
            id="nav-setup-btn"
            onClick={() => onNavigate('setup')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'setup'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tạo đề</span>
          </button>

          <button
            id="nav-leaderboard-btn"
            onClick={() => onNavigate('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'leaderboard'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Bảng xếp hạng</span>
          </button>
        </div>
      </div>
    </header>
  );
};
