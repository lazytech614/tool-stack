"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export function PageHeading({
  title,
  description,
  className,
}: PageHeadingProps) {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const breadcrumbs = segments.map(
    (segment, index) => ({
      label: formatSegment(segment),
      href:
        "/" +
        segments
          .slice(0, index + 1)
          .join("/"),
    })
  );

  return (
    <div
      className={cn(
        "space-y-4 flex flex-col items-start",
        className
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map(
            (crumb, index) => {
              const isLast =
                index ===
                breadcrumbs.length - 1;

              return (
                <div
                  key={crumb.href}
                  className="flex items-center"
                >
                  <BreadcrumbSeparator />

                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-purple-600 dark:text-purple-400">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={crumb.href}
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            }
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white/80 md:text-5xl uppercase">
        {title}
      </h2>

      {description && (
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}