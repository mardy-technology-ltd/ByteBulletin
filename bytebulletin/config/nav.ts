export type NavItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Main public top bar featured items
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Technology", href: "/category/technology" },
  { label: "Business", href: "/category/business" },
  { label: "Science", href: "/category/science" },
  { label: "World", href: "/category/world" },
];

// Mega Menu 20+ Categorized Topics
export const megaMenuCategories: NavGroup[] = [
  {
    title: "AI & Innovation",
    items: [
      { label: "Artificial Intelligence", href: "/category/technology", description: "LLMs, GPT-5, Agents & Neural Nets", icon: "Brain" },
      { label: "Machine Learning", href: "/category/technology", description: "Models, Datasets & Deep Learning", icon: "Cpu" },
      { label: "Robotics & Automation", href: "/category/technology", description: "Humanoids, Drones & Autonomous Tech", icon: "Bot" },
      { label: "Quantum Computing", href: "/category/technology", description: "Next-gen Qubits & Supercomputing", icon: "Zap" },
      { label: "Generative Media", href: "/category/technology", description: "AI Video, Image & Audio Synthesis", icon: "Sparkles" },
    ],
  },
  {
    title: "Core Tech & Security",
    items: [
      { label: "Software & Dev", href: "/category/technology", description: "Frameworks, Cloud & Modern Web", icon: "Code2" },
      { label: "Hardware & Chips", href: "/category/technology", description: "Semiconductors, GPUs & Silicon", icon: "HardDrive" },
      { label: "Cybersecurity", href: "/category/technology", description: "Zero Trust, Threats & Encryption", icon: "ShieldCheck" },
      { label: "Cloud & DevOps", href: "/category/technology", description: "AWS, Azure & Microservices", icon: "Cloud" },
      { label: "Big Data & ML", href: "/category/technology", description: "Data Warehouses & Pipelines", icon: "Database" },
    ],
  },
  {
    title: "Business & Policy",
    items: [
      { label: "Tech Business", href: "/category/business", description: "Big Tech Earnings & Valuations", icon: "Building2" },
      { label: "Startups & VC", href: "/category/business", description: "Funding Rounds & Unicorns", icon: "Rocket" },
      { label: "FinTech & Markets", href: "/category/business", description: "Digital Assets, Crypto & Banking", icon: "TrendingUp" },
      { label: "AI Policy & Ethics", href: "/category/business", description: "Regulations, Copyright & Governance", icon: "Scale" },
      { label: "Enterprise Tech", href: "/category/business", description: "SaaS, ERP & Corporate IT", icon: "Briefcase" },
    ],
  },
  {
    title: "Science & Future",
    items: [
      { label: "Space & Frontier", href: "/category/science", description: "Rockets, Exploration & Satellites", icon: "Globe" },
      { label: "Biotech & Health", href: "/category/health", description: "CRISPR, Drug Discovery & MedTech", icon: "Dna" },
      { label: "Clean Energy & EVs", href: "/category/science", description: "Solar, Fusion & Electric Vehicles", icon: "BatteryCharging" },
      { label: "Consumer Gadgets", href: "/category/technology", description: "Smartphones, Wearables & Vision Pro", icon: "Smartphone" },
      { label: "Gaming & XR", href: "/category/sports", description: "Game Engines, VR & Spatial Computing", icon: "Gamepad2" },
    ],
  },
];

// Admin sidebar navigation
export const adminNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
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
      { label: "AI Jobs", href: "/admin/logs", icon: "Sparkles" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Users", href: "/admin/users", icon: "Users" },
    ],
  },
];
