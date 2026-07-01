import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function loadPinned(PINNED_STORAGE_KEY: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PINNED_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function savePinned(PINNED_STORAGE_KEY: string, ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(ids));
}
