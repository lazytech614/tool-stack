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
}

export const ALL_TOOLS: Tool[] = [
  {
    id: "commit-generator",
    name: "Commit Generator",
    description:
      "Generate different commit messages from your git diff.",
    icon: GitCommitIcon,
    category: "Github",
    href: "/tools/commit-generator",
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    description:
      "Compare two text blocks and highlight added, removed, and unchanged lines in split or inline view.",
    icon: GitCommitIcon,
    category: "Comparison",
    href: "/tools/diff-checker",
  },
  {
    id: "base64-url",
    name: "Base64 / URL",
    description:
      "Encode and decode binary string fragments, escape special URL query variables, and test strings.",
    icon: Link2,
    category: "Encoding",
    href: "/tools/base64-url",
  },
  {
    id: "html-preview",
    name: "HTML Preview",
    description:
      "Write and preview raw HTML in real-time with a live sandboxed renderer.",
    icon: Code2,
    category: "Preview",
    href: "/tools/html-preview",
  },
  {
    id: "clipboard-manager",
    name: "Clipboard Manager",
    description:
      "Store and quickly access frequently used text snippets without leaving your workflow.",
    icon: ClipboardCheck,
    category: "Utilities",
    href: "/tools/clipboard-manager",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description:
      "Prettify, minify, and validate JSON with syntax highlighting and collapsible nodes.",
    icon: Braces,
    category: "Formatting",
    href: "/tools/json-formatter",
    isNew: false,
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description:
      "Format and beautify SQL queries with keyword highlighting and indentation control.",
    icon: Database,
    category: "Formatting",
    href: "/tools/sql-formatter",
  },
  {
    id: "json-to-schema",
    name: "JSON → Schema",
    description:
      "Automatically infer a JSON Schema from any JSON document you paste in.",
    icon: FileJson,
    category: "Generator",
    href: "/tools/json-schema",
    isNew: true,
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description:
      "Write Markdown and see the rendered output side-by-side with GFM support.",
    icon: Eye,
    category: "Preview",
    href: "/tools/markdown-preview",
  },
  {
    id: "markdown-table",
    name: "Markdown Table",
    description:
      "Build Markdown tables visually with a spreadsheet-like editor and copy the result.",
    icon: Table2,
    category: "Generator",
    href: "/tools/markdown-table",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files instantly.",
    icon: Hash,
    category: "Generator",
    href: "/tools/hash-generator",
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description:
      "Convert between HEX, RGB, HSL, and HSV color formats with a visual picker.",
    icon: Palette,
    category: "Converter",
    href: "/tools/color-converter",
  },
  {
    id: "unix-timestamp",
    name: "Unix Timestamp",
    description:
      "Convert Unix timestamps to human-readable dates and back, with timezone support.",
    icon: Clock,
    category: "Converter",
    href: "/tools/unix-timestamp",
  },
  {
    id: "url-parser",
    name: "URL Parser",
    description:
      "Dissect any URL into its components: protocol, host, path, query params, and fragment.",
    icon: Globe,
    category: "Utilities",
    href: "/tools/url-parser",
  },
  {
    id: "number-base",
    name: "Number Base Converter",
    description:
      "Convert numbers between binary, octal, decimal, and hexadecimal bases.",
    icon: Calculator,
    category: "Converter",
    href: "/tools/number-base",
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
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description:
      "Generate placeholder text in paragraphs, sentences, or words with custom length.",
    icon: Type,
    category: "Generator",
    href: "/tools/lorem-ipsum",
  },
  {
    id: "jwt-debugger",
    name: "JWT Debugger",
    description:
      "Decode, verify, and inspect JSON Web Tokens. Signature validation runs fully offline.",
    icon: Shield,
    category: "Utilities",
    href: "/tools/jwt-debugger",
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description:
      "Generate v1, v4, and v5 UUIDs in bulk with formatting options.",
    icon: Shuffle,
    category: "Generator",
    href: "/tools/uuid-generator",
  },
  {
    id: "csv-viewer",
    name: "CSV Viewer",
    description:
      "Paste or upload a CSV file and browse it as a sortable, filterable table.",
    icon: FileText,
    category: "Preview",
    href: "/tools/csv-viewer",
  },
  {
    id: "binary-converter",
    name: "Binary Converter",
    description:
      "Encode text to binary and decode binary strings back to plain text.",
    icon: Binary,
    category: "Encoding",
    href: "/tools/binary-converter",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description:
      "Test regular expressions with live match highlighting, group captures, and flag toggles.",
    icon: Regex,
    category: "Utilities",
    href: "/tools/regex-tester",
  },
  {
    id: "ip-lookup",
    name: "IP Lookup",
    description:
      "Look up geolocation, ISP, and network info for any IPv4 or IPv6 address.",
    icon: Network,
    category: "Utilities",
    href: "/tools/ip-lookup",
  },
  {
    id: "minifier",
    name: "Code Minifier",
    description:
      "Minify HTML, CSS, and JavaScript to reduce file size for production.",
    icon: Minimize2,
    category: "Utilities",
    href: "/tools/minifier",
  },
  {
    id: "side-by-side",
    name: "Side-by-Side View",
    description:
      "Open two tools simultaneously in a resizable split-pane layout.",
    icon: Columns,
    category: "Utilities",
    href: "/tools/side-by-side",
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