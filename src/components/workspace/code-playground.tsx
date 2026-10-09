"use client";

import { useState } from "react";
import { Play, RotateCcw, Copy, Check, Terminal, Code2, Sparkles } from "lucide-react";

interface CodePlaygroundProps {
  initialCode?: string;
  initialLanguage?: string;
}

export function CodePlayground({
  initialCode,
  initialLanguage = "javascript",
}: CodePlaygroundProps) {
  const defaultJsCode = `// 🧪 Interactive Idempotency & Transaction Demo
class PaymentService {
  constructor() {
    this.processedKeys = new Set();
    this.ledger = [];
  }

  processPayment(idempotencyKey, amount) {
    console.log(\`Received payment request: \${idempotencyKey} for $\${amount}\`);

    // 1. Check idempotency key first
    if (this.processedKeys.has(idempotencyKey)) {
      console.log(\`⚡ Cache Hit! Key \${idempotencyKey} was already processed. Returning cached result.\`);
      return { status: 200, message: "Duplicate prevented, already paid!", key: idempotencyKey };
    }

    // 2. Perform Atomic Transaction (ACID)
    console.log("🔒 Starting DB Transaction...");
    this.ledger.push({ id: \`tx_\${Date.now()}\`, key: idempotencyKey, amount });
    this.processedKeys.add(idempotencyKey);
    console.log("✅ Transaction committed to ledger!");

    return { status: 201, message: "Payment processed successfully", key: idempotencyKey };
  }
}

// Test live:
const service = new PaymentService();

console.log("--- 1. First Request ---");
service.processPayment("order_key_001", 100);

console.log("\\n--- 2. Network Retry (Duplicate Request) ---");
service.processPayment("order_key_001", 100);

console.log("\\n--- 3. New Unique Request ---");
service.processPayment("order_key_002", 50);
`;

  const [code, setCode] = useState(initialCode || defaultJsCode);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutputLogs([]);

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(
          args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
            .join(" ")
        );
      },
      error: (...args: any[]) => {
        logs.push("❌ " + args.join(" "));
      },
      warn: (...args: any[]) => {
        logs.push("⚠️ " + args.join(" "));
      },
    };

    try {
      // Execute in isolated function context
      const runFn = new Function("console", code);
      runFn(customConsole);
      setOutputLogs(logs.length > 0 ? logs : ["(Code executed with no console output)"]);
    } catch (err: any) {
      setOutputLogs([`❌ Runtime Error: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(defaultJsCode);
    setOutputLogs([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181818] border-b border-[#2d2d2d] text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-[#f0f0f0]">Interactive Code Lab</span>
          <span className="text-[10px] bg-[#2a2a2a] text-[#a0a0a0] px-2 py-0.5 rounded font-mono">
            JavaScript (Runnable)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 text-[#9ca3af] hover:text-white rounded hover:bg-[#2a2a2a] transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-[#9ca3af] hover:text-white rounded hover:bg-[#2a2a2a] transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-[#121212] font-semibold text-xs rounded-lg transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Code
          </button>
        </div>
      </div>

      {/* Editor Body & Output */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#2d2d2d] overflow-hidden">
        {/* Code Input */}
        <div className="flex-1 flex flex-col p-3 bg-[#1e1e1e] overflow-auto">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full flex-1 bg-transparent text-xs font-mono text-[#d4d4d4] leading-relaxed resize-none outline-none selection:bg-[#264f78]"
          />
        </div>

        {/* Console Output */}
        <div className="w-full md:w-[45%] flex flex-col bg-[#141414] text-xs font-mono">
          <div className="px-3 py-2 bg-[#1a1a1a] border-b border-[#2d2d2d] flex items-center justify-between text-[#888888]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Execution Output</span>
            </div>
            {outputLogs.length > 0 && (
              <button
                onClick={() => setOutputLogs([])}
                className="text-[10px] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[#d4d4d4]">
            {outputLogs.length === 0 ? (
              <div className="text-[#666666] italic flex items-center gap-1.5 mt-2">
                <Sparkles className="w-3.5 h-3.5 text-[#555555]" />
                Click &quot;Run Code&quot; to test this snippet live.
              </div>
            ) : (
              outputLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
