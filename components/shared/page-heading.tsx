import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageHeadingProps {
  link?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeading({
  link,
  title,
  description,
  className
}: PageHeadingProps) {
  return (
    <div className={cn("space-y-4 text-center flex flex-col items-start", className)}>
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                    <BreadcrumbPage className="text-purple-400">
                        {title}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400/50">
          {description}
        </p>
      )}
    </div>
  );
}