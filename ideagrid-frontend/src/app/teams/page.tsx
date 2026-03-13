"use client";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
type Team = { id: number; name: string; description?: string; };

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = () => fetch(`${API}/teams`).then(r => r.json()).then(setTeams);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return;
    await fetch(`${API}/teams`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setForm({ name: "", description: "" }); load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete team?")) return;
    await fetch(`${API}/teams/${id}`, { method: "DELETE" }); load();
  };

  const TEAM_COLORS = ["#6366f1", "#22c55e", "#f97316", "#a855f7", "#ef4444", "#eab308"];

  return (
    <div className="animate-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Manage your project teams and members</p>
        </div>
        <button className="ig-btn ig-btn-primary" onClick={() => setShowModal(true)}>+ New Team</button>
      </div>

      {teams.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>👥</div>
          <p>No teams yet. Create one to organize your members.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {teams.map((team, i) => {
            const color = TEAM_COLORS[i % TEAM_COLORS.length];
            return (
              <div key={team.id} className="ig-card" style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: color + "20", border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                    👥
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{team.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Team #{team.id}</div>
                  </div>
                </div>
                {team.description && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: "1.5" }}>{team.description}</p>}
                <button className="ig-btn ig-btn-danger" style={{ fontSize: "11px", padding: "5px 10px" }} onClick={() => del(team.id)}>Delete Team</button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Create Team</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label className="ig-label">Team Name *</label><input className="ig-input" placeholder="e.g. Backend Squad" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="ig-label">Description</label><textarea className="ig-input" placeholder="What does this team work on?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: "80px", resize: "vertical" }} /></div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="ig-btn ig-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ig-btn ig-btn-primary" style={{ flex: 1 }} onClick={create}>Create Team</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}