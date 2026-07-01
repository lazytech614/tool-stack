import Link from "next/link";

import type { CardModel } from "@/types/content-card.types";
import type { CLITool } from "@/constants/resources/cli-tools";

export function cliToolToContentCard(tool: CLITool): CardModel {
  const installCommand =
    tool.installCommands.brew ??
    tool.installCommands.npm ??
    tool.installCommands.cargo ??
    tool.installCommands.pip ??
    tool.installCommands.apt ??
    tool.installCommands.winget ??
    tool.installCommands.curl;

  return {
    id: tool.id,

    title: tool.name,

    description: tool.description,

    href: tool.docsUrl ?? tool.repoUrl ?? "#",

    badges: [
      {
        label: tool.category[0],
        color: "blue",
      },
      {
        label: tool.isFree ? "Free" : "Paid",
        color: tool.isFree ? "green" : "orange",
      },
      ...(tool.isOpenSource
        ? [
            {
              label: "Open Source",
              color: "purple" as const,
            },
          ]
        : []),
    ],

    footerLabel: "Open CLI Tool",

    content: (
      <div className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>⭐ {tool.stars.toLocaleString()}</span>

          <span>v{tool.version}</span>
        </div>

        {/* Supported OS */}
        <div className="flex flex-wrap gap-1.5">
          {tool.os.map((os) => (
            <span
              key={os}
              className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
            >
              {os}
            </span>
          ))}
        </div>

        {/* Shells */}
        <div className="flex flex-wrap gap-1.5">
          {tool.shells.map((shell) => (
            <span
              key={shell}
              className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-950/30 dark:text-green-300"
            >
              {shell}
            </span>
          ))}
        </div>

        {/* Install command */}
        {installCommand && (
          <div className="rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
            <div className="mb-1 text-[10px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Install
            </div>

            <code className="font-mono text-[11px] break-all text-zinc-700 dark:text-zinc-300">
              {installCommand}
            </code>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 4).map((tag) => (
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
        {tool.docsUrl && (
          <Link
            href={tool.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
          >
            Docs
          </Link>
        )}

        {tool.repoUrl && (
          <Link
            href={tool.repoUrl}
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
