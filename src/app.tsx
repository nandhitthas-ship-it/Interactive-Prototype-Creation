import { useState, useEffect, useRef, useCallback, ReactElement } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ScreenId = "welcome" | "signup" | "dashboard" | "project" | "analytics" | "settings";
type TransitionType = "slide" | "push" | "fade";
type TabId = "canvas" | "testing" | "feedback";
type AnimPhase = "idle" | "exit" | "enter";
type InspectorTab = "props" | "timeline";
type ScreenType = "wireframe" | "prototype";

interface Screen {
  id: ScreenId;
  name: string;
  type: ScreenType;
  transition: TransitionType;
  connections: ScreenId[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SCREENS: Screen[] = [
  { id: "welcome",   name: "Onboarding — Welcome", type: "wireframe",  transition: "slide", connections: ["signup"] },
  { id: "signup",    name: "Sign Up",               type: "prototype",  transition: "fade",  connections: ["dashboard"] },
  { id: "dashboard", name: "Dashboard",             type: "prototype",  transition: "slide", connections: ["project", "analytics", "settings"] },
  { id: "project",   name: "Project View",          type: "prototype",  transition: "push",  connections: ["dashboard"] },
  { id: "analytics", name: "Analytics",             type: "wireframe",  transition: "push",  connections: ["dashboard"] },
  { id: "settings",  name: "Settings",              type: "wireframe",  transition: "fade",  connections: ["dashboard"] },
];

const TRANSITION_LABELS: Record<TransitionType, string> = {
  slide: "Slide",
  push: "Push",
  fade: "Fade",
};

// ─── SVG Canvas Node positions ────────────────────────────────────────────────
const NODE_POSITIONS: Record<ScreenId, { x: number; y: number }> = {
  welcome:   { x: 60,  y: 120 },
  signup:    { x: 220, y: 120 },
  dashboard: { x: 380, y: 120 },
  project:   { x: 540, y: 60  },
  analytics: { x: 540, y: 160 },
  settings:  { x: 540, y: 260 },
};

// ─── Toggle component (defined outside Settings to avoid nesting issues) ──────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }): ReactElement {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.12)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}

// ─── Screen: Welcome ──────────────────────────────────────────────────────────
function WelcomeScreen({ navigate }: { navigate: (id: ScreenId) => void }): ReactElement {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const items = [
    { delay: 0,   icon: "✦", label: "Design interactive flows",   sub: "Link screens with smart transitions" },
    { delay: 80,  icon: "◈", label: "Run live user tests",        sub: "Capture real feedback in seconds" },
    { delay: 160, icon: "⊙", label: "Analyze drop-off instantly", sub: "See where users get lost" },
  ];

  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg,#0d0b1e 0%,#0a0a0f 60%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 32px", overflowY: "auto" }}>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          marginBottom: 24,
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(124,106,247,0.2)", border: "1.5px solid rgba(124,106,247,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
          ⬡
        </div>
      </div>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.4s ease 0.08s, transform 0.4s ease 0.08s",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
          Welcome to<br />Protoflow
        </div>
      </div>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.16s",
          color: "rgba(255,255,255,0.45)",
          fontSize: 13,
          textAlign: "center",
          marginBottom: 32,
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        Build, test, and iterate — faster.
      </div>

      <div style={{ width: "100%", marginBottom: 32, display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.4s ease ${item.delay}ms, transform 0.4s ease ${item.delay}ms`,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 18, color: "rgba(124,106,247,0.9)", width: 24, textAlign: "center" }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans, sans-serif)" }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => navigate("signup")}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: "rgba(124,106,247,1)", border: "none", color: "#fff", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Get started
        </button>
        <button
          onClick={() => navigate("dashboard")}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 500, fontSize: 14, cursor: "pointer" }}
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Signup ───────────────────────────────────────────────────────────
function SignupScreen({ navigate }: { navigate: (id: ScreenId) => void }): ReactElement {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string }[] = [
    { key: "name",     label: "Full name",   type: "text",     placeholder: "Alex Morgan" },
    { key: "email",    label: "Work email",  type: "email",    placeholder: "alex@company.com" },
    { key: "password", label: "Password",    type: "password", placeholder: "Min. 8 characters" },
  ];

  return (
    <div style={{ height: "100%", background: "#0a0a0f", display: "flex", flexDirection: "column", padding: "48px 24px 32px", overflowY: "auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Create account</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans, sans-serif)" }}>Join thousands of product teams</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {fields.map((field) => (
          <div key={field.key}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", marginBottom: 6, fontFamily: "var(--font-sans, sans-serif)", textTransform: "uppercase" }}>
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key]}
              onFocus={() => setFocused(field.key)}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: focused === field.key ? "1.5px solid rgba(124,106,247,0.8)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: focused === field.key ? "0 0 0 3px rgba(124,106,247,0.15)" : "none",
                color: "#fff",
                fontSize: 14,
                fontFamily: "var(--font-sans, sans-serif)",
                outline: "none",
                transition: "border 0.15s, box-shadow 0.15s",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => navigate("dashboard")}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: "rgba(124,106,247,1)", border: "none", color: "#fff", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 14 }}
        >
          Continue
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans, sans-serif)", margin: 0 }}>
          By continuing, you agree to our{" "}
          <span style={{ color: "rgba(124,106,247,0.8)", textDecoration: "underline", cursor: "pointer" }}>Terms</span>
          {" & "}
          <span style={{ color: "rgba(124,106,247,0.8)", textDecoration: "underline", cursor: "pointer" }}>Privacy</span>
        </p>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard ────────────────────────────────────────────────────────
function DashboardScreen({ navigate }: { navigate: (id: ScreenId) => void }): ReactElement {
  const [activeFilter, setActiveFilter] = useState("Projects");
  const filters = ["Projects", "Analytics", "Settings"];

  const stats = [
    { label: "Screens", value: "14" },
    { label: "Flows",   value: "6"  },
    { label: "Testers", value: "3"  },
    { label: "Score",   value: "89%"},
  ];

  const projects: { name: string; tag: string; target: ScreenId }[] = [
    { name: "Onboarding v3",  tag: "Active",   target: "project" },
    { name: "Checkout Flow",  tag: "Review",   target: "project" },
    { name: "Settings v2",    tag: "Draft",    target: "project" },
    { name: "Mobile Nav",     tag: "Archived", target: "project" },
  ];

  const tagColors: Record<string, string> = {
    Active:   "rgba(52,211,153,0.15)",
    Review:   "rgba(232,200,74,0.15)",
    Draft:    "rgba(255,255,255,0.07)",
    Archived: "rgba(255,255,255,0.04)",
  };
  const tagText: Record<string, string> = {
    Active:   "#34d399",
    Review:   "#e8c84a",
    Draft:    "rgba(255,255,255,0.4)",
    Archived: "rgba(255,255,255,0.25)",
  };

  const handleFilter = (f: string) => {
    setActiveFilter(f);
    if (f === "Analytics") navigate("analytics");
    if (f === "Settings")  navigate("settings");
  };

  return (
    <div style={{ height: "100%", background: "#0a0a0f", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "44px 20px 16px", background: "linear-gradient(180deg,#0d0b1e 0%,#0a0a0f 100%)" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 2 }}>Good morning</div>
        <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 22, fontWeight: 700, color: "#fff" }}>Your workspace</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "0 16px 16px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: activeFilter === f ? "rgba(124,106,247,0.6)" : "rgba(255,255,255,0.08)",
              background: activeFilter === f ? "rgba(124,106,247,0.15)" : "transparent",
              color: activeFilter === f ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.4)",
              fontSize: 12,
              fontFamily: "var(--font-sans, sans-serif)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-sans, sans-serif)" }}>Recent projects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map((p) => (
            <button
              key={p.name}
              onClick={() => navigate(p.target)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(124,106,247,0.1)", border: "1px solid rgba(124,106,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>6 screens · Updated 2d ago</div>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: tagColors[p.tag], color: tagText[p.tag], fontFamily: "var(--font-sans, sans-serif)" }}>{p.tag}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 0 24px", marginTop: 16 }}>
        {[{ icon: "⊞", label: "Home" }, { icon: "◫", label: "Projects" }, { icon: "▶", label: "Testing" }, { icon: "○", label: "Profile" }].map((tab, i) => (
          <button key={tab.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <span style={{ fontSize: 18, color: i === 0 ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.3)" }}>{tab.icon}</span>
            <span style={{ fontSize: 9, color: i === 0 ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans, sans-serif)" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Project ──────────────────────────────────────────────────────────
function ProjectScreen({ navigate }: { navigate: (id: ScreenId) => void }): ReactElement {
  const items = [
    { name: "Welcome",   tag: "wireframe" },
    { name: "Sign Up",   tag: "prototype" },
    { name: "Dashboard", tag: "prototype" },
    { name: "Project",   tag: "prototype" },
    { name: "Analytics", tag: "wireframe" },
    { name: "Settings",  tag: "wireframe" },
  ];

  return (
    <div style={{ height: "100%", background: "#0a0a0f", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "44px 16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("dashboard")} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#fff" }}>←</button>
        <div>
          <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 18, fontWeight: 700, color: "#fff" }}>Onboarding v3</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>Last edited 2 hours ago</div>
        </div>
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans, sans-serif)" }}>Progress</span>
          <span style={{ fontSize: 11, color: "#34d399", fontFamily: "var(--font-mono, monospace)" }}>3/6 screens</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ width: "50%", height: "100%", borderRadius: 2, background: "linear-gradient(90deg,rgba(124,106,247,1),rgba(52,211,153,0.8))" }} />
        </div>
      </div>

      <div style={{ padding: "0 16px", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{item.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  {item.tag === "prototype" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />}
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>{item.tag}</span>
                </div>
              </div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>›</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px 32px", display: "flex", gap: 10 }}>
        <button style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "rgba(124,106,247,1)", border: "none", color: "#fff", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          ▶ Play flow
        </button>
        <button style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
          Share
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Analytics ────────────────────────────────────────────────────────
function AnalyticsScreen({ navigate }: { navigate: (id: ScreenId) => void }): ReactElement {
  const barHeights = [40, 65, 45, 80, 55, 90, 70, 50, 85, 60, 75, 45];
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const rows = [
    { name: "Welcome",   pct: 100, drop: "—"   },
    { name: "Sign Up",   pct: 78,  drop: "−22%" },
    { name: "Dashboard", pct: 62,  drop: "−16%" },
    { name: "Project",   pct: 50,  drop: "−12%" },
  ];

  return (
    <div style={{ height: "100%", background: "#0a0a0f", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "44px 16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("dashboard")} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#fff" }}>←</button>
        <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 18, fontWeight: 700, color: "#fff" }}>Analytics</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 20px" }}>
        {[{ label: "Avg. score", val: "89%", color: "#34d399" }, { label: "Avg. time", val: "4.2s", color: "#e8c84a" }, { label: "Active tests", val: "3", color: "rgba(124,106,247,1)" }].map((k) => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 10px" }}>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 20, fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-sans, sans-serif)" }}>Sessions (last 12 days)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 10px 0" }}>
          {barHeights.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: mounted ? `${h}%` : "0%",
                borderRadius: "3px 3px 0 0",
                background: `rgba(124,106,247,${0.4 + (h / 100) * 0.6})`,
                transition: `height 0.5s ease ${i * 40}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-sans, sans-serif)" }}>Screen drop-off</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.name} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{row.name}</span>
                <span style={{ fontSize: 11, color: row.drop === "—" ? "rgba(255,255,255,0.3)" : "#e8c84a", fontFamily: "var(--font-mono, monospace)" }}>{row.drop}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ width: `${row.pct}%`, height: "100%", borderRadius: 2, background: "rgba(124,106,247,0.7)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Settings ─────────────────────────────────────────────────────────
function SettingsScreen({ navigate }: { navigate: (id: ScreenId) => void }): ReactElement {
  const [notifs, setNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  return (
    <div style={{ height: "100%", background: "#0a0a0f", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "44px 16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("dashboard")} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#fff" }}>←</button>
        <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 18, fontWeight: 700, color: "#fff" }}>Settings</div>
      </div>

      <div style={{ margin: "0 16px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,rgba(124,106,247,0.8),rgba(52,211,153,0.6))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>A</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>Alex Morgan</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans, sans-serif)" }}>alex@company.com</div>
        </div>
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-sans, sans-serif)" }}>Account</div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          {[{ label: "Full name", value: "Alex Morgan" }, { label: "Work email", value: "alex@company.com" }].map((row, i) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans, sans-serif)" }}>{row.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{row.value}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>›</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans, sans-serif)" }}>Plan</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(232,200,74,0.15)", color: "#e8c84a", fontFamily: "var(--font-sans, sans-serif)" }}>Upgrade</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-sans, sans-serif)" }}>Preferences</div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          {[
            { label: "Notifications",   value: notifs,         set: setNotifs },
            { label: "Dark mode",       value: darkMode,       set: setDarkMode },
            { label: "Share analytics", value: shareAnalytics, set: setShareAnalytics },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans, sans-serif)" }}>{row.label}</span>
              <Toggle value={row.value} onChange={row.set} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>
        <button style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.8)", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Live Player ──────────────────────────────────────────────────────────────
