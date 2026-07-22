import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";
import { Bookmark, Shield, CheckCircle2, Calendar, Mail, User as UserIcon, ArrowRight } from "lucide-react";

export const metadata = {
  title: "My Profile - ByteBulletin",
  description: "Manage your ByteBulletin account and preferences.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 md:px-8 min-h-screen">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-lg mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <Avatar className="w-24 h-24 border-2 border-violet-500/40 shadow-md">
            {user.image && <AvatarImage src={user.image} alt={user.name || "User avatar"} />}
            <AvatarFallback className="bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 text-white text-2xl font-extrabold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight">
                {user.name || "User Account"}
              </h1>
              {user.emailVerified ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 rounded-full px-2.5 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified User
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                  Unverified
                </Badge>
              )}

              {user.role === "ADMIN" && (
                <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30 gap-1 rounded-full px-2.5 py-0.5">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground flex items-center justify-center sm:justify-start text-sm">
              <Mail className="w-4 h-4 mr-1.5 text-muted-foreground/80 shrink-0" />
              {user.email}
            </p>

            <p className="text-xs text-muted-foreground/70 flex items-center justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              Member since {joinedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bookmarks Stat */}
        <Link 
          href="/bookmarks" 
          className="group rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 p-6 shadow-sm transition-all duration-300 hover:border-violet-500/40 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Saved Bookmarks</p>
              <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">{user._count.bookmarks} Articles</h3>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Account Security Stat */}
        <div className="rounded-2xl border border-border/40 bg-card/40 p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Security & Verification</p>
              <h3 className="text-base font-bold tracking-tight mt-0.5 text-emerald-600 dark:text-emerald-400">Email Verified ✓</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-3xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-border/40 pb-4 mb-6">
          <UserIcon className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl font-bold tracking-tight">Account Settings</h2>
        </div>

        <ProfileForm initialName={user.name || ""} email={user.email} />
      </div>
    </div>
  );
}
