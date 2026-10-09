"use client";

import { useState } from "react";
import {
  Layers,
  Code2,
  HelpCircle,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { MermaidViewer } from "@/components/chat/mermaid-viewer";
import { InteractiveSimulator } from "@/components/workspace/interactive-simulator";
import { CodePlayground } from "@/components/workspace/code-playground";
import { PracticeLab } from "@/components/workspace/practice-lab";

export type StudioTab = "simulator" | "diagram" | "code" | "quiz";

interface WorkspaceStudioProps {
  activeTab?: StudioTab;
  onTabChange?: (tab: StudioTab) => void;
  mermaidChart?: string;
  onClose?: () => void;
}

export function WorkspaceStudio({
  activeTab: externalTab,
  onTabChange,
  mermaidChart,
  onClose,
}: WorkspaceStudioProps) {
  const [internalTab, setInternalTab] = useState<StudioTab>("simulator");
  const [isExpanded, setIsExpanded] = useState(false);

  const activeTab = externalTab ?? internalTab;
  const setTab = (tab: StudioTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const defaultMermaid = `sequenceDiagram
    autonumber
    actor Client
    participant Server as API Gateway
    participant Cache as Idempotency Store
    participant DB as Postgres (ACID)

    Note over Client,Server: 1. Initial Request (Key: "tx_948")
    Client->>Server: POST /payments (Idempotency-Key: "tx_948", $250)
    Server->>Cache: Check key exists?
    Cache-->>Server: Key NOT found (Cache Miss)
    Server->>DB: BEGIN TRANSACTION
    Server->>DB: INSERT INTO payments VALUES ("tx_948", $250)
    Server->>DB: COMMIT (Atomic)
    Server->>Cache: Save key "tx_948" -> Result { status: 201 }
    Server-->>Client: 201 Created (Success)

    Note over Client,Server: 2. Network Timeout & Client Retries!
    Client->>Server: POST /payments (Idempotency-Key: "tx_948", $250)
    Server->>Cache: Check key exists?
    Cache-->>Server: Key FOUND (Cache Hit!)
    Note over Server,DB: Skips DB Transaction Completely!
    Server-->>Client: 200 OK (Cached Receipt: Zero Double Billing)`;

  return (
    <div
      className={`h-full flex flex-col bg-white border-l border-[#e5e5e5] transition-all duration-200 ${
        isExpanded ? "fixed inset-0 z-50 bg-white" : "relative"
      }`}
    >
      {/* Studio Top Navigation Bar */}
      <div className="h-12 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between px-4 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setTab("simulator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "simulator"
                ? "bg-white text-[#1d1d1d] shadow-sm border border-[#e5e5e5]"
                : "text-[#6b7280] hover:text-[#1d1d1d] hover:bg-white/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Live Simulator
          </button>

          <button
            onClick={() => setTab("diagram")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "diagram"
                ? "bg-white text-[#1d1d1d] shadow-sm border border-[#e5e5e5]"
                : "text-[#6b7280] hover:text-[#1d1d1d] hover:bg-white/60"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Visual Architecture
          </button>

          <button
            onClick={() => setTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "code"
                ? "bg-white text-[#1d1d1d] shadow-sm border border-[#e5e5e5]"
                : "text-[#6b7280] hover:text-[#1d1d1d] hover:bg-white/60"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Interactive Code
          </button>

          <button
            onClick={() => setTab("quiz")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "quiz"
                ? "bg-white text-[#1d1d1d] shadow-sm border border-[#e5e5e5]"
                : "text-[#6b7280] hover:text-[#1d1d1d] hover:bg-white/60"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1d1d1d]" />
            Practice Lab
          </button>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 text-[#6b7280]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:text-[#1d1d1d] hover:bg-white rounded-lg transition-colors"
            title={isExpanded ? "Collapse Canvas" : "Full Screen Canvas"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:text-[#1d1d1d] hover:bg-white rounded-lg transition-colors"
              title="Close Studio Canvas"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 overflow-hidden bg-white">
        {activeTab === "simulator" && <InteractiveSimulator />}

        {activeTab === "diagram" && (
          <div className="h-full flex flex-col p-4 bg-white overflow-y-auto">
            <MermaidViewer chart={mermaidChart || defaultMermaid} />
          </div>
        )}

        {activeTab === "code" && <CodePlayground />}

        {activeTab === "quiz" && <PracticeLab />}
      </div>
    </div>
  );
}
