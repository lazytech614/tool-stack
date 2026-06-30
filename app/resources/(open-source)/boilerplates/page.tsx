"use client";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { ContentGrid } from "@/components/shared/content-grid";
import { ContentCard } from "@/components/shared/content-card";

import { boilerplates, Boilerplate } from "@/constants/resources/boilerplates";
import { boilerplateToContentCard } from "@/lib/content-mappers/boilerplate-to-content";
import { useContentFilter } from "@/hooks/useContentFilters";

export default function BoilerplatesPage() {
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
    items: boilerplates,
    storageKey: "toolstack:resources:boilerplates:pinned",
    getId: (boilerplate) => boilerplate.id,
    getFilter: (boilerplate) => boilerplate.category,
    matchesSearch: (boilerplate, q) =>
      boilerplate.name.toLowerCase().includes(q) ||
      boilerplate.description.toLowerCase().includes(q) ||
      boilerplate.category.toLowerCase().includes(q) ||
      boilerplate.difficulty.toLowerCase().includes(q) ||
      boilerplate.license.toLowerCase().includes(q) ||
      boilerplate.stack.some((tech) =>
        tech.toLowerCase().includes(q)
      ) ||
      boilerplate.includes.some((item) =>
        item.toLowerCase().includes(q)
      ),
  });

  const renderBoilerplate = (boilerplate: Boilerplate) => (
    <ContentCard
      key={boilerplate.id}
      item={boilerplateToContentCard(boilerplate)}
      clickable={false}
      pin={{
        pinned: pinnedSet.has(boilerplate.id),
        onToggle: () => togglePin(boilerplate.id),
      }}
    />
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="Boilerplates"
            description="Kickstart projects with scalable boilerplate codebases."
          />

          <div className="text-left md:text-right md:shrink-0">
            <StatusBar
              items={boilerplates}
              getName={(boilerplate) => boilerplate.name}
              itemLabel="boilerplate"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search boilerplates..."
            className="w-full lg:max-w-xs"
          />

          <CategoryFilter
            categories={[
              ...new Set(
                boilerplates.map((boilerplate) => boilerplate.category)
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
                  ? "No boilerplates match your search."
                  : undefined
              }
            />

            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="No boilerplates found."
                renderItem={renderBoilerplate}
              />
            </div>
          </section>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned Boilerplates"
                  description="Your saved boilerplates appear here first."
                  count={pinned.length}
                />

                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No pinned boilerplates."
                    renderItem={renderBoilerplate}
                  />
                </div>
              </section>
            )}

            <section className={pinned.length > 0 ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={
                  pinned.length
                    ? "All Other Boilerplates"
                    : "All Boilerplates"
                }
                description={
                  pinned.length
                    ? "Browse the remaining boilerplates below."
                    : "Hover a card and click the pin icon to save a boilerplate."
                }
                count={unpinned.length}
              />

              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No boilerplates found."
                  renderItem={renderBoilerplate}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}