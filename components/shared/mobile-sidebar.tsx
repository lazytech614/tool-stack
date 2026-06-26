"use client";

import Link from "next/link";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Menu,
  GitFork,
  ArrowUpRight,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  DollarSign,
  Zap,
} from "lucide-react";

const links = [
  {
    title: "Home",
    href: "/",
    icon: LayoutGrid,
  },
  {
    title: "Tools",
    href: "/tools",
    icon: LayoutGrid,
  },
  {
    title: "Features",
    href: "/features",
    icon: Sparkles,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: DollarSign,
  },
];

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="
          w-[92%]
          p-0
          backdrop-blur-2xl

          bg-white/95
          border-zinc-200

          dark:bg-black/95
          dark:border-zinc-800
        "
      >
        <div className="flex h-full flex-col">
          {/* Header */}

          <div className="p-6">
            <SheetTitle className="sr-only">
              Navigation
            </SheetTitle>

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-100
                  dark:bg-purple-500/15
                "
              >
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  GitHub
                  <span className="text-purple-600 dark:text-purple-400">
                    {" "}
                    Helper
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Navigation */}

          <div className="px-6">
            <div className="space-y-4">
              {links.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      p-4
                      transition-all

                      bg-white
                      border-zinc-200

                      hover:border-purple-300
                      hover:bg-zinc-50

                      dark:bg-zinc-900/40
                      dark:border-zinc-800
                      dark:hover:border-purple-500/30
                      dark:hover:bg-zinc-900
                    "
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl

                          bg-purple-100
                          dark:bg-purple-500/10
                        "
                      >
                        <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>

                      <span className="font-medium text-zinc-900 dark:text-white">
                        {item.title}
                      </span>
                    </div>

                    <ChevronRight
                      className="
                        h-5
                        w-5
                        text-zinc-400
                        dark:text-zinc-500
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-8">
            <Separator />
          </div>

          {/* GitHub CTA */}

          <div className="px-6">
            <Button
              className="
                h-16
                w-full
                justify-between
                rounded-2xl
                border

                bg-purple-50
                text-zinc-900
                border-purple-200

                hover:bg-purple-100

                dark:bg-purple-500/10
                dark:text-white
                dark:border-purple-500/30
                dark:hover:bg-purple-500/15
              "
            >
              <div className="flex items-center gap-3">
                <GitFork className="h-5 w-5" />

                <span className="font-medium">
                  Star on GitHub
                </span>
              </div>

              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1" />

          {/* Bottom Card */}

          <div className="p-6">
            <div
              className="
                rounded-3xl
                border
                p-5

                bg-zinc-50
                border-zinc-200

                dark:bg-zinc-900/50
                dark:border-zinc-800
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl

                    bg-purple-100
                    dark:bg-purple-500/15
                  "
                >
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>

                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    Boost your workflow
                  </p>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    AI-powered developer tools
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Build faster with GitHub Helper
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}