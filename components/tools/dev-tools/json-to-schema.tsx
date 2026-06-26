"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check, Download, RefreshCw, Upload, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { EXAMPLE_JSON } from "@/constants/examples"
import { SchemaDraft } from "@/types/dev-tools/json-to-schema"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InferOptions {
  required: boolean
  inferFormats: boolean
  inferEnums: boolean
  nullable: boolean
  draft: SchemaDraft
}

interface SchemaStats {
  objects: number
  arrays: number
  properties: number
  maxDepth: number
  schemaSize: number
  draft: SchemaDraft
}

// ---------------------------------------------------------------------------
// Format detectors
// ---------------------------------------------------------------------------
const FORMAT_PATTERNS: [string, RegExp][] = [
  ["date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/],
  ["date",      /^\d{4}-\d{2}-\d{2}$/],
  ["time",      /^\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?$/],
  ["uuid",      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i],
  ["email",     /^[^@\s]+@[^@\s]+\.[^@\s]+$/],
  ["uri",       /^https?:\/\/.+/],
  ["ipv4",      /^(\d{1,3}\.){3}\d{1,3}$/],
  ["ipv6",      /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i],
  ["hostname",  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i],
]

function detectFormat(val: string): string | null {
  for (const [fmt, re] of FORMAT_PATTERNS) {
    if (re.test(val)) return fmt
  }
  return null
}

// ---------------------------------------------------------------------------
// Core inference engine
// ---------------------------------------------------------------------------
function inferSchema(value: unknown, opts: InferOptions, depth = 0): Record<string, unknown> {
  // null
  if (value === null) {
    return opts.nullable ? { type: ["string", "null"] } : { type: "null" }
  }

  // boolean
  if (typeof value === "boolean") {
    const s: Record<string, unknown> = { type: "boolean" }
    if (opts.inferEnums) s.enum = [value]
    return s
  }

  // number / integer
  if (typeof value === "number") {
    const type = Number.isInteger(value) ? "integer" : "number"
    return { type }
  }

  // string
  if (typeof value === "string") {
    const s: Record<string, unknown> = { type: "string" }
    if (opts.inferFormats) {
      const fmt = detectFormat(value)
      if (fmt) s.format = fmt
    }
    if (opts.inferEnums && !s.format) s.enum = [value]
    return s
  }

  // array
  if (Array.isArray(value)) {
    const s: Record<string, unknown> = { type: "array" }
    if (value.length === 0) {
      s.items = {}
      return s
    }

    // infer each item's schema
    const itemSchemas = value.map((item) => inferSchema(item, opts, depth + 1))

    // Check if all items have the same type
    const types = [...new Set(itemSchemas.map((sc) => sc.type as string))]
    if (types.length === 1) {
      // Homogeneous — merge object schemas if needed
      if (types[0] === "object") {
        s.items = mergeObjectSchemas(itemSchemas, opts)
      } else {
        s.items = itemSchemas[0]
      }
    } else {
      // Mixed — anyOf
      const unique = dedupeSchemas(itemSchemas)
      s.items = unique.length === 1 ? unique[0] : { anyOf: unique }
    }
    return s
  }

  // object
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    const properties: Record<string, unknown> = {}

    for (const key of keys) {
      properties[key] = inferSchema(obj[key], opts, depth + 1)
    }

    const s: Record<string, unknown> = { type: "object", properties }
    if (opts.required && keys.length > 0) s.required = keys
    return s
  }

  return {}
}

function mergeObjectSchemas(
  schemas: Record<string, unknown>[],
  opts: InferOptions
): Record<string, unknown> {
  const allKeys = new Set<string>()
  for (const sc of schemas) {
    const props = sc.properties as Record<string, unknown> | undefined
    if (props) Object.keys(props).forEach((k) => allKeys.add(k))
  }

  const merged: Record<string, unknown> = {}
  for (const key of allKeys) {
    const values = schemas
      .map((sc) => (sc.properties as Record<string, unknown>)?.[key])
      .filter((v) => v !== undefined)
    if (values.length === 1) {
      merged[key] = values[0]
    } else {
      const types = [...new Set(values.map((v) => (v as Record<string, unknown>).type as string))]
      if (types.length === 1) {
        merged[key] = values[0]
      } else {
        merged[key] = { anyOf: dedupeSchemas(values as Record<string, unknown>[]) }
      }
    }
  }

  const result: Record<string, unknown> = { type: "object", properties: merged }
  if (opts.required && allKeys.size > 0) result.required = [...allKeys]
  return result
}

