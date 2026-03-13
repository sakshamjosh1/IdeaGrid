"use client";

import { useEffect, useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Line, CartesianGrid, Area, AreaChart
} from "recharts";

const API = "http://127.0.0.1:8000";

type Summary = {
  total_projects: number; total_sprints: number; total_tasks: number;
  done_tasks: number; in_progress_tasks: number; todo_tasks: number;
  high_risk_sprints: number; medium_risk_sprints: number; low_risk_sprints: number;
  priority_distribution: { priority: string; count: number }[];
};

type TimelineEntry = {
  sprint_id: number; sprint_name: string; project_name: string;
  risk_score: string; task_count: number; done_count: number;
  start_date: string; end_date: string;
};

const RISK_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };
const STATUS_COLORS = ["#6366f1", "#eab308", "#22c55e"];

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}

function AnimatedStat({ label, value, icon, color, alert }: { label: string; value: number; icon: string; color: string; alert?: boolean }) {
  const displayed = useCountUp(value);
  return (
    <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
      {alert && value > 0 && (
        <div style={{ position: "absolute", top: "10px", right: "10px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite" }} />
      )}
      <div style={{ position: "absolute", bottom: "-10px", right: "-10px", fontSize: "64px", opacity: 0.04, userSelect: "none" }}>{icon}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
          {icon}
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      </div>
      <div style={{ fontSize: "36px", fontWeight: "800", color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{displayed}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = () => {
    Promise.all([
      fetch(`${API}/dashboard/summary`).then(r => r.json()),
      fetch(`${API}/timeline`).then(r => r.json()),
    ]).then(([s, t]) => {
      setSummary(s); setTimeline(t);
      setLoading(false); setLastRefresh(new Date());
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading dashboard...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!summary) return <p style={{ color: "var(--text-muted)" }}>Failed to load. Make sure the backend is running at {API}</p>;

  const taskCompletion = summary.total_tasks ? Math.round((summary.done_tasks / summary.total_tasks) * 100) : 0;

  const statusData = [
    { name: "To Do", value: summary.todo_tasks },
    { name: "In Progress", value: summary.in_progress_tasks },
    { name: "Done", value: summary.done_tasks },
  ];

  const riskData = [
    { name: "High", value: summary.high_risk_sprints },
    { name: "Medium", value: summary.medium_risk_sprints },
    { name: "Low", value: summary.low_risk_sprints },
  ];

  const burndownData = (() => {
    if (!timeline.length) return [];
    const sorted = [...timeline].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    const totalTasks = sorted.reduce((acc, s) => acc + s.task_count, 0);
    const points = sorted.map((s, i) => {
      const cumDone = sorted.slice(0, i + 1).reduce((acc, x) => acc + x.done_count, 0);
      const ideal = Math.round(totalTasks - (totalTasks / sorted.length) * (i + 1));
      return { name: s.sprint_name.replace("Sprint ", "S").split("–")[0].trim(), actual: Math.max(0, totalTasks - cumDone), ideal };
    });
    return [{ name: "Start", actual: totalTasks, ideal: totalTasks }, ...points];
  })();

  const riskySprints = [...timeline]
    .filter(t => t.risk_score === "High" || t.risk_score === "Medium")
    .sort((a, b) => (b.risk_score === "High" ? 1 : 0) - (a.risk_score === "High" ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Live overview · auto-refreshes every 30s</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
          Updated {lastRefresh.toLocaleTimeString()}
          <button onClick={loadData} style={{ marginLeft: "6px", padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-secondary)", fontSize: "11px" }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Animated stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <AnimatedStat label="Total Projects" value={summary.total_projects} icon="📁" color="var(--accent)" />
        <AnimatedStat label="Active Sprints" value={summary.total_sprints} icon="🏃" color="#eab308" />
        <AnimatedStat label="Total Tasks" value={summary.total_tasks} icon="✅" color="#22c55e" />
        <AnimatedStat label="High Risk Sprints" value={summary.high_risk_sprints} icon="⚠️" color="#ef4444" alert={summary.high_risk_sprints > 0} />
      </div>

      {/* Circular progress + Risk donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Overall Task Completion
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
            <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke={taskCompletion >= 70 ? "#22c55e" : taskCompletion >= 40 ? "#f97316" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${taskCompletion * 2.01} 201`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>
                {taskCompletion}%
              </div>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {[
                { label: "To Do", value: summary.todo_tasks, color: "#6366f1" },
                { label: "In Progress", value: summary.in_progress_tasks, color: "#eab308" },
                { label: "Done", value: summary.done_tasks, color: "#22c55e" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "10px 6px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: "8px", background: "var(--bg-elevated)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${taskCompletion}%`, borderRadius: "4px", background: "linear-gradient(90deg, var(--accent), #22c55e)", transition: "width 1s ease" }} />
          </div>
        </div>

        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sprint Risk Distribution
          </h3>
          <div style={{ height: "185px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {riskData.map(e => <Cell key={e.name} fill={RISK_COLOR[e.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }} />
                <Legend formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Burndown chart */}
      <div className="ig-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sprint Burndown Chart
          </h3>
          <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "12px", height: "3px", background: "#6366f1", borderRadius: "2px" }} /> Actual remaining
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "12px", height: "0", borderTop: "2px dashed #ef4444" }} /> Ideal
            </span>
          </div>
        </div>
        <div style={{ height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burndownData}>
              <defs>
                <linearGradient id="burnActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }} />
              <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5} fill="url(#burnActual)" name="Actual remaining" dot={{ fill: "#6366f1", r: 4 }} />
              <Line type="monotone" dataKey="ideal" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Ideal" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority + Status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Task Priority Distribution</h3>
          <div style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.priority_distribution} barSize={40}>
                <XAxis dataKey="priority" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} cursor={{ fill: "var(--bg-hover)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {summary.priority_distribution.map(e => <Cell key={e.priority} fill={RISK_COLOR[e.priority] || "var(--accent)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ig-card">
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Task Status Breakdown</h3>
          <div style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barSize={40}>
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} cursor={{ fill: "var(--bg-hover)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((e, i) => <Cell key={e.name} fill={STATUS_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* At-risk sprints */}
      {riskySprints.length > 0 && (
        <div className="ig-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🔥 At-Risk Sprints</h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{riskySprints.length} sprint{riskySprints.length > 1 ? "s" : ""} need attention</span>
          </div>
          <table className="ig-table">
            <thead><tr><th>Sprint</th><th>Project</th><th>Risk</th><th>Progress</th><th>Ends</th></tr></thead>
            <tbody>
              {riskySprints.map(s => {
                const pct = s.task_count ? Math.round((s.done_count / s.task_count) * 100) : 0;
                return (
                  <tr key={s.sprint_id}>
                    <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{s.sprint_name}</td>
                    <td>{s.project_name}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", color: RISK_COLOR[s.risk_score], background: `${RISK_COLOR[s.risk_score]}18`, padding: "3px 9px", borderRadius: "20px" }}>{s.risk_score}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "var(--bg-elevated)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: RISK_COLOR[s.risk_score], borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "32px" }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{s.end_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}