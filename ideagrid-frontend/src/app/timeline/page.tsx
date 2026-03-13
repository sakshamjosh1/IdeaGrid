"use client";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
const RISK_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

type TimelineEntry = { sprint_id: number; sprint_name: string; project_id: number; project_name: string; start_date: string; end_date: string; risk_score: string; task_count: number; done_count: number; };

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/timeline`).then(r => r.json()).then(d => { setEntries(d); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading timeline...</div>;

  const allDates = entries.flatMap(e => [new Date(e.start_date), new Date(e.end_date)]);
  const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
  const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();
  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / 86400000);

  const getLeft = (d: string) => ((new Date(d).getTime() - minDate.getTime()) / 86400000 / totalDays) * 100;
  const getWidth = (s: string, e: string) => Math.max(2, ((new Date(e).getTime() - new Date(s).getTime()) / 86400000 / totalDays) * 100);

  const grouped: Record<string, TimelineEntry[]> = {};
  entries.forEach(e => { if (!grouped[e.project_name]) grouped[e.project_name] = []; grouped[e.project_name].push(e); });

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Timeline</h1>
        <p className="page-subtitle">Sprint schedule across all projects</p>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📅</div>
          <p>No sprints found. Create a project and add sprints to see the timeline.</p>
        </div>
      ) : (
        <div className="ig-card" style={{ padding: "24px", overflow: "auto" }}>
          {Object.entries(grouped).map(([projectName, projectSprints]) => (
            <div key={projectName} style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                📁 {projectName}
              </h3>
              {projectSprints.map(entry => {
                const pct = entry.task_count ? Math.round((entry.done_count / entry.task_count) * 100) : 0;
                return (
                  <div key={entry.sprint_id} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                    <div style={{ width: "180px", flexShrink: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.sprint_name}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>{entry.done_count}/{entry.task_count} tasks done</div>
                    </div>
                    <div style={{ flex: 1, position: "relative", height: "36px", background: "var(--bg-elevated)", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{
                        position: "absolute", left: `${getLeft(entry.start_date)}%`, width: `${getWidth(entry.start_date, entry.end_date)}%`,
                        height: "100%", background: RISK_COLOR[entry.risk_score] + "25", border: `1px solid ${RISK_COLOR[entry.risk_score]}`,
                        borderRadius: "4px", display: "flex", alignItems: "center", paddingLeft: "8px", overflow: "hidden", minWidth: "40px",
                      }}>
                        <div style={{ height: "4px", width: `${pct}%`, background: RISK_COLOR[entry.risk_score], borderRadius: "2px", position: "absolute", bottom: "6px", left: "4px", right: "4px", maxWidth: "calc(100% - 8px)" }}/>
                        <span style={{ fontSize: "10px", fontWeight: "600", color: RISK_COLOR[entry.risk_score], whiteSpace: "nowrap" }}>{pct}%</span>
                      </div>
                    </div>
                    <span style={{ width: "70px", fontSize: "11px", fontWeight: "700", color: RISK_COLOR[entry.risk_score], textAlign: "right", flexShrink: 0 }}>{entry.risk_score} Risk</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}