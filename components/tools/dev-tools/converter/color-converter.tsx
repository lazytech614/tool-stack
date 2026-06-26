"use client"

import { useState, useMemo } from "react"
import {
  Copy,
  Check,
  RotateCw,
  Eye,
  Palette,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  hexToRGB,
  rgbToHex,
  getColorInfo,
  getComplementary,
  getAnalogous,
  getTriadic,
  generatePalette,
  calculateContrastRatio,
  checkWCAGCompliance,
  getColorBlindnessSimulations,
} from "@/lib/dev-utils/color-converter-utils"
import { toast } from "sonner"
import { ColorBlindnessType } from "@/types/dev-tools/color-converter"

// ── types ──────────────────────────────────────────────────────────────────

const COLOR_BLINDNESS_LABELS: Record<ColorBlindnessType, string> = {
  normal: "Normal",
  protanopia: "Protanopia",
  deuteranopia: "Deuteranopia",
  tritanopia: "Tritanopia",
}

const EXAMPLE_COLORS = ["#9333ea", "#06b6d4", "#ec4899", "#f59e0b", "#10b981"]

// ── component ───────────────────────────────────────────────────────────────

export function ColorConverter() {
  const [color, setColor] = useState("#9333ea")
  const [opacity, setOpacity] = useState(100)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [blindnessType, setBlindnessType] = useState<ColorBlindnessType>("normal")
  const [showPalette, setShowPalette] = useState(false)
  const [showRelatedColors, setShowRelatedColors] = useState(false)
  const [showBlindness, setShowBlindness] = useState(false)
  const [showContrast, setShowContrast] = useState(false)

  // Color info with opacity
  const colorInfo = useMemo(() => {
    const rgb = hexToRGB(color)
    if (!rgb) return null

    const withAlpha = { ...rgb, a: opacity / 100 }
    const info = getColorInfo(color)
    if (!info) return null

    return {
      ...info,
      opacity,
      rgbaString: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity / 100).toFixed(2)})`,
      hexAlpha: rgbToHex(withAlpha),
    }
  }, [color, opacity])

  // Display color (with blindness simulation)
  const displayColor = useMemo(() => {
    if (blindnessType === "normal") {
      return color
    }
    const sims = getColorBlindnessSimulations(color)
    return sims[blindnessType] || color
  }, [color, blindnessType])

  // Related colors
  const related = useMemo(() => {
    return {
      complementary: getComplementary(color),
      analogous: getAnalogous(color) || [],
      triadic: getTriadic(color) || [],
    }
  }, [color])

  // Palette
  const palette = useMemo(() => {
    return generatePalette(color)
  }, [color])

  // Contrast ratios
  const contrastRatios = useMemo(() => {
    if (!colorInfo) return null
    const white = hexToRGB("#ffffff")!
    const black = hexToRGB("#000000")!
    return {
      white: calculateContrastRatio(colorInfo.rgb, white),
      black: calculateContrastRatio(colorInfo.rgb, black),
    }
  }, [colorInfo])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const loadExample = () => {
    const example = EXAMPLE_COLORS[Math.floor(Math.random() * EXAMPLE_COLORS.length)]
    setColor(example)
  }

  const resetAll = () => {
    setColor("#9333ea")
    setOpacity(100)
    setBlindnessType("normal")
  }

  const copyAllFormats = () => {
    if (!colorInfo) return
    const text = `HEX: ${colorInfo.hex}\nRGB: ${colorInfo.rgbString}\nHSL: ${colorInfo.hslString}\nHSV: ${colorInfo.hsvString}`
    copyToClipboard(text, "all-formats")
    toast.success("Copied all formats to clipboard")
  }

  if (!colorInfo) {
    return <div className="p-4 text-red-600">Invalid color</div>
  }

  return (
    <div className="w-full">

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Color Picker & Input */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 h-full">
              {/* Color Picker */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-3">
                  Pick Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-40 rounded-xl cursor-pointer border-2 border-zinc-300 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                />
              </div>

              {/* Opacity Control */}
              <div className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                    Opacity
                  </label>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={loadExample}
                  className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Sample
                </button>
                <button
                  onClick={resetAll}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-semibold text-sm transition-colors text-zinc-900 dark:text-white"
                >
                  <RotateCw className="w-4 h-4 inline mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Center: Color Formats */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 h-full">
              <div className="flex items-center justify-between mb-6">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Format Conversion
                </label>
                <button
                  onClick={copyAllFormats}
                  className="text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  {copiedId === "all-formats" ? "✓ Copied" : "Copy All"}
                </button>
              </div>

              <div className="space-y-3">
                <ColorFormatInput
                  label="HEX"
                  value={colorInfo.hex}
                  id="hex"
                  copied={copiedId === "hex"}
                  onCopy={() => {
                    copyToClipboard(colorInfo.hex, "hex")
                    toast.success("Copied HEX to clipboard")
                  }}
                />

                <ColorFormatInput
                  label="RGB"
                  value={colorInfo.rgbString}
                  id="rgb"
                  copied={copiedId === "rgb"}
                  onCopy={() => {
                    copyToClipboard(colorInfo.rgbString, "rgb")
                    toast.success("Copied RGB to clipboard")
                  }}
                />

                <ColorFormatInput
                  label="HSL"
                  value={colorInfo.hslString}
                  id="hsl"
                  copied={copiedId === "hsl"}
                  onCopy={() => {
                    copyToClipboard(colorInfo.hslString, "hsl")
                    toast.success("Copied HSL to clipboard")
                  }}
                />

                <ColorFormatInput
                  label="HSV"
                  value={colorInfo.hsvString}
                  id="hsv"
                  copied={copiedId === "hsv"}
                  onCopy={() => {
                    copyToClipboard(colorInfo.hsvString, "hsv")
                    toast.success("Copied HSV to clipboard")
                  }}
                />

                <ColorFormatInput
                  label="RGBA"
                  value={colorInfo.rgbaString}
                  id="rgba"
                  copied={copiedId === "rgba"}
                  onCopy={() => {
                    copyToClipboard(colorInfo.rgbaString, "rgba")
                    toast.success("Copied RGBA to clipboard")
                  }}
                />

                <ColorFormatInput
                  label="HEX + Alpha"
                  value={colorInfo.hexAlpha}
                  id="hex-alpha"
                  copied={copiedId === "hex-alpha"}
                  onCopy={() => {
                    copyToClipboard(colorInfo.hexAlpha, "hex-alpha")
                    toast.success("Copied HEX + Alpha to clipboard")
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Color Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 h-full flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
                Preview
              </label>

              {/* Main Preview */}
              <div
                className="w-full h-32 rounded-xl mb-4 border-2 border-zinc-200 dark:border-zinc-800 shadow-lg transition-all"
                style={{
                  backgroundColor: displayColor,
                  opacity: opacity / 100,
                }}
              />

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-1">Brightness</p>
                  <p className="font-bold text-zinc-900 dark:text-white">
                    {colorInfo.brightness}%
                  </p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-1">Tone</p>
                  <p className="font-bold text-zinc-900 dark:text-white">
                    {colorInfo.isDark ? "Dark" : "Light"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palettes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Related Colors */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <button
                onClick={() => setShowRelatedColors(!showRelatedColors)}
                className="w-full flex items-center justify-between mb-4 hover:opacity-75 transition-opacity"
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Related Colors
                </h2>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showRelatedColors && "rotate-180"
                  )}
                />
              </button>

            {showRelatedColors && (
                <div className="space-y-4">
                    {/* Complementary */}
                    {related.complementary && (
                        <div>
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                            Complementary
                        </p>
                        <div className="flex gap-2">
                            <ColorSwatchClickable
                            color={color}
                            onClick={() => setColor(color)}
                            />
                            <ColorSwatchClickable
                            color={related.complementary}
                            onClick={() => setColor(related.complementary as string)}
                            />
                        </div>
                        </div>
                    )}

                    {/* Analogous */}
                    {related.analogous.length > 0 && (
                        <div>
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                            Analogous
                        </p>
                        <div className="flex gap-2">
                            {related.analogous.map((c, i) => (
                            <ColorSwatchClickable
                                key={i}
                                color={c}
                                onClick={() => setColor(c)}
                            />
                            ))}
                        </div>
                        </div>
                    )}

                    {/* Triadic */}
                    {related.triadic.length > 0 && (
                        <div>
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                            Triadic
                        </p>
                        <div className="flex gap-2">
                            {related.triadic.map((c, i) => (
                            <ColorSwatchClickable
                                key={i}
                                color={c}
                                onClick={() => setColor(c)}
                            />
                            ))}
                        </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Color Palette */}
          {palette && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setShowPalette(!showPalette)}
                className="w-full flex items-center justify-between mb-4 hover:opacity-75 transition-opacity"
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Palette
                </h2>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showPalette && "rotate-180"
                  )}
                />
              </button>

              {showPalette && (
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(palette).map(([level, hex]) => (
                    <div
                      key={level}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full h-16 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: hex }}
                        onClick={() => setColor(hex)}
                        title={hex}
                      />
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        {level}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Color Blindness & Contrast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Blindness */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setShowBlindness(!showBlindness)}
              className="w-full flex items-center justify-between mb-4 hover:opacity-75 transition-opacity"
            >
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Accessibility
              </h2>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showBlindness && "rotate-180"
                )}
              />
            </button>

            {showBlindness && (
              <div className="grid grid-cols-2 gap-3">
                {(
                  Object.keys(
                    COLOR_BLINDNESS_LABELS
                  ) as ColorBlindnessType[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBlindnessType(type)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      blindnessType === type
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    )}
                  >
                    <div
                      className="w-full h-12 rounded mb-2"
                      style={{
                        backgroundColor: getColorBlindnessSimulations(color)[
                          type
                        ] as string,
                      }}
                    />
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {COLOR_BLINDNESS_LABELS[type]}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contrast Checker */}
          {contrastRatios && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setShowContrast(!showContrast)}
                className="w-full flex items-center justify-between mb-4 hover:opacity-75 transition-opacity"
                >
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    WCAG Contrast
                </h2>
                <ChevronDown
                    className={cn(
                    "w-4 h-4 transition-transform",
                    showContrast && "rotate-180"
                    )}
                />
                </button>

              {showContrast && (
                <div className="space-y-3">
                    <ContrastRow
                    label="White Text"
                    ratio={contrastRatios.white}
                    color={displayColor}
                    textColor="white"
                    />
                    <ContrastRow
                    label="Black Text"
                    ratio={contrastRatios.black}
                    color={displayColor}
                    textColor="black"
                    />
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  )
}

// ── Helper Components ──────────────────────────────────────────────────────

interface ColorFormatInputProps {
  label: string
  value: string
  id: string
  copied: boolean
  onCopy: () => void
}

function ColorFormatInput({
  label,
  value,
  id,
  copied,
  onCopy,
}: ColorFormatInputProps) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
        <button
          onClick={onCopy}
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
      </div>
      <p className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all">
        {value}
      </p>
    </div>
  )
}

interface ColorSwatchClickableProps {
  color: string
  onClick: () => void
}

function ColorSwatchClickable({ color, onClick }: ColorSwatchClickableProps) {
  return (
    <div
      className="flex-1 h-12 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer hover:shadow-lg transition-all hover:border-purple-400 dark:hover:border-purple-500"
      style={{ backgroundColor: color }}
      onClick={onClick}
      title={`Click to select: ${color}`}
    />
  )
}

interface ContrastRowProps {
  label: string
  ratio: number
  color: string
  textColor: string
}

function ContrastRow({ label, ratio, color, textColor }: ContrastRowProps) {
  const white = hexToRGB("#ffffff")!
  const black = hexToRGB("#000000")!
  const colorRgb = hexToRGB(color)!

  const isWhiteText = textColor === "white"
  const compliance = checkWCAGCompliance(
    isWhiteText
      ? calculateContrastRatio(colorRgb, white)
      : calculateContrastRatio(colorRgb, black)
  )

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div
        className="h-12 w-12 rounded shrink-0 flex items-center justify-center font-bold text-sm"
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        Aa
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-zinc-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {ratio.toFixed(2)}:1
        </p>
      </div>
      <div className="text-right">
        {compliance.AAA && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ✓ AAA
          </p>
        )}
        {compliance.AA && !compliance.AAA && (
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
            ✓ AA
          </p>
        )}
        {!compliance.AA && (
          <p className="text-xs font-bold text-red-600 dark:text-red-400">
            ✗ Fail
          </p>
        )}
      </div>
    </div>
  )
}