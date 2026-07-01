// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Base = 2 | 8 | 10 | 16;
export type PadLength = 0 | 8 | 16 | 32 | 64;
export type GroupStyle = "none" | "4" | "8";
export type HexCase = "upper" | "lower";
export type Signedness = "unsigned" | "signed";

export interface ConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
  decimalValue: bigint | null; // null on error
  error: string | null;
}

export interface NumberStats {
  decimalValue: string;
  binaryDigits: number;
  hexDigits: number;
  octalDigits: number;
  bytes: number;
  bits: number;
}

export interface BitwiseResult {
  result: string;
  binary: string;
  decimal: string;
  hex: string;
  octal: string;
}

// ---------------------------------------------------------------------------
// Auto-detect base from prefix or content
// ---------------------------------------------------------------------------
export function detectBase(raw: string): { base: Base; stripped: string; detected: string } | null {
  const s = raw.trim();
  if (!s) return null;

  if (/^0b/i.test(s)) return { base: 2, stripped: s.slice(2), detected: "Binary (0b prefix)" };
  if (/^0x/i.test(s))
    return { base: 16, stripped: s.slice(2), detected: "Hexadecimal (0x prefix)" };
  if (/^0o/i.test(s)) return { base: 8, stripped: s.slice(2), detected: "Octal (0o prefix)" };

  // Leading zero heuristic for octal (but only if > 1 char and all octal digits)
  if (s.length > 1 && s.startsWith("0") && /^[0-7]+$/.test(s))
    return { base: 8, stripped: s, detected: "Octal (leading zero)" };

  // Pure binary?
  if (/^[01]+$/.test(s) && s.length >= 4) return { base: 2, stripped: s, detected: "Binary" };

  // Has A-F → hex
  if (/^[0-9a-fA-F]+$/.test(s) && /[a-fA-F]/.test(s))
    return { base: 16, stripped: s, detected: "Hexadecimal" };

  // Pure decimal
  if (/^\d+$/.test(s)) return { base: 10, stripped: s, detected: "Decimal" };

  return null;
}

// ---------------------------------------------------------------------------
// Validate a string against a base
// ---------------------------------------------------------------------------
const BASE_PATTERNS: Record<Base, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^\d+$/,
  16: /^[0-9a-fA-F]+$/,
};
const BASE_NAMES: Record<Base, string> = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hexadecimal",
};

