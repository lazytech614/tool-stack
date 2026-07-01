// ---------------------------------------------------------------------------
// Word banks per preset
// ---------------------------------------------------------------------------

import {
  CapMode,
  DownloadFormat,
  GenerateMode,
  Preset,
  SentenceLength,
} from "@/types/dev-tools/loremipsum";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "perspiciatis",
  "unde",
  "omnis",
  "iste",
  "natus",
  "error",
  "accusantium",
  "doloremque",
  "laudantium",
  "totam",
  "rem",
  "aperiam",
  "eaque",
  "ipsa",
  "quae",
  "ab",
  "inventore",
  "veritatis",
  "quasi",
  "architecto",
  "beatae",
  "vitae",
  "dicta",
  "explicabo",
];

const DEVELOPER_WORDS = [
  "function",
  "component",
  "render",
  "state",
  "effect",
  "hook",
  "async",
  "await",
  "promise",
  "callback",
  "event",
  "listener",
  "handler",
  "dispatch",
  "reducer",
  "context",
  "provider",
  "consumer",
  "ref",
  "memo",
  "lazy",
  "suspense",
  "fallback",
  "router",
  "middleware",
  "interceptor",
  "schema",
  "model",
  "migration",
  "seed",
  "endpoint",
  "payload",
  "request",
  "response",
  "status",
  "header",
  "token",
  "auth",
  "cache",
  "queue",
  "worker",
  "thread",
  "process",
  "stream",
  "buffer",
  "chunk",
  "deploy",
  "build",
  "bundle",
  "minify",
  "transpile",
  "compile",
  "lint",
  "test",
  "mock",
  "stub",
  "fixture",
  "snapshot",
  "coverage",
  "pipeline",
  "CI",
  "CD",
  "container",
  "image",
  "volume",
  "network",
  "service",
  "pod",
  "cluster",
  "node",
];

const API_WORDS = [
  "endpoint",
  "resource",
  "method",
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "authentication",
  "authorization",
  "bearer",
  "token",
  "API",
  "key",
  "rate",
  "limit",
  "pagination",
  "cursor",
  "offset",
  "filter",
  "sort",
  "query",
  "parameter",
  "payload",
  "request",
  "response",
  "status",
  "code",
  "error",
  "message",
  "schema",
  "validation",
  "webhook",
  "callback",
  "event",
  "retry",
  "timeout",
  "idempotent",
  "versioning",
  "deprecation",
  "migration",
  "breaking",
  "change",
  "changelog",
  "spec",
  "swagger",
  "OpenAPI",
  "REST",
  "GraphQL",
  "grpc",
  "JSON",
  "XML",
  "serialization",
  "deserialization",
];

const BLOG_WORDS = [
  "readers",
  "explore",
  "discover",
  "insight",
  "guide",
  "tips",
  "tricks",
  "best",
  "practices",
  "tutorial",
  "walkthrough",
  "overview",
  "introduction",
  "deep",
  "dive",
  "comprehensive",
  "ultimate",
  "definitive",
  "essential",
  "practical",
  "actionable",
  "strategies",
  "lessons",
  "experience",
  "journey",
  "growth",
  "learning",
  "community",
  "content",
  "audience",
  "engagement",
  "traffic",
  "SEO",
  "keywords",
  "publish",
  "draft",
  "editor",
  "newsletter",
  "subscribe",
  "comment",
  "share",
  "social",
  "media",
  "viral",
  "trending",
  "niche",
  "authority",
  "credibility",
  "voice",
  "tone",
  "style",
];

const ECOMMERCE_WORDS = [
  "product",
  "price",
  "discount",
  "offer",
  "sale",
  "limited",
  "stock",
  "available",
  "shipping",
  "delivery",
  "returns",
  "refund",
  "warranty",
  "quality",
  "premium",
  "bestseller",
  "featured",
  "new",
  "arrival",
  "collection",
  "category",
  "brand",
  "review",
  "rating",
  "verified",
  "purchase",
  "checkout",
  "cart",
  "wishlist",
  "order",
  "tracking",
  "invoice",
  "receipt",
  "customer",
  "support",
  "satisfaction",
  "guarantee",
  "secure",
  "payment",
  "subscription",
  "bundle",
  "savings",
  "exclusive",
  "deal",
];

