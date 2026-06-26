"use client"

import { useMemo, useState } from "react"
import { Copy, Check, RotateCw, Info, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { SAMPLE_BINARY, SAMPLE_TEXT } from "@/constants/examples"
import { toast } from "sonner"
import { ConversionMode } from "@/types/dev-tools/binary-converter"

// ── types ──────────────────────────────────────────────────────────────────

interface ConversionResult {
  input: string
  output: string
  error?: string
  details?: {
    bytes: number
    bits: number
    characterCount?: number
  }
}

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Convert text to binary representation
 * Each character is converted to its 8-bit binary representation
 */
function textToBinary(text: string): ConversionResult {
  try {
    if (!text) {
      return { input: text, output: "", details: { bytes: 0, bits: 0, characterCount: 0 } }
    }

    const binaryArray = Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0)
        return code.toString(2).padStart(8, "0")
      })
      .join(" ")

    return {
      input: text,
      output: binaryArray,
      details: {
        bytes: text.length,
        bits: text.length * 8,
        characterCount: text.length,
      },
    }
  } catch (e) {
    return {
      input: text,
      output: "",
      error: e instanceof Error ? e.message : "Conversion failed",
    }
  }
}

/**
 * Convert binary string to text
 * Accepts binary with or without spaces between bytes
 */
function binaryToText(binaryString: string): ConversionResult {
  try {
    if (!binaryString.trim()) {
      return { input: binaryString, output: "", details: { bytes: 0, bits: 0 } }
    }

    // Remove extra whitespace and split
    const binaryArray = binaryString
      .trim()
      .split(/\s+/)
      .filter((b) => b.length > 0)

    // Validate all parts are binary
    for (const binary of binaryArray) {
      if (!/^[01]+$/.test(binary)) {
        return {
          input: binaryString,
          output: "",
          error: `Invalid binary: "${binary}" contains non-binary characters (0 and 1 only)`,
        }
      }

      if (binary.length > 16) {
        return {
          input: binaryString,
          output: "",
          error: `Invalid binary: "${binary}" is ${binary.length} bits (max 16 for Unicode)`,
        }
      }
    }

    // Convert each binary to character
    const textArray = binaryArray.map((binary) => {
      const code = parseInt(binary, 2)

      // Check if valid Unicode
      if (code > 0x10ffff) {
        throw new Error(`Invalid Unicode code point: ${code}`)
      }

      // Handle special characters
      if (code === 0) {
        return "NULL"
      }

      try {
        return String.fromCharCode(code)
      } catch {
        return `[U+${code.toString(16).toUpperCase().padStart(4, "0")}]`
      }
    })

    const text = textArray.join("")
    const totalBits = binaryArray.reduce((sum, b) => sum + b.length, 0)
    const byteCount = binaryArray.length

    return {
      input: binaryString,
      output: text,
      details: {
        bytes: byteCount,
        bits: totalBits,
        characterCount: textArray.length,
      },
    }
  } catch (e) {
    return {
      input: binaryString,
      output: "",
      error: e instanceof Error ? e.message : "Invalid binary string",
    }
  }
}

// ── component ───────────────────────────────────────────────────────────────

