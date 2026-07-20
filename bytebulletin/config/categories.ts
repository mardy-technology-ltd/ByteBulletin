// Default categories seeded to the database
// color: Tailwind-compatible hex values
// icon: Lucide icon names

export const defaultCategories = [
  {
    name: "Technology",
    slug: "technology",
    description: "Latest in tech, software, hardware, and digital innovation.",
    color: "#6366f1", // Indigo
    icon: "Cpu",
  },
  {
    name: "Business",
    slug: "business",
    description: "Markets, finance, economy, and corporate news.",
    color: "#10b981", // Emerald
    icon: "TrendingUp",
  },
  {
    name: "Science",
    slug: "science",
    description: "Discoveries, research, space, and the natural world.",
    color: "#3b82f6", // Blue
    icon: "FlaskConical",
  },
  {
    name: "Health",
    slug: "health",
    description: "Medicine, wellness, mental health, and medical breakthroughs.",
    color: "#ef4444", // Red
    icon: "Heart",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Football, basketball, tennis, and global sporting events.",
    color: "#f97316", // Orange
    icon: "Trophy",
  },
  {
    name: "World",
    slug: "world",
    description: "International news, geopolitics, and global affairs.",
    color: "#8b5cf6", // Violet
    icon: "Globe",
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Movies, music, culture, and celebrity news.",
    color: "#ec4899", // Pink
    icon: "Clapperboard",
  },
  {
    name: "Politics",
    slug: "politics",
    description: "Government, elections, policy, and political analysis.",
    color: "#f59e0b", // Amber
    icon: "Landmark",
  },
] as const;
