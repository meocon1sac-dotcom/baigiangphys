import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BrainCircuit,
  Lightbulb
} from "lucide-react";
import { QuizQuestion } from "../types";
import { MathRenderer } from "./MathRenderer";

interface QuizSectionProps {
  quizzes: QuizQuestion[];
  onGenerateMore?: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ quizzes }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isCompleted) return; // Prevent changing after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleCheckAnswers = () => {
    setIsCompleted(true);
    // Show all explanations
    const allExp: Record<string, boolean> = {};
    quizzes.forEach((q) => {
      allExp[q.id] = true;
    });
    setShowExplanation(allExp);

    // Calculate score
    const correctCount = quizzes.filter(
      (q) => userAnswers[q.id] === q.correctIndex
    ).length;

    if (correctCount >= Math.ceil(quizzes.length * 0.75)) {
      // Fire confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#eab308", "#22c55e", "#ec4899"],
      });
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setShowExplanation({});
    setShowHint({});
    setIsCompleted(false);
  };

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        Chưa có câu hỏi trắc nghiệm cho bài học này.
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = quizzes.filter(
    (q) => userAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((correctCount / quizzes.length) * 100);

  return (
    <div id="quiz-section-container" className="space-y-6">
      {/* Quiz Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Trắc Nghiệm Kiểm Tra & Khắc Sâu Kiến Thức
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Đã trả lời: <span className="font-semibold text-cyan-400">{answeredCount}/{quizzes.length}</span> câu hỏi
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isCompleted ? (
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại bài kiểm tra
            </button>
          ) : (
            <button
              id="btn-submit-quiz"
              onClick={handleCheckAnswers}
              disabled={answeredCount === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20"
            >
              <CheckCircle className="w-4 h-4" />
              Nộp bài & Xem giải thích
            </button>
          )}
        </div>
      </div>

      {/* Completion Summary Score Card */}
      {isCompleted && (
        <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-yellow-500/20 text-yellow-400 rounded-2xl border border-yellow-500/30">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Kết Quả Đánh Giá
              </div>
              <div className="text-2xl font-black text-white">
                Đúng {correctCount} / {quizzes.length} câu ({scorePercent}%)
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {scorePercent >= 80
                  ? "Xuất sắc! Bạn đã nắm rất vững kiến thức bài học."
                  : scorePercent >= 50
                  ? "Khá tốt! Hãy đọc lại phần giải thích chi tiết bên dưới để bổ sung lỗ hổng kiến thức."
                  : "Cần cố gắng thêm! Hãy xem lại phần slide và thực hành thêm thí nghiệm ảo."}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="text-3xl font-black text-cyan-400 font-mono">
              {scorePercent >= 80 ? "⭐ A+" : scorePercent >= 65 ? "👍 B" : "📘 C"}
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {quizzes.map((quiz, qIdx) => {
          const selectedOption = userAnswers[quiz.id];
          const isCorrect = isCompleted && selectedOption === quiz.correctIndex;
          const isWrong = isCompleted && selectedOption !== undefined && selectedOption !== quiz.correctIndex;

          return (
            <div
              key={quiz.id || qIdx}
              className={`p-6 rounded-2xl border transition-all ${
                isCompleted
                  ? isCorrect
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : isWrong
                    ? "bg-rose-950/20 border-rose-500/40"
                    : "bg-slate-900 border-slate-800"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 font-bold text-xs shrink-0 mt-0.5 border border-slate-700">
                    {qIdx + 1}
                  </span>
                  <div className="text-base font-medium text-white leading-relaxed">
                    <MathRenderer content={quiz.question} />
                  </div>
                </div>

                {/* Difficulty badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  quiz.difficulty === "easy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : quiz.difficulty === "hard"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
                  {quiz.difficulty === "easy" ? "Cơ bản" : quiz.difficulty === "hard" ? "Nâng cao" : "Thông hiểu"}
                </span>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {quiz.options.map((option, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrectOption = isCompleted && optIdx === quiz.correctIndex;
                  const isThisWrongSelected = isCompleted && isThisSelected && optIdx !== quiz.correctIndex;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(quiz.id, optIdx)}
                      disabled={isCompleted}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-sm transition-all ${
                        isThisCorrectOption
                          ? "bg-emerald-900/40 border-emerald-500 text-emerald-100 font-medium"
                          : isThisWrongSelected
                          ? "bg-rose-900/40 border-rose-500 text-rose-100 font-medium"
                          : isThisSelected
                          ? "bg-cyan-950/60 border-cyan-400 text-cyan-100 font-medium ring-1 ring-cyan-400/50"
                          : "bg-slate-950/50 border-slate-800 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                        isThisCorrectOption
                          ? "bg-emerald-500 text-slate-950"
                          : isThisWrongSelected
                          ? "bg-rose-500 text-white"
                          : isThisSelected
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>

                      <div className="flex-1">
                        <MathRenderer content={option} />
                      </div>

                      {isThisCorrectOption && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {isThisWrongSelected && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint button */}
              {quiz.hint && !isCompleted && (
                <div className="mt-2">
                  <button
                    onClick={() =>
                      setShowHint((prev) => ({
                        ...prev,
                        [quiz.id]: !prev[quiz.id],
                      }))
                    }
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    {showHint[quiz.id] ? "Ẩn gợi ý" : "Xem gợi ý tư duy"}
                  </button>

                  {showHint[quiz.id] && (
                    <div className="mt-2 p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                      💡 <strong>Gợi ý: </strong>
                      <MathRenderer content={quiz.hint} />
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Explanation Drawer */}
              {isCompleted && (
                <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Lời Giải Chi Tiết:
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    <MathRenderer content={quiz.explanation} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
