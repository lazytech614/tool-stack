"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { EXAMPLE_MODIFIED, EXAMPLE_ORIGINAL } from "@/constants/examples";
import { RefreshCw } from "lucide-react";

type DiffLine =
  | { type: "added"; text: string }
  | { type: "removed"; text: string }
  | { type: "unchanged"; text: string }

function computeDiff(original: string, modified: string): DiffLine[] {
  const a = original.split("\n")
  const b = modified.split("\n")
  const result: DiffLine[] = []

  // Simple LCS-based line diff
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1])

  let i = 0
  let j = 0
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      result.push({ type: "unchanged", text: a[i] })
      i++
      j++
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: "added", text: b[j] })
      j++
    } else {
      result.push({ type: "removed", text: a[i] })
      i++
    }
  }

  return result
}

const LINE_STYLES: Record<DiffLine["type"], string> = {
  added: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500",
  removed: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-l-2 border-red-500",
  unchanged: "text-zinc-700 dark:text-zinc-400",
}

const LINE_PREFIXES: Record<DiffLine["type"], string> = {
  added: "+ ",
  removed: "- ",
  unchanged: "  ",
}

export function DiffCheckerTool() {
  const [original, setOriginal] = useState(EXAMPLE_ORIGINAL)
  const [modified, setModified] = useState(EXAMPLE_MODIFIED)
  const [view, setView] = useState<"split" | "unified">("split")

  const diff = useMemo(
    () => (original || modified ? computeDiff(original, modified) : []),
    [original, modified]
  )

  const stats = useMemo(() => ({
    added: diff.filter((l) => l.type === "added").length,
    removed: diff.filter((l) => l.type === "removed").length,
  }), [diff])

  const hasDiff = diff.length > 0

  const resetInput = () => {
    setOriginal(EXAMPLE_ORIGINAL);
    setModified(EXAMPLE_MODIFIED);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
          {(["split", "unified"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                view === v
                  ? "bg-purple-600 text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          {hasDiff && (
            <div className="flex gap-3 text-xs font-medium">
              <span className="text-emerald-600 dark:text-emerald-400">+{stats.added} added</span>
              <span className="text-red-500 dark:text-red-400">−{stats.removed} removed</span>
            </div>
          )}

          <div className="flex gap-2">
            
              <button
                onClick={resetInput}
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Original", value: original, onChange: setOriginal },
          { label: "Modified", value: modified, onChange: setModified },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Paste ${label.toLowerCase()} text here...`}
              rows={10}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-y"
            />
          </div>
        ))}
      </div>

      {/* Output */}
      {hasDiff && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Result
          </label>

          {view === "unified" ? (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {diff.map((line, i) => (
                <div key={i} className={cn("px-4 py-0.5 font-mono text-xs whitespace-pre-wrap", LINE_STYLES[line.type])}>
                  {LINE_PREFIXES[line.type]}{line.text || " "}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {(["removed", "added"] as const).map((type) => (
                <div key={type} className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className={cn("text-xs font-medium", type === "added" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
                      {type === "added" ? "Modified" : "Original"}
                    </span>
                  </div>
                  {diff
                    .filter((l) => l.type === "unchanged" || l.type === type)
                    .map((line, i) => (
                      <div key={i} className={cn("px-4 py-0.5 font-mono text-xs whitespace-pre-wrap", LINE_STYLES[line.type])}>
                        {line.text || " "}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}