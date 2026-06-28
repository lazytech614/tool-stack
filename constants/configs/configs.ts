import { 
  Blocks,
  BookMarked, 
  BookOpen, 
  Bot, 
  Box, 
  Brush, 
  Code2, 
  DatabaseZap, 
  FileCode2, 
  FileText, 
  FolderGit2, 
  GraduationCap, 
  Image, 
  Laptop, 
  Layers, 
  MonitorSmartphone, 
  Package, 
  Palette, 
  Search, 
  Sparkles,
  Terminal,
  Wrench
} from "lucide-react";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools" },
];

export const LEGAL = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

export const LEARNING = [
  {
    label: "Snippets",
    href: "/snippets",
    category: "reference",
    icon: Code2,
    description: "Copy-paste code patterns for everyday tasks",
  },
  {
    label: "Cheatsheets",
    href: "/cheatsheets",
    category: "reference",
    icon: FileText,
    description: "Quick syntax references for your favourite languages",
  },
  {
    label: "Glossary",
    href: "/glossary",
    category: "reference",
    icon: Search,
    description: "Plain-English definitions for dev terminology",
  },
  {
    label: "Docs",
    href: "/docs",
    category: "guides",
    icon: BookMarked,
    description: "Full API and integration documentation",
  },
  {
    label: "Tutorials",
    href: "/tutorials",
    category: "guides",
    icon: GraduationCap,
    description: "Step-by-step walkthroughs for common workflows",
  },
  {
    label: "Examples",
    href: "/examples",
    category: "guides",
    icon: Layers,
    description: "Real-world projects you can fork and extend",
  },
];

export const LEARNING_CATEGORIES = [
  {
    key: "reference",
    title: "Reference",
    icon: BookOpen,
  },
  {
    key: "guides",
    title: "Guides",
    icon: GraduationCap,
  }
] as const;

export const RESOURCES = [
  // ─── Open Source ─────────────────────────────────────────────
  {
    label: "Templates",
    href: "/resources/templates",
    category: "open-source",
    icon: FileCode2,
    description: "Production-ready project templates for popular frameworks",
  },
  {
    label: "Boilerplates",
    href: "/resources/boilerplates",
    category: "open-source",
    icon: Blocks,
    description: "Kickstart projects with scalable boilerplate codebases",
  },
  {
    label: "Starter Kits",
    href: "/resources/starter-kits",
    category: "open-source",
    icon: Package,
    description: "Complete starter kits with authentication, database and more",
  },

  // ─── Developer Tools ─────────────────────────────────────────
  {
    label: "VS Code Extensions",
    href: "/resources/vscode-extensions",
    category: "developer-tools",
    icon: Laptop,
    description: "Essential extensions to boost your development workflow",
  },
  {
    label: "Browser Extensions",
    href: "/resources/browser-extensions",
    category: "developer-tools",
    icon: MonitorSmartphone,
    description: "Useful browser extensions for debugging and productivity",
  },
  {
    label: "CLI Tools",
    href: "/resources/cli-tools",
    category: "developer-tools",
    icon: Terminal,
    description: "Powerful command-line utilities used by modern developers",
  },

  // ─── Assets ──────────────────────────────────────────────────
  {
    label: "Icons",
    href: "/resources/icons",
    category: "assets",
    icon: Brush,
    description: "High-quality icon libraries for modern applications",
  },
  {
    label: "Fonts",
    href: "/resources/fonts",
    category: "assets",
    icon: Palette,
    description: "Beautiful typography collections for web and mobile apps",
  },
  {
    label: "Illustrations",
    href: "/resources/illustrations",
    category: "assets",
    icon: Box,
    description: "Free and premium illustration libraries for every project",
  },
  {
    label: "Color Palettes",
    href: "/resources/colors",
    category: "assets",
    icon: Palette,
    description: "Curated color palettes and design inspiration",
  },

  // ─── AI ──────────────────────────────────────────────────────
  {
    label: "AI Tools",
    href: "/resources/ai-tools",
    category: "ai",
    icon: Bot,
    description: "Popular AI tools that help developers build faster",
  },
  {
    label: "Prompt Library",
    href: "/resources/prompts",
    category: "ai",
    icon: Sparkles,
    description: "Ready-to-use prompts for coding, debugging and learning",
  },
  {
    label: "MCP Servers",
    href: "/resources/mcp-servers",
    category: "ai",
    icon: DatabaseZap,
    description: "Model Context Protocol servers for AI-powered workflows",
  },
];

export const RESOURCE_CATEGORIES = [
  {
    key: "open-source",
    title: "Open Source",
    icon: FolderGit2,
  },
  {
    key: "developer-tools",
    title: "Developer Tools",
    icon: Wrench,
  },
  {
    key: "assets",
    title: "Assets",
    icon: Image,
  },
  {
    key: "ai",
    title: "AI",
    icon: Bot,
  },
] as const;