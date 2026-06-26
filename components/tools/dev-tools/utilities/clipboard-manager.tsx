"use client";

import { useState, useEffect, useCallback, useRef, FC, ReactNode } from "react";
import {
  DEFAULT_CATEGORIES,
  createSnippet,
  updateSnippet,
  searchSnippets,
  copyToClipboard,
  parseTags,
  loadSnippets,
  saveSnippets,
  loadCustomCategories,
  saveCustomCategories,
  type Snippet,
  type SnippetInput,
  type SnippetUpdate,
  type Category,
} from "@/lib/dev-utils/clipboard-manager";
import { Copy } from "lucide-react";
import { toast } from "sonner";

// ─── Icon ─────────────────────────────────────────────────────────────────────

interface IconProps {
  d: string;
  size?: number;
  className?: string;
}

const Icon: FC<IconProps> = ({ d, size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

type IconKey =
  | "pin"
  | "copy"
  | "edit"
  | "trash"
  | "check"
  | "search"
  | "plus"
  | "x"
  | "clipboard";

const ICONS: Record<IconKey, string> = {
  pin: "M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z",
  copy: "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2M8 4a2 2 0 012-2h4a2 2 0 012 2M8 4h8",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  check: "M20 6L9 17l-5-5",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  clipboard:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
};

// ─── ActionBtn ────────────────────────────────────────────────────────────────

interface ActionBtnProps {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}

const ActionBtn: FC<ActionBtnProps> = ({
  title,
  onClick,
  danger = false,
  children,
}) => (
  <button
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg transition-colors ${
      danger
        ? "text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
    }`}
  >
    {children}
  </button>
);

// ─── SnippetForm ──────────────────────────────────────────────────────────────

interface SnippetFormProps {
  initial: Snippet | null;
  categories: Category[];
  onSave: (data: SnippetInput) => void;
  onCancel: () => void;
}

const SnippetForm: FC<SnippetFormProps> = ({
  initial,
  categories,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState<string>(initial?.title ?? "");
  const [content, setContent] = useState<string>(initial?.content ?? "");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? categories[0] ?? "Other"
  );
  const [tagsRaw, setTagsRaw] = useState<string>(
    initial?.tags?.join(" ") ?? ""
  );
  const [customCat, setCustomCat] = useState<string>("");
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const resolvedCategory: Category = showCustom
    ? customCat.trim() || "Other"
    : category;

  const valid: boolean =
    title.trim().length > 0 && content.trim().length > 0;

  function handleSave(): void {
    if (!valid) return;
    onSave({
      title,
      content,
      category: resolvedCategory,
      tags: parseTags(tagsRaw),
    });
  }

  const fieldClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-widest text-zinc-900 dark:text-zinc-500">
        {initial ? "Edit snippet" : "New snippet"}
      </h3>

      <div className="space-y-3">
        {/* Title — non-mono */}
        <input
          ref={titleRef}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={`${fieldClass} resize-y`}
          placeholder="Content"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Category row */}
        <div className="flex gap-2">
          {!showCustom ? (
            <select
              className={`${fieldClass} flex-1`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={`${fieldClass} flex-1`}
              placeholder="New category name"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
            />
          )}
          <button
            onClick={() => setShowCustom((v) => !v)}
            className={`shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showCustom
                ? "border-purple-400 dark:border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-300 dark:hover:border-purple-500/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {showCustom ? "Cancel" : "+ Custom"}
          </button>
        </div>

        {/* Tags */}
        <input
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors"
          placeholder="Tags (space or comma separated)"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!valid}
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
            valid
              ? "bg-linear-to-r from-purple-600 to-violet-600 text-white border-transparent hover:opacity-90"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
          }`}
        >
          Save snippet
        </button>
      </div>
    </div>
  );
};

// ─── DeleteDialog ─────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  snippet: Snippet;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteDialog: FC<DeleteDialogProps> = ({ snippet, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.5)" }}
  >
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 w-full max-w-sm shadow-2xl">
      <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-1">
        Delete snippet?
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
        <span className="font-medium text-zinc-900 dark:text-zinc-200">
          {snippet.title}
        </span>{" "}
        will be permanently removed.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-full text-xs font-medium bg-red-500 hover:bg-red-600 text-white border-transparent transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── SnippetCard ──────────────────────────────────────────────────────────────

interface SnippetCardProps {
  snippet: Snippet;
  onCopy: (snippet: Snippet) => void;
  onPin: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
  copied: boolean;
}

const SnippetCard: FC<SnippetCardProps> = ({
  snippet,
  onCopy,
  onPin,
  onEdit,
  onDelete,
  copied,
}) => (
  <div
    className={`group flex flex-col rounded-xl border bg-white dark:bg-zinc-950 p-4 transition-all ${
      snippet.pinned
        ? "border-purple-300 dark:border-purple-500/40"
        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
    }`}
  >
    {/* Card header */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        {snippet.pinned && (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            Pinned
          </span>
        )}
        <h3 className="font-semibold text-sm truncate text-zinc-900 dark:text-white">
          {snippet.title}
        </h3>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <ActionBtn
          title={snippet.pinned ? "Unpin" : "Pin"}
          onClick={() => onPin(snippet.id)}
        >
          <Icon
            d={ICONS.pin}
            size={13}
            className={
              snippet.pinned ? "text-purple-500 dark:text-purple-400" : ""
            }
          />
        </ActionBtn>
        <ActionBtn title="Edit" onClick={() => onEdit(snippet)}>
          <Icon d={ICONS.edit} size={13} />
        </ActionBtn>
        <ActionBtn title="Delete" onClick={() => onDelete(snippet)} danger>
          <Icon d={ICONS.trash} size={13} />
        </ActionBtn>
      </div>
    </div>

    {/* Content preview */}
    <pre className="flex-1 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 mb-3 overflow-x-auto whitespace-pre-wrap break-all max-h-28 overflow-y-auto text-zinc-700 dark:text-zinc-300">
      {snippet.content}
    </pre>

    {/* Card footer */}
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {/* Category + tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
          {snippet.category}
        </span>
        {snippet.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
          >
            {t}
          </span>
        ))}
        {snippet.tags.length > 2 && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            +{snippet.tags.length - 2}
          </span>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={() => onCopy(snippet)}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          copied
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        <Copy className="w-3 h-3" />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  </div>
);

// ─── ClipboardManager ─────────────────────────────────────────────────────────

const ClipboardManager: FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>(() => loadSnippets());
  const [customCategories, setCustomCategories] = useState<string[]>(() =>
    loadCustomCategories()
  );
  const [query, setQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Snippet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Snippet | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allCategories: Category[] = [
    "All",
    ...DEFAULT_CATEGORIES,
    ...customCategories,
  ];

  // Persist
  useEffect(() => { saveSnippets(snippets); }, [snippets]);
  useEffect(() => { saveCustomCategories(customCategories); }, [customCategories]);

  const visible: Snippet[] = searchSnippets(
    snippets,
    query,
    activeCategory === "All" ? null : activeCategory
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSave(data: SnippetInput): void {
    const { category = "Other" } = data;

    if (
      category !== "Other" &&
      !DEFAULT_CATEGORIES.includes(category as never) &&
      !customCategories.includes(category)
    ) {
      setCustomCategories((prev) => [...prev, category]);
    }

    if (editTarget) {
      const patch: SnippetUpdate = {
        title: data.title,
        content: data.content,
        category,
        tags: data.tags,
      };
      setSnippets((prev) =>
        prev.map((s) => (s.id === editTarget.id ? updateSnippet(s, patch) : s))
      );
      setEditTarget(null);
    } else {
      setSnippets((prev) => [createSnippet(data), ...prev]);
      setShowForm(false);
    }
  }

  const handleCopy = useCallback(async (snippet: Snippet): Promise<void> => {
    try {
      await copyToClipboard(snippet.content);
      setCopiedId(snippet.id);
      toast.success("Copied successfully to clipboard");
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* noop */ }
  }, []);

  function handlePin(id: string): void {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  }

  function handleDelete(): void {
    if (!deleteTarget) return;
    setSnippets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const pinnedCount: number = snippets.filter((s) => s.pinned).length;
  const isFormOpen: boolean = showForm || editTarget !== null;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top bar: search + new button ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Icon
            d={ICONS.search}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none"
          />
          <input
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-9 pr-9 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors"
            placeholder="Search snippets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Icon d={ICONS.x} size={13} />
            </button>
          )}
        </div>

        {/* New snippet button */}
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium bg-linear-to-r from-purple-600 to-violet-600 text-white border-transparent hover:opacity-90 transition-opacity shrink-0"
        >
          <Icon d={ICONS.plus} size={14} />
          New snippet
        </button>
      </div>

      {/* ── Category filter chips ── */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${
              cat === activeCategory
                ? "bg-linear-to-r from-purple-600 to-violet-600 text-white border-transparent"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-300 dark:hover:border-purple-500/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {cat}
            <span
              className={`ml-1.5 text-xs ${
                cat === activeCategory
                  ? "opacity-70"
                  : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              {cat === "All"
                ? snippets.length
                : snippets.filter((s) => s.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Inline form ── */}
      {isFormOpen && (
        <SnippetForm
          initial={editTarget}
          categories={[...DEFAULT_CATEGORIES, ...customCategories]}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {/* ── Snippet grid ── */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((s) => (
            <SnippetCard
              key={s.id}
              snippet={s}
              copied={copiedId === s.id}
              onCopy={handleCopy}
              onPin={handlePin}
              onEdit={(snippet) => { setShowForm(false); setEditTarget(snippet); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : !isFormOpen ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 dark:text-zinc-600">
          <Icon d={ICONS.clipboard} size={36} />
          <p className="text-sm font-medium">
            {query ? "No snippets match your search." : "No snippets yet."}
          </p>
          {!query && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline underline-offset-2 transition-colors"
            >
              Add your first snippet
            </button>
          )}
        </div>
      ) : null}

      {/* ── Stats bar (shown when snippets exist) ── */}
      {snippets.length > 0 && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
          {snippets.length} snippet{snippets.length !== 1 ? "s" : ""}
          {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
          {query && visible.length !== snippets.length && ` · ${visible.length} shown`}
        </p>
      )}

      {/* ── Delete dialog ── */}
      {deleteTarget && (
        <DeleteDialog
          snippet={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ClipboardManager;