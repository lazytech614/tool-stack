"use client"

import { useState, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { 
    Copy, 
    Check, 
    RefreshCw, 
    ChevronDown 
} from "lucide-react"
import { 
    CapMode,
    DownloadFormat, 
    GenerateMode, 
    Preset, 
    SentenceLength 
} from "@/types/dev-tools/loremipsum"
import { computeStats, downloadText, generate, PRESET_OPTIONS } from "@/lib/dev-utils/loremipsum"

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
export function LoremIpsum() {
  const [mode, setMode] = useState<GenerateMode>("paragraphs")
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [sentenceLength, setSentenceLength] = useState<SentenceLength>("medium")
  const [capMode, setCapMode] = useState<CapMode>("sentence")
  const [preset, setPreset] = useState<Preset>("lorem")
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("txt")
  const [copied, setCopied] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const MODE_MAX: Record<GenerateMode, number> = { paragraphs: 20, sentences: 50, words: 500 }

  const text = useMemo(
    () => generate({ mode, count, startWithLorem, sentenceLength, capMode, preset }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, count, startWithLorem, sentenceLength, capMode, preset, refreshKey]
  )

  const stats = useMemo(() => computeStats(text), [text])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  const handleModeChange = (m: GenerateMode) => {
    setMode(m)
    const defaults: Record<GenerateMode, number> = { paragraphs: 3, sentences: 10, words: 100 }
    setCount(defaults[m])
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Controls row ── */}
      <div className="flex flex-wrap items-end gap-4">

        {/* Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Generate by
          </label>
          <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            {(["paragraphs", "sentences", "words"] as GenerateMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  mode === m
                    ? "bg-purple-600 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Count
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={MODE_MAX[mode]}
              value={count}
              onChange={(e) => setCount(Math.min(MODE_MAX[mode], Math.max(1, Number(e.target.value))))}
              className="w-20 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 tabular-nums"
            />
            <input
              type="range"
              min={1}
              max={MODE_MAX[mode]}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-28 accent-purple-600"
            />
            <span className="text-xs text-zinc-400 dark:text-zinc-600 w-8">/{MODE_MAX[mode]}</span>
          </div>
        </div>

        {/* Sentence length */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Sentence length
          </label>
          <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            {(["short", "medium", "long"] as SentenceLength[]).map((s) => (
              <button
                key={s}
                onClick={() => setSentenceLength(s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  sentenceLength === s
                    ? "bg-purple-600 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Capitalization */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Case
          </label>
          <div className="relative">
            <select
              value={capMode}
              onChange={(e) => setCapMode(e.target.value as CapMode)}
              className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
            >
              <option value="sentence">Sentence case</option>
              <option value="title">Title Case</option>
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Preset */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
            Preset
          </label>
          <div className="relative">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
              className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
            >
              {PRESET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* ── Checkbox row ── */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="accent-purple-600 w-3.5 h-3.5"
            disabled={preset !== "lorem"}
          />
          <span className={cn(
            "text-xs font-medium",
            preset !== "lorem"
              ? "text-zinc-300 dark:text-zinc-700"
              : "text-zinc-500 dark:text-zinc-400"
          )}>
            Start with "Lorem ipsum…"
          </span>
        </label>
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Regenerate
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>

        <div className="flex items-center gap-1">
          <div className="relative">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as DownloadFormat)}
              className="appearance-none rounded-l-md border border-r-0 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-1.5 pr-6 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
            >
              <option value="txt">.txt</option>
              <option value="md">.md</option>
              <option value="html">.html</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
          </div>
          <button
            onClick={() => downloadText(text, downloadFormat)}
            className="rounded-r-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors bg-zinc-50 dark:bg-zinc-900"
          >
            Download
          </button>
        </div>
      </div>

      {/* ── Output ── */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
          Output
        </label>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 min-h-45 max-h-120 overflow-y-auto">
          {mode === "paragraphs"
            ? text.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-4 last:mb-0"
                >
                  {para}
                </p>
              ))
            : (
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {text}
                </p>
              )}
        </div>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-5 py-4">
          <StatItem label="Words" value={stats.words.toLocaleString()} />
          <StatItem label="Characters" value={stats.chars.toLocaleString()} />
          <StatItem label="Sentences" value={stats.sentences} />
          <StatItem label="Paragraphs" value={stats.paragraphs} />
          <StatItem label="Avg words/sentence" value={stats.avgWordsSentence} />
          <StatItem label="Avg sentences/para" value={stats.avgSentencesPara} />
          <StatItem label="Reading time" value={`${stats.readingTime} min`} />
        </div>
      )}
    </div>
  )
}