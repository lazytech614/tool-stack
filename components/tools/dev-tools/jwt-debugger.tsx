"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Check, Copy, ShieldCheck, ShieldX } from "lucide-react"
import { cn } from "@/lib/utils"

// ── helpers ────────────────────────────────────────────────────────────────

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    str.length + ((4 - (str.length % 4)) % 4),
    "="
  )
  return atob(padded)
}

function parseJwt(token: string): {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  error?: string
} {
  try {
    const [h, p, s] = token.trim().split(".")
    if (!h || !p || !s) throw new Error("Token must have three parts separated by dots.")
    return {
      header:    JSON.parse(base64UrlDecode(h)),
      payload:   JSON.parse(base64UrlDecode(p)),
      signature: s,
    }
  } catch (e) {
    return {
      header:    {},
      payload:   {},
      signature: "",
      error: e instanceof Error ? e.message : "Invalid token.",
    }
  }
}

function formatJson(obj: Record<string, unknown>) {
  return JSON.stringify(obj, null, 2)
}

function getExpiry(payload: Record<string, unknown>): {
  label: string
  expired: boolean
} | null {
  const exp = payload.exp
  if (typeof exp !== "number") return null
  const date  = new Date(exp * 1000)
  const now   = Date.now()
  const expired = now > exp * 1000
  return {
    label: date.toLocaleString(),
    expired,
  }
}

// ── sub-components ─────────────────────────────────────────────────────────

function JsonPanel({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-widest",
            accent
          )}
        >
          {label}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap overflow-x-auto min-h-30">
        {value}
      </pre>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

export function JwtDebuggerTool() {
  const [token, setToken] = useState("")

  const result = useMemo(
    () => (token.trim() ? parseJwt(token) : null),
    [token]
  )

  const expiry   = result && !result.error ? getExpiry(result.payload) : null
  const hasResult = result && !result.error

  return (
    <div className="flex flex-col gap-8">
      {/* Token input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            JSON Web Token
          </label>
          <button
            onClick={() => setToken(SAMPLE_JWT)}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Try example
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT here — eyJhbGci..."
          rows={4}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500/60 resize-none transition-colors"
        />
      </div>

      {/* Error */}
      {result?.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
        </div>
      )}

      {/* Decoded panels */}
      {hasResult && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <JsonPanel
              label="Header"
              value={formatJson(result.header)}
              accent="text-purple-600 dark:text-purple-400"
            />
            <JsonPanel
              label="Payload"
              value={formatJson(result.payload)}
              accent="text-blue-600 dark:text-blue-400"
            />
          </div>

          {/* Signature + expiry row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Signature notice */}
            <div className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
              <ShieldX className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                  Signature not verified
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                  Paste your secret below to verify, or use this tool for decoding only.
                </p>
              </div>
            </div>

            {/* Expiry */}
            {expiry ? (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3",
                  expiry.expired
                    ? "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10"
                    : "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
                )}
              >
                <ShieldCheck
                  className={cn(
                    "h-4 w-4 mt-0.5 shrink-0",
                    expiry.expired
                      ? "text-red-500 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      expiry.expired
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {expiry.expired ? "Token expired" : "Token valid"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                    Expires {expiry.label}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-zinc-400 dark:text-zinc-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    No expiry claim
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                    This token has no <code className="font-mono">exp</code> field.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Signature input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              Signature
            </label>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-500 dark:text-zinc-500 break-all">
              {result.signature}
            </div>
          </div>
        </>
      )}
    </div>
  )
}