"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Send,
  Square,
  Brain,
  User,
  Sparkles,
  ArrowDown,
  Columns2,
  Maximize2,
  Layers,
  Code2,
  GitBranch,
  HelpCircle,
  History,
  Plus,
  LayoutDashboard,
  BarChart3,
  X,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { MessageRenderer } from "./message-renderer";
import { WorkspaceStudio, type StudioTab } from "@/components/workspace/workspace-studio";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Conversation } from "@/types";
import { formatDate } from "@/lib/utils";

type WorkspaceMode = "split" | "tutor" | "lab";

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  initialConversationId?: string;
}

export function ChatInterface({
  initialMessages,
  initialConversationId,
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    loadConversation,
    conversationId,
  } = useChat();

  const [input, setInput] = useState("");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("split");
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>("simulator");
  const [selectedDiagram, setSelectedDiagram] = useState<string | undefined>(undefined);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<Conversation[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (initialMessages && initialConversationId) {
      loadConversation(initialConversationId, initialMessages);
    }
  }, [initialConversationId]);

  // Fetch recent history for slide-over drawer
  useEffect(() => {
    async function fetchHistory() {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (data) setHistoryList(data);
    }
    fetchHistory();
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 120);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Extract latest mermaid chart if available
  const latestMermaid = useMemo(() => {
    if (selectedDiagram) return selectedDiagram;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "assistant" && msg.content.includes("```mermaid")) {
        const match = /```mermaid\s*([\s\S]*?)```/.exec(msg.content);
        if (match) return match[1].trim();
      }
    }
    return undefined;
  }, [messages, selectedDiagram]);

  const handleOpenInStudio = (tab: StudioTab, data?: string) => {
    if (tab === "diagram" && data) {
      setSelectedDiagram(data);
    }
    setActiveStudioTab(tab);
    if (workspaceMode === "tutor") {
      setWorkspaceMode("split");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickPrompts = [
    {
      label: "⚡ Idempotency & ACID Transactions",
      query: "Explain Idempotency in ACID properties with live simulations, sequence diagrams, and how payment systems prevent duplicate charges.",
      tab: "simulator" as const,
    },
    {
      label: "🔄 Event Loop & Microtasks in JS",
      query: "Explain JavaScript Event Loop, Call Stack, Microtasks vs Macrotasks with a step-by-step visual animation and code example.",
      tab: "code" as const,
    },
    {
      label: "🌲 Binary Search & Two Pointers",
      query: "Explain Binary Search and the Two Pointers technique with step-by-step visual traces and code simulations.",
      tab: "code" as const,
    },
    {
      label: "🛡️ SQL Transactions & Isolation Levels",
      query: "Explain SQL Isolation Levels (Read Committed vs Serializable) and dirty reads with visual state transitions.",
      tab: "simulator" as const,
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-white select-none overflow-hidden">
      {/* 1. Sleek Full-Bleed Top Workspace Navigation */}
      <header className="h-13 border-b border-[#e5e5e5] bg-white px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left Section: Logo, Topic, and History Trigger */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1d1d1d] rounded-lg flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[#1d1d1d] text-sm tracking-tight hidden sm:inline">
              CrackIt
            </span>
          </Link>

          <div className="h-4 w-px bg-[#e5e5e5] hidden sm:block" />

          {/* New Chat Button */}
          <Link
            href="/chat"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#e5e5e5] text-xs font-semibold text-[#1d1d1d] transition-colors"
            title="Start fresh learning session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Session</span>
          </Link>

          {/* History Slide-over trigger */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#6b7280] hover:text-[#1d1d1d] hover:bg-[#fafafa] transition-colors"
            title="View recent sessions"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sessions</span>
            {historyList.length > 0 && (
              <span className="bg-[#f0f0f0] text-[#1d1d1d] text-[10px] font-mono px-1.5 py-0.2 rounded-full">
                {historyList.length}
              </span>
            )}
          </button>
        </div>

        {/* Center Section: Workspace Mode Switcher */}
        <div className="flex items-center bg-[#f5f5f5] p-1 rounded-xl border border-[#e5e5e5]">
          <button
            onClick={() => setWorkspaceMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              workspaceMode === "split"
                ? "bg-white text-[#1d1d1d] shadow-sm font-semibold"
                : "text-[#6b7280] hover:text-[#1d1d1d]"
            }`}
            title="Side-by-side: Tutor Guide + Interactive Canvas"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Split Studio</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("tutor")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              workspaceMode === "tutor"
                ? "bg-white text-[#1d1d1d] shadow-sm font-semibold"
                : "text-[#6b7280] hover:text-[#1d1d1d]"
            }`}
            title="Full-width conversation focus"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Tutor Focus</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("lab")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              workspaceMode === "lab"
                ? "bg-white text-[#1d1d1d] shadow-sm font-semibold"
                : "text-[#6b7280] hover:text-[#1d1d1d]"
            }`}
            title="Full-width Interactive Studio Canvas"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Lab</span>
          </button>
        </div>

        {/* Right Section: Studio Quick Select & Links */}
        <div className="flex items-center gap-2">
          {workspaceMode === "split" && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#6b7280] bg-[#fafafa] border border-[#e5e5e5] px-2 py-1 rounded-lg">
              <span className="font-semibold text-[#1d1d1d]">Active:</span>
              <span className="capitalize text-[#1d1d1d] font-medium">{activeStudioTab}</span>
            </div>
          )}

          <Link
            href="/dashboard"
            className="p-1.5 text-[#6b7280] hover:text-[#1d1d1d] hover:bg-[#fafafa] rounded-lg transition-colors hidden sm:inline-flex"
            title="Go to Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </Link>

          <Link
            href="/progress"
            className="p-1.5 text-[#6b7280] hover:text-[#1d1d1d] hover:bg-[#fafafa] rounded-lg transition-colors hidden sm:inline-flex"
            title="View Learning Progress"
          >
            <BarChart3 className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Tutor & Conversation Pane (Hidden only in full 'lab' mode) */}
        {workspaceMode !== "lab" && (
          <div
            className={`flex flex-col h-full bg-white transition-all duration-200 ${
              workspaceMode === "split" ? "w-full md:w-[48%] lg:w-[45%]" : "w-full max-w-4xl mx-auto"
            }`}
          >
            {/* Messages Scroll Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
              {messages.length === 0 ? (
                /* Empty state / Welcome Workspace */
                <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-lg mx-auto text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="w-12 h-12 bg-[#1d1d1d] rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Brain className="w-6 h-6 text-white" />
                    </div>

                    <h2 className="text-xl font-bold text-[#1d1d1d] tracking-tight">
                      Interactive Learning Workspace
                    </h2>

                    <p className="text-xs text-[#6b7280] leading-relaxed max-w-md">
                      Ask any technical or conceptual question. I will explain the core intuition,
                      render visual architecture flows, and spin up live interactive simulations.
                    </p>

                    {/* Quick interactive prompts */}
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {quickPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveStudioTab(p.tab);
                            sendMessage(p.query);
                          }}
                          className="p-3 bg-[#f9f9f9] hover:bg-[#f2f2f2] border border-[#e5e5e5] rounded-xl text-xs transition-all text-[#1d1d1d] group hover:border-[#1d1d1d]"
                        >
                          <div className="font-semibold text-xs flex items-center justify-between mb-1">
                            <span>{p.label}</span>
                            <ChevronRight className="w-3 h-3 text-[#9ca3af] group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <p className="text-[11px] text-[#6b7280] line-clamp-2">
                            {p.query}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Messages Stream */
                <div className="space-y-6 pb-6">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-7 h-7 bg-[#1d1d1d] rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <Brain className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}

                        <div
                          className={`max-w-[92%] ${
                            message.role === "user"
                              ? "bg-[#1d1d1d] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm"
                              : "flex-1 min-w-0"
                          }`}
                        >
                          {message.role === "user" ? (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            <MessageRenderer
                              content={message.content}
                              isStreaming={message.isStreaming}
                              onOpenInStudio={handleOpenInStudio}
                            />
                          )}
                        </div>

                        {message.role === "user" && (
                          <div className="w-7 h-7 bg-[#f5f5f5] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-3.5 h-3.5 text-[#6b7280]" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing / Reasoning Indicator */}
                  {isLoading &&
                    messages[messages.length - 1]?.role === "assistant" &&
                    messages[messages.length - 1]?.content === "" && (
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#1d1d1d] rounded-xl flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] rounded-2xl text-xs text-[#6b7280]">
                          <div className="w-1.5 h-1.5 bg-[#1d1d1d] rounded-full animate-ping" />
                          <span>Designing visual explanation & code simulation...</span>
                        </div>
                      </div>
                    )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Scroll Down Floating Button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-24 left-1/4 -translate-x-1/2 p-2 bg-white border border-[#e5e5e5] rounded-full shadow-lg hover:bg-[#fafafa] transition-colors z-20"
                >
                  <ArrowDown className="w-4 h-4 text-[#1d1d1d]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input Form Bar */}
            <div className="p-3 border-t border-[#e5e5e5] bg-white">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-end gap-2 bg-[#f8f8f8] rounded-2xl p-2 border border-[#e5e5e5] focus-within:border-[#1d1d1d] focus-within:bg-white transition-all">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about any concept, bug, or architecture..."
                    rows={1}
                    className="flex-1 bg-transparent border-0 outline-none resize-none text-xs sm:text-sm text-[#1d1d1d] placeholder:text-[#9ca3af] px-3 py-2 max-h-32"
                    style={{ fieldSizing: "content" } as React.CSSProperties}
                  />

                  {isLoading ? (
                    <button
                      type="button"
                      onClick={stopStreaming}
                      className="p-2 bg-[#1d1d1d] text-white rounded-xl hover:bg-[#333333] transition-colors shrink-0"
                      title="Stop generating"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-2 bg-[#1d1d1d] text-white rounded-xl hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive Studio Canvas Pane (Visible in Split or Full Lab mode) */}
        {workspaceMode !== "tutor" && (
          <div
            className={`h-full ${
              workspaceMode === "split" ? "flex-1 hidden md:block" : "w-full"
            }`}
          >
            <WorkspaceStudio
              activeTab={activeStudioTab}
              onTabChange={setActiveStudioTab}
              mermaidChart={latestMermaid}
              onClose={() => setWorkspaceMode("tutor")}
            />
          </div>
        )}
      </div>

      {/* 3. Slide-Over History Drawer (Takes ZERO permanent screen space!) */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-[#e5e5e5] shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="h-14 px-4 border-b border-[#e5e5e5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#1d1d1d]" />
                  <span className="font-bold text-sm text-[#1d1d1d]">Learning Sessions</span>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1 hover:bg-[#f5f5f5] rounded-lg text-[#6b7280] hover:text-[#1d1d1d]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <Link
                  href="/chat"
                  onClick={() => setIsHistoryOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1d1d1d] text-white text-xs font-semibold hover:bg-[#333333] transition-colors mb-3"
                >
                  <Plus className="w-4 h-4" />
                  Start Fresh Session
                </Link>

                {historyList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#9ca3af]">
                    No past sessions yet. Ask your first question to begin!
                  </div>
                ) : (
                  historyList.map((item) => (
                    <Link
                      key={item.id}
                      href={`/chat/${item.id}`}
                      onClick={() => setIsHistoryOpen(false)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl text-xs transition-colors group ${
                        item.id === conversationId
                          ? "bg-[#f5f5f5] font-semibold text-[#1d1d1d]"
                          : "hover:bg-[#fafafa] text-[#4b5563]"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#9ca3af] mt-0.5 shrink-0 group-hover:text-[#1d1d1d]" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{item.title}</div>
                        <div className="text-[10px] text-[#9ca3af] mt-0.5">
                          {formatDate(item.updated_at)}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
