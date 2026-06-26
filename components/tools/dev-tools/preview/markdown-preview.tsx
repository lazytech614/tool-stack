"use client";

import { useState, useEffect, useRef } from "react";
import {
  Copy, CheckCheck, Download, Eye, Code2, Columns2,
  RefreshCw, WrapText, Hash,
} from "lucide-react";
import { SAMPLE_MARKDOWN } from "@/constants/examples";
import { useTheme } from "next-themes";
import { ViewMode } from "@/types/dev-tools/markdown-preview";
import { counts, parseMarkdown, T } from "@/lib/dev-utils/markdown-preview";

export function MarkdownPreview() {
  const [value, setValue] = useState(SAMPLE_MARKDOWN);
  const [mode, setMode] = useState<ViewMode>("split");
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const stats = counts(value);
  const lineArr = value.split("\n");

  // ── Derive everything from next-themes ──────────────────────────────────────
  // `resolvedTheme` is undefined on the server / before hydration.
  // We wait until mounted so the correct theme is always applied on first paint.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true; // default to dark while loading
  const c = isDark ? T.dark : T.light;

  useEffect(() => {
    if (!mounted) return;
    setHtml(parseMarkdown(value, c));
  }, [value, resolvedTheme, mounted]);

  // Mermaid
  useEffect(() => {
    if (!previewRef.current) return;
    const nodes = previewRef.current.querySelectorAll<HTMLElement>("[data-mermaid]");
    if (!nodes.length) return;
    (async () => {
      try {
        // @ts-ignore
        const mermaid = (await import("https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs")).default;
        mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default", themeVariables: { primaryColor: "#7c3aed" } });
        nodes.forEach(async (node) => {
          const code = decodeURIComponent(node.dataset.mermaid || "");
          try {
            const { svg } = await mermaid.render(node.id + "-svg", code);
            node.innerHTML = svg;
          } catch { /* show raw */ }
        });
      } catch { /* cdn unavailable */ }
    })();
  }, [html]);

  // Copy-code buttons in preview
  useEffect(() => {
    if (!previewRef.current) return;
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(".md-copy-btn") as HTMLElement | null;
      if (!btn) return;
      navigator.clipboard.writeText(decodeURIComponent(btn.dataset.code || ""));
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy"; }, 2000);
    };
    previewRef.current.addEventListener("click", handler);
    return () => previewRef.current?.removeEventListener("click", handler);
  }, [html]);

  const copyRaw = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "document.md"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Shared style helpers ───────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 5,
    padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
    cursor: "pointer", border: `1px solid ${c.border}`,
    background: c.bgTertiary, color: c.textSecondary,
    transition: "all .15s",
  };

  const viewBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 5,
    padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
    cursor: "pointer", border: "none",
    background: active ? c.bgSecondary : "transparent",
    color: active ? c.textPrimary : c.textMuted,
    transition: "all .15s",
    boxShadow: active ? `0 1px 3px rgba(0,0,0,0.15)` : "none",
  });

  const activeBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: c.purpleDim,
    border: `1px solid ${c.purpleBorder}`,
    color: c.purple,
  };

  const paneLabelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: c.textMuted,
    letterSpacing: ".05em", textTransform: "uppercase",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", minHeight: "100vh",
      background: c.bg, color: c.text,
      fontFamily: "ui-sans-serif,system-ui,sans-serif",
      transition: "background .2s, color .2s",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${c.border}`,
        flexWrap: "wrap",
      }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }} className="mb-2 w-full flex justify-between items-center">

          {/* View toggle group */}
          <div style={{
            display: "flex", alignItems: "center", gap: 2, padding: 3,
            borderRadius: 8, background: c.bgTertiary, border: `1px solid ${c.border}`,
          }}>
            {([
              { id: "editor",  icon: <Code2 size={11} />,   label: "Editor"  },
              { id: "split",   icon: <Columns2 size={11} />, label: "Split"   },
              { id: "preview", icon: <Eye size={11} />,      label: "Preview" },
            ] as { id: ViewMode; icon: React.ReactNode; label: string }[]).map(v => (
              <button key={v.id} style={viewBtnStyle(mode === v.id)} onClick={() => setMode(v.id)}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            {/* Word wrap */}
            <button style={wordWrap ? activeBtnStyle : btnBase} onClick={() => setWordWrap(w => !w)} title="Toggle word wrap">
              <WrapText size={12} /> Wrap
            </button>

            {/* Line numbers */}
            <button style={lineNumbers ? activeBtnStyle : btnBase} onClick={() => setLineNumbers(l => !l)} title="Toggle line numbers">
              <Hash size={12} /> Lines
            </button>

            {/* Copy */}
            <button style={btnBase} onClick={copyRaw}>
              {copied
                ? <CheckCheck size={12} color={isDark ? "#34d399" : "#059669"} />
                : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>

            {/* Download */}
            <button style={btnBase} onClick={download}>
              <Download size={12} /> Download
            </button>

            {/* Reset */}
            <button style={btnBase} onClick={() => setValue(SAMPLE_MARKDOWN)} title="Reset">
              <RefreshCw size={12} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Editor pane */}
        {(mode === "editor" || mode === "split") && (
          <div style={{
            display: "flex", flexDirection: "column", flex: 1, minWidth: 0,
            borderRight: mode === "split" ? `1px solid ${c.border}` : "none",
          }}>
            {/* Pane header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 14px", borderBottom: `1px solid ${c.border}`,
              background: c.bgSecondary,
            }}>
              <span style={paneLabelStyle}>Markdown</span>
              <span style={{ fontSize: 11, color: c.textFaint }}>{stats.lines} lines</span>
            </div>

            {/* Editor inner */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 420 }}>
              {/* Line numbers */}
              {lineNumbers && (
                <div style={{
                  padding: "12px 10px", background: c.bgSecondary,
                  borderRight: `1px solid ${c.border}`, textAlign: "right",
                  userSelect: "none", overflow: "hidden", minWidth: "2.75rem",
                }}>
                  {lineArr.map((_, idx) => (
                    <div key={idx} style={{
                      fontSize: 11, fontFamily: "ui-monospace,monospace",
                      lineHeight: "1.6", color: c.textFaint, display: "block",
                    }}>
                      {idx + 1}
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                spellCheck={false}
                placeholder="Type your Markdown here..."
                style={{
                  flex: 1, resize: "none", background: "transparent",
                  color: c.text, fontFamily: "ui-monospace,monospace",
                  fontSize: 12, lineHeight: "1.6", padding: "12px 14px",
                  border: "none", outline: "none",
                  whiteSpace: wordWrap ? "pre-wrap" : "pre",
                  overflowX: wordWrap ? "hidden" : "auto",
                  minHeight: 420,
                }}
              />
            </div>
          </div>
        )}

        {/* Preview pane */}
        {(mode === "preview" || mode === "split") && (
          <div style={{
            display: "flex", flexDirection: "column", flex: 1, minWidth: 0,
            background: c.bg,
          }}>
            {/* Pane header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 14px", borderBottom: `1px solid ${c.border}`,
              background: c.bgSecondary,
            }}>
              <span style={paneLabelStyle}>Preview</span>
              <span style={{ fontSize: 11, color: c.textFaint }}>{stats.words} words</span>
            </div>

            {/* Scrollable preview */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
              <div
                ref={previewRef}
                style={{ maxWidth: 720, margin: "0 auto", fontSize: 14, lineHeight: "1.75", color: c.text }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "7px 20px", borderTop: `1px solid ${c.border}`,
        background: c.bgSecondary,
      }}>
        {[
          { label: "lines", value: stats.lines },
          { label: "words", value: stats.words },
          { label: "chars", value: stats.chars },
        ].map(s => (
          <span key={s.label} style={{ fontSize: 11, color: c.textFaint }}>
            <span style={{ color: c.textMuted, fontWeight: 500 }}>{s.value}</span> {s.label}
          </span>
        ))}
        <span style={{ fontSize: 11, color: c.textFaint, marginLeft: "auto" }}>
          GFM · Mermaid
        </span>
      </div>
    </div>
  );
}