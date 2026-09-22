import { LeaderboardEntry } from '../types';

const API_KEY_STORAGE = 'thpt_gemini_api_key';
const MODEL_STORAGE = 'thpt_gemini_model';
const LEADERBOARD_STORAGE = 'thpt_quiz_leaderboard';
const STUDENT_NAME_STORAGE = 'thpt_student_name';
const STUDENT_CLASS_STORAGE = 'thpt_student_class';

export function getSavedApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function getSavedModel(): string {
  try {
    return localStorage.getItem(MODEL_STORAGE) || 'gemini-3.1-flash-lite';
  } catch {
    return 'gemini-3.1-flash-lite';
  }
}

export function saveModel(model: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE, model);
  } catch (e) {
    console.error('Failed to save model to localStorage', e);
  }
}

export function getSavedStudentInfo(): { name: string; schoolClass: string } {
  try {
    return {
      name: localStorage.getItem(STUDENT_NAME_STORAGE) || '',
      schoolClass: localStorage.getItem(STUDENT_CLASS_STORAGE) || '12A1',
    };
  } catch {
    return { name: '', schoolClass: '12A1' };
  }
}

export function saveStudentInfo(name: string, schoolClass: string): void {
  try {
    localStorage.setItem(STUDENT_NAME_STORAGE, name.trim());
    localStorage.setItem(STUDENT_CLASS_STORAGE, schoolClass.trim());
  } catch (e) {
    console.error('Failed to save student info', e);
  }
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    studentName: 'Trần Minh Hoàng',
    studentClass: '12 Chuyên Sinh',
    quizTitle: 'Trắc nghiệm Sinh học 12 - Di truyền & Gen',
    score: 10,
    totalQuestions: 10,
    accuracy: 100,
    timeSpentSeconds: 245,
    difficulty: 'hard',
    completedAt: '2026-09-20T10:15:00Z',
  },
  {
    id: 'lb_2',
    studentName: 'Lê Thu Hương',
    studentClass: '12A2',
    quizTitle: 'Trắc nghiệm Lịch sử 12 - Chiến dịch Điện Biên Phủ',
    score: 9,
    totalQuestions: 10,
    accuracy: 90,
    timeSpentSeconds: 310,
    difficulty: 'normal',
    completedAt: '2026-09-21T14:30:00Z',
  },
  {
    id: 'lb_3',
    studentName: 'Nguyễn Quốc Tuấn',
    studentClass: '12A1',
    quizTitle: 'Trắc nghiệm Hóa học 12 - Este & Lipit',
    score: 8,
    totalQuestions: 10,
    accuracy: 80,
    timeSpentSeconds: 420,
    difficulty: 'normal',
    completedAt: '2026-09-21T16:45:00Z',
  },
  {
    id: 'lb_4',
    studentName: 'Phạm Phương Thảo',
    studentClass: '12A4',
    quizTitle: 'Trắc nghiệm Sinh học 12 - Mã di truyền',
    score: 8,
    totalQuestions: 10,
    accuracy: 80,
    timeSpentSeconds: 512,
    difficulty: 'easy',
    completedAt: '2026-09-22T08:20:00Z',
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  try {
    const current = getLeaderboard();
    const updated = [entry, ...current].sort((a, b) => {
      // Sort by score desc, then by timeSpent asc
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeSpentSeconds - b.timeSpentSeconds;
    });
    localStorage.setItem(LEADERBOARD_STORAGE, JSON.stringify(updated.slice(0, 50)));
    return updated;
  } catch (e) {
    console.error('Failed to save leaderboard entry', e);
    return [];
  }
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_STORAGE);
  } catch (e) {
    console.error('Failed to clear leaderboard', e);
  }
}
