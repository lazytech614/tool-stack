import { RegexTemplate } from "@/components/tools/dev-tools/regex-tester";

export const SAMPLE_DIFF = `
diff --git a/src/auth.ts b/src/auth.ts

+ import { ClerkProvider } from "@clerk/nextjs";

+ export async function login() {
+   console.log("logged in");
+ }

- export async function loginOld() {}
`;

export const EXAMPLE_URL = "https://githubhelper.dev/tools/base64-url?source=homepage&theme=dark";

export const EXAMPLE_ORIGINAL = `function greet(name) {
  return "Hello " + name;
}

console.log(greet("John"));
`;

export const EXAMPLE_MODIFIED = `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("John"));
console.log("Welcome to GitHub Helper");
`;


export const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

export const REGEX_TEMPLATES: RegexTemplate[] = [
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
    name: "Phone Number (India)",
    description: "Matches Indian phone numbers with optional +91 or 0 prefix",
    pattern: "(?:\\+91|0)?[\\s-]?[6-9][0-9]{9}",
    flags: ["g"],
    category: "Validation",
    example: "Call +91 98765 43210 or 09876543210 or 6789012345",
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

export const SAMPLE_JSON = `{
  "tool": "JSON Formatter",
  "version": "1.0.0",
  "features": ["format", "minify", "validate", "tree view"],
  "author": {
    "name": "GithubHelper",
    "url": "https://githubhelper.dev"
  },
  "active": true,
  "count": 42
}`;

export const SAMPLE_MARKDOWN = `# GitHub Helper Docs

Welcome to **GithubHelper** — AI-powered tools for your GitHub workflow.

## Features

- [x] Commit message generator
- [x] PR description writer
- [ ] Release notes *(coming soon)*
- [ ] README generator *(coming soon)*

## Supported Languages

| Language   | Commit Gen | PR Desc | Release Notes |
|------------|:----------:|:-------:|:-------------:|
| TypeScript | ✅         | ✅      | 🔜            |
| Python     | ✅         | ✅      | 🔜            |
| Rust       | ✅         | ⚠️      | 🔜            |
| Go         | ✅         | ✅      | 🔜            |

## Quick Start

\`\`\`bash
# Install the CLI
npm install -g githubhelper

# Generate a commit message from staged changes
gh-helper commit
\`\`\`

## Architecture

\`\`\`mermaid
graph TD
    A[Git Diff] --> B[GithubHelper AI]
    B --> C{Output Type}
    C -->|commit| D[Commit Message]
    C -->|pr| E[PR Description]
    C -->|release| F[Release Notes]
\`\`\`

## Example Commit

\`\`\`typescript
const message = await generateCommit({
  diff: gitDiff,
  style: "conventional",
});
// → "feat(auth): add OAuth2 provider support"
\`\`\`

> **Note:** GithubHelper respects your \`.gitignore\` and never sends sensitive files to the AI.

---

Made with ❤️ by [GithubHelper](https://githubhelper.dev)
`;

export const SAMPLE_TEXT = "Hello World!"