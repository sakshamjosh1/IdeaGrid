"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  return (
    <div className="flex w-full items-center justify-between">
      {/* Search */}
      <div className="w-1/3">
        <Input placeholder="Search projects, tasks..." />
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