const SOCIAL_WORDS = [
  "follow",
  "like",
  "share",
  "comment",
  "repost",
  "trending",
  "viral",
  "hashtag",
  "story",
  "reel",
  "feed",
  "profile",
  "bio",
  "mention",
  "tag",
  "thread",
  "reply",
  "community",
  "engagement",
  "reach",
  "impressions",
  "analytics",
  "growth",
  "niche",
  "creator",
  "influencer",
  "audience",
  "followers",
  "subscribers",
  "content",
  "post",
  "caption",
  "filter",
  "aesthetic",
  "vibe",
  "moment",
  "behind",
  "scenes",
  "collab",
  "partnership",
  "sponsored",
  "authentic",
  "organic",
  "algorithm",
  "boost",
];

const PRODUCT_WORDS = [
  "innovative",
  "seamless",
  "intuitive",
  "powerful",
  "lightweight",
  "efficient",
  "scalable",
  "robust",
  "flexible",
  "customizable",
  "feature-rich",
  "user-friendly",
  "cutting-edge",
  "state-of-the-art",
  "next-generation",
  "best-in-class",
  "enterprise",
  "solution",
  "platform",
  "ecosystem",
  "workflow",
  "productivity",
  "collaboration",
  "integration",
  "automation",
  "intelligence",
  "insights",
  "analytics",
  "performance",
  "reliability",
  "security",
  "compliance",
  "support",
  "onboarding",
  "experience",
];

const ERROR_WORDS = [
  "unexpected",
  "error",
  "occurred",
  "failed",
  "unable",
  "process",
  "request",
  "invalid",
  "missing",
  "required",
  "field",
  "permission",
  "denied",
  "unauthorized",
  "forbidden",
  "not",
  "found",
  "timeout",
  "exceeded",
  "limit",
  "reached",
  "quota",
  "exhausted",
  "connection",
  "refused",
  "unavailable",
  "retry",
  "later",
  "conflict",
  "duplicate",
  "already",
  "exists",
  "validation",
  "constraint",
  "violation",
  "integrity",
  "check",
  "failed",
  "malformed",
  "corrupted",
  "deprecated",
  "unsupported",
  "version",
];

const RELEASE_WORDS = [
  "fixed",
  "improved",
  "updated",
  "added",
  "removed",
  "deprecated",
  "breaking",
  "change",
  "enhancement",
  "feature",
  "bug",
  "patch",
  "hotfix",
  "release",
  "version",
  "migration",
  "performance",
  "security",
  "vulnerability",
  "compatibility",
  "regression",
  "refactor",
  "optimization",
  "stability",
  "reliability",
  "accessibility",
  "documentation",
  "changelog",
  "upgrade",
  "downgrade",
  "rollback",
  "backport",
  "cherry-pick",
  "merge",
  "commit",
  "tag",
];

const PRESET_WORDS: Record<Preset, string[]> = {
  lorem: LOREM_WORDS,
  developer: DEVELOPER_WORDS,
  api: API_WORDS,
  blog: BLOG_WORDS,
  ecommerce: ECOMMERCE_WORDS,
  social: SOCIAL_WORDS,
  product: PRODUCT_WORDS,
  errors: ERROR_WORDS,
  release: RELEASE_WORDS,
};

export const PRESET_OPTIONS: { value: Preset; label: string }[] = [
  { value: "lorem", label: "Lorem Ipsum" },
  { value: "developer", label: "Developer Text" },
  { value: "api", label: "API Documentation" },
  { value: "blog", label: "Blog Content" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "social", label: "Social Media" },
  { value: "product", label: "Product Description" },
  { value: "errors", label: "Error Messages" },
  { value: "release", label: "Release Notes" },
];

