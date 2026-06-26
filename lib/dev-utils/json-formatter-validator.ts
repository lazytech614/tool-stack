import { ParseError } from "@/components/tools/dev-tools/formatting/json-formatter-validator";

// ─── JSON Syntax Highlighter ──────────────────────────────────────────────────

export function highlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-blue-400 dark:text-blue-300"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-purple-400 dark:text-purple-300"; // key
          } else {
            cls = "text-emerald-400 dark:text-emerald-300"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-orange-400 dark:text-orange-300"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-zinc-400"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

// ─── Parse Error Extractor ────────────────────────────────────────────────────

export function parseJsonError(raw: string, input: string): ParseError {
  const lineMatch = raw.match(/line (\d+)/i);
  const colMatch = raw.match(/column (\d+)/i);
  const posMatch = raw.match(/position (\d+)/i);

  let line: number | null = lineMatch ? parseInt(lineMatch[1]) : null;
  let column: number | null = colMatch ? parseInt(colMatch[1]) : null;

  if (!line && posMatch) {
    const pos = parseInt(posMatch[1]);
    const upTo = input.slice(0, pos);
    line = upTo.split("\n").length;
    column = upTo.split("\n").pop()!.length + 1;
  }

  const clean = raw.replace(/^SyntaxError:\s*/i, "");
  return { message: clean, line, column };
}