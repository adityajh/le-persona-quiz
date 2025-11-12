import React from "react";
import {
  COLORS, initScores, sortedScores, maxScore,
  validateEmail, loadState, saveState, clearState, useQuizHotkeys
} from "./engine";
import { loadQuizData } from "./lib/loadData";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

/* ---------- Small UI helpers (inlined) ---------- */
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

/* ---------- App ---------- */
export default function App() {
  // data (loaded from /data/quiz.json)
  const [data, setData] = React.useState(null); // { personas, questions }
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");

  // quiz state
  const [i, setI] = React.useState(0);
  const [scores, setScores] = React.useState(initScores());
  const [stage, setStage] = React.useState("quiz"); // "quiz" | "lead" | "result"
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [sendError, setSendError] = React.useState("");

  // load content + restore state (if any)
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

  // derive (ALWAYS compute before returns to keep hook order stable)
  const totalQ = data?.questions?.length || 0;
  const pct = totalQ ? Math.round((i / totalQ) * 100) : 0;

  const sorted = React.useMemo(
    () => sortedScores(scores),
    [scores]
  );
  const top = sorted[0]?.key;
  const second = sorted[1]?.key;

  // persist quiz state
  React.useEffect(() => {
    saveState({ i, scores, stage, name, email });
  }, [i, scores, stage, name, email]);

  // hotkeys — ALWAYS call hooks; gate with a boolean inside
  useQuizHotkeys(
    stage === "quiz" && !!data && totalQ > 0,
    () => choose(data.questions[i].a.persona),
    () => choose(data.questions[i].b.persona)
  );

  // early returns AFTER hooks
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: COLORS.sand }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
          Loading quiz…
        </div>
      </div>
    );
  }
  if (loadErr) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: COLORS.sand }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", color: "#B91C1C", maxWidth: 640 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Couldn’t load quiz content</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{String(loadErr)}</div>
        </div>
      </div>
    );
  }
  if (!data || totalQ === 0) {
    return <div style={{ padding: 20 }}>No quiz data found.</div>;
  }

  // actions
  function choose(personaKey) {
    setScores((s) => ({ ...s, [personaKey]: (s[personaKey] || 0) + 1 }));
    const next = i + 1;
    if (next >= totalQ) {
      setStage("lead"); // ask for name/email BEFORE reveal
    } else {
      setI(next);
    }
  }

  function back() {
    setI((x) => Math.max(0, x - 1));
  }

async function submitLeadAndShowResults() {
  setSendError("");
  if (!name.trim() || !validateEmail(email)) {
    setSendError("Please enter a valid name and email.");
    return;
  }

  // Show results immediately (don’t block UX)
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

    // Try normal POST first
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setSent(true);
      return;
    }

    // Fallback for Apps Script CORS (opaque response, but request is sent)
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSent(true);

  } catch (e) {
    setSendError("Could not send to sheet (network or permissions).");
  } finally {
    setSending(false);
  }
}


  function restart() {
    setI(0);
    setScores(initScores());
    setStage("quiz");
    setName(""); setEmail("");
    setSending(false); setSent(false); setSendError("");
    clearState();
  }

  const current = data.questions[i];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.sand, color: COLORS.ink, fontSize: 18 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.deepBlue, margin: 0 }}>LE Persona Quiz</h1>
          <p style={{ marginTop: 6, opacity: 0.75, fontSize: 14 }}>
            Rocket • Voyager • Specialist • Aspirant • Rooted • Performer
          </p>
        </header>

        {stage === "quiz" && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>Question {i + 1} of {totalQ}</span>
              <span style={{ fontSize: 14, color: COLORS.enterpriseBlue, fontWeight: 600 }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} />

            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.deepBlue, marginBottom: 14 }}>
                Which one sounds more like you?
              </p>

              <div role="radiogroup" aria-label="Choose the statement that sounds more like you" style={{ display: "grid", gap: 12 }}>
                <PrimaryButton role="radio" ariaChecked="false" onClick={() => choose(current.a.persona)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Badge letter="A" />
                    <span>{current.a.text}</span>
                  </span>
                </PrimaryButton>
                <PrimaryButton role="radio" ariaChecked="false" onClick={() => choose(current.b.persona)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Badge letter="B" />
                    <span>{current.b.text}</span>
                  </span>
                </PrimaryButton>
              </div>

              {i > 0 && (
                <button
                  onClick={back}
                  style={{ marginTop: 12, background: "#EEF2FF", color: COLORS.deepBlue, padding: "10px 14px", borderRadius: 10, border: 0, cursor: "pointer" }}
                  aria-label="Go back to previous question"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "lead" && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 22 }}>
            <h2 style={{ margin: 0, fontSize: 24, color: COLORS.deepBlue, fontWeight: 800, marginBottom: 8 }}>
              Almost there!
            </h2>
            <p style={{ marginTop: 2, opacity: 0.8 }}>Enter your details to see your result and get a copy.</p>

            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <Input label="Full Name" value={name} onChange={setName} placeholder="Your name" />
              <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
            </div>

            {sendError && <div style={{ color: "#B91C1C", marginTop: 10, fontSize: 14 }}>{sendError}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button
                onClick={submitLeadAndShowResults}
                style={{ background: COLORS.enterpriseBlue, color: "#fff", padding: "12px 16px", borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer" }}
              >
                Show my result
              </button>
              <button
                onClick={restart}
                style={{ background: "#EEF2FF", color: COLORS.deepBlue, padding: "12px 16px", borderRadius: 12, fontWeight: 600, border: 0, cursor: "pointer" }}
              >
                Restart
              </button>
              {sending && <span style={{ fontSize: 14, opacity: 0.7 }}>Sending to sheet…</span>}
              {sent && <span style={{ fontSize: 14, color: "#059669" }}>Saved!</span>}
            </div>
          </div>
        )}

        {stage === "result" && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 22 }}>
            {top && data.personas[top] && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: COLORS.enterpriseBlue, marginBottom: 6 }}>
                  Your Persona
                </div>
                <h2 style={{ fontSize: 32, margin: "0 0 6px", color: data.personas[top].color, fontWeight: 900 }}>
                  {data.personas[top].label}
                </h2>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>{data.personas[top].tag}</div>
                <p style={{ whiteSpace: "pre-line", lineHeight: 1.55 }}>{data.personas[top].story}</p>
              </div>
            )}

            {second && data.personas[second] && (
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: COLORS.deepBlue, marginBottom: 6 }}>
                  Growth Direction
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999,
                  padding: "6px 12px", background: COLORS.sand, color: data.personas[second].color, fontWeight: 700
                }}>
                  → {data.personas[second].label}
                </div>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>Your profile (counts):</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {sorted.map(({ key, score }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
                    <span style={{ color: data.personas[key]?.color || COLORS.deepBlue, fontSize: 14 }}>
                      {data.personas[key]?.label || key}
                    </span>
                    <span style={{ fontWeight: 700 }}>{score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button
                onClick={() => window.print()}
                style={{ background: "#EEF2FF", color: COLORS.deepBlue, padding: "12px 16px", borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer" }}
              >
                Print / Save
              </button>
              <button
                onClick={restart}
                style={{ background: COLORS.enterpriseBlue, color: "#fff", padding: "12px 16px", borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer" }}
              >
                Restart
              </button>
            </div>
          </div>
        )}

        <footer style={{ marginTop: 20, fontSize: 12, opacity: 0.6 }}>
          © Let’s Enterprise — Persona Quiz
        </footer>
      </div>
    </div>
  );
}
