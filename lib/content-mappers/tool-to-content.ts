import { Tool, ToolCategory } from "@/constants/configs/tools";
import { CardColor, CardModel } from "@/types/content-card.types";

const TOOL_CATEGORY_COLORS: Record<ToolCategory, CardColor> = {
  Encoding: "blue",
  Formatting: "green",
  Comparison: "orange",
  Generator: "purple",
  Converter: "cyan",
  Preview: "yellow",
  Utilities: "gray",
};

export function toolToContentCard(tool: Tool): CardModel {
  return {
    id: tool.id,
    title: tool.name,
    description: tool.description,
    href: tool.href,
    icon: tool.icon,

    badges: [
      {
        label: tool.category,
        color: TOOL_CATEGORY_COLORS[tool.category],
      },
    ],

    isNew: tool.isNew,

    status: tool.status
      ? {
          label: tool.status,
          color: "purple",
        }
      : undefined,

    footerLabel: "Use Tool",
  };
}