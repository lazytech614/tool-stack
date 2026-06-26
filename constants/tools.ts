import {
  Code2,
  ClipboardCheck,
  Braces,
  Database,
  GitCommitIcon,
  Link2,
  FileJson,
  Table2,
  Hash,
  Palette,
  Clock,
  Globe,
  Calculator,
  Image,
  Type,
  Shield,
  Shuffle,
  FileText,
  Binary,
  Regex,
  Network,
  Minimize2,
  Eye,
  Columns,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export type ToolCategory =
  | "Encoding"
  | "Formatting"
  | "Comparison"
  | "Generator"
  | "Converter"
  | "Preview"
  | "Utilities"
  | "Github"

export interface Tool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: ToolCategory
  href: string
  isNew?: boolean
  status?: "COMING_SOON" | "DEPRECATED" | "MAINTENANCE" | "BETA" | "ACTIVE"
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

export const ALL_TOOLS: Tool[] = [
  {
    id: "commit-generator",
    name: "Commit Generator",
    description: "Generate different commit messages from your git diff.",
    icon: GitCommitIcon,
    category: "Github",
    href: "/tools/commit-generator",
    status: "BETA",
    seo: {
      title: "AI Git Commit Message Generator | Tool Stack",
      description:
        "Generate meaningful Git commit messages from your code changes instantly. Supports Conventional Commits and AI-powered suggestions.",
      keywords: [
        "git commit generator",
        "commit message generator",
        "ai commit generator",
        "git tools",
        "github helper",
      ],
    },
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    description:
      "Compare two text blocks and highlight added, removed, and unchanged lines in split or inline view.",
    icon: GitCommitIcon,
    category: "Comparison",
    href: "/tools/diff-checker",
    status: "ACTIVE",
    seo: {
      title: "Online Diff Checker – Compare Text & Code | Tool Stack",
      description:
        "Compare two text blocks side by side and highlight additions, deletions, and unchanged lines. Supports split and inline diff views.",
      keywords: [
        "diff checker",
        "text diff",
        "code diff",
        "compare text online",
        "diff tool",
      ],
    },
  },
  {
    id: "base64-url",
    name: "Base64 / URL",
    description:
      "Encode and decode binary string fragments, escape special URL query variables, and test strings.",
    icon: Link2,
    category: "Encoding",
    href: "/tools/base64-url",
    status: "ACTIVE",
    seo: {
      title: "Base64 & URL Encoder / Decoder Online | Tool Stack",
      description:
        "Encode and decode Base64 strings and URL-encode or decode query parameters instantly in your browser. No data leaves your machine.",
      keywords: [
        "base64 encoder",
        "base64 decoder",
        "url encoder",
        "url decoder",
        "encoding tools",
      ],
    },
  },
  {
    id: "html-preview",
    name: "HTML Preview",
    description:
      "Write and preview raw HTML in real-time with a live sandboxed renderer.",
    icon: Code2,
    category: "Preview",
    href: "/tools/html-preview",
    seo: {
      title: "Live HTML Preview Editor Online | Tool Stack",
      description:
        "Write raw HTML and see a real-time rendered preview in a sandboxed iframe. Perfect for quick prototyping and HTML snippet testing.",
      keywords: [
        "html preview",
        "live html editor",
        "html renderer",
        "online html editor",
        "html sandbox",
      ],
    },
  },
  {
    id: "clipboard-manager",
    name: "Clipboard Manager",
    description:
      "Store and quickly access frequently used text snippets without leaving your workflow.",
    icon: ClipboardCheck,
    category: "Utilities",
    href: "/tools/clipboard-manager",
    seo: {
      title: "Online Clipboard Manager – Save Text Snippets | Tool Stack",
      description:
        "Store, organize, and instantly recall frequently used text snippets. A lightweight clipboard manager that lives in your browser.",
      keywords: [
        "clipboard manager",
        "text snippets",
        "copy paste tool",
        "snippet manager",
        "clipboard tool",
      ],
    },
  },
  {
    id: "json-formatter-validator",
    name: "JSON Formatter And Validator",
    description:
      "Prettify, minify, and validate JSON with syntax highlighting and collapsible nodes.",
    icon: Braces,
    category: "Formatting",
    href: "/tools/json-formatter-validator",
    isNew: false,
    seo: {
      title: "JSON Formatter, Validator & Minifier Online | Tool Stack",
      description:
        "Prettify and validate JSON with syntax highlighting and collapsible tree nodes. Also supports JSON minification for production use.",
      keywords: [
        "json formatter",
        "json validator",
        "json beautifier",
        "json minifier",
        "json tools",
      ],
    },
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description:
      "Format and beautify SQL queries with keyword highlighting and indentation control.",
    icon: Database,
    category: "Formatting",
    href: "/tools/sql-formatter",
    seo: {
      title: "SQL Formatter & Beautifier Online | Tool Stack",
      description:
        "Instantly format and beautify SQL queries with proper indentation and keyword highlighting. Supports MySQL, PostgreSQL, and more.",
      keywords: [
        "sql formatter",
        "sql beautifier",
        "format sql online",
        "sql query formatter",
        "sql indenter",
      ],
    },
  },
  {
    id: "json-to-schema",
    name: "JSON → Schema",
    description:
      "Automatically infer a JSON Schema from any JSON document you paste in.",
    icon: FileJson,
    category: "Generator",
    href: "/tools/json-to-schema",
    isNew: true,
    seo: {
      title: "JSON to JSON Schema Generator Online | Tool Stack",
      description:
        "Paste any JSON document and automatically generate a valid JSON Schema. Ideal for API documentation, validation, and TypeScript type generation.",
      keywords: [
        "json schema generator",
        "json to schema",
        "generate json schema",
        "json schema tool",
        "api schema generator",
      ],
    },
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description:
      "Write Markdown and see the rendered output side-by-side with GFM support.",
    icon: Eye,
    category: "Preview",
    href: "/tools/markdown-preview",
    seo: {
      title: "Live Markdown Preview Editor with GFM Support | Tool Stack",
      description:
        "Write Markdown and see the rendered HTML output in real-time. Supports GitHub Flavored Markdown including tables, task lists, and code blocks.",
      keywords: [
        "markdown preview",
        "markdown editor",
        "live markdown",
        "gfm markdown",
        "markdown renderer",
      ],
    },
  },
  {
    id: "markdown-table",
    name: "Markdown Table",
    description:
      "Build Markdown tables visually with a spreadsheet-like editor and copy the result.",
    icon: Table2,
    category: "Generator",
    href: "/tools/markdown-table",
    seo: {
      title: "Markdown Table Generator – Visual Editor | Tool Stack",
      description:
        "Build Markdown tables using a spreadsheet-style editor and copy the formatted result instantly. No manual pipe formatting required.",
      keywords: [
        "markdown table generator",
        "markdown table",
        "create markdown table",
        "table to markdown",
        "markdown tools",
      ],
    },
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files instantly.",
    icon: Hash,
    category: "Generator",
    href: "/tools/hash-generator",
    seo: {
      title: "MD5, SHA-1, SHA-256 & SHA-512 Hash Generator | Tool Stack",
      description:
        "Generate cryptographic hashes from any text or file. Supports MD5, SHA-1, SHA-256, and SHA-512 — all computed offline in your browser.",
      keywords: [
        "hash generator",
        "md5 generator",
        "sha256 generator",
        "sha512 generator",
        "checksum tool",
      ],
    },
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description:
      "Convert between HEX, RGB, HSL, and HSV color formats with a visual picker.",
    icon: Palette,
    category: "Converter",
    href: "/tools/color-converter",
    seo: {
      title: "Color Converter – HEX, RGB, HSL & HSV Online | Tool Stack",
      description:
        "Convert colors between HEX, RGB, HSL, and HSV formats instantly with a visual color picker. Great for designers and frontend developers.",
      keywords: [
        "color converter",
        "hex to rgb",
        "rgb to hsl",
        "color format converter",
        "color picker tool",
      ],
    },
  },
  {
    id: "unix-timestamp",
    name: "Unix Timestamp",
    description:
      "Convert Unix timestamps to human-readable dates and back, with timezone support.",
    icon: Clock,
    category: "Converter",
    href: "/tools/unix-timestamp",
    seo: {
      title: "Unix Timestamp Converter – Epoch to Date | Tool Stack",
      description:
        "Convert Unix epoch timestamps to human-readable dates and vice versa. Supports all major timezones and millisecond precision.",
      keywords: [
        "unix timestamp converter",
        "epoch converter",
        "timestamp to date",
        "unix epoch",
        "date time converter",
      ],
    },
  },
  {
    id: "url-parser",
    name: "URL Parser",
    description:
      "Dissect any URL into its components: protocol, host, path, query params, and fragment.",
    icon: Globe,
    category: "Utilities",
    href: "/tools/url-parser",
    seo: {
      title: "URL Parser & Dissector Online | Tool Stack",
      description:
        "Break down any URL into its individual components — protocol, hostname, path, query parameters, and fragment. Useful for debugging and API work.",
      keywords: [
        "url parser",
        "url dissector",
        "parse url online",
        "query parameter parser",
        "url components",
      ],
    },
  },
  {
    id: "number-base",
    name: "Number Base Converter",
    description:
      "Convert numbers between binary, octal, decimal, and hexadecimal bases.",
    icon: Calculator,
    category: "Converter",
    href: "/tools/number-base",
    seo: {
      title: "Number Base Converter – Binary, Octal, Hex | Tool Stack",
      description:
        "Convert numbers between binary, octal, decimal, and hexadecimal instantly. Ideal for programmers working with low-level data or bitwise operations.",
      keywords: [
        "number base converter",
        "binary to decimal",
        "hex converter",
        "octal converter",
        "base conversion tool",
      ],
    },
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description:
      "Convert images between PNG, JPEG, WebP, and SVG formats directly in the browser.",
    icon: Image,
    category: "Converter",
    href: "/tools/image-converter",
    isNew: true,
    seo: {
      title: "Online Image Converter – PNG, JPEG, WebP, SVG | Tool Stack",
      description:
        "Convert images between PNG, JPEG, WebP, and SVG formats directly in your browser. No upload required — all processing is done client-side.",
      keywords: [
        "image converter",
        "png to webp",
        "jpeg to png",
        "convert image online",
        "webp converter",
      ],
    },
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description:
      "Generate placeholder text in paragraphs, sentences, or words with custom length.",
    icon: Type,
    category: "Generator",
    href: "/tools/lorem-ipsum",
    seo: {
      title: "Lorem Ipsum Generator – Placeholder Text | Tool Stack",
      description:
        "Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. Customize length and copy instantly for mockups and design work.",
      keywords: [
        "lorem ipsum generator",
        "placeholder text",
        "dummy text generator",
        "lorem ipsum",
        "filler text tool",
      ],
    },
  },
  {
    id: "jwt-debugger",
    name: "JWT Debugger",
    description:
      "Decode, verify, and inspect JSON Web Tokens. Signature validation runs fully offline.",
    icon: Shield,
    category: "Utilities",
    href: "/tools/jwt-debugger",
    status: "BETA",
    seo: {
      title: "JWT Debugger – Decode & Verify JSON Web Tokens | Tool Stack",
      description:
        "Decode and inspect JWT headers, payloads, and signatures. Fully offline signature validation — your tokens never leave the browser.",
      keywords: [
        "jwt debugger",
        "jwt decoder",
        "json web token",
        "jwt validator",
        "jwt inspector",
      ],
    },
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v1, v4, and v5 UUIDs in bulk with formatting options.",
    icon: Shuffle,
    category: "Generator",
    href: "/tools/uuid-generator",
    seo: {
      title: "UUID Generator – v1, v4 & v5 in Bulk | Tool Stack",
      description:
        "Generate RFC-compliant UUIDs in v1, v4, and v5 formats. Bulk generation and formatting options included — all client-side.",
      keywords: [
        "uuid generator",
        "guid generator",
        "v4 uuid",
        "unique id generator",
        "bulk uuid generator",
      ],
    },
  },
  {
    id: "csv-viewer",
    name: "CSV Viewer",
    description:
      "Paste or upload a CSV file and browse it as a sortable, filterable table.",
    icon: FileText,
    category: "Preview",
    href: "/tools/csv-viewer",
    seo: {
      title: "Online CSV Viewer – Sortable & Filterable Table | Tool Stack",
      description:
        "Paste or upload a CSV file and instantly view it as a sortable, filterable table. No server upload — everything runs in the browser.",
      keywords: [
        "csv viewer",
        "csv table viewer",
        "view csv online",
        "csv file reader",
        "csv parser",
      ],
    },
  },
  {
    id: "binary-converter",
    name: "Binary Converter",
    description:
      "Encode text to binary and decode binary strings back to plain text.",
    icon: Binary,
    category: "Encoding",
    href: "/tools/binary-converter",
    seo: {
      title: "Binary to Text Converter – Encode & Decode | Tool Stack",
      description:
        "Convert plain text to binary (0s and 1s) and decode binary strings back to readable text. Fast, offline, and no data stored.",
      keywords: [
        "binary converter",
        "text to binary",
        "binary to text",
        "binary encoder",
        "binary decoder",
      ],
    },
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description:
      "Test regular expressions with live match highlighting, group captures, and flag toggles.",
    icon: Regex,
    category: "Utilities",
    href: "/tools/regex-tester",
    status: "ACTIVE",
    seo: {
      title: "Regex Tester – Live Match Highlighting & Group Captures | Tool Stack",
      description:
        "Test and debug regular expressions in real-time with live match highlighting, capture group inspection, and flag toggles (g, i, m, s).",
      keywords: [
        "regex tester",
        "regular expression tester",
        "regex debugger",
        "regex online",
        "regex match highlighter",
      ],
    },
  },
  {
    id: "ip-lookup",
    name: "IP Lookup",
    description:
      "Look up geolocation, ISP, and network info for any IPv4 or IPv6 address.",
    icon: Network,
    category: "Utilities",
    href: "/tools/ip-lookup",
    seo: {
      title: "IP Address Lookup – Geolocation & ISP Info | Tool Stack",
      description:
        "Look up geolocation, ISP, ASN, and network details for any IPv4 or IPv6 address. Instant results with no account required.",
      keywords: [
        "ip lookup",
        "ip address lookup",
        "ip geolocation",
        "find ip location",
        "isp lookup",
      ],
    },
  },
  {
    id: "minifier",
    name: "Code Minifier",
    description:
      "Minify HTML, CSS, and JavaScript to reduce file size for production.",
    icon: Minimize2,
    category: "Utilities",
    href: "/tools/minifier",
    seo: {
      title: "HTML, CSS & JS Code Minifier Online | Tool Stack",
      description:
        "Minify HTML, CSS, and JavaScript files to reduce bundle size for production. Fast, browser-based minification with no file upload needed.",
      keywords: [
        "code minifier",
        "js minifier",
        "css minifier",
        "html minifier",
        "minify javascript online",
      ],
    },
  },
  {
    id: "side-by-side",
    name: "Side-by-Side View",
    description:
      "Open two tools simultaneously in a resizable split-pane layout.",
    icon: Columns,
    category: "Utilities",
    href: "/tools/side-by-side",
    seo: {
      title: "Side-by-Side Tool View – Split Pane Layout | Tool Stack",
      description:
        "Run two developer tools simultaneously in a resizable split-pane layout. Perfect for comparing outputs or multitasking across tools.",
      keywords: [
        "side by side view",
        "split pane tools",
        "dual tool view",
        "developer tools layout",
        "compare tools",
      ],
    },
  },
]

export const CATEGORIES: ToolCategory[] = [
  "Encoding",
  "Formatting",
  "Comparison",
  "Generator",
  "Converter",
  "Preview",
  "Utilities",
  "Github",
]