"use client";

import { type ContentBlock } from "@/constants/learnings/docs";
import { Info, Lightbulb, AlertTriangle, AlertOctagon } from "lucide-react";
import { CodeBlock } from "../cheatsheets/code-block";

// ─── Callout ─────────────────────────────────────────────────────────────────

const calloutStyles = {
  info: {
    wrapper: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/30",
    icon: Info,
    iconClass: "text-blue-500",
    titleClass: "text-blue-700 dark:text-blue-300",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  tip: {
    wrapper: "border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-950/30",
    icon: Lightbulb,
    iconClass: "text-green-500",
    titleClass: "text-green-700 dark:text-green-300",
    textClass: "text-green-600 dark:text-green-400",
  },
  warning: {
    wrapper: "border-yellow-200 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-950/30",
    icon: AlertTriangle,
    iconClass: "text-yellow-500",
    titleClass: "text-yellow-700 dark:text-yellow-300",
    textClass: "text-yellow-600 dark:text-yellow-400",
  },
  danger: {
    wrapper: "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-950/30",
    icon: AlertOctagon,
    iconClass: "text-red-500",
    titleClass: "text-red-700 dark:text-red-300",
    textClass: "text-red-600 dark:text-red-400",
  },
};

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function DocRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          // Heading
          case "heading": {
            const id = block.text.toLowerCase().replace(/\s+/g, "-");
            if (block.level === 2) {
              return (
                <h2
                  key={i}
                  id={id}
                  className="scroll-mt-24 text-lg font-bold text-zinc-900 dark:text-white pt-4 border-t border-zinc-100 dark:border-zinc-800"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={i}
                id={id}
                className="scroll-mt-24 text-base font-semibold text-zinc-800 dark:text-zinc-100"
              >
                {block.text}
              </h3>
            );
          }

          // Paragraph
          case "paragraph":
            return (
              <p
                key={i}
                className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
              >
                {block.text}
              </p>
            );

          // Code
          case "code":
            return (
              <div key={i} className="space-y-1">
                {block.filename && (
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 font-mono">
                    {block.filename}
                  </p>
                )}
                <CodeBlock code={block.code} />
              </div>
            );

          // Callout
          case "callout": {
            const style = calloutStyles[block.variant];
            const Icon = style.icon;
            return (
              <div
                key={i}
                className={`flex gap-3 rounded-xl border p-4 ${style.wrapper}`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.iconClass}`} />
                <div>
                  <p className={`text-xs font-semibold mb-0.5 ${style.titleClass}`}>
                    {block.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${style.textClass}`}>
                    {block.text}
                  </p>
                </div>
              </div>
            );
          }

          // List
          case "list":
            return block.ordered ? (
              <ol key={i} className="space-y-1.5 pl-5 list-decimal">
                {block.items.map((item, j) => (
                  <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="space-y-1.5 pl-5 list-disc">
                {block.items.map((item, j) => (
                  <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );

          // Table
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      {block.headers.map((h, j) => (
                        <th
                          key={j}
                          className="px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr
                        key={j}
                        className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40"
                      >
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400 font-mono"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          // Divider
          case "divider":
            return (
              <hr
                key={i}
                className="border-zinc-100 dark:border-zinc-800"
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}