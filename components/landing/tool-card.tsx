import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  badge: string;
  href: string;
  badgeColor?: "green" | "blue" | "purple" | "orange";
  icon: React.ReactNode;
}

const badgeStyles = {
  green:
    "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  blue:
    "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
  purple:
    "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400",
  orange:
    "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
};

const iconContainerStyles = {
  green:
    "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

  blue:
    "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",

  purple:
    "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",

  orange:
    "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export function ToolCard({
  title,
  description,
  badge,
  href,
  badgeColor = "purple",
  icon,
}: ToolCardProps) {
  return (
    <Link href={href}>
      <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-lg dark:hover:shadow-purple-500/10 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`rounded-lg p-3 ${iconContainerStyles[badgeColor]} shrink-0`}
            >
              {icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  {title}
                </h3>

                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badgeStyles[badgeColor]}`}
                >
                  {badge}
                </span>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                {description}
              </p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-200 group-hover:translate-x-1 shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}