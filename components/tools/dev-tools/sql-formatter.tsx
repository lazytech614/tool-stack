"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Copy,
  Download,
  RefreshCw,
  Check,
  ChevronDown,
} from "lucide-react"
import { DIALECTS, EXAMPLE_SQL, SQL_KEYWORDS } from "@/constants/examples"
import { toast } from "sonner"
import { 
  CommaStyle, 
  Dialect, 
  IdentifierCase, 
  IndentStyle, 
  KeywordCase, 
  OutputMode 
} from "@/types/dev-tools/sql-formatter"

interface FormatOptions {
  dialect: Dialect
  indentStyle: IndentStyle
  keywordCase: KeywordCase
  identifierCase: IdentifierCase
  commaStyle: CommaStyle
  outputMode: OutputMode
  formatOnType: boolean
}

const KEYWORD_SET = new Set(SQL_KEYWORDS.map((k) => k.toUpperCase()))

// ---------------------------------------------------------------------------
// Formatter engine (pure TS, no deps)
// ---------------------------------------------------------------------------

function applyCase(word: string, mode: KeywordCase | IdentifierCase): string {
  if (mode === "upper") return word.toUpperCase()
  if (mode === "lower") return word.toLowerCase()
  return word
}

function isKeyword(word: string): boolean {
  return KEYWORD_SET.has(word.toUpperCase())
}

