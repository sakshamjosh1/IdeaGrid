"use client";

import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  House,
  Presentation,
  ChartGantt,
  Search,
  Users,
  CirclePile,
  Settings,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: House },
    { title: "Projects", url: "/projects", icon: Presentation },
    { title: "Timeline", url: "/timeline", icon: ChartGantt },
    { title: "Search", url: "/search", icon: Search },
    { title: "Users", url: "/users", icon: Users },
    { title: "Teams", url: "/teams", icon: CirclePile },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <ShadSidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>IdeaGrid</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadSidebar>
  );
}
