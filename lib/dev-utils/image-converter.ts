// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type OutputFormat = "png" | "jpeg" | "webp" | "bmp" | "ico";
export type BgColor = "white" | "black" | "transparent" | "custom";

export interface ImageInfo {
  name: string;
  width: number;
  height: number;
  size: number;
  format: string;
  colorSpace: string;
  aspectRatio: string;
  pixels: number;
}

export interface ConvertedResult {
  dataUrl: string;
  size: number;
  format: OutputFormat;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function getAspectRatio(w: number, h: number): string {
  const g = gcd(w, h);
  const rw = w / g;
  const rh = h / g;
  // Common named ratios
  const named: Record<string, string> = {
    "16:9": "16:9",
    "4:3": "4:3",
    "1:1": "1:1",
    "3:2": "3:2",
    "21:9": "21:9",
    "9:16": "9:16",
  };
  const key = `${rw}:${rh}`;
  return named[key] ?? key;
}

export function detectFormat(file: File): string {
  const mime = file.type;
  if (mime.includes("png")) return "PNG";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
  if (mime.includes("webp")) return "WebP";
  if (mime.includes("svg")) return "SVG";
  if (mime.includes("gif")) return "GIF";
  if (mime.includes("bmp")) return "BMP";
  if (mime.includes("tiff")) return "TIFF";
  if (mime.includes("ico")) return "ICO";
  return file.name.split(".").pop()?.toUpperCase() ?? "Unknown";
}

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

export const BG_COLORS: Record<BgColor, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  custom: "",
};

const FORMAT_MIME: Record<OutputFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  bmp: "image/bmp",
  ico: "image/png", // ico rendered as png in browser
};

export const FORMAT_EXT: Record<OutputFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
  bmp: "bmp",
  ico: "ico",
};

export const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "bmp", label: "BMP" },
  { value: "ico", label: "ICO" },
];

// ---------------------------------------------------------------------------
// Conversion engine
// ---------------------------------------------------------------------------
export async function convertImage(
  src: string,
  outFormat: OutputFormat,
  quality: number,
  resizeW: number | null,
  resizeH: number | null,
  bgColor: string,
): Promise<ConvertedResult> {
  const img = await loadImageElement(src);
  const canvas = document.createElement("canvas");

  const targetW = resizeW ?? img.naturalWidth;
  const targetH = resizeH ?? img.naturalHeight;

  // ICO: force 256×256 max
  const finalW = outFormat === "ico" ? Math.min(targetW, 256) : targetW;
  const finalH = outFormat === "ico" ? Math.min(targetH, 256) : targetH;

  canvas.width = finalW;
  canvas.height = finalH;

  const ctx = canvas.getContext("2d")!;
  if (bgColor && bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, finalW, finalH);
  }
  ctx.drawImage(img, 0, 0, finalW, finalH);

  const mime = FORMAT_MIME[outFormat];
  const q = outFormat === "jpeg" || outFormat === "webp" ? quality / 100 : undefined;
  const dataUrl = canvas.toDataURL(mime, q);

  // Estimate size from base64
  const base64 = dataUrl.split(",")[1] ?? "";
  const size = Math.round((base64.length * 3) / 4);

  return { dataUrl, size, format: outFormat, width: finalW, height: finalH };
}
