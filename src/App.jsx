import React from "react";
import {
  COLORS, initScores, sortedScores, maxScore,
  validateEmail, loadState, saveState, clearState, useQuizHotkeys
} from "./engine";
import { loadQuizData } from "./lib/loadData";

// Google Apps Script endpoint for saving results
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

/* ---------- UI Components ---------- */

// Progress bar showing quiz completion percentage
function ProgressBar({ value }) {
  return (
    <div style={{ background: "#E5E7EB", height: 8, borderRadius: 999, width: "100%" }}>
      <div
        style={{
          width: `${value}%`,
          height: 8,
          borderRadius: 999,
          background: COLORS.enterpriseBlue,
          transition: "width 200ms ease"
        }}
      />
    </div>
  );
}

// Reusable button with hover effects and accessibility roles
function PrimaryButton({ children, onClick, role = "button", ariaChecked }) {
  const bg = "#FFFFFF";
  const bc = COLORS.enterpriseBlue;
  const hover = "0 8px 24px rgba(0,0,0,0.08)";
  return (
    <button
      onClick={onClick}
      role={role}
      aria-checked={ariaChecked}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "16px 18px",
        borderRadius: 16,
        border: `2px solid ${bc}`,
        background: bg,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        fontSize: 18,
        lineHeight: 1.35,
        cursor: "pointer"
      }}
      onMouseOver={(e) => (e.currentTarget.style.boxShadow = hover)}
      onMouseOut={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}
    >
      {children}
    </button>
  );
}


// Circular badge for answer labels (A/B)
function Badge({ letter }) {
  return (
    <span
      style={{
        display: "inline-flex",
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        fontWeight: 800,
        color: COLORS.deepBlue,
        background: "#F3F4F6",
        border: `1px solid ${COLORS.border}`
      }}
    >
      {letter}
    </span>
  );
}

// Styled input field with label
function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 14, opacity: 0.8 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px solid ${COLORS.border}`,
          outline: "none",
          fontSize: 16
        }}
      />
    </label>
  );
}

/* ---------- Main App Component ---------- */
export default function App() {
  // Quiz data and state
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");

  const [i, setI] = React.useState(0); // current question index
  const [scores, setScores] = React.useState(initScores());
  const [stage, setStage] = React.useState("quiz"); // "quiz" | "lead" | "result"
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [sendError, setSendError] = React.useState("");

  // Load quiz data and restore saved state
  React.useEffect(() => {
    (async () => {
      try {
        const d = await loadQuizData();
        setData(d);

        const restored = loadState();
        if (restored) {
          setI(Math.min(restored.i ?? 0, (d.questions?.length ?? 1) - 1));
          if (restored.scores) setScores(restored.scores);
          if (restored.stage) setStage(restored.stage);
          if (restored.name) setName(restored.name);
          if (restored.email) setEmail(restored.email);
        }
      } catch (e) {
        setLoadErr(e?.message || "Could not load quiz content.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived values
  const totalQ = data?.questions?.length || 0;
  const pct = totalQ ? Math.round((i / totalQ) * 100) : 0;

  const sorted = React.useMemo(() => sortedScores(scores), [scores]);
  const top = sorted[0]?.key;
  const second = sorted[1]?.key;

  // Save state on change
  React.useEffect(() => {
    saveState({ i, scores, stage, name, email });
  }, [i, scores, stage, name, email]);

  // Hotkeys for A/B selection
  useQuizHotkeys(
    stage === "quiz" && !!data && totalQ > 0,
    () => choose(data.questions[i].a.persona),
    () => choose(data.questions[i].b.persona)
  );

  // Early returns for loading/error
  if (loading) return <div>Loading quiz…</div>;
  if (loadErr) return <div>Error loading quiz: {loadErr}</div>;
  if (!data || totalQ === 0) return <div>No quiz data found.</div>;

  // Handle answer selection
  function choose(personaKey) {
    setScores((s) => ({ ...s, [personaKey]: (s[personaKey] || 0) + 1 }));
    const next = i + 1;
    setStage(next >= totalQ ? "lead" : "quiz");
    setI(next);
  }

  // Go back to previous question
  function back() {
    setI((x) => Math.max(0, x - 1));
  }

  // Submit name/email and show results
  async function submitLeadAndShowResults() {
    setSendError("");
    if (!name.trim() || !validateEmail(email)) {
      setSendError("Please enter a valid name and email.");
      return;
    }

    setStage("result");

    if (!GOOGLE_SCRIPT_URL) {
      console.warn("Missing VITE_GOOGLE_SCRIPT_URL");
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name,
      email,
      scores,
      top,
      second
    };

    try {
      setSending(true);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      console.log("Proxy response:", json);

      if (json.ok) {
        setSent(true);
      } else {
        setSendError("Server error: " + (json?.error || "unknown"));
      }

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setSent(true);
    } catch (e) {
      console.error("Error sending to Apps Script:", e);
      setSendError("Could not send to sheet (network or permissions).");
    } finally {
      setSending(false);
    }
  }

  // Restart the quiz
  function restart() {
    setI(0);
    setScores(initScores());
    setStage("quiz");
    setName(""); setEmail("");
    setSending(false); setSent(false); setSendError("");
    clearState();
  }

  const current = data.questions[i];

  // Render full UI (inline JSX)
  return (
    <div style={{ padding: 20 }}>
      <h1>LE Persona Quiz</h1>
      {stage === "quiz" && (
        <div>
          <p>Question {i + 1} of {totalQ}</p>
          <ProgressBar value={pct} />
          <p>Which one sounds more like you?</p>
          <PrimaryButton onClick={() => choose(current.a.persona)}>
            <Badge letter="A" /> {current.a.text}
          </Primary
