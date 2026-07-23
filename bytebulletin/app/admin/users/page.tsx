import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { UserTableActions } from "./user-table-actions";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Users Management - Admin",
};

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Manage Users</h1>
          <p className="text-muted-foreground">List of all verified users registered on the platform.</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 w-fit">
          Total Registered: <span className="text-violet-400 font-bold">{users.length}</span>
        </div>
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No verified users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "Anonymous User"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role === "ADMIN" ? (
                      <Badge className="bg-violet-600 text-white font-semibold">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserTableActions
                      userId={user.id}
                      userName={user.name || user.email}
                      userEmail={user.email}
                      isCurrentUser={user.id === currentUserId}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
