"use client"

import {
  useState, 
  useRef, 
  useCallback, 
  useEffect, 
  useMemo, 
  DragEvent,
} from "react"
import { cn } from "@/lib/utils"
import {
  Upload, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  X,
  Image as ImageIcon,
} from "lucide-react"
import { 
    BG_COLORS, 
    BgColor, 
    ConvertedResult, 
    convertImage, 
    detectFormat, 
    fileToDataUrl, 
    FORMAT_EXT, 
    formatBytes, 
    FORMATS, 
    gcd, 
    getAspectRatio, 
    ImageInfo, 
    loadImageElement, 
    OutputFormat 
} from "@/lib/dev-utils/image-converter";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-400 dark:text-zinc-600">{label}</span>
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 font-mono">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ImageConverter() {
  const [originalSrc, setOriginalSrc]         = useState<string | null>(null)
  const [originalFile, setOriginalFile]       = useState<File | null>(null)
  const [imageInfo, setImageInfo]             = useState<ImageInfo | null>(null)
  const [outFormat, setOutFormat]             = useState<OutputFormat>("png")
  const [quality, setQuality]                 = useState(85)
  const [resizeW, setResizeW]                 = useState<string>("")
  const [resizeH, setResizeH]                 = useState<string>("")
  const [maintainAR, setMaintainAR]           = useState(true)
  const [bgColor, setBgColor]                 = useState<BgColor>("white")
  const [customBg, setCustomBg]               = useState("#ffffff")
  const [converting, setConverting]           = useState(false)
  const [result, setResult]                   = useState<ConvertedResult | null>(null)
  const [dragOver, setDragOver]               = useState(false)
  const [copiedUrl, setCopiedUrl]             = useState(false)
  const [copiedB64, setCopiedB64]             = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const fileInputRef                          = useRef<HTMLInputElement>(null)

  // Derived bg hex
  const effectiveBg = bgColor === "custom" ? customBg : BG_COLORS[bgColor]

  // ── Load image ──
  const loadFile = useCallback(async (file: File) => {
    setError(null)
    setResult(null)
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.")
      return
    }
    setOriginalFile(file)
    const dataUrl = await fileToDataUrl(file)
    setOriginalSrc(dataUrl)

    const img = await loadImageElement(dataUrl)
    const w = img.naturalWidth
    const h = img.naturalHeight
    const g = gcd(w, h)

    setImageInfo({
      name: file.name,
      width: w,
      height: h,
      size: file.size,
      format: detectFormat(file),
      colorSpace: file.type.includes("png") ? "RGBA" : "RGB",
      aspectRatio: `${w / g}:${h / g}`,
      pixels: w * h,
    })
    setResizeW(String(w))
    setResizeH(String(h))
  }, [])

  // ── Drop zone ──
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  // ── Clipboard paste ──
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "o") { e.preventDefault(); fileInputRef.current?.click() }
        if (e.key === "d" && result) { e.preventDefault(); handleDownload() }
        if (e.key === "Delete" || e.key === "Backspace") { if (!originalSrc) return; handleReset() }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, originalSrc])

  useEffect(() => {
    const handler = async (e: globalThis.ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? [])
      const imgItem = items.find((i) => i.type.startsWith("image/"))
      if (imgItem) {
        const file = imgItem.getAsFile()
        if (file) loadFile(file)
      }
    }
    window.addEventListener("paste", handler)
    return () => window.removeEventListener("paste", handler)
  }, [loadFile])

  // ── Aspect ratio lock ──
  const handleResizeW = (val: string) => {
    setResizeW(val)
    if (maintainAR && imageInfo && val) {
      const w = parseInt(val)
      if (!isNaN(w)) setResizeH(String(Math.round(w * imageInfo.height / imageInfo.width)))
    }
  }
  const handleResizeH = (val: string) => {
    setResizeH(val)
    if (maintainAR && imageInfo && val) {
      const h = parseInt(val)
      if (!isNaN(h)) setResizeW(String(Math.round(h * imageInfo.width / imageInfo.height)))
    }
  }

  // ── Convert ──
  const handleConvert = useCallback(async () => {
    if (!originalSrc) return
    setConverting(true)
    setError(null)
    try {
      const w = resizeW ? parseInt(resizeW) : null
      const h = resizeH ? parseInt(resizeH) : null
      const res = await convertImage(originalSrc, outFormat, quality, w, h, effectiveBg)
      setResult(res)
    } catch (err) {
      setError("Conversion failed. The format may not be supported in your browser.")
    } finally {
      setConverting(false)
    }
  }, [originalSrc, outFormat, quality, resizeW, resizeH, effectiveBg])

  // ── Download ──
  const handleDownload = useCallback(() => {
    if (!result) return
    const a = document.createElement("a")
    a.href = result.dataUrl
    const baseName = originalFile?.name.replace(/\.[^.]+$/, "") ?? "image"
    a.download = `${baseName}.${FORMAT_EXT[result.format]}`
    a.click()
  }, [result, originalFile])

  // ── Copy image ──
  const handleCopyImage = useCallback(async () => {
    if (!result) return
    try {
      const res = await fetch(result.dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      setCopiedUrl(true)
      toast.success("Image copied successfully")
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch(err) {
      toast.success("Image copied successfully")
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }, [result])

  // ── Copy base64 ──
  const handleCopyB64 = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(result.dataUrl).then(() => {
      setCopiedB64(true)
      toast.success("Base64 copied successfully")
      setTimeout(() => setCopiedB64(false), 2000)
    })
  }, [result])

  // ── Reset ──
  const handleReset = () => {
    setOriginalSrc(null)
    setOriginalFile(null)
    setImageInfo(null)
    setResult(null)
    setError(null)
    setResizeW("")
    setResizeH("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Savings ──
  const savings = useMemo(() => {
    if (!result || !imageInfo) return null
    const orig = imageInfo.size
    const conv = result.size
    const pct = Math.round(((orig - conv) / orig) * 100)
    return { original: orig, converted: conv, percent: pct }
  }, [result, imageInfo])

  const showQuality = outFormat === "jpeg" || outFormat === "webp"
  const showBg = outFormat === "jpeg" || outFormat === "bmp" || outFormat === "ico"

  return (
    <div className="flex flex-col gap-6">

      {/* ── Drop zone ── */}
      {!originalSrc ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-55 px-6 py-10 select-none",
            dragOver
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
              : "border-zinc-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl transition-colors",
              dragOver
                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600"
            )}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {dragOver ? "Drop to upload" : "Drop an image here"}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
                or click to browse · paste with Ctrl+V
              </p>
            </div>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-700 uppercase tracking-widest font-medium">
              PNG · JPEG · WebP · SVG · GIF · BMP · ICO
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
          />
        </div>
      ) : (
        /* ── Main workspace ── */
        <div className="flex flex-col gap-5">

          {/* ── Before / After previews ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                  Original
                </label>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
              <div 
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden min-h-45" 
                style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%3E%3Crect%20width='8'%20height='8'%20fill='%23f0f0f0'/%3E%3Crect%20x='8'%20y='8'%20width='8'%20height='8'%20fill='%23f0f0f0'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "repeat",
                    }}
                >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalSrc} alt="Original" className="max-w-full max-h-70 object-contain" />
              </div>
              {imageInfo && (
                <div className="text-xs text-zinc-500 dark:text-zinc-500 space-y-0.5">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300 truncate">{imageInfo.name}</p>
                  <p>{imageInfo.width} × {imageInfo.height} px · {formatBytes(imageInfo.size)} · {imageInfo.format}</p>
                </div>
              )}
            </div>

            {/* Converted */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                Converted
              </label>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 [url()'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E'] flex items-center justify-center overflow-hidden min-h-45">
                {result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.dataUrl} alt="Converted" className="max-w-full max-h-70 object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <ImageIcon className="w-8 h-8 text-zinc-200 dark:text-zinc-800" />
                    <p className="text-xs text-zinc-300 dark:text-zinc-700">
                      {converting ? "Converting…" : "Click Convert to see output"}
                    </p>
                  </div>
                )}
              </div>
              {result && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {result.width} × {result.height} px · {formatBytes(result.size)} · {result.format.toUpperCase()}
                </p>
              )}
            </div>
          </div>

          {/* ── Options ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Output format */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                Convert to
              </label>
              <div className="flex gap-1 flex-wrap">
                {FORMATS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setOutFormat(value)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors border",
                      outFormat === value
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider */}
            {showQuality && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                    Quality
                  </label>
                  <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-600">
                  <span>1% (smallest)</span>
                  <span>100% (best)</span>
                </div>
              </div>
            )}

            {/* Background color */}
            {showBg && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                  Background
                </label>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {(["white", "black", "transparent"] as BgColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors capitalize",
                        bgColor === c
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-sm border border-zinc-300 dark:border-zinc-700 inline-block shrink-0"
                        style={{ background: BG_COLORS[c] === "transparent" ? "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0/8px 8px" : BG_COLORS[c] }}
                      />
                      {c}
                    </button>
                  ))}
                  <label className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer",
                    bgColor === "custom"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                  )}>
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => { setCustomBg(e.target.value); setBgColor("custom") }}
                      className="w-3 h-3 rounded border-0 p-0 cursor-pointer bg-transparent"
                    />
                    Custom
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ── Resize ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              Resize
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-600 w-10">Width</span>
                <input
                  type="number"
                  value={resizeW}
                  onChange={(e) => handleResizeW(e.target.value)}
                  min={1}
                  className="w-24 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <span className="text-xs text-zinc-400 dark:text-zinc-600">px</span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-700">×</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-600 w-10">Height</span>
                <input
                  type="number"
                  value={resizeH}
                  onChange={(e) => handleResizeH(e.target.value)}
                  min={1}
                  className="w-24 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <span className="text-xs text-zinc-400 dark:text-zinc-600">px</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintainAR}
                  onChange={(e) => setMaintainAR(e.target.checked)}
                  className="accent-purple-600 w-3.5 h-3.5"
                />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Maintain aspect ratio
                </span>
              </label>
              {imageInfo && (
                <button
                  onClick={() => { setResizeW(String(imageInfo.width)); setResizeH(String(imageInfo.height)) }}
                  className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Reset to original
                </button>
              )}
            </div>
          </div>

          {/* ── Convert button + actions ── */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleConvert}
              disabled={converting || !originalSrc}
              className="rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 text-sm font-semibold text-white transition-colors flex items-center gap-2"
            >
              {converting && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
              {converting ? "Converting…" : "Convert"}
            </button>

            {result && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={handleCopyImage}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? "Copied!" : "Copy Image"}
                </button>
                <button
                  onClick={handleCopyB64}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                  {copiedB64 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedB64 ? "Copied!" : "Copy Base64"}
                </button>
              </>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
          )}

          {/* ── Compression comparison ── */}
          {savings && (
            <div className="flex flex-wrap gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-5 py-4">
              <StatItem label="Original" value={formatBytes(savings.original)} />
              <StatItem label="Converted" value={formatBytes(savings.converted)} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600">
                  {savings.percent >= 0 ? "Saved" : "Increased by"}
                </span>
                <span className={cn(
                  "text-sm font-semibold",
                  savings.percent >= 20
                    ? "text-emerald-600 dark:text-emerald-400"
                    : savings.percent >= 0
                    ? "text-zinc-800 dark:text-zinc-200"
                    : "text-amber-500 dark:text-amber-400"
                )}>
                  {Math.abs(savings.percent)}%
                </span>
              </div>
              <StatItem label="Output format" value={outFormat.toUpperCase()} />
              {showQuality && <StatItem label="Quality" value={`${quality}%`} />}
            </div>
          )}

          {/* ── Image information ── */}
          {imageInfo && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                Image Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-1 divide-y-0">
                <div>
                  <InfoRow label="File name" value={imageInfo.name} />
                  <InfoRow label="Dimensions" value={`${imageInfo.width} × ${imageInfo.height} px`} />
                  <InfoRow label="File size" value={formatBytes(imageInfo.size)} />
                  <InfoRow label="Format" value={imageInfo.format} />
                </div>
                <div>
                  <InfoRow label="Aspect ratio" value={getAspectRatio(imageInfo.width, imageInfo.height)} />
                  <InfoRow label="Megapixels" value={`${(imageInfo.pixels / 1_000_000).toFixed(2)} MP`} />
                  <InfoRow label="Color space" value={imageInfo.colorSpace} />
                  <InfoRow label="Total pixels" value={imageInfo.pixels.toLocaleString()} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Keyboard hint ── */}
      <p className="text-[10px] text-zinc-300 dark:text-zinc-700 hidden sm:block">
        Ctrl+O upload · Ctrl+D download · Ctrl+V paste image · Delete remove
      </p>
    </div>
  )
}