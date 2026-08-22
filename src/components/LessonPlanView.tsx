import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  UserCheck,
  GraduationCap,
  Sparkles,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  Wrench,
  BookOpen,
  HelpCircle,
  FileDown
} from "lucide-react";
import { PhysicsLesson } from "../types";
import { MathRenderer } from "./MathRenderer";

interface LessonPlanViewProps {
  lesson: PhysicsLesson;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ lesson }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyText = () => {
    const text = `GIÁO ÁN VẬT LÝ: ${lesson.overview.title}
Cấp độ: ${lesson.gradeLevel} | Thời lượng: ${lesson.duration} | Phương pháp: ${lesson.method}

I. MỤC TIÊU BÀI HỌC:
1. Kiến thức:
${lesson.overview.knowledgeObjectives.map((o, i) => `  - ${o}`).join("\n")}
2. Kĩ năng:
${lesson.overview.skillObjectives.map((o, i) => `  - ${o}`).join("\n")}
3. Phẩm chất & Thái độ:
${lesson.overview.attitudeObjectives.map((o, i) => `  - ${o}`).join("\n")}

II. CÔNG THỨC TRỌNG TÂM:
${lesson.overview.keyFormulas.map((f) => `  * ${f.name}: ${f.latex} (${f.explanation})`).join("\n")}

III. TIẾN TRÌNH DẠY HỌC (HOẠT ĐỘNG):
${lesson.activities.map((a) => `[${a.phaseName} - ${a.durationMinutes} phút]\n- GV: ${a.teacherAction}\n- HS: ${a.studentAction}\n- Nội dung: ${a.keyContent}\n`).join("\n")}

IV. HƯỚNG DẪN THÍ NGHIỆM THỰC HÀNH:
Tên thí nghiệm: ${lesson.experimentalGuide.title}
- Dụng cụ: ${lesson.experimentalGuide.toolsNeeded.join(", ")}
- Các bước: \n${lesson.experimentalGuide.steps.map((s, i) => `  ${i+1}. ${s}`).join("\n")}
- Hiện tượng kỳ vọng: ${lesson.experimentalGuide.expectedPhenomenon}
- Phân tích sai số: ${lesson.experimentalGuide.errorAnalysis}

V. TỔNG KẾT & GHI NHỚ:
${lesson.summaryTakeaways.map((t) => `  + ${t}`).join("\n")}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="lesson-plan-view" className="space-y-6 print:space-y-4 print:text-black">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md print:hidden">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Kế Hoạch Bài Dạy Chuẩn Sư Phạm (Lesson Plan)
          </h3>
          <p className="text-xs text-slate-400">
            Biên soạn theo cấu trúc tích hợp năng lực, kịch bản 5 giai đoạn sư phạm và hướng dẫn thực hành.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-lesson"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Đã sao chép" : "Sao chép văn bản"}
          </button>

          <button
            id="btn-print-lesson"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            In giáo án (PDF)
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-8 print:bg-white print:border-none print:p-0 print:text-slate-900">
        {/* Header Title Section */}
        <div className="border-b border-slate-800 pb-6 print:border-slate-300">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold">
              Chuyên đề Vật lý
            </span>
            <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs font-medium">
              Thời lượng: {lesson.duration}
            </span>
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold">
              Phương pháp: {lesson.method}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight">
            {lesson.overview.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 print:text-slate-700 mt-2 leading-relaxed italic">
            {lesson.overview.abstract}
          </p>
        </div>

        {/* Section 1: Objectives (Mục tiêu bài học) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-cyan-400 print:text-cyan-800 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            I. Mục Tiêu Dạy Học (Learning Objectives)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Knowledge */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 print:border-slate-300 print:bg-slate-50">
              <div className="text-xs font-bold text-cyan-300 print:text-cyan-800 uppercase">
                1. Về Kiến Thức
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 print:text-slate-800">
                {lesson.overview.knowledgeObjectives?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-1" />
                    <span><MathRenderer content={item} /></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 print:border-slate-300 print:bg-slate-50">
              <div className="text-xs font-bold text-yellow-300 print:text-yellow-800 uppercase">
                2. Về Kĩ Năng
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 print:text-slate-800">
                {lesson.overview.skillObjectives?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-1" />
                    <span><MathRenderer content={item} /></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attitude */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 print:border-slate-300 print:bg-slate-50">
              <div className="text-xs font-bold text-emerald-300 print:text-emerald-800 uppercase">
                3. Về Phẩm Chất & Thái Độ
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 print:text-slate-800">
                {lesson.overview.attitudeObjectives?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                    <span><MathRenderer content={item} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Key Formulas Table */}
        {lesson.overview.keyFormulas && lesson.overview.keyFormulas.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-cyan-400 print:text-cyan-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              II. Hệ Thống Công Thức Trọng Tâm
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.overview.keyFormulas.map((formula, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 print:border-slate-300"
                >
                  <div className="text-xs font-bold text-slate-300 print:text-slate-800">
                    {formula.name}
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg text-center font-mono text-cyan-300 print:text-black border border-slate-800 print:border-slate-300 overflow-x-auto">
                    <MathRenderer content={`$$${formula.latex}$$`} />
                  </div>
                  <div className="text-xs text-slate-400 print:text-slate-700 leading-relaxed">
                    <MathRenderer content={formula.explanation} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Detailed Step-by-Step Pedagogical Phases (Tiến trình dạy học) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-cyan-400 print:text-cyan-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5" />
            III. Tiến Trình Dạy Học Chi Tiết (5 Pha Sư Phạm)
          </h2>

          <div className="space-y-4">
            {lesson.activities?.map((act, idx) => (
              <div
                key={act.id || idx}
                className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 print:border-slate-300 print:bg-slate-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 print:border-slate-200">
                  <div className="font-bold text-white print:text-black text-sm sm:text-base">
                    {act.phaseName}
                  </div>
                  <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-300 rounded-full text-xs font-mono font-bold">
                    {act.durationMinutes} phút
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 print:border-slate-200">
                    <div className="font-semibold text-cyan-400 print:text-cyan-800 mb-1 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      Hoạt động của Giáo viên:
                    </div>
                    <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                      {act.teacherAction}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 print:border-slate-200">
                    <div className="font-semibold text-yellow-400 print:text-yellow-800 mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      Hoạt động của Học sinh:
                    </div>
                    <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                      {act.studentAction}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-400 print:text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-300 print:text-slate-900">Nội dung sản phẩm: </span>
                    <MathRenderer content={act.keyContent} />
                  </div>
                  {act.pedagogicalTip && (
                    <div className="text-amber-400/90 italic">
                      💡 Mẹo: {act.pedagogicalTip}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Experimental Guide (Thực hành thí nghiệm) */}
        {lesson.experimentalGuide && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-cyan-400 print:text-cyan-800 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              IV. Hướng Dẫn Thí Nghiệm & Thực Hành
            </h2>

            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4 print:border-slate-300">
              <h3 className="text-base font-bold text-white print:text-black">
                {lesson.experimentalGuide.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    Dụng cụ cần thiết:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-slate-800">
                    {lesson.experimentalGuide.toolsNeeded?.map((tool, idx) => (
                      <li key={idx}><MathRenderer content={tool} /></li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-rose-400 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    An toàn & Lưu ý:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-slate-800">
                    {lesson.experimentalGuide.safetyPrecautions?.map((sec, idx) => (
                      <li key={idx}><MathRenderer content={sec} /></li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-bold text-slate-200 print:text-slate-900 text-xs sm:text-sm">
                  Các bước tiến hành:
                </div>
                <div className="space-y-1.5">
                  {lesson.experimentalGuide.steps?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 print:text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span><MathRenderer content={step} /></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected & Error analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-300">
                  <span className="font-bold">Hiện tượng kỳ vọng: </span>
                  <MathRenderer content={lesson.experimentalGuide.expectedPhenomenon} />
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-amber-300">
                  <span className="font-bold">Phân tích sai số: </span>
                  <MathRenderer content={lesson.experimentalGuide.errorAnalysis} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Summary Takeaways (Ghi nhớ) */}
        <div className="space-y-3 p-5 bg-gradient-to-br from-slate-950 to-cyan-950/30 border border-cyan-500/30 rounded-xl">
          <h2 className="text-base font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            V. Tổng Kết & Ghi Nhớ Cốt Lõi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
            {lesson.summaryTakeaways?.map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><MathRenderer content={takeaway} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
