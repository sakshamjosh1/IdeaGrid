"use client";

export default function SettingsPage() {
  return (
    <div className="animate-in">
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Workspace configuration and preferences</p>
      </div>

      <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {[
          { title: "Workspace", desc: "IdeaGrid Dev Workspace", icon: "🏢", badge: "Active" },
          { title: "Theme", desc: "Dark mode (default)", icon: "🎨", badge: "Dark" },
          { title: "Notifications", desc: "Sprint risk alerts enabled", icon: "🔔", badge: "On" },
          { title: "API", desc: "http://127.0.0.1:8000", icon: "🔌", badge: "Connected" },
          { title: "Version", desc: "IdeaGrid v1.0.0 — Minor Project Build", icon: "📦", badge: "v1.0.0" },
        ].map(item => (
          <div key={item.title} className="ig-card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" }}>{item.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.desc}</div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", background: "var(--accent-glow)", padding: "3px 10px", borderRadius: "20px", border: "1px solid var(--accent)" }}>
              {item.badge}
            </span>
          </div>
        ))}

        <div className="ig-card" style={{ marginTop: "8px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>About IdeaGrid</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.7" }}>
            IdeaGrid is a full-stack Agile Project Management and Productivity Platform built with <strong style={{ color: "var(--text-secondary)" }}>Next.js</strong>, <strong style={{ color: "var(--text-secondary)" }}>FastAPI</strong>, and <strong style={{ color: "var(--text-secondary)" }}>SQLite</strong>.
            It provides sprint planning, task management, Sprint Risk Analysis, Kanban boards, and team collaboration tools.
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
            {["Next.js 14", "FastAPI", "SQLite", "Recharts", "DevOps B1"].map(tag => (
              <span key={tag} style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "3px 10px", borderRadius: "20px", border: "1px solid var(--border)" }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}