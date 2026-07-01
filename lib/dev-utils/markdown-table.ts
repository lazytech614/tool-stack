import { TableState } from "@/components/tools/dev-tools/generator/markdown-table";
import { Alignment, ExportFormat } from "@/types/dev-tools/markdown-table";

export function makeEmptyTable(cols: number, rows: number): TableState {
  return {
    headers: Array.from({ length: cols }, (_, i) => `Column ${i + 1}`),
    alignments: Array(cols).fill("left"),
    rows: Array.from({ length: rows }, () => Array(cols).fill("")),
  };
}

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------
export function generateMarkdown(table: TableState, padding: boolean, pretty: boolean): string {
  const { headers, alignments, rows } = table;
  const pad = padding ? " " : "";

  if (pretty) {
    const colWidths = headers.map((h, ci) =>
      Math.max(h.length, ...rows.map((r) => (r[ci] ?? "").length), 3),
    );

    const cell = (val: string, width: number, align: Alignment) => {
      const v = val ?? "";
      if (align === "right") return v.padStart(width);
      if (align === "center") {
        const total = width - v.length;
        const left = Math.floor(total / 2);
        const right = total - left;
        return " ".repeat(left) + v + " ".repeat(right);
      }
      return v.padEnd(width);
    };

    const sep = (align: Alignment, width: number) => {
      if (align === "center") return ":" + "-".repeat(width - 2) + ":";
      if (align === "right") return "-".repeat(width - 1) + ":";
      return ":" + "-".repeat(width - 1);
    };

    const headerRow =
      "| " + headers.map((h, i) => cell(h, colWidths[i], alignments[i])).join(" | ") + " |";
    const sepRow = "| " + alignments.map((a, i) => sep(a, colWidths[i])).join(" | ") + " |";
    const dataRows = rows.map(
      (r) => "| " + r.map((v, i) => cell(v ?? "", colWidths[i], alignments[i])).join(" | ") + " |",
    );

    return [headerRow, sepRow, ...dataRows].join("\n");
  }

  const headerRow = "|" + headers.map((h) => `${pad}${h}${pad}`).join("|") + "|";
  const sepRow =
    "|" +
    alignments
      .map((a) => {
        const inner = a === "center" ? ":---:" : a === "right" ? "---:" : ":---";
        return inner;
      })
      .join("|") +
    "|";
  const dataRows = rows.map((r) => "|" + r.map((v) => `${pad}${v ?? ""}${pad}`).join("|") + "|");

  return [headerRow, sepRow, ...dataRows].join("\n");
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------
export function exportAs(
  table: TableState,
  format: ExportFormat,
  padding: boolean,
  pretty: boolean,
): string {
  const { headers, rows } = table;
  if (format === "markdown") return generateMarkdown(table, padding, pretty);
  if (format === "csv") {
    const esc = (v: string) =>
      v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  }
  if (format === "tsv") {
    return [headers, ...rows].map((r) => r.join("\t")).join("\n");
  }
  if (format === "json") {
    return JSON.stringify(
      rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]))),
      null,
      2,
    );
  }
  return "";
}

// ---------------------------------------------------------------------------
// Parse markdown table back into state
// ---------------------------------------------------------------------------
export function parseMarkdown(md: string): TableState | null {
  const lines = md.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return null;
  const parseRow = (line: string) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
  const headers = parseRow(lines[0]);
  const sepLine = lines[1];
  if (!sepLine.includes("-")) return null;
  const sepCells = parseRow(sepLine);
  const alignments: Alignment[] = sepCells.map((s) => {
    if (s.startsWith(":") && s.endsWith(":")) return "center";
    if (s.endsWith(":")) return "right";
    return "left";
  });
  const rows = lines.slice(2).map(parseRow);
  return { headers, alignments, rows };
}

// ---------------------------------------------------------------------------
// Render markdown preview (very lightweight)
// ---------------------------------------------------------------------------
export function renderTableHTML(table: TableState): string {
  const { headers, alignments, rows } = table;
  const th = headers
    .map((h, i) => `<th style="text-align:${alignments[i]}">${escape(h)}</th>`)
    .join("");
  const trs = rows
    .map(
      (r) =>
        "<tr>" +
        r
          .map((v, i) => `<td style="text-align:${alignments[i]}">${escape(v ?? "")}</td>`)
          .join("") +
        "</tr>",
    )
    .join("");
  return `<thead><tr>${th}</tr></thead><tbody>${trs}</tbody>`;

  function escape(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
