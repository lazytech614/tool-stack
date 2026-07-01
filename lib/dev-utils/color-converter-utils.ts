/**
 * Color Converter Utilities
 * Handles conversion between HEX, RGB, HSL, HSV, and color analysis
 */

// ── types ──────────────────────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
  a?: number;
}

export interface ColorInfo {
  hex: string;
  hexAlpha: string;
  rgb: RGB;
  rgbString: string;
  rgba: string;
  hsl: HSL;
  hslString: string;
  hsv: HSV;
  hsvString: string;
  luminance: number;
  brightness: number;
  isDark: boolean;
  isLight: boolean;
}

// ── HEX Conversion ──────────────────────────────────────────────────────────

/**
 * Convert HEX to RGB
 * @param hex - HEX color string (#RRGGBB or #RRGGBBAA)
 */
export function hexToRGB(hex: string): RGB | null {
  const cleaned = hex.replace("#", "").toUpperCase();

  // Validate HEX format
  if (!/^[0-9A-F]{6}([0-9A-F]{2})?$/.test(cleaned)) {
    return null;
  }

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  const a = cleaned.length === 8 ? parseInt(cleaned.substring(6, 8), 16) / 255 : undefined;

  return { r, g, b, a };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;

  if (rgb.a !== undefined) {
    const alpha = Math.round(rgb.a * 255).toString(16);
    return hex + (alpha.length === 1 ? "0" + alpha : alpha);
  }

  return hex;
}

// ── RGB/HSL/HSV Conversion ──────────────────────────────────────────────────

/**
 * Convert RGB to HSL
 */
