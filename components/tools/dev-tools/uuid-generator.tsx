"use client"

import { useState, useCallback } from "react"
import { Copy, Check, RefreshCw, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { BulkCount, FormatOption, UuidVersion } from "@/types/dev-tools/uuid-generator"

// ── UUID generators ────────────────────────────────────────────────────────

function generateV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xff) % 16
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateV1(): string {
  // Simulate v1 (time-based) using current timestamp + random node
  const now = Date.now()
  const timeHigh = Math.floor(now / 0x100000000)
  const timeLow = now & 0xffffffff
  const rnd = crypto.getRandomValues(new Uint8Array(8))

  const toHex = (n: number, len: number) => n.toString(16).padStart(len, "0")
  const timeLowHex  = toHex(timeLow,  8)
  const timeMidHex  = toHex(timeHigh & 0xffff, 4)
  const timeHighHex = toHex(((timeHigh >> 16) & 0x0fff) | 0x1000, 4)
  const clockSeq    = toHex(((rnd[0] & 0x3f) | 0x80) * 0x100 + rnd[1], 4)
  const node        = Array.from(rnd.slice(2)).map(b => toHex(b, 2)).join("")

  return `${timeLowHex}-${timeMidHex}-${timeHighHex}-${clockSeq}-${node}`
}

async function generateV5(namespace: string, name: string): Promise<string> {
  // RFC 4122 v5 (SHA-1 based)
  const nsBytes = namespace.replace(/-/g, "").match(/.{2}/g)!.map(h => parseInt(h, 16))
  const nameBytes = new TextEncoder().encode(name)
  const combined = new Uint8Array([...nsBytes, ...nameBytes])
  const hashBuf = await crypto.subtle.digest("SHA-1", combined)
  const h = Array.from(new Uint8Array(hashBuf))

  h[6] = (h[6] & 0x0f) | 0x50  // version 5
  h[8] = (h[8] & 0x3f) | 0x80  // variant

  const hex = h.map(b => b.toString(16).padStart(2, "0"))
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-")
}

// DNS namespace UUID (standard)
const DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"

function applyFormat(uuid: string, formats: Set<FormatOption>): string {
  let out = uuid
  if (formats.has("no-hyphens")) out = out.replace(/-/g, "")
  if (formats.has("uppercase"))  out = out.toUpperCase()
  if (formats.has("lowercase"))  out = out.toLowerCase()
  return out
}

// ── UuidRow ────────────────────────────────────────────────────────────────

function UuidRow({ value, index }: { value: string; index: number }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <span className="w-6 shrink-0 text-right font-mono text-xs text-zinc-400 dark:text-zinc-600">
        {index + 1}
      </span>
      <span className="flex-1 font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all">
        {value}
      </span>
      <button
        onClick={handleCopy}
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
          copied
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
            : "text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-900 dark:hover:text-white"
        )}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────

export function UuidGenerator() {
  const [version, setVersion]   = useState<UuidVersion>("v4")
  const [count, setCount]       = useState<BulkCount>(10)
  const [formats, setFormats]   = useState<Set<FormatOption>>(new Set(["lowercase"]))
  const [uuids, setUuids]       = useState<string[]>([])
  const [v5Name, setV5Name]     = useState("")
  const [generating, setGenerating] = useState(false)

  const toggleFormat = (f: FormatOption) => {
    setFormats(prev => {
      const next = new Set(prev)
      if (f === "uppercase" && !prev.has("uppercase")) {
        next.delete("lowercase")
        next.add("uppercase")
      } else if (f === "lowercase" && !prev.has("lowercase")) {
        next.delete("uppercase")
        next.add("lowercase")
      } else {
        next.has(f) ? next.delete(f) : next.add(f)
      }
      return next
    })
  }

  const generate = useCallback(async () => {
    setGenerating(true)
    const results: string[] = []

    for (let i = 0; i < count; i++) {
      let raw: string
      if (version === "v1") {
        raw = generateV1()
      } else if (version === "v5") {
        raw = await generateV5(DNS_NAMESPACE, v5Name || `name-${i}`)
      } else {
        raw = generateV4()
      }
      results.push(applyFormat(raw, formats))
    }

    setUuids(results)
    setGenerating(false)
  }, [version, count, formats, v5Name])

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"))
    toast.success(`Copied ${uuids.length} UUIDs to clipboard`)
  }

  const versions: { id: UuidVersion; label: string; description: string }[] = [
    { id: "v1", label: "v1", description: "Time-based" },
    { id: "v4", label: "v4", description: "Random"     },
    { id: "v5", label: "v5", description: "Name-based" },
  ]

  const counts: BulkCount[] = [10, 100, 1000]

  const formatOptions: { id: FormatOption; label: string }[] = [
    { id: "lowercase",  label: "Lowercase"       },
    { id: "uppercase",  label: "Uppercase"        },
    { id: "no-hyphens", label: "Without hyphens"  },
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* ── Config ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

        {/* Version */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Version
          </label>
          <div className="flex flex-col gap-1.5">
            {versions.map(v => (
              <button
                key={v.id}
                onClick={() => setVersion(v.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer",
                  version === v.id
                    ? "border-purple-300 dark:border-purple-500/40 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <span className="font-mono font-semibold">UUID {v.label}</span>
                <span className={cn(
                  "text-[10px]",
                  version === v.id ? "text-purple-500 dark:text-purple-400" : "text-zinc-400 dark:text-zinc-600"
                )}>
                  {v.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Bulk count
          </label>
          <div className="flex flex-col gap-1.5">
            {counts.map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer",
                  count === n
                    ? "border-purple-300 dark:border-purple-500/40 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <span className="font-mono font-semibold">{n.toLocaleString()}</span>
                <span className={cn(
                  "text-[10px]",
                  count === n ? "text-purple-500 dark:text-purple-400" : "text-zinc-400 dark:text-zinc-600"
                )}>
                  UUIDs
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Format
          </label>
          <div className="flex flex-col gap-1.5">
            {formatOptions.map(f => (
              <button
                key={f.id}
                onClick={() => toggleFormat(f.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer",
                  formats.has(f.id)
                    ? "border-purple-300 dark:border-purple-500/40 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <span className={cn(
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  formats.has(f.id)
                    ? "border-purple-400 dark:border-purple-500 bg-purple-500 dark:bg-purple-500"
                    : "border-zinc-300 dark:border-zinc-700"
                )}>
                  {formats.has(f.id) && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── v5 name input ─────────────────────────────────────────────────── */}
      {version === "v5" && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Name (v5)
          </label>
          <input
            type="text"
            value={v5Name}
            onChange={e => setV5Name(e.target.value)}
            placeholder="e.g. example.com"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500/60 transition-colors"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Deterministic — same name always produces the same UUID. Uses the DNS namespace.
          </p>
        </div>
      )}

      {/* ── Generate button ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer disabled:cursor-default"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", generating && "animate-spin")} />
          Generate {count.toLocaleString()} UUID{count > 1 ? "s" : ""}
        </button>

        {uuids.length > 0 && (
          <button
            onClick={copyAll}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Copy all
          </button>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {uuids.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              Results
            </label>
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              {uuids.length.toLocaleString()} generated
            </span>
          </div>
          <div className="flex flex-col gap-1 max-h-120 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 p-2">
            {uuids.map((uuid, i) => (
              <UuidRow key={i} value={uuid} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}