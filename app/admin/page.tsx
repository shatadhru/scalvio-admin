import { DashboardSkeleton } from "@/components/basic/Sidebar/dashboard-skeleton";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your Scalvio CMS collections, users, and settings.
        </p>
      </div>
      <DashboardSkeleton />
    </div>
  );
}
