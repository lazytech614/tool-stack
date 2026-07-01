import { Flag } from "@/types/dev-tools/regex-tester";

interface Match {
  value: string;
  index: number;
  groups: string[];
}

// ── helpers ────────────────────────────────────────────────────────────────

export function buildRegex(
  pattern: string,
  flags: Set<Flag>,
): { regex: RegExp; error?: never } | { regex?: never; error: string } {
  try {
    return { regex: new RegExp(pattern, [...flags].join("")) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid regex." };
  }
}

export function getMatches(regex: RegExp, input: string): Match[] {
  const matches: Match[] = [];
  if (!regex.global) {
    const m = regex.exec(input);
    if (m) matches.push({ value: m[0], index: m.index, groups: m.slice(1) });
    return matches;
  }
  let m: RegExpExecArray | null;
  let safety = 0;
  while ((m = regex.exec(input)) !== null && safety++ < 500) {
    matches.push({ value: m[0], index: m.index, groups: m.slice(1) });
    if (m[0].length === 0) regex.lastIndex++;
  }
  return matches;
}

export function getSegments(input: string, matches: Match[]): { text: string; isMatch: boolean }[] {
  if (!matches.length) return [{ text: input, isMatch: false }];
  const segments: { text: string; isMatch: boolean }[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.index > cursor) segments.push({ text: input.slice(cursor, m.index), isMatch: false });
    segments.push({ text: m.value, isMatch: true });
    cursor = m.index + m.value.length;
  }
  if (cursor < input.length) segments.push({ text: input.slice(cursor), isMatch: false });
  return segments;
}
