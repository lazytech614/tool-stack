import Link from "next/link";

import { StarterKit } from "@/constants/resources/starter-kits";
import { CardModel } from "@/types/content-card.types";

export function starterKitToContentCard(
  kit: StarterKit
): CardModel {
  const enabledFeatures = [
    kit.features.authentication && "Auth",
    kit.features.database && "Database",
    kit.features.payments && "Payments",
    kit.features.email && "Email",
    kit.features.storage && "Storage",
    kit.features.analytics && "Analytics",
    kit.features.testing && "Testing",
    kit.features.docker && "Docker",
  ].filter(Boolean) as string[];

  const tech = [
    kit.techDetails.auth,
    kit.techDetails.database,
    kit.techDetails.payments,
    kit.techDetails.email,
    kit.techDetails.storage,
  ].filter(Boolean);

  return {
    id: kit.id,

    title: kit.name,

    description: kit.description,

    href: kit.repoUrl,

    badges: [
      {
        label: kit.framework,
        color: "blue",
      },
      {
        label: kit.pricing,
        color:
          kit.pricing === "Free"
            ? "green"
            : kit.pricing === "Paid"
            ? "orange"
            : "purple",
      },
    ],

    footerLabel: "Open Starter Kit",

    content: (
      <div className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>⭐ {kit.stars.toLocaleString()}</span>

          <span className="truncate">
            By {kit.author}
          </span>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {kit.stack.slice(0, 4).map((item) => (
            <span
              key={item}
              className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {enabledFeatures.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="rounded-md bg-green-50 dark:bg-green-950/40 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:text-green-400"
            >
              ✓ {feature}
            </span>
          ))}
        </div>

        {/* Tech details */}
        {tech.length > 0 && (
          <div className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Built with:
            </span>{" "}
            {tech.slice(0, 3).join(" • ")}
          </div>
        )}
      </div>
    ),

    actions: (
      <div className="flex gap-2">
        {kit.demoUrl && (
          <Link
            href={kit.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
          >
            Live Demo
          </Link>
        )}

        <Link
          href={kit.repoUrl}
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