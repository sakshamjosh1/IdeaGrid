import "./globals.css";
import Sidebar from "@/app/_components/Sidebar";
import Navbar from "@/app/_components/Navbar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <Sidebar />

          <SidebarInset>
            {/* Top bar */}
            <header className="flex h-14 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Navbar />
              <span className="font-semibold">IdeaGrid</span>
            </header>

            {/* Page content */}
            <main className="p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
