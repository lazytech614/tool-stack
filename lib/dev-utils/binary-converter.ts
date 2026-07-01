interface ConversionResult {
  input: string;
  output: string;
  error?: string;
  details?: {
    bytes: number;
    bits: number;
    characterCount?: number;
  };
}

/**
 * Convert text to binary representation
 * Each character is converted to its 8-bit binary representation
 */
export function textToBinary(text: string): ConversionResult {
  try {
    if (!text) {
      return { input: text, output: "", details: { bytes: 0, bits: 0, characterCount: 0 } };
    }

    const binaryArray = Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0);
        return code.toString(2).padStart(8, "0");
      })
      .join(" ");

    return {
      input: text,
      output: binaryArray,
      details: {
        bytes: text.length,
        bits: text.length * 8,
        characterCount: text.length,
      },
    };
  } catch (e) {
    return {
      input: text,
      output: "",
      error: e instanceof Error ? e.message : "Conversion failed",
    };
  }
}

/**
 * Convert binary string to text
 * Accepts binary with or without spaces between bytes
 */
export function binaryToText(binaryString: string): ConversionResult {
  try {
    if (!binaryString.trim()) {
      return { input: binaryString, output: "", details: { bytes: 0, bits: 0 } };
    }

    // Remove extra whitespace and split
    const binaryArray = binaryString
      .trim()
      .split(/\s+/)
      .filter((b) => b.length > 0);

    // Validate all parts are binary
    for (const binary of binaryArray) {
      if (!/^[01]+$/.test(binary)) {
        return {
          input: binaryString,
          output: "",
          error: `Invalid binary: "${binary}" contains non-binary characters (0 and 1 only)`,
        };
      }

      if (binary.length > 16) {
        return {
          input: binaryString,
          output: "",
          error: `Invalid binary: "${binary}" is ${binary.length} bits (max 16 for Unicode)`,
        };
      }
    }

    // Convert each binary to character
    const textArray = binaryArray.map((binary) => {
      const code = parseInt(binary, 2);

      // Check if valid Unicode
      if (code > 0x10ffff) {
        throw new Error(`Invalid Unicode code point: ${code}`);
      }

      // Handle special characters
      if (code === 0) {
        return "NULL";
      }

      try {
        return String.fromCharCode(code);
      } catch {
        return `[U+${code.toString(16).toUpperCase().padStart(4, "0")}]`;
      }
    });

    const text = textArray.join("");
    const totalBits = binaryArray.reduce((sum, b) => sum + b.length, 0);
    const byteCount = binaryArray.length;

    return {
      input: binaryString,
      output: text,
      details: {
        bytes: byteCount,
        bits: totalBits,
        characterCount: textArray.length,
      },
    };
  } catch (e) {
    return {
      input: binaryString,
      output: "",
      error: e instanceof Error ? e.message : "Invalid binary string",
    };
  }
}