export function rgbToHSL(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a,
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRGB(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a,
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHSV(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: rgb.a,
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRGB(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 1 / 6) {
    r = c;
    g = x;
  } else if (h < 2 / 6) {
    r = x;
    g = c;
  } else if (h < 3 / 6) {
    g = c;
    b = x;
  } else if (h < 4 / 6) {
    g = x;
    b = c;
  } else if (h < 5 / 6) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: hsv.a,
  };
}

/**
 * Convert HSV to HSL
 */
export function hsvToHSL(hsv: HSV): HSL {
  const rgb = hsvToRGB(hsv);
  return rgbToHSL(rgb);
}

/**
 * Convert HSL to HSV
 */
export function hslToHSV(hsl: HSL): HSV {
  const rgb = hslToRGB(hsl);
  return rgbToHSV(rgb);
}

// ── Color Analysis ──────────────────────────────────────────────────────────

/**
 * Calculate relative luminance (WCAG)
 */
export function calculateLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function calculateContrastRatio(color1RGB: RGB, color2RGB: RGB): number {
  const l1 = calculateLuminance(color1RGB);
  const l2 = calculateLuminance(color2RGB);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG contrast compliance
 */
export function checkWCAGCompliance(ratio: number): { AA: boolean; AAA: boolean } {
  return {
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
  };
}

/**
 * Get all color information
 */
export function getColorInfo(hex: string): ColorInfo | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  const hsv = rgbToHSV(rgb);
  const luminance = calculateLuminance(rgb);

  // Brightness calculation
  const brightness = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);

  return {
    hex: rgbToHex({ r: rgb.r, g: rgb.g, b: rgb.b }),
    hexAlpha: rgbToHex(rgb),
    rgb,
    rgbString: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a ?? 1})`,
    hsl,
    hslString: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
    hsv,
    hsvString: `${hsv.h}°, ${hsv.s}%, ${hsv.v}%`,
    luminance: Math.round(luminance * 100) / 100,
    brightness,
    isDark: brightness < 128,
    isLight: brightness >= 128,
  };
}

// ── Color Manipulation ──────────────────────────────────────────────────────

/**
 * Generate complementary color
 */
export function getComplementary(hex: string): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  hsl.h = (hsl.h + 180) % 360;

  return rgbToHex(hslToRGB(hsl));
}

/**
 * Generate analogous colors
 */
export function getAnalogous(hex: string): string[] | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  const colors: string[] = [];

  for (const offset of [-30, 0, 30]) {
    const newHsl = { ...hsl, h: (hsl.h + offset + 360) % 360 };
    colors.push(rgbToHex(hslToRGB(newHsl)));
  }

  return colors;
}

/**
 * Generate triadic colors
 */
export function getTriadic(hex: string): string[] | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  const colors: string[] = [];

  for (const offset of [0, 120, 240]) {
    const newHsl = { ...hsl, h: (hsl.h + offset) % 360 };
    colors.push(rgbToHex(hslToRGB(newHsl)));
  }

  return colors;
}

/**
 * Lighten a color
 */
export function lighten(hex: string, amount: number = 0.1): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  hsl.l = Math.min(100, hsl.l + amount * 100);

  return rgbToHex(hslToRGB(hsl));
}

/**
 * Darken a color
 */
export function darken(hex: string, amount: number = 0.1): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  hsl.l = Math.max(0, hsl.l - amount * 100);

  return rgbToHex(hslToRGB(hsl));
}

/**
 * Saturate a color
 */
export function saturate(hex: string, amount: number = 0.1): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  hsl.s = Math.min(100, hsl.s + amount * 100);

  return rgbToHex(hslToRGB(hsl));
}

/**
 * Desaturate a color
 */
export function desaturate(hex: string, amount: number = 0.1): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  hsl.s = Math.max(0, hsl.s - amount * 100);

  return rgbToHex(hslToRGB(hsl));
}

// ── Color Palette Generation ────────────────────────────────────────────────

/**
 * Generate a color palette (like Tailwind)
 */
export function generatePalette(baseHex: string): Record<number, string> | null {
  const rgb = hexToRGB(baseHex);
  if (!rgb) return null;

  const hsl = rgbToHSL(rgb);
  const palette: Record<number, string> = {};

  // Generate 10 shades (50, 100, 200, ..., 900)
  for (let i = 0; i < 10; i++) {
    const level = i * 100 + 50;
    const lightness = 95 - (level / 1000) * 85; // 95% to 10%

    const newHsl = { ...hsl, l: lightness };
    palette[level] = rgbToHex(hslToRGB(newHsl));
  }

  return palette;
}

// ── Validation ──────────────────────────────────────────────────────────────

/**
 * Validate HEX color
 */
export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-F]{6}([0-9A-F]{2})?$/i.test(hex);
}

/**
 * Validate RGB values
 */
export function isValidRGB(r: number, g: number, b: number): boolean {
  return (
    Number.isInteger(r) &&
    Number.isInteger(g) &&
    Number.isInteger(b) &&
    r >= 0 &&
    r <= 255 &&
    g >= 0 &&
    g <= 255 &&
    b >= 0 &&
    b <= 255
  );
}

/**
 * Validate HSL values
 */
export function isValidHSL(h: number, s: number, l: number): boolean {
  return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
}

/**
 * Validate HSV values
 */
export function isValidHSV(h: number, s: number, v: number): boolean {
  return h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100;
}

// ── Color Blindness Simulation ──────────────────────────────────────────────

/**
 * Simulate Protanopia (Red-Blind)
 */
export function simulateProtanopia(hex: string): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  // Protanopia color transformation matrix
  const r = rgb.r * 0.567 + rgb.g * 0.433;
  const g = rgb.r * 0.558 + rgb.g * 0.442;
  const b = rgb.b;

  return rgbToHex({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a: rgb.a });
}

/**
 * Simulate Deuteranopia (Green-Blind)
 */
export function simulateDeuteranopia(hex: string): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  // Deuteranopia color transformation matrix
  const r = rgb.r * 0.625 + rgb.g * 0.375;
  const g = rgb.r * 0.7 + rgb.g * 0.3;
  const b = rgb.b;

  return rgbToHex({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a: rgb.a });
}

/**
 * Simulate Tritanopia (Blue-Yellow Blind)
 */
export function simulateTritanopia(hex: string): string | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;

  // Tritanopia color transformation matrix
  const r = rgb.r * 0.95 + rgb.g * 0.05;
  const g = rgb.r * 0.433 + rgb.g * 0.567;
  const b = rgb.b * 0.475 + rgb.r * 0.525;

  return rgbToHex({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a: rgb.a });
}

/**
 * Get all color blindness simulations
 */
export function getColorBlindnessSimulations(hex: string) {
  return {
    normal: hex,
    protanopia: simulateProtanopia(hex),
    deuteranopia: simulateDeuteranopia(hex),
    tritanopia: simulateTritanopia(hex),
  };
}
