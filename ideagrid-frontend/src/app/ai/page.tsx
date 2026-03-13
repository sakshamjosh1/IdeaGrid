"use client";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Which sprint is most at risk right now?",
  "What tasks should I focus on today?",
  "Summarize the overall project health",
  "Which team members have the most overdue tasks?",
  "What's blocking sprint completion?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your IdeaGrid sprint health assistant. I can analyze your sprint data, identify risks, and give you actionable recommendations. Ask me anything about your projects or sprints.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<string>("");

  // Load project context once
  useEffect(() => {
    Promise.all([
      fetch(`${API}/dashboard/summary`).then(r => r.json()),
      fetch(`${API}/projects`).then(r => r.json()),
      fetch(`${API}/timeline`).then(r => r.json()),
    ]).then(([summary, projects, timeline]) => {
      const ctx = `
IdeaGrid Project Management System — Current State:

DASHBOARD SUMMARY:
- Total Projects: ${summary.total_projects}
- Total Sprints: ${summary.total_sprints}
- Total Tasks: ${summary.total_tasks}
- Done Tasks: ${summary.done_tasks}
- In Progress: ${summary.in_progress_tasks}
- To Do: ${summary.todo_tasks}
- High Risk Sprints: ${summary.high_risk_sprints}
- Medium Risk Sprints: ${summary.medium_risk_sprints}
- Low Risk Sprints: ${summary.low_risk_sprints}
- Priority Distribution: High=${summary.priority_distribution?.find((p: any) => p.priority === "High")?.count ?? 0}, Medium=${summary.priority_distribution?.find((p: any) => p.priority === "Medium")?.count ?? 0}, Low=${summary.priority_distribution?.find((p: any) => p.priority === "Low")?.count ?? 0}

PROJECTS:
${projects.map((p: any) => `- ${p.name} (ID: ${p.id}) | Status: ${p.status} | ${p.start_date} to ${p.end_date ?? "Ongoing"}`).join("\n")}

SPRINT TIMELINE & RISK:
${timeline.map((t: any) => `- Sprint: "${t.sprint_name}" | Project: ${t.project_name} | Risk: ${t.risk_score} | Progress: ${t.done_count}/${t.task_count} tasks done | ${t.start_date} to ${t.end_date}`).join("\n")}
      `.trim();
      setContext(ctx);
    }).catch(() => {
      setContext("Backend data unavailable. Please ensure the backend is running at http://127.0.0.1:8000");
    });
  }, []);

  const send = async (text?: string) => {
    const userMsg = text ?? input.trim();
    if (!userMsg || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `You are an expert Agile project management assistant for IdeaGrid. You have access to real-time project data shown below. Analyze it and give specific, actionable advice. Be concise but insightful. Use bullet points for lists. Highlight risks clearly. Reference specific sprint names, task counts, and risk levels from the data.\n\nCURRENT PROJECT DATA:\n${context}` }]
      },
      contents: newMessages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      })),
    }),
  }
);

const data = await response.json();
const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Unable to connect to AI. Make sure you're using Claude.ai which provides the API automatically." }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    // Basic markdown-like formatting
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return <div key={i} style={{ fontWeight: "700", color: "var(--text-primary)", marginTop: "8px" }}>{line.slice(2, -2)}</div>;
        if (line.startsWith("- ") || line.startsWith("• "))
          return <div key={i} style={{ display: "flex", gap: "8px", marginTop: "4px" }}><span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span><span>{line.slice(2)}</span></div>;
        if (line.match(/^\d+\./))
          return <div key={i} style={{ marginTop: "4px", paddingLeft: "4px" }}>{line}</div>;
        if (line === "")
          return <div key={i} style={{ height: "6px" }} />;
        return <div key={i}>{line}</div>;
      });
  };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "0" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            🤖
          </div>
          <div>
            <h1 className="page-title">AI Sprint Assistant</h1>
            <p className="page-subtitle">Powered by Claude · Analyzing your live project data</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: context ? "#22c55e" : "var(--text-muted)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: context ? "#22c55e" : "var(--text-muted)", animation: context ? "pulse 2s infinite" : "none" }} />
            {context ? "Data loaded" : "Loading data..."}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", flexShrink: 0 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              padding: "8px 14px", borderRadius: "20px", fontSize: "12px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "4px", marginBottom: "16px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            {/* Avatar */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
              background: msg.role === "assistant" ? "var(--accent)" : "var(--bg-elevated)",
              border: msg.role === "user" ? "1px solid var(--border)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px",
            }}>
              {msg.role === "assistant" ? "🤖" : "👤"}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "75%", padding: "14px 16px", borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              background: msg.role === "user" ? "var(--accent)" : "var(--bg-card)",
              border: msg.role === "user" ? "none" : "1px solid var(--border)",
              fontSize: "13px", lineHeight: "1.6",
              color: msg.role === "user" ? "white" : "var(--text-secondary)",
            }}>
              {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🤖</div>
            <div style={{ padding: "14px 16px", borderRadius: "4px 14px 14px 14px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <input
          className="ig-input"
          style={{ fontSize: "13px", height: "44px" }}
          placeholder="Ask about sprint health, risks, or recommendations..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={loading}
        />
        <button className="ig-btn ig-btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ flexShrink: 0, height: "44px", padding: "0 20px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}
