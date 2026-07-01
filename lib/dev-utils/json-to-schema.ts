import { InferOptions } from "@/components/tools/dev-tools/generator/json-to-schema";
import { SchemaDraft } from "@/types/dev-tools/json-to-schema";

interface SchemaStats {
  objects: number;
  arrays: number;
  properties: number;
  maxDepth: number;
  schemaSize: number;
  draft: SchemaDraft;
}

// ---------------------------------------------------------------------------
// Format detectors
// ---------------------------------------------------------------------------
const FORMAT_PATTERNS: [string, RegExp][] = [
  ["date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/],
  ["date", /^\d{4}-\d{2}-\d{2}$/],
  ["time", /^\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?$/],
  ["uuid", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i],
  ["email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/],
  ["uri", /^https?:\/\/.+/],
  ["ipv4", /^(\d{1,3}\.){3}\d{1,3}$/],
  ["ipv6", /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i],
  ["hostname", /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i],
];

function detectFormat(val: string): string | null {
  for (const [fmt, re] of FORMAT_PATTERNS) {
    if (re.test(val)) return fmt;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core inference engine
// ---------------------------------------------------------------------------
export function inferSchema(
  value: unknown,
  opts: InferOptions,
  depth = 0,
): Record<string, unknown> {
  // null
  if (value === null) {
    return opts.nullable ? { type: ["string", "null"] } : { type: "null" };
  }

  // boolean
  if (typeof value === "boolean") {
    const s: Record<string, unknown> = { type: "boolean" };
    if (opts.inferEnums) s.enum = [value];
    return s;
  }

  // number / integer
  if (typeof value === "number") {
    const type = Number.isInteger(value) ? "integer" : "number";
    return { type };
  }

  // string
  if (typeof value === "string") {
    const s: Record<string, unknown> = { type: "string" };
    if (opts.inferFormats) {
      const fmt = detectFormat(value);
      if (fmt) s.format = fmt;
    }
    if (opts.inferEnums && !s.format) s.enum = [value];
    return s;
  }

  // array
  if (Array.isArray(value)) {
    const s: Record<string, unknown> = { type: "array" };
    if (value.length === 0) {
      s.items = {};
      return s;
    }

    // infer each item's schema
    const itemSchemas = value.map((item) => inferSchema(item, opts, depth + 1));

    // Check if all items have the same type
    const types = [...new Set(itemSchemas.map((sc) => sc.type as string))];
    if (types.length === 1) {
      // Homogeneous — merge object schemas if needed
      if (types[0] === "object") {
        s.items = mergeObjectSchemas(itemSchemas, opts);
      } else {
        s.items = itemSchemas[0];
      }
    } else {
      // Mixed — anyOf
      const unique = dedupeSchemas(itemSchemas);
      s.items = unique.length === 1 ? unique[0] : { anyOf: unique };
    }
    return s;
  }

  // object
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    const properties: Record<string, unknown> = {};

    for (const key of keys) {
      properties[key] = inferSchema(obj[key], opts, depth + 1);
    }

    const s: Record<string, unknown> = { type: "object", properties };
    if (opts.required && keys.length > 0) s.required = keys;
    return s;
  }

  return {};
}

function mergeObjectSchemas(
  schemas: Record<string, unknown>[],
  opts: InferOptions,
): Record<string, unknown> {
  const allKeys = new Set<string>();
  for (const sc of schemas) {
    const props = sc.properties as Record<string, unknown> | undefined;
    if (props) Object.keys(props).forEach((k) => allKeys.add(k));
  }

  const merged: Record<string, unknown> = {};
  for (const key of allKeys) {
    const values = schemas
      .map((sc) => (sc.properties as Record<string, unknown>)?.[key])
      .filter((v) => v !== undefined);
    if (values.length === 1) {
      merged[key] = values[0];
    } else {
      const types = [...new Set(values.map((v) => (v as Record<string, unknown>).type as string))];
      if (types.length === 1) {
        merged[key] = values[0];
      } else {
        merged[key] = { anyOf: dedupeSchemas(values as Record<string, unknown>[]) };
      }
    }
  }

  const result: Record<string, unknown> = { type: "object", properties: merged };
  if (opts.required && allKeys.size > 0) result.required = [...allKeys];
  return result;
}

function dedupeSchemas(schemas: Record<string, unknown>[]): Record<string, unknown>[] {
  const seen = new Set<string>();
  return schemas.filter((s) => {
    const key = JSON.stringify(s);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function wrapWithDraft(
  schema: Record<string, unknown>,
  draft: SchemaDraft,
): Record<string, unknown> {
  const uris: Record<SchemaDraft, string> = {
    "draft-07": "http://json-schema.org/draft-07/schema#",
    "draft-2019-09": "https://json-schema.org/draft/2019-09/schema",
    "draft-2020-12": "https://json-schema.org/draft/2020-12/schema",
  };
  return { $schema: uris[draft], ...schema };
}

// ---------------------------------------------------------------------------
// Stats collector
// ---------------------------------------------------------------------------
export function collectStats(schema: Record<string, unknown>, draft: SchemaDraft): SchemaStats {
  let objects = 0,
    arrays = 0,
    properties = 0,
    maxDepth = 0;

  function walk(node: unknown, depth: number) {
    if (!node || typeof node !== "object") return;
    maxDepth = Math.max(maxDepth, depth);

    const n = node as Record<string, unknown>;
    if (n.type === "object") {
      objects++;
      const props = n.properties as Record<string, unknown> | undefined;
      if (props) {
        properties += Object.keys(props).length;
        Object.values(props).forEach((v) => walk(v, depth + 1));
      }
    }
    if (n.type === "array") {
      arrays++;
      if (n.items) walk(n.items, depth + 1);
    }
    if (Array.isArray(n.anyOf)) n.anyOf.forEach((v) => walk(v, depth + 1));
  }

  walk(schema, 0);
  return {
    objects,
    arrays,
    properties,
    maxDepth,
    schemaSize: JSON.stringify(schema).length,
    draft,
  };
}

// ---------------------------------------------------------------------------
// JSON validation with line-level error
// ---------------------------------------------------------------------------
export function validateJSON(input: string): { valid: boolean; error?: string; line?: number } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const msg = (e as Error).message;
    const lineMatch = msg.match(/line (\d+)/i) || msg.match(/position (\d+)/i);
    if (lineMatch) {
      // Try to derive line from position
      const pos = parseInt(lineMatch[1]);
      if (msg.includes("position")) {
        const line = input.slice(0, pos).split("\n").length;
        return { valid: false, error: msg, line };
      }
      return { valid: false, error: msg, line: parseInt(lineMatch[1]) };
    }
    return { valid: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Syntax highlighting for JSON/schema output
// ---------------------------------------------------------------------------
export function highlightJSON(json: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return json
    .split("\n")
    .map((line) => {
      return line.replace(
        /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (_, key, str, kw, num) => {
          if (key) return `<span class="jk">${esc(key)}</span>:`;
          if (str) return `<span class="js">${esc(str)}</span>`;
          if (kw) return `<span class="jb">${esc(kw)}</span>`;
          if (num) return `<span class="jn">${esc(num)}</span>`;
          return _;
        },
      );
    })
    .join("\n");
}
