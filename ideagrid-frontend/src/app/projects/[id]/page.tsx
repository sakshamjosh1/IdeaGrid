"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = "http://127.0.0.1:8000";

type Sprint = { id: number; name: string; start_date: string; end_date: string; risk_score?: string; project_id: number; };
type Task = { id: number; title: string; priority: string; status: string; deadline?: string; assignee?: string; sprint_id: number; };
type Project = { id: number; name: string; description?: string; start_date: string; end_date?: string; status: string; };

const RISK_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasksMap, setTasksMap] = useState<Record<number, Task[]>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState<number | null>(null);
  const [sprintForm, setSprintForm] = useState({ name: "", start_date: "", end_date: "" });
  const [taskForm, setTaskForm] = useState({ title: "", priority: "Medium", status: "To_Do", deadline: "", assignee: "" });

  const loadSprints = () => fetch(`${API}/projects/${id}/sprints`).then(r => r.json()).then(setSprints);
  
  useEffect(() => {
    fetch(`${API}/projects/${id}`).then(r => r.json()).then(setProject);
    loadSprints();
  }, [id]);

  const fetchTasks = async (sid: number) => {
    const data = await fetch(`${API}/sprints/${sid}/tasks`).then(r => r.json());
    setTasksMap(prev => ({ ...prev, [sid]: data }));
  };

  const toggleSprint = (sid: number) => {
    if (expanded === sid) { setExpanded(null); } 
    else { setExpanded(sid); fetchTasks(sid); }
  };

  const createSprint = async () => {
    if (!sprintForm.name || !sprintForm.start_date || !sprintForm.end_date) return;
    await fetch(`${API}/sprints`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...sprintForm, project_id: Number(id) }) });
    setShowSprintModal(false); setSprintForm({ name: "", start_date: "", end_date: "" }); loadSprints();
  };

  const createTask = async (sprintId: number) => {
    if (!taskForm.title) return;
    await fetch(`${API}/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...taskForm, sprint_id: sprintId, deadline: taskForm.deadline || null }) });
    setShowTaskModal(null); setTaskForm({ title: "", priority: "Medium", status: "To_Do", deadline: "", assignee: "" });
    fetchTasks(sprintId);
  };

  const deleteSprint = async (sid: number) => {
    if (!confirm("Delete this sprint?")) return;
    await fetch(`${API}/sprints/${sid}`, { method: "DELETE" });
    loadSprints();
  };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Link href="/projects" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>← Projects</Link>
        <span style={{ color: "var(--border-bright)" }}>/</span>
        <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: "500" }}>{project?.name ?? "..."}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">{project?.name}</h1>
          <p className="page-subtitle">{project?.description}</p>
        </div>
        <button className="ig-btn ig-btn-primary" onClick={() => setShowSprintModal(true)}>+ New Sprint</button>
      </div>

      {sprints.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏃</div>
          <p>No sprints yet. Create your first sprint!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sprints.map((sprint) => (
            <div key={sprint.id} className="ig-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => toggleSprint(sprint.id)}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: RISK_COLOR[sprint.risk_score ?? "Low"] ?? "#22c55e", flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" }}>{sprint.name}</span>
                  <span style={{ marginLeft: "12px", fontSize: "12px", color: "var(--text-muted)" }}>{sprint.start_date} → {sprint.end_date}</span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: RISK_COLOR[sprint.risk_score ?? "Low"], background: `${RISK_COLOR[sprint.risk_score ?? "Low"]}18`, padding: "3px 10px", borderRadius: "20px" }}>
                  {sprint.risk_score ?? "Low"} Risk
                </span>
                <Link href={`/projects/${id}/kanban?sprint=${sprint.id}`} onClick={e => e.stopPropagation()} style={{ padding: "6px 12px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none" }}>
                  Kanban
                </Link>
                <Link href={`/projects/${id}/risk?sprint=${sprint.id}`} onClick={e => e.stopPropagation()} style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px", color: "#ef4444", textDecoration: "none" }}>
                  Risk Analysis
                </Link>
                <button onClick={(e) => { e.stopPropagation(); setShowTaskModal(sprint.id); }} style={{ padding: "6px 12px", borderRadius: "6px", background: "var(--accent-glow)", border: "1px solid var(--accent)", fontSize: "12px", color: "var(--accent)", cursor: "pointer" }}>
                  + Task
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteSprint(sprint.id); }} style={{ padding: "4px 8px", borderRadius: "6px", background: "none", border: "1px solid rgba(239,68,68,0.3)", fontSize: "11px", color: "#ef4444", cursor: "pointer" }}>
                  Delete
                </button>
                <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>{expanded === sprint.id ? "▲" : "▼"}</span>
              </div>

              {expanded === sprint.id && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                  {!tasksMap[sprint.id] ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading tasks...</p>
                  ) : tasksMap[sprint.id].length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No tasks. Click "+ Task" to add one.</p>
                  ) : (
                    <table className="ig-table">
                      <thead><tr><th>Title</th><th>Priority</th><th>Status</th><th>Deadline</th><th>Assignee</th></tr></thead>
                      <tbody>
                        {tasksMap[sprint.id].map(t => (
                          <tr key={t.id}>
                            <td style={{ color: "var(--text-primary)", fontWeight: "500" }}>{t.title}</td>
                            <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                            <td><span className={`badge badge-${t.status.toLowerCase().replace("_","")}`}>{t.status.replace("_", " ")}</span></td>
                            <td>{t.deadline ?? "—"}</td>
                            <td>{t.assignee ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sprint Modal */}
      {showSprintModal && (
        <div className="modal-overlay" onClick={() => setShowSprintModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Create Sprint</h2>
              <button onClick={() => setShowSprintModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label className="ig-label">Sprint Name *</label><input className="ig-input" placeholder="e.g. Sprint 1 – Foundation" value={sprintForm.name} onChange={e => setSprintForm({...sprintForm, name: e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label className="ig-label">Start Date *</label><input className="ig-input" type="date" value={sprintForm.start_date} onChange={e => setSprintForm({...sprintForm, start_date: e.target.value})} /></div>
                <div><label className="ig-label">End Date *</label><input className="ig-input" type="date" value={sprintForm.end_date} onChange={e => setSprintForm({...sprintForm, end_date: e.target.value})} /></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="ig-btn ig-btn-ghost" style={{ flex: 1 }} onClick={() => setShowSprintModal(false)}>Cancel</button>
              <button className="ig-btn ig-btn-primary" style={{ flex: 1 }} onClick={createSprint}>Create Sprint</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal !== null && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Add Task</h2>
              <button onClick={() => setShowTaskModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label className="ig-label">Task Title *</label><input className="ig-input" placeholder="e.g. Setup database schema" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label className="ig-label">Priority</label>
                  <select className="ig-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div><label className="ig-label">Status</label>
                  <select className="ig-select" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    <option value="To_Do">To Do</option><option value="In_Progress">In Progress</option><option value="Review">Review</option><option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div><label className="ig-label">Deadline</label><input className="ig-input" type="date" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} /></div>
              <div><label className="ig-label">Assignee</label><input className="ig-input" placeholder="e.g. Saksham Joshi" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} /></div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="ig-btn ig-btn-ghost" style={{ flex: 1 }} onClick={() => setShowTaskModal(null)}>Cancel</button>
              <button className="ig-btn ig-btn-primary" style={{ flex: 1 }} onClick={() => createTask(showTaskModal!)}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}