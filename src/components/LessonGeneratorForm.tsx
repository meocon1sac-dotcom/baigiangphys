import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Layers,
  Clock,
  GraduationCap,
  Wrench,
  Search,
  Check,
  RotateCcw,
  Zap,
  Tag,
  Key,
  ShieldCheck
} from "lucide-react";
import { GradeLevel, LectureDuration, TeachingMethod, PhysicsBranch } from "../types";
import { PRESET_TOPICS, BRANCH_LABELS, PhysicsPreset } from "../data/presets";
import { getStoredApiKey, maskApiKey } from "../utils/apiKeyStorage";

interface LessonGeneratorFormProps {
  onGenerate: (formData: {
    topic: string;
    subTopic?: string;
    gradeLevel: GradeLevel;
    duration: LectureDuration;
    method: TeachingMethod;
    branch: PhysicsBranch;
    customNotes?: string;
  }) => void;
  isLoading: boolean;
  onOpenApiKeyModal?: () => void;
}

export const LessonGeneratorForm: React.FC<LessonGeneratorFormProps> = ({
  onGenerate,
  isLoading,
  onOpenApiKeyModal,
}) => {
  const [topic, setTopic] = useState<string>("Định luật II Newton và phương trình chuyển động");
  const [subTopic, setSubTopic] = useState<string>("Mối liên hệ giữa Lực, Khối lượng và Gia tốc");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("lop10");
  const [duration, setDuration] = useState<LectureDuration>("45min");
  const [method, setMethod] = useState<TeachingMethod>("5e_model");
  const [branch, setBranch] = useState<PhysicsBranch>("mechanics");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset_newton2");
  const [currentApiKey, setCurrentApiKey] = useState<string>("");

  useEffect(() => {
    setCurrentApiKey(getStoredApiKey());
    const handleKeyChange = () => {
      setCurrentApiKey(getStoredApiKey());
    };
    window.addEventListener("physicraft_api_key_changed", handleKeyChange);
    return () => window.removeEventListener("physicraft_api_key_changed", handleKeyChange);
  }, []);

  const handleSelectPreset = (preset: PhysicsPreset) => {
    setSelectedPresetId(preset.id);
    setTopic(preset.topic);
    setSubTopic(preset.subTopic);
    setBranch(preset.branch);
    setGradeLevel(preset.gradeLevel);
    setDuration(preset.duration);
    setMethod(preset.method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    onGenerate({
      topic: topic.trim(),
      subTopic: subTopic.trim() || undefined,
      gradeLevel,
      duration,
      method,
      branch,
      customNotes: customNotes.trim() || undefined,
    });
  };

  return (
    <div id="lesson-generator-form-container" className="space-y-6">
      {/* Preset Topics Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Chọn Nhanh Chủ Đề Vật Lý Mẫu (Curated Topics)
          </label>
          <span className="text-[11px] text-slate-500">Hoặc tự nhập chủ đề bên dưới</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TOPICS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const branchInfo = BRANCH_LABELS[preset.branch];

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/30 text-white shadow-lg"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${branchInfo.color}`}>
                    {branchInfo.name.split(" ")[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </div>

                <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                  {preset.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Generator Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-6 shadow-xl backdrop-blur-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Tên Chủ Đề / Bài Dạy Chính *
            </label>
            <input
              id="input-topic"
              type="text"
              required
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setSelectedPresetId("");
              }}
              placeholder="VD: Định luật vạn vật hấp dẫn, Giao thoa sóng..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* SubTopic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-yellow-400" />
              Chủ Đề Nhánh / Trọng Tâm Đi Sâu (Tùy chọn)
            </label>
            <input
              id="input-subtopic"
              type="text"
              value={subTopic}
              onChange={(e) => setSubTopic(e.target.value)}
              placeholder="VD: Ứng dụng vệ tinh, Thí nghiệm giao thoa khe Young..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Form Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Branch */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Phân Ngành Vật Lý</label>
            <select
              id="select-branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value as PhysicsBranch)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="mechanics">Cơ học (Mechanics)</option>
              <option value="thermodynamics">Nhiệt học (Thermodynamics)</option>
              <option value="electromagnetism">Điện & Từ (Electromagnetism)</option>
              <option value="optics">Quang học (Optics)</option>
              <option value="waves_oscillations">Dao động & Sóng (Waves)</option>
              <option value="quantum_nuclear">Lượng tử & Hạt nhân (Quantum)</option>
              <option value="astrophysics">Thiên văn & Vũ trụ (Astrophysics)</option>
            </select>
          </div>

          {/* Grade Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Khối Lớp / Đối Tượng</label>
            <select
              id="select-grade"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="lop6_9">THCS (Lớp 6 - 9)</option>
              <option value="lop10">Lớp 10 (Chương trình GDPT 2018)</option>
              <option value="lop11">Lớp 11 (Chương trình GDPT 2018)</option>
              <option value="lop12">Lớp 12 (Chương trình GDPT 2018)</option>
              <option value="daihoc">Đại học / Chuyên sâu</option>
              <option value="daichung">Khoa học phổ thông</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Thời Lượng Tiết Học</label>
            <select
              id="select-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value as LectureDuration)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="15min">15 phút (Bài giảng nhanh / Vi mô)</option>
              <option value="45min">45 phút (1 tiết chuẩn trên lớp)</option>
              <option value="90min">90 phút (2 tiết chuyên đề)</option>
              <option value="project">Dự án STEM nhiều buổi</option>
            </select>
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Phương Pháp Giảng Dạy</label>
            <select
              id="select-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as TeachingMethod)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="5e_model">Mô hình 5E (Khởi động - Khám phá...)</option>
              <option value="stem_hands_on">STEM thực hành & Chế tạo</option>
              <option value="standard_theory">Lý thuyết & Bài tập chuẩn</option>
              <option value="interactive_discovery">Khám phá qua mô phỏng tương tác</option>
            </select>
          </div>
        </div>

        {/* Custom Teacher Instructions */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Yêu Cầu Tùy Biến Bổ Sung (Dành cho Giáo viên)</span>
            <span className="text-[10px] text-slate-500 font-normal">Tùy chọn</span>
          </label>
          <textarea
            id="textarea-custom-notes"
            rows={2}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="VD: Nhấn mạnh câu hỏi bẫy học sinh hay mắc sai lầm, đưa thêm ví dụ về công nghệ bán dẫn hoặc động cơ xe điện..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
          />
        </div>

        {/* Gemini API Key Quick Status */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${currentApiKey ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"}`}>
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">
                {currentApiKey ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span>Đang dùng API Key cá nhân ({maskApiKey(currentApiKey)})</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                ) : (
                  <span className="text-slate-300">
                    Chế độ mặc định (hoặc nhập API Key cá nhân để mở rộng hạn mức)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Sử dụng Gemini 3.7 Flash để tạo giáo án, bài tập và slide tự động.
              </div>
            </div>
          </div>

          {onOpenApiKeyModal && (
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3 h-3" />
              <span>{currentApiKey ? "Đổi API Key" : "Nhập API Key"}</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>AI sẽ tạo đồng thời: <strong>Giáo án 5E</strong>, <strong>Slide trình chiếu</strong>, <strong>Thí nghiệm ảo</strong>, <strong>Trắc nghiệm</strong> & <strong>Sơ đồ tư duy</strong>.</span>
          </div>

          <button
            id="btn-generate-lesson"
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>AI Đang Soạn Bài Giảng...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tạo Bài Giảng Vật Lý Bằng AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
