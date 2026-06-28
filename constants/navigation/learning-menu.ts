import { LEARNING, LEARNING_CATEGORIES } from "@/constants/configs/configs";
import { createMegaMenuSections } from "@/lib/create-mega-menu-sections";

export const learningSections = createMegaMenuSections(
  LEARNING,
  LEARNING_CATEGORIES
);