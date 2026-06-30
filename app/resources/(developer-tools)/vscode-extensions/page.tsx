"use client";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { ContentGrid } from "@/components/shared/content-grid";
import { ContentCard } from "@/components/shared/content-card";

import { vscodeExtensions, VSCodeExtension } from "@/constants/resources/vs-code-extensions";
import { useContentFilter } from "@/hooks/useContentFilters";
import { vscodeExtensionToContentCard } from "@/lib/content-mappers/vs-code-extension-to-content";

export default function VSCodeExtensionsPage() {
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
    items: vscodeExtensions,
    storageKey: "toolstack:resources:vscode-extensions:pinned",
    getId: (extension) => extension.id,
    getFilter: (extension) => extension.category[0],
    matchesSearch: (extension, q) =>
      extension.name.toLowerCase().includes(q) ||
      extension.description.toLowerCase().includes(q) ||
      extension.publisher.toLowerCase().includes(q) ||
      extension.category.some((category) =>
        category.toLowerCase().includes(q)
      ) ||
      extension.tags.some((tag) =>
        tag.toLowerCase().includes(q)
      ),
  });

  const renderExtension = (extension: VSCodeExtension) => (
    <ContentCard
      key={extension.id}
      item={vscodeExtensionToContentCard(extension)}
      clickable={false}
      pin={{
        pinned: pinnedSet.has(extension.id),
        onToggle: () => togglePin(extension.id),
      }}
    />
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="VS Code Extensions"
            description="Essential extensions to boost your development workflow."
          />

          <div className="text-left md:text-right md:shrink-0">
            <StatusBar
              items={vscodeExtensions}
              getName={(extension) => extension.name}
              itemLabel="extension"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search VS Code extensions..."
            className="w-full lg:max-w-xs"
          />

          <CategoryFilter
            categories={[
              ...new Set(
                vscodeExtensions.flatMap(
                  (extension) => extension.category
                )
              ),
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
                  ? "No VS Code extensions match your search."
                  : undefined
              }
            />

            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="No VS Code extensions found."
                renderItem={renderExtension}
              />
            </div>
          </section>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned Extensions"
                  description="Your saved VS Code extensions appear here first."
                  count={pinned.length}
                />

                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No pinned extensions."
                    renderItem={renderExtension}
                  />
                </div>
              </section>
            )}

            <section className={pinned.length > 0 ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={
                  pinned.length
                    ? "All Other Extensions"
                    : "All Extensions"
                }
                description={
                  pinned.length
                    ? "Browse the remaining VS Code extensions below."
                    : "Hover a card and click the pin icon to save an extension."
                }
                count={unpinned.length}
              />

              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No VS Code extensions found."
                  renderItem={renderExtension}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}