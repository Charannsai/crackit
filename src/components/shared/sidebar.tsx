"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  MessageSquare,
  BarChart3,
  Plus,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/types";
import { formatDate, truncate } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (data) setConversations(data);
    };

    fetchConversations();

    // Subscribe to conversation changes
    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/chat", label: "New Chat", icon: Plus },
    { href: "/progress", label: "Progress", icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1d1d1d] rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#1d1d1d] text-sm tracking-tight">
            CrackIt
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1 hover:bg-[#f5f5f5] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[#1d1d1d]" />
        </button>
      </div>

      {/* Nav Items */}
      <div className="px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#1d1d1d] text-white"
                  : "text-[#1d1d1d] hover:bg-[#f5f5f5]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Conversations */}
      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider px-3 mb-2">
          Recent Chats
        </p>
        <div className="space-y-0.5">
          {conversations.map((conv) => {
            const isActive = pathname === `/chat/${conv.id}`;
            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[#f5f5f5] text-[#1d1d1d] font-medium"
                    : "text-[#9ca3af] hover:text-[#1d1d1d] hover:bg-[#f5f5f5]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">
                  {truncate(conv.title, 28)}
                </span>
                <span className="text-xs text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {formatDate(conv.updated_at)}
                </span>
              </Link>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-xs text-[#9ca3af] px-3 py-4 text-center">
              No conversations yet.
              <br />
              Start a new chat to begin learning!
            </p>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="p-3 border-t border-[#e5e5e5]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-[#f5f5f5] rounded-full flex items-center justify-center text-sm font-semibold text-[#1d1d1d]">
            {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1d1d1d] truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-[#9ca3af] truncate">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-[#9ca3af]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#e5e5e5] rounded-xl hover:bg-[#f5f5f5] transition-colors shadow-sm"
      >
        <Menu className="w-5 h-5 text-[#1d1d1d]" />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-[#e5e5e5] z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[280px] bg-white border-r border-[#e5e5e5] h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}
