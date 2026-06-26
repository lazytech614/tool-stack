"use client"

import { 
    useState, 
    useMemo, 
    useCallback, 
    useEffect 
} from "react"
import { cn } from "@/lib/utils"
import { 
    Copy, 
    Check, 
    Download, 
    RefreshCw, 
    ChevronDown 
} from "lucide-react"
import {
  type Base, 
  type PadLength, 
  type GroupStyle, 
  type HexCase,
  type Signedness, 
  type BitwiseOp, 
  type ArithOp,
  detectBase, 
  convert, 
  groupDigits, 
  addPrefix, 
  formatDecimal,
  computeStats, 
  getAsciiPreview, 
  charToInfo,
  floatToBinary32, 
  floatToBinary64,
  bitwiseOp, 
  parseToBigInt, 
  bigIntToAllBases, 
  arithmetic,
  buildExportText, 
  buildExportJSON, 
  buildExportCSV,
} from "@/lib/dev-utils/number-base-converter"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BASES: { base: Base; label: string; short: string }[] = [
  { base: 2,  label: "Binary",      short: "BIN" },
  { base: 8,  label: "Octal",       short: "OCT" },
  { base: 10, label: "Decimal",     short: "DEC" },
  { base: 16, label: "Hexadecimal", short: "HEX" },
]

const PAD_OPTIONS: { value: PadLength; label: string }[] = [
  { value: 0,  label: "No padding" },
  { value: 8,  label: "8 bits"  },
  { value: 16, label: "16 bits" },
  { value: 32, label: "32 bits" },
  { value: 64, label: "64 bits" },
]

const BITWISE_OPS: { op: BitwiseOp; label: string; symbol: string }[] = [
  { op: "AND",    label: "AND",         symbol: "&"  },
  { op: "OR",     label: "OR",          symbol: "|"  },
  { op: "XOR",    label: "XOR",         symbol: "^"  },
  { op: "NOT",    label: "NOT",         symbol: "~"  },
  { op: "LSHIFT", label: "Left Shift",  symbol: "<<" },
  { op: "RSHIFT", label: "Right Shift", symbol: ">>" },
]

const ARITH_OPS: ArithOp[] = ["+", "-", "*", "/"]

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success("Copied successfully to clipboard")
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={handle}
      disabled={!text}
      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors"
    >
      {copied
        ? <Check className="w-3 h-3 text-emerald-500" />
        : <Copy className="w-3 h-3" />}
    </button>
  )
}

