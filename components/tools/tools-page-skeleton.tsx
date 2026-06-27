import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/shared/container";

function ToolCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>

      <Skeleton className="mt-5 h-5 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />

      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ToolsPageSkeleton() {
  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Heading */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Skeleton className="h-10 w-72" />
            <Skeleton className="mt-3 h-5 w-107.5 max-w-full" />
          </div>

          <Skeleton className="h-20 w-44 rounded-xl" />
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <Skeleton className="h-11 w-full lg:max-w-xs rounded-lg" />

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-24 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Section Heading */}
        <section className="mt-10">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />

          {/* Cards */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}