// clipboardUtils.ts — Clipboard Manager utilities

// ─── Types ────────────────────────────────────────────────────────────────────

export type DefaultCategory =
  "Git" | "SQL" | "Regex" | "JSON" | "API" | "Commands" | "Notes" | "Other";

export type Category = DefaultCategory | string;

export interface Snippet {
  id: string;
  title: string;
  content: string;
  category: Category;
  tags: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SnippetInput = Pick<Snippet, "title" | "content"> & {
  category?: Category;
  tags?: string[];
  pinned?: boolean;
};

export type SnippetUpdate = Partial<
  Pick<Snippet, "title" | "content" | "category" | "tags" | "pinned">
>;

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  "Git",
  "SQL",
  "Regex",
  "JSON",
  "API",
  "Commands",
  "Notes",
  "Other",
];

const STORAGE_KEY = "clipboard_manager_snippets";
const CUSTOM_CATS_KEY = "clipboard_manager_custom_categories";

// ─── Snippet helpers ──────────────────────────────────────────────────────────

export function generateId(): string {
  return `snippet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createSnippet({
  title,
  content,
  category = "Other",
  tags = [],
  pinned = false,
}: SnippetInput): Snippet {
  return {
    id: generateId(),
    title: title.trim(),
    content: content.trim(),
    category,
    tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    pinned,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function updateSnippet(snippet: Snippet, updates: SnippetUpdate): Snippet {
  return {
    ...snippet,
    ...updates,
    tags: updates.tags
      ? updates.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      : snippet.tags,
    updatedAt: Date.now(),
  };
}

/**
 * Filter snippets by query (title | content | tags) and active category,
 * then sort: pinned first, then by updatedAt desc.
 */
export function searchSnippets(
  snippets: Snippet[],
  query: string,
  activeCategory: Category | null,
): Snippet[] {
  const q = query.trim().toLowerCase();

  const results = snippets.filter((s) => {
    const matchesCategory =
      !activeCategory || activeCategory === "All" || s.category === activeCategory;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q))
    );
  });

  return results.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

// ─── Tag / category utilities ─────────────────────────────────────────────────

export function parseTags(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function getTagsFromSnippets(snippets: Snippet[]): string[] {
  const set = new Set<string>();
  snippets.forEach((s) => s.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}

export function getCategoriesFromSnippets(
  snippets: Snippet[],
  defaults: Category[] = DEFAULT_CATEGORIES,
): Category[] {
  const custom = snippets
    .map((s) => s.category)
    .filter((c): c is string => !!c && !defaults.includes(c));
  return [...new Set([...defaults, ...custom])];
}

// ─── LocalStorage ─────────────────────────────────────────────────────────────

export function loadSnippets(): Snippet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Snippet[]) : [];
  } catch {
    return [];
  }
}

export function saveSnippets(snippets: Snippet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  } catch {
    // silently fail if storage is unavailable
  }
}

export function loadCustomCategories(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomCategories(cats: string[]): void {
  try {
    localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(cats));
  } catch {
    // silently fail if storage is unavailable
  }
}
