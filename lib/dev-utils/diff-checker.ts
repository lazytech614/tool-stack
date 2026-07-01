import { DiffLine } from "@/types/dev-tools/diff-checker";

export function computeDiff(original: string, modified: string): DiffLine[] {
  const a = original.split("\n");
  const b = modified.split("\n");
  const result: DiffLine[] = [];

  // Simple LCS-based line diff
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  let i = 0;
  let j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      result.push({ type: "unchanged", text: a[i] });
      i++;
      j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: "added", text: b[j] });
      j++;
    } else {
      result.push({ type: "removed", text: a[i] });
      i++;
    }
  }

  return result;
}
