"use client";

import { useState, useCallback, useRef } from "react";
import {
  Copy,
  Download,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Minimize2,
  Maximize2,
  List,
  Hash,
  RefreshCw,
  FileJson,
} from "lucide-react";
import { SAMPLE_JSON } from "@/constants/examples";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "formatted" | "tree";
type ValidationState = "idle" | "valid" | "error";

interface ParseError {
  message: string;
  line: number | null;
  column: number | null;
}

// ─── JSON Syntax Highlighter ──────────────────────────────────────────────────

function highlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-blue-400 dark:text-blue-300"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-purple-400 dark:text-purple-300"; // key
          } else {
            cls = "text-emerald-400 dark:text-emerald-300"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-orange-400 dark:text-orange-300"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-zinc-400"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

// ─── Parse Error Extractor ────────────────────────────────────────────────────

function parseJsonError(raw: string, input: string): ParseError {
  const lineMatch = raw.match(/line (\d+)/i);
  const colMatch = raw.match(/column (\d+)/i);
  const posMatch = raw.match(/position (\d+)/i);

  let line: number | null = lineMatch ? parseInt(lineMatch[1]) : null;
  let column: number | null = colMatch ? parseInt(colMatch[1]) : null;

  if (!line && posMatch) {
    const pos = parseInt(posMatch[1]);
    const upTo = input.slice(0, pos);
    line = upTo.split("\n").length;
    column = upTo.split("\n").pop()!.length + 1;
  }

  const clean = raw.replace(/^SyntaxError:\s*/i, "");
  return { message: clean, line, column };
}

// ─── Tree View Node ───────────────────────────────────────────────────────────

function TreeNode({
  keyName,
  value,
  depth,
}: {
  keyName: string | null;
  value: unknown;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 2);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const entries = isObject
    ? isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>)
    : [];

  const preview = isArray
    ? `[ ${(value as unknown[]).length} items ]`
    : `{ ${Object.keys(value as object).length} keys }`;

  const valueColor = () => {
    if (value === null) return "text-zinc-500";
    if (typeof value === "boolean") return "text-orange-400";
    if (typeof value === "number") return "text-blue-400";
    if (typeof value === "string") return "text-emerald-400";
    return "text-zinc-300";
  };

  return (
    <div className="font-mono text-xs leading-5" style={{ paddingLeft: depth > 0 ? "1rem" : 0 }}>
      <div className="flex items-start gap-1 group">
        {isObject ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-0.5 text-zinc-500 hover:text-white transition-colors mt-0.5 shrink-0"
          >
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {keyName !== null && (
          <span className="text-purple-400 shrink-0">
            "{keyName}"
            <span className="text-zinc-500">: </span>
          </span>
        )}

        {isObject ? (
          open ? (
            <span className="text-zinc-400">{isArray ? "[" : "{"}</span>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {preview}
            </button>
          )
        ) : (
          <span className={valueColor()}>
            {typeof value === "string" ? `"${value}"` : String(value)}
          </span>
        )}
      </div>

      {isObject && open && (
        <>
          <div>
            {entries.map(([k, v]) => (
              <TreeNode key={k} keyName={isArray ? null : k} value={v} depth={depth + 1} />
            ))}
          </div>
          <div className="flex items-center" style={{ paddingLeft: "1rem" }}>
            <span className="text-zinc-400">{isArray ? "]" : "}"}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function JsonFormatterValidator() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [view, setView] = useState<ViewMode>("formatted");
  const [validation, setValidation] = useState<ValidationState>("idle");
  const [error, setError] = useState<ParseError | null>(null);
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);
  const [errorLineHighlight, setErrorLineHighlight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tryParse = (text: string): { ok: true; val: unknown } | { ok: false; err: ParseError } => {
    try {
      return { ok: true, val: JSON.parse(text) };
    } catch (e) {
      return { ok: false, err: parseJsonError((e as Error).message, text) };
    }
  };

  const format = useCallback(() => {
    const result = tryParse(input);
    if (!result.ok) {
      setValidation("error");
      setError(result.err);
      setErrorLineHighlight(result.err.line);
      setOutput("");
      setParsedJson(null);
      return;
    }
    const formatted = JSON.stringify(result.val, null, indent);
    setOutput(formatted);
    setParsedJson(result.val);
    setValidation("valid");
    setError(null);
    setErrorLineHighlight(null);
  }, [input, indent]);

  const minify = useCallback(() => {
    const result = tryParse(input);
    if (!result.ok) {
      setValidation("error");
      setError(result.err);
      setErrorLineHighlight(result.err.line);
      setOutput("");
      setParsedJson(null);
      return;
    }
    const minified = JSON.stringify(result.val);
    setOutput(minified);
    setParsedJson(result.val);
    setValidation("valid");
    setError(null);
    setErrorLineHighlight(null);
  }, [input]);

  const validate = useCallback(() => {
    const result = tryParse(input);
    if (!result.ok) {
      setValidation("error");
      setError(result.err);
      setErrorLineHighlight(result.err.line);
    } else {
      setValidation("valid");
      setError(null);
      setErrorLineHighlight(null);
    }
    setOutput("");
  }, [input]);

  const reset = () => {
    setInput(SAMPLE_JSON);
    setOutput("");
    setValidation("idle");
    setError(null);
    setParsedJson(null);
    setErrorLineHighlight(null);
  };

  const copy = async () => {
    const text = output || input;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied successfully to clipboard")
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const text = output || input;
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayText = output || input;
  const lines = displayText.split("\n");

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      <div className="flex flex-col gap-4">
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={format}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5"
            >
              <Maximize2 className="w-3 h-3" /> Format
            </button>
            <button
              onClick={minify}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <Minimize2 className="w-3 h-3" /> Minify
            </button>
            {input && (
            <button
                onClick={validate}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
                <CheckCircle2 className="w-3 h-3" /> Validate
            </button>
            )}
            {validation === "valid" && (
                <div className="flex items-center self-end gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                </div>
            )}
            {validation === "error" && (
                <div className="flex items-center self-end gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> Invalid
                </div>
            )}
          </div>

          {/* View toggle */}
          {parsedJson !== null && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setView("formatted")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  view === "formatted"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <List className="w-3 h-3" /> Formatted
              </button>
              <button
                onClick={() => setView("tree")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  view === "tree"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <ChevronRight className="w-3 h-3" /> Tree
              </button>
            </div>
          )}

          {/* Right-side controls */}
          <div className="flex items-center gap-1.5 md:ml-auto">
            {/* Indent selector */}
                <Select
                    value={String(indent)}
                    onValueChange={(value) => setIndent(Number(value))}
                >
                    <SelectTrigger
                    className="
                        h-auto
                        w-27.5
                        bg-transparent
                        px-3 py-1.5
                        shadow-none
                        focus:ring-0
                        focus:ring-offset-0
                        text-xs
                        text-zinc-600
                        dark:text-zinc-400
                        border
                        border-zinc-400
                        dark:border-zinc-800
                    "
                    >
                    <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                    <SelectItem value="2">
                        2 spaces
                    </SelectItem>

                    <SelectItem value="4">
                        4 spaces
                    </SelectItem>

                    <SelectItem value="8">
                        8 spaces
                    </SelectItem>
                    </SelectContent>
                </Select>

            {/* Line numbers toggle */}
            <button
              onClick={() => setShowLineNumbers((v) => !v)}
              title="Toggle line numbers"
              className={`p-2 rounded-lg text-xs border transition-colors ${
                showLineNumbers
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
            </button>

            {output && (
                <>
                    <button
                        onClick={copy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "Copy"}
                    </button>

                    <button
                        onClick={download}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" /> Download
                    </button>
                </>
            )}

            
              <button
                onClick={reset}
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-400">Syntax Error</p>
              <p className="text-xs text-red-400/80 mt-0.5 font-mono">{error.message}</p>
              {error.line && (
                <p className="text-xs text-red-400/60 mt-1">
                  Line {error.line}{error.column ? `, column ${error.column}` : ""}
                </p>
              )}
            </div>
            {/* Error JSON card */}
            <div className="hidden sm:block shrink-0">
              <pre className="text-[10px] font-mono text-red-400/70 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/10">
{`{
  "error": "${error.message.replace(/"/g, '\\"').slice(0, 40)}${error.message.length > 40 ? "..." : ""}",
  "line": ${error.line ?? "null"}
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Editor area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input pane */}
          <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-950 shadow-lg dark:shadow-purple-500/5">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500">Input</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden" style={{ minHeight: "420px" }}>
              {/* Line numbers */}
              {showLineNumbers && (
                <div
                  aria-hidden="true"
                  className="select-none px-3 pt-4 pb-4 text-right border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 overflow-hidden"
                  style={{ minWidth: "2.75rem" }}
                >
                  {input.split("\n").map((_, i) => (
                    <div
                      key={i}
                      className={`text-xs leading-5 font-mono ${
                        errorLineHighlight === i + 1
                          ? "text-red-400 font-bold"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex-1 overflow-hidden">
                {/* Error line highlight overlay */}
                {errorLineHighlight && (
                  <div
                    aria-hidden="true"
                    className="absolute left-0 right-0 bg-red-500/10 border-l-2 border-red-500 pointer-events-none z-10"
                    style={{
                      top: `${(errorLineHighlight - 1) * 20 + 16}px`,
                      height: "20px",
                    }}
                  />
                )}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setValidation("idle");
                    setError(null);
                    setErrorLineHighlight(null);
                    setOutput("");
                    setParsedJson(null);
                  }}
                  spellCheck={false}
                  className="w-full h-full resize-none bg-transparent text-xs font-mono leading-5 text-zinc-800 dark:text-zinc-200 p-4 outline-none placeholder:text-zinc-400"
                  placeholder='Paste your JSON here...'
                  style={{ minHeight: "420px" }}
                />
              </div>
            </div>
          </div>

          {/* Output pane */}
          <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-950 shadow-lg dark:shadow-purple-500/5">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500">
                Output {view === "tree" ? "· Tree View" : "· Formatted"}
              </span>
              {output && (
                <span className="text-xs text-zinc-500">
                  {lines.length} lines
                </span>
              )}
            </div>

            <div className="flex flex-1 overflow-hidden" style={{ minHeight: "420px" }}>
              {!output && !parsedJson ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileJson className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400">
                      Click <strong className="text-purple-400">Format</strong> or <strong className="text-purple-400">Validate</strong> to see output
                    </p>
                  </div>
                </div>
              ) : view === "tree" && parsedJson !== null ? (
                <div className="flex-1 overflow-auto p-4">
                  <TreeNode keyName={null} value={parsedJson} depth={0} />
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden">
                  {/* Line numbers */}
                  {showLineNumbers && output && (
                    <div
                      aria-hidden="true"
                      className="select-none px-3 pt-4 pb-4 text-right border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 overflow-hidden shrink-0"
                      style={{ minWidth: "2.75rem" }}
                    >
                      {lines.map((_, i) => (
                        <div key={i} className="text-xs leading-5 font-mono text-zinc-400 dark:text-zinc-600">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 overflow-auto p-4">
                    <pre
                      className="text-xs font-mono leading-5 whitespace-pre"
                      dangerouslySetInnerHTML={{ __html: highlight(output) }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats footer */}
        {output && (
          <div className="flex items-center gap-4 px-1">
            <span className="text-xs text-zinc-500">
              <span className="text-zinc-400 font-medium">{output.length.toLocaleString()}</span> chars
            </span>
            <span className="text-xs text-zinc-500">
              <span className="text-zinc-400 font-medium">{lines.length.toLocaleString()}</span> lines
            </span>
            <span className="text-xs text-zinc-500">
              <span className="text-zinc-400 font-medium">{new Blob([output]).size.toLocaleString()}</span> bytes
            </span>
          </div>
        )}
      </div>
    </div>
  );
}