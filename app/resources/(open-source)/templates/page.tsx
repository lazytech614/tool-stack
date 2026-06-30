"use client";

import { CategoryFilter } from "@/components/shared/category-filter";
import { Container } from "@/components/shared/container";
import { ContentCard } from "@/components/shared/content-card";
import { ContentGrid } from "@/components/shared/content-grid";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { SecondaryHeading } from "@/components/shared/secondary-heading";
import { RESOURCES_TEMPLATES, Template } from "@/constants/resources/templates";
import { useContentFilter } from "@/hooks/useContentFilters";
import { templateToContentCard } from "@/lib/content-mappers/template-to-content";

export default function TemplatesPage() {
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
    items: RESOURCES_TEMPLATES,
    storageKey: "toolstack:resources:templates:pinned",
    getId: (t) => t.id,
    getFilter: (t) => t.category,
    matchesSearch: (t, q) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.framework.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q),
  });

  const renderTemplate = (template: Template) => (
    <ContentCard
      key={template.id}
      item={templateToContentCard(template)}
      clickable={false}
      pin={{
        pinned: pinnedSet.has(template.id),
        onToggle: () => togglePin(template.id),
      }}
    />
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Top row: heading + status */}
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="Templates"
            description="Production-ready project templates for popular frameworks."
          />
          <div className="text-left md:text-right md:shrink-0">
            <StatusBar
              items={RESOURCES_TEMPLATES}
              getName={(template) => template.name}
              itemLabel="template"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search templates..."
            className="w-full lg:max-w-xs"
          />
          <CategoryFilter
            categories={[...new Set(RESOURCES_TEMPLATES.map((t) => t.category))]}
            selected={category}
            onChange={setCategory}
          />
        </div>

        {/* When filtering, show a flat merged list */}
        {isFiltering ? (
          <section className="mt-10">
            <SecondaryHeading
              title="Results"
              description={
                filtered.length === 0
                  ? "No templates match your search."
                  : undefined
              }
              count={filtered.length}
            />
            <div className="mt-5">
              <ContentGrid
                items={filtered}
                emptyMessage="No templates found."
                renderItem={renderTemplate}
              />
            </div>
          </section>
        ) : (
          <>
            {/* Pinned templates */}
            {pinned.length > 0 && (
              <section className="mt-10">
                <SecondaryHeading
                  title="Pinned Templates"
                  description="Your saved templates appear here first."
                  count={pinned.length}
                />
                <div className="mt-5">
                  <ContentGrid
                    items={pinned}
                    emptyMessage="No templates found."
                    renderItem={renderTemplate}
                  />
                </div>
              </section>
            )}

            {/* All other templates */}
            <section className={pinned.length > 0 ? "mt-12" : "mt-10"}>
              <SecondaryHeading
                title={pinned.length > 0 ? "All Other Templates" : "All Templates"}
                description={
                  pinned.length > 0
                    ? "The full utility list lives below your pinned templates."
                    : "Hover a card and click the pin icon to save a template."
                }
                count={unpinned.length}
              />
              <div className="mt-5">
                <ContentGrid
                  items={unpinned}
                  emptyMessage="No templates found."
                  renderItem={renderTemplate}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}