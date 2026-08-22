import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Atom,
  Lightbulb,
  Compass,
  FileText
} from "lucide-react";
import { SlideContent } from "../types";
import { MathRenderer } from "./MathRenderer";

interface PresentationModeProps {
  slides: SlideContent[];
  lessonTitle: string;
  onExit?: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  lessonTitle,
  onExit,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "n" || e.key === "N") {
        setShowSpeakerNotes((prev) => !prev);
      } else if (e.key === "Escape" && onExit && !document.fullscreenElement) {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onExit]);

  if (!slides || slides.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        Chưa có dữ liệu slide bài giảng.
      </div>
    );
  }

  const progressPercentage = ((currentSlideIndex + 1) / slides.length) * 100;

  return (
    <div
      id="presentation-container"
      className="relative flex flex-col justify-between min-h-[580px] lg:min-h-[640px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
    >
      {/* Top Slide Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
            <Atom className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-md">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide count indicator */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-400 rounded-lg border border-slate-700/60 transition-colors"
          >
            Trang {currentSlideIndex + 1} / {slides.length}
          </button>

          {/* Speaker notes toggle button */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showSpeakerNotes
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white"
            }`}
            title="Bật/Tắt Ghi chú giáo viên (Phím N)"
          >
            {showSpeakerNotes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700/60 transition-colors"
            title="Toàn màn hình (Phím F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Slide Progress Top Line */}
      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Main Slide Body Canvas */}
      <div className="relative flex-1 p-6 sm:p-10 lg:p-14 flex flex-col justify-center max-w-5xl mx-auto w-full">
        {/* Slide Visual Category Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-full w-fit mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Slide {currentSlide.slideNumber} • {currentSlide.subtitle || "Khái niệm trọng tâm"}</span>
        </div>

        {/* Slide Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {currentSlide.title}
        </h2>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bullet Points Section */}
          <div className="lg:col-span-7 space-y-3.5">
            {currentSlide.bulletPoints?.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-850/50 hover:bg-slate-800/60 rounded-xl border border-slate-800/80 transition-all"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  <MathRenderer content={bullet} />
                </div>
              </div>
            ))}

            {/* Real World Application Badge */}
            {currentSlide.realWorldApplication && (
              <div className="flex items-start gap-3 p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs sm:text-sm text-emerald-300">
                <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-200">Ứng dụng thực tế: </span>
                  <MathRenderer content={currentSlide.realWorldApplication} />
                </div>
              </div>
            )}
          </div>

          {/* Right Card: Highlight Formula / Key Concept Box */}
          <div className="lg:col-span-5 space-y-4">
            {currentSlide.formulaLatex && (
              <div className="p-5 bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/40 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Atom className="w-20 h-20 text-cyan-400" />
                </div>
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Công thức then chốt
                </div>
                <div className="py-2 text-center text-lg sm:text-xl font-mono text-cyan-200 overflow-x-auto">
                  <MathRenderer content={`$$${currentSlide.formulaLatex}$$`} />
                </div>
              </div>
            )}

            {currentSlide.keyConcept && (
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-300">
                <span className="font-bold text-yellow-400">Khắc sâu kiến thức: </span>
                <MathRenderer content={currentSlide.keyConcept} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speaker Notes Drawer (Teacher Mode) */}
      {showSpeakerNotes && currentSlide.presenterNotes && (
        <div className="mx-6 mb-2 p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Lời Giảng Gợi Ý Dành Cho Giáo Viên (Speaker Notes):
          </div>
          <p className="text-sm text-amber-100/90 leading-relaxed">
            {currentSlide.presenterNotes}
          </p>
        </div>
      )}

      {/* Thumbnails Drawer Overlay */}
      {showThumbnails && (
        <div className="absolute inset-x-0 bottom-16 bg-slate-950/95 border-t border-slate-800 p-4 backdrop-blur-xl z-20 overflow-x-auto">
          <div className="flex items-center gap-3">
            {slides.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setShowThumbnails(false);
                }}
                className={`flex-shrink-0 w-36 h-24 p-2 text-left rounded-lg border text-xs transition-all ${
                  idx === currentSlideIndex
                    ? "bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-[10px] text-slate-400">Slide {idx + 1}</div>
                <div className="font-semibold text-white truncate mt-1">{s.title}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{s.keyConcept}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md">
        <div className="text-xs text-slate-400 hidden sm:block">
          Dùng phím mũi tên <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">→</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Space</kbd>
        </div>

        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            id="btn-slide-prev"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Trang trước
          </button>

          <button
            id="btn-slide-next"
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center gap-1 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20"
          >
            Trang tiếp
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
