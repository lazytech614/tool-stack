import { ArrowRight, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "../shared/container";
import { ToolShowcase } from "./tool-showcase";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-white dark:bg-black">
      <Container>
        <div className="flex flex-col lg:flex-row justify-between gap-x-4">
          <div className="lg:w-1/2">
            <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 dark:border-purple-500/20 dark:bg-purple-500/10">
              ✨ AI-Powered GitHub Tools
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl">
              Ship Better Code.
              <span className="block bg-linear-to-r from-purple-600 via-purple-500 to-violet-600 dark:from-purple-400 dark:to-violet-600 bg-clip-text text-transparent">
                Faster.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              A collection of AI-powered tools to simplify your GitHub workflow. 
              Write better commit messages, generate PR descriptions, release notes, 
              and more.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/tools">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
                >
                  Explore Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <GitFork className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-linear-to-br from-purple-500 to-violet-600 ring-2 ring-white dark:ring-black"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Loved by developers worldwide
                </p>
                <div className="mt-1 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ToolShowcase />
        </div>
      </Container>
    </section>
  );
}