const SENTENCE_LENGTH_RANGE: Record<SentenceLength, [number, number]> = {
  short: [4, 8],
  medium: [8, 15],
  long: [15, 25],
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

let seed = Date.now();
function rand(min: number, max: number): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return min + (Math.abs(seed) % (max - min + 1));
}

function pickWord(words: string[]): string {
  return words[rand(0, words.length - 1)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function applyCapMode(text: string, mode: CapMode): string {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "title") return text.replace(/\b\w/g, (c) => c.toUpperCase());
  return text; // sentence case already applied during generation
}

function makeSentence(
  words: string[],
  len: SentenceLength,
  startWithLorem: boolean,
  isFirst: boolean,
): string {
  const [min, max] = SENTENCE_LENGTH_RANGE[len];
  const count = rand(min, max);
  const parts: string[] = [];

  for (let i = 0; i < count; i++) {
    if (i === 0 && isFirst && startWithLorem && words === LOREM_WORDS) {
      parts.push("Lorem");
    } else if (i === 1 && isFirst && startWithLorem && words === LOREM_WORDS) {
      parts.push("ipsum");
    } else {
      parts.push(pickWord(words));
    }
  }

  return capitalize(parts.join(" ")) + ".";
}

function makeParagraph(
  words: string[],
  len: SentenceLength,
  startWithLorem: boolean,
  isFirst: boolean,
): string {
  const sentCount = rand(3, 6);
  const sentences: string[] = [];
  for (let i = 0; i < sentCount; i++) {
    sentences.push(makeSentence(words, len, startWithLorem, isFirst && i === 0));
  }
  return sentences.join(" ");
}

interface GenerateOptions {
  mode: GenerateMode;
  count: number;
  startWithLorem: boolean;
  sentenceLength: SentenceLength;
  capMode: CapMode;
  preset: Preset;
}

export function generate(opts: GenerateOptions): string {
  seed = Date.now() ^ (Math.random() * 0xffffffff);
  const words = PRESET_WORDS[opts.preset];
  const { mode, count, startWithLorem, sentenceLength, capMode } = opts;

  let result = "";

  if (mode === "words") {
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && startWithLorem && words === LOREM_WORDS) parts.push("Lorem");
      else if (i === 1 && startWithLorem && words === LOREM_WORDS) parts.push("ipsum");
      else parts.push(pickWord(words));
    }
    result = capitalize(parts.join(" ")) + ".";
  } else if (mode === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      sentences.push(makeSentence(words, sentenceLength, startWithLorem, i === 0));
    }
    result = sentences.join(" ");
  } else {
    const paras: string[] = [];
    for (let i = 0; i < count; i++) {
      paras.push(makeParagraph(words, sentenceLength, startWithLorem, i === 0));
    }
    result = paras.join("\n\n");
  }

  return applyCapMode(result, capMode);
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export function computeStats(text: string) {
  if (!text.trim()) return null;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  const sentences = (text.match(/[.!?]+/g) ?? []).length;
  const paragraphs = text.split(/\n\n+/).filter(Boolean).length;
  const avgWordsSentence = sentences ? Math.round(words / sentences) : 0;
  const avgSentencesPara = paragraphs ? Math.round(sentences / paragraphs) : 0;
  const readingTime = Math.max(1, Math.round(words / 200));
  return { words, chars, sentences, paragraphs, avgWordsSentence, avgSentencesPara, readingTime };
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------
export function downloadText(text: string, format: DownloadFormat) {
  let content = text;
  let mime = "text/plain";
  const ext = format;

  if (format === "md") {
    content = text
      .split("\n\n")
      .map((p) => p.trim())
      .join("\n\n");
    mime = "text/markdown";
  } else if (format === "html") {
    const paras = text
      .split("\n\n")
      .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
      .join("\n");
    content = `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Lorem Ipsum</title></head>\n<body>\n${paras}\n</body>\n</html>`;
    mime = "text/html";
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lorem.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
