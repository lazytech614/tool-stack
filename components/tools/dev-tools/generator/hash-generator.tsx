"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Copy, Check, Upload, RefreshCw, ShieldCheck, ShieldX, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SAMPLE_TEXT } from "@/constants/examples"
import { Algorithm, TabMode } from "@/types/dev-tools/hash-generator"
import { hashBuffer, hashText } from "@/lib/dev-utils/hash-generator"

const ALGORITHMS: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"]

// ── HashRow ────────────────────────────────────────────────────────────────

function HashRow({ algo, value }: { algo: Algorithm; value: string | undefined }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 1500)
  }

  const accentMap: Record<Algorithm, string> = {
    "MD5":     "text-orange-600 dark:text-orange-400",
    "SHA-1":   "text-blue-600 dark:text-blue-400",
    "SHA-256": "text-purple-600 dark:text-purple-400",
    "SHA-512": "text-emerald-600 dark:text-emerald-400",
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-semibold uppercase tracking-widest font-mono", accentMap[algo])}>
          {algo}
        </span>
        <button
          onClick={handleCopy}
          disabled={!value}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-default"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-all min-h-8">
        {value ?? <span className="text-zinc-400 dark:text-zinc-600">—</span>}
      </pre>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────

export function HashGenerator() {
  const [tab, setTab] = useState<TabMode>("text")
  const [input, setInput] = useState(SAMPLE_TEXT)
  const [hashes, setHashes] = useState<Partial<Record<Algorithm, string>>>({})
  const [computing, setComputing] = useState(false)

  // file tab
  const [fileName, setFileName] = useState(SAMPLE_TEXT)
  const [fileHashes, setFileHashes] = useState<Partial<Record<Algorithm, string>>>({})
  const [fileComputing, setFileComputing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // compare tab
  const [compareA, setCompareA] = useState(SAMPLE_TEXT)
  const [compareB, setCompareB] = useState(SAMPLE_TEXT)

  // ── text hashing ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!input.trim()) { setHashes({}); return }
    setComputing(true)
    Promise.all(
      ALGORITHMS.map(async a => [a, await hashText(a, input)] as const)
    ).then(entries => {
      setHashes(Object.fromEntries(entries))
      setComputing(false)
    })
  }, [input])

  // ── file hashing ─────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setFileComputing(true)
    const buf = await file.arrayBuffer()
    const entries = await Promise.all(
      ALGORITHMS.map(async a => [a, await hashBuffer(a, buf)] as const)
    )
    setFileHashes(Object.fromEntries(entries))
    setFileComputing(false)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── compare ──────────────────────────────────────────────────────────────
  const compareMatch =
    compareA.trim() && compareB.trim()
      ? compareA.trim().toLowerCase() === compareB.trim().toLowerCase()
      : null

  // ── reset ────────────────────────────────────────────────────────────────
  function handleReset() {
    setInput(SAMPLE_TEXT); 
    setFileName(SAMPLE_TEXT); 
    setCompareA(SAMPLE_TEXT); 
    setCompareB(SAMPLE_TEXT)
    if (fileRef.current) fileRef.current.value = ""
  }

  const tabs: { id: TabMode; label: string }[] = [
    { id: "text",    label: "Text"    },
    { id: "file",    label: "File"    },
    { id: "compare", label: "Compare" },
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                tab === t.id
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer px-2.5"
        >
          <RefreshCw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* ── Text tab ─────────────────────────────────────────────────────── */}
      {tab === "text" && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              Input
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type or paste text to hash…"
              rows={4}
              spellCheck={false}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500/60 resize-none transition-colors"
            />
          </div>

          {input.trim() && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                  Hashes
                </label>
                {computing && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">Computing…</span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {ALGORITHMS.map(a => (
                  <HashRow key={a} algo={a} value={hashes[a]} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── File tab ─────────────────────────────────────────────────────── */}
      {tab === "file" && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              File
            </label>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-12 text-center transition-colors hover:border-purple-400 dark:hover:border-purple-500/60 hover:bg-purple-50/40 dark:hover:bg-purple-500/5"
            >
              <Upload className="h-6 w-6 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Drop a file or click to browse
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  Any file type — hashed entirely in your browser
                </p>
              </div>
              <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
            </div>
          </div>

          {fileName && (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-500">File:</span>
                <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{fileName}</span>
                {fileComputing && (
                  <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600">Computing…</span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                  Hashes
                </label>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {ALGORITHMS.map(a => (
                    <HashRow key={a} algo={a} value={fileHashes[a]} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Compare tab ──────────────────────────────────────────────────── */}
      {tab === "compare" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Hash A", value: compareA, set: setCompareA },
              { label: "Hash B", value: compareB, set: setCompareB },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                  {label}
                </label>
                <textarea
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder="Paste a hash…"
                  rows={3}
                  spellCheck={false}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500/60 resize-none transition-colors"
                />
              </div>
            ))}
          </div>

          {compareMatch === null && (
            <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600" />
              <p className="text-xs text-zinc-500 dark:text-zinc-500">Enter both hashes to compare</p>
            </div>
          )}

          {compareMatch === true && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Hashes match</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">Both values are identical.</p>
              </div>
            </div>
          )}

          {compareMatch === false && (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
                <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">Hashes do not match</p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                    The values differ — possible corruption or tampering.
                  </p>
                </div>
              </div>

              {/* Character diff */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                  Character diff
                </label>
                {[compareA.trim().toLowerCase(), compareB.trim().toLowerCase()].map((h, hi) => {
                  const other = (hi === 0 ? compareB : compareA).trim().toLowerCase()
                  return (
                    <pre key={hi} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 font-mono text-xs break-all whitespace-pre-wrap">
                      {h.split("").map((ch, ci) => (
                        <span
                          key={ci}
                          className={cn(
                            other[ci] !== ch
                              ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded"
                              : "text-zinc-900 dark:text-zinc-100"
                          )}
                        >
                          {ch}
                        </span>
                      ))}
                    </pre>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}