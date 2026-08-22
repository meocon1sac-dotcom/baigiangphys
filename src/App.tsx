import React, { useState, useEffect } from "react";
import {
  Atom,
  Sparkles,
  Presentation,
  BookOpen,
  Zap,
  BrainCircuit,
  Calculator,
  GitBranch,
  PlusCircle,
  Share2,
  Bot,
  Layers,
  CheckCircle2,
  RefreshCw,
  History,
  RotateCcw,
  Sliders,
  Key
} from "lucide-react";
import { PhysicsLesson, GradeLevel, LectureDuration, TeachingMethod, PhysicsBranch } from "./types";
import { LessonGeneratorForm } from "./components/LessonGeneratorForm";
import { PresentationMode } from "./components/PresentationMode";
import { LessonPlanView } from "./components/LessonPlanView";
import { PhysicsSimulators } from "./components/PhysicsSimulators";
import { QuizSection } from "./components/QuizSection";
import { ProblemSolverView } from "./components/ProblemSolverView";
import { MindMapView } from "./components/MindMapView";
import { AiAssistantChat } from "./components/AiAssistantChat";
import { ExportModal } from "./components/ExportModal";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { getStoredApiKey } from "./utils/apiKeyStorage";

type ActiveTab = "slides" | "lesson_plan" | "simulation" | "quiz" | "problems" | "mindmap";

