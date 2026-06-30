"use client";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { ContentGrid } from "@/components/shared/content-grid";
import { ContentCard } from "@/components/shared/content-card";

import { cliTools, CLITool } from "@/constants/resources/cli-tools";
import { cliToolToContentCard } from "@/lib/content-mappers/cli-tool-to-content";
import { useContentFilter } from "@/hooks/useContentFilters";

export default function CLIToolsPage() {
  const {
    search,
    setSearch,
    filter: category,
    setFilter: setCategory,
    filtered,
    pinned,
    unpinned,
    pinnedSet,
    togglePin,
    isFiltering,
  } = useContentFilter({
    items: cliTools,
    storageKey: "toolstack:resources:cli-tools:pinned",
    getId: (tool) => tool.id,
    getFilter: (tool) => tool.category[0],
    matchesSearch: (tool, q) =>
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.some((category) =>
        category.toLowerCase().includes(q)
      ) ||
      tool.tags.some((tag) =>
        tag.toLowerCase().includes(q)
      ) ||
      tool.shells.some((shell) =>
        shell.toLowerCase().includes(q)
      ) ||
      tool.os.some((os) =>
        os.toLowerCase().includes(q)
      ) ||
      tool.version.toLowerCase().includes(q),
  });

  const renderTool = (tool: CLITool) => (
    <ContentCard
      key={tool.id}
      item={cliToolToContentCard(tool)}
      clickable={false}
      pin={{
        pinned: pinnedSet.has(tool.id),
        onToggle: () => togglePin(tool.id),
      }}
    />
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="CLI Tools"
            description="Powerful command-line utilities used by modern developers."
          />

          <div className="text-left md:text-right md:shrink-0">
            <StatusBar
              items={cliTools}
              getName={(tool) => tool.name}
              itemLabel="CLI tool"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search CLI tools..."
            className="w-full lg:max-w-xs"
          />

          <CategoryFilter
            categories={[
              ...new Set(cliTools.flatMap((tool) => tool.category)),
            ]}
            selected={category}
            onChange={setCategory}
          />
        </div>

        {isFiltering ? (
          <section className="mt-10">
            <SecondaryHeading
              title="Results"
              count={filtered.length}
              description={
                filtered.length === 0
                  ? "No CLI tools match your search."
                  : undefined
              }
            />

            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="No CLI tools found."
                renderItem={renderTool}
              />
            </div>
          </section>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned CLI Tools"
                  description="Your saved CLI tools appear here first."
                  count={pinned.length}
                />

                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No pinned CLI tools."
                    renderItem={renderTool}
                  />
                </div>
              </section>
            )}

            <section className={pinned.length > 0 ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={
                  pinned.length
                    ? "All Other CLI Tools"
                    : "All CLI Tools"
                }
                description={
                  pinned.length
                    ? "Browse the remaining command-line utilities below."
                    : "Hover a card and click the pin icon to save a CLI tool."
                }
                count={unpinned.length}
              />

              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No CLI tools found."
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