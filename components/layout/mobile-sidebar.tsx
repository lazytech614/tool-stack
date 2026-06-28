"use client";

import Link from "next/link";
import { useState } from "react";

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
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Zap,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { DiCodeigniter } from "react-icons/di";
import { FaGithub } from "react-icons/fa";
import { navLinks, LEARNING } from "@/constants/configs/configs";

const CATEGORIES: {
  key: "reference" | "guides";
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "reference", label: "Reference", icon: BookOpen },
  { key: "guides", label: "Guides", icon: GraduationCap },
];

export function MobileSidebar() {
  const [learningOpen, setLearningOpen] = useState(false);

  const grouped = LEARNING.reduce(
    (acc, link) => {
      (acc[link.category as "reference" | "guides"] ??= []).push(link);
      return acc;
    },
    {} as Record<"reference" | "guides", typeof LEARNING>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[92%] p-0 backdrop-blur-2xl bg-white/95 border-zinc-200 dark:bg-black/95 dark:border-zinc-800"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="p-6">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex items-center">
              <DiCodeigniter className="h-5 w-5" />
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Tool
                  <span className="text-purple-600 dark:text-purple-400">
                    Stack
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6">
            <div className="space-y-3">
              {/* Regular nav links */}
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border p-4 transition-all bg-white border-zinc-200 hover:border-purple-300 hover:bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:hover:border-purple-500/30 dark:hover:bg-zinc-900"
                >
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {item.label}
                  </p>
                  <ChevronRight className="h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}

              {/* Learning accordion */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden
                  ${
                    learningOpen
                      ? "border-purple-300 bg-zinc-50 dark:border-purple-500/30 dark:bg-zinc-900"
                      : "bg-white border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800"
                  }
                `}
              >
                {/* Accordion trigger */}
                <button
                  onClick={() => setLearningOpen((v) => !v)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Learn
                  </p>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${
                      learningOpen ? "rotate-180 text-purple-500 dark:text-purple-400" : ""
                    }`}
                  />
                </button>

                {/* Accordion content */}
                {learningOpen && (
                  <div className="px-3 pb-3 space-y-4">
                    {CATEGORIES.map(({ key, label, icon: CatIcon }) => (
                      <div key={key}>
                        {/* Category label */}
                        <div className="flex items-center gap-1.5 px-2 mb-1.5">
                          <CatIcon className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            {label}
                          </span>
                        </div>

                        {/* Links */}
                        <div className="space-y-1">
                          {grouped[key]?.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white dark:hover:bg-zinc-800/60"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover/item:bg-purple-100 dark:group-hover/item:bg-purple-900/40 transition-colors">
                                  <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors" />
                                </span>
                                <span className="flex flex-col">
                                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                    {link.label}
                                  </span>
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 leading-snug">
                                    {link.description}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            <Separator />
          </div>

          {/* GitHub CTA */}
          <div className="px-6">
            <Button
              className="h-16 w-full justify-between rounded-2xl border bg-purple-50 text-zinc-900 border-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-white dark:border-purple-500/30 dark:hover:bg-purple-500/15"
            >
              <div className="flex items-center gap-3">
                <FaGithub className="h-5 w-5" />
                <span className="font-medium">Star on GitHub</span>
              </div>
              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1" />

          {/* Bottom Card */}
          <div className="p-6">
            <div className="rounded-3xl border p-5 bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/15">
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