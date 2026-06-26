"use client"

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react"
import { cn } from "@/lib/utils"
import {
  Copy, Check, Download, RefreshCw, Plus, Minus,
  AlignLeft, AlignCenter, AlignRight, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, MoreHorizontal,
} from "lucide-react"
import { ActiveTab, Alignment, ExportFormat } from "@/types/dev-tools/markdown-table"
import { SAMPLE_MARKDOWN_TABLE } from "@/constants/examples"
import { toast } from "sonner"
import { exportAs, generateMarkdown, makeEmptyTable, parseMarkdown, renderTableHTML } from "@/lib/dev-utils/markdown-table"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TableState {
  headers: string[]
  alignments: Alignment[]
  rows: string[][]
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT_COLS = 2
const DEFAULT_ROWS = 3

// ---------------------------------------------------------------------------
// Alignment icon button
// ---------------------------------------------------------------------------
function AlignBtn({ align, active, onClick }: { align: Alignment; active: boolean; onClick: () => void }) {
  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight
  return (
    <button
      onClick={onClick}
      title={`Align ${align}`}
      className={cn(
        "p-1 rounded transition-colors",
        active
          ? "bg-purple-600 text-white"
          : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      <Icon className="w-3 h-3" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function MarkdownTable() {
  const [table, setTable] = useState<TableState>(makeEmptyTable(DEFAULT_COLS, DEFAULT_ROWS))
  const [padding, setPadding] = useState(true)
  const [pretty, setPretty] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor")
  const [exportFormat, setExportFormat] = useState<ExportFormat>("markdown")
  const [markdownInput, setMarkdownInput] = useState("")
  const [importError, setImportError] = useState("")
  const cellRefs = useRef<(HTMLInputElement | null)[][]>([])

  const markdown = useMemo(
    () => generateMarkdown(table, padding, pretty),
    [table, padding, pretty]
  )

  const previewHTML = useMemo(() => renderTableHTML(table), [table])

  // ── Cell focus helper ──
  const focusCell = useCallback((row: number, col: number) => {
    cellRefs.current[row]?.[col]?.focus()
  }, [])

  // ── Update header ──
  const updateHeader = (ci: number, val: string) => {
    setTable((t) => {
      const headers = [...t.headers]
      headers[ci] = val
      return { ...t, headers }
    })
  }

  // ── Update cell ──
  const updateCell = (ri: number, ci: number, val: string) => {
    setTable((t) => {
      const rows = t.rows.map((r) => [...r])
      rows[ri][ci] = val
      return { ...t, rows }
    })
  }

  // ── Update alignment ──
  const setAlignment = (ci: number, align: Alignment) => {
    setTable((t) => {
      const alignments = [...t.alignments]
      alignments[ci] = align
      return { ...t, alignments }
    })
  }

  // ── Add / remove rows ──
  const addRow = (afterIndex?: number) => {
    setTable((t) => {
      const newRow = Array(t.headers.length).fill("")
      const rows = [...t.rows]
      const idx = afterIndex !== undefined ? afterIndex + 1 : rows.length
      rows.splice(idx, 0, newRow)
      return { ...t, rows }
    })
  }

  const removeRow = (ri: number) => {
    setTable((t) => {
      if (t.rows.length <= 1) return t
      const rows = t.rows.filter((_, i) => i !== ri)
      return { ...t, rows }
    })
  }

  const moveRow = (ri: number, dir: -1 | 1) => {
    setTable((t) => {
      const rows = [...t.rows]
      const ni = ri + dir
      if (ni < 0 || ni >= rows.length) return t
      ;[rows[ri], rows[ni]] = [rows[ni], rows[ri]]
      return { ...t, rows }
    })
  }

  const duplicateRow = (ri: number) => {
    setTable((t) => {
      const rows = [...t.rows]
      rows.splice(ri + 1, 0, [...rows[ri]])
      return { ...t, rows }
    })
  }

  // ── Add / remove columns ──
  const addCol = (afterIndex?: number) => {
    setTable((t) => {
      const idx = afterIndex !== undefined ? afterIndex + 1 : t.headers.length
      const headers = [...t.headers]
      const alignments = [...t.alignments]
      headers.splice(idx, 0, `Column ${t.headers.length + 1}`)
      alignments.splice(idx, 0, "left")
      const rows = t.rows.map((r) => {
        const nr = [...r]
        nr.splice(idx, 0, "")
        return nr
      })
      return { headers, alignments, rows }
    })
  }

  const removeCol = (ci: number) => {
    setTable((t) => {
      if (t.headers.length <= 1) return t
      return {
        headers: t.headers.filter((_, i) => i !== ci),
        alignments: t.alignments.filter((_, i) => i !== ci),
        rows: t.rows.map((r) => r.filter((_, i) => i !== ci)),
      }
    })
  }

  const moveCol = (ci: number, dir: -1 | 1) => {
    setTable((t) => {
      const ni = ci + dir
      if (ni < 0 || ni >= t.headers.length) return t
      const swap = <T,>(arr: T[]) => {
        const a = [...arr]
        ;[a[ci], a[ni]] = [a[ni], a[ci]]
        return a
      }
      return {
        headers: swap(t.headers),
        alignments: swap(t.alignments),
        rows: t.rows.map(swap),
      }
    })
  }

  // ── Keyboard nav ──
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, ri: number, ci: number) => {
    const cols = table.headers.length
    const rows = table.rows.length

    if (e.key === "Tab") {
      e.preventDefault()
      if (e.shiftKey) {
        if (ci > 0) focusCell(ri, ci - 1)
        else if (ri > 0) focusCell(ri - 1, cols - 1)
      } else {
        if (ci < cols - 1) focusCell(ri, ci + 1)
        else if (ri < rows - 1) focusCell(ri + 1, 0)
        else {
          addRow()
          setTimeout(() => focusCell(ri + 1, 0), 0)
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (ri < rows - 1) focusCell(ri + 1, ci)
      else {
        addRow()
        setTimeout(() => focusCell(ri + 1, ci), 0)
      }
    } else if (e.key === "ArrowUp" && ri > 0) {
      e.preventDefault()
      focusCell(ri - 1, ci)
    } else if (e.key === "ArrowDown" && ri < rows - 1) {
      e.preventDefault()
      focusCell(ri + 1, ci)
    }
  }

  // ── Paste CSV / TSV ──
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, startRow: number, startCol: number) => {
    const text = e.clipboardData.getData("text")
    const isTabular = text.includes("\t") || (text.includes("\n") && text.includes(","))
    if (!isTabular) return

    e.preventDefault()
    const delimiter = text.includes("\t") ? "\t" : ","
    const pasteRows = text.trim().split("\n").map((r) => r.split(delimiter).map((c) => c.trim()))

    setTable((t) => {
      const rows = t.rows.map((r) => [...r])
      pasteRows.forEach((pr, dri) => {
        const ri = startRow + dri
        if (ri >= rows.length) rows.push(Array(t.headers.length).fill(""))
        pr.forEach((val, dci) => {
          const ci = startCol + dci
          if (ci < t.headers.length) rows[ri][ci] = val
        })
      })
      return { ...t, rows }
    })
  }

  // ── Import CSV ──
  const importCSV = (text: string) => {
    const delimiter = text.includes("\t") ? "\t" : ","
    const lines = text.trim().split("\n")
    if (lines.length < 1) return
    const headers = lines[0].split(delimiter).map((c) => c.trim())
    const rows = lines.slice(1).map((l) => l.split(delimiter).map((c) => c.trim()))
    const alignments: Alignment[] = Array(headers.length).fill("left")
    setTable({ headers, alignments, rows })
  }

  // ── Import Markdown ──
  const importMarkdownTable = () => {
    const result = parseMarkdown(markdownInput)
    if (!result) {
      setImportError("Couldn't parse that as a Markdown table. Check the format and try again.")
      return
    }
    setImportError("")
    setMarkdownInput("")
    setTable(result)
    setActiveTab("editor")
  }

  // ── Copy ──
  const handleCopy = () => {
    const text = exportAs(table, exportFormat, padding, pretty)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success("Copied successfully to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Download ──
  const handleDownload = () => {
    const ext = exportFormat === "markdown" ? "md" : exportFormat
    const text = exportAs(table, exportFormat, padding, pretty)
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `table.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Clear ──
  const handleClear = () => {
    setTable(makeEmptyTable(DEFAULT_COLS, DEFAULT_ROWS))
    setMarkdownInput("")
    setImportError("")
  }

  // ── Example ──
  const handleExample = () => setTable(SAMPLE_MARKDOWN_TABLE)

  // ── Sync cellRefs dimensions ──
  useEffect(() => {
    cellRefs.current = table.rows.map((_, ri) =>
      table.headers.map((_, ci) => cellRefs.current[ri]?.[ci] ?? null)
    )
  }, [table.rows.length, table.headers.length])

  const cols = table.headers.length
  const rows = table.rows.length

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">

      {/* ── Top toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Format options */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)}
            className="accent-purple-600 w-3.5 h-3.5" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pretty align</span>
        </label>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Export format */}
        <div className="relative">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="appearance-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 pr-7 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
          >
            <option value="markdown">Markdown</option>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          <button onClick={handleExample}
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer">
            Try example
          </button>
          <button onClick={handleClear}
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Clear
          </button>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            <Download className="w-3 h-3" /> Download
          </button>
        </div>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 lg:hidden">
        {(["editor", "markdown", "preview"] as ActiveTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              activeTab === tab
                ? "bg-purple-600 text-white"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            )}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Three-pane layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── PANE 1: Spreadsheet editor ── */}
        <div className={cn("flex flex-col gap-3 lg:col-span-1", activeTab !== "editor" && "hidden lg:flex")}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              Editor
            </label>
            <div className="flex items-center gap-1">
              <button onClick={() => addRow()} title="Add row"
                className="flex items-center gap-0.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-1.5 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Plus className="w-3 h-3" /> Row
              </button>
              <button onClick={() => addCol()} title="Add column"
                className="flex items-center gap-0.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-1.5 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Plus className="w-3 h-3" /> Col
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full border-collapse text-xs">
              {/* Column controls */}
              <colgroup>
                <col className="w-6" />
                {table.headers.map((_, i) => <col key={i} />)}
                <col className="w-6" />
              </colgroup>

              {/* Header: alignment + col actions */}
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900">
                  <td />
                  {table.headers.map((_, ci) => (
                    <td key={ci} className="border-b border-zinc-200 dark:border-zinc-800 px-1 py-1">
                      <div className="flex items-center justify-between gap-0.5">
                        <div className="flex gap-0.5">
                          {(["left", "center", "right"] as Alignment[]).map((a) => (
                            <AlignBtn key={a} align={a} active={table.alignments[ci] === a}
                              onClick={() => setAlignment(ci, a)} />
                          ))}
                        </div>
                        <div className="flex gap-0.5">
                          <button onClick={() => moveCol(ci, -1)} disabled={ci === 0}
                            className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 transition-colors">
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button onClick={() => moveCol(ci, 1)} disabled={ci === cols - 1}
                            className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 transition-colors">
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeCol(ci)} disabled={cols <= 1}
                            className="p-0.5 text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                  ))}
                  <td />
                </tr>

                {/* Header cells */}
                <tr className="bg-zinc-50 dark:bg-zinc-900/80">
                  <td className="border-b border-zinc-200 dark:border-zinc-800 text-center text-zinc-300 dark:text-zinc-700 font-mono text-[10px] px-1">
                    #
                  </td>
                  {table.headers.map((h, ci) => (
                    <td key={ci} className="border-b border-l border-zinc-200 dark:border-zinc-800 p-0">
                      <input
                        value={h}
                        onChange={(e) => updateHeader(ci, e.target.value)}
                        placeholder={`Col ${ci + 1}`}
                        className="w-full bg-transparent px-2 py-2 font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:bg-purple-50 dark:focus:bg-purple-900/10 min-w-20"
                        style={{ textAlign: table.alignments[ci] }}
                      />
                    </td>
                  ))}
                  <td className="border-b border-l border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => addCol()}
                      className="w-full h-full flex items-center justify-center p-2 text-zinc-300 dark:text-zinc-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              </thead>

              {/* Body: data rows */}
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    {/* Row controls */}
                    <td className="border-b border-zinc-100 dark:border-zinc-800/60 px-1">
                      <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveRow(ri, -1)} disabled={ri === 0}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20">
                          <ChevronUp className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={() => moveRow(ri, 1)} disabled={ri === rows - 1}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20">
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>

                    {/* Data cells */}
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-l border-zinc-100 dark:border-zinc-800/60 p-0">
                        <input
                          ref={(el) => {
                            if (!cellRefs.current[ri]) cellRefs.current[ri] = []
                            cellRefs.current[ri][ci] = el
                          }}
                          value={cell ?? ""}
                          onChange={(e) => updateCell(ri, ci, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                          onPaste={(e) => handlePaste(e, ri, ci)}
                          placeholder="—"
                          className="w-full bg-transparent px-2 py-2 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none focus:bg-purple-50 dark:focus:bg-purple-900/10 min-w-20"
                          style={{ textAlign: table.alignments[ci] }}
                        />
                      </td>
                    ))}

                    {/* Row action column */}
                    <td className="border-b border-l border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex flex-col gap-0.5 items-center p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => duplicateRow(ri)} title="Duplicate row"
                          className="p-0.5 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeRow(ri)} disabled={rows <= 1} title="Delete row"
                          className="p-0.5 text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Add row button */}
                <tr>
                  <td />
                  <td colSpan={cols + 1} className="p-0">
                    <button onClick={() => addRow()}
                      className="w-full flex items-center justify-center gap-1 py-2 text-zinc-300 dark:text-zinc-700 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors text-xs">
                      <Plus className="w-3 h-3" /> Add row
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Import section ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
              Import CSV or Markdown
            </label>
            <textarea
              value={markdownInput}
              onChange={(e) => {
                setMarkdownInput(e.target.value)
                setImportError("")
                // Auto-detect CSV paste
                const v = e.target.value
                if ((v.includes(",") || v.includes("\t")) && !v.startsWith("|")) {
                  importCSV(v)
                  setMarkdownInput("")
                }
              }}
              placeholder={`Paste CSV:\nName,Age\nAlice,22\n\nor Markdown:\n| Name | Age |\n|------|-----|\n| Alice | 22 |`}
              rows={5}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
            {importError && (
              <p className="text-xs text-red-500 dark:text-red-400">{importError}</p>
            )}
            <button
              onClick={importMarkdownTable}
              disabled={!markdownInput.trim()}
              className="self-start rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Import Markdown
            </button>
          </div>
        </div>

        {/* ── PANE 2: Markdown output ── */}
        <div className={cn("flex flex-col gap-3 lg:col-span-1", activeTab !== "markdown" && "hidden lg:flex")}>
          <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                Markdown
            </label>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 overflow-auto flex-1 min-h-50">
            <pre className="font-mono text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre leading-relaxed">
              {markdown}
            </pre>
          </div>
        </div>

        {/* ── PANE 3: Rendered preview ── */}
        <div className={cn("flex flex-col gap-3 lg:col-span-1", activeTab !== "preview" && "hidden lg:flex")}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
                Preview
            </label>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 overflow-auto flex-1 min-h-50">
            <style>{`
              .md-preview-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
              .md-preview-table th {
                background: #f4f4f5; padding: 6px 10px;
                border: 1px solid #e4e4e7; font-weight: 600;
                color: #18181b; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
              }
              .dark .md-preview-table th {
                background: #18181b; border-color: #27272a; color: #a1a1aa;
              }
              .md-preview-table td {
                padding: 6px 10px; border: 1px solid #e4e4e7;
                color: #3f3f46;
              }
              .dark .md-preview-table td { border-color: #27272a; color: #a1a1aa; }
              .md-preview-table tr:nth-child(even) td { background: #fafafa; }
              .dark .md-preview-table tr:nth-child(even) td { background: #0d0d0e; }
              .md-preview-table tr:hover td { background: #f0f0fe; }
              .dark .md-preview-table tr:hover td { background: #1e1b4b20; }
            `}</style>
            <table
              className="md-preview-table"
              dangerouslySetInnerHTML={{ __html: previewHTML }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats footer ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-600">
        <span>{rows} row{rows !== 1 ? "s" : ""}</span>
        <span>{cols} column{cols !== 1 ? "s" : ""}</span>
        <span>{markdown.split("\n").length} lines</span>
        <span>{markdown.length} chars</span>
        <span className="ml-auto hidden sm:block opacity-60">Tab / Shift+Tab to navigate · Enter to move down · Paste CSV directly into cells</span>
      </div>
    </div>
  )
}