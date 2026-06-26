"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Copy,
  Check,
  Download,
  Clock,
  RotateCw,
  Calendar,
  ChevronDown,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getCurrentTimestamp,
  detectInputType,
  parseTimestampInput,
  getAllFormats,
  getDateInfo,
  getRelativeTime,
  calculateTimeDifference,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  getTomorrowTimestamp,
  getYesterdayTimestamp,
  getTimezoneAbbr,
  TIMEZONES,
  dateToTimestamp,
  exportToJSON,
  exportToCSV,
  exportToText,
} from "@/lib/dev-utils/timestamp-converter-utils"
import { TimestampUnit } from "@/types/dev-tools/timestamp-converter"
import { toast } from "sonner"

// ── Component ───────────────────────────────────────────────────────────────

export function UnixTimestampConverter() {
  const [inputValue, setInputValue] = useState("")
  const [selectedTimezone, setSelectedTimezone] = useState("UTC")
  const [unit, setUnit] = useState<TimestampUnit>("seconds")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(getCurrentTimestamp())
  const [dateInput, setDateInput] = useState("")
  const [timeInput, setTimeInput] = useState("00:00:00")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [timestamp1, setTimestamp1] = useState("")
  const [timestamp2, setTimestamp2] = useState("")

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimestamp())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Parse input
  const parsedTimestamp = useMemo(() => {
    if (!inputValue.trim()) return null
    const parsed = parseTimestampInput(inputValue)
    return parsed
  }, [inputValue])

  // Get formats
  const formats = useMemo(() => {
    if (parsedTimestamp === null) return null
    return getAllFormats(parsedTimestamp, selectedTimezone)
  }, [parsedTimestamp, selectedTimezone])

  // Get date info
  const dateInfo = useMemo(() => {
    if (parsedTimestamp === null) return null
    return getDateInfo(parsedTimestamp, selectedTimezone)
  }, [parsedTimestamp, selectedTimezone])

  // Get relative time
  const relativeTime = useMemo(() => {
    if (parsedTimestamp === null) return null
    return getRelativeTime(parsedTimestamp)
  }, [parsedTimestamp])

  // Handle copy
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied successfully to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Load current time
  const useCurrentTime = useCallback(() => {
    setInputValue(String(currentTime.seconds))
  }, [currentTime])

  // Checking if can calculate the time difference
  const canCalculate =
    parseTimestampInput(timestamp1) !== null &&
    parseTimestampInput(timestamp2) !== null

  // Reset
  const resetAll = () => {
    setInputValue("")
    setDateInput("")
    setTimeInput("00:00:00")
    setSelectedTimezone("UTC")
    setUnit("seconds")
  }

  // Convert from date/time
  const convertFromDateTime = useCallback(() => {
    if (!dateInput) return

    try {
      let dateStr = dateInput
      const timeStr = timeInput || "00:00:00"

      const [hours, minutes, seconds] = timeStr.split(":").map(Number)
      const dateObj = new Date(dateStr)

      dateObj.setUTCHours(hours || 0, minutes || 0, seconds || 0, 0)

      if (isNaN(dateObj.getTime())) return

      const timestamp = dateToTimestamp(dateObj)
      setInputValue(String(timestamp))
    } catch {
      // Invalid date
    }
  }, [dateInput, timeInput])

  // Quick buttons
  const quickButtons = [
    { label: "Now", action: useCurrentTime },
    {
      label: "Start of Today",
      action: () => setInputValue(String(getStartOfDay())),
    },
    {
      label: "End of Today",
      action: () => setInputValue(String(getEndOfDay())),
    },
    {
      label: "Start of Month",
      action: () => setInputValue(String(getStartOfMonth())),
    },
    {
      label: "End of Month",
      action: () => setInputValue(String(getEndOfMonth())),
    },
    {
      label: "Start of Year",
      action: () => setInputValue(String(getStartOfYear())),
    },
    {
      label: "End of Year",
      action: () => setInputValue(String(getEndOfYear())),
    },
    {
      label: "Tomorrow",
      action: () => setInputValue(String(getTomorrowTimestamp())),
    },
    {
      label: "Yesterday",
      action: () => setInputValue(String(getYesterdayTimestamp())),
    },
  ]

  // Download
  const downloadExport = (format: "json" | "csv" | "txt") => {
    if (!formats) return

    const date = new Date()
    const dateStr = date.toISOString().split("T")[0]
    let content = ""
    let filename = ""
    let mimeType = "text/plain"

    if (format === "json") {
      content = exportToJSON(parsedTimestamp!, formats)
      filename = `timestamp-${dateStr}.json`
      mimeType = "application/json"
    } else if (format === "csv") {
      content = exportToCSV(parsedTimestamp!, formats)
      filename = `timestamp-${dateStr}.csv`
      mimeType = "text/csv"
    } else {
      content = exportToText(parsedTimestamp!, formats)
      filename = `timestamp-${dateStr}.txt`
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputType = detectInputType(inputValue)

  return (
      <div>
        {/* Current Time Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Current Unix Time
              </p>
              <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white font-mono">
                {currentTime.seconds}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Updates every second
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(String(currentTime.seconds), "current")}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                copiedId === "current"
                  ? "text-green-500"
                  : "text-white/80 hover:text-white"
              )}
            >
              {copiedId === "current" ? (
                <>
                  <Check className="w-4 h-4 inline mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 inline mr-2" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-3">
                  Enter Timestamp or Date
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="1748937600 or 2025-06-03 or 2025-06-03T12:30:00Z"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
                />
                {inputValue && inputType !== "invalid" && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    ✓ Detected: {inputType === "seconds" ? "Unix Seconds" : inputType === "milliseconds" ? "Unix Milliseconds" : "ISO 8601"}
                  </p>
                )}
                {inputValue && inputType === "invalid" && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    ✗ Invalid timestamp format
                  </p>
                )}
              </div>

              {/* Unit Toggle */}
              <div className="mb-6 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={unit === "seconds"}
                    onChange={() => setUnit("seconds")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-zinc-900 dark:text-white">
                    Seconds
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={unit === "milliseconds"}
                    onChange={() => setUnit("milliseconds")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-zinc-900 dark:text-white">
                    Milliseconds
                  </span>
                </label>
              </div>

              {/* Timezone Selection */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-3">
                  Timezone
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz === "UTC" ? "UTC" : `${tz} (${getTimezoneAbbr(tz)})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={useCurrentTime}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Use Current Time
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-semibold text-sm transition-colors text-zinc-900 dark:text-white"
                >
                  <RotateCw className="w-4 h-4 inline mr-2" />
                  Reset
                </button>
              </div>

              {/* Quick Buttons */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showAdvanced && "rotate-180"
                  )}
                />
                Quick Timestamps
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  {quickButtons.map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date/Time Input */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
              <Calendar className="w-4 h-4 inline mr-2" />
              Human Date to Timestamp
            </label>

            <div className="space-y-3">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />

              <input
                type="time"
                step="1"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />

              <button
                onClick={convertFromDateTime}
                disabled={!dateInput}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Convert
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {formats && (
          <>
            {/* Format Displays */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
                Format Conversions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormatBox
                  label="Unix Seconds"
                  value={String(formats.unix.seconds)}
                  id="unix-seconds"
                  copied={copiedId === "unix-seconds"}
                  onCopy={() =>
                    copyToClipboard(String(formats.unix.seconds), "unix-seconds")
                  }
                />

                <FormatBox
                  label="Unix Milliseconds"
                  value={String(formats.unix.milliseconds)}
                  id="unix-ms"
                  copied={copiedId === "unix-ms"}
                  onCopy={() =>
                    copyToClipboard(
                      String(formats.unix.milliseconds),
                      "unix-ms"
                    )
                  }
                />

                <FormatBox
                  label="ISO 8601"
                  value={formats.iso}
                  id="iso"
                  copied={copiedId === "iso"}
                  onCopy={() => copyToClipboard(formats.iso, "iso")}
                />

                <FormatBox
                  label="RFC 2822"
                  value={formats.rfc2822}
                  id="rfc2822"
                  copied={copiedId === "rfc2822"}
                  onCopy={() => copyToClipboard(formats.rfc2822, "rfc2822")}
                />

                <FormatBox
                  label="UTC"
                  value={formats.utc}
                  id="utc"
                  copied={copiedId === "utc"}
                  onCopy={() => copyToClipboard(formats.utc, "utc")}
                />

                <FormatBox
                  label="Locale"
                  value={formats.locale}
                  id="locale"
                  copied={copiedId === "locale"}
                  onCopy={() => copyToClipboard(formats.locale, "locale")}
                />
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => downloadExport("json")}
                  className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => downloadExport("csv")}
                  className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={() => downloadExport("txt")}
                  className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  TXT
                </button>
              </div>
            </div>

            {/* Date Information */}
            {dateInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Date Info */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-4">
                    Date Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Full Date
                      </span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {dateInfo.dayOfWeek}, {dateInfo.month}/{dateInfo.date}/
                        {dateInfo.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Time
                      </span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {String(dateInfo.hours).padStart(2, "0")}:
                        {String(dateInfo.minutes).padStart(2, "0")}:
                        {String(dateInfo.seconds).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Week Number
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {dateInfo.weekNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Quarter
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        Q{dateInfo.quarter}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Day of Year
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {dateInfo.dayOfYear}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-4">
                    Flags
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center text-white font-bold text-sm",
                          dateInfo.isLeapYear
                            ? "bg-emerald-600"
                            : "bg-red-600"
                        )}
                      >
                        {dateInfo.isLeapYear ? "✓" : "✗"}
                      </span>
                      <span className="text-sm text-zinc-900 dark:text-white">
                        Leap Year: {dateInfo.isLeapYear ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center text-white font-bold text-sm",
                          dateInfo.isWeekend ? "bg-amber-600" : "bg-blue-600"
                        )}
                      >
                        {dateInfo.isWeekend ? "✓" : "✗"}
                      </span>
                      <span className="text-sm text-zinc-900 dark:text-white">
                        Weekend: {dateInfo.isWeekend ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Relative Time */}
                {relativeTime && (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">
                      Relative Time
                    </h3>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {relativeTime.text}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                      Compared to current time
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Difference Calculator */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
            Time Difference Calculator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
                type="text"
                placeholder="Timestamp 1"
                value={timestamp1}
                onChange={(e) => setTimestamp1(e.target.value)}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
            />

            <input
                type="text"
                placeholder="Timestamp 2"
                value={timestamp2}
                onChange={(e) => setTimestamp2(e.target.value)}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
            />
          </div>

        <button
        disabled={!canCalculate}
        onClick={() => {
            const t1 = parseTimestampInput(timestamp1)!
            const t2 = parseTimestampInput(timestamp2)!

            const diff = calculateTimeDifference(t1, t2)

            const resultDiv = document.getElementById("diff-result")
            if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                ${diff.text}
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-zinc-600 dark:text-zinc-400">Days:</span> <span class="font-semibold text-zinc-900 dark:text-white">${diff.days}</span></div>
                <div><span class="text-zinc-600 dark:text-zinc-400">Hours:</span> <span class="font-semibold text-zinc-900 dark:text-white">${diff.hours}</span></div>
                <div><span class="text-zinc-600 dark:text-zinc-400">Minutes:</span> <span class="font-semibold text-zinc-900 dark:text-white">${diff.minutes}</span></div>
                <div><span class="text-zinc-600 dark:text-zinc-400">Seconds:</span> <span class="font-semibold text-zinc-900 dark:text-white">${diff.seconds}</span></div>
                </div>
            `
            }
        }}
        className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all
                    bg-purple-600 hover:bg-purple-700 text-white
                    disabled:bg-zinc-300 dark:disabled:bg-zinc-800
                    disabled:text-zinc-500 disabled:cursor-not-allowed
                    disabled:hover:bg-zinc-300 dark:disabled:hover:bg-zinc-800"
        >
        Calculate Difference
        </button>
          <div id="diff-result" className="mt-6" />
        </div>
      </div>
    
  )
}

// ── Helper Components ──────────────────────────────────────────────────────

interface FormatBoxProps {
  label: string
  value: string
  id: string
  copied: boolean
  onCopy: () => void
}

function FormatBox({ label, value, id, copied, onCopy }: FormatBoxProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
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
      <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">
        {value}
      </p>
    </div>
  )
}