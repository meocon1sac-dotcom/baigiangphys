import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  X,
  Key,
  ShieldCheck
} from "lucide-react";
import { ChatMessage, PhysicsLesson } from "../types";
import { MathRenderer } from "./MathRenderer";
import { getStoredApiKey } from "../utils/apiKeyStorage";

interface AiAssistantChatProps {
  lesson?: PhysicsLesson | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal?: () => void;
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  lesson,
  isOpen,
  onClose,
  onOpenApiKeyModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      role: "assistant",
      content: `Xin chào! Tôi là **PhysiBot** - Trợ lý Sư phạm Vật lý AI. Bạn cần giải thích thêm khái niệm nào trong bài "${lesson?.overview?.title || "Vật lý"}", muốn tạo thêm bài tập hay cần gợi ý phương pháp giảng dạy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const customApiKey = getStoredApiKey();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customApiKey) {
        headers["x-gemini-api-key"] = customApiKey;
      }

      const res = await fetch("/api/physics/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: newMessages,
          apiKey: customApiKey || undefined,
          lessonContext: lesson
            ? {
                title: lesson.overview.title,
                topic: lesson.topic,
                formulas: lesson.overview.keyFormulas,
                level: lesson.gradeLevel,
              }
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Lỗi kết nối máy chủ");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: data.reply || "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: "assistant",
          content: "⚠️ Không thể kết nối với AI. Bạn hãy thử kiểm tra lại Gemini API Key của mình.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "Giải thích cho học sinh dễ hiểu (ELI5)?",
    "Cho 1 ví dụ đời sống thực tế nhất",
    "Mẹo ghi nhớ công thức và đơn vị SI",
    "Soạn thêm 1 bài toán thực tế kèm lời giải",
  ];

  return (
    <div
      id="ai-assistant-drawer"
      className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>PhysiBot AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400">Trợ lý Sư phạm Vật lý</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              title="Cài đặt API Key"
              className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                msg.role === "user"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-purple-600 text-white"
              }`}
            >
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-600 text-white rounded-tr-none"
                  : "bg-slate-850 text-slate-200 border border-slate-800 rounded-tl-none"
              }`}
            >
              <MathRenderer content={msg.content} />
              <div className="text-[9px] text-slate-400 mt-1 text-right">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>PhysiBot đang suy nghĩ và tính toán công thức...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          id="input-chat-physibot"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về công thức, bài tập, mẹo giảng dạy..."
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 rounded-xl transition-all font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
