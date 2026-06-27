"use client";

import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Container } from "../shared/container";
import { ToolShowcase } from "./tool-showcase";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-10 md:py-20 lg:py-28 bg-white dark:bg-black">
      <Container>
        <div className="flex flex-col lg:flex-row justify-between gap-x-4">
          <div className="lg:w-1/2 space-y-6">
            <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 dark:border-purple-500/20 dark:bg-purple-500/10">
              ⚡Built for Developers
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl">
              Build Faster.
              <span className="block bg-linear-to-r from-purple-600 via-purple-500 to-violet-600 dark:from-purple-400 dark:to-violet-600 bg-clip-text text-transparent">
                Develop Smarter.
              </span>
            </h1>

            <p className=" max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Save time with a curated collection of essential developer utilities.
              Format code, convert data, generate content, validate inputs, and
              streamline your workflow without leaving your browser.
            </p>

            <div className=" flex flex-wrap gap-4">
              <Link href="/tools">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-purple-600 to-violet-600 text-white cursor-pointer group"
                >
                  Explore Tools

                  <MdKeyboardDoubleArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1.5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="default"
                className="cursor-pointer"
                onClick={() => window.open("https://github.com/lazytech614/tool-stack")}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                Star on GitHub
              </Button>
            </div>

            <div className=" flex gap-8 mb-8 lg:mb-0">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  25+
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Developer Tools
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-purple-600">
                  15+
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Categories
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-purple-600">
                  100%
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Free to Use
                </p>
              </div>
            </div>
          </div>

          <ToolShowcase />
        </div>
      </Container>
    </section>
  );
}