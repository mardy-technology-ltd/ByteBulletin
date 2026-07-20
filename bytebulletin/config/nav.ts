export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Main public navigation
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Technology", href: "/category/technology" },
  { label: "Business", href: "/category/business" },
  { label: "Science", href: "/category/science" },
  { label: "Health", href: "/category/health" },
  { label: "Sports", href: "/category/sports" },
  { label: "World", href: "/category/world" },
];

// Admin sidebar navigation
export const adminNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
      { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Articles", href: "/admin/articles", icon: "Newspaper" },
      { label: "Sources", href: "/admin/sources", icon: "Rss" },
      { label: "Categories", href: "/admin/categories", icon: "Tag" },
    ],
  },
  {
    title: "AI",
    items: [
      { label: "AI Jobs", href: "/admin/ai-jobs", icon: "Sparkles" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Users", href: "/admin/users", icon: "Users" },
    ],
  },
];
