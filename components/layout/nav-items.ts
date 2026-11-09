import {
  BookOpen,
  FlaskConical,
  History,
  Info,
  LayoutDashboard,
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
  { label: "About the System", href: "/about", icon: Info },
];
