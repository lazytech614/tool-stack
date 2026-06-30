import { useEffect, useMemo, useState } from "react";
import { loadPinned, savePinned } from "@/lib/utils";

interface UseContentFilterOptions<T> {
  items: T[];
  storageKey?: string;
  getId?: (item: T) => string;
  enablePinning?: boolean;
  matchesSearch: (item: T, query: string) => boolean;
  getFilter: (item: T) => string;
}

export function useContentFilter<T>({
  items,
  storageKey,
  getId,
  matchesSearch,
  getFilter,
  enablePinning = true,
}: UseContentFilterOptions<T>) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!enablePinning || !storageKey) return;

    setPinnedIds(loadPinned(storageKey));
  }, [enablePinning, storageKey]);

  const togglePin = (id: string) => {
    if (!enablePinning || !storageKey) return;

    setPinnedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id];

      savePinned(storageKey, next);
      return next;
    });
  };


  const pinnedSet = useMemo(
    () => new Set(pinnedIds),
    [pinnedIds]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const searchMatch =
        !q || matchesSearch(item, q);

      const filterMatch =
        filter === "All" ||
        getFilter(item) === filter;

      return searchMatch && filterMatch;
    });
  }, [
    items,
    search,
    filter,
    matchesSearch,
    getFilter,
  ]);

  const pinned = useMemo(() => {
    if (!enablePinning || !getId) return [];

    return filtered.filter((item) => pinnedSet.has(getId(item)));
  }, [filtered, pinnedSet, getId, enablePinning]);

  const unpinned = useMemo(() => {
    if (!enablePinning || !getId) return filtered;

    return filtered.filter((item) => !pinnedSet.has(getId(item)));
  }, [filtered, pinnedSet, getId, enablePinning]);

  return {
    search,
    setSearch,
    filter,
    setFilter,
    pinnedIds,
    pinnedSet,
    filtered,
    pinned,
    unpinned,
    togglePin,
    isFiltering:
      search.trim() !== "" ||
      filter !== "All",
  };
}