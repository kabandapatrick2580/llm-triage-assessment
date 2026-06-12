import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  HelpCircle,
  Home,
  Inbox,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match exactly (for index routes) vs. prefix match. */
  end?: boolean;
  description: string;
}

/** UC2 — Grounded Knowledge Assistant (RAG). */
export const KNOWLEDGE_NAV: NavItem[] = [
  {
    label: "Assistant",
    to: "/knowledge",
    icon: MessageSquareText,
    end: true,
    description: "Ask grounded questions",
  },
  {
    label: "Documents",
    to: "/knowledge/documents",
    icon: FileText,
    description: "Manage the knowledge base",
  },
  {
    label: "Unanswered",
    to: "/knowledge/admin",
    icon: HelpCircle,
    description: "Resolve knowledge gaps",
  },
  {
    label: "Analytics",
    to: "/knowledge/analytics",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
];

/** UC1 — Smart Intake Triage. */
export const TRIAGE_NAV: NavItem[] = [
  {
    label: "Overview",
    to: "/triage",
    icon: LayoutDashboard,
    end: true,
    description: "Triage metrics at a glance",
  },
  {
    label: "Intake Queue",
    to: "/triage/queue",
    icon: ListChecks,
    description: "Raw messages awaiting triage",
  },
  {
    label: "Triage Inbox",
    to: "/triage/inbox",
    icon: Inbox,
    description: "Every triaged ticket",
  },
];

/** Shown at the top of every app sidebar to get back to the landing page. */
export const HOME_NAV: NavItem = {
  label: "All apps",
  to: "/",
  icon: Home,
  end: true,
  description: "Back to the home page",
};
