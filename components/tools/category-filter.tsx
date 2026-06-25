import { ToolCategory } from "@/constants/tools"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  categories: ToolCategory[]
  selected: ToolCategory | "All"
  onChange: (value: ToolCategory | "All") => void
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const allOptions: (ToolCategory | "All")[] = ["All", ...categories]

  return (
    <div className="flex flex-wrap gap-2">
      {allOptions.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 border",
            selected === cat
              ? "bg-linear-to-r from-purple-600 to-violet-600 text-white border-transparent shadow-sm"
              : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-300 dark:hover:border-purple-500/40 hover:text-zinc-900 dark:hover:text-white"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}