// ─── Theme tokens ──────────────────────────────────────────────────────────────
export const T = {
  dark: {
    bg: "#000000",
    bgSecondary: "#09090b",
    bgTertiary: "#18181b",
    bgAccent: "rgba(124,58,237,0.08)",
    border: "#27272a",
    borderSub: "#3f3f46",
    text: "#e4e4e7",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    textFaint: "#52525b",
    purple: "#a78bfa",
    purpleDim: "rgba(124,58,237,0.15)",
    purpleBorder: "rgba(124,58,237,0.3)",
    green: "#6ee7b7",
    blue: "#60a5fa",
    orange: "#fb923c",
    red: "#f87171",
    codeBg: "#09090b",
    codeText: "#e4e4e7",
    hlKeyword: "#c084fc",
    hlString: "#6ee7b7",
    hlComment: "#52525b",
    hlNumber: "#60a5fa",
    tableHover: "#18181b",
    tableHeader: "#18181b",
  },
  light: {
    bg: "#ffffff",
    bgSecondary: "#fafafa",
    bgTertiary: "#f4f4f5",
    bgAccent: "rgba(124,58,237,0.05)",
    border: "#e4e4e7",
    borderSub: "#d4d4d8",
    text: "#3f3f46",
    textPrimary: "#09090b",
    textSecondary: "#52525b",
    textMuted: "#71717a",
    textFaint: "#a1a1aa",
    purple: "#7c3aed",
    purpleDim: "rgba(124,58,237,0.08)",
    purpleBorder: "rgba(124,58,237,0.2)",
    green: "#059669",
    blue: "#2563eb",
    orange: "#ea580c",
    red: "#dc2626",
    codeBg: "#f4f4f5",
    codeText: "#18181b",
    hlKeyword: "#7c3aed",
    hlString: "#059669",
    hlComment: "#a1a1aa",
    hlNumber: "#2563eb",
    tableHover: "#f4f4f5",
    tableHeader: "#f4f4f5",
  },
};

