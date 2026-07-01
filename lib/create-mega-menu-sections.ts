import { LucideIcon } from "lucide-react";

interface Category<T extends string> {
  key: T;
  title: string;
  icon: LucideIcon;
}

export function createMegaMenuSections<
  TItem extends { category: string },
  TCategory extends string,
>(items: TItem[], categories: readonly Category<TCategory>[]) {
  return categories.map((category) => ({
    id: category.key,
    title: category.title,
    icon: category.icon,
    items: items.filter((item) => item.category === category.key),
  }));
}
