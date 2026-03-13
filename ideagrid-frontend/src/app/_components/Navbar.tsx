"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header style={{
      height: "60px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-card)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: "16px",
      flexShrink: 0,
    }}>
      <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
        <svg style={{
          position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", pointerEvents: "none",
        }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="ig-input"
          style={{ paddingLeft: "32px", fontSize: "13px" }}
          placeholder="Search projects, tasks… (Enter)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Notification bell */}
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", padding: "6px",
          borderRadius: "8px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <div style={{ width: "1px", height: "20px", background: "var(--border)" }}/>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "var(--accent)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white",
          }}>
            SJ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>Saksham Joshi</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Project Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}