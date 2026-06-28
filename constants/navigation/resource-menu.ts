import { createMegaMenuSections } from "@/lib/create-mega-menu-sections";
import { RESOURCE_CATEGORIES, RESOURCES } from "../configs/configs";

export const resourceSections = createMegaMenuSections(
  RESOURCES,
  RESOURCE_CATEGORIES
);