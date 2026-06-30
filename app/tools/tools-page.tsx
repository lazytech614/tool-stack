"use client";

import { useCallback } from "react";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { ContentCard } from "@/components/shared/content-card";
import { ContentGrid } from "@/components/shared/content-grid";

import { ALL_TOOLS, CATEGORIES } from "@/constants/configs/tools";

import { toolToContentCard } from "@/lib/content-mappers/tool-to-content";
import { useContentFilter } from "@/hooks/useContentFilters";

export default function ToolsPage() {
  const {
    search,
    setSearch,
    filter: category,
    setFilter: setCategory,
    pinnedSet,
    filtered,
    pinned,
    unpinned,
    togglePin,
    isFiltering,
  } = useContentFilter({
    items: ALL_TOOLS,
    storageKey: "toolstack:dev-tools:pinned",
    getId: (tool) => tool.id,
    getFilter: (tool) => tool.category,
    matchesSearch: (tool, q) =>
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q),
  });

  const renderTool = useCallback(
    (tool: (typeof ALL_TOOLS)[number]) => (
      <ContentCard
        key={tool.id}
        item={toolToContentCard(tool)}
        pin={{
          pinned: pinnedSet.has(tool.id),
          onToggle: () => togglePin(tool.id),
        }}
      />
    ),
    [pinnedSet, togglePin]
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="Developer Tools"
            description="Essential developer tools and offline code converters."
          />

          <div className="text-left md:text-right md:shrink-0">
            <StatusBar
              items={ALL_TOOLS}
              getName={(tool) => tool.name}
              itemLabel="tool"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tools..."
            className="w-full lg:max-w-xs"
          />

          <CategoryFilter
            categories={CATEGORIES}
            selected={category}
            onChange={setCategory}
          />
        </div>

        {isFiltering ? (
          <section className="mt-10">
            <SecondaryHeading
              title="Results"
              description={
                filtered.length === 0
                  ? "No tools match your search."
                  : undefined
              }
              count={filtered.length}
            />

            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="Try another search or category."
                renderItem={renderTool}
              />
            </div>
          </section>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned Tools"
                  description="Your saved tools appear here first."
                  count={pinned.length}
                />

                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No pinned tools."
                    renderItem={renderTool}
                  />
                </div>
              </section>
            )}

            <section className={pinned.length > 0 ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={
                  pinned.length > 0
                    ? "All Other Tools"
                    : "All Tools"
                }
                description={
                  pinned.length > 0
                    ? "The full utility list lives below your pinned tools."
                    : "Hover a card and click the pin icon to save a tool."
                }
                count={unpinned.length}
              />

              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No tools found."
                  renderItem={renderTool}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}