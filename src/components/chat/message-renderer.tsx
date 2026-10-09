"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Check, Play, Terminal, Layers, GitBranch, Code2, HelpCircle } from "lucide-react";
import { MermaidViewer } from "./mermaid-viewer";

interface MessageRendererProps {
  content: string;
  isStreaming?: boolean;
  onOpenInStudio?: (tab: "simulator" | "diagram" | "code" | "quiz", data?: string) => void;
}

export function MessageRenderer({
  content,
  isStreaming,
  onOpenInStudio,
}: MessageRendererProps) {
  if (!content && isStreaming) {
    return null;
  }

  // Detect if content talks about simulations, diagrams, or code
  const hasMermaid = content.includes("```mermaid");
  const hasCode = content.includes("```javascript") || content.includes("```typescript") || content.includes("```python");

  return (
    <div className="prose-crackit text-sm text-[#1d1d1d] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
              const lang = match[1].toLowerCase();

              // Special handling for Mermaid diagrams!
              if (lang === "mermaid") {
                return (
                  <MermaidViewer
                    chart={codeString}
                    onOpenInStudio={(chart) => onOpenInStudio?.("diagram", chart)}
                  />
                );
              }

              return (
                <CodeBlock
                  code={codeString}
                  language={lang}
                  onOpenInStudio={() => onOpenInStudio?.("code", codeString)}
                />
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Enhanced table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-[#e5e5e5]">
                <table className="w-full">{children}</table>
              </div>
            );
          },
          // Enhanced blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-3 border-[#1d1d1d] pl-4 text-[#4b5563] italic my-3 bg-[#fafafa] py-2 rounded-r-xl">
                {children}
              </blockquote>
            );
          },
          // Links open in new tab
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1d1d1d] underline underline-offset-2 hover:no-underline font-medium transition-all"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Streaming cursor */}
      {isStreaming && content && (
        <span className="inline-block w-1.5 h-4 bg-[#1d1d1d] animate-pulse ml-0.5 rounded-sm align-text-bottom" />
      )}

      {/* Interactive Quick Launch Badges (Appears when response completes) */}
      {!isStreaming && content && onOpenInStudio && (
        <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mr-1">
            Interactive Lab:
          </span>

          <button
            onClick={() => onOpenInStudio("simulator")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#e5e5e5] text-xs font-medium text-[#1d1d1d] transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Launch Live Simulator
          </button>

          {hasMermaid && (
            <button
              onClick={() => onOpenInStudio("diagram")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#e5e5e5] text-xs font-medium text-[#1d1d1d] transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#1d1d1d]" />
              Visual Architecture
            </button>
          )}

          <button
            onClick={() => onOpenInStudio("code")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#e5e5e5] text-xs font-medium text-[#1d1d1d] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Code Lab
          </button>

          <button
            onClick={() => onOpenInStudio("quiz")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#e5e5e5] text-xs font-medium text-[#1d1d1d] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Practice Challenge
          </button>
        </div>
      )}
    </div>
  );
}

function CodeBlock({
  code,
  language,
  onOpenInStudio,
}: {
  code: string;
  language: string;
  onOpenInStudio?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showRunner, setShowRunner] = useState(false);

  const isRunnable = ["html", "javascript", "js", "css"].includes(
    language.toLowerCase()
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom minimal dark theme
  const customTheme: { [key: string]: React.CSSProperties } = useMemo(
    () => ({
      'code[class*="language-"]': {
        color: "#e5e5e5",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "0.8125rem",
        lineHeight: "1.6",
      },
      'pre[class*="language-"]': {
        color: "#e5e5e5",
        background: "#1d1d1d",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "0.8125rem",
        lineHeight: "1.6",
        padding: "1rem 1.25rem",
        margin: "0",
        overflow: "auto",
        borderRadius: "0 0 12px 12px",
      },
      comment: { color: "#6b7280" },
      prolog: { color: "#6b7280" },
      doctype: { color: "#6b7280" },
      cdata: { color: "#6b7280" },
      punctuation: { color: "#9ca3af" },
      property: { color: "#93c5fd" },
      tag: { color: "#93c5fd" },
      boolean: { color: "#fbbf24" },
      number: { color: "#fbbf24" },
      constant: { color: "#fbbf24" },
      symbol: { color: "#fbbf24" },
      selector: { color: "#86efac" },
      "attr-name": { color: "#86efac" },
      string: { color: "#86efac" },
      char: { color: "#86efac" },
      builtin: { color: "#86efac" },
      operator: { color: "#e5e5e5" },
      entity: { color: "#fbbf24" },
      url: { color: "#86efac" },
      "attr-value": { color: "#86efac" },
      keyword: { color: "#c4b5fd" },
      function: { color: "#93c5fd" },
      "class-name": { color: "#fbbf24" },
      regex: { color: "#fbbf24" },
      important: { color: "#f87171" },
      variable: { color: "#e5e5e5" },
    }),
    []
  );

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#e5e5e5]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1d1d1d] border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-[#6b7280]" />
          <span className="text-xs text-[#a0a0a0] font-medium uppercase">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenInStudio && (
            <button
              onClick={onOpenInStudio}
              className="px-2 py-0.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded text-[11px] text-[#e5e5e5] font-medium transition-colors"
              title="Open in Code Lab"
            >
              Open in Studio
            </button>
          )}

          {isRunnable && (
            <button
              onClick={() => setShowRunner(!showRunner)}
              className="p-1 hover:bg-[#2d2d2d] rounded-md transition-colors"
              title="Run code inline"
            >
              <Play className="w-3 h-3 text-[#6b7280] hover:text-[#86efac]" />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1 hover:bg-[#2d2d2d] rounded-md transition-colors"
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="w-3 h-3 text-[#86efac]" />
            ) : (
              <Copy className="w-3 h-3 text-[#6b7280]" />
            )}
          </button>
        </div>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        style={customTheme}
        language={language}
        PreTag="pre"
        customStyle={{
          margin: 0,
          borderRadius: showRunner ? 0 : "0 0 12px 12px",
        }}
      >
        {code}
      </SyntaxHighlighter>

      {/* Live Runner */}
      {showRunner && isRunnable && (
        <LiveCodeRunner code={code} language={language} />
      )}
    </div>
  );
}

function LiveCodeRunner({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const getHtml = () => {
    if (language === "html") {
      return code;
    }
    if (language === "css") {
      return `<style>${code}</style><div class="preview">CSS Preview</div>`;
    }
    if (language === "javascript" || language === "js") {
      return `
        <div id="output" style="font-family: monospace; font-size: 13px; color: #1d1d1d; padding: 8px;"></div>
        <script>
          const output = document.getElementById('output');
          const originalLog = console.log;
          console.log = function(...args) {
            const line = document.createElement('div');
            line.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
            line.style.marginBottom = '4px';
            output.appendChild(line);
            originalLog.apply(console, args);
          };
          try {
            ${code}
          } catch (e) {
            const errLine = document.createElement('div');
            errLine.textContent = '❌ Error: ' + e.message;
            errLine.style.color = '#ef4444';
            output.appendChild(errLine);
          }
        </script>
      `;
    }
    return code;
  };

  return (
    <div className="border-t border-[#e5e5e5]">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-[#f5f5f5] border-b border-[#e5e5e5]">
        <Play className="w-3 h-3 text-[#22c55e]" />
        <span className="text-xs text-[#9ca3af] font-medium">Output</span>
      </div>
      <iframe
        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Inter,system-ui,sans-serif;padding:12px;font-size:14px;color:#1d1d1d;}</style></head><body>${getHtml()}</body></html>`}
        className="w-full bg-white"
        style={{ height: "120px", border: "none" }}
        sandbox="allow-scripts"
        title="Code output"
      />
    </div>
  );
}
