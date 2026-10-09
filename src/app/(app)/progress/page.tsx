"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Calendar,
  Brain,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { LearningTopic } from "@/types";
import { formatDate } from "@/lib/utils";
import { TopNav } from "@/components/shared/top-nav";

export default function ProgressPage() {
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase
        .from("learning_topics")
        .select("*")
        .order("last_studied_at", { ascending: false });

      if (data) setTopics(data);
      setLoading(false);
    };

    fetchTopics();
  }, []);

  const totalInteractions = topics.reduce(
    (acc, t) => acc + t.total_interactions,
    0
  );
  const avgMastery =
    topics.length > 0
      ? Math.round(
          topics.reduce((acc, t) => acc + t.mastery_level, 0) / topics.length
        )
      : 0;
  const topPerformer = topics.reduce(
    (best, t) => (t.mastery_level > (best?.mastery_level || 0) ? t : best),
    topics[0]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNav />
      <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1d1d1d] tracking-tight mb-1">
          Learning Progress
        </h1>
        <p className="text-sm text-[#9ca3af] mb-8">
          Track your growth across all topics
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            icon: BookOpen,
            label: "Topics",
            value: topics.length,
          },
          {
            icon: BarChart3,
            label: "Avg Mastery",
            value: `${avgMastery}%`,
          },
          {
            icon: TrendingUp,
            label: "Interactions",
            value: totalInteractions,
          },
          {
            icon: Brain,
            label: "Best Topic",
            value: topPerformer?.topic_name || "—",
            small: true,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 border border-[#e5e5e5] rounded-2xl"
          >
            <stat.icon className="w-4 h-4 text-[#9ca3af] mb-2" />
            <p
              className={`font-bold text-[#1d1d1d] ${
                stat.small ? "text-sm capitalize" : "text-xl"
              }`}
            >
              {stat.value}
            </p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Topics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-semibold text-[#1d1d1d] text-sm mb-4">
          All Topics
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-20 rounded-2xl" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="w-12 h-12 text-[#e5e5e5] mx-auto mb-3" />
            <p className="text-[#9ca3af] text-sm">No topics tracked yet</p>
            <p className="text-xs text-[#9ca3af] mt-1">
              Start chatting to track your learning progress
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="p-4 border border-[#e5e5e5] rounded-2xl hover:border-[#d4d4d4] transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1d] capitalize">
                      {topic.topic_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#9ca3af] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {topic.total_interactions} interactions
                      </span>
                      <span className="text-xs text-[#9ca3af] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(topic.last_studied_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#1d1d1d]">
                      {topic.mastery_level}%
                    </span>
                    <p className="text-xs text-[#9ca3af]">mastery</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.mastery_level}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 * i }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        topic.mastery_level >= 70
                          ? "#22c55e"
                          : topic.mastery_level >= 40
                          ? "#1d1d1d"
                          : "#9ca3af",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  </div>
  );
}
