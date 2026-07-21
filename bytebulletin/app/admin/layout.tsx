import { ReactNode } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  Rss, 
  BarChart, 
  Mail, 
  Image as ImageIcon,
  Activity,
  LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Analytics", href: "/admin/analytics", icon: <BarChart className="w-5 h-5" /> },
    { name: "Articles", href: "/admin/articles", icon: <FileText className="w-5 h-5" /> },
    { name: "Sources", href: "/admin/sources", icon: <Rss className="w-5 h-5" /> },
    { name: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Newsletter", href: "/admin/newsletter", icon: <Mail className="w-5 h-5" /> },
    { name: "Media", href: "/admin/media", icon: <ImageIcon className="w-5 h-5" /> },
    { name: "System Logs", href: "/admin/logs", icon: <Activity className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-heading tracking-tight">ByteBulletin <span className="text-primary text-sm">Admin</span></span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t flex items-center justify-between">
          <ThemeToggle />
          <Link href="/api/auth/signout" className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:pl-64">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
