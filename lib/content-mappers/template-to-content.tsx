import Link from "next/link";

import { Template } from "@/constants/resources/templates";
import { CardModel } from "@/types/content-card.types";

export function templateToContentCard(template: Template): CardModel {
  return {
    id: template.id,

    title: template.name,

    description: template.description,

    href: template.repoUrl,

    badges: [
      {
        label: template.framework,
        color: "purple",
      },
      {
        label: template.category,
        color: "blue",
      },
    ],

    footerLabel: "Open Template",

    content: (
      <div className="space-y-3">
        {/* Stats */}
        <div className="flex items-start justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div>
            <p className="text-zinc-400">Stars</p>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
              ⭐ {template.stars.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-zinc-400">Author</p>
            <p className="mt-0.5 truncate font-semibold text-zinc-900 dark:text-white">
              {template.author}
            </p>
          </div>
        </div>

        {/* Tech tags */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
            Technologies
          </p>

          <div className="flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),

    actions: (
      <div className="flex gap-2">
        {template.previewUrl && (
          <Link
            href={template.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
          >
            Live Demo
          </Link>
        )}

        <Link
          href={template.repoUrl}
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
