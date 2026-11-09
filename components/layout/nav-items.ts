import {
  BookOpen,
  FlaskConical,
  History,
  Info,
  LayoutDashboard,
  Library,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Simple Linear Regression", href: "/regression", icon: TrendingUp },
  { label: "Hypothesis Testing", href: "/hypothesis-testing", icon: FlaskConical },
  { label: "Analysis History", href: "/history", icon: History },
  { label: "Documentation", href: "/documentation", icon: BookOpen },
  { label: "Study Guide", href: "/study-guide", icon: BookOpen },
  { label: "References", href: "/references", icon: Library },
  { label: "About the System", href: "/about", icon: Info },
];
