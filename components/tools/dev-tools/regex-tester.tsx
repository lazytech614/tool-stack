"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Copy, Check, RotateCw, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ── types ──────────────────────────────────────────────────────────────────

type Flag = "g" | "i" | "m" | "s"

interface Match {
  value: string
  index: number
  groups: string[]
}

interface RegexTemplate {
  id: string
  name: string
  description: string
  pattern: string
  flags: Flag[]
  category: string
  example: string
}

// ── regex templates ────────────────────────────────────────────────────────

const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    id: "email",
    name: "Email Address",
    description: "Matches standard email format",
    pattern: "([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})",
    flags: ["g"],
    category: "Validation",
    example: "Contact: hello@example.com or support@company.org",
  },
  {
    id: "url",
    name: "URL",
    description: "Matches HTTP/HTTPS URLs",
    pattern: "https?:\\/\\/[^\\s<>\"{}|\\\\^`\\[\\]]*",
    flags: ["g"],
    category: "Validation",
    example: "Visit https://example.com and https://docs.example.com/path",
  },
  {
    id: "phone",
    name: "Phone Number (US)",
    description: "Matches US phone numbers in various formats",
    pattern: "\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})",
    flags: ["g"],
    category: "Validation",
    example: "Call (555) 123-4567 or 555.123.4567 or 555-123-4567",
  },
  {
    id: "ipv4",
    name: "IPv4 Address",
    description: "Matches IPv4 addresses",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: ["g"],
    category: "Validation",
    example: "Server at 192.168.1.1 and backup at 10.0.0.255",
  },
  {
    id: "hex-color",
    name: "Hex Color Code",
    description: "Matches hex color codes (#RGB or #RRGGBB)",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: ["g"],
    category: "Validation",
    example: "Colors: #fff, #ffffff, #a3c2ff in the palette",
  },
  {
    id: "date-iso",
    name: "ISO Date (YYYY-MM-DD)",
    description: "Matches ISO format dates",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    flags: ["g"],
    category: "Date/Time",
    example: "Created: 2024-01-15, Updated: 2024-12-25",
  },
  {
    id: "date-us",
    name: "US Date (MM/DD/YYYY)",
    description: "Matches US format dates",
    pattern: "(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])\\/(20\\d{2})",
    flags: ["g"],
    category: "Date/Time",
    example: "Due: 03/15/2024 or 12/31/2023",
  },
  {
    id: "time-24h",
    name: "Time (24-hour)",
    description: "Matches 24-hour format times",
    pattern: "([01]\\d|2[0-3]):([0-5]\\d)(?::([0-5]\\d))?",
    flags: ["g"],
    category: "Date/Time",
    example: "Schedule: 09:30, 14:45:00, 23:59",
  },
  {
    id: "hashtag",
    name: "Hashtag",
    description: "Matches social media hashtags",
    pattern: "#[a-zA-Z0-9_]+\\b",
    flags: ["g"],
    category: "Text Parsing",
    example: "Check #javascript #react and #webdev for more",
  },
  {
    id: "mention",
    name: "Mention (@username)",
    description: "Matches social media mentions",
    pattern: "@[a-zA-Z0-9_]+\\b",
    flags: ["g"],
    category: "Text Parsing",
    example: "Shoutout to @alice @bob_dev and @charlie",
  },
  {
    id: "url-slug",
    name: "URL Slug",
    description: "Extracts/validates URL-friendly slugs",
    pattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
    flags: ["g"],
    category: "Text Parsing",
    example: "Posts: hello-world, my-awesome-article, test-123",
  },
  {
    id: "camelcase",
    name: "camelCase Words",
    description: "Matches camelCase identifiers",
    pattern: "[a-z][a-zA-Z0-9]*(?=[A-Z]|_|[^a-zA-Z0-9]|$)|[A-Z][a-z0-9]*",
    flags: ["g"],
    category: "Code",
    example: "Variables: firstName, lastName, isActive, getUserData",
  },
  {
    id: "snake-case",
    name: "snake_case Words",
    description: "Matches snake_case identifiers",
    pattern: "[a-z_][a-z0-9_]*\\b",
    flags: ["g", "i"],
    category: "Code",
    example: "Constants: FIRST_NAME, user_id, get_data_sync",
  },
  {
    id: "css-class",
    name: "CSS Class Names",
    description: "Matches CSS class selectors",
    pattern: "\\.[a-zA-Z_-][a-zA-Z0-9_-]*",
    flags: ["g"],
    category: "Code",
    example: "Styles: .button-primary, .card-lg, .text-center",
  },
  {
    id: "markdown-link",
    name: "Markdown Links",
    description: "Matches markdown link syntax",
    pattern: "\\[([^\\]]+)\\]\\(([^)]+)\\)",
    flags: ["g"],
    category: "Markdown",
    example: "Read [my post](https://example.com) and [docs](./readme.md)",
  },
  {
    id: "markdown-heading",
    name: "Markdown Headings",
    description: "Matches markdown heading syntax",
    pattern: "^(#+)\\s+(.+)$",
    flags: ["g", "m"],
    category: "Markdown",
    example: "# Main Title\n## Section\n### Subsection",
  },
  {
    id: "whitespace",
    name: "Whitespace & Line Breaks",
    description: "Matches tabs, spaces, and newlines",
    pattern: "\\s+",
    flags: ["g"],
    category: "Text Parsing",
    example: "Multiple   spaces  and\n\nnewlines here",
  },
  {
    id: "word-boundary",
    name: "Words (word boundaries)",
    description: "Matches complete words only",
    pattern: "\\b\\w+\\b",
    flags: ["g"],
    category: "Text Parsing",
    example: "Extract words from this sentence carefully",
  },
  {
    id: "number",
    name: "Numbers (Integer & Decimal)",
    description: "Matches integers and decimal numbers",
    pattern: "-?\\d+(?:\\.\\d+)?",
    flags: ["g"],
    category: "Numbers",
    example: "Values: 42, -17, 3.14, -0.5, 1000",
  },
  {
    id: "csv-parser",
    name: "CSV Parser",
    description: "Matches CSV field values (handles quoted fields)",
    pattern: '(?:[^,"]|"[^"]*")+',
    flags: ["g"],
    category: "Text Parsing",
    example: 'John,Doe,"New York, NY",john@example.com',
  },
]

