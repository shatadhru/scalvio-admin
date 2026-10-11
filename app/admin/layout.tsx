import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/basic/Sidebar/app-sidebar";
import { AdminNavbar } from "@/components/admin/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="[--app-wrapper-max-width:80rem]">
      <AppSidebar />
      <SidebarInset>
        <AdminNavbar />
        <main className="mx-auto flex w-full max-w-(--app-wrapper-max-width) flex-1 flex-col p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