export default function App() {
  const [currentLesson, setCurrentLesson] = useState<PhysicsLesson | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("slides");
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [hasCustomApiKey, setHasCustomApiKey] = useState<boolean>(false);
  const [lessonHistory, setLessonHistory] = useState<PhysicsLesson[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved history and api key on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("physicraft_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLessonHistory(parsed);
          setCurrentLesson(parsed[0]);
        }
      }
      setHasCustomApiKey(Boolean(getStoredApiKey()));
    } catch (e) {
      console.warn("Failed to load local history", e);
    }

    const handleKeyChange = () => {
      setHasCustomApiKey(Boolean(getStoredApiKey()));
    };
    window.addEventListener("physicraft_api_key_changed", handleKeyChange);
    return () => window.removeEventListener("physicraft_api_key_changed", handleKeyChange);
  }, []);

  // If no saved lesson, automatically generate an initial demo lesson
  useEffect(() => {
    if (!currentLesson && !isLoading) {
      handleGenerateLesson({
        topic: "Định luật II Newton và phương trình chuyển động",
        subTopic: "Mối liên hệ giữa Lực, Khối lượng và Gia tốc",
        gradeLevel: "lop10",
        duration: "45min",
        method: "5e_model",
        branch: "mechanics",
      });
    }
  }, []);

  const handleGenerateLesson = async (params: {
    topic: string;
    subTopic?: string;
    gradeLevel: GradeLevel;
    duration: LectureDuration;
    method: TeachingMethod;
    branch: PhysicsBranch;
    customNotes?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const customApiKey = getStoredApiKey();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customApiKey) {
        headers["x-gemini-api-key"] = customApiKey;
      }

      const res = await fetch("/api/physics/generate-lesson", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...params,
          apiKey: customApiKey || undefined,
        }),
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Không thể phân tích dữ liệu trả về từ máy chủ.");
      }

      if (!res.ok) {
        throw new Error(data.error || `Lỗi máy chủ (${res.status})`);
      }

      if (data.lesson) {
        setCurrentLesson(data.lesson);
        setIsGeneratorOpen(false);
        setActiveTab("slides");

        // Save to history
        setLessonHistory((prev) => {
          const updated = [data.lesson, ...prev.filter((l) => l.id !== data.lesson.id)].slice(0, 10);
          try {
            localStorage.setItem("physicraft_history", JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi trong quá trình tạo bài giảng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
              <Atom className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                PhysiCraft AI
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Hệ Thống Soạn Bài Giảng & Mô Phỏng Vật Lý Thông Minh
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-open-api-key"
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                hasCustomApiKey
                  ? "bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60"
              }`}
              title="Cài đặt Google Gemini API Key cá nhân"
            >
              <Key className={`w-4 h-4 ${hasCustomApiKey ? "text-emerald-400" : "text-cyan-400"}`} />
              <span className="hidden md:inline">
                {hasCustomApiKey ? "Gemini Key: Bật" : "Cài API Key"}
              </span>
            </button>

            <button
              id="btn-new-lesson"
              onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md ${
                isGeneratorOpen
                  ? "bg-slate-800 border border-slate-700 text-white"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isGeneratorOpen ? "Đóng Soạn Thảo" : "Soạn Bài Mới"}</span>
            </button>

            {currentLesson && (
              <button
                id="btn-export-lesson"
                onClick={() => setIsExportOpen(true)}
                className="p-2 sm:px-3 sm:py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-colors text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                title="Xuất / In ấn bài giảng"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xuất & In</span>
              </button>
            )}

            <button
              id="btn-open-physibot"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl transition-all text-xs sm:text-sm font-bold"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Trợ lý PhysiBot</span>
            </button>
          </div>
        </div>

        {/* Navigation View Sub-tabs (when a lesson is active and not creating new) */}
        {currentLesson && !isGeneratorOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 overflow-x-auto">
            <nav className="flex items-center gap-2 py-2 text-xs sm:text-sm font-semibold min-w-max">
              <button
                id="tab-view-slides"
                onClick={() => setActiveTab("slides")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === "slides"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span>Slide Trình Chiếu</span>
                <span className="px-1.5 py-0.2 bg-cyan-500/20 rounded-md text-[10px] font-mono">
                  {currentLesson.slides?.length || 0}
                </span>
              </button>

              <button
                id="tab-view-plan"
                onClick={() => setActiveTab("lesson_plan")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === "lesson_plan"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Giáo Án Sư Phạm 5E</span>
              </button>

              <button
                id="tab-view-simulation"
                onClick={() => setActiveTab("simulation")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === "simulation"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Thí Nghiệm Ảo</span>
              </button>

              <button
                id="tab-view-quiz"
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === "quiz"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Trắc Nghiệm Tự Luyện</span>
                <span className="px-1.5 py-0.2 bg-yellow-500/20 text-yellow-300 rounded-md text-[10px] font-mono">
                  {currentLesson.quizzes?.length || 0}
                </span>
              </button>

              <button
                id="tab-view-problems"
                onClick={() => setActiveTab("problems")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === "problems"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Bài Toán & Lời Giải</span>
              </button>

              <button
                id="tab-view-mindmap"
                onClick={() => setActiveTab("mindmap")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === "mindmap"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Sơ Đồ Tư Duy</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-4">
            <div>
              <strong>Lỗi: </strong> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1 bg-rose-800/60 rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-12 bg-slate-900/90 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <div className="inline-flex p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white">
              AI Đang Phân Tích & Thiết Kế Bài Giảng Vật Lý...
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Hệ thống đang cấu trúc hóa mục tiêu 5E, tổng hợp công thức LaTeX, tạo slide trình chiếu và cấu hình phòng thí nghiệm mô phỏng.
            </p>
          </div>
        )}

        {/* Lesson Generator Form (Modal/Drawer Mode) */}
        {isGeneratorOpen && !isLoading && (
          <div className="animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Soạn Thảo Bài Giảng Mới
              </h2>
              {currentLesson && (
                <button
                  onClick={() => setIsGeneratorOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Quay lại bài giảng hiện tại
                </button>
              )}
            </div>

            <LessonGeneratorForm
              onGenerate={handleGenerateLesson}
              isLoading={isLoading}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          </div>
        )}

        {/* Current Lesson View */}
        {!isGeneratorOpen && !isLoading && currentLesson && (
          <div className="space-y-6">
            {/* View Sub-Tab Content */}
            {activeTab === "slides" && (
              <PresentationMode
                slides={currentLesson.slides}
                lessonTitle={currentLesson.overview.title}
              />
            )}

            {activeTab === "lesson_plan" && (
              <LessonPlanView lesson={currentLesson} />
            )}

            {activeTab === "simulation" && (
              <PhysicsSimulators config={currentLesson.simulation} />
            )}

            {activeTab === "quiz" && (
              <QuizSection quizzes={currentLesson.quizzes} />
            )}

            {activeTab === "problems" && (
              <ProblemSolverView problems={currentLesson.problems} />
            )}

            {activeTab === "mindmap" && (
              <MindMapView rootNode={currentLesson.mindMap} />
            )}
          </div>
        )}
      </main>

      {/* Floating AI Chat Assistant */}
      <AiAssistantChat
        lesson={currentLesson}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Export Modal */}
      {currentLesson && (
        <ExportModal
          lesson={currentLesson}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PhysiCraft AI • Nền tảng biên soạn bài giảng và mô phỏng Vật lý thông minh
          </div>
          <div className="text-slate-400">
            Powered by Google Gemini 3.7 Flash & Web Simulations
          </div>
        </div>
      </footer>
    </div>
  );
}
