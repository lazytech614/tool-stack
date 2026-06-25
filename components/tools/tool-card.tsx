import { Pin, PinOff } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Tool, ToolCategory } from "@/constants/tools";

const CATEGORY_COLORS: Record<
  ToolCategory,
  { badge: string; iconBg: string; iconColor: string }
> = {
  Encoding: {
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  Formatting: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  Comparison: {
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  Generator: {
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  Converter: {
    badge:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
    iconBg: "bg-cyan-100 dark:bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  Preview: {
    badge:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    iconBg: "bg-yellow-100 dark:bg-yellow-500/10",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  Utilities: {
    badge:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400",
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
  Github: {
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
}

interface ToolCardProps {
  tool: Tool
  isPinned: boolean
  onTogglePin: (id: string) => void
}

export function ToolCard({ tool, isPinned, onTogglePin }: ToolCardProps) {
  const colors = CATEGORY_COLORS[tool.category]
  const Icon = tool.icon

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-lg dark:hover:shadow-purple-500/10">
      {/* Pin button */}
      <button
        onClick={() => onTogglePin(tool.id)}
        aria-label={isPinned ? "Unpin tool" : "Pin tool"}
        className={cn(
          "absolute top-4 right-4 rounded-full p-1.5 transition-all duration-150",
          isPinned
            ? "text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 opacity-100"
            : "text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
      >
        {isPinned ? (
          <PinOff className="h-3.5 w-3.5" />
        ) : (
          <Pin className="h-3.5 w-3.5" />
        )}
      </button>

      <Link href={tool.href} className="flex flex-col gap-4 flex-1">
        {/* Icon + badges row */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "shrink-0 flex items-center justify-center w-10 h-10 rounded-lg",
              colors.iconBg,
              colors.iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                colors.badge
              )}
            >
              {tool.category}
            </span>
            {tool.isNew && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                New
              </span>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
            {tool.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </Link>
    </div>
  )
}