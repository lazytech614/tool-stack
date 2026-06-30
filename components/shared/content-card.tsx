"use client";

import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";

import { cn } from "@/lib/utils";
import { ContentCardProps } from "@/types/content-card.types";
import { CARD_COLORS } from "@/constants/configs/resource-card-colors";

export function ContentCard({
  item,
  clickable = true,
  pin,
}: ContentCardProps) {
  const Icon = item.icon || MdKeyboardDoubleArrowRight;

  const primaryColor =
    CARD_COLORS[item.badges[0]?.color ?? "gray"];

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-xl border",
        "border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900/60",
        "p-5",
        "transition-all duration-200",
        "hover:border-purple-300",
        "dark:hover:border-purple-500/30",
        "hover:shadow-lg",
        "dark:hover:shadow-purple-500/10"
      )}
    >
      {pin && (
        <button
          onClick={pin.onToggle}
          aria-label={pin.pinned ? "Unpin" : "Pin"}
          className={cn(
            "absolute right-4 top-4 rounded-full p-1.5 transition-all duration-200",
            pin.pinned
              ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
              : "text-zinc-400 sm:opacity-0 group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          {pin.pinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </button>
      )}

      <Link
        href={item.href}
        className={`flex flex-1 flex-col gap-4 ${!clickable && "cursor-default"}`}
      >
        {/* Header */}

        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              primaryColor.iconBg,
              primaryColor.iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.badges.map((badge) => {
              const colors = CARD_COLORS[badge.color];

              return (
                <span
                  key={badge.label}
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    colors.badge
                  )}
                >
                  {badge.label}
                </span>
              );
            })}

            {item.isNew && (
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                New
              </span>
            )}

            {item.status && (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium",
                  CARD_COLORS[item.status.color].badge
                )}
              >
                {item.status.label}
              </span>
            )}
          </div>
        </div>

        {/* Main */}

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold uppercase leading-tight text-zinc-900 dark:text-white sm:text-xl">
            {item.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {item.description}
          </p>
        </div>

        {/* Page specific content */}

        {item.content && (
          <div className="mt-2">
            {item.content}
          </div>
        )}

        <div className="flex-1" />
      </Link>
      
      {/* Optional actions */}
      {item.actions && (
        <div className="mt-3">
          {item.actions}
        </div>
      )}

      {/* Footer */}

      {clickable && (
        <div className="mt-4 flex translate-y-1 items-center gap-2 text-[10px] uppercase text-zinc-900 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-80 dark:text-white">
          <span>{item.footerLabel ?? "Open"}</span>

          <MdKeyboardDoubleArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </div>
      )}
    </div>
  );
}