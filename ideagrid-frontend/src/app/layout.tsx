import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/app/_components/Sidebar";
import Navbar from "@/app/_components/Navbar";

export const metadata: Metadata = {
  title: "IdeaGrid – Agile Project Management",
  description: "Unified platform for sprint planning, task tracking, and team collaboration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Navbar />
          <main style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
            background: "var(--bg)",
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}