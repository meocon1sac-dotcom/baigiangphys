import React, { useState } from "react";
import { X, Download, Copy, Check, FileText, Printer, Code, Share2 } from "lucide-react";
import { PhysicsLesson } from "../types";

interface ExportModalProps {
  lesson: PhysicsLesson;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  lesson,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    return `# ${lesson.overview.title}

> **Phân ngành:** ${lesson.branch} | **Khối lớp:** ${lesson.gradeLevel} | **Thời lượng:** ${lesson.duration}

## Tóm Tắt Bài Học
${lesson.overview.abstract}

## I. Mục Tiêu Dạy Học
### 1. Kiến thức
${lesson.overview.knowledgeObjectives.map((k) => `- ${k}`).join("\n")}

### 2. Kĩ năng
${lesson.overview.skillObjectives.map((s) => `- ${s}`).join("\n")}

### 3. Phẩm chất
${lesson.overview.attitudeObjectives.map((a) => `- ${a}`).join("\n")}

## II. Hệ Thống Công Thức
${lesson.overview.keyFormulas.map((f) => `### ${f.name}\n$$${f.latex}$$\n*${f.explanation}*`).join("\n\n")}

## III. Tiến Trình Dạy Học (Kịch Bản Tiết Học)
${lesson.activities.map((act) => `### ${act.phaseName} (${act.durationMinutes} phút)\n- **GV:** ${act.teacherAction}\n- **HS:** ${act.studentAction}\n- **Nội dung:** ${act.keyContent}\n- *Mẹo sư phạm:* ${act.pedagogicalTip}`).join("\n\n")}

## IV. Slide Trình Chiếu (${lesson.slides.length} Slides)
${lesson.slides.map((s) => `### Slide ${s.slideNumber}: ${s.title}\n*${s.subtitle || ""}*\n${s.bulletPoints.map((b) => `- ${b}`).join("\n")}\n${s.formulaLatex ? `\n$$${s.formulaLatex}$$\n` : ""}\n> **Ghi chú GV:** ${s.presenterNotes}`).join("\n\n")}

## V. Câu Hỏi Trắc Nghiệm
${lesson.quizzes.map((q, idx) => `**Câu ${idx + 1}:** ${q.question}\n${q.options.map((opt) => `- ${opt}`).join("\n")}\n*Đáp án đúng:* ${String.fromCharCode(65 + q.correctIndex)}\n*Giải thích:* ${q.explanation}`).join("\n\n")}

## VI. Thí Nghiệm & Thực Hành
**Tên thí nghiệm:** ${lesson.experimentalGuide.title}
- **Dụng cụ:** ${lesson.experimentalGuide.toolsNeeded.join(", ")}
- **Các bước thực hiện:**
${lesson.experimentalGuide.steps.map((st, i) => `${i + 1}. ${st}`).join("\n")}
- **Hiện tượng:** ${lesson.experimentalGuide.expectedPhenomenon}
- **Sai số:** ${lesson.experimentalGuide.errorAnalysis}
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lesson.topic.replace(/\s+/g, "_")}_GiaoAn.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(lesson, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lesson.topic.replace(/\s+/g, "_")}_DuLieu.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            Xuất & Chia Sẻ Bài Giảng
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-300">
            Chọn định dạng bạn muốn xuất để sử dụng trong giảng dạy hoặc lưu trữ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Markdown */}
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-3 p-3.5 bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 hover:border-cyan-500/50 rounded-xl transition-all"
            >
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">Tải Markdown (.md)</div>
                <div className="text-[11px] text-slate-400">Tương thích Notion, Obsidian</div>
              </div>
            </button>

            {/* Print PDF */}
            <button
              onClick={() => {
                onClose();
                setTimeout(() => window.print(), 200);
              }}
              className="flex items-center gap-3 p-3.5 bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 hover:border-cyan-500/50 rounded-xl transition-all"
            >
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">In / Xuất PDF</div>
                <div className="text-[11px] text-slate-400">Chuẩn in ấn A4 sư phạm</div>
              </div>
            </button>

            {/* JSON Data */}
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-3 p-3.5 bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 hover:border-cyan-500/50 rounded-xl transition-all"
            >
              <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-lg">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">Tải Dữ Liệu (.json)</div>
                <div className="text-[11px] text-slate-400">Cấu trúc dữ liệu đầy đủ</div>
              </div>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-3 p-3.5 bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 hover:border-cyan-500/50 rounded-xl transition-all"
            >
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-white">{copied ? "Đã sao chép!" : "Sao chép toàn bộ"}</div>
                <div className="text-[11px] text-slate-400">Lưu vào bộ nhớ tạm</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
