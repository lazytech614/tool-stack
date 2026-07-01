import Link from "next/link";

import { BrowserExtension } from "@/constants/resources/browser-extensions";
import { CardModel } from "@/types/content-card.types";

export function browserExtensionToContentCard(extension: BrowserExtension): CardModel {
  const primaryStore =
    extension.storeUrls.Chrome ??
    extension.storeUrls.Firefox ??
    extension.storeUrls.Edge ??
    extension.storeUrls.Safari ??
    extension.storeUrls.Arc ??
    extension.repoUrl ??
    "#";

  return {
    id: extension.id,

    title: extension.name,

    description: extension.description,

    href: primaryStore,

    badges: [
      {
        label: extension.category[0],
        color: "blue",
      },
      {
        label: extension.isFree ? "Free" : "Paid",
        color: extension.isFree ? "green" : "orange",
      },
      ...(extension.isOpenSource
        ? [
            {
              label: "Open Source",
              color: "purple" as const,
            },
          ]
        : []),
    ],

    footerLabel: "View Extension",

    content: (
      <div className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            ⭐ {extension.rating} ({extension.ratingCount.toLocaleString()})
          </span>

          <span>
            {Intl.NumberFormat("en", {
              notation: "compact",
            }).format(extension.installs)}{" "}
            installs
          </span>
        </div>

        {/* Publisher */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Publisher:</span>{" "}
          {extension.publisher}
        </div>

        {/* Supported browsers */}
        <div className="flex flex-wrap gap-1.5">
          {extension.browsers.map((browser) => (
            <span
              key={browser}
              className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
            >
              {browser}
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {extension.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    ),

    actions: (
      <div className="flex gap-2">
        <Link
          href={primaryStore}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
        >
          Install
        </Link>

        {extension.repoUrl && (
          <Link
            href={extension.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            GitHub
          </Link>
        )}
      </div>
    ),
  };
}
