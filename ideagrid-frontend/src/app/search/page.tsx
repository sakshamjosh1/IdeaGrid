"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API = "http://127.0.0.1:8000";
type SearchResult = { projects: { id: number; name: string; type: string }[]; tasks: { id: number; title: string; status: string; priority: string; type: string }[]; };
const PRIORITY_COLORS: Record<string, string> = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

function SearchInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    fetch(`${API}/search?q=${encodeURIComponent(q)}`).then(r => r.json()).then(d => { setResults(d); setLoading(false); });
  };

  useEffect(() => { if (initialQ) doSearch(initialQ); }, []);

  const total = results ? results.projects.length + results.tasks.length : 0;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find projects and tasks across your workspace</p>
      </div>

      <div style={{ position: "relative", maxWidth: "560px", marginBottom: "28px" }}>
        <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input className="ig-input" style={{ paddingLeft: "38px", fontSize: "14px", height: "44px" }}
          placeholder="Search projects, tasks..." value={query}
          onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
          autoFocus
        />
        {loading && <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>}
      </div>

      {results && (
        <div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>{total} result{total !== 1 ? "s" : ""} for "{query}"</p>

          {results.projects.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Projects</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {results.projects.map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", textDecoration: "none", transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                  >
                    <span style={{ fontSize: "18px" }}>📁</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{p.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>Project</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.tasks.length > 0 && (
            <div>
              <h3 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Tasks</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {results.tasks.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "18px" }}>✅</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)", flex: 1 }}>{t.title}</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: PRIORITY_COLORS[t.priority], background: `${PRIORITY_COLORS[t.priority]}18`, padding: "2px 8px", borderRadius: "20px" }}>{t.priority}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {total === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ fontSize: "14px" }}>Type to search projects and tasks</p>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>}>
      <SearchInner />
    </Suspense>
  );
}