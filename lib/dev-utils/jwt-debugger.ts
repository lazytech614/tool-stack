// ── helpers ────────────────────────────────────────────────────────────────

export function base64UrlDecode(str: string): string {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  return atob(padded);
}

export function parseJwt(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  error?: string;
} {
  try {
    const [h, p, s] = token.trim().split(".");
    if (!h || !p || !s) throw new Error("Token must have three parts separated by dots.");
    return {
      header: JSON.parse(base64UrlDecode(h)),
      payload: JSON.parse(base64UrlDecode(p)),
      signature: s,
    };
  } catch (e) {
    return {
      header: {},
      payload: {},
      signature: "",
      error: e instanceof Error ? e.message : "Invalid token.",
    };
  }
}

export function formatJson(obj: Record<string, unknown>) {
  return JSON.stringify(obj, null, 2);
}

export function getExpiry(payload: Record<string, unknown>): {
  label: string;
  expired: boolean;
} | null {
  const exp = payload.exp;
  if (typeof exp !== "number") return null;
  const date = new Date(exp * 1000);
  const now = Date.now();
  const expired = now > exp * 1000;
  return {
    label: date.toLocaleString(),
    expired,
  };
}
