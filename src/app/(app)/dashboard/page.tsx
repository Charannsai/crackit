"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  BarChart3,
  BookOpen,
  Plus,
  ArrowRight,
  Brain,
  Sparkles,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, LearningTopic } from "@/types";
import { formatDate, truncate } from "@/lib/utils";
import { TopNav } from "@/components/shared/top-nav";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [stats, setStats] = useState({
    totalChats: 0,
    topicsLearned: 0,
    avgMastery: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [convResult, topicResult] = await Promise.all([
        supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("learning_topics")
          .select("*")
          .order("last_studied_at", { ascending: false })
          .limit(6),
      ]);

      if (convResult.data) setConversations(convResult.data);
      if (topicResult.data) {
        setTopics(topicResult.data);
        const avgMastery =
          topicResult.data.length > 0
            ? Math.round(
                topicResult.data.reduce((acc, t) => acc + t.mastery_level, 0) /
                  topicResult.data.length
              )
            : 0;
        setStats({
          totalChats: convResult.data?.length || 0,
          topicsLearned: topicResult.data.length,
          avgMastery,
        });
      }
    };

    fetchData();
  }, []);

  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNav />
      <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <h1 className="text-2xl font-bold text-[#1d1d1d] tracking-tight">
          {greeting},{" "}
          {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-[#9ca3af] mt-1 text-sm">
          What would you like to learn today?
        </p>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Link
          href="/chat"
          className="group flex items-center gap-4 p-5 bg-[#1d1d1d] rounded-2xl text-white hover:bg-[#2d2d2d] transition-all duration-200"
        >
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Start a new conversation</p>
            <p className="text-xs text-white/60 mt-0.5">
              Ask me anything — I&apos;ll explain it visually
            </p>
          </div>
          <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            icon: MessageSquare,
            label: "Conversations",
            value: stats.totalChats,
          },
          {
            icon: BookOpen,
            label: "Topics Explored",
            value: stats.topicsLearned,
          },
          {
            icon: BarChart3,
            label: "Avg. Mastery",
            value: `${stats.avgMastery}%`,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 border border-[#e5e5e5] rounded-2xl"
          >
            <stat.icon className="w-4 h-4 text-[#9ca3af] mb-2" />
            <p className="text-xl font-bold text-[#1d1d1d]">{stat.value}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Conversations */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1d1d1d] text-sm">
              Recent Conversations
            </h2>
            <Link
              href="/chat"
              className="text-xs text-[#9ca3af] hover:text-[#1d1d1d] transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f5] transition-all duration-200"
              >
                <div className="w-8 h-8 bg-[#f5f5f5] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                  <MessageSquare className="w-4 h-4 text-[#9ca3af]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1d1d1d] truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-[#9ca3af] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(conv.updated_at)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-8 h-8 text-[#e5e5e5] mx-auto mb-2" />
                <p className="text-sm text-[#9ca3af]">No conversations yet</p>
                <Link
                  href="/chat"
                  className="text-xs text-[#1d1d1d] font-medium mt-1 inline-block hover:underline"
                >
                  Start your first chat →
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Learning Topics */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1d1d1d] text-sm">
              Topics You&apos;re Learning
            </h2>
            <Link
              href="/progress"
              className="text-xs text-[#9ca3af] hover:text-[#1d1d1d] transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="p-3 rounded-xl border border-[#e5e5e5] hover:border-[#d4d4d4] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#1d1d1d] capitalize">
                    {topic.topic_name}
                  </p>
                  <span className="text-xs font-medium text-[#9ca3af]">
                    {topic.mastery_level}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.mastery_level}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-[#1d1d1d] rounded-full"
                  />
                </div>
                <p className="text-xs text-[#9ca3af] mt-1.5">
                  {topic.total_interactions} interactions
                </p>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-[#e5e5e5] mx-auto mb-2" />
                <p className="text-sm text-[#9ca3af]">No topics yet</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Topics are tracked as you learn
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  </div>
  );
}
