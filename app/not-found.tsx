import Link from "next/link";
import { Home, Search, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-white px-6 dark:bg-black">
      {/* Background Glow */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10" />
      </div>

      {/* Grid Pattern */}

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e720_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e720_1px,transparent_1px)] bg-size-[48px_48px] opacity-40 dark:bg-[linear-gradient(to_right,#27272a40_1px,transparent_1px),linear-gradient(to_bottom,#27272a40_1px,transparent_1px)]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Status Badge */}

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
          <Search className="h-4 w-4" />
          Page Not Found
        </div>

        {/* Error Code */}

        <div className="bg-linear-to-r from-purple-600 via-purple-500 to-violet-600 bg-clip-text text-7xl font-black tracking-tight text-transparent md:text-9xl">
          404
        </div>

        {/* Heading */}

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
          This page doesn&apos;t exist
        </h1>

        {/* Description */}

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          The route you&apos;re looking for may have been moved, deleted, or never existed. Try
          exploring one of the available developer tools instead.
        </p>

        {/* Action Buttons */}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-linear-to-r from-purple-600 to-violet-600 text-white hover:opacity-90"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back Home
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-zinc-200 bg-white hover:border-purple-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-500/30"
          >
            <Link href="/tools">
              <Wrench className="mr-2 h-4 w-4" />
              Browse Tools
            </Link>
          </Button>
        </div>

        {/* Developer Card */}

        <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-left shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-purple-500/10">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Lost while navigating?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                GitHub Helper includes utilities for commit generation, formatting, encoding,
                conversion, previews, and developer workflows. Jump back to the tools directory and
                continue building.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
