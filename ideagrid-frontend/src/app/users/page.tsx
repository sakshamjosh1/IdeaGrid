"use client";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
type User = { id: number; name: string; email: string; role: string; team_id?: number; };

const ROLE_COLORS: Record<string, string> = { Admin: "#ef4444", "Project Manager": "#6366f1", "Team Member": "#22c55e" };
const AVATARS = ["#6366f1","#22c55e","#f97316","#a855f7","#ef4444","#eab308","#06b6d4","#ec4899"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Team Member" });

  const load = () => fetch(`${API}/users`).then(r => r.json()).then(setUsers);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.email) return;
    const res = await fetch(`${API}/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); setForm({ name: "", email: "", role: "Team Member" }); load(); }
    else { alert("Email already registered"); }
  };

  const del = async (id: number) => {
    if (!confirm("Remove this user?")) return;
    await fetch(`${API}/users/${id}`, { method: "DELETE" }); load();
  };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} member{users.length !== 1 ? "s" : ""} in this workspace</p>
        </div>
        <button className="ig-btn ig-btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      {users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>👤</div><p>No users yet.</p>
        </div>
      ) : (
        <div className="ig-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="ig-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: AVATARS[i % AVATARS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                        {u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: ROLE_COLORS[u.role] || "var(--text-muted)", background: `${ROLE_COLORS[u.role] || "#888"}18`, padding: "3px 9px", borderRadius: "20px" }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button className="ig-btn ig-btn-danger" style={{ fontSize: "11px", padding: "4px 10px" }} onClick={() => del(u.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Add User</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label className="ig-label">Full Name *</label><input className="ig-input" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="ig-label">Email *</label><input className="ig-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="ig-label">Role</label>
                <select className="ig-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option>Admin</option><option>Project Manager</option><option>Team Member</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="ig-btn ig-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ig-btn ig-btn-primary" style={{ flex: 1 }} onClick={create}>Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}