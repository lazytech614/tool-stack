"use client";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { ContentGrid } from "@/components/shared/content-grid";
import { ContentCard } from "@/components/shared/content-card";

import { StarterKit, starterKits } from "@/constants/resources/starter-kits";
import { starterKitToContentCard } from "@/lib/content-mappers/starter-kit-to-content";

import { useContentFilter } from "@/hooks/useContentFilters";

export default function StarterKitsPage() {
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
    items: starterKits,
    storageKey: "toolstack:resources:starter-kits:pinned",
    getId: (kit) => kit.id,
    getFilter: (kit) => kit.framework,
    matchesSearch: (kit, q) =>
      kit.name.toLowerCase().includes(q) ||
      kit.description.toLowerCase().includes(q) ||
      kit.framework.toLowerCase().includes(q) ||
      kit.pricing.toLowerCase().includes(q) ||
      kit.stack.some((tech) => tech.toLowerCase().includes(q)),
  });

  const renderStarterKit = (kit: StarterKit) => (
    <ContentCard
      key={kit.id}
      item={starterKitToContentCard(kit)}
      clickable={false}
      pin={{
        pinned: pinnedSet.has(kit.id),
        onToggle: () => togglePin(kit.id),
      }}
    />
  );

  return (
    <main className="min-h-screen bg-white py-10 dark:bg-black">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
          <PageHeading
            title="Starter Kits"
            description="Complete starter kits with authentication, database, payments and more."
          />

          <div className="text-left md:shrink-0 md:text-right">
            <StatusBar
              items={starterKits}
              getName={(kit) => kit.name}
              itemLabel="starter kit"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search starter kits..."
            className="w-full lg:max-w-xs"
          />

          <CategoryFilter
            categories={[
              ...new Set(starterKits.map((kit) => kit.framework)),
            ]}
            selected={category}
            onChange={setCategory}
          />
        </div>

        {/* Search Results */}
        {isFiltering ? (
          <section className="mt-10">
            <SecondaryHeading
              title="Results"
              count={filtered.length}
              description={
                filtered.length === 0
                  ? "No starter kits match your search."
                  : undefined
              }
            />

            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="No starter kits found."
                renderItem={renderStarterKit}
              />
            </div>
          </section>
        ) : (
          <>
            {/* Pinned */}
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned Starter Kits"
                  description="Your saved starter kits appear here first."
                  count={pinned.length}
                />

                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No pinned starter kits."
                    renderItem={renderStarterKit}
                  />
                </div>
              </section>
            )}

            {/* Remaining */}
            <section className={pinned.length ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={
                  pinned.length
                    ? "All Other Starter Kits"
                    : "All Starter Kits"
                }
                description={
                  pinned.length
                    ? "Browse the remaining starter kits below."
                    : "Hover a card and click the pin icon to save a starter kit."
                }
                count={unpinned.length}
              />

              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No starter kits found."
                  renderItem={renderStarterKit}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}