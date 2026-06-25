# Contributing to [ToolStack](https://tool-stack-kappa.vercel.app/)

First off, thanks for taking the time to contribute! 🎉

This document provides guidelines and instructions for contributing to our project.
Whether it's a bug report, feature request, or pull request, we appreciate your help!

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Creating a New Tool](#creating-a-new-tool)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Questions?](#questions)

## Code of Conduct

This project adheres to the [Contributor Covenant](./CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Report Bugs

**Before submitting a bug report:**
- Check the issue tracker (might already be reported)
- Try with the latest version
- Collect information:
  - Your OS and browser
  - Steps to reproduce the bug
  - What you expected vs. what actually happened
  - Screenshots or videos if applicable
  - Console errors if any

**How to submit:**
1. Open a new issue on GitHub
2. Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Fill in all requested information
4. Wait for response from maintainers

### ✨ Suggest Enhancements

**Before suggesting a feature:**
- Check if it already exists or is planned
- Explain why this feature would be useful
- Give specific examples of how it would work
- Consider if it fits the project scope

**How to submit:**
1. Open a new issue
2. Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Clearly describe the feature and its benefits
4. Include mockups or examples if applicable

### 📚 Improve Documentation

Help improve our docs by:
- Fixing typos and grammar
- Clarifying confusing sections
- Adding examples and tutorials
- Creating guides for common tasks
- Translating to other languages

### 🔧 Write Code

We're always looking for help with:
- New tools and utilities
- Bug fixes
- Performance improvements
- Test coverage
- Type safety improvements

## Development Setup

### Prerequisites

- Node.js 18+ (check with `node --version`)
- npm (comes with Node.js)
- Git
- Code editor (VS Code recommended)

### Clone & Setup

```bash
# 1. Fork the repository (click Fork on GitHub)
# 2. Clone your fork
git clone https://github.com/lazytech614/tool-stack
cd tool-stack

# 3. Add upstream remote
git remote add upstream https://github.com/lazytech614/tool-stack

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Common Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Check code style
npm run format     # Format code
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
```

### Project Structure

```
src/
├── components/
│   ├── tools/        # Individual tool components
│   ├── ui/          # shadcn UI components
│   └── shared/      # Reusable shared components
├── lib/
│   ├── utils.ts     # Utility functions
│   └── tools.ts     # Tool registry
├── app/
│   ├── page.tsx     # Home page
│   └── layout.tsx   # Root layout
├── styles/
│   └── globals.css  # Global styles
└── types/
    └── index.ts     # TypeScript types
```

## Creating a New Tool

### Step 1: Create Component

Create a new file: `src/components/tools/dev-tools/your-tool.tsx`

```typescript
"use client"

import { useState, useMemo } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  // Add props if needed
}

export function YourToolComponent() {
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState(false)

  // Your logic here

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Your Tool Name
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Brief description of what it does
        </p>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          rows={4}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
      </div>

      {/* Output Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Output
          </label>
          <button
            onClick={() => copyToClipboard(output)}
            className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>
        </div>
        <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-sm min-h-24">
          {output || "Output will appear here"}
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Register Tool

Edit `constants/tools.ts`:

##### Before adding/registering the tool please check if the tool is already added in the list

```typescript
export const ALL_TOOLS: Tool[] = [
  // Existing tools
  {
    id: "commit-generator",
    name: "Commit Generator",
    description:
      "Generate different commit messages from your git diff.",
    icon: GitCommitIcon,
    category: "Github",
    href: "/tools/commit-generator",
    status: "BETA"
  },
]
```

### Step 3: Add routes

Edit `components/tools/tool-view.tsx`:

```typescript
import { YourToolComponent } from "./dev-tools/your-tool"

interface ToolViewProps {
  toolId: string
}

export function ToolView({ toolId }: ToolViewProps) {
  switch (toolId) {
    case "diff-checker":
      return <DiffCheckerTool />
    case "base64-url":
      return <Base64UrlTool />
    case "json-formatter-validator":
      return <JsonFormatterValidator />
    case "commit-generator":
      return <CommitGenerator />
    case "your-tool":
      return <YourToolComponent />
    // Add new tools here as you build them out
    default:
      return <PlaceholderTool toolId={toolId} />
  }
}
```
## Pull Request Process

### Before You Start

1. Create an issue first (discuss major changes)
2. Get approval from maintainers
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. Keep commits atomic and well-described:
   ```bash
   git commit -m "Add new tool: Your Tool Name"
   ```

2. Follow the style guide (see below)

3. Add tests for new functionality

4. Update documentation

5. Keep your branch updated:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Submitting the PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub

3. Fill out the PR template with:
   - Clear title: `Add feature: Description` or `Fix: Description`
   - Link to related issue: `Fixes #123`
   - Description of changes
   - Testing done
   - Screenshots (if UI changes)

4. Wait for reviews and respond to feedback

### Merge Criteria

Your PR will be merged when:
- ✅ All tests pass
- ✅ At least 1 maintainer approves
- ✅ No merge conflicts
- ✅ Documentation updated
- ✅ Code follows style guide

## Style Guide

### TypeScript

```typescript
// Use explicit types
const value: string = "hello"

// Avoid `any`
const data: MyType = getData() // ✅
const data: any = getData()    // ❌

// Use proper naming
const getUserName() ✅
const getUN()        ❌

// Add JSDoc for complex functions
/**
 * Converts text to uppercase
 * @param text - The input text
 * @returns The uppercase text
 */
function toUpperCase(text: string): string {
  return text.toUpperCase()
}
```

### React Components

```typescript
// File per component (one per file)
// export function ComponentName() { }

// Use hooks properly
const [state, setState] = useState("")
const memoized = useMemo(() => expensive(), [deps])
const { data } = useData()

// Proper naming
function MyComponent() ✅
function myComponent() ❌

// Props interface
interface MyComponentProps {
  title: string
  count?: number // Optional
  onClick: () => void
}

export function MyComponent({ title, count, onClick }: MyComponentProps) {
  return <div onClick={onClick}>{title}</div>
}
```

### Styling with Tailwind

```typescript
// Use consistent spacing
className="flex gap-4 p-4 rounded-xl"

// Keep classes organized
className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "gap-4 p-4",
  // Styling
  "rounded-xl border border-zinc-200 bg-zinc-50",
  // Responsive
  "md:grid-cols-2",
  // Conditional
  condition && "bg-red-50"
)}

// Avoid inline styles
<div className="...">✅</div>
<div style={{...}}>❌</div>
```

### Theme Color Preference (Strictly follow this)

Check constans/theme-color-prefernces.ts

### Comments

```typescript
// Good: Explains WHY, not WHAT
// Cache results because computing is expensive
const cached = useMemo(() => compute(), [deps])

// Bad: Obvious from code
// Set state to empty string
setState("")

// Use JSDoc for public APIs
/**
 * Converts markdown to HTML
 * @param markdown - Input markdown string
 * @returns Rendered HTML string
 */
```
---

**Happy contributing! We're excited to have you on the team! 🚀**