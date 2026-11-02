"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/api";
import MarkdownRenderer from "@/components/markdown-renderer";
import {
  Search,
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  CornerDownLeft,
  RotateCcw,
} from "lucide-react";

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    "What is a tumor?",
    "What are the types of brain tumors?",
    "What is glioma?",
    "What is meningioma?",
    "What is pituitary tumor?",
    "What are the symptoms of brain tumor?",
    "Is every brain tumor cancer?",
    "What is MRI?",
    "What is Grad-CAM?",
    "What does 96% model accuracy mean?",
  ];

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || isLoading) return;

    const userMsg: SearchMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery("");
    setIsLoading(true);

    try {
      const res = await apiRequest<{
        reply: string;
        conversation_id?: string;
        model_used?: string;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId || undefined,
        }),
      });

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const asstMsg: SearchMessage = {
        id: "asst-" + Date.now(),
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errorMsg: SearchMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `Error connecting to clinical reasoning engine: ${err.message || "Request timed out."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg || isLoading) return;

    // Remove the last assistant message
    setMessages((prev) => {
      const next = [...prev];
      if (next.length > 0 && next[next.length - 1].role === "assistant") {
        next.pop();
      }
      return next;
    });

    setIsLoading(true);

    try {
      const res = await apiRequest<{
        reply: string;
        conversation_id?: string;
        model_used?: string;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: lastUserMsg.content,
          conversation_id: conversationId || undefined,
        }),
      });

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const asstMsg: SearchMessage = {
        id: "asst-" + Date.now(),
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errorMsg: SearchMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `Error regenerating response: ${err.message || "Request timed out."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#000000] border border-[#222222] rounded-[24px] shadow-[0_0_50px_rgba(128,82,255,0.15)] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8052ff] to-[#22d3ee] flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(128,82,255,0.4)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-[#ffffff] uppercase tracking-[0.025em]">
                  AI Medical Search
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8052ff]/20 text-[#8052ff] border border-[#8052ff]/40">
                  Groq LLaMA 3.3
                </span>
              </div>
              <p className="text-[12px] font-extralight text-[#9a9a9a]">
                Conversational clinical intelligence on brain tumors, MRI physics & AI models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="text-[#9a9a9a] hover:text-[#ffffff] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#9a9a9a] hover:text-[#ffffff] p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#181818] bg-[#050505]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#22d3ee]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about brain tumors, MRI analysis or medical information..."
                className="w-full pl-12 pr-4 py-3.5 rounded-[22.5px] bg-[#000000] border border-[#2a2a2a] text-[#ffffff] placeholder-[#777777] text-[14px] focus:outline-none focus:border-[#22d3ee] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="bg-[#8052ff] hover:opacity-90 active:scale-95 disabled:opacity-40 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-6 py-3.5 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <span>Ask</span>
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Suggested Queries */}
          {messages.length === 0 && (
            <div className="pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block mb-2">
                Suggested Clinical Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(q)}
                    className="text-[12px] px-3 py-1.5 rounded-full bg-[#0d0d0d] hover:bg-[#8052ff]/20 text-[#9a9a9a] hover:text-[#ffffff] border border-[#222222] hover:border-[#8052ff]/50 transition-colors text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversational Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 min-h-[300px]">
          {messages.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0d0d0d] border border-[#222222] text-[#8052ff] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-[#22d3ee]" />
              </div>
              <h4 className="text-[20px] font-normal text-[#ffffff]">
                Ask the Clinical AI Search Assistant
              </h4>
              <p className="text-[14px] font-extralight text-[#9a9a9a] max-w-md mx-auto">
                Enter your medical query above or click any suggested prompt to receive conversational explanations powered by Groq LLaMA 3.3.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-[20px] p-4 text-[14px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#8052ff] text-[#ffffff] font-normal"
                      : "bg-[#080808] border border-[#222222] text-[#ffffff] font-extralight"
                  }`}
                >
                  {m.role === "user" ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}

                  <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-white/10 text-[11px] text-[#9a9a9a]">
                    <span>{m.timestamp}</span>
                    {m.role === "assistant" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRegenerate}
                          disabled={isLoading}
                          className="hover:text-white transition-colors flex items-center gap-1"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="hover:text-white transition-colors flex items-center gap-1"
                          title="Copy answer"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-[#ffb829]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-3 text-[#ffb829] text-[13px] font-extralight p-2">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-ping" />
              <span>Analyzing query with Groq clinical neural weights...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Medical Safety Disclaimer Footer */}
        <div className="px-6 py-3 border-t border-[#181818] bg-[#050505] flex items-center gap-2 text-[11px] text-[#777777]">
          <ShieldCheck className="w-4 h-4 text-[#8052ff] shrink-0" />
          <span>
            Educational AI reference only. Never a medical diagnosis or prescription. Always consult a licensed neurologist or oncologist.
          </span>
        </div>
      </div>
    </div>
  );
}
