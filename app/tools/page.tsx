"use client"

import { useState, useMemo } from "react"
import { Container } from "@/components/shared/container"
import { PageHeading } from "@/components/shared/page-heading"
import { ALL_TOOLS, CATEGORIES, ToolCategory } from "@/constants/tools"
import { StatusBar } from "@/components/tools/satus-bar"
import { SearchBar } from "@/components/shared/search-bar"
import { CategoryFilter } from "@/components/tools/category-filter"
import { SecondarySectionHeader } from "@/components/shared/secondary-section-header"
import { ToolsGrid } from "@/components/tools/tools-grid"

const PINNED_STORAGE_KEY = "dev-tools:pinned"

function loadPinned(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(PINNED_STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

function savePinned(ids: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(ids))
}

const ToolsPage = () => {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<ToolCategory | "All">("All")
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => loadPinned())

  const handleTogglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      savePinned(next)
      return next
    })
  }

  const filteredTools = useMemo(() => {
    const q = search.toLowerCase().trim()
    return ALL_TOOLS.filter((tool) => {
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
      const matchesCategory = category === "All" || tool.category === category
      return matchesSearch && matchesCategory
    })
  }, [search, category])

  const pinnedTools = useMemo(
    () => filteredTools.filter((t) => pinnedIds.includes(t.id)),
    [filteredTools, pinnedIds]
  )

  const unpinnedTools = useMemo(
    () => filteredTools.filter((t) => !pinnedIds.includes(t.id)),
    [filteredTools, pinnedIds]
  )

  const isFiltering = search.trim() !== "" || category !== "All"

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        {/* Top row: heading + status */}
        <div className="flex flex-col gap-4 md:flex-row items-start md:justify-between">
          <PageHeading
            title="Developer Tools"
            description="Essential developer tools and offline code converters."
          />
          <div className="text-left md:text-right md:shrink-0">
            <StatusBar tools={ALL_TOOLS} />
          </div>
        </div>

        {/* Controls */}
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

        {/* When filtering, show a flat merged list */}
        {isFiltering ? (
          <section className="mt-10">
            <SecondarySectionHeader
              title="Results"
              description={
                filteredTools.length === 0
                  ? "No tools match your search."
                  : undefined
              }
              count={filteredTools.length}
            />
            <div className="mt-5">
              <ToolsGrid
                tools={filteredTools}
                pinnedIds={pinnedIds}
                onTogglePin={handleTogglePin}
                emptyMessage="Try a different search term or category."
              />
            </div>
          </section>
        ) : (
          <>
            {/* Pinned tools */}
            {pinnedIds.length > 0 && (
              <section className="mt-10">
                <SecondarySectionHeader
                  title="Pinned Tools"
                  description="Your saved tools appear here first."
                  count={pinnedTools.length}
                />
                <div className="mt-5">
                  <ToolsGrid
                    tools={pinnedTools}
                    pinnedIds={pinnedIds}
                    onTogglePin={handleTogglePin}
                  />
                </div>
              </section>
            )}

            {/* All other tools */}
            <section className={pinnedIds.length > 0 ? "mt-12" : "mt-10"}>
              <SecondarySectionHeader
                title={pinnedIds.length > 0 ? "All Other Tools" : "All Tools"}
                description={
                  pinnedIds.length > 0
                    ? "The full utility list lives below your pinned tools."
                    : "Hover a card and click the pin icon to save a tool."
                }
                count={unpinnedTools.length}
              />
              <div className="mt-5">
                <ToolsGrid
                  tools={unpinnedTools}
                  pinnedIds={pinnedIds}
                  onTogglePin={handleTogglePin}
                />
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  )
}

export default ToolsPage