function dedupeSchemas(schemas: Record<string, unknown>[]): Record<string, unknown>[] {
  const seen = new Set<string>()
  return schemas.filter((s) => {
    const key = JSON.stringify(s)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function wrapWithDraft(schema: Record<string, unknown>, draft: SchemaDraft): Record<string, unknown> {
  const uris: Record<SchemaDraft, string> = {
    "draft-07":       "http://json-schema.org/draft-07/schema#",
    "draft-2019-09":  "https://json-schema.org/draft/2019-09/schema",
    "draft-2020-12":  "https://json-schema.org/draft/2020-12/schema",
  }
  return { $schema: uris[draft], ...schema }
}

// ---------------------------------------------------------------------------
// Stats collector
// ---------------------------------------------------------------------------
function collectStats(schema: Record<string, unknown>, draft: SchemaDraft): SchemaStats {
  let objects = 0, arrays = 0, properties = 0, maxDepth = 0

  function walk(node: unknown, depth: number) {
    if (!node || typeof node !== "object") return
    maxDepth = Math.max(maxDepth, depth)

    const n = node as Record<string, unknown>
    if (n.type === "object") {
      objects++
      const props = n.properties as Record<string, unknown> | undefined
      if (props) {
        properties += Object.keys(props).length
        Object.values(props).forEach((v) => walk(v, depth + 1))
      }
    }
    if (n.type === "array") {
      arrays++
      if (n.items) walk(n.items, depth + 1)
    }
    if (Array.isArray(n.anyOf)) n.anyOf.forEach((v) => walk(v, depth + 1))
  }

  walk(schema, 0)
  return {
    objects, arrays, properties, maxDepth,
    schemaSize: JSON.stringify(schema).length,
    draft,
  }
}

// ---------------------------------------------------------------------------
// JSON validation with line-level error
// ---------------------------------------------------------------------------
function validateJSON(input: string): { valid: boolean; error?: string; line?: number } {
  try {
    JSON.parse(input)
    return { valid: true }
  } catch (e) {
    const msg = (e as Error).message
    const lineMatch = msg.match(/line (\d+)/i) || msg.match(/position (\d+)/i)
    if (lineMatch) {
      // Try to derive line from position
      const pos = parseInt(lineMatch[1])
      if (msg.includes("position")) {
        const line = input.slice(0, pos).split("\n").length
        return { valid: false, error: msg, line }
      }
      return { valid: false, error: msg, line: parseInt(lineMatch[1]) }
    }
    return { valid: false, error: msg }
  }
}

// ---------------------------------------------------------------------------
// Syntax highlighting for JSON/schema output
// ---------------------------------------------------------------------------
function highlightJSON(json: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  return json
    .split("\n")
    .map((line) => {
      return line.replace(
        /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (_, key, str, kw, num) => {
          if (key) return `<span class="jk">${esc(key)}</span>:`
          if (str) return `<span class="js">${esc(str)}</span>`
          if (kw)  return `<span class="jb">${esc(kw)}</span>`
          if (num) return `<span class="jn">${esc(num)}</span>`
          return _
        }
      )
    })
    .join("\n")
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function JsonToSchema() {
  const [input, setInput] = useState("")
  const [opts, setOpts] = useState<InferOptions>({
    required: true,
    inferFormats: true,
    inferEnums: false,
    nullable: true,
    draft: "draft-07",
  })
  const [minify, setMinify] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const set = <K extends keyof InferOptions>(k: K, v: InferOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }))

  // Validate + parse
  const validation = useMemo(() => {
    if (!input.trim()) return null
    return validateJSON(input)
  }, [input])

  // Infer schema
  const schema = useMemo(() => {
    if (!input.trim() || !validation?.valid) return null
    try {
      const parsed = JSON.parse(input)
      const raw = inferSchema(parsed, opts)
      return wrapWithDraft(raw, opts.draft)
    } catch {
      return null
    }
  }, [input, opts, validation])

  const schemaString = useMemo(() => {
    if (!schema) return ""
    return minify ? JSON.stringify(schema) : JSON.stringify(schema, null, 2)
  }, [schema, minify])

  const stats = useMemo(() => {
    if (!schema) return null
    return collectStats(schema, opts.draft)
  }, [schema, opts.draft])

  const handleCopy = useCallback(() => {
    if (!schemaString) return
    navigator.clipboard.writeText(schemaString).then(() => {
      setCopied(true)
      toast.success("Copied successfully to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }, [schemaString])

  const handleDownload = useCallback(() => {
    if (!schemaString) return
    const blob = new Blob([schemaString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "schema.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [schemaString])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setInput(e.target?.result as string)
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const errorLines = useMemo(() => {
    if (!validation || validation.valid || !validation.line) return new Set<number>()
    return new Set([validation.line])
  }, [validation])

  // Render input with line numbers + error highlight
  const inputLines = input.split("\n")

  return (
    <div className="flex flex-col gap-6">

      {/* ── Options bar ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Draft */}
        <div className="relative">
          <select
            value={opts.draft}
            onChange={(e) => set("draft", e.target.value as SchemaDraft)}
            className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
          >
            <option value="draft-07">Draft-07</option>
            <option value="draft-2019-09">Draft 2019-09</option>
            <option value="draft-2020-12">Draft 2020-12</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Toggles */}
        {([
          ["required",     "Required fields"],
          ["inferFormats", "Infer formats"],
          ["inferEnums",   "Infer enums"],
          ["nullable",     "Nullable"],
        ] as [keyof InferOptions, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={opts[key] as boolean}
              onChange={(e) => set(key, e.target.checked)}
              className="accent-purple-600 w-3.5 h-3.5"
            />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
          </label>
        ))}

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Output mode */}
        <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
          {(["pretty", "minify"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setMinify(v === "minify")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                (v === "minify") === minify
                  ? "bg-purple-600 text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 gap-y-4 flex-wrap">
        <div className="flex gap-2 items-center">
            <button
            onClick={() => setInput(EXAMPLE_JSON)}
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
            Try example
            </button>
            <button
            onClick={() => setInput("")}
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
            <RefreshCw className="w-3 h-3" /> Clear
            </button>
            <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
            <Upload className="w-3 h-3" /> Import file
            </button>
            <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
        </div>

        {schemaString && (
          <div className="sm:ml-auto flex items-center gap-2">
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
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        )}
      </div>

      {/* ── Panes ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Input pane */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              JSON Input
            </label>
            {validation?.valid && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Valid JSON
              </span>
            )}
          </div>

          {/* Line-numbered editor */}
          <div
            className={cn(
              "relative rounded-lg border overflow-hidden",
              dragOver
                ? "border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                : validation && !validation.valid && input.trim()
                ? "border-red-300 dark:border-red-800"
                : "border-zinc-200 dark:border-zinc-800"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Drop JSON file here
                </span>
              </div>
            )}

            <div className="flex font-mono text-xs min-h-64 max-h-120">
              {/* Line numbers */}
              <div className="select-none sticky left-0 bg-zinc-100 dark:bg-zinc-800/60 border-r border-zinc-200 dark:border-zinc-800 px-2 py-3 flex flex-col text-right text-zinc-400 dark:text-zinc-600 leading-5 min-w-10">
                {(input || " ").split("\n").map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[11px] leading-5",
                      errorLines.has(i + 1) && "text-red-500 font-bold"
                    )}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* Textarea overlaid with highlight layer */}
              <div className="relative flex-1">
                {/* Highlight error line */}
                {validation && !validation.valid && validation.line && input && (
                  <div
                    className="absolute left-0 right-0 bg-red-50 dark:bg-red-900/20 pointer-events-none"
                    style={{
                      top: `${(validation.line - 1) * 20 + 12}px`,
                      height: "20px",
                    }}
                  />
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Paste JSON here…\n\nOr drag and drop a .json file`}
                  spellCheck={false}
                  className="w-full h-full absolute inset-0 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-0 resize-none leading-5 min-h-64"
                  style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}
                />
              </div>
            </div>

            {/* Error message */}
            {validation && !validation.valid && input.trim() && (
              <div className="border-t border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-3 py-2">
                <p className="text-xs text-red-600 dark:text-red-400 font-mono">{validation.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Output pane */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            JSON Schema
          </label>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 min-h-64 max-h-120 overflow-auto">
            {schemaString ? (
              <>
                <style>{`
                  .jk { color: #7c3aed; font-weight: 600; }
                  .dark .jk { color: #a78bfa; }
                  .js { color: #16a34a; }
                  .dark .js { color: #4ade80; }
                  .jb { color: #2563eb; font-weight: 600; }
                  .dark .jb { color: #60a5fa; }
                  .jn { color: #d97706; }
                  .dark .jn { color: #fbbf24; }
                `}</style>
                <pre
                  className="p-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-5 whitespace-pre-wrap break-all"
                  dangerouslySetInnerHTML={{ __html: highlightJSON(schemaString) }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-64">
                <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center px-4">
                  {input.trim()
                    ? validation && !validation.valid
                      ? "Fix the JSON error to generate a schema"
                      : "Generating…"
                    : "Paste valid JSON on the left to generate a schema"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-5 py-4">
          <StatItem label="Objects" value={stats.objects} />
          <StatItem label="Arrays" value={stats.arrays} />
          <StatItem label="Properties" value={stats.properties} />
          <StatItem label="Max depth" value={stats.maxDepth} />
          <StatItem label="Schema size" value={`${(stats.schemaSize / 1024).toFixed(1)} KB`} />
          <StatItem label="Draft" value={stats.draft} />
        </div>
      )}
    </div>
  )
}