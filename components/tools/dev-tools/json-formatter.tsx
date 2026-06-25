"use client"

import { useState, useMemo } from "react"
import { Copy, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type IndentSize = 2 | 4

export function JsonFormatterTool() {
  const [input, setInput] = useState("")
  const [indent, setIndent] = useState<IndentSize>(2)
  const [copied, setCopied] = useState(false)

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined }
    try {
      const parsed = JSON.parse(input)
      return { output: JSON.stringify(parsed, null, indent), error: undefined }
    } catch (e) {
      return { output: "", error: (e as Error).message }
    }
  }, [input, indent])

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleMinify = () => {
    if (!input.trim()) return
    try {
      setInput(JSON.stringify(JSON.parse(input)))
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
          {([2, 4] as IndentSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setIndent(size)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                indent === size
                  ? "bg-purple-600 text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {size} spaces
            </button>
          ))}
        </div>

        <button
          onClick={handleMinify}
          disabled={!input.trim() || !!error}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Minify
        </button>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            rows={16}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-y"
          />
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3">
              <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              Formatted
            </label>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="min-h-50 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 overflow-auto whitespace-pre-wrap break-all">
            {output || <span className="text-zinc-400 dark:text-zinc-600">Formatted JSON will appear here...</span>}
          </pre>
        </div>
      </div>
    </div>
  )
}