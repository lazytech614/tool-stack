import { FormatOptions } from "@/components/tools/dev-tools/formatting/sql-formatter";
import { SQL_KEYWORDS } from "@/constants/configs/examples";
import { IdentifierCase, IndentStyle, KeywordCase } from "@/types/dev-tools/sql-formatter";

const KEYWORD_SET = new Set(SQL_KEYWORDS.map((k) => k.toUpperCase()));

// ---------------------------------------------------------------------------
// Formatter engine (pure TS, no deps)
// ---------------------------------------------------------------------------

function applyCase(word: string, mode: KeywordCase | IdentifierCase): string {
  if (mode === "upper") return word.toUpperCase();
  if (mode === "lower") return word.toLowerCase();
  return word;
}

function isKeyword(word: string): boolean {
  return KEYWORD_SET.has(word.toUpperCase());
}

function minifySQL(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getIndent(style: IndentStyle): string {
  if (style === "tab") return "\t";
  return " ".repeat(Number(style));
}

export function formatSQL(sql: string, opts: FormatOptions): string {
  if (opts.outputMode === "minify") return minifySQL(sql);

  const indent = getIndent(opts.indentStyle);

  // Strip comments and collapse whitespace for processing
  const src = sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Tokenise: strings, parens, commas, semicolons, operators, words
  const TOKEN_RE =
    /('(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|\[.*?\])|(\(|\))|([,;])|([<>!=]+|[+\-*/%])|(\b\w+\b)|(\S)/g;

  type Token =
    | { kind: "string"; val: string }
    | { kind: "paren"; val: string }
    | { kind: "comma" | "semi"; val: string }
    | { kind: "op"; val: string }
    | { kind: "word"; val: string }
    | { kind: "other"; val: string };

  const tokens: Token[] = [];
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(src)) !== null) {
    if (m[1]) tokens.push({ kind: "string", val: m[1] });
    else if (m[2]) tokens.push({ kind: "paren", val: m[2] });
    else if (m[3]) tokens.push({ kind: m[3] === "," ? "comma" : "semi", val: m[3] });
    else if (m[4]) tokens.push({ kind: "op", val: m[4] });
    else if (m[5]) tokens.push({ kind: "word", val: m[5] });
    else tokens.push({ kind: "other", val: m[6] });
  }

  // Clause-level keywords that start a new line at depth 0
  const CLAUSE_BREAK = new Set([
    "SELECT",
    "FROM",
    "WHERE",
    "ORDER",
    "GROUP",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "FULL",
    "CROSS",
    "OUTER",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "WITH",
    "UNION",
    "RETURNING",
    "ON",
  ]);

  // After SELECT / SET / VALUES, each comma-separated item gets its own line
  let depth = 0;
  let inSelectList = false;
  const lines: string[] = [];
  let current = "";
  const leadingComma = opts.commaStyle === "leading";

  const flush = (extra = "") => {
    const trimmed = current.trim();
    if (trimmed || extra) lines.push(indent.repeat(depth) + trimmed + extra);
    current = "";
  };

  const processWord = (raw: string): string => {
    if (isKeyword(raw)) return applyCase(raw, opts.keywordCase);
    return applyCase(raw, opts.identifierCase);
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const next = tokens[i + 1];

    if (tok.kind === "word") {
      const up = tok.val.toUpperCase();
      const processed = processWord(tok.val);

      if (CLAUSE_BREAK.has(up) && depth === 0) {
        flush();
        inSelectList = up === "SELECT" || up === "SET" || up === "VALUES";

        // Peek: compound keywords like ORDER BY, GROUP BY, LEFT JOIN, etc.
        const nextUp = next?.kind === "word" ? next.val.toUpperCase() : "";
        const compound: Record<string, string> = {
          ORDER: "BY",
          GROUP: "BY",
          PARTITION: "BY",
          INNER: "JOIN",
          LEFT: "JOIN",
          RIGHT: "JOIN",
          FULL: "JOIN",
          CROSS: "JOIN",
          OUTER: "JOIN",
        };
        if (compound[up] === nextUp) {
          current = processWord(tok.val) + " " + processWord(tokens[i + 1].val);
          i++;
        } else {
          current = processed;
        }
        flush();
      } else {
        current += (current ? " " : "") + processed;
      }
    } else if (tok.kind === "comma") {
      if (inSelectList && depth === 0) {
        if (leadingComma) {
          flush();
          current = ", ";
        } else {
          flush(",");
        }
      } else {
        current += ",";
      }
    } else if (tok.kind === "semi") {
      flush(";");
      inSelectList = false;
    } else if (tok.kind === "paren") {
      if (tok.val === "(") {
        current += (current ? " " : "") + "(";
        depth++;
      } else {
        depth = Math.max(0, depth - 1);
        current += ")";
      }
    } else if (tok.kind === "op") {
      current += " " + tok.val + " ";
    } else {
      // string literal or other
      current += (current ? " " : "") + tok.val;
    }
  }
  flush();

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Syntax highlighting (plain-text → HTML spans)
// ---------------------------------------------------------------------------

export function highlightSQL(sql: string): string {
  if (!sql) return "";

  // Escape HTML first
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const parts: string[] = [];
  const re =
    /('(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`)|(\b\d+(\.\d+)?\b)|(--[^\n]*)|([<>!=]+|[+\-*/%])|([,;()])|(\b\w+\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(sql)) !== null) {
    if (m.index > last) parts.push(`<span>${esc(sql.slice(last, m.index))}</span>`);

    if (m[1]) {
      // string literal
      parts.push(`<span class="sql-string">${esc(m[1])}</span>`);
    } else if (m[2]) {
      // number
      parts.push(`<span class="sql-number">${esc(m[2])}</span>`);
    } else if (m[4]) {
      // comment
      parts.push(`<span class="sql-comment">${esc(m[4])}</span>`);
    } else if (m[5]) {
      // operator
      parts.push(`<span class="sql-operator">${esc(m[5])}</span>`);
    } else if (m[6]) {
      // punctuation
      parts.push(`<span class="sql-punct">${esc(m[6])}</span>`);
    } else if (m[7]) {
      // word
      if (isKeyword(m[7])) {
        parts.push(`<span class="sql-keyword">${esc(m[7])}</span>`);
      } else {
        parts.push(`<span class="sql-ident">${esc(m[7])}</span>`);
      }
    }
    last = m.index + m[0].length;
  }

  if (last < sql.length) parts.push(`<span>${esc(sql.slice(last))}</span>`);

  return parts.join("");
}
