"use client";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { ContentCard } from "@/components/shared/content-card";
import { ContentGrid } from "@/components/shared/content-grid";
import { TagFilter } from "@/components/shared/tag-filter";

import { cheatsheets, type Cheatsheet } from "@/constants/learnings/cheatsheets";

import { cheatsheetToContentCard } from "@/lib/content-mappers/cheatsheet-to-content";
import { useContentFilter } from "@/hooks/useContentFilters";

export default function CheatsheetsPage() {
  const {
    search,
    setSearch,
    filter: activeTag,
    setFilter: setActiveTag,
    filtered,
    pinned,
    unpinned,
    pinnedSet,
    togglePin,
    isFiltering,
  } = useContentFilter({
    items: cheatsheets,
    storageKey: "toolstack:learn:cheatsheets:pinned",
    getId: (sheet) => sheet.slug,
    getFilter: (sheet) => sheet.tag,
    matchesSearch: (sheet, q) =>
      sheet.title.toLowerCase().includes(q) ||
      sheet.description.toLowerCase().includes(q) ||
      sheet.tag.toLowerCase().includes(q),
  });

  const renderCheatsheet = (sheet: Cheatsheet) => (
    <ContentCard
      key={sheet.slug}
      item={cheatsheetToContentCard(sheet)}
      pin={{
        pinned: pinnedSet.has(sheet.slug),
        onToggle: () => togglePin(sheet.slug),
      }}
    />
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="Cheatsheets"
            description="Quick syntax references for the tools you use every day. No fluff, just the commands and patterns you actually need."
          />

          <div className="text-left md:text-right md:shrink-0">
            <StatusBar
              items={cheatsheets}
              getName={(sheet) => sheet.title}
              itemLabel="cheatsheet"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search cheatsheets..."
            className="w-full lg:max-w-xs"
          />

          <TagFilter
            active={activeTag}
            onChange={setActiveTag}
          />
        </div>

        {isFiltering ? (
          <section className="mt-10">
            <SecondaryHeading
              title="Results"
              count={filtered.length}
              description={
                filtered.length === 0
                  ? "No cheatsheets match your search."
                  : undefined
              }
            />

            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="No cheatsheets found."
                renderItem={renderCheatsheet}
              />
            </div>
          </section>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned Cheatsheets"
                  description="Your saved cheatsheets appear here first."
                  count={pinned.length}
                />

                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No pinned cheatsheets."
                    renderItem={renderCheatsheet}
                  />
                </div>
              </section>
            )}

            <section className={pinned.length > 0 ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={
                  pinned.length
                    ? "All Other Cheatsheets"
                    : "All Cheatsheets"
                }
                description={
                  pinned.length
                    ? "Browse the remaining cheatsheets below."
                    : "Hover a card and click the pin icon to save a cheatsheet."
                }
                count={unpinned.length}
              />

              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No cheatsheets found."
                  renderItem={renderCheatsheet}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}