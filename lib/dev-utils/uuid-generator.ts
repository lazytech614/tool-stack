import { FormatOption } from "@/types/dev-tools/uuid-generator";

// ── UUID generators ────────────────────────────────────────────────────────

export function generateV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xff) % 16;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateV1(): string {
  // Simulate v1 (time-based) using current timestamp + random node
  const now = Date.now();
  const timeHigh = Math.floor(now / 0x100000000);
  const timeLow = now & 0xffffffff;
  const rnd = crypto.getRandomValues(new Uint8Array(8));

  const toHex = (n: number, len: number) => n.toString(16).padStart(len, "0");
  const timeLowHex = toHex(timeLow, 8);
  const timeMidHex = toHex(timeHigh & 0xffff, 4);
  const timeHighHex = toHex(((timeHigh >> 16) & 0x0fff) | 0x1000, 4);
  const clockSeq = toHex(((rnd[0] & 0x3f) | 0x80) * 0x100 + rnd[1], 4);
  const node = Array.from(rnd.slice(2))
    .map((b) => toHex(b, 2))
    .join("");

  return `${timeLowHex}-${timeMidHex}-${timeHighHex}-${clockSeq}-${node}`;
}

export async function generateV5(namespace: string, name: string): Promise<string> {
  // RFC 4122 v5 (SHA-1 based)
  const nsBytes = namespace
    .replace(/-/g, "")
    .match(/.{2}/g)!
    .map((h) => parseInt(h, 16));
  const nameBytes = new TextEncoder().encode(name);
  const combined = new Uint8Array([...nsBytes, ...nameBytes]);
  const hashBuf = await crypto.subtle.digest("SHA-1", combined);
  const h = Array.from(new Uint8Array(hashBuf));

  h[6] = (h[6] & 0x0f) | 0x50; // version 5
  h[8] = (h[8] & 0x3f) | 0x80; // variant

  const hex = h.map((b) => b.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export function applyFormat(uuid: string, formats: Set<FormatOption>): string {
  let out = uuid;
  if (formats.has("no-hyphens")) out = out.replace(/-/g, "");
  if (formats.has("uppercase")) out = out.toUpperCase();
  if (formats.has("lowercase")) out = out.toLowerCase();
  return out;
}
