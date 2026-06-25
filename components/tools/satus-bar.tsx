import { Tool } from "@/constants/tools"

interface StatusBarProps {
  tools: Tool[]
}

export function StatusBar({ tools }: StatusBarProps) {
  const names = tools.slice(0, 6).map((t) => t.name)
  const overflow = tools.length - names.length

  return (
    <div className="md:text-right">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">
        Utility status: {tools.length} active{" "}
        {tools.length === 1 ? "utility" : "utilities"}
      </p>
      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-xs ml-auto">
        {names.join(" · ")}
        {overflow > 0 && ` · +${overflow} more`}
      </p>
    </div>
  )
}