function LivePlayer({
  startId,
  screens,
  onClose,
}: {
  startId: ScreenId;
  screens: Screen[];
  onClose: () => void;
}): ReactElement {
  const [currentId, setCurrentId] = useState<ScreenId>(startId);
  const [nextId, setNextId] = useState<ScreenId | null>(null);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [hudVisible, setHudVisible] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHud = useCallback(() => {
    setHudVisible(true);
    if (hudTimer.current) clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => setHudVisible(false), 4000);
  }, []);

  useEffect(() => {
    resetHud();
    return () => {
      if (hudTimer.current) clearTimeout(hudTimer.current);
    };
  }, [resetHud]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const currentScreen = screens.find((s) => s.id === currentId)!;
  const transition = currentScreen.transition;

  const navigate = useCallback(
    (targetId: ScreenId) => {
      if (animPhase !== "idle") return;
      setNextId(targetId);
      setAnimPhase("exit");
      setTimeout(() => {
        setCurrentId(targetId);
        setNextId(null);
        setAnimPhase("enter");
        setTimeout(() => setAnimPhase("idle"), 380);
      }, 280);
      resetHud();
    },
    [animPhase, resetHud]
  );

  const getExitStyle = (t: TransitionType): React.CSSProperties => {
    if (animPhase !== "exit") return { opacity: 1, transform: "translateX(0) scale(1)", transition: "none" };
    if (t === "slide") return { opacity: 1, transform: "translateX(-100%)", transition: "transform 0.28s ease-in-out" };
    if (t === "push")  return { opacity: 1, transform: "translateX(-100%) scale(0.95)", transition: "transform 0.28s ease-in-out" };
    return { opacity: 0, transform: "translateX(0)", transition: "opacity 0.28s ease" };
  };

  const getEnterStyle = (t: TransitionType): React.CSSProperties => {
    if (animPhase === "enter") return { opacity: 1, transform: "translateX(0) scale(1)", transition: "transform 0.38s ease-out, opacity 0.38s ease-out" };
    if (animPhase === "idle")  return { opacity: 1, transform: "translateX(0) scale(1)", transition: "none" };
    if (t === "slide") return { opacity: 1, transform: "translateX(100%)", transition: "none" };
    if (t === "push")  return { opacity: 1, transform: "translateX(100%) scale(0.95)", transition: "none" };
    return { opacity: 0, transform: "translateX(0)", transition: "none" };
  };

  const renderScreen = (id: ScreenId): ReactElement => {
    const props = { navigate };
    if (id === "welcome")   return <WelcomeScreen {...props} />;
    if (id === "signup")    return <SignupScreen {...props} />;
    if (id === "dashboard") return <DashboardScreen {...props} />;
    if (id === "project")   return <ProjectScreen {...props} />;
    if (id === "analytics") return <AnalyticsScreen {...props} />;
    return <SettingsScreen {...props} />;
  };

  const currentIdx = screens.findIndex((s) => s.id === currentId);

  return (
    <div
      onClick={resetHud}
      style={{ position: "fixed", inset: 0, background: "rgba(5,4,12,0.97)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 375,
          height: 812,
          borderRadius: 52,
          background: "#111",
          border: "10px solid #1e1e2a",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Notch */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 30, background: "#111", borderRadius: "0 0 18px 18px", zIndex: 10 }} />

        {/* Screen container */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 42 }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...getExitStyle(transition) }}>
            {renderScreen(currentId)}
          </div>
          {nextId && (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...getEnterStyle(transition) }}>
              {renderScreen(nextId)}
            </div>
          )}
        </div>

        {/* HUD top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "36px 20px 12px",
            background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
            display: "flex",
            justifyContent: "space-between",
            opacity: hudVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: hudVisible ? "auto" : "none",
            zIndex: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const conn = currentScreen.connections[0];
              if (conn) navigate(conn);
            }}
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "var(--font-sans, sans-serif)" }}
          >
            ← Back
          </button>
        </div>

        {/* HUD bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 20px 28px",
            background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: hudVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: hudVisible ? "auto" : "none",
            zIndex: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 500 }}>{currentScreen.name}</span>
            <button
              onClick={() => setShowMap((v) => !v)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "var(--font-sans, sans-serif)" }}
            >
              ⊞ Map
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {screens.map((s, i) => (
              <div
                key={s.id}
                onClick={() => navigate(s.id)}
                style={{ width: i === currentIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === currentIdx ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.2)", transition: "width 0.25s, background 0.25s", cursor: "pointer" }}
              />
            ))}
          </div>
        </div>

        {/* Mini map */}
        {showMap && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "absolute", bottom: 90, left: 12, right: 12, background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 14, zIndex: 30 }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-sans, sans-serif)" }}>Flow map</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {screens.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { navigate(s.id); setShowMap(false); }}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    background: s.id === currentId ? "rgba(124,106,247,0.3)" : "rgba(255,255,255,0.06)",
                    border: s.id === currentId ? "1px solid rgba(124,106,247,0.6)" : "1px solid rgba(255,255,255,0.08)",
                    color: s.id === currentId ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontFamily: "var(--font-sans, sans-serif)",
                    cursor: "pointer",
                  }}
                >
                  {s.name.split("—").pop()?.trim() || s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{ position: "fixed", top: 20, right: 24, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Flow Canvas Tab ──────────────────────────────────────────────────────────
function FlowCanvasTab({
  screens,
  selectedId,
  setSelectedId,
  onPlay,
  convertingIds,
  onConvert,
}: {
  screens: Screen[];
  selectedId: ScreenId;
  setSelectedId: (id: ScreenId) => void;
  onPlay: (id: ScreenId) => void;
  convertingIds: Set<ScreenId>;
  onConvert: (id: ScreenId) => void;
}): ReactElement {
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("props");
  const [transitions, setTransitions] = useState<Record<ScreenId, TransitionType>>({
    welcome:   "slide",
    signup:    "fade",
    dashboard: "slide",
    project:   "push",
    analytics: "push",
    settings:  "fade",
  });
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = screens.find((s) => s.id === selectedId)!;

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (playInterval.current) clearInterval(playInterval.current);
    } else {
      setPlaying(true);
      setPlayhead(0);
      playInterval.current = setInterval(() => {
        setPlayhead((p) => {
          if (p >= 100) {
            setPlaying(false);
            if (playInterval.current) clearInterval(playInterval.current);
            return 0;
          }
          return p + 1;
        });
      }, 40);
    }
  };

  useEffect(() => () => { if (playInterval.current) clearInterval(playInterval.current); }, []);

  const tracks = ["Opacity", "Position X", "Scale", "Blur"];
  const trackColors = ["rgba(124,106,247,0.8)", "rgba(52,211,153,0.8)", "rgba(232,200,74,0.8)", "rgba(124,106,247,0.4)"];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div style={{ width: 160, borderRight: "1px solid rgba(255,255,255,0.06)", overflowY: "auto", background: "rgba(255,255,255,0.01)", flexShrink: 0 }}>
        <div style={{ padding: "12px 10px 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans, sans-serif)" }}>
          Screens
        </div>
        {screens.map((s, i) => (
          <div
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            onDoubleClick={() => onPlay(s.id)}
            style={{
              margin: "0 8px 6px",
              borderRadius: 10,
              border: selectedId === s.id ? "1.5px solid rgba(124,106,247,0.7)" : "1px solid rgba(255,255,255,0.07)",
              background: selectedId === s.id ? "rgba(124,106,247,0.08)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ height: 88, background: `hsl(${240 + i * 30},15%,10%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 22, opacity: 0.3 }}>⬡</div>
              <div style={{ position: "absolute", inset: 0, padding: "8px 8px" }}>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", marginBottom: 4, width: "70%" }} />
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", marginBottom: 3, width: "90%" }} />
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", marginBottom: 3, width: "60%" }} />
                <div style={{ height: 20, borderRadius: 4, background: `rgba(124,106,247,${selectedId === s.id ? 0.25 : 0.1})`, marginTop: 6 }} />
              </div>
              {convertingIds.has(s.id) && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(232,200,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 9, color: "#e8c84a", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600 }}>Converting…</div>
                </div>
              )}
            </div>
            <div style={{ padding: "6px 8px 7px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: selectedId === s.id ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans, sans-serif)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.name.split("—").pop()?.trim() || s.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                {s.type === "prototype" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />}
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans, sans-serif)" }}>{s.type}</span>
              </div>
            </div>
          </div>
        ))}
        <div style={{ padding: "6px 10px 12px", fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", fontFamily: "var(--font-sans, sans-serif)" }}>
          Double-click to play
        </div>
      </div>

      {/* Center: SVG Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "radial-gradient(ellipse at 50% 50%, rgba(124,106,247,0.04) 0%, transparent 70%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-sans, sans-serif)", pointerEvents: "none", whiteSpace: "nowrap" }}>
          Double-click any screen to play
        </div>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(124,106,247,0.5)" />
            </marker>
          </defs>
          {screens.map((s) =>
            s.connections.map((targetId) => {
              const from = NODE_POSITIONS[s.id];
              const to = NODE_POSITIONS[targetId];
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2 - 20;
              return (
                <path
                  key={`${s.id}-${targetId}`}
                  d={`M${from.x + 60},${from.y + 28} Q${mx},${my} ${to.x},${to.y + 28}`}
                  stroke={selectedId === s.id || selectedId === targetId ? "rgba(124,106,247,0.7)" : "rgba(124,106,247,0.25)"}
                  strokeWidth={selectedId === s.id || selectedId === targetId ? 1.5 : 1}
                  strokeDasharray="5,4"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              );
            })
          )}
          {screens.map((s) => {
            const pos = NODE_POSITIONS[s.id];
            const isSelected = selectedId === s.id;
            return (
              <g key={s.id} onClick={() => setSelectedId(s.id)} onDoubleClick={() => onPlay(s.id)} style={{ cursor: "pointer" }}>
                <rect x={pos.x} y={pos.y} width={120} height={56} rx={10} fill={isSelected ? "rgba(124,106,247,0.15)" : "rgba(255,255,255,0.04)"} stroke={isSelected ? "rgba(124,106,247,0.8)" : "rgba(255,255,255,0.1)"} strokeWidth={isSelected ? 1.5 : 1} />
                <text x={pos.x + 60} y={pos.y + 22} textAnchor="middle" fill={isSelected ? "#fff" : "rgba(255,255,255,0.7)"} fontSize={11} fontFamily="var(--font-sans,sans-serif)" fontWeight={isSelected ? 700 : 400}>
                  {s.name.split("—").pop()?.trim() || s.name}
                </text>
                <text x={pos.x + 60} y={pos.y + 38} textAnchor="middle" fill={s.type === "prototype" ? "#34d399" : "rgba(255,255,255,0.3)"} fontSize={9} fontFamily="var(--font-sans,sans-serif)">
                  {s.type}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right inspector */}
      <div style={{ width: 220, borderLeft: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "14px 14px 10px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 2 }}>{selected.name.split("—").pop()?.trim() || selected.name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>{selected.type}</div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", margin: "0 14px" }}>
          {(["props", "timeline"] as InspectorTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setInspectorTab(t)}
              style={{ flex: 1, padding: "7px 0", background: "none", border: "none", borderBottom: inspectorTab === t ? "2px solid rgba(124,106,247,1)" : "2px solid transparent", color: inspectorTab === t ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}
            >
              {t}
            </button>
          ))}
        </div>

        {inspectorTab === "props" && (
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-sans, sans-serif)" }}>Connections</div>
              {selected.connections.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans, sans-serif)" }}>No outgoing connections</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.connections.map((cid) => {
                    const target = screens.find((s) => s.id === cid);
                    return (
                      <div
                        key={cid}
                        onClick={() => setSelectedId(cid)}
                        style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(124,106,247,0.07)", border: "1px solid rgba(124,106,247,0.2)", fontSize: 11, color: "rgba(124,106,247,0.9)", fontFamily: "var(--font-sans, sans-serif)", cursor: "pointer" }}
                      >
                        → {target?.name.split("—").pop()?.trim() || cid}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-sans, sans-serif)" }}>Transition</div>
              <div style={{ display: "flex", gap: 5 }}>
                {(["slide", "push", "fade"] as TransitionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTransitions((prev) => ({ ...prev, [selectedId]: t }))}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 7,
                      border: transitions[selectedId] === t ? "1.5px solid rgba(124,106,247,0.7)" : "1px solid rgba(255,255,255,0.08)",
                      background: transitions[selectedId] === t ? "rgba(124,106,247,0.12)" : "rgba(255,255,255,0.03)",
                      color: transitions[selectedId] === t ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.35)",
                      fontSize: 10,
                      fontFamily: "var(--font-sans, sans-serif)",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {TRANSITION_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onPlay(selectedId)}
              style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "rgba(124,106,247,1)", border: "none", color: "#fff", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              ▶ Play from here
            </button>

            {selected.type === "wireframe" && (
              <button
                onClick={() => onConvert(selectedId)}
                style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "rgba(232,200,74,0.1)", border: "1px solid rgba(232,200,74,0.25)", color: "#e8c84a", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
              >
                ✦ Convert to prototype
              </button>
            )}
          </div>
        )}

        {inspectorTab === "timeline" && (
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={togglePlay}
                style={{ width: 28, height: 28, borderRadius: 8, background: playing ? "rgba(232,200,74,0.15)" : "rgba(124,106,247,0.2)", border: "none", color: playing ? "#e8c84a" : "rgba(124,106,247,1)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {playing ? "■" : "▶"}
              </button>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", position: "relative" }}>
                <div style={{ width: `${playhead}%`, height: "100%", borderRadius: 2, background: "rgba(124,106,247,0.8)", transition: playing ? "none" : "width 0.1s" }} />
                <div style={{ position: "absolute", top: -4, left: `${playhead}%`, width: 2, height: 11, background: "#fff", borderRadius: 1, transform: "translateX(-50%)" }} />
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono, monospace)", minWidth: 24, textAlign: "right" }}>{(playhead * 0.04).toFixed(1)}s</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tracks.map((track, i) => (
                <div key={track}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 4 }}>{track}</div>
                  <div style={{ height: 16, borderRadius: 4, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: `${10 + i * 5}%`,
                        width: `${40 + i * 8}%`,
                        height: "100%",
                        borderRadius: 4,
                        background: trackColors[i],
                        opacity: 0.8,
                      }}
                    />
                    {[20 + i * 6, 60 + i * 4].map((kf, ki) => (
                      <div
                        key={ki}
                        style={{ position: "absolute", top: "50%", left: `${kf}%`, transform: "translate(-50%, -50%) rotate(45deg)", width: 6, height: 6, background: "#fff", borderRadius: 1 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── User Testing Tab ─────────────────────────────────────────────────────────
function UserTestingTab(): ReactElement {
  const sessions = [
    { name: "Priya K.",  time: "2m 14s", score: 94, status: "Completed",   flow: "Onboarding v3" },
    { name: "Marco R.",  time: "3m 52s", score: 81, status: "Completed",   flow: "Checkout Flow"  },
    { name: "Aisha T.",  time: "1m 37s", score: 89, status: "In progress", flow: "Onboarding v3" },
    { name: "Lena P.",   time: "4m 08s", score: 73, status: "Completed",   flow: "Settings v2"   },
    { name: "James W.",  time: "2m 58s", score: 88, status: "Completed",   flow: "Mobile Nav"    },
  ];

  return (
    <div style={{ padding: "24px 28px", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 3 }}>User Testing</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>Live sessions and recorded test results</div>
        </div>
        <button style={{ padding: "9px 18px", borderRadius: 10, background: "rgba(124,106,247,1)", border: "none", color: "#fff", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          + New test
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[{ label: "Total sessions", val: "5", color: "rgba(124,106,247,1)" }, { label: "Avg. completion", val: "89%", color: "#34d399" }, { label: "Avg. duration", val: "2m 54s", color: "#e8c84a" }].map((k) => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 22, fontWeight: 700, color: k.color, marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {["Tester", "Flow", "Duration", "Score", "Status"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "var(--font-sans, sans-serif)" }}>{h}</span>
          ))}
        </div>
        {sessions.map((s, i) => (
          <div key={s.name} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "13px 16px", borderBottom: i < sessions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${240 + i * 40},50%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</div>
              <span style={{ fontSize: 13, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans, sans-serif)" }}>{s.flow}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono, monospace)" }}>{s.time}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.score >= 90 ? "#34d399" : s.score >= 80 ? "#e8c84a" : "rgba(239,68,68,0.8)", fontFamily: "var(--font-mono, monospace)" }}>{s.score}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans, sans-serif)" }}>/100</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: s.status === "In progress" ? "rgba(232,200,74,0.12)" : "rgba(52,211,153,0.12)", color: s.status === "In progress" ? "#e8c84a" : "#34d399", fontFamily: "var(--font-sans, sans-serif)" }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 4 }}>Tap heatmap</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans, sans-serif)", marginBottom: 16 }}>Onboarding v3 · Dashboard screen</div>
        <div style={{ height: 120, borderRadius: 10, background: "rgba(255,255,255,0.03)", position: "relative", overflow: "hidden" }}>
          {[
            { x: 30, y: 40, r: 36, op: 0.6 },
            { x: 60, y: 65, r: 28, op: 0.4 },
            { x: 75, y: 30, r: 22, op: 0.5 },
            { x: 20, y: 70, r: 18, op: 0.3 },
            { x: 50, y: 50, r: 40, op: 0.35 },
          ].map((circle, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${circle.x}%`,
                top: `${circle.y}%`,
                width: circle.r * 2,
                height: circle.r * 2,
                borderRadius: "50%",
                transform: "translate(-50%,-50%)",
                background: `radial-gradient(circle, rgba(232,200,74,${circle.op}) 0%, rgba(124,106,247,${circle.op * 0.5}) 60%, transparent 100%)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback Tab ─────────────────────────────────────────────────────────────
function FeedbackTab(): ReactElement {
  const entries = [
    { name: "Priya K.",  time: "1h ago",  rating: 5, text: "The onboarding flow feels super intuitive. Love the animations.",    tag: "Positive"   },
    { name: "Marco R.",  time: "3h ago",  rating: 3, text: "Checkout is a bit confusing — couldn't find the promo code field.", tag: "Confusion"  },
    { name: "Aisha T.",  time: "5h ago",  rating: 4, text: "Really clean design. The transition from dashboard to project is ✨", tag: "Positive"   },
    { name: "Lena P.",   time: "1d ago",  rating: 2, text: "Settings page is buried. Needs a shortcut from the main nav.",      tag: "Suggestion" },
    { name: "James W.",  time: "2d ago",  rating: 4, text: "Great prototype experience overall. The mobile nav feels natural.",  tag: "Positive"   },
  ];

  const tagBg: Record<string, string> = {
    Positive:   "rgba(52,211,153,0.15)",
    Confusion:  "rgba(232,200,74,0.15)",
    Suggestion: "rgba(124,106,247,0.15)",
  };
  const tagFg: Record<string, string> = {
    Positive:   "#34d399",
    Confusion:  "#e8c84a",
    Suggestion: "rgba(124,106,247,1)",
  };

  return (
    <div style={{ padding: "24px 28px", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Feedback</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>{entries.length} responses collected</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Positive", "Confusion", "Suggestion"].map((f) => (
            <button key={f} style={{ padding: "6px 12px", borderRadius: 8, background: f === "All" ? "rgba(124,106,247,0.15)" : "rgba(255,255,255,0.04)", border: f === "All" ? "1px solid rgba(124,106,247,0.4)" : "1px solid rgba(255,255,255,0.07)", color: f === "All" ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "var(--font-sans, sans-serif)", cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[{ label: "Positive", count: 3, color: "#34d399" }, { label: "Confusion", count: 1, color: "#e8c84a" }, { label: "Suggestion", count: 1, color: "rgba(124,106,247,1)" }].map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 3 }}>{s.count}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans, sans-serif)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map((entry) => (
          <div key={entry.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "rgba(124,106,247,0.9)", fontWeight: 700 }}>{entry.name[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>{entry.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans, sans-serif)" }}>{entry.time}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: 11, color: i < entry.rating ? "#e8c84a" : "rgba(255,255,255,0.12)" }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: tagBg[entry.tag], color: tagFg[entry.tag], fontFamily: "var(--font-sans, sans-serif)" }}>
                  {entry.tag}
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans, sans-serif)", lineHeight: 1.55 }}>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Builder (modal) ──────────────────────────────────────────────────────────
function Builder({ onClose }: { onClose: () => void }): ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>("canvas");
  const [selectedId, setSelectedId] = useState<ScreenId>("welcome");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerStart, setPlayerStart] = useState<ScreenId>("welcome");
  const [screenTypes, setScreenTypes] = useState<Record<ScreenId, ScreenType>>({
    welcome:   "wireframe",
    signup:    "prototype",
    dashboard: "prototype",
    project:   "prototype",
    analytics: "wireframe",
    settings:  "wireframe",
  });
  const [convertingIds, setConvertingIds] = useState<Set<ScreenId>>(new Set());

  const screens: Screen[] = SCREENS.map((s) => ({ ...s, type: screenTypes[s.id] }));

  const openPlayer = (id: ScreenId) => { setPlayerStart(id); setPlayerOpen(true); };

  const handleConvert = (id: ScreenId) => {
    setConvertingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setScreenTypes((prev) => ({ ...prev, [id]: "prototype" }));
      setConvertingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }, 900);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "canvas",   label: "Flow Canvas"  },
    { id: "testing",  label: "User Testing" },
    { id: "feedback", label: "Feedback"     },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 8000, background: "#0a0a0f", display: "flex", flexDirection: "column", color: "#fff", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      <header style={{ height: 52, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0, background: "rgba(10,10,15,0.95)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(124,106,247,0.25)", border: "1px solid rgba(124,106,247,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>
          <span style={{ fontFamily: "var(--font-serif, serif)", fontWeight: 700, fontSize: 15, color: "#fff" }}>Protoflow</span>
        </div>
        <nav style={{ display: "flex", gap: 2, flex: 1 }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: activeTab === tab.id ? "rgba(124,106,247,0.12)" : "transparent", color: activeTab === tab.id ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "var(--font-sans, sans-serif)", fontWeight: activeTab === tab.id ? 600 : 400, cursor: "pointer" }}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose}
            style={{ padding: "7px 14px", borderRadius: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "var(--font-sans, sans-serif)", cursor: "pointer" }}>
            ← Back to prototype
          </button>
          <button onClick={() => openPlayer(selectedId)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "rgba(124,106,247,1)", border: "none", color: "#fff", fontSize: 12, fontFamily: "var(--font-sans, sans-serif)", fontWeight: 600, cursor: "pointer" }}>
            <span style={{ fontSize: 10 }}>▶</span> Play prototype
          </button>
        </div>
      </header>
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "canvas"   && <FlowCanvasTab screens={screens} selectedId={selectedId} setSelectedId={setSelectedId} onPlay={openPlayer} convertingIds={convertingIds} onConvert={handleConvert} />}
        {activeTab === "testing"  && <UserTestingTab />}
        {activeTab === "feedback" && <FeedbackTab />}
      </main>
      {playerOpen && <LivePlayer startId={playerStart} screens={screens} onClose={() => setPlayerOpen(false)} />}
    </div>
  );
}

// ─── App — boots directly into the live prototype ─────────────────────────────
export default function App(): ReactElement {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [currentId, setCurrentId] = useState<ScreenId>("welcome");
  const [nextId, setNextId]       = useState<ScreenId | null>(null);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [hudVisible, setHudVisible] = useState(true);
  const [showMap, setShowMap]     = useState(false);
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHud = useCallback(() => {
    setHudVisible(true);
    if (hudTimer.current) clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => setHudVisible(false), 5000);
  }, []);

  useEffect(() => { resetHud(); return () => { if (hudTimer.current) clearTimeout(hudTimer.current); }; }, [resetHud]);

  const navigate = useCallback((targetId: ScreenId) => {
    if (animPhase !== "idle") return;
    const tx = SCREENS.find((s) => s.id === currentId)?.transition ?? "slide";
    setNextId(targetId);
    setAnimPhase("exit");
    setTimeout(() => {
      setCurrentId(targetId);
      setNextId(null);
      setAnimPhase("enter");
      setTimeout(() => setAnimPhase("idle"), 380);
    }, 280);
    resetHud();
  }, [animPhase, currentId, resetHud]);

  const currentScreen = SCREENS.find((s) => s.id === currentId)!;
  const transition = currentScreen.transition;
  const currentIdx = SCREENS.findIndex((s) => s.id === currentId);

  const getExitStyle = (t: TransitionType): React.CSSProperties => {
    if (animPhase !== "exit") return { opacity: 1, transform: "translateX(0) scale(1)", transition: "none" };
    if (t === "slide") return { opacity: 1, transform: "translateX(-100%)",             transition: "transform 0.28s ease-in-out" };
    if (t === "push")  return { opacity: 1, transform: "translateX(-100%) scale(0.95)", transition: "transform 0.28s ease-in-out" };
    return { opacity: 0, transform: "translateX(0)", transition: "opacity 0.28s ease" };
  };

  const getEnterStyle = (t: TransitionType): React.CSSProperties => {
    if (animPhase === "enter") return { opacity: 1, transform: "translateX(0) scale(1)",   transition: "transform 0.38s ease-out, opacity 0.38s ease-out" };
    if (animPhase === "idle")  return { opacity: 1, transform: "translateX(0) scale(1)",   transition: "none" };
    if (t === "slide") return { opacity: 1, transform: "translateX(100%)",             transition: "none" };
    if (t === "push")  return { opacity: 1, transform: "translateX(100%) scale(0.95)", transition: "none" };
    return { opacity: 0, transform: "translateX(0)", transition: "none" };
  };

  const renderScreen = (id: ScreenId): ReactElement => {
    const props = { navigate };
    if (id === "welcome")   return <WelcomeScreen   {...props} />;
    if (id === "signup")    return <SignupScreen     {...props} />;
    if (id === "dashboard") return <DashboardScreen  {...props} />;
    if (id === "project")   return <ProjectScreen    {...props} />;
    if (id === "analytics") return <AnalyticsScreen  {...props} />;
    return <SettingsScreen {...props} />;
  };

  return (
    <>
      {builderOpen && <Builder onClose={() => setBuilderOpen(false)} />}

      {/* Full-viewport prototype stage */}
      <div
        onClick={resetHud}
        style={{
          position: "fixed", inset: 0,
          background: "#05040c",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Ambient background mesh */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,200,74,0.07) 0%, transparent 70%)", bottom: "10%", right: "15%", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)", top: "15%", left: "10%", filter: "blur(40px)" }} />
          {/* Subtle dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5 }} />
        </div>

        {/* Phone shell */}
        <div style={{
          width: 375, height: 812,
          borderRadius: 52,
          background: "#111",
          border: "10px solid #1c1b28",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 60px 120px rgba(0,0,0,0.85), 0 0 80px rgba(124,106,247,0.12), inset 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
          zIndex: 1,
        }}>
          {/* Notch */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 126, height: 32, background: "#111", borderRadius: "0 0 20px 20px", zIndex: 10 }} />

          {/* Screens */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 42 }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...getExitStyle(transition) }}>
              {renderScreen(currentId)}
            </div>
            {nextId && (
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...getEnterStyle(transition) }}>
                {renderScreen(nextId)}
              </div>
            )}
          </div>

          {/* HUD — bottom gradient overlay */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "32px 20px 28px",
            background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
            display: "flex", flexDirection: "column", gap: 14, alignItems: "center",
            opacity: hudVisible ? 1 : 0,
            transition: "opacity 0.45s ease",
            pointerEvents: hudVisible ? "auto" : "none",
            zIndex: 20,
          }} onClick={(e) => e.stopPropagation()}>
            {/* Screen name */}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans, sans-serif)", letterSpacing: "0.04em" }}>
              {currentScreen.name}
            </div>
            {/* Dot indicator */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {SCREENS.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => navigate(s.id)}
                  style={{
                    width: i === currentIdx ? 22 : 6, height: 6,
                    borderRadius: 3,
                    background: i === currentIdx ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.22)",
                    transition: "width 0.25s ease, background 0.25s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            {/* Home indicator */}
            <div style={{ width: 100, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
          </div>

          {/* HUD — top gradient */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 80,
            background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
            pointerEvents: "none", zIndex: 9,
          }} />
        </div>

        {/* Map overlay (outside phone, floats left) */}
        {showMap && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "calc(50% - 375px/2 - 220px - 16px)",
              top: "50%", transform: "translateY(-50%)",
              width: 200,
              background: "rgba(12,11,20,0.96)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 18,
              padding: 14,
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-sans, sans-serif)" }}>
              Flow map
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {SCREENS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { navigate(s.id); setShowMap(false); }}
                  style={{
                    width: "100%", textAlign: "left",
                    padding: "7px 10px", borderRadius: 10,
                    background: s.id === currentId ? "rgba(124,106,247,0.2)" : "rgba(255,255,255,0.04)",
                    border: s.id === currentId ? "1px solid rgba(124,106,247,0.45)" : "1px solid rgba(255,255,255,0.06)",
                    color: s.id === currentId ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.5)",
                    fontSize: 11, fontFamily: "var(--font-sans, sans-serif)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.id === currentId ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.2)", flexShrink: 0, display: "inline-block" }} />
                  {s.name.split("—").pop()?.trim() ?? s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating controls — right side */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            right: "calc(50% - 375px/2 - 56px - 16px)",
            top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 8,
            opacity: hudVisible ? 1 : 0,
            transition: "opacity 0.45s ease",
            pointerEvents: hudVisible ? "auto" : "none",
            zIndex: 10,
          }}
        >
          {[
            { label: "⊞", title: "Flow map",      action: () => setShowMap((v) => !v), active: showMap },
            { label: "✎", title: "Open builder",   action: () => setBuilderOpen(true),  active: false },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.title}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: btn.active ? "rgba(124,106,247,0.3)" : "rgba(255,255,255,0.07)",
                border: btn.active ? "1px solid rgba(124,106,247,0.55)" : "1px solid rgba(255,255,255,0.1)",
                color: btn.active ? "rgba(124,106,247,1)" : "rgba(255,255,255,0.55)",
                fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(10px)",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {btn.label}
            </button>
          ))}

          {/* Protoflow wordmark */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(124,106,247,0.2)", border: "1px solid rgba(124,106,247,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>⬡</div>
            <span style={{ fontFamily: "var(--font-serif, serif)", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.02em", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>Protoflow</span>
          </div>
        </div>

        {/* Live pill — top center */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: 24,
            left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20,
            background: "rgba(12,11,20,0.85)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            opacity: hudVisible ? 1 : 0,
            transition: "opacity 0.45s ease",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px rgba(52,211,153,0.7)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans, sans-serif)", fontWeight: 500 }}>Live prototype</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono, monospace)" }}>· Onboarding v3</span>
        </div>
      </div>
    </>
  );
}
