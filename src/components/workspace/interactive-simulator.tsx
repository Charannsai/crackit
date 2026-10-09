"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Database,
  Server,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

interface TransactionRecord {
  id: string;
  key: string;
  amount: number;
  status: "COMMITTED" | "CACHED_RETURN" | "DUPLICATE_ANOMALY";
  timestamp: string;
}

export function InteractiveSimulator({
  topic = "idempotency",
}: {
  topic?: string;
}) {
  // Idempotency simulator state
  const [idempotencyEnabled, setIdempotencyEnabled] = useState(true);
  const [requestKey, setRequestKey] = useState("pay_tx_789");
  const [amount, setAmount] = useState(250);
  const [accountBalance, setAccountBalance] = useState(1000);
  const [cachedKeys, setCachedKeys] = useState<Record<string, { amount: number; time: string }>>({});
  const [dbLedger, setDbLedger] = useState<TransactionRecord[]>([]);
  const [activeStep, setActiveStep] = useState<string>("IDLE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    status: "success" | "duplicate_safe" | "duplicate_danger";
    message: string;
  } | null>(null);

  const generateNewKey = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setRequestKey(`pay_tx_${randomId}`);
  };

  const handleSendRequest = async (isRetry = false) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLastResult(null);

    // Step 1: Client sends
    setActiveStep("CLIENT_SENDING");
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Server receives and checks idempotency
    setActiveStep("SERVER_EVALUATING");
    await new Promise((r) => setTimeout(r, 600));

    if (idempotencyEnabled && cachedKeys[requestKey]) {
      // Idempotency HIT!
      setActiveStep("CACHE_HIT_BYPASS");
      await new Promise((r) => setTimeout(r, 700));

      setActiveStep("IDLE");
      setIsProcessing(false);
      setLastResult({
        status: "duplicate_safe",
        message: `IDEMPOTENT HIT: Server recognized key "${requestKey}". Skipped DB transaction & returned cached result safely! Zero duplicate charges.`,
      });
      return;
    }

    // Step 3: DB Transaction Execution (ACID)
    setActiveStep("DB_TRANSACTION");
    await new Promise((r) => setTimeout(r, 800));

    // Update DB
    const isDuplicateDanger = !idempotencyEnabled && isRetry;
    const newRecord: TransactionRecord = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      key: requestKey,
      amount,
      status: isDuplicateDanger ? "DUPLICATE_ANOMALY" : "COMMITTED",
      timestamp: new Date().toLocaleTimeString(),
    };

    setDbLedger((prev) => [newRecord, ...prev]);
    setAccountBalance((prev) => prev - amount);

    if (idempotencyEnabled) {
      setCachedKeys((prev) => ({
        ...prev,
        [requestKey]: { amount, time: new Date().toLocaleTimeString() },
      }));
    }

    setActiveStep("IDLE");
    setIsProcessing(false);

    if (isDuplicateDanger) {
      setLastResult({
        status: "duplicate_danger",
        message: `CRITICAL BUG: Idempotency was DISABLED! The same payment of $${amount} was executed twice! Account charged again.`,
      });
    } else {
      setLastResult({
        status: "success",
        message: `ACID Transaction Committed! Key "${requestKey}" processed & recorded. New balance: $${accountBalance - amount}.`,
      });
    }
  };

  const handleReset = () => {
    setAccountBalance(1000);
    setCachedKeys({});
    setDbLedger([]);
    setActiveStep("IDLE");
    setLastResult(null);
    generateNewKey();
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Simulation Controls Bar */}
      <div className="p-4 border-b border-[#e5e5e5] bg-[#fafafa] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1d1d1d] uppercase tracking-wider">
              Simulation Mode:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#e5e5e5] text-xs font-medium text-[#1d1d1d]">
              <Layers className="w-3 h-3 text-[#1d1d1d]" />
              Idempotency & ACID Transactions
            </span>
          </div>

          <button
            onClick={() => setIdempotencyEnabled(!idempotencyEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              idempotencyEnabled
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {idempotencyEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Idempotency Guard: ON
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Idempotency Guard: OFF (Unsafe)
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#1d1d1d] transition-colors"
          title="Reset simulation state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Lab
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Interactive Controls & Scenario Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#f9f9f9] rounded-2xl border border-[#e5e5e5]">
          <div>
            <label className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
              Idempotency Key (Header)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={requestKey}
                onChange={(e) => setRequestKey(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-[#e5e5e5] rounded-xl px-2.5 py-1.5 text-[#1d1d1d] outline-none focus:border-[#1d1d1d]"
              />
              <button
                onClick={generateNewKey}
                className="p-1.5 bg-white border border-[#e5e5e5] rounded-xl hover:bg-[#f0f0f0] text-[#1d1d1d]"
                title="Generate new unique key"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
              Transfer Amount ($)
            </label>
            <div className="mt-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-xs font-mono bg-white border border-[#e5e5e5] rounded-xl px-2.5 py-1.5 text-[#1d1d1d] outline-none focus:border-[#1d1d1d]"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end gap-1.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSendRequest(false)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1d1d1d] hover:bg-[#333333] text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Send Request
              </button>
              <button
                onClick={() => handleSendRequest(true)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#1d1d1d] text-[#1d1d1d] hover:bg-[#f5f5f5] rounded-xl text-xs font-medium transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry (Duplicate)
              </button>
            </div>
          </div>
        </div>

        {/* Live Architecture Flow Pipeline */}
        <div className="relative p-6 bg-white border border-[#e5e5e5] rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-[#1d1d1d] mb-4 flex items-center justify-between">
            <span>LIVE TRANSACTION PIPELINE & SYSTEM NODES</span>
            <span className="text-[11px] font-mono font-normal text-[#6b7280]">
              Account Balance: <strong className="text-[#1d1d1d] font-bold">${accountBalance}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Node 1: Client */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activeStep === "CLIENT_SENDING"
                  ? "border-[#1d1d1d] bg-[#f9f9f9] shadow-md ring-2 ring-[#1d1d1d]/10"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-[#1d1d1d]" />
                <span className="text-xs font-bold text-[#1d1d1d]">Client App / Mobile</span>
              </div>
              <p className="text-[11px] text-[#6b7280]">
                Attaches header: <br />
                <code className="text-[#1d1d1d] font-mono font-medium">Idempotency-Key: {requestKey}</code>
              </p>
              {activeStep === "CLIENT_SENDING" && (
                <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Dispatching POST /payments...
                </div>
              )}
            </div>

            {/* Connecting Arrow 1 */}
            <div className="hidden md:flex absolute left-[30%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <ArrowRight
                className={`w-5 h-5 transition-colors ${
                  activeStep === "CLIENT_SENDING" || activeStep === "SERVER_EVALUATING"
                    ? "text-[#1d1d1d] animate-pulse"
                    : "text-[#d1d5db]"
                }`}
              />
            </div>

            {/* Node 2: API Gateway & Idempotency Store */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activeStep === "SERVER_EVALUATING" || activeStep === "CACHE_HIT_BYPASS"
                  ? "border-[#1d1d1d] bg-[#f9f9f9] shadow-md ring-2 ring-[#1d1d1d]/10"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-[#1d1d1d]" />
                <span className="text-xs font-bold text-[#1d1d1d]">API Server + Key Cache</span>
              </div>
              <div className="text-[11px] text-[#6b7280] space-y-1">
                <div>Cached Keys: {Object.keys(cachedKeys).length}</div>
                {activeStep === "CACHE_HIT_BYPASS" ? (
                  <div className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Matched! Returning cache.
                  </div>
                ) : activeStep === "SERVER_EVALUATING" ? (
                  <div className="text-blue-600 font-medium">Evaluating key in store...</div>
                ) : (
                  <div>Ready for requests</div>
                )}
              </div>
            </div>

            {/* Connecting Arrow 2 */}
            <div className="hidden md:flex absolute left-[64%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <ArrowRight
                className={`w-5 h-5 transition-colors ${
                  activeStep === "DB_TRANSACTION" ? "text-[#1d1d1d] animate-pulse" : "text-[#d1d5db]"
                }`}
              />
            </div>

            {/* Node 3: PostgreSQL Database with ACID */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activeStep === "DB_TRANSACTION"
                  ? "border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-[#1d1d1d]" />
                <span className="text-xs font-bold text-[#1d1d1d]">Database (ACID)</span>
              </div>
              <div className="text-[11px] text-[#6b7280]">
                {activeStep === "DB_TRANSACTION" ? (
                  <div className="text-emerald-700 font-mono text-[10px] space-y-0.5">
                    <div>BEGIN TRANSACTION;</div>
                    <div>INSERT INTO ledger...</div>
                    <div className="font-bold">COMMIT;</div>
                  </div>
                ) : (
                  <div>Committed Records: {dbLedger.length}</div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  lastResult.status === "duplicate_safe"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : lastResult.status === "duplicate_danger"
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-[#f5f5f5] border-[#e5e5e5] text-[#1d1d1d]"
                }`}
              >
                {lastResult.status === "duplicate_safe" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : lastResult.status === "duplicate_danger" ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 shrink-0 text-[#1d1d1d] mt-0.5" />
                )}
                <div className="flex-1 font-medium leading-relaxed">{lastResult.message}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Database Ledger Table */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1d1d1d]">
              PERSISTENT DATABASE LEDGER ({dbLedger.length} transactions)
            </span>
            <span className="text-[10px] text-[#9ca3af]">Atomic Writes Only</span>
          </div>

          {dbLedger.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9ca3af]">
              No transactions executed yet. Click &quot;Send Request&quot; above to watch atomic execution!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fdfdfd] text-[#6b7280]">
                    <th className="py-2.5 px-4 font-medium">Tx ID</th>
                    <th className="py-2.5 px-4 font-medium">Idempotency Key</th>
                    <th className="py-2.5 px-4 font-medium">Deduction</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0] font-mono">
                  {dbLedger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#fafafa]">
                      <td className="py-2.5 px-4 font-semibold text-[#1d1d1d]">{tx.id}</td>
                      <td className="py-2.5 px-4 text-[#4b5563]">{tx.key}</td>
                      <td className="py-2.5 px-4 font-bold text-[#1d1d1d]">-${tx.amount}</td>
                      <td className="py-2.5 px-4">
                        {tx.status === "DUPLICATE_ANOMALY" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-sans font-medium">
                            <AlertTriangle className="w-2.5 h-2.5" /> Duplicate Charge
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-medium">
                            <CheckCircle2 className="w-2.5 h-2.5" /> ACID Committed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[#9ca3af] text-[11px]">{tx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
