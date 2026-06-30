import Link from "next/link";

import { Boilerplate } from "@/constants/resources/boilerplates";
import { CardModel } from "@/types/content-card.types";

export function boilerplateToContentCard(
  boilerplate: Boilerplate
): CardModel {
  return {
    id: boilerplate.id,

    title: boilerplate.name,

    description: boilerplate.description,

    href: boilerplate.repoUrl,

    badges: [
      {
        label: boilerplate.category,
        color: "blue",
      },
      {
        label: boilerplate.difficulty,
        color:
          boilerplate.difficulty === "Beginner"
            ? "green"
            : boilerplate.difficulty === "Intermediate"
            ? "orange"
            : "purple",
      },
    ],

    footerLabel: "Open Boilerplate",

    content: (
      <div className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>⭐ {boilerplate.stars.toLocaleString()}</span>

          <span>By {boilerplate.author}</span>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {boilerplate.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {boilerplate.includes.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-md bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:text-green-400"
            >
              ✓ {feature}
            </span>
          ))}
        </div>

        {/* License */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{boilerplate.license} License</span>

          <span>
            Updated{" "}
            {new Date(boilerplate.lastUpdated).toLocaleDateString("en-US")}
          </span>
        </div>
      </div>
    ),

    actions: (
      <div className="flex flex-wrap gap-2">
        {boilerplate.previewUrl && (
          <Link
            href={boilerplate.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
          >
            Live Preview
          </Link>
        )}

        <Link
          href={boilerplate.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          GitHub
        </Link>
      </div>
    ),
  };
}