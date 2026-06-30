import { Cheatsheet } from "@/constants/learnings/cheatsheets";
import { CardModel } from "@/types/content-card.types";

export function cheatsheetToContentCard(
  cheatsheet: Cheatsheet
): CardModel {
  const snippets = cheatsheet.sections.reduce(
    (count, section) => count + section.snippets.length,
    0
  );

  return {
    id: cheatsheet.slug,
    title: cheatsheet.title,
    description: cheatsheet.description,
    href: `/learn/cheatsheets/${cheatsheet.slug}`,
    badges: [
      {
        label: cheatsheet.tag,
        color: "blue",
      },
      {
        label: `${cheatsheet.sections.length} Sections`,
        color: "purple",
      },
    ],

    footerLabel: "Open Cheatsheet",

    content: (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            📄 {cheatsheet.sections.length} Sections
          </span>

          <span>
            ⚡ {snippets} Snippets
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {cheatsheet.sections.slice(0, 3).map((section) => (
            <span
              key={section.title}
              className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {section.title}
            </span>
          ))}

          {cheatsheet.sections.length > 3 && (
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              +{cheatsheet.sections.length - 3}
            </span>
          )}
        </div>
      </div>
    ),
  };
}