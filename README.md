<div align="center">

# 🛠️ Tool Stack

**A modern collection of developer utilities built for speed, simplicity, and productivity.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://tool-stack-kappa.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[🌐 Live Demo](https://tool-stack-kappa.vercel.app/) · [🐛 Report a Bug](https://github.com/lazytech614/tool-stack/issues) · [✨ Request a Feature](https://github.com/lazytech614/tool-stack/issues)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architechture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Available Tools](#️-available-tools)
- [Future Vision](#-vision)
- [Roadmap](#️-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🚀 About the Project

**Tool Stack** is an all-in-one developer utility platform that brings together commonly needed tools under one roof. Whether you're debugging a JWT, testing a regex pattern, encoding a payload, or generating a meaningful Git commit message — Tool Stack has you covered.

Built with the latest versions of Next.js, TypeScript, and Tailwind CSS v4, the app prioritizes performance and a clean developer experience. It integrates Google Gemini AI to power intelligent features like commit message generation, and Upstash Redis for rate limiting to ensure fair usage.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="./public/screenshots/home.png" alt="Home Page" width="100%"/>
      <br/>
      <sub><b>🏠 Home Page</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/commit-generator.png" alt="Commit Generator" width="100%"/>
      <br/>
      <sub><b>📝 Commit Generator</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./public/screenshots/diff-checker.png" alt="Diff Checker" width="100%"/>
      <br/>
      <sub><b>🔍 Diff Checker</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/regex-tester.png" alt="Regex Tester" width="100%"/>
      <br/>
      <sub><b>🔤 Regex Tester</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./public/screenshots/jwt-debugger.png" alt="JWT Debugger" width="100%"/>
      <br/>
      <sub><b>🔐 JWT Debugger</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/number-base-converter.png" alt="Number Base Converter" width="100%"/>
      <br/>
      <sub><b>🔁 Number Base Converter</b></sub>
    </td>
  </tr>
</table>

---

## ✨ Features

### 🐙 GitHub Tools
| Tool | Description |
|------|-------------|
| **Commit Generator** | AI-powered commit message generator using Google Gemini. Paste your diff and get a well-structured, conventional commit message instantly. |
| **Diff Checker** | Side-by-side or inline comparison of two code blocks with syntax highlighting powered by Shiki. |

### 🧰 Developer Utilities
| Tool | Description |
|------|-------------|
| **Regex Tester** | Write and test regular expressions in real time with match highlighting and group capture display. |
| **JWT Debugger** | Decode and inspect JSON Web Tokens — view header, payload, and signature at a glance. |
| **Base64 / URL Encoder-Decoder** | Instantly encode or decode Base64 and URL-encoded strings. |

### 🌙 Other Highlights
- **Dark / Light mode** toggle powered by `next-themes`
- **Rate limiting** on AI-powered routes via Upstash Redis
- **Syntax highlighting** via Shiki
- **Smooth animations** with Framer Motion
- **Accessible UI components** from shadcn/ui and Radix UI
- **Toast notifications** via Sonner

---

## 🧱 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) |
| **AI** | [Google Gemini API](https://ai.google.dev/) (`@google/genai`) |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) |
| **Syntax Highlighting** | [Shiki](https://shiki.matsu.io/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🏗 Architecture

ToolStack is organized into independent modules.

app/
components/
constants/
hooks/
lib/

Each feature lives in its own directory, making it easy to contribute without understanding the entire codebase.

---

## 📁 Project Structure

```
## 📁 Project Structure

```text
tool-stack/
├── .github/                     # GitHub workflows, issue templates & configs
│
├── app/                         # Next.js App Router
│   ├── api/                     # API routes
│   ├── tools/                   # Developer utility tools
│   ├── learn/                   # Learning resources
│   │   ├── cheatsheets/
│   │   ├── docs/
│   │   ├── glossary/
│   │   └── snippets/
│   ├── resources/               # Curated developer resources
│   │   ├── ai-tools/
│   │   ├── boilerplates/
│   │   ├── browser-extensions/
│   │   ├── cli-tools/
│   │   ├── colors/
│   │   ├── fonts/
│   │   ├── icons/
│   │   ├── illustrations/
│   │   ├── mcp-servers/
│   │   ├── prompts/
│   │   ├── starter-kits/
│   │   ├── templates/
│   │   └── vscode-extensions/
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── tools/                   # Tool-specific components
│   ├── learn/                   # Learn section components
│   ├── resources/               # Resource cards & filters
│   ├── shared/                  # Shared reusable components
│   └── ui/                      # shadcn/ui components
│
├── constants/
│   ├── configs/                 # Utility metadata and project configs
│   ├── learnings/               # Cheatsheets, docs & snippets
│   ├── resources/               # Resource datasets
│   └── navigation.ts            # Navigation configuration
│
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions & helpers
├── providers/                   # Context providers
├── public/                      # Images, icons & static assets
├── styles/                      # Global styles
├── types/                       # Shared TypeScript types
│
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `>= 18.x`
- **npm** or **yarn** or **pnpm**
- A **Google Gemini API key** (for the Commit Generator)
- An **Upstash Redis** account (for rate limiting)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/lazytech614/tool-stack.git
cd tool-stack
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Then open `.env.local` and set the following:

```env
# Google Gemini API key for AI-powered commit generation
GEMINI_API_KEY=""

# Upstash Redis for rate limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `UPSTASH_REDIS_REST_URL` | [Upstash Console](https://console.upstash.com/) → your Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | [Upstash Console](https://console.upstash.com/) → your Redis database |

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Other available scripts:**

```bash
npm run build    # Build for production
npm run start    # Start the production server
npm run lint     # Run ESLint
```

---

## 🗺️ Available Tools

| Tool | Route | Status |
|------|--------|--------|
| Commit Generator | `/commit-generator` | ✅ Live |
| Diff Checker | `/diff-checker` | ✅ Live |
| Regex Tester | `/regex-tester` | ✅ Live |
| JWT Debugger | `/jwt-debugger` | ✅ Live |
| Base64 / URL Encoder-Decoder | `/base64-encoder` | ✅ Live |
| JSON Formatter | `/json-formatter` | ✅ Live |
| Markdown Preview | `/markdown-preview` | ✅ Live |
| SQL Formatter | `/sql-formatter` | ✅ Live |
| Hash Generator | `/hash-generator` | ✅ Live |
| UUID Generator | `/uuid-generator` | ✅ Live |
| URL Parser | `/url-parser` | 🚧 Coming Soon |
| CSV Viewer | `/csv-viewer` | 🚧 Coming Soon |
| Image Converter | `/image-converter` | ✅ Live |

---

## 🎯 Future Vision

ToolStack aims to become the largest open-source collection of:

- Developer tools
- Learning resources
- Cheatsheets
- Boilerplates
- Templates
- Starter Kits
- Browser Extensions
- VS Code Extensions
- CLI Tools

All in one place.

---

## 🗓️ Roadmap

- [x] Commit Generator (AI-powered)
- [x] Diff Checker
- [x] Regex Tester
- [x] JWT Debugger
- [x] Base64 / URL Encoder-Decoder
- [x] JSON Formatter
- [x] Markdown Preview
- [x] SQL Formatter
- [x] Hash Generator
- [x] UUID Generator
- [x] Image Converter
- [ ] URL Parser
- [ ] CSV Viewer

Have an idea for a new tool? [Open an issue](https://github.com/lazytech614/tool-stack/issues) and let us know!

---

## 🤝 Contributing

### 🌟 Ways to Contribute

There are many ways to contribute to ToolStack.

#### 💻 Development

- Add new developer tools
- Improve UI/UX
- Fix bugs
- Improve accessibility
- Optimize performance

#### 📚 Learning Resources

- Add cheatsheets
- Add snippets
- Improve documentation
- Expand glossary

#### 📦 Resource Collections

Help us build the largest curated collection of:

- Templates
- Boilerplates
- Starter Kits
- Browser Extensions
- VS Code Extensions
- CLI Tools

Most of these additions only require updating data files—perfect for first-time contributors.

Look for issues labeled:

- good first issue
- help wanted

---

### 🚀 First Time Contributing?

Never contributed to open source before?

We've got you covered.

1. Find an issue labeled `good first issue`
2. Ask to be assigned
3. Fork the repository
4. Make your changes
5. Open a Pull Request

We'll happily help you throughout the process.

---

Contributions are what make the open source community such a great place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) before submitting a pull request.

**Quick steps:**

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/lazytech614">lazytech614</a>
  <br/>
  <a href="https://tool-stack-kappa.vercel.app/">🌐 tool-stack-kappa.vercel.app</a>
</div>
