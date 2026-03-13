"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const API = "http://127.0.0.1:8000";

type Task = {
  id: number; title: string; priority: string; status: string;
  deadline?: string; assignee?: string; sprint_id: number;
};

type Sprint = {
  id: number; name: string; start_date: string; end_date: string;
  risk_score?: string; project_id: number;
};

const PRIORITY_WEIGHT: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
const RISK_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

function RiskBreakdownInner() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sprintId = searchParams.get("sprint");

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sprintId) return;
    Promise.all([
      fetch(`${API}/projects/${id}/sprints`).then(r => r.json()),
      fetch(`${API}/sprints/${sprintId}/tasks`).then(r => r.json()),
    ]).then(([sprints, taskData]) => {
      const s = sprints.find((sp: Sprint) => sp.id === Number(sprintId));
      setSprint(s ?? null);
      setTasks(taskData);
      setLoading(false);
    });
  }, [id, sprintId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!sprint) return <p style={{ color: "var(--text-muted)" }}>Sprint not found.</p>;

  // ── Compute risk factors ──────────────────────────────────────
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done");
  const incomplete = tasks.filter(t => t.status !== "Done");
  const highPendingTasks = incomplete.filter(t => t.priority === "High");
  const reviewBlocked = tasks.filter(t => t.status === "Review");
  const today = new Date();
  const endDate = new Date(sprint.end_date);
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
  const completionPct = total ? Math.round((done.length / total) * 100) : 0;

  const overdueIncomplete = incomplete.filter(t => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < today;
  });

  // ── Risk factor scores (0–100) ────────────────────────────────
  const completionScore = completionPct;
  const deadlineScore = daysLeft < 0 ? 0 : daysLeft <= 2 ? 20 : daysLeft <= 5 ? 50 : daysLeft <= 10 ? 75 : 100;
  const priorityScore = Math.max(0, 100 - highPendingTasks.length * 25);
  const overdueScore = Math.max(0, 100 - overdueIncomplete.length * 30);
  const blockageScore = Math.max(0, 100 - reviewBlocked.length * 20);

  const radarData = [
    { factor: "Completion", score: completionScore },
    { factor: "Deadline", score: deadlineScore },
    { factor: "Priority Load", score: priorityScore },
    { factor: "Overdue Tasks", score: overdueScore },
    { factor: "Blockages", score: blockageScore },
  ];

  const riskLevel = sprint.risk_score ?? "Low";
  const riskCol = RISK_COLOR[riskLevel];

  // ── Priority distribution ─────────────────────────────────────
  const priorityDist = ["High", "Medium", "Low"].map(p => ({
    priority: p,
    total: tasks.filter(t => t.priority === p).length,
    done: tasks.filter(t => t.priority === p && t.status === "Done").length,
  }));

  // ── Risk reasons (plain English) ──────────────────────────────
  const reasons: { icon: string; text: string; severity: "high" | "medium" | "low" }[] = [];
  if (highPendingTasks.length > 0)
    reasons.push({ icon: "🔴", text: `${highPendingTasks.length} high-priority task${highPendingTasks.length > 1 ? "s" : ""} still incomplete`, severity: "high" });
  if (daysLeft < 0)
    reasons.push({ icon: "⏰", text: `Sprint is overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? "s" : ""}`, severity: "high" });
  else if (daysLeft <= 3)
    reasons.push({ icon: "⏰", text: `Only ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in sprint`, severity: "medium" });
  if (overdueIncomplete.length > 0)
    reasons.push({ icon: "📅", text: `${overdueIncomplete.length} task${overdueIncomplete.length > 1 ? "s have" : " has"} passed deadline`, severity: "high" });
  if (reviewBlocked.length > 0)
    reasons.push({ icon: "🔒", text: `${reviewBlocked.length} task${reviewBlocked.length > 1 ? "s" : ""} blocked in Review`, severity: "medium" });
  if (completionPct < 30 && total > 0)
    reasons.push({ icon: "📊", text: `Only ${completionPct}% of tasks completed`, severity: "high" });
  else if (completionPct < 60 && total > 0)
    reasons.push({ icon: "📊", text: `Sprint is ${completionPct}% complete — behind pace`, severity: "medium" });
  if (reasons.length === 0)
    reasons.push({ icon: "✅", text: "Sprint is on track — no critical issues found", severity: "low" });

  const SEVERITY_COLORS = { high: "#ef4444", medium: "#f97316", low: "#22c55e" };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
        <Link href="/projects" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Projects</Link>
        <span style={{ color: "var(--border-bright)" }}>/</span>
        <Link href={`/projects/${id}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>Sprints</Link>
        <span style={{ color: "var(--border-bright)" }}>/</span>
        <span style={{ color: "var(--text-primary)" }}>Risk Analysis</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Sprint Risk Analysis</h1>
          <p className="page-subtitle">{sprint.name} · {sprint.start_date} → {sprint.end_date}</p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 20px", borderRadius: "12px",
          background: `${riskCol}15`, border: `1px solid ${riskCol}`,
        }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: riskCol, boxShadow: `0 0 8px ${riskCol}` }} />
          <span style={{ fontSize: "18px", fontWeight: "800", color: riskCol }}>{riskLevel} Risk</span>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
        {[
          { label: "Total Tasks", value: total, color: "var(--accent)" },
          { label: "Completed", value: done.length, color: "#22c55e" },
          { label: "Incomplete", value: incomplete.length, color: "#f97316" },
          { label: "High Priority Pending", value: highPendingTasks.length, color: "#ef4444" },
          { label: "Days Left", value: daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`, color: daysLeft < 0 ? "#ef4444" : daysLeft <= 3 ? "#f97316" : "#22c55e" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color: k.color }}>{k.value}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Risk Reasons */}
        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Why is this sprint at risk?
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reasons.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "12px", borderRadius: "8px",
                background: `${SEVERITY_COLORS[r.severity]}10`,
                border: `1px solid ${SEVERITY_COLORS[r.severity]}30`,
              }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{r.icon}</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5" }}>{r.text}</span>
                <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: "700", color: SEVERITY_COLORS[r.severity], flexShrink: 0, textTransform: "uppercase" }}>{r.severity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Health Radar
          </h3>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Radar name="Health" dataKey="score" stroke={riskCol} fill={riskCol} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority breakdown bar chart */}
        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Priority Completion Breakdown
          </h3>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDist} barGap={4}>
                <XAxis dataKey="priority" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} cursor={{ fill: "var(--bg-hover)" }} />
                <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} fill="var(--border-bright)" />
                <Bar dataKey="done" name="Done" radius={[4, 4, 0, 0]}>
                  {priorityDist.map(entry => (
                    <Cell key={entry.priority} fill={RISK_COLOR[entry.priority] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>Grey = total · Coloured = done</p>
        </div>

        {/* Task list with risk indicators */}
        <div className="ig-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Task Risk Details
            </h3>
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {tasks.length === 0 ? (
              <p style={{ padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>No tasks in this sprint.</p>
            ) : (
              tasks.map(t => {
                const isOverdue = t.deadline && new Date(t.deadline) < today && t.status !== "Done";
                const isHighPending = t.priority === "High" && t.status !== "Done";
                const rowRisk = isOverdue || isHighPending ? "high" : t.status === "Review" ? "medium" : "low";
                return (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px",
                    borderBottom: "1px solid var(--border)",
                    background: rowRisk === "high" ? "rgba(239,68,68,0.04)" : "transparent",
                  }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: SEVERITY_COLORS[rowRisk], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "13px", color: t.status === "Done" ? "var(--text-muted)" : "var(--text-primary)", textDecoration: t.status === "Done" ? "line-through" : "none" }}>
                      {t.title}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: RISK_COLOR[t.priority], background: `${RISK_COLOR[t.priority]}18`, padding: "2px 7px", borderRadius: "20px" }}>{t.priority}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "80px", textAlign: "right" }}>{t.status.replace("_", " ")}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ig-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Sprint Completion Progress</span>
          <span style={{ fontSize: "20px", fontWeight: "800", color: completionPct >= 70 ? "#22c55e" : completionPct >= 40 ? "#f97316" : "#ef4444" }}>{completionPct}%</span>
        </div>
        <div style={{ height: "12px", background: "var(--bg-elevated)", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "6px",
            width: `${completionPct}%`,
            background: completionPct >= 70 ? "#22c55e" : completionPct >= 40 ? "#f97316" : "#ef4444",
            transition: "width 1s ease",
            boxShadow: `0 0 10px ${completionPct >= 70 ? "#22c55e" : completionPct >= 40 ? "#f97316" : "#ef4444"}60`,
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
          <span>{done.length} tasks done</span>
          <span>{incomplete.length} remaining</span>
        </div>
      </div>
    </div>
  );
}

export default function RiskPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading risk analysis...</div>}>
      <RiskBreakdownInner />
    </Suspense>
  );
}