// ─── Syntax highlight ──────────────────────────────────────────────────────────
export function highlightCode(code: string, lang: string, c: typeof T.dark): string {
  if (!lang || lang === "text") return code;
  const kws: Record<string, string[]> = {
    typescript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "async",
      "await",
      "import",
      "export",
      "from",
      "interface",
      "type",
      "class",
      "new",
      "if",
      "else",
      "for",
      "while",
      "true",
      "false",
      "null",
      "undefined",
    ],
    javascript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "async",
      "await",
      "import",
      "export",
      "from",
      "class",
      "new",
      "if",
      "else",
      "for",
      "while",
      "true",
      "false",
      "null",
      "undefined",
    ],
    bash: ["npm", "npx", "git", "cd", "ls", "echo", "export", "install", "run", "gh-helper"],
    python: [
      "def",
      "class",
      "import",
      "from",
      "return",
      "if",
      "else",
      "elif",
      "for",
      "while",
      "True",
      "False",
      "None",
      "async",
      "await",
    ],
    rust: [
      "fn",
      "let",
      "mut",
      "pub",
      "use",
      "struct",
      "impl",
      "trait",
      "return",
      "true",
      "false",
      "None",
      "Some",
    ],
  };
  let r = code;
  r = r.replace(/(&quot;|&#39;|`)(.*?)\1/g, `<span style="color:${c.hlString}">$1$2$1</span>`);
  r = r.replace(/(\/\/[^\n]*)/g, `<span style="color:${c.hlComment};font-style:italic">$1</span>`);
  r = r.replace(/(#[^\n]*)/g, `<span style="color:${c.hlComment};font-style:italic">$1</span>`);
  (kws[lang] || []).forEach((kw) => {
    r = r.replace(
      new RegExp(`\\b(${kw})\\b`, "g"),
      `<span style="color:${c.hlKeyword};font-weight:600">$1</span>`,
    );
  });
  r = r.replace(/\b(\d+)\b/g, `<span style="color:${c.hlNumber}">$1</span>`);
  return r;
}

// ─── Markdown parser (theme-aware) ────────────────────────────────────────────
export function parseMarkdown(md: string, c: typeof T.dark): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (s: string): string =>
    s
      .replace(
        /`([^`]+)`/g,
        `<code style="font-family:ui-monospace,monospace;font-size:11px;background:${c.bgTertiary};color:${c.purple};padding:2px 6px;border-radius:4px">$1</code>`,
      )
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        `<a href="$2" style="color:${c.purple};text-decoration:none" target="_blank" rel="noopener">$1</a>`,
      )
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        `<img alt="$1" src="$2" style="max-width:100%;border-radius:8px;margin:8px 0"/>`,
      );

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const code = codeLines.join("\n");

      if (lang === "mermaid") {
        const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
        out.push(
          `<div id="${id}" data-mermaid="${encodeURIComponent(code)}" style="margin:12px 0;padding:20px;background:${c.codeBg};border:1px solid ${c.border};border-radius:10px;overflow:auto;display:flex;justify-content:center"><pre style="margin:0;color:${c.textFaint};font-size:12px;font-family:ui-monospace,monospace">${esc(code)}</pre></div>`,
        );
      } else {
        const highlighted = highlightCode(esc(code), lang, c);
        out.push(
          `<div style="margin:12px 0;border-radius:10px;overflow:hidden;border:1px solid ${c.border};background:${c.codeBg}"><div style="display:flex;align-items:center;justify-content:space-between;padding:7px 14px;background:${c.bgTertiary};border-bottom:1px solid ${c.border}"><span style="font-size:10px;font-family:ui-monospace,monospace;color:${c.textMuted};text-transform:uppercase;letter-spacing:.08em">${lang || "text"}</span><button class="md-copy-btn" data-code="${encodeURIComponent(code)}" style="font-size:11px;padding:2px 8px;border-radius:5px;border:1px solid ${c.borderSub};background:transparent;color:${c.textMuted};cursor:pointer">Copy</button></div><pre style="margin:0;padding:14px 16px;overflow-x:auto"><code style="font-family:ui-monospace,monospace;font-size:12px;line-height:1.65;color:${c.codeText}">${highlighted}</code></pre></div>`,
        );
      }
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const sizes = ["2rem", "1.4rem", "1.15rem", "1rem", "1rem", "1rem"];
      const margins = [
        "0 0 16px",
        "28px 0 10px",
        "20px 0 8px",
        "16px 0 6px",
        "14px 0 4px",
        "12px 0 4px",
      ];
      const border =
        level <= 2
          ? `;padding-bottom:${level === 1 ? "8px" : "6px"};border-bottom:1px solid ${c.border}`
          : "";
      out.push(
        `<h${level} style="font-size:${sizes[level - 1]};font-weight:${level <= 2 ? 700 : 600};color:${c.textPrimary};margin:${margins[level - 1]}${border}">${inline(hMatch[2])}</h${level}>`,
      );
      i++;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      out.push(`<hr style="border:none;border-top:1px solid ${c.border};margin:24px 0"/>`);
      i++;
      continue;
    }

    // Blockquote
    if (/^>/.test(line)) {
      const qLines: string[] = [];
      while (i < lines.length && /^>/.test(lines[i])) {
        qLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(
        `<blockquote style="border-left:3px solid ${c.purple};margin:0 0 14px;padding:10px 16px;background:${c.purpleDim};border-radius:0 8px 8px 0;color:${c.textSecondary}">${inline(qLines.join(" "))}</blockquote>`,
      );
      continue;
    }

    // Table
    if (/\|/.test(line) && i + 1 < lines.length && /^\|[-:| ]+\|/.test(lines[i + 1])) {
      const headers = line
        .split("|")
        .filter((_, x, a) => x > 0 && x < a.length - 1)
        .map((h) => h.trim());
      const aligns = lines[i + 1]
        .split("|")
        .filter((_, x, a) => x > 0 && x < a.length - 1)
        .map((a) => {
          a = a.trim();
          if (a.startsWith(":") && a.endsWith(":")) return "center";
          if (a.endsWith(":")) return "right";
          return "left";
        });
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /\|/.test(lines[i])) {
        rows.push(
          lines[i]
            .split("|")
            .filter((_, x, a) => x > 0 && x < a.length - 1)
            .map((c) => c.trim()),
        );
        i++;
      }
      let t = `<div style="overflow-x:auto;margin:12px 0"><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr>`;
      headers.forEach((h, x) => {
        t += `<th style="padding:8px 12px;text-align:${aligns[x] || "left"};background:${c.tableHeader};color:${c.purple};font-weight:600;border:1px solid ${c.border};font-size:12px">${inline(h)}</th>`;
      });
      t += `</tr></thead><tbody>`;
      rows.forEach((row) => {
        t += `<tr class="md-tr">`;
        row.forEach((cell, x) => {
          t += `<td style="padding:8px 12px;text-align:${aligns[x] || "left"};border:1px solid ${c.border};color:${c.text}">${inline(cell)}</td>`;
        });
        t += `</tr>`;
      });
      t += `</tbody></table></div>`;
      out.push(t);
      continue;
    }

    // Task / unordered list
    if (/^[-*+]\s/.test(line)) {
      const listLines: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        listLines.push(lines[i]);
        i++;
      }
      let ul = `<ul style="margin:0 0 12px;padding-left:20px;list-style:disc">`;
      listLines.forEach((l) => {
        const tm = l.match(/^[-*+]\s\[(x| )\]\s(.*)/i);
        if (tm) {
          const checked = tm[1].toLowerCase() === "x";
          ul += `<li style="list-style:none;display:flex;align-items:center;gap:8px;margin:4px 0"><input type="checkbox" ${checked ? "checked" : ""} disabled style="accent-color:${c.purple};width:14px;height:14px;cursor:default"/><span style="color:${c.text}">${inline(tm[2])}</span></li>`;
        } else {
          ul += `<li style="margin:4px 0;color:${c.text}">${inline(l.replace(/^[-*+]\s/, ""))}</li>`;
        }
      });
      ul += `</ul>`;
      out.push(ul);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const listLines: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listLines.push(lines[i]);
        i++;
      }
      let ol = `<ol style="margin:0 0 12px;padding-left:20px">`;
      listLines.forEach((l) => {
        ol += `<li style="margin:4px 0;color:${c.text}">${inline(l.replace(/^\d+\.\s/, ""))}</li>`;
      });
      ol += `</ol>`;
      out.push(ol);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^[#\->+\*+`\d]/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      out.push(
        `<p style="margin:0 0 12px;color:${c.text};line-height:1.75">${inline(paraLines.join(" "))}</p>`,
      );
    } else {
      out.push(`<p style="margin:0 0 12px;color:${c.text};line-height:1.75">${inline(line)}</p>`);
      i++;
    }
  }
  return out.join("\n");
}

export function counts(text: string) {
  return {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    lines: text.split("\n").length,
  };
}
