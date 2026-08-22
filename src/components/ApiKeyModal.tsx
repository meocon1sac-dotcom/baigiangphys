import React, { useState, useEffect } from "react";
import {
  Key,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Sparkles,
  Info,
  Check
} from "lucide-react";
import {
  getStoredApiKey,
  setStoredApiKey,
  removeStoredApiKey,
} from "../utils/apiKeyStorage";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setApiKeyInput(stored);
      setTestResult({ status: "idle", message: "" });
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setTestResult({
        status: "error",
        message: "Vui lòng nhập API Key trước khi kiểm tra.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: "idle", message: "" });

    try {
      const res = await fetch("/api/gemini/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": keyToTest,
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult({
          status: "success",
          message: `Kết nối thành công! Đã kết nối với mô hình ${data.model || "Gemini 3.7 Flash"}.`,
        });
      } else {
        setTestResult({
          status: "error",
          message: data.error || "API Key không hợp lệ hoặc không có quyền truy cập.",
        });
      }
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: err.message || "Lỗi mạng khi kiểm tra API Key.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const keyToSave = apiKeyInput.trim();
    setStoredApiKey(keyToSave);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleRemove = () => {
    removeStoredApiKey();
    setApiKeyInput("");
    setTestResult({
      status: "idle",
      message: "Đã xóa API Key cá nhân.",
    });
  };

  return (
    <div
      id="api-key-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20">
              <Key className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Cài Đặt Gemini API Key
              </h3>
              <p className="text-[11px] text-slate-400">
                Sử dụng API Key riêng của bạn để tạo bài giảng không giới hạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Key Input Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>Lấy Key miễn phí tại Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>

            <div className="relative">
              <input
                id="input-custom-gemini-key"
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setTestResult({ status: "idle", message: "" });
                }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 pr-10 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title={showKey ? "Ẩn khóa" : "Hiện khóa"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test connection alert */}
          {testResult.status === "success" && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{testResult.message}</div>
            </div>
          )}

          {testResult.status === "error" && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{testResult.message}</div>
            </div>
          )}

          {/* Security & Features Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Bảo mật cục bộ
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Khóa API được lưu trữ an toàn trong trình duyệt của bạn (LocalStorage) và gửi trực tiếp qua header.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-yellow-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Mô hình thế hệ mới
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hỗ trợ <strong>Gemini 3.7 Flash</strong> với tốc độ phản hồi cao và độ chuẩn xác vật lý vượt trội.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2">
            {apiKeyInput && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl text-xs font-semibold border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Key</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !apiKeyInput.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Đang thử...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Kiểm tra kết nối</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Đóng
            </button>

            <button
              id="btn-save-api-key"
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Lưu API Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
