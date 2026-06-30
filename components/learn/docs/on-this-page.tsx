"use client";

import { useEffect, useState } from "react";
import { type HeadingBlock } from "@/constants/learnings/docs";
import Link from "next/link";

export function OnThisPage({ headings }: { headings: HeadingBlock[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const ids = headings.map(({ text }) =>
      text.toLowerCase().replace(/\s+/g, "-")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        // Always highlight the last heading when we're at the bottom
        const isAtBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 5;

        if (isAtBottom) {
          setActiveId(ids[ids.length - 1]);
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;

      if (isAtBottom) {
        setActiveId(ids[ids.length - 1]);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setActiveId(hash);
    };

    updateFromHash(); // Initial load

    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-3">
        On this page
      </p>
      {headings.map(({ text, level }) => {
        const id = text.toLowerCase().replace(/\s+/g, "-");
        const isActive = activeId === id;

        return (
          <Link
            key={id}
            href={`#${id}`}
            onClick={() => setActiveId(id)}
            className={`flex items-center gap-2 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
              level === 3 ? "pl-6 pr-3" : "px-3"
            } ${
              isActive
                ? "text-purple-700 dark:text-purple-300"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
            )}
            {text}
          </Link>
        );
      })}
    </nav>
  );
}