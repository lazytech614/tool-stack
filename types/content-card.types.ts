import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export type CardColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "yellow"
  | "cyan"
  | "gray";

export interface CardBadge {
  label: string;
  color: CardColor;
}

export interface CardStatus {
  label: string;
  color: CardColor;
}

export interface CardModel {
  id: string;
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  badges: CardBadge[];
  footerLabel?: string;
  isNew?: boolean;
  status?: CardStatus;

  /**
   * Custom section rendered below description.
   */
  content?: ReactNode;

  /**
   * Optional custom actions.
   * Example:
   * - View Demo
   * - GitHub
   * - Docs
   */
  actions?: ReactNode;
}

export interface ContentCardProps {
  item: CardModel;
  clickable?: boolean;

  pin?: {
    pinned: boolean;
    onToggle: () => void;
  };
}