export function validateInput(value: string, base: Base): string | null {
  if (!value.trim()) return null;
  if (!BASE_PATTERNS[base].test(value.trim())) {
    // Find first invalid char
    const invalid = value
      .trim()
      .split("")
      .find((c) => !BASE_PATTERNS[base].test(c));
    return `Invalid ${BASE_NAMES[base]} number${invalid ? ` — unexpected character "${invalid}"` : ""}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core conversion — uses BigInt for arbitrary precision
// ---------------------------------------------------------------------------
export function convert(
  value: string,
  fromBase: Base,
  hexCase: HexCase = "upper",
  padLength: PadLength = 0,
  signedness: Signedness = "unsigned",
): ConversionResult {
  const stripped = value.trim();

  if (!stripped) {
    return { binary: "", octal: "", decimal: "", hex: "", decimalValue: null, error: null };
  }

  const validationError = validateInput(stripped, fromBase);
  if (validationError) {
    return {
      binary: "",
      octal: "",
      decimal: "",
      hex: "",
      decimalValue: null,
      error: validationError,
    };
  }

  try {
    let decVal = BigInt(`0` + BASE_PREFIXES[fromBase] + stripped);

    // Signed interpretation
    if (signedness === "signed" && padLength > 0) {
      const msb = BigInt(1) << BigInt(padLength - 1);
      if (decVal >= msb) decVal = decVal - (BigInt(1) << BigInt(padLength));
    }

    const isNeg = decVal < BigInt(0);
    const absVal = isNeg ? -decVal : decVal;

    let bin = absVal.toString(2);
    let oct = absVal.toString(8);
    const dec = decVal.toString(10);
    let hex = absVal.toString(16);

    if (hexCase === "upper") hex = hex.toUpperCase();

    // Padding
    if (padLength > 0 && !isNeg) {
      bin = bin.padStart(padLength, "0");
    }

    if (isNeg) {
      bin = "-" + bin;
      oct = "-" + oct;
      hex = hexCase === "upper" ? hex.toUpperCase() : hex;
      hex = "-" + hex;
    }

    return { binary: bin, octal: oct, decimal: dec, hex, decimalValue: decVal, error: null };
  } catch {
    return {
      binary: "",
      octal: "",
      decimal: "",
      hex: "",
      decimalValue: null,
      error: "Conversion failed",
    };
  }
}

const BASE_PREFIXES: Record<Base, string> = { 2: "b", 8: "o", 10: "", 16: "x" };

// ---------------------------------------------------------------------------
// Group digits for display
// ---------------------------------------------------------------------------
export function groupDigits(value: string, style: GroupStyle): string {
  if (style === "none" || !value || value.startsWith("-")) return value;
  const n = style === "4" ? 4 : 8;
  // pad to multiple of n then split
  const padded = value.padStart(Math.ceil(value.length / n) * n, "0");
  return padded.match(new RegExp(`.{1,${n}}`, "g"))?.join(" ") ?? value;
}

// ---------------------------------------------------------------------------
// Add prefix
// ---------------------------------------------------------------------------
export function addPrefix(value: string, base: Base, hexCase: HexCase): string {
  if (!value) return value;
  const neg = value.startsWith("-");
  const abs = neg ? value.slice(1) : value;
  const prefixes: Record<Base, string> = {
    2: "0b",
    8: "0o",
    10: "",
    16: hexCase === "upper" ? "0x" : "0x",
  };
  return (neg ? "-" : "") + prefixes[base] + abs;
}

// ---------------------------------------------------------------------------
// Format decimal with commas
// ---------------------------------------------------------------------------
export function formatDecimal(dec: string): string {
  if (!dec) return dec;
  const neg = dec.startsWith("-");
  const abs = neg ? dec.slice(1) : dec;
  return (neg ? "-" : "") + abs.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export function computeStats(result: ConversionResult): NumberStats | null {
  if (!result.decimalValue && result.decimalValue !== BigInt(0)) return null;
  const { binary, hex, octal, decimal } = result;
  const cleanBin = binary.replace(/^-/, "");
  const bits = cleanBin.length;
  return {
    decimalValue: formatDecimal(decimal),
    binaryDigits: cleanBin.length,
    hexDigits: hex.replace(/^-/, "").length,
    octalDigits: octal.replace(/^-/, "").length,
    bytes: Math.ceil(bits / 8),
    bits,
  };
}

// ---------------------------------------------------------------------------
// ASCII / Unicode preview
// ---------------------------------------------------------------------------
export function getAsciiPreview(decimalValue: bigint | null): string {
  if (decimalValue === null) return "";
  const n = Number(decimalValue);
  if (n < 0 || n > 0x10ffff) return "";
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}

export function charToInfo(
  char: string,
): { ascii: string; binary: string; hex: string; decimal: string } | null {
  if (!char || char.length !== 1) return null;
  const code = char.codePointAt(0)!;
  return {
    ascii: code.toString(),
    binary: code.toString(2).padStart(8, "0"),
    hex: code.toString(16).toUpperCase().padStart(2, "0"),
    decimal: code.toString(),
  };
}

// ---------------------------------------------------------------------------
// IEEE 754 float → binary
// ---------------------------------------------------------------------------
export function floatToBinary32(value: number): string {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, value, false);
  return [...new Uint8Array(buf)].map((b) => b.toString(2).padStart(8, "0")).join("");
}

export function floatToBinary64(value: number): string {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setFloat64(0, value, false);
  return [...new Uint8Array(buf)].map((b) => b.toString(2).padStart(8, "0")).join("");
}

// ---------------------------------------------------------------------------
// Bitwise operations (on BigInt)
// ---------------------------------------------------------------------------
export type BitwiseOp = "AND" | "OR" | "XOR" | "NOT" | "LSHIFT" | "RSHIFT";

export function bitwiseOp(a: bigint, b: bigint, op: BitwiseOp, shiftAmount = 1): bigint {
  switch (op) {
    case "AND":
      return a & b;
    case "OR":
      return a | b;
    case "XOR":
      return a ^ b;
    case "NOT":
      return ~a;
    case "LSHIFT":
      return a << BigInt(shiftAmount);
    case "RSHIFT":
      return a >> BigInt(shiftAmount);
  }
}

export function parseToBigInt(value: string, base: Base): bigint | null {
  const stripped = value.trim();
  if (!stripped) return null;
  const err = validateInput(stripped, base);
  if (err) return null;
  try {
    return BigInt(`0` + BASE_PREFIXES[base] + stripped);
  } catch {
    return null;
  }
}

export function bigIntToAllBases(
  val: bigint,
  hexCase: HexCase,
): { binary: string; octal: string; decimal: string; hex: string } {
  const abs = val < 0 ? -val : val;
  const prefix = val < 0 ? "-" : "";
  return {
    binary: prefix + abs.toString(2),
    octal: prefix + abs.toString(8),
    decimal: val.toString(10),
    hex: prefix + (hexCase === "upper" ? abs.toString(16).toUpperCase() : abs.toString(16)),
  };
}

// ---------------------------------------------------------------------------
// Arithmetic across bases
// ---------------------------------------------------------------------------
export type ArithOp = "+" | "-" | "*" | "/";

export function arithmetic(a: bigint, b: bigint, op: ArithOp): bigint | null {
  try {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === BigInt(0) ? null : a / b;
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------
export function buildExportText(
  input: string,
  fromBase: Base,
  result: ConversionResult,
  showPrefix: boolean,
  hexCase: HexCase,
): string {
  const p = (v: string, base: Base) => (showPrefix ? addPrefix(v, base, hexCase) : v);
  return [
    `Input: ${input} (base ${fromBase})`,
    `Binary:      ${p(result.binary, 2)}`,
    `Octal:       ${p(result.octal, 8)}`,
    `Decimal:     ${result.decimal}`,
    `Hexadecimal: ${p(result.hex, 16)}`,
  ].join("\n");
}

export function buildExportJSON(input: string, fromBase: Base, result: ConversionResult): string {
  return JSON.stringify(
    {
      input,
      fromBase,
      binary: result.binary,
      octal: result.octal,
      decimal: result.decimal,
      hex: result.hex,
    },
    null,
    2,
  );
}

export function buildExportCSV(input: string, fromBase: Base, result: ConversionResult): string {
  return [
    "input,fromBase,binary,octal,decimal,hex",
    `${input},${fromBase},${result.binary},${result.octal},${result.decimal},${result.hex}`,
  ].join("\n");
}
