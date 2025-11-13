/* ---------- Imports ---------- */
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
  ...
}

// Circular badge for answer labels (A/B)
function Badge({ letter }) {
  ...
}

// Styled input field with label
function Input({ label, value, onChange, placeholder, type = "text" }) {
  ...
}

/* ---------- Main App Component ---------- */
export default function App() {
  /* ----- State Setup ----- */
  const [data, setData] = React.useState(null); // quiz content: personas + questions
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");

  const [i, setI] = React.useState(0); // current question index
  const [scores, setScores] = React.useState(initScores()); // persona scores
  const [stage, setStage] = React.useState("quiz"); // "quiz" | "lead" | "result"
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [sendError, setSendError] = React.useState("");

  /* ----- Load quiz data + restore saved state ----- */
  React.useEffect(() => {
    (async () => {
      try {
        const d = await loadQuizData(); // fetch quiz.json
        setData(d);

        const restored = loadState(); // restore progress from localStorage
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

  /* ----- Derived values ----- */
  const totalQ = data?.questions?.length || 0;
  const pct = totalQ ? Math.round((i / totalQ) * 100) : 0;

  const sorted = React.useMemo(() => sortedScores(scores), [scores]);
  const top = sorted[0]?.key;
  const second = sorted[1]?.key;

  /* ----- Persist state on change ----- */
  React.useEffect(() => {
    saveState({ i, scores, stage, name, email });
  }, [i, scores, stage, name, email]);

  /* ----- Hotkeys for A/B selection ----- */
  useQuizHotkeys(
    stage === "quiz" && !!data && totalQ > 0,
    () => choose(data.questions[i].a.persona),
    () => choose(data.questions[i].b.persona)
  );

  /* ----- Early returns for loading/error states ----- */
  if (loading) return <LoadingScreen />;
  if (loadErr) return <ErrorScreen message={loadErr} />;
  if (!data || totalQ === 0) return <div style={{ padding: 20 }}>No quiz data found.</div>;

  /* ----- Quiz logic handlers ----- */

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

      // Send to proxy API
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

      // Fallback: send directly to Apps Script (no-cors)
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

  // Restart the quiz from scratch
  function restart() {
    setI(0);
    setScores(initScores());
    setStage("quiz");
    setName(""); setEmail("");
    setSending(false); setSent(false); setSendError("");
    clearState();
  }

  /* ----- Render UI based on stage ----- */
  const current = data.questions[i];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.sand, color: COLORS.ink, fontSize: 18 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <Header />
        {stage === "quiz" && <QuizScreen {...{ i, totalQ, pct, current, choose, back }} />}
        {stage === "lead" && <LeadForm {...{ name, email, setName, setEmail, submitLeadAndShowResults, restart, sending, sent, sendError }} />}
        {stage === "result" && <ResultScreen {...{ data, top, second, sorted, restart }} />}
        <Footer />
      </div>
    </div>
  );
}
