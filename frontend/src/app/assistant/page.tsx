"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WorkspaceLayout from "@/components/workspace-layout";
import MarkdownRenderer from "@/components/markdown-renderer";
import { apiRequest } from "@/lib/api";
import { ChatConversation, ChatMessage, Prediction } from "@/types";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw
} from "lucide-react";

function AssistantContent() {
  const searchParams = useSearchParams();
  const linkedScanId = searchParams.get("scan_id");

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkedPrediction, setLinkedPrediction] = useState<Prediction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    "What is a tumor?",
    "What are the types of brain tumors?",
    "What is glioma?",
    "What is meningioma?",
    "What is pituitary tumor?",
    "What are the symptoms?",
    "Is every brain tumor cancer?",
    "What is MRI?",
    "What is Grad-CAM?",
    "What does 96% model accuracy mean?",
  ];

  useEffect(() => {
    loadConversations();
    if (linkedScanId) {
      apiRequest<Prediction>(`/predictions/scan/${linkedScanId}`)
        .then((p) => setLinkedPrediction(p))
        .catch(() => {});
    }
  }, [linkedScanId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const loadConversations = async () => {
    try {
      const convs = await apiRequest<ChatConversation[]>("/chat/conversations");
      setConversations(convs || []);
      if (convs && convs.length > 0 && !activeConversation) {
        selectConversation(convs[0].id);
      } else if (!convs || convs.length === 0) {
        startNewConversation();
      }
    } catch {
      // ignore
    }
  };

  const selectConversation = async (convId: string) => {
    try {
      const conv = await apiRequest<ChatConversation>(`/chat/conversations/${convId}`);
      setActiveConversation(conv);
      setMessages(conv.messages || []);
    } catch {
      // ignore
    }
  };

  const startNewConversation = async () => {
    try {
      const newConv = await apiRequest<ChatConversation>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ scan_id: linkedScanId || undefined }),
      });
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
    } catch {
      // ignore
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest(`/chat/conversations/${convId}`, { method: "DELETE" });
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConversation?.id === convId) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending || !activeConversation) return;

    if (!textToSend) setInputValue("");
    setIsSending(true);

    const tempUserMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      sender_role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const asstMsg = await apiRequest<ChatMessage>(
        `/chat/conversations/${activeConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
            scan_id: linkedScanId || activeConversation.scan_id || undefined,
          }),
        }
      );
      setMessages((prev) => [...prev.slice(0, -1), tempUserMsg, asstMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender_role: "assistant",
          content: "Encountered an error communicating with the clinical reasoning engine.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = async () => {
    if (!activeConversation || isSending) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.sender_role === "user");
    if (!lastUserMsg) return;

    setMessages((prev) => {
      const next = [...prev];
      if (next.length > 0 && next[next.length - 1].sender_role === "assistant") {
        next.pop();
      }
      return next;
    });

    setIsSending(true);
    try {
      const asstMsg = await apiRequest<ChatMessage>(
        `/chat/conversations/${activeConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: lastUserMsg.content,
            scan_id: linkedScanId || activeConversation.scan_id || undefined,
          }),
        }
      );
      setMessages((prev) => [...prev, asstMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender_role: "assistant",
          content: "Encountered an error communicating with the clinical reasoning engine.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <WorkspaceLayout
      categoryLabel="Groq Medical Engine"
      title="AI Clinical Assistant"
      subtitle="Context-aware neuro-oncology dialogue powered by Groq LLaMA 3.3 70B and verified clinical literature."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[640px]">
        {/* Left Column: Sessions (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829]">
              Consultations
            </span>
            <button
              onClick={startNewConversation}
              className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[12px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-3.5 py-1.5 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {conversations.map((c) => {
              const isActive = activeConversation?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`p-3.5 rounded-[16px] text-[14px] cursor-pointer flex items-center justify-between group transition-colors ${
                    isActive
                      ? "text-[#ffffff] font-normal border border-[#333333] bg-[#000000]"
                      : "text-[#9a9a9a] hover:text-[#ffffff] border border-transparent"
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  <button
                    onClick={(e) => deleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Conversation (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          {linkedPrediction && (
            <div className="pb-3 border-b border-[#181818] flex items-center justify-between text-[13px]">
              <span className="text-[#9a9a9a]">
                Active Telemetry: <b className="text-[#ffffff]">{linkedPrediction.predicted_class}</b>
              </span>
              <span className="text-[#ffb829] font-semibold">
                {(linkedPrediction.confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>
          )}

          {/* Dialogue Stream */}
          <div className="flex-1 space-y-4 min-h-[380px] max-h-[540px] overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                <h4 className="text-[24px] font-normal text-[#ffffff]">
                  Awaiting Clinical Inquiry
                </h4>
                <p className="text-[16px] font-extralight text-[#9a9a9a] max-w-md">
                  Select a suggested question below or enter your inquiry regarding brain MRI findings, tumor types, or treatment options.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender_role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[20px] px-5 py-3.5 text-[14px] leading-relaxed ${
                      m.sender_role === "user"
                        ? "bg-[#8052ff] text-[#ffffff] font-normal"
                        : "bg-[#080808] border border-[#222222] text-[#ffffff] font-extralight"
                    }`}
                  >
                    {m.sender_role === "user" ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <MarkdownRenderer content={m.content} />
                    )}

                    <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-white/10 text-[11px] text-[#9a9a9a]">
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {m.sender_role === "assistant" && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleRegenerate}
                            disabled={isSending}
                            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            title="Regenerate response"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                          <button
                            onClick={() => copyToClipboard(m.id, m.content)}
                            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy answer"
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
              ))
            )}

            {isSending && (
              <div className="text-[13px] font-extralight text-[#ffb829] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb829] animate-ping" />
                <span>Generating clinical reasoning response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none text-[12px]">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-3.5 py-1.5 rounded-full bg-[#000000] border border-[#222222] text-[#9a9a9a] hover:text-[#ffffff] hover:border-[#8052ff] whitespace-nowrap transition-colors"
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about MRI findings, glioma, meningioma, or treatments..."
              className="flex-1 px-4 py-3 rounded-[22.5px] bg-[#000000] border border-[#222222] text-[#ffffff] placeholder-[#666666] text-[14px] focus:outline-none focus:border-[#8052ff] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="bg-[#8052ff] hover:opacity-90 active:scale-95 disabled:opacity-40 text-[#ffffff] rounded-full p-3 transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[18px] font-extralight text-[#9a9a9a]">Loading Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
