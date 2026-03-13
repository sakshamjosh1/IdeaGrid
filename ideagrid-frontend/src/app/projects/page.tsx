"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://127.0.0.1:8000";

type Project = {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  Active: "#22c55e",
  "On Hold": "#eab308",
  Completed: "#6366f1",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "", status: "Active" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch(`${API}/projects`)
      .then((r) => r.json())
      .then((d) => { setProjects(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const createProject = async () => {
    if (!form.name || !form.start_date) return;
    setSubmitting(true);
    await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        status: form.status,
      }),
    });
    setShowModal(false);
    setForm({ name: "", description: "", start_date: "", end_date: "", status: "Active" });
    setSubmitting(false);
    load();
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`${API}/projects/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace</p>
        </div>
        <button className="ig-btn ig-btn-primary" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Project
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📁</div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "6px" }}>No projects yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Create your first project to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {projects.map((p) => (
            <div key={p.id} className="ig-card" style={{ cursor: "pointer", position: "relative", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px var(--accent-glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--accent-glow)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    📁
                  </div>
                  <div>
                    <Link href={`/projects/${p.id}`} style={{ fontWeight: "600", color: "var(--text-primary)", textDecoration: "none", fontSize: "14px" }}>
                      {p.name}
                    </Link>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>#{p.id}</div>
                  </div>
                </div>
                <button className="ig-btn ig-btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}>
                  Delete
                </button>
              </div>

              {p.description && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: "1.5" }}>
                  {p.description}
                </p>
              )}

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: STATUS_COLORS[p.status] || "var(--text-muted)", background: `${STATUS_COLORS[p.status]}20`, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>
                  {p.status}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {p.start_date} → {p.end_date ?? "Ongoing"}
                </span>
              </div>

              <Link href={`/projects/${p.id}`} style={{
                display: "block", marginTop: "14px", textAlign: "center",
                padding: "8px", borderRadius: "8px", background: "var(--bg-elevated)",
                border: "1px solid var(--border)", fontSize: "12px", fontWeight: "500",
                color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
              >
                View Sprints & Tasks →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Create New Project</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="ig-label">Project Name *</label>
                <input className="ig-input" placeholder="e.g. Apollo Platform" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="ig-label">Description</label>
                <textarea className="ig-input" placeholder="What is this project about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical", minHeight: "80px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="ig-label">Start Date *</label>
                  <input className="ig-input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="ig-label">End Date</label>
                  <input className="ig-input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="ig-label">Status</label>
                <select className="ig-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button className="ig-btn ig-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ig-btn ig-btn-primary" style={{ flex: 1 }} onClick={createProject} disabled={submitting}>
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}