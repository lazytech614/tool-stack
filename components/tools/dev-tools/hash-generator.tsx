"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Copy, Check, Upload, RefreshCw, ShieldCheck, ShieldX, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SAMPLE_TEXT } from "@/constants/examples"
import { Algorithm, TabMode } from "@/types/dev-tools/hash-generator"

const ALGORITHMS: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"]

// ── MD5 (pure JS — crypto.subtle dropped MD5) ─────────────────────────────

function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    return ((x >> 16) + (y >> 16) + (lsw >> 16)) << 16 | (lsw & 0xffff)
  }
  function rol(n: number, c: number) { return (n << c) | (n >>> (32 - c)) }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t) }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t) }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t) }

  function blks(s: string): number[] {
    const n = ((s.length + 8) >> 6) + 1
    const b = new Array(n * 16).fill(0)
    for (let i = 0; i < s.length; i++) b[i >> 2] |= s.charCodeAt(i) << ((i % 4) * 8)
    b[s.length >> 2] |= 0x80 << ((s.length % 4) * 8)
    b[n * 16 - 2] = s.length * 8
    return b
  }

  const x = blks(input)
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
  for (let i = 0; i < x.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d]
    a=ff(a,b,c,d,x[i],7,-680876936);    b=ff(d,a,b,c,x[i+1],12,-389564586)
    c=ff(c,d,a,b,x[i+2],17,606105819);  d=ff(b,c,d,a,x[i+3],22,-1044525330)
    a=ff(a,b,c,d,x[i+4],7,-176418897);  b=ff(d,a,b,c,x[i+5],12,1200080426)
    c=ff(c,d,a,b,x[i+6],17,-1473231341);d=ff(b,c,d,a,x[i+7],22,-45705983)
    a=ff(a,b,c,d,x[i+8],7,1770035416);  b=ff(d,a,b,c,x[i+9],12,-1958414417)
    c=ff(c,d,a,b,x[i+10],17,-42063);    d=ff(b,c,d,a,x[i+11],22,-1990404162)
    a=ff(a,b,c,d,x[i+12],7,1804603682); b=ff(d,a,b,c,x[i+13],12,-40341101)
    c=ff(c,d,a,b,x[i+14],17,-1502002290);d=ff(b,c,d,a,x[i+15],22,1236535329)
    a=gg(a,b,c,d,x[i+1],5,-165796510);  b=gg(d,a,b,c,x[i+6],9,-1069501632)
    c=gg(c,d,a,b,x[i+11],14,643717713); d=gg(b,c,d,a,x[i],20,-373897302)
    a=gg(a,b,c,d,x[i+5],5,-701558691);  b=gg(d,a,b,c,x[i+10],9,38016083)
    c=gg(c,d,a,b,x[i+15],14,-660478335);d=gg(b,c,d,a,x[i+4],20,-405537848)
    a=gg(a,b,c,d,x[i+9],5,568446438);   b=gg(d,a,b,c,x[i+14],9,-1019803690)
    c=gg(c,d,a,b,x[i+3],14,-187363961); d=gg(b,c,d,a,x[i+8],20,1163531501)
    a=gg(a,b,c,d,x[i+13],5,-1444681467);b=gg(d,a,b,c,x[i+2],9,-51403784)
    c=gg(c,d,a,b,x[i+7],14,1735328473); d=gg(b,c,d,a,x[i+12],20,-1926607734)
    a=hh(a,b,c,d,x[i+5],4,-378558);     b=hh(d,a,b,c,x[i+8],11,-2022574463)
    c=hh(c,d,a,b,x[i+11],16,1839030562);d=hh(b,c,d,a,x[i+14],23,-35309556)
    a=hh(a,b,c,d,x[i+1],4,-1530992060);b=hh(d,a,b,c,x[i+4],11,1272893353)
    c=hh(c,d,a,b,x[i+7],16,-155497632); d=hh(b,c,d,a,x[i+10],23,-1094730640)
    a=hh(a,b,c,d,x[i+13],4,681279174);  b=hh(d,a,b,c,x[i],11,-358537222)
    c=hh(c,d,a,b,x[i+3],16,-722521979); d=hh(b,c,d,a,x[i+6],23,76029189)
    a=hh(a,b,c,d,x[i+9],4,-640364487);  b=hh(d,a,b,c,x[i+12],11,-421815835)
    c=hh(c,d,a,b,x[i+15],16,530742520); d=hh(b,c,d,a,x[i+2],23,-995338651)
    a=ii(a,b,c,d,x[i],6,-198630844);    b=ii(d,a,b,c,x[i+7],10,1126891415)
    c=ii(c,d,a,b,x[i+14],15,-1416354905);d=ii(b,c,d,a,x[i+5],21,-57434055)
    a=ii(a,b,c,d,x[i+12],6,1700485571); b=ii(d,a,b,c,x[i+3],10,-1894986606)
    c=ii(c,d,a,b,x[i+10],15,-1051523);  d=ii(b,c,d,a,x[i+1],21,-2054922799)
    a=ii(a,b,c,d,x[i+8],6,1873313359);  b=ii(d,a,b,c,x[i+15],10,-30611744)
    c=ii(c,d,a,b,x[i+6],15,-1560198380);d=ii(b,c,d,a,x[i+13],21,1309151649)
    a=ii(a,b,c,d,x[i+4],6,-145523070);  b=ii(d,a,b,c,x[i+11],10,-1120210379)
    c=ii(c,d,a,b,x[i+2],15,718787259);  d=ii(b,c,d,a,x[i+9],21,-343485551)
    a=safeAdd(a,aa); b=safeAdd(b,bb); c=safeAdd(c,cc); d=safeAdd(d,dd)
  }
  const hex = (n: number) => {
    let s = ""
    for (let i = 0; i < 4; i++) s += "0123456789abcdef"[(n >> (i*8+4)) & 0xf] + "0123456789abcdef"[(n >> (i*8)) & 0xf]
    return s
  }
  return hex(a) + hex(b) + hex(c) + hex(d)
}

// ── crypto.subtle helpers ──────────────────────────────────────────────────

async function subtleHash(algo: string, data: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

async function hashText(algo: Algorithm, text: string): Promise<string> {
  if (algo === "MD5") return md5(text)
  return subtleHash(algo, new TextEncoder().encode(text).buffer)
}

async function hashBuffer(algo: Algorithm, buf: ArrayBuffer): Promise<string> {
  if (algo === "MD5") return md5(new TextDecoder().decode(buf))
  return subtleHash(algo, buf)
}

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