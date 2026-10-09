"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const IDEMPOTENCY_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Is Idempotency one of the four letters in ACID?",
    options: [
      "Yes, 'I' stands for Idempotency",
      "No, 'I' stands for Isolation; Idempotency is an API/operation property",
      "Yes, but only in NoSQL databases",
      "Only in distributed transactions",
    ],
    correctIndex: 1,
    explanation:
      "ACID stands for Atomicity, Consistency, Isolation, and Durability. Idempotency means f(f(x)) = f(x) — executing an operation multiple times has the exact same effect as executing it once.",
  },
  {
    id: 2,
    question: "Which of the following HTTP methods are Idempotent by HTTP specification?",
    options: [
      "POST and PATCH",
      "GET, PUT, DELETE, and HEAD",
      "Only GET",
      "POST only",
    ],
    correctIndex: 1,
    explanation:
      "GET, PUT, DELETE, HEAD, and OPTIONS are idempotent. Calling DELETE /users/1 multiple times leaves user 1 deleted. Calling PUT with the same body leaves the resource identical. POST is generally NOT idempotent without an idempotency key.",
  },
  {
    id: 3,
    question: "Why do payment gateways (like Stripe) require an Idempotency-Key header on POST requests?",
    options: [
      "To encrypt credit card numbers",
      "To increase internet bandwidth",
      "To prevent double-charging users if a network timeout causes a retry",
      "To speed up SQL index lookups",
    ],
    correctIndex: 2,
    explanation:
      "If a client sends POST /charges and the connection drops before receiving the response, the client retries. With an Idempotency-Key, the server sees it already processed that key and returns the original receipt instead of charging again.",
  },
];

export function PracticeLab() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const correctCount = IDEMPOTENCY_QUESTIONS.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5]">
        <div>
          <h3 className="text-sm font-bold text-[#1d1d1d] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#1d1d1d]" />
            Concept Challenge: Idempotency & ACID
          </h3>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Test your intuition with scenario questions.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#1d1d1d]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Quiz
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {IDEMPOTENCY_QUESTIONS.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] space-y-3.5 transition-all"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#1d1d1d] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-[#1d1d1d] leading-relaxed">
                  {q.question}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  let optionStyle =
                    "border-[#e5e5e5] bg-white text-[#1d1d1d] hover:border-[#1d1d1d]";

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      optionStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-900 font-medium";
                    } else if (isThisSelected) {
                      optionStyle = "border-rose-400 bg-rose-50 text-rose-900";
                    } else {
                      optionStyle = "border-[#e5e5e5] bg-white/50 text-[#9ca3af]";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isThisSelected && optIdx !== q.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <div
                  className={`mt-3 p-3 rounded-xl text-[11px] leading-relaxed ${
                    isCorrect
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-[#f5f5f5] text-[#1d1d1d] border border-[#e5e5e5]"
                  }`}
                >
                  <strong className="block mb-1">
                    {isCorrect ? "✅ Correct!" : "💡 Explanation:"}
                  </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {Object.keys(selectedAnswers).length === IDEMPOTENCY_QUESTIONS.length && (
        <div className="p-4 rounded-2xl bg-[#1d1d1d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-xs font-bold">Challenge Complete!</div>
              <div className="text-[11px] text-[#a0a0a0]">
                You scored {correctCount} / {IDEMPOTENCY_QUESTIONS.length}
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-white text-[#1d1d1d] text-xs font-semibold hover:bg-[#f0f0f0] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
