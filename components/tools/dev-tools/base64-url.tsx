"use client"

import { useState } from "react"
import { Copy, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { EXAMPLE_URL } from "@/constants/examples"

type Mode = "base64-encode" | "base64-decode" | "url-encode" | "url-decode"

const MODES: { value: Mode; label: string }[] = [
  { value: "base64-encode", label: "Base64 Encode" },
  { value: "base64-decode", label: "Base64 Decode" },
  { value: "url-encode", label: "URL Encode" },
  { value: "url-decode", label: "URL Decode" },
]

function transform(input: string, mode: Mode): { output: string; error?: string } {
  try {
    switch (mode) {
      case "base64-encode":
        return { output: btoa(unescape(encodeURIComponent(input))) }
      case "base64-decode":
        return { output: decodeURIComponent(escape(atob(input))) }
      case "url-encode":
        return { output: encodeURIComponent(input) }
      case "url-decode":
        return { output: decodeURIComponent(input) }
    }
  } catch {
    return { output: "", error: "Invalid input for this operation." }
  }
}

export function Base64UrlTool() {
  const [mode, setMode] = useState<Mode>("base64-encode")
  const [input, setInput] = useState(EXAMPLE_URL)
  const [copied, setCopied] = useState(false)

  const { output, error } = transform(input, mode)

  const loadExample = () => {
    setMode("base64-encode");
    setInput(EXAMPLE_URL);
  };

  const resetInput = () => {
    setInput(EXAMPLE_URL)
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success("URL copied successfully")
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all",
              mode === value
                ? "bg-linear-to-r from-purple-600 to-violet-600 text-white border-transparent"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-300 dark:hover:border-purple-500/40 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Input
          </label>

          <div className="flex gap-2 items-center">

              <button
                onClick={resetInput}
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your text here..."
          rows={8}
          className="
            w-full
            rounded-lg
            border
            border-zinc-200
            dark:border-zinc-800

            bg-zinc-50
            dark:bg-zinc-900

            p-3

            font-mono
            text-xs

            text-zinc-900
            dark:text-zinc-100

            placeholder:text-zinc-400
            dark:placeholder:text-zinc-600

            focus:outline-none
            focus:ring-2
            focus:ring-purple-500/40

            resize-y
          "
        />
      </div>

      {/* Output */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Output
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

        {error ? (
          <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="min-h-30 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all whitespace-pre-wrap">
            {output || <span className="text-zinc-400 dark:text-zinc-600">Output will appear here...</span>}
          </div>
        )}
      </div>
    </div>
  )
}