"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Code2,
  Sparkles,
  ArrowRight,
  BookOpen,
  BarChart3,
  Zap,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5]"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1d1d1d] rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#1d1d1d] text-lg tracking-tight">
              CrackIt
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#1d1d1d] hover:bg-[#f5f5f5] rounded-lg transition-colors duration-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-[#1d1d1d] rounded-lg hover:bg-[#2d2d2d] transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] rounded-full text-xs font-medium text-[#1d1d1d] mb-8"
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered Learning
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1d1d1d] tracking-tight leading-[1.1] mb-6"
          >
            Learn anything.
            <br />
            <span className="text-[#9ca3af]">Understand everything.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-[#9ca3af] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Your super intelligent AI tutor that breaks down complex concepts
            into crystal-clear explanations with visual guides, live code
            examples, and step-by-step breakdowns.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1d1d1d] text-white font-medium rounded-xl hover:bg-[#2d2d2d] transition-all duration-200 hover:shadow-lg hover:shadow-black/5"
            >
              Start Learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#e5e5e5] text-[#1d1d1d] font-medium rounded-xl hover:bg-[#f5f5f5] transition-all duration-200"
            >
              I have an account
            </Link>
          </motion.div>

          {/* Demo Chat Preview */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-[#e5e5e5] shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#9ca3af]" />
                </div>
                <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 border border-[#e5e5e5] text-left">
                  <p className="text-sm text-[#1d1d1d]">
                    Explain how React hooks work with examples
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#1d1d1d] rounded-lg flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 border border-[#e5e5e5] text-left flex-1">
                  <p className="text-sm text-[#1d1d1d] mb-2">
                    <strong>🎯 One-Line Summary:</strong> React Hooks let you
                    use state and lifecycle features in functional components.
                  </p>
                  <p className="text-sm text-[#9ca3af]">
                    Think of hooks like{" "}
                    <strong className="text-[#1d1d1d]">
                      superpowers for functions
                    </strong>{" "}
                    — they give your simple components memory (useState) and
                    awareness (useEffect)...
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-[#9ca3af]">
                    <Sparkles className="w-3 h-3" />
                    <span>Visual breakdown, code examples, and more below</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-[#e5e5e5]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1d1d1d] tracking-tight mb-4">
              Everything you need to learn smarter
            </h2>
            <p className="text-[#9ca3af] max-w-lg mx-auto">
              Not just answers — deep understanding with visual explanations and
              hands-on examples.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Brain,
                title: "Smart Concept Breakdown",
                description:
                  "Complex topics are automatically split into digestible pieces with step-by-step explanations.",
              },
              {
                icon: Code2,
                title: "Live Code Examples",
                description:
                  "Every coding concept comes with working, runnable code examples with line-by-line comments.",
              },
              {
                icon: Sparkles,
                title: "Visual Explanations",
                description:
                  "Diagrams, flowcharts, and visual aids that make abstract concepts tangible.",
              },
              {
                icon: BookOpen,
                title: "Real-World Analogies",
                description:
                  "Technical concepts explained through everyday comparisons you already understand.",
              },
              {
                icon: BarChart3,
                title: "Learning Progress",
                description:
                  "Track your understanding across topics. See what you've mastered and what needs review.",
              },
              {
                icon: Zap,
                title: "Instant Intelligence",
                description:
                  "Powered by multiple AI models with automatic failover for always-available tutoring.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group p-6 rounded-2xl border border-[#e5e5e5] hover:border-[#d4d4d4] transition-all duration-300 hover:shadow-sm"
              >
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1d1d1d] transition-colors duration-300">
                  <feature.icon className="w-5 h-5 text-[#1d1d1d] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-[#1d1d1d] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-6 bg-[#f5f5f5]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1d1d1d] tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-[#9ca3af]">Three steps to understanding anything</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Ask anything",
                description:
                  'Type your question naturally — "Explain closures in JavaScript" or "How does TCP/IP work?"',
              },
              {
                step: "02",
                title: "Get visual explanations",
                description:
                  "CrackIt analyzes your question, breaks it down, and responds with structured visual explanations, code examples, and analogies.",
              },
              {
                step: "03",
                title: "Track your growth",
                description:
                  "Your learning progress is tracked automatically. See your mastery grow across topics over time.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-start gap-6 bg-white rounded-2xl p-6 border border-[#e5e5e5]"
              >
                <span className="text-3xl font-bold text-[#e5e5e5] shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-[#1d1d1d] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-[#1d1d1d] tracking-tight mb-4">
            Ready to crack it?
          </h2>
          <p className="text-[#9ca3af] mb-8">
            Join learners who've made complex concepts feel easy peasy.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#1d1d1d] text-white font-medium rounded-xl hover:bg-[#2d2d2d] transition-all duration-200 hover:shadow-lg hover:shadow-black/5"
          >
            Get Started — It's Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1d1d1d] rounded-md flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1d1d1d]">CrackIt</span>
          </div>
          <p className="text-xs text-[#9ca3af]">
            © 2025 CrackIt. Learn anything, understand
            everything.
          </p>
        </div>
      </footer>
    </div>
  );
}