function minifySQL(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getIndent(style: IndentStyle): string {
  if (style === "tab") return "\t"
  return " ".repeat(Number(style))
}

function formatSQL(sql: string, opts: FormatOptions): string {
  if (opts.outputMode === "minify") return minifySQL(sql)

  const indent = getIndent(opts.indentStyle)

  // Strip comments and collapse whitespace for processing
  let src = sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim()

  // Tokenise: strings, parens, commas, semicolons, operators, words
  const TOKEN_RE =
    /('(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|\[.*?\])|(\(|\))|([,;])|([<>!=]+|[+\-*/%])|(\b\w+\b)|(\S)/g

  type Token =
    | { kind: "string"; val: string }
    | { kind: "paren"; val: string }
    | { kind: "comma" | "semi"; val: string }
    | { kind: "op"; val: string }
    | { kind: "word"; val: string }
    | { kind: "other"; val: string }

  const tokens: Token[] = []
  let m: RegExpExecArray | null
  while ((m = TOKEN_RE.exec(src)) !== null) {
    if (m[1]) tokens.push({ kind: "string", val: m[1] })
    else if (m[2]) tokens.push({ kind: "paren", val: m[2] })
    else if (m[3]) tokens.push({ kind: m[3] === "," ? "comma" : "semi", val: m[3] })
    else if (m[4]) tokens.push({ kind: "op", val: m[4] })
    else if (m[5]) tokens.push({ kind: "word", val: m[5] })
    else tokens.push({ kind: "other", val: m[6] })
  }

  // Clause-level keywords that start a new line at depth 0
  const CLAUSE_BREAK = new Set([
    "SELECT","FROM","WHERE","ORDER","GROUP","HAVING","LIMIT","OFFSET",
    "JOIN","INNER","LEFT","RIGHT","FULL","CROSS","OUTER",
    "INSERT","INTO","VALUES","UPDATE","SET","DELETE",
    "CREATE","ALTER","DROP","WITH","UNION","RETURNING",
    "ON",
  ])

  // After SELECT / SET / VALUES, each comma-separated item gets its own line
  let depth = 0
  let inSelectList = false
  const lines: string[] = []
  let current = ""
  const leadingComma = opts.commaStyle === "leading"

  const flush = (extra = "") => {
    const trimmed = current.trim()
    if (trimmed || extra) lines.push(indent.repeat(depth) + trimmed + extra)
    current = ""
  }

  const processWord = (raw: string): string => {
    if (isKeyword(raw)) return applyCase(raw, opts.keywordCase)
    return applyCase(raw, opts.identifierCase)
  }

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    const next = tokens[i + 1]

    if (tok.kind === "word") {
      const up = tok.val.toUpperCase()
      const processed = processWord(tok.val)

      if (CLAUSE_BREAK.has(up) && depth === 0) {
        flush()
        inSelectList = up === "SELECT" || up === "SET" || up === "VALUES"

        // Peek: compound keywords like ORDER BY, GROUP BY, LEFT JOIN, etc.
        const nextUp = next?.kind === "word" ? next.val.toUpperCase() : ""
        const compound: Record<string, string> = {
          ORDER: "BY", GROUP: "BY", PARTITION: "BY",
          INNER: "JOIN", LEFT: "JOIN", RIGHT: "JOIN", FULL: "JOIN",
          CROSS: "JOIN", OUTER: "JOIN",
        }
        if (compound[up] === nextUp) {
          current = processWord(tok.val) + " " + processWord(tokens[i + 1].val)
          i++
        } else {
          current = processed
        }
        flush()
      } else {
        current += (current ? " " : "") + processed
      }
    } else if (tok.kind === "comma") {
      if (inSelectList && depth === 0) {
        if (leadingComma) {
          flush()
          current = ", "
        } else {
          flush(",")
        }
      } else {
        current += ","
      }
    } else if (tok.kind === "semi") {
      flush(";")
      inSelectList = false
    } else if (tok.kind === "paren") {
      if (tok.val === "(") {
        current += (current ? " " : "") + "("
        depth++
      } else {
        depth = Math.max(0, depth - 1)
        current += ")"
      }
    } else if (tok.kind === "op") {
      current += " " + tok.val + " "
    } else {
      // string literal or other
      current += (current ? " " : "") + tok.val
    }
  }
  flush()

  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Syntax highlighting (plain-text → HTML spans)
// ---------------------------------------------------------------------------

function highlightSQL(sql: string): string {
  if (!sql) return ""

  // Escape HTML first
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const parts: string[] = []
  const re =
    /('(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`)|(\b\d+(\.\d+)?\b)|(--[^\n]*)|([<>!=]+|[+\-*/%])|([,;()])|(\b\w+\b)/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(sql)) !== null) {
    if (m.index > last) parts.push(`<span>${esc(sql.slice(last, m.index))}</span>`)

    if (m[1]) {
      // string literal
      parts.push(`<span class="sql-string">${esc(m[1])}</span>`)
    } else if (m[2]) {
      // number
      parts.push(`<span class="sql-number">${esc(m[2])}</span>`)
    } else if (m[4]) {
      // comment
      parts.push(`<span class="sql-comment">${esc(m[4])}</span>`)
    } else if (m[5]) {
      // operator
      parts.push(`<span class="sql-operator">${esc(m[5])}</span>`)
    } else if (m[6]) {
      // punctuation
      parts.push(`<span class="sql-punct">${esc(m[6])}</span>`)
    } else if (m[7]) {
      // word
      if (isKeyword(m[7])) {
        parts.push(`<span class="sql-keyword">${esc(m[7])}</span>`)
      } else {
        parts.push(`<span class="sql-ident">${esc(m[7])}</span>`)
      }
    }
    last = m.index + m[0].length
  }

  if (last < sql.length) parts.push(`<span>${esc(sql.slice(last))}</span>`)

  return parts.join("")
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Select<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
    </div>
  )
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-purple-600 text-white"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Highlighted code pane
// ---------------------------------------------------------------------------

function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      <style>{`
        .sql-keyword { color: #a855f7; font-weight: 600; }
        .dark .sql-keyword { color: #c084fc; }
        .sql-string  { color: #16a34a; }
        .dark .sql-string  { color: #4ade80; }
        .sql-number  { color: #2563eb; }
        .dark .sql-number  { color: #60a5fa; }
        .sql-comment { color: #6b7280; font-style: italic; }
        .dark .sql-comment { color: #4b5563; }
        .sql-operator{ color: #d97706; }
        .dark .sql-operator{ color: #fbbf24; }
        .sql-punct   { color: #71717a; }
        .dark .sql-punct   { color: #52525b; }
        .sql-ident   { color: #0f172a; }
        .dark .sql-ident   { color: #e2e8f0; }
      `}</style>
      <pre
        className="font-mono text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-all"
        dangerouslySetInnerHTML={{ __html: highlightSQL(code) }}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------

function QueryStats({ sql }: { sql: string }) {
  const stats = useMemo(() => {
    if (!sql.trim()) return null
    const up = sql.toUpperCase()
    const tables = [...sql.matchAll(/\bFROM\s+(\w+)|\bJOIN\s+(\w+)/gi)].length
    const joins = [...sql.matchAll(/\bJOIN\b/gi)].length
    const selectMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i)
    const cols = selectMatch
      ? selectMatch[1]
          .split(",")
          .filter((c) => c.trim() !== "*")
          .length
      : 0
    const stmts = sql.split(";").filter((s) => s.trim()).length
    const lines = sql.split("\n").length
    const chars = sql.length

    // Complexity
    const score = joins * 2 + (up.includes("HAVING") ? 1 : 0) + (up.includes("UNION") ? 2 : 0) + ([...sql.matchAll(/SELECT/gi)].length - 1) * 2
    const complexity = score >= 5 ? "High" : score >= 2 ? "Medium" : "Low"
    const complexityColor = score >= 5 ? "text-red-500 dark:text-red-400" : score >= 2 ? "text-amber-500 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"

    return { tables, joins, cols, stmts, lines, chars, complexity, complexityColor }
  }, [sql])

  if (!stats) return null

  const items = [
    { label: "Statements", value: stats.stmts },
    { label: "Tables", value: stats.tables },
    { label: "JOINs", value: stats.joins },
    { label: "Columns", value: stats.cols || "—" },
    { label: "Lines", value: stats.lines },
    { label: "Chars", value: stats.chars },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2.5">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{label}</span>
          <span className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">{value}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Complexity</span>
        <span className={cn("text-xs font-semibold", stats.complexityColor)}>{stats.complexity}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SqlFormatter() {
  const [input, setInput] = useState(EXAMPLE_SQL)
  const [copied, setCopied] = useState(false)
  const [opts, setOpts] = useState<FormatOptions>({
    dialect: "sql",
    indentStyle: "2",
    keywordCase: "upper",
    identifierCase: "lower",
    commaStyle: "trailing",
    outputMode: "format",
    formatOnType: false,
  })

  const set = <K extends keyof FormatOptions>(key: K, val: FormatOptions[K]) =>
    setOpts((prev) => ({ ...prev, [key]: val }))

  const formatted = useMemo(() => {
    const src = input.trim()
    if (!src) return ""
    try {
      return formatSQL(src, opts)
    } catch {
      return src
    }
  }, [input, opts])

  // If formatOnType is off, we gate output behind a manual trigger
  const [manualOutput, setManualOutput] = useState("")
  const output = opts.formatOnType ? formatted : manualOutput

  const handleFormat = useCallback(() => {
    setManualOutput(formatted)
  }, [formatted])

  // Keyboard shortcut: Ctrl/Cmd + Shift + F
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault()
        handleFormat()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleFormat])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      toast.success("Copied successfully to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "formatted.sql"
    a.click()
    URL.revokeObjectURL(url)
  }, [output])

  const handleReset = () => {
    setInput(EXAMPLE_SQL)
    setManualOutput("")
  }

  const hasOutput = output.trim().length > 0

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Output mode */}
        <ToggleGroup
          value={opts.outputMode}
          onChange={(v) => set("outputMode", v)}
          options={[
            { value: "format", label: "Format" },
            { value: "minify", label: "Minify" },
          ]}
        />

        {/* Dialect */}
        <Select
          value={opts.dialect}
          onChange={(v) => set("dialect", v)}
          options={DIALECTS}
          className="w-36"
        />

        {/* Indent */}
        <Select
          value={opts.indentStyle}
          onChange={(v) => set("indentStyle", v)}
          options={[
            { value: "2", label: "2 Spaces" },
            { value: "4", label: "4 Spaces" },
            { value: "tab", label: "Tabs" },
          ]}
          className="w-28"
        />

        {/* Keyword case */}
        <Select
          value={opts.keywordCase}
          onChange={(v) => set("keywordCase", v)}
          options={[
            { value: "upper", label: "UPPERCASE" },
            { value: "lower", label: "lowercase" },
            { value: "preserve", label: "Preserve" },
          ]}
          className="w-32"
        />

        {/* Identifier case */}
        <Select
          value={opts.identifierCase}
          onChange={(v) => set("identifierCase", v)}
          options={[
            { value: "lower", label: "ident lower" },
            { value: "upper", label: "IDENT UPPER" },
            { value: "preserve", label: "Ident Preserve" },
          ]}
          className="w-36"
        />

        {/* Comma style */}
        <Select
          value={opts.commaStyle}
          onChange={(v) => set("commaStyle", v)}
          options={[
            { value: "trailing", label: "Trailing ," },
            { value: "leading", label: "Leading ," },
          ]}
          className="w-28"
        />

        {/* Format-on-type toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={opts.formatOnType}
            onChange={(e) => set("formatOnType", e.target.checked)}
            className="accent-purple-600 w-3.5 h-3.5"
          />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            Auto-format
          </span>
        </label>
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {!opts.formatOnType && (
          <button
            onClick={handleFormat}
            disabled={!input.trim()}
            className="rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Format SQL
            <span className="ml-1.5 opacity-60 hidden sm:inline">⌘⇧F</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>

        {hasOutput && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* ── Panes ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Input SQL
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL here..."
            rows={14}
            spellCheck={false}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-y"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            {opts.outputMode === "minify" ? "Minified SQL" : "Formatted SQL"}
          </label>
          <div
            className={cn(
              "w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 min-h-56 overflow-auto",
              !hasOutput && "flex items-center justify-center"
            )}
          >
            {hasOutput ? (
              <HighlightedCode code={output} />
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
                {opts.formatOnType
                  ? "Start typing to see formatted output"
                  : `Click Format SQL to see output`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {hasOutput && <QueryStats sql={output} />}
    </div>
  )
}