// ── helpers ────────────────────────────────────────────────────────────────

function buildRegex(pattern: string, flags: Set<Flag>): { regex: RegExp; error?: never } | { regex?: never; error: string } {
  try {
    return { regex: new RegExp(pattern, [...flags].join("")) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid regex." }
  }
}

function getMatches(regex: RegExp, input: string): Match[] {
  const matches: Match[] = []
  if (!regex.global) {
    const m = regex.exec(input)
    if (m) matches.push({ value: m[0], index: m.index, groups: m.slice(1) })
    return matches
  }
  let m: RegExpExecArray | null
  let safety = 0
  while ((m = regex.exec(input)) !== null && safety++ < 500) {
    matches.push({ value: m[0], index: m.index, groups: m.slice(1) })
    if (m[0].length === 0) regex.lastIndex++
  }
  return matches
}

function getSegments(input: string, matches: Match[]): { text: string; isMatch: boolean }[] {
  if (!matches.length) return [{ text: input, isMatch: false }]
  const segments: { text: string; isMatch: boolean }[] = []
  let cursor = 0
  for (const m of matches) {
    if (m.index > cursor) segments.push({ text: input.slice(cursor, m.index), isMatch: false })
    segments.push({ text: m.value, isMatch: true })
    cursor = m.index + m.value.length
  }
  if (cursor < input.length) segments.push({ text: input.slice(cursor), isMatch: false })
  return segments
}

// ── component ───────────────────────────────────────────────────────────────

export function RegexTesterTool() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]))
  const [input, setInput] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [showReplace, setShowReplace] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true)
  const [searchTemplate, setSearchTemplate] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  function toggleFlag(flag: Flag) {
    setFlags((prev) => {
      const next = new Set(prev)
      next.has(flag) ? next.delete(flag) : next.add(flag)
      return next
    })
  }

  function loadTemplate(template: RegexTemplate) {
    setPattern(template.pattern)
    setFlags(new Set(template.flags as Flag[]))
    setInput(template.example)
    setShowTemplates(false)
  }

  function resetForm() {
    setPattern("")
    setFlags(new Set(["g"]))
    setInput("")
    setReplaceText("")
  }

  const { regex, error } = useMemo(
    () => (pattern ? buildRegex(pattern, flags) : { regex: undefined, error: undefined }),
    [pattern, flags]
  )

  const matches = useMemo(
    () => (regex && input ? getMatches(regex, input) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pattern, flags, input]
  )

  const segments = useMemo(
    () => getSegments(input, matches),
    [input, matches]
  )

  const replacedText = useMemo(() => {
    if (!regex || !input || !showReplace) return null
    try {
      return input.replace(regex, replaceText)
    } catch {
      return null
    }
  }, [regex, input, replaceText, showReplace])

  const filteredTemplates = useMemo(() => {
    return REGEX_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTemplate.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTemplate.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTemplate.toLowerCase())
    )
  }, [searchTemplate])

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, RegexTemplate[]> = {}
    filteredTemplates.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  }, [filteredTemplates])

  const hasPattern = pattern.trim().length > 0
  const hasInput = input.trim().length > 0

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Pattern Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            Pattern
          </label>
          <button
            onClick={resetForm}
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            <RotateCw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="flex items-stretch rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-400 dark:focus-within:border-purple-500/60 transition-colors bg-zinc-50 dark:bg-zinc-900">
          <span className="flex items-center pl-4 pr-1 font-mono text-sm text-zinc-400 dark:text-zinc-600 select-none">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="(\\w+)@(\\w+\\.\\w+)"
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 py-3 px-2 font-mono text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
            spellCheck={false}
          />
          <span className="flex items-center pr-1 font-mono text-sm text-zinc-400 dark:text-zinc-600 select-none">
            /
          </span>

          {/* Flags */}
          <div className="flex items-center gap-0.5 px-2 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            {(["g", "i", "m", "s"] as const).map((flag) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                title={`Flag: ${flag}`}
                className={cn(
                  "w-6 h-6 rounded font-mono text-xs font-semibold transition-colors",
                  flags.has(flag)
                    ? "bg-purple-600 dark:bg-purple-500 text-white"
                    : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs font-mono text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Template Library */}
      {showTemplates && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-linear-to-br from-purple-50 to-blue-50 dark:from-zinc-900/50 dark:to-zinc-900/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Regex Templates
            </h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-xs text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Hide
            </button>
          </div>

          <input
            type="text"
            placeholder="Search templates..."
            value={searchTemplate}
            onChange={(e) => setSearchTemplate(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category} className="col-span-full">
                <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => loadTemplate(t)}
                      className="text-left p-3 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                        {t.name}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {t.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center py-4">
              No templates found
            </p>
          )}
        </div>
      )}

      {!showTemplates && (
        <button
          onClick={() => setShowTemplates(true)}
          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          <ChevronDown className="w-3 h-3" />
          Show templates
        </button>
      )}

      {/* Test String */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
          Test String
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to test your pattern against..."
          rows={5}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500/60 resize-y transition-colors"
          spellCheck={false}
        />
      </div>

      {/* Replace Mode Toggle */}
      {hasPattern && hasInput && !error && (
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-2"
        >
          <ChevronDown className={cn("w-4 h-4 transition-transform", showReplace && "rotate-180")} />
          Replace (Test Replacement)
        </button>
      )}

      {/* Replace Input */}
      {showReplace && hasPattern && hasInput && !error && (
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
          <label className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Replacement Text
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Use $1, $2, etc. for capture groups"
            className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-zinc-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          {replacedText && (
            <div className="mt-3 p-3 rounded-lg bg-white dark:bg-zinc-900/60 border border-emerald-300 dark:border-emerald-600">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                Preview
              </p>
              <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-all">
                {replacedText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {hasPattern && hasInput && !error && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              Matches
            </label>
            <span
              className={cn(
                "text-xs font-medium tabular-nums px-2 py-1 rounded-full",
                matches.length > 0
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}
            >
              {matches.length} {matches.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {/* Highlighted text */}
          {matches.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
              {segments.map((seg, i) =>
                seg.isMatch ? (
                  <mark
                    key={i}
                    className="bg-yellow-200 dark:bg-yellow-400/30 text-yellow-900 dark:text-yellow-200 rounded px-0.5 font-semibold"
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i} className="text-zinc-700 dark:text-zinc-300">
                    {seg.text}
                  </span>
                )
              )}
            </div>
          )}

          {matches.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                No matches found
              </p>
            </div>
          )}

          {/* Match Details */}
          {matches.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="grid gap-2">
                {matches.map((m, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 tabular-nums w-6">
                        #{i + 1}
                      </span>
                      <code className="text-xs font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-0.5 break-all">
                        {m.value || <em className="text-zinc-400">empty</em>}
                      </code>
                      <span className="text-xs text-zinc-400 dark:text-zinc-600 tabular-nums ml-auto">
                        index {m.index}
                      </span>
                      <button
                        onClick={() => copyToClipboard(m.value, i)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        title="Copy match"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400" />
                        )}
                      </button>
                    </div>

                    {m.groups.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-9">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              ${gi + 1}
                            </span>
                            <code className="font-mono text-zinc-900 dark:text-zinc-100">
                              {g ?? <em className="text-zinc-400">undefined</em>}
                            </code>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}