export function BinaryConverter() {
  const [mode, setMode] = useState<ConversionMode>("encode")
  const [input, setInput] = useState(SAMPLE_TEXT)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Convert based on mode
  const result = useMemo(() => {
    if (mode === "encode") {
      return textToBinary(input)
    } else {
      return binaryToText(input)
    }
  }, [input, mode])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success("Copied succcessfully to clipboard")
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const resetForm = () => {
    setInput(mode === "decode" ? SAMPLE_BINARY : SAMPLE_TEXT)
    setCopiedIndex(null)
  }

  const hasInput = input.trim().length > 0
  const hasError = !!result.error

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Binary Converter
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Convert text to binary and binary back to text instantly
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setMode("encode")
            setInput(SAMPLE_TEXT)
            setCopiedIndex(null)
          }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
            mode === "encode"
              ? "bg-purple-600 dark:bg-purple-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          )}
        >
          Text → Binary
        </button>
        <button
          onClick={() => {
            setMode("decode")
            setInput(SAMPLE_BINARY)
            setCopiedIndex(null)
          }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
            mode === "decode"
              ? "bg-purple-600 dark:bg-purple-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          )}
        >
          Binary → Text
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
        {/* Input Section */}
        <div className="flex flex-col gap-2 w-full lg:w-1/2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                    {mode === "encode" ? "Text Input" : "Binary Input"}
                </label>
                <div className="flex items-center gap-2">
                    <button
                    onClick={resetForm}
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                    <RefreshCcw className="w-3 h-3" />
                    Reset
                    </button>
                </div>
            </div>

            <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
                mode === "encode"
                ? "Enter text to convert to binary..."
                : "Enter binary (with or without spaces)...\nExample: 01001000 01100101 01101100 01101100 01101111"
            }
            rows={5}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500/60 resize-y transition-colors"
            spellCheck={false}
            />

            {/* Info Box */}
            <div className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
                {mode === "encode"
                ? "Each character is converted to its 8-bit binary representation"
                : "Separate binary groups with spaces or newlines. Supports 8-16 bit binaries"}
            </p>
            </div>
        </div>

        {/* Quick Reference */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2">
            <h3 className="text-xs uppercase font-semibold text-blue-900 dark:text-blue-400">
            Quick Reference
            </h3>
            <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-4">
                <div className="grid grid-cols-2 gap-4 text-xs text-blue-800 dark:text-blue-300">
                <div>
                    <p className="font-mono font-semibold mb-1">Common Characters:</p>
                    <ul className="space-y-1 font-mono text-xs">
                    <li>A: 01000001</li>
                    <li>a: 01100001</li>
                    <li>0: 00110000</li>
                    <li>Space: 00100000</li>
                    </ul>
                </div>
                <div>
                    <p className="font-mono font-semibold mb-1">Binary Info:</p>
                    <ul className="space-y-1 text-xs">
                    <li>8-bit = 1 byte (0-255)</li>
                    <li>16-bit = Extended (0-65535)</li>
                    <li>Padded with leading zeros</li>
                    <li>Space-separated for clarity</li>
                    </ul>
                </div>
                </div>
            </div>
        </div>
      </div>

      {/* Output Section */}
      {hasInput && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              {mode === "encode" ? "Binary Output" : "Text Output"}
            </label>
            <button
              onClick={() => copyToClipboard(result.output, 0)}
              className="text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              {copiedIndex === 0 ? (
                <>
                  <Check className="w-3 h-3" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>

          {/* Error State */}
          {hasError && (
            <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                Error
              </p>
              <p className="text-xs font-mono text-red-600 dark:text-red-400">
                {result.error}
              </p>
            </div>
          )}

          {/* Output */}
          {!hasError && result.output && (
            <>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-sm wrap-break-words whitespace-pre-wrap">
                {result.output}
              </div>

              {/* Statistics */}
              {result.details && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      Characters
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {result.details.characterCount ?? result.details.bytes}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      Bytes
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {result.details.bytes}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      Bits
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {result.details.bits}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!hasError && !result.output && (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-8 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "encode"
                  ? "Enter text to see binary output"
                  : "Enter binary to see text output"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Character Map */}
      {hasInput && mode === "encode" && !hasError && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Character Breakdown
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {input.split("").map((char, i) => {
              const code = char.charCodeAt(0)
              const binary = code.toString(2).padStart(8, "0")
              const display = char === " " ? "SPACE" : char === "\n" ? "NEWLINE" : char

              return (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60"
                >
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {display}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Code: {code}
                  </span>
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-900 dark:text-zinc-100">
                    {binary}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}