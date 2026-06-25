"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="
        relative
        border-zinc-400
        bg-white
        hover:bg-zinc-100
        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:bg-zinc-800
      "
    >
      <Sun
        className="
          h-5 w-5
          rotate-0
          scale-100
          transition-all
          dark:-rotate-90
          dark:scale-0
          text-black
        "
      />

      <Moon
        className="
          absolute
          h-5
          w-5
          rotate-90
          scale-0
          transition-all
          dark:rotate-0
          dark:scale-100
        "
      />

      <span className="sr-only">
        Toggle theme
      </span>
    </Button>
  );
}