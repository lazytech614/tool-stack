import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/shared/container";

export function ToolPageSkeleton() {
  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Heading */}
        <div>
          <Skeleton className="h-10 w-72 rounded-md" />
          <Skeleton className="mt-3 h-5 w-120 max-w-full rounded-md" />
        </div>

        {/* Tool Container */}
        <div className="mt-10 rounded-xl border bg-background p-6">
          {/* Top action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-10 w-44 rounded-md" />

            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>

          {/* Main content */}
          <div className="mt-8 space-y-5">
            <Skeleton className="h-12 w-full rounded-lg" />

            <Skeleton className="h-40 w-full rounded-xl" />

            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>

            <Skeleton className="h-12 w-40 rounded-lg" />

            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    </main>
  );
}