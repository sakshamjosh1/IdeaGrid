"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const API = "http://127.0.0.1:8000";
const COLUMNS = ["To_Do", "In_Progress", "Review", "Done"];
const COL_LABELS: Record<string, string> = { To_Do: "To Do", In_Progress: "In Progress", Review: "Review", Done: "Done" };
const COL_COLORS: Record<string, string> = { To_Do: "#6366f1", In_Progress: "#eab308", Review: "#a855f7", Done: "#22c55e" };
const PRIORITY_COLORS: Record<string, string> = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

type Task = { id: number; title: string; priority: string; status: string; deadline?: string; assignee?: string; sprint_id: number; description?: string; };

function KanbanPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sprintId = searchParams.get("sprint");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "Medium", deadline: "", assignee: "", description: "" });

  const load = () => {
    if (!sprintId) return;
    fetch(`${API}/sprints/${sprintId}/tasks`).then(r => r.json()).then(t => { setTasks(t); setLoading(false); });
  };

  useEffect(() => { load(); }, [sprintId]);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter(t => t.status === col);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragStart = (taskId: number) => setDragging(taskId);
  const handleDrop = async (col: string) => {
    if (dragging === null) return;
    await fetch(`${API}/tasks/${dragging}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: col }) });
    setTasks(prev => prev.map(t => t.id === dragging ? { ...t, status: col } : t));
    setDragging(null);
  };

  const deleteTask = async (taskId: number) => {
    await fetch(`${API}/tasks/${taskId}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const createTask = async () => {
    if (!form.title || !sprintId) return;
    const res = await fetch(`${API}/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, sprint_id: Number(sprintId), deadline: form.deadline || null }) });
    const newTask = await res.json();
    setTasks(prev => [...prev, newTask]);
    setShowModal(false);
    setForm({ title: "", priority: "Medium", deadline: "", assignee: "", description: "" });
  };

  return (
    <div className="animate-in" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href={`/projects/${id}`} style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none" }}>← Back to Project</Link>
          <span style={{ color: "var(--border-bright)" }}>/</span>
          <h1 className="page-title" style={{ fontSize: "18px" }}>Kanban Board</h1>
        </div>
        <button className="ig-btn ig-btn-primary" onClick={() => setShowModal(true)}>+ Add Task</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading board...</div>
      ) : (
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", flex: 1, paddingBottom: "16px" }}>
          {COLUMNS.map(col => (
            <div key={col} className="kanban-col"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col)}
            >
              <div className="kanban-col-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COL_COLORS[col] }}/>
                  <span style={{ color: "var(--text-secondary)" }}>{COL_LABELS[col]}</span>
                </div>
                <span style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", borderRadius: "20px", padding: "1px 8px", fontSize: "11px" }}>
                  {grouped[col].length}
                </span>
              </div>

              <div style={{ padding: "8px", minHeight: "300px" }}>
                {grouped[col].map(task => (
                  <div key={task.id} className={`kanban-card ${dragging === task.id ? "dragging" : ""}`}
                    draggable onDragStart={() => handleDragStart(task.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", lineHeight: "1.4", flex: 1 }}>{task.title}</span>
                      <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", lineHeight: 1, flexShrink: 0, padding: "0 2px" }}>×</button>
                    </div>
                    {task.description && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>{task.description}</p>}
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: PRIORITY_COLORS[task.priority], background: `${PRIORITY_COLORS[task.priority]}18`, padding: "2px 7px", borderRadius: "20px" }}>
                        {task.priority}
                      </span>
                      {task.deadline && <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>📅 {task.deadline}</span>}
                    </div>
                    {task.assignee && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "white", fontWeight: "700" }}>
                          {task.assignee.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{task.assignee}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Add Task to Board</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label className="ig-label">Title *</label><input className="ig-input" placeholder="Task name" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><label className="ig-label">Description</label><textarea className="ig-input" placeholder="Optional details" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: "60px", resize: "vertical" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label className="ig-label">Priority</label>
                  <select className="ig-select" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div><label className="ig-label">Deadline</label><input className="ig-input" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
              </div>
              <div><label className="ig-label">Assignee</label><input className="ig-input" placeholder="Name" value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} /></div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="ig-btn ig-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ig-btn ig-btn-primary" style={{ flex: 1 }} onClick={createTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KanbanPageWrapper() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>}>
      <KanbanPage />
    </Suspense>
  );
}