function BitVisualizer({ binary }: { binary: string }) {
  const clean = binary.replace(/^-/, "").replace(/ /g, "")
  if (!clean) return null
  const isNeg = binary.startsWith("-")
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {isNeg && (
        <span className="text-[10px] font-mono text-red-500 dark:text-red-400 self-center mr-1">−</span>
      )}
      {clean.split("").map((bit, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-mono font-semibold border transition-colors",
            bit === "1"
              ? "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
              : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600"
          )}
        >
          {bit}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Output row — used for each base conversion result
// ---------------------------------------------------------------------------
function OutputRow({
  label, short, value, displayValue, empty, isInput,
}: {
  label: string
  short: string
  value: string
  displayValue: string
  empty: boolean
  isInput: boolean
}) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
      isInput
        ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10"
        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
    )}>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          {label}
          {isInput && (
            <span className="ml-2 text-purple-500 dark:text-purple-400 normal-case tracking-normal font-medium">
              input
            </span>
          )}
        </span>
        <span className={cn(
          "font-mono text-sm break-all leading-relaxed",
          empty
            ? "text-zinc-300 dark:text-zinc-700"
            : "text-zinc-900 dark:text-zinc-100"
        )}>
          {empty ? `—` : displayValue}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0 mt-1">
        <span className="text-[10px] font-mono font-semibold text-zinc-300 dark:text-zinc-700">{short}</span>
        <CopyButton text={value} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({ title, children, className }: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
        {title}
      </label>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function NumberBaseConverter() {
  const [input, setInput] = useState("")
  const [fromBase, setFromBase] = useState<Base>(10)
  const [autoDetect, setAutoDetect] = useState(true)
  const [hexCase, setHexCase] = useState<HexCase>("upper")
  const [padLength, setPadLength] = useState<PadLength>(0)
  const [groupStyle, setGroupStyle] = useState<GroupStyle>("none")
  const [showPrefix, setShowPrefix] = useState(false)
  const [signedness, setSignedness] = useState<Signedness>("unsigned")
  const [showFormatDec, setShowFormatDec] = useState(false)
  const [exportFormat, setExportFormat] = useState<"txt" | "json" | "csv">("txt")

  // Bitwise playground
  const [bwA, setBwA] = useState("")
  const [bwB, setBwB] = useState("")
  const [bwOp, setBwOp] = useState<BitwiseOp>("AND")
  const [bwBase, setBwBase] = useState<Base>(10)
  const [bwShift, setBwShift] = useState(1)

  // Arithmetic
  const [arA, setArA] = useState("")
  const [arB, setArB] = useState("")
  const [arOp, setArOp] = useState<ArithOp>("+")
  const [arBase, setArBase] = useState<Base>(10)

  // Char converter
  const [charInput, setCharInput] = useState("Q")

  // Float
  const [floatInput, setFloatInput] = useState("3.14")

  // ── Auto-detect ──
  const detected = useMemo(() => {
    if (!autoDetect || !input.trim()) return null
    return detectBase(input)
  }, [autoDetect, input])

  const effectiveBase: Base = autoDetect && detected ? detected.base : fromBase
  const effectiveInput = autoDetect && detected ? detected.stripped : input

  // ── Main conversion ──
  const result = useMemo(
    () => convert(effectiveInput, effectiveBase, hexCase, padLength, signedness),
    [effectiveInput, effectiveBase, hexCase, padLength, signedness]
  )

  const stats = useMemo(() => computeStats(result), [result])

  const asciiPreview = useMemo(
    () => getAsciiPreview(result.decimalValue),
    [result.decimalValue]
  )

  // Display helpers
  const display = useCallback(
    (val: string, base: Base) => {
      if (!val) return ""
      let v = groupDigits(val, base === 2 ? groupStyle : "none")
      if (showPrefix) v = addPrefix(v, base, hexCase)
      if (base === 10 && showFormatDec) v = formatDecimal(v)
      return v
    },
    [groupStyle, showPrefix, hexCase, showFormatDec]
  )

  // ── Bitwise ──
  const bwResult = useMemo(() => {
    const aVal = parseToBigInt(bwA, bwBase)
    const bVal = parseToBigInt(bwB, bwBase)
    if (aVal === null) return null
    const bFinal = bVal ?? BigInt(0)
    try {
      const res = bitwiseOp(aVal, bFinal, bwOp, bwShift)
      const abs = res < 0 ? -res : res
      return bigIntToAllBases(abs, hexCase)
    } catch {
      return null
    }
  }, [bwA, bwB, bwOp, bwBase, bwShift, hexCase])

  // ── Arithmetic ──
  const arResult = useMemo(() => {
    const aVal = parseToBigInt(arA, arBase)
    const bVal = parseToBigInt(arB, arBase)
    if (aVal === null || bVal === null) return null
    const res = arithmetic(aVal, bVal, arOp)
    if (res === null) return null
    return bigIntToAllBases(res, hexCase)
  }, [arA, arB, arOp, arBase, hexCase])

  // ── Char converter ──
  const charInfo = useMemo(() => charToInfo(charInput), [charInput])

  // ── Float ──
  const floatBinary = useMemo(() => {
    const n = parseFloat(floatInput)
    if (isNaN(n)) return null
    return { b32: floatToBinary32(n), b64: floatToBinary64(n) }
  }, [floatInput])

  // ── Download ──
  const handleDownload = () => {
    const content =
      exportFormat === "txt"
        ? buildExportText(input, effectiveBase, result, showPrefix, hexCase)
        : exportFormat === "json"
        ? buildExportJSON(input, effectiveBase, result)
        : buildExportCSV(input, effectiveBase, result)
    const ext = exportFormat
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversion.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "l") { e.preventDefault(); setInput("") }
        if (e.key === "/") { e.preventDefault(); document.getElementById("nbc-input")?.focus() }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const hasResult = !!result.decimal && !result.error

  return (
    <div className="flex flex-col gap-8">

      {/* ── Input row ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Input */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-45">
            <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                    Number
                </label>

                {/* Actions */}
                <div className="flex items-end gap-2 pb-0.5">
                    <button
                    onClick={() => setInput("255")}
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
                </div>
            </div>

            <input
              id="nbc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a number…"
              spellCheck={false}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Base selector */}
          {!autoDetect && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500 text-right">
                Input base
              </label>
              <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
                {BASES.map(({ base, short }) => (
                  <button
                    key={base}
                    onClick={() => setFromBase(base)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      fromBase === base
                        ? "bg-purple-600 text-white"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    {short}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Options row */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)}
              className="accent-purple-600 w-3.5 h-3.5" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Auto-detect base</span>
          </label>

          {/* Hex case toggle */}
          <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            {(["upper", "lower"] as HexCase[]).map((c) => (
              <button key={c} onClick={() => setHexCase(c)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors",
                  hexCase === c
                    ? "bg-purple-600 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}>
                {c === "upper" ? "FF" : "ff"}
              </button>
            ))}
          </div>

          {/* Padding */}
          <div className="relative">
            <select value={padLength} onChange={(e) => setPadLength(Number(e.target.value) as PadLength)}
              className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer">
              {PAD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
          </div>

          {/* Grouping */}
          <div className="relative">
            <select value={groupStyle} onChange={(e) => setGroupStyle(e.target.value as GroupStyle)}
              className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer">
              <option value="none">No grouping</option>
              <option value="4">Group by 4</option>
              <option value="8">Group by 8</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
          </div>

          {/* Signedness */}
          <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            {(["unsigned", "signed"] as Signedness[]).map((s) => (
              <button key={s} onClick={() => setSignedness(s)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  signedness === s
                    ? "bg-purple-600 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}>
                {s}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={showPrefix} onChange={(e) => setShowPrefix(e.target.checked)}
              className="accent-purple-600 w-3.5 h-3.5" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Show prefix</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={showFormatDec} onChange={(e) => setShowFormatDec(e.target.checked)}
              className="accent-purple-600 w-3.5 h-3.5" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Format decimal</span>
          </label>
        </div>

        {/* Auto-detect badge */}
        {autoDetect && detected && (
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Detected: {detected.detected}
          </p>
        )}

        {/* Error */}
        {result.error && input.trim() && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium font-mono">{result.error}</p>
        )}
      </div>

      {/* ── Conversion outputs ── */}
      <Section title="Conversions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BASES.map(({ base, label, short }) => {
            const raw = base === 2 ? result.binary : base === 8 ? result.octal : base === 10 ? result.decimal : result.hex
            return (
              <OutputRow
                key={base}
                label={label}
                short={short}
                value={raw}
                displayValue={display(raw, base)}
                empty={!raw}
                isInput={effectiveBase === base}
              />
            )
          })}
        </div>

        {/* Bit visualizer */}
        {hasResult && result.binary && result.binary.replace(/^-/, "").length <= 64 && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">
              Bit visualization
            </p>
            <BitVisualizer binary={groupStyle !== "none" ? display(result.binary, 2) : result.binary} />
          </div>
        )}

        {/* ASCII preview */}
        {asciiPreview && (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              ASCII / Unicode
            </span>
            <span className="text-2xl leading-none">{asciiPreview}</span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              U+{result.decimal ? parseInt(result.decimal).toString(16).toUpperCase().padStart(4, "0") : ""}
            </span>
          </div>
        )}
      </Section>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-5 py-4">
          <StatItem label="Decimal" value={stats.decimalValue} />
          <StatItem label="Binary digits" value={stats.binaryDigits} />
          <StatItem label="Hex digits" value={stats.hexDigits} />
          <StatItem label="Octal digits" value={stats.octalDigits} />
          <StatItem label="Bytes" value={stats.bytes} />
          <StatItem label="Bits" value={stats.bits} />
        </div>
      )}

      {/* ── Char converter ── */}
      <Section title="Character Converter">
        <div className="flex flex-wrap items-start gap-4">
          <input
            value={charInput}
            onChange={(e) => setCharInput(e.target.value.slice(-1))}
            placeholder="A"
            maxLength={1}
            className="w-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 font-mono text-lg text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          {charInfo && (
            <div className="flex flex-wrap gap-3 flex-1">
              {[
                  { label: "Binary",             value: charInfo.binary },
                  { label: "Hex",                value: charInfo.hex },
                  { label: "Decimal",            value: charInfo.decimal },
                  { label: "ASCII / Code point", value: charInfo.ascii },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 flex-1">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">{label}</span>
                  <div className="flex items-center gap-1 justify-between">
                    <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</span>
                    <CopyButton text={value} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ── IEEE 754 Float ── */}
      <Section title="IEEE 754 Float → Binary">
        <div className="flex flex-wrap items-start gap-4">
          <input
            value={floatInput}
            onChange={(e) => setFloatInput(e.target.value)}
            placeholder="3.14"
            className="w-32 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          {floatBinary && (
            <div className="flex flex-wrap flex-col md:flex-row gap-3 flex-1">
              {[
                { label: "32-bit (float)", value: floatBinary.b32 },
                { label: "64-bit (double)", value: floatBinary.b64 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">{label}</span>
                    <CopyButton text={value} />
                  </div>
                  <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ── Bitwise playground ── */}
      <Section title="Bitwise Playground">
        <div className="flex flex-wrap items-end gap-3">
          {/* Base for bitwise */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">Base</label>
            <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
              {BASES.map(({ base, short }) => (
                <button key={base} onClick={() => setBwBase(base)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    bwBase === base
                      ? "bg-purple-600 text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}>
                  {short}
                </button>
              ))}
            </div>
          </div>
         <div className="flex gap-2 w-full">
             <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">A</label>
                <input value={bwA} onChange={(e) => setBwA(e.target.value)} placeholder="A"
                className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            </div>
            {/* Op */}
            <div className="flex shrink-0 flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">Op</label>
                <div className="relative">
                <select value={bwOp} onChange={(e) => setBwOp(e.target.value as BitwiseOp)}
                    className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-8 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer">
                    {BITWISE_OPS.map(({ op, symbol, label }) => (
                    <option key={op} value={op}>{symbol} {label}</option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                </div>
            </div>
            {/* B — hide for NOT */}
            {bwOp !== "NOT" && bwOp !== "LSHIFT" && bwOp !== "RSHIFT" ? (
                <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">B</label>
                <input value={bwB} onChange={(e) => setBwB(e.target.value)} placeholder="B"
                    className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
                </div>
            ) : (bwOp === "LSHIFT" || bwOp === "RSHIFT") ? (
                <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">Shift by</label>
                <input type="number" min={1} max={63} value={bwShift}
                    onChange={(e) => setBwShift(Math.max(1, Math.min(63, Number(e.target.value))))}
                    className="w-20 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
                </div>
            ) : null}
         </div>
        </div>

        {bwResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {(["binary", "octal", "decimal", "hex"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600 block mb-0.5">{k}</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all">{bwResult[k]}</span>
                  <CopyButton text={bwResult[k]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Arithmetic ── */}
      <Section title="Arithmetic">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">Base</label>
            <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
              {BASES.map(({ base, short }) => (
                <button key={base} onClick={() => setArBase(base)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    arBase === base
                      ? "bg-purple-600 text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}>
                  {short}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">A</label>
                <input value={arA} onChange={(e) => setArA(e.target.value)} placeholder="A"
                className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            </div>
            <div className="flex shrink-0 gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 self-end">
                {ARITH_OPS.map((op) => (
                <button key={op} onClick={() => setArOp(op)}
                    className={cn(
                    "rounded-md w-8 py-1 text-sm font-mono font-medium transition-colors",
                    arOp === op
                        ? "bg-purple-600 text-white"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    )}>
                    {op}
                </button>
                ))}
            </div>
            <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">B</label>
                <input value={arB} onChange={(e) => setArB(e.target.value)} placeholder="B"
                className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            </div>
          </div>
        </div>

        {arResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["binary", "octal", "decimal", "hex"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600 block mb-0.5">{k}</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all">{arResult[k]}</span>
                  <CopyButton text={arResult[k]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Export ── */}
      {hasResult && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-400 dark:text-zinc-600">Export as</span>
          <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            {(["txt", "json", "csv"] as const).map((f) => (
              <button key={f} onClick={() => setExportFormat(f)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-mono font-medium uppercase transition-colors",
                  exportFormat === f
                    ? "bg-purple-600 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            <Download className="w-3 h-3" /> Download
          </button>
          <span className="ml-auto text-[10px] text-zinc-300 dark:text-zinc-700 hidden sm:block">
            Ctrl+L clear · Ctrl+/ focus input
          </span>
        </div>
      )}
    </div>
  )
}