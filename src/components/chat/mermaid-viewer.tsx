"use client";

import { useEffect, useRef, useState, useId } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Maximize2, Minimize2, Eye } from "lucide-react";

interface MermaidViewerProps {
  chart: string;
  onOpenInStudio?: (chart: string) => void;
}

export function MermaidViewer({ chart, onOpenInStudio }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const uniqueId = useId().replace(/:/g, "_");

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart.trim()) return;

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
          securityLevel: "loose",
          themeVariables: {
            primaryColor: "#ffffff",
            primaryTextColor: "#1d1d1d",
            primaryBorderColor: "#1d1d1d",
            lineColor: "#1d1d1d",
            secondaryColor: "#f5f5f5",
            tertiaryColor: "#fafafa",
            noteBkgColor: "#f5f5f5",
            noteTextColor: "#1d1d1d",
            noteBorderColor: "#e5e5e5",
            actorBkg: "#ffffff",
            actorBorder: "#1d1d1d",
            actorTextColor: "#1d1d1d",
            actorLineColor: "#1d1d1d",
            signalColor: "#1d1d1d",
            signalTextColor: "#1d1d1d",
            labelBoxBkgColor: "#ffffff",
            labelBoxBorderColor: "#1d1d1d",
            labelTextColor: "#1d1d1d",
            loopTextColor: "#1d1d1d",
            activationBorderColor: "#1d1d1d",
            activationBkgColor: "#f5f5f5",
            sequenceNumberColor: "#ffffff",
          },
        });

        // Clean up common AI generation quirks in mermaid strings
        let cleanChart = chart.trim();
        // Remove markdown backticks if accidentally nested
        cleanChart = cleanChart.replace(/^```mermaid\s*/i, "").replace(/```$/, "").trim();

        const renderId = `mermaid_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("[Mermaid] Render failed:", err);
          setError((err as Error)?.message || "Failed to render diagram");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (error) {
    return (
      <div className="my-4 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-xs font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e5e5e5] text-[#9ca3af]">
          <span>Diagram Source</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-[#1d1d1d] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto text-[#1d1d1d]">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      className={`my-4 rounded-2xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 flex flex-col bg-white/95 backdrop-blur-md shadow-2xl"
          : "relative"
      }`}
    >
      {/* Visual Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f9f9f9] border-b border-[#e5e5e5] text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#1d1d1d] tracking-tight">Interactive Visual Flow</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#1d1d1d]">
          {onOpenInStudio && (
            <button
              onClick={() => onOpenInStudio(chart)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#e5e5e5] hover:bg-[#f0f0f0] transition-colors text-[11px] font-medium"
              title="Inspect in Workspace Canvas"
            >
              <Eye className="w-3 h-3 text-[#1d1d1d]" />
              Studio Canvas
            </button>
          )}

          <div className="flex items-center bg-white border border-[#e5e5e5] rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-[#f5f5f5] rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[10px] font-mono text-[#6b7280] hover:text-[#1d1d1d]"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-[#f5f5f5] rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-[#e5e5e5] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-[#6b7280]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-[#6b7280]" />
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-[#e5e5e5] transition-colors"
            title="Copy Diagram Code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#6b7280]" />
            )}
          </button>
        </div>
      </div>

      {/* Render Area */}
      <div
        ref={containerRef}
        className={`overflow-auto p-6 flex items-center justify-center bg-white ${
          isFullscreen ? "flex-1" : "min-h-[220px] max-h-[520px]"
        }`}
      >
        {svgContent ? (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="[&_svg]:max-w-full [&_svg]:h-auto select-none"
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            <div className="w-4 h-4 border-2 border-[#1d1d1d] border-t-transparent rounded-full animate-spin" />
            Rendering visual architecture...
          </div>
        )}
      </div>
    </div>
  );
}
