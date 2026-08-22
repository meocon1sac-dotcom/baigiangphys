import React from "react";
import {
  FileText,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { PhysicsProblem } from "../types";
import { MathRenderer } from "./MathRenderer";

interface ProblemSolverViewProps {
  problems: PhysicsProblem[];
}

export const ProblemSolverView: React.FC<ProblemSolverViewProps> = ({ problems }) => {
  if (!problems || problems.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        Chưa có bài tập mẫu có lời giải.
      </div>
    );
  }

  return (
    <div id="problem-solver-container" className="space-y-6">
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Bài Toán Điển Hình & Phương Pháp Giải Chi Tiết Từng Bước
          </h3>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Rèn luyện kỹ năng phân tích đề bài, lập tóm tắt đại lượng và biến đổi công thức chuẩn xác.
        </p>
      </div>

      <div className="space-y-6">
        {problems.map((prob, pIdx) => (
          <div
            key={prob.id || pIdx}
            className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6"
          >
            {/* Title & Statement */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold mb-3">
                <FileText className="w-3.5 h-3.5" />
                <span>Ví dụ mẫu {pIdx + 1}: {prob.title}</span>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm sm:text-base text-slate-200 leading-relaxed">
                <MathRenderer content={prob.problemStatement} />
              </div>
            </div>

            {/* Given Data & Required to Find Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Given Data */}
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  1. Tóm Tắt Dữ Kiện Đề Bài (Given Data):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {prob.givenData?.map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-yellow-400">{item.symbol}</span> ={" "}
                      <span className="font-mono text-cyan-300">{item.value} {item.unit}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required & Formulas */}
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                <div>
                  <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">
                    2. Yêu Cầu Cần Tính:
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                    {prob.requiredToFind?.map((req, idx) => (
                      <li key={idx}><MathRenderer content={req} /></li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    3. Công Thức Áp Dụng:
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-emerald-300">
                    {prob.formulaList?.map((formula, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-md">
                        <MathRenderer content={`$${formula}$`} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step by step calculations */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Tiến Trình Lời Giải Chi Tiết:
              </div>

              <div className="space-y-3">
                {prob.steps?.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                        {step.stepNumber || sIdx + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-cyan-200 border border-slate-800 overflow-x-auto text-sm sm:text-base">
                      <MathRenderer content={`$$${step.calculation}$$`} />
                    </div>

                    <div className="text-xs text-slate-400 italic">
                      <MathRenderer content={step.explanation} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Answer Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs uppercase font-bold text-emerald-400">Đáp Số Cuối Cùng</div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    <MathRenderer content={prob.finalAnswer} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
