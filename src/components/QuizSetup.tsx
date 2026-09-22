import React, { useState, useRef } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Cpu,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { QuizConfig } from '../types';

interface QuizSetupProps {
  config: QuizConfig;
  onChangeConfig: (newConfig: Partial<QuizConfig>) => void;
  onGenerateQuiz: () => void;
  isLoading: boolean;
  loadingStep: string;
}

const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Khuyên dùng - Ổn định cao',
    description: 'Tốc độ phản hồi cực nhanh, hoạt động ổn định và xử lý trích xuất tài liệu chính xác.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Tiêu chuẩn',
    description: 'Mô hình đa năng cho phân tích văn bản và biên soạn câu hỏi trắc nghiệm.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    tag: 'Tư duy sâu',
    description: 'Khả năng lập luận logic cao, thích hợp đề vận dụng cao và phân tích phức tạp.',
  },
];

export const QuizSetup: React.FC<QuizSetupProps> = ({
  config,
  onChangeConfig,
  onGenerateQuiz,
  isLoading,
  loadingStep,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test API key connection
  const handleVerifyKey = async () => {
    setVerifyStatus({ loading: true });
    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          model: config.model,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 404
            ? 'Không tìm thấy API xác thực máy chủ (HTTP 404). Vui lòng kiểm tra lại dịch vụ backend.'
            : `Máy chủ phản hồi không đúng định dạng (${res.status}): ${text.slice(0, 100)}`
        );
      }

      if (res.ok && data.success) {
        setVerifyStatus({
          loading: false,
          success: true,
          message: data.usingDefault
            ? 'Đã kết nối thành công với khóa mặc định của hệ thống!'
            : 'Khóa API tùy chỉnh của bạn đã được kiểm tra và hoạt động tốt!',
        });
      } else {
        setVerifyStatus({
          loading: false,
          success: false,
          message: data.error || 'Kiểm tra thất bại. Vui lòng kiểm tra lại API Key.',
        });
      }
    } catch (err: any) {
      setVerifyStatus({
        loading: false,
        success: false,
        message: err.message || 'Lỗi kết nối tới máy chủ.',
      });
    }
  };

  // Handle file uploads (txt, md, pdf, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        onChangeConfig({
          documentFileName: fileName,
          documentFile: {
            name: fileName,
            mimeType: 'application/pdf',
            base64: base64Data,
          },
          topicName: config.topicName || fileName.replace(/\.[^/.]+$/, ''),
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text, markdown, doc, etc.
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        onChangeConfig({
          documentFileName: fileName,
          documentText: text,
          documentFile: null,
          topicName: config.topicName || fileName.replace(/\.[^/.]+$/, ''),
        });
      };
      reader.readAsText(file);
    }
  };

  const handleClearDocument = () => {
    onChangeConfig({
      documentFileName: undefined,
      documentText: '',
      documentFile: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const wordCount = config.documentText
    ? config.documentText.trim().split(/\s+/).filter(Boolean).length
    : config.documentFile
    ? 'Tệp tài liệu PDF đã sẵn sàng'
    : 0;

  const hasDocument = Boolean(config.documentText.trim() || config.documentFile);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Biên Soạn Đề Trắc Nghiệm Củng Cố Kiến Thức THPT
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Hệ thống AI tự động đọc tài liệu học tập của bạn, bóc tách dữ kiện và tạo đề kiểm tra 4 phương án kèm lời giải thích logic chi tiết.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: API Key & AI Model */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                1. Cấu hình AI & API Key
              </h2>
              <p className="text-xs text-slate-500">
                Nhập API Key của AI và lựa chọn mô hình ngôn ngữ xử lý
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="api-key-input"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  Gemini API Key
                </label>
                <span className="text-[11px] text-slate-500">
                  {config.apiKey ? 'Đang dùng khóa nhập tay' : 'Hệ thống tự nhận khóa mặc định'}
                </span>
              </div>

              <div className="relative">
                <input
                  id="api-key-input"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Dán mã API Key của bạn (AIzaSy...)"
                  value={config.apiKey}
                  onChange={(e) => onChangeConfig({ apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showApiKey ? 'Ẩn khóa' : 'Hiện khóa'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  id="verify-key-btn"
                  onClick={handleVerifyKey}
                  disabled={verifyStatus.loading}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {verifyStatus.loading ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Kiểm tra kết nối</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  Không chia sẻ khóa với ai
                </span>
              </div>

              {verifyStatus.message && (
                <div
                  className={`mt-2 p-2 rounded-lg text-xs flex items-start gap-1.5 ${
                    verifyStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {verifyStatus.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{verifyStatus.message}</span>
                </div>
              )}
            </div>

            {/* Model Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Chọn mô hình AI
              </label>
              <div className="space-y-2">
                {AVAILABLE_MODELS.map((m) => {
                  const isSelected = config.model === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => onChangeConfig({ model: m.id })}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">
                          {m.name}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {m.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Upload Document Content */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  2. Tài liệu nội dung kiến thức
                </h2>
                <p className="text-xs text-slate-500">
                  Toàn bộ câu hỏi trắc nghiệm sẽ chỉ lấy từ nội dung tài liệu này
                </p>
              </div>
            </div>

            {hasDocument && (
              <button
                type="button"
                onClick={handleClearDocument}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tài liệu</span>
              </button>
            )}
          </div>

          {/* File Upload Box */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-center"
            >
              <UploadCloud className="w-8 h-8 text-indigo-600 mb-1.5" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Nhấp để tải lên hoặc kéo thả tệp tài liệu bài học
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hỗ trợ tệp văn bản (.txt, .md) hoặc tài liệu PDF chuyên đề
              </p>
              {config.documentFileName && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã tải: {config.documentFileName}</span>
                </div>
              )}
            </label>
          </div>

          {/* Topic Name / Subject Hint */}
          <div className="mb-3">
            <label
              htmlFor="topic-input"
              className="text-xs font-semibold text-slate-700 mb-1 block"
            >
              Tên bài học hoặc chủ đề đề thi (tùy chọn)
            </label>
            <input
              id="topic-input"
              type="text"
              placeholder="Ví dụ: Sinh học 12 - Cơ chế di truyền và biến dị"
              value={config.topicName}
              onChange={(e) => onChangeConfig({ topicName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Document Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="doc-textarea"
                className="text-xs font-semibold text-slate-700"
              >
                Nội dung tài liệu học tập (có thể dán trực tiếp hoặc chỉnh sửa):
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {typeof wordCount === 'number' ? `${wordCount} từ` : wordCount}
              </span>
            </div>

            <textarea
              id="doc-textarea"
              rows={6}
              placeholder="Dán toàn bộ nội dung lý thuyết, bài giảng, hoặc tài liệu ôn tập của bạn vào đây. AI sẽ chỉ đặt câu hỏi dựa trên những nội dung này..."
              value={config.documentText}
              onChange={(e) => onChangeConfig({ documentText: e.target.value })}
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed font-sans"
            />

            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Quy tắc cam kết:</strong> Toàn bộ câu hỏi trắc nghiệm sẽ chỉ trích xuất từ dữ kiện trong tài liệu này, không sinh kiến thức ngoài.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Parameters: Number of questions, Time limit, Difficulty */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                3. Thông số đề thi
              </h2>
              <p className="text-xs text-slate-500">
                Thiết lập số lượng câu hỏi, thời gian làm bài và mức độ khó
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Number of questions (1 - 20) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="num-questions-slider"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Số lượng câu hỏi:
                </label>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {config.numQuestions} câu
                </span>
              </div>

              <input
                id="num-questions-slider"
                type="range"
                min={1}
                max={20}
                step={1}
                value={config.numQuestions}
                onChange={(e) =>
                  onChangeConfig({ numQuestions: parseInt(e.target.value, 10) })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 câu</span>
                <span>10 câu</span>
                <span>20 câu</span>
              </div>

              {/* Quick chips */}
              <div className="flex items-center gap-1.5 mt-3">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChangeConfig({ numQuestions: num })}
                    className={`flex-1 text-xs py-1 rounded-lg border font-medium transition-colors ${
                      config.numQuestions === num
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Time limit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Thời gian làm bài:
                </label>
                <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  {config.timeMinutes} phút
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[5, 10, 15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onChangeConfig({ timeMinutes: mins })}
                    className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-colors ${
                      config.timeMinutes === mins
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mins} phút
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                ~{( (config.timeMinutes * 60) / config.numQuestions ).toFixed(0)} giây / câu
              </p>
            </div>

            {/* Difficulty: 3 levels (Dễ, Bình thường, Khó) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                Độ khó (3 mức):
              </label>

              <div className="space-y-2">
                {[
                  {
                    id: 'easy',
                    label: 'Dễ',
                    sub: 'Nhận biết',
                    desc: 'Kiểm tra trực tiếp định nghĩa, sự kiện trong tài liệu',
                    color: 'emerald',
                  },
                  {
                    id: 'normal',
                    label: 'Bình thường',
                    sub: 'Thông hiểu',
                    desc: 'Hiểu bản chất, so sánh, phân biệt kiến thức',
                    color: 'indigo',
                  },
                  {
                    id: 'hard',
                    label: 'Khó',
                    sub: 'Vận dụng cao',
                    desc: 'Suy luận logic, giải bài toán, phân tích sâu',
                    color: 'rose',
                  },
                ].map((lvl) => {
                  const isSelected = config.difficulty === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() =>
                        onChangeConfig({
                          difficulty: lvl.id as 'easy' | 'normal' | 'hard',
                        })
                      }
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {lvl.label}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {lvl.sub}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {lvl.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Big Action Button: Tạo Đề */}
        <div className="pt-2 pb-6">
          <button
            id="create-quiz-btn"
            type="button"
            onClick={onGenerateQuiz}
            disabled={isLoading || !hasDocument}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base sm:text-lg shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{loadingStep || 'Hệ thống đang xử lý tạo đề trắc nghiệm...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Tạo Đề Trắc Nghiệm ({config.numQuestions} câu - {config.timeMinutes} phút)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {!hasDocument && (
            <p className="text-center text-xs text-rose-500 mt-2">
              * Vui lòng tải lên tài liệu học tập hoặc chọn một tài liệu mẫu ở trên để tạo đề.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
