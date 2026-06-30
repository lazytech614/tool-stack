"use client";

import { useMemo } from "react";

import {
  glossaryTerms,
  categories,
  type Category,
  type GlossaryTerm,
} from "@/constants/learnings/glossary";

import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBar } from "@/components/shared/satus-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { useContentFilter } from "@/hooks/useContentFilters";
import Link from "next/link";


// ─────────────────────────────────────────────────────────────────────────────
// Category colors
// ─────────────────────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  networking:
    "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  javascript:
    "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-500",
  devops:
    "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  database:
    "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
  patterns:
    "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// A–Z Jump Bar
// ─────────────────────────────────────────────────────────────────────────────

function AlphabetBar({ available }: { available: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
        const active = available.includes(letter);

        return active ? (
          <Link
            key={letter}
            href={`#letter-${letter}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/40"
          >
            {letter}
          </Link>
        ) : (
          <span
            key={letter}
            className="flex h-7 w-7 cursor-default items-center justify-center rounded-md text-xs font-medium text-zinc-300 dark:text-zinc-700"
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Term Card
// ─────────────────────────────────────────────────────────────────────────────

function TermCard({ term }: { term: GlossaryTerm }) {
  return (
    <div
      className="
      rounded-2xl border border-zinc-200 bg-white p-5
      transition-all duration-200
      hover:border-purple-300 hover:shadow-sm hover:shadow-purple-100/40
      dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-purple-500/40
    "
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          {term.term}
        </h3>

        <span
          className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${
            categoryColors[term.category]
          }`}
        >
          {term.category}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {term.definition}
      </p>

      {term.related && term.related.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            Related:
          </span>

          {term.related.map((r) => (
            <span
              key={r}
              className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Letter Group
// ─────────────────────────────────────────────────────────────────────────────

function LetterGroup({
  letter,
  terms,
}: {
  letter: string;
  terms: GlossaryTerm[];
}) {
  return (
    <div id={`letter-${letter}`} className="mt-10 scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-sm font-extrabold text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
          {letter}
        </span>

        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {terms.map((term) => (
          <TermCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GlossaryPage() {
  const {
    search,
    setSearch,
    filter: category,
    setFilter: setCategory,
    filtered,
  } = useContentFilter({
    items: glossaryTerms,
    enablePinning: false,
    getFilter: (term) => term.category,
    matchesSearch: (term, q) =>
      term.term.toLowerCase().includes(q) ||
      term.definition.toLowerCase().includes(q) ||
      term.related?.some((r) => r.toLowerCase().includes(q)) ||
      false,
  });

  const grouped = useMemo(() => {
    return filtered.reduce((acc, term) => {
      const letter = term.term[0].toUpperCase();
      (acc[letter] ??= []).push(term);
      return acc;
    }, {} as Record<string, GlossaryTerm[]>);
  }, [filtered]);

  const availableLetters = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen bg-white py-10 dark:bg-black">
      <Container>
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between">
          <PageHeading
            title="Glossary"
            description="Plain-English definitions for developer terminology. Search a term or browse by category."
          />

          <div className="text-left md:shrink-0 md:text-right">
            <StatusBar
              items={glossaryTerms}
              getName={(term) => term.term}
              itemLabel="glossary"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search glossary..."
            className="w-full"
          />

          <CategoryFilter
            categories={categories.filter((c) => c !== "all")}
            selected={category}
            onChange={(value) => setCategory(value as Category | "All")}
          />
        </div>

        {!search && category === "All" && (
          <div className="mt-4">
            <AlphabetBar available={availableLetters} />
          </div>
        )}

        {availableLetters.length > 0 ? (
          availableLetters.map((letter) => (
            <LetterGroup
              key={letter}
              letter={letter}
              terms={grouped[letter]}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              No terms found
            </p>

            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Try a different search or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-4 text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </Container>
    </main>
  );
}