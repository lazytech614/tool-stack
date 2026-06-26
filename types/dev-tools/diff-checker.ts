export type DiffLine =
  | { type: "added"; text: string }
  | { type: "removed"; text: string }
  | { type: "unchanged"; text: string }