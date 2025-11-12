import React from "react";
import {
  COLORS, initScores, sortedScores, maxScore,
  validateEmail, loadState, saveState, clearState, useQuizHotkeys
} from "./engine";
import { loadQuizData } from "./lib/loadData";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

function ProgressBar({ value }) { /* same as before */ }
function PrimaryButton({ children, onClick, role = "button", ariaChecked }) { /* same as before */ }
function Badge({ letter }) { /* same as before */ }
function Input({ label, value, onChange, placeholder, type = "text" }) { /* same as before */ }

export default function App() {
  // data
  const [data, setData] = React.useState(null);            // { personas, questions }
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

  // load content
  React.useEffect(() => {
    (async () => {
      try {
        const d = await loadQuizData();
        setData(d);
        setLoading(false);
      } catch (e) {
        setLoadErr(e.message || "Could not load quiz content.");
        setLoading(false);
      }
    })();
  }, []);

  // restore quiz state
  React.useEffect(() => {
    const saved = loadState();
    if (saved) {
      setI(saved.i ?? 0);
      setScores(saved.scores ?? initScores());
      setStage(saved.stage ?? "quiz");
      setName(saved.name ?? "");
      setEmail(saved.email ?? "");
    }
  }, []);

  // persist quiz state
  React.useEffect(() => {
    saveState({ i, scores, stage, name, email });
  }, [i, scores, stage, name, email]);

  // hotkeys
  useQuizHotkeys(
    stage === "quiz" && !!data,
    () => choose(data.questions[i].a.persona),
    () => choose(data.questions[i].b.persona)
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display:"grid", placeItems:"center", background: COLORS.sand }}>
        <div style={{ background:"#fff", padding:20, borderRadius:12, boxShadow:"0 6px 20px rgba(0,0,0,0.08)" }}>
          Loading quiz…
        </div>
      </div>
    );
  }
  if (loadErr) {
    return (
      <div style={{ minHeight: "100vh", display:"grid", placeItems:"center", background: COLORS.sand }}>
        <div style={{ background:"#fff", padding:20, borderRadius:12, boxShadow:"0 6px 20px rgba(0,0,0,0.08)", color:"#B91C1C" }}>
          {loadErr}
        </div>
      </div>
    );
  }

  const QUESTIONS = data.questions;
  const PERSONAS = data.personas;

  const pct = Math.round((i / QUESTIONS.length) * 100);
  const sorted = React.useMemo(() => sortedScores(scores), [scores]);
  const top = sorted[0]?.key;
  const second = sorted[1]?.key;
  const max = maxScore(scores);

  function choose(personaKey) {
    setScores((s) => ({ ...s, [personaKey]: (s[personaKey] || 0) + 1 }));
    const next = i + 1;
    if (next >= QUESTIONS.length) setStage("lead");
    else setI(next);
  }

  function back() {
    if (i <= 0) return;
    setI(i - 1); // (simple back; does not decrement scores)
  }

  async function submitLeadAndShowResults() {
    setSendError("");
    if (!name.trim() || !validateEmail(email)) {
      setSendError("Please enter a valid name and email.");
      return;
    }
    setStage("result");

    if (!GOOGLE_SCRIPT_URL) return;

    try {
      setSending(true);
      const payload = {
        timestamp: new Date().toISOString(),
        name, email, scores, top, second
      };
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) setSent(true); else setSendError("Could not save to sheet (non-200).");
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

  /* --- UI below is 99% same as earlier; only swapped to data.* --- */
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
              <span style={{ fontSize: 14, opacity: 0.7 }}>Question {i + 1} of {QUESTIONS.length}</span>
              <span aria-live="polite" style={{ fontSize: 14, color: COLORS.enterpriseBlue, fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ background: "#E5E7EB", height: 8, borderRadius: 999, width: "100%" }}>
              <div style={{ width: `${pct}%`, height: 8, borderRadius: 999, background: COLORS.enterpriseBlue, transition: "width 200ms ease" }} />
            </div>

            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.deepBlue, marginBottom: 14 }}>
                Which one sounds more like you?
              </p>

              <div role="radiogroup" aria-label="Choose the statement that sounds more like you" style={{ display: "grid", gap: 12 }}>
                <PrimaryButton role="radio" ariaChecked="false" onClick={() => choose(QUESTIONS[i].a.persona)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Badge letter="A" />
                    <span>{QUESTIONS[i].a.text}</span>
                  </span>
                </PrimaryButton>
                <PrimaryButton role="radio" ariaChecked="false" onClick={() => choose(QUESTIONS[i].b.persona)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Badge letter="B" />
                    <span>{QUESTIONS[i].b.text}</span>
                  </span>
                </PrimaryButton>
              </div>

              {i > 0 && (
                <button onClick={back} style={{ marginTop: 12, background: "#F3F4F6", border: 0, padding: "8px 12px", borderRadius: 10, cursor: "pointer" }} aria-label="Go back to previous question">
                  ← Back
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "lead" && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 22 }}>
            <h2 style={{ margin: 0, fontSize: 24, color: COLORS.deepBlue, fontWeight: 800, marginBottom: 8 }}>Almost there!</h2>
            <p style={{ marginTop: 2, opacity: 0.8 }}>Enter your details to see your result and get a copy.</p>

            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <Input label="Full Name" value={name} onChange={setName} placeholder="Your name" />
              <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
            </div>
            <p style={{fontSize:12, opacity:.6, marginTop:6}}>
              By continuing, you agree to receive your result and occasional updates from Let’s Enterprise. You can unsubscribe anytime.
            </p>

            {sendError && <div style={{ color: "#B91C1C", marginTop: 10, fontSize: 14 }}>{sendError}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={submitLeadAndShowResults} style={{ background: COLORS.enterpriseBlue, color: "#fff", padding: "12px 16px", borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer" }}>
                Show my result
              </button>
              <button onClick={restart} style={{ background: "#EEF2FF", color: COLORS.deepBlue, padding: "12px 16px", borderRadius: 12, fontWeight: 600, border: 0, cursor: "pointer" }}>
                Restart
              </button>
              {sending && <span style={{ fontSize: 14, opacity: 0.7 }}>Sending to sheet…</span>}
              {sent && <span style={{ fontSize: 14, color: "#059669" }}>Saved!</span>}
            </div>
          </div>
        )}

        {stage === "result" && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 22 }}>
            {top && PERSONAS[top] && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: COLORS.enterpriseBlue, marginBottom: 6 }}>Your Persona</div>
                <h2 style={{ fontSize: 32, margin: "0 0 6px", color: PERSONAS[top].color, fontWeight: 900 }}>{PERSONAS[top].label}</h2>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>{PERSONAS[top].tag}</div>
                <p style={{ whiteSpace: "pre-line", lineHeight: 1.55 }}>{PERSONAS[top].story}</p>
              </div>
            )}

            {second && PERSONAS[second] && (
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: COLORS.deepBlue, marginBottom: 6 }}>Growth Direction</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "6px 12px", background: COLORS.sand, color: PERSONAS[second].color, fontWeight: 700 }}>
                  → {PERSONAS[second].label}
                </div>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>Your profile (counts & % of top):</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {sorted.map(({ key, score }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", border: `1px solid #E5E7EB`, borderRadius: 12 }}>
                    <span style={{ color: PERSONAS[key].color, fontSize: 14 }}>{PERSONAS[key].label}</span>
                    <span style={{ fontWeight: 700 }}>{score} ({Math.round(100 * (score / max))}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button onClick={() => window.print()} style={{ background: "#EEF2FF", color: COLORS.deepBlue, padding: "12px 16px", borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer" }}>
                Print / Save
              </button>
              <button onClick={restart} style={{ background: COLORS.enterpriseBlue, color: "#fff", padding: "12px 16px", borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer" }}>
                Restart
              </button>
            </div>
          </div>
        )}

        <footer style={{ marginTop: 20, fontSize: 12, opacity: 0.6 }}>© Let’s Enterprise — Persona Quiz</footer>
      </div>
    </div>
  );
}
