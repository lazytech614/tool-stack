import { Mode } from "@/types/dev-tools/base64-url";

export function transform(input: string, mode: Mode): { output: string; error?: string } {
  try {
    switch (mode) {
      case "base64-encode":
        return { output: btoa(unescape(encodeURIComponent(input))) };
      case "base64-decode":
        return { output: decodeURIComponent(escape(atob(input))) };
      case "url-encode":
        return { output: encodeURIComponent(input) };
      case "url-decode":
        return { output: decodeURIComponent(input) };
    }
  } catch {
    return { output: "", error: "Invalid input for this operation." };
  }
}
