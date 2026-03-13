"use client";
import { useEffect, useRef, useState } from "react";

type Tool = "pen" | "eraser" | "rect" | "circle" | "text" | "line";
type Color = string;

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<Color>("#6366f1");
  const [lineWidth, setLineWidth] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111118";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const saveHistory = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-19), snap]);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setStartPos(pos);
    setDrawing(true);
    saveHistory();
    const ctx = ctxRef.current!;
    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    snapshotRef.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = ctxRef.current!;
    ctx.strokeStyle = tool === "eraser" ? "#111118" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (snapshotRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.beginPath();
      if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === "circle") {
        const rx = Math.abs(pos.x - startPos.x) / 2;
        const ry = Math.abs(pos.y - startPos.y) / 2;
        ctx.ellipse(startPos.x + (pos.x - startPos.x) / 2, startPos.y + (pos.y - startPos.y) / 2, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const onMouseUp = () => setDrawing(false);

  const undo = () => {
    if (history.length === 0) return;
    const ctx = ctxRef.current!;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  };

  const clear = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    saveHistory();
    ctx.fillStyle = "#111118";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement("a");
    a.download = "ideagrid-whiteboard.png";
    a.href = canvas.toDataURL();
    a.click();
  };

  const TOOLS: { id: Tool; label: string; icon: string }[] = [
    { id: "pen", label: "Pen", icon: "✏️" },
    { id: "eraser", label: "Eraser", icon: "🧹" },
    { id: "line", label: "Line", icon: "↗️" },
    { id: "rect", label: "Rectangle", icon: "⬜" },
    { id: "circle", label: "Circle", icon: "⭕" },
  ];

  const COLORS = ["#6366f1", "#22c55e", "#ef4444", "#f97316", "#eab308", "#a855f7", "#06b6d4", "#ec4899", "#ffffff", "#888888"];

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", height: "100%", gap: "0" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", marginBottom: "12px", flexWrap: "wrap" }}>
        <h1 className="page-title" style={{ fontSize: "18px", marginRight: "8px" }}>Whiteboard</h1>

        {/* Tools */}
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" }}>
          {TOOLS.map(t => (
            <button key={t.id} title={t.label} onClick={() => setTool(t.id)} style={{
              padding: "7px 10px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "16px",
              background: tool === t.id ? "var(--accent)" : "transparent",
              transition: "background 0.15s",
            }}>
              {t.icon}
            </button>
          ))}
        </div>

        {/* Colors */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: "22px", height: "22px", borderRadius: "50%", background: c, border: color === c ? "2px solid white" : "2px solid transparent",
              cursor: "pointer", transition: "transform 0.1s",
            }}/>
          ))}
        </div>

        {/* Stroke */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Size</span>
          <input type="range" min="1" max="20" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} style={{ width: "80px", accentColor: "var(--accent)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "20px" }}>{lineWidth}</span>
        </div>

        {/* Actions */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button className="ig-btn ig-btn-ghost" onClick={undo} style={{ fontSize: "12px", padding: "6px 12px" }}>↩ Undo</button>
          <button className="ig-btn ig-btn-ghost" onClick={clear} style={{ fontSize: "12px", padding: "6px 12px" }}>🗑 Clear</button>
          <button className="ig-btn ig-btn-primary" onClick={download} style={{ fontSize: "12px", padding: "6px 12px" }}>⬇ Save</button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", position: "relative", minHeight: "500px" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", cursor: tool === "eraser" ? "cell" : "crosshair" }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        />
        <div style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-card)", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
          {TOOLS.find(t => t.id === tool)?.label} • {color} • {lineWidth}px
        </div>
      </div>
    </div>
  );
}