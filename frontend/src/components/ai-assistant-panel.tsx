"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/api";
import { Prediction } from "@/types";
import MarkdownRenderer from "@/components/markdown-renderer";
import {
  Send,
  Trash2,
  Check,
  Copy,
  Sparkles,
  RotateCcw
} from "lucide-react";

interface AIAssistantPanelProps {
  scanId?: string;
  activePrediction?: Prediction | null;
  patientInfo?: { name: string; age?: string; gender?: string };
}

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  timestamp: string;
}

export default function AIAssistantPanel({
  scanId,
  activePrediction,
  patientInfo,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    "Explain my prediction.",
    "What is a tumor?",
    "What is the difference between glioma and meningioma?",
    "What are common symptoms of brain tumor?",
    "How does Grad-CAM compute activation intensity?",
    "What should I ask my doctor?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = activePrediction
        ? `### Active MRI Telemetry Context Loaded\n\n- **Histological Classification:** **${activePrediction.predicted_class}**\n- **Model Confidence:** **${(activePrediction.confidence * 100).toFixed(1)}%**\n- **Feature Mapping:** Grad-CAM GradientTape verified\n\nYou can ask me general questions (e.g., *"What is a tumor?"*, *"What are symptoms?"*) or ask specifically about this scan (*"Explain my prediction"*).`
        : `Quantum AI Medical Assistant active. Ask any clinical or educational question regarding brain tumors, MRI sequences, or Grad-CAM feature activations.`;

      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          content: welcomeText,
          modelUsed: "Groq LLaMA 3.3 Clinical Engine",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [activePrediction]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const payload: any = {
        message: text,
        scan_id: scanId || (activePrediction ? activePrediction.scan_id : undefined),
        conversation_id: conversationId || undefined,
      };

      const res = await apiRequest<{
        reply: string;
        model_used: string;
        conversation_id: string;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const asstMsg: ChatMessageItem = {
        id: "asst-" + Date.now(),
        role: "assistant",
        content: res.reply,
        modelUsed: res.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "Encountered an error communicating with the clinical reasoning engine. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg || isLoading) return;

    setMessages((prev) => {
      const next = [...prev];
      if (next.length > 0 && next[next.length - 1].role === "assistant") {
        next.pop();
      }
      return next;
    });

    setIsLoading(true);
    try {
      const payload: any = {
        message: lastUserMsg.content,
        scan_id: scanId || (activePrediction ? activePrediction.scan_id : undefined),
        conversation_id: conversationId || undefined,
      };

      const res = await apiRequest<{
        reply: string;
        model_used: string;
        conversation_id: string;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const asstMsg: ChatMessageItem = {
        id: "asst-" + Date.now(),
        role: "assistant",
        content: res.reply,
        modelUsed: res.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch {
      // error handled
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8052ff]" />
          <span className="text-[14px] font-semibold uppercase tracking-[0.025em] text-[#ffffff]">
            AI Clinical Assistant
          </span>
          <span className="text-[11px] font-mono text-[#ffb829] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            Groq LLaMA 3.3
          </span>
        </div>

        <button
          onClick={clearChat}
          title="Clear Conversation"
          className="text-[#9a9a9a] hover:text-[#ffffff] transition-colors p-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-[20px] px-5 py-3.5 text-[14px] leading-relaxed ${
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

              <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-white/10 text-[11px] text-[#9a9a9a]">
                <span>{m.timestamp}</span>
                {m.role === "assistant" && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRegenerate}
                      disabled={isLoading}
                      className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(m.id, m.content)}
                      className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-[#ffb829]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-[13px] font-extralight text-[#ffb829] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb829] animate-ping" />
            <span>Consulting clinical neural weights...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none text-[12px]">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3.5 py-1.5 rounded-full bg-[#000000] border border-[#222222] text-[#9a9a9a] hover:text-[#ffffff] hover:border-[#8052ff] whitespace-nowrap transition-colors cursor-pointer"
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
        className="flex items-center gap-3 pt-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about MRI findings, glioma, meningioma, or treatments..."
          className="flex-1 px-4 py-3 rounded-[22.5px] bg-[#000000] border border-[#222222] text-[#ffffff] placeholder-[#666666] text-[14px] focus:outline-none focus:border-[#8052ff] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-[#8052ff] hover:opacity-90 active:scale-95 disabled:opacity-40 text-[#ffffff] rounded-full p-3 transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
