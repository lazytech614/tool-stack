"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

import { MegaMenuFooter, MegaMenuSection as Section } from "@/types/mega-menu.types";
import { MegaMenuSection } from "./mega-menu-section";

interface Props {
  sections: Section[];
  footer?: MegaMenuFooter;
  columns?: number;
  width?: string;
  align?: "left" | "center" | "right";
}

export function MegaMenuPanel({
  sections,
  footer,
  columns,
  width,
  align,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const totalColumns = columns ?? sections.length;
  const panelWidth = width ?? `${Math.max(totalColumns * 20, 40)}rem`;

  // After render, check if panel overflows viewport and compute correction
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const PADDING = 12; // minimum gap from screen edge

    if (rect.right > viewportWidth - PADDING) {
      // Overflows right edge
      setOffset(-(rect.right - viewportWidth + PADDING));
    } else if (rect.left < PADDING) {
      // Overflows left edge
      setOffset(PADDING - rect.left);
    }
  }, []);

  const alignmentClass =
    align === "left"
      ? "left-0"
      : align === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={panelRef}
      className={`
        absolute top-full mt-3 z-50
        rounded-2xl border border-zinc-200/60
        bg-white/95 shadow-xl shadow-zinc-200/50 backdrop-blur-xl
        dark:border-zinc-800/60 dark:bg-zinc-950/95 dark:shadow-black/40
        animate-in fade-in slide-in-from-top-2 duration-200
        ${alignmentClass}
      `}
      style={{
        width: panelWidth,
        // Apply overflow correction on top of any existing transform
        transform: align === "center"
          ? `translateX(calc(-50% + ${offset}px))`
          : `translateX(${offset}px)`,
      }}
    >
      {/* Arrow */}
      <div
        className={`
          absolute -top-1.5 h-3 w-3 rotate-45 rounded-sm
          border-l border-t border-zinc-200/60 bg-white
          dark:border-zinc-800/60 dark:bg-zinc-950
          ${align === "left" ? "left-8" : align === "right" ? "right-8" : "left-1/2 -translate-x-1/2"}
        `}
      />

      {/* Sections */}
      <div
        className="grid gap-0 p-3"
        style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0,1fr))` }}
      >
        {sections.map((section) => (
          <MegaMenuSection key={section.id} section={section} />
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-zinc-800/60">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{footer.text}</p>
          <Link
            href={footer.href}
            className="text-xs font-medium text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            {footer.label} →
          </Link>
        </div>
      )}
    </div>
  );
}