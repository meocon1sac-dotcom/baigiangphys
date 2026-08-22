import React, { useState } from "react";
import { GitBranch, Sparkles, ChevronDown, ChevronRight, Atom } from "lucide-react";
import { MindMapNode } from "../types";
import { MathRenderer } from "./MathRenderer";

interface MindMapViewProps {
  rootNode: MindMapNode;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ rootNode }) => {
  if (!rootNode) return null;

  return (
    <div id="mindmap-container" className="space-y-6">
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <GitBranch className="w-5 h-5" />
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Sơ Đồ Tư Duy Kiến Thức (Physics Concept Map)
          </h3>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Hệ thống hóa toàn bộ mạch kiến thức, liên kết logic giữa định nghĩa, công thức và ứng dụng.
        </p>
      </div>

      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
        {/* Root concept hub */}
        <div className="p-5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/40 rounded-2xl text-center shadow-lg mb-8 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold mb-2">
            <Atom className="w-3.5 h-3.5" />
            <span>Chủ Đề Trung Tâm</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{rootNode.label}</h2>
          {rootNode.description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-1">{rootNode.description}</p>
          )}
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rootNode.children?.map((branch, bIdx) => (
            <BranchCard key={branch.id || bIdx} node={branch} index={bIdx} />
          ))}
        </div>
      </div>
    </div>
  );
};

const BranchCard: React.FC<{ node: MindMapNode; index: number }> = ({ node, index }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const colors = [
    "border-cyan-500/40 text-cyan-400 bg-cyan-950/20",
    "border-yellow-500/40 text-yellow-400 bg-yellow-950/20",
    "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
    "border-pink-500/40 text-pink-400 bg-pink-950/20",
  ];
  const colorClass = colors[index % colors.length];

  return (
    <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${colorClass}`}>
            Nhánh {index + 1}
          </span>
          {node.children && node.children.length > 0 && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        <h4 className="text-base font-bold text-white mt-2">
          {node.label}
        </h4>

        {node.description && (
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {node.description}
          </p>
        )}

        {node.formula && (
          <div className="mt-3 p-2 bg-slate-900 rounded-lg text-center font-mono text-xs text-cyan-300 border border-slate-800">
            <MathRenderer content={`$${node.formula}$`} />
          </div>
        )}
      </div>

      {/* Sub-branches */}
      {isOpen && node.children && node.children.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400">Chi tiết nhánh:</div>
          <div className="space-y-1.5">
            {node.children.map((sub, sIdx) => (
              <div
                key={sub.id || sIdx}
                className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60 text-xs text-slate-200"
              >
                <div className="font-semibold text-cyan-300">{sub.label}</div>
                {sub.description && (
                  <div className="text-[11px] text-slate-400 mt-0.5">{sub.description}</div>
                )}
                {sub.formula && (
                  <div className="text-[11px] font-mono text-yellow-300 mt-1">
                    <MathRenderer content={`$${sub.formula}$`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
