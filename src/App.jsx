import React, { useMemo, useState, useEffect } from "react";

/** ========== BRAND ========= */
const COLORS = {
  enterpriseBlue: "#3663AD",
  deepBlue: "#160E44",
  brightTeal: "#25BCBD",
  sand: "#F6F4EF",
  ink: "#0F1224",
  border: "#E5E7EB",
};

// ⚠️ Put your Apps Script Web App URL here (step 2 below)
const GOOGLE_SCRIPT_URL = "https://SCRIPT_URL_HERE";

/** ========== PERSONAS ========= */
const PERSONAS = {
  rocket: {
    label: "The Rocket",
    tag: "Ambition • Mastery • Momentum",
    color: COLORS.enterpriseBlue,
    story: `You move with hunger. You’ve always felt there is something bigger you’re meant to do, and you are willing to chase it.

You don’t fear effort — what you fear is potential left unused. You want to meet the version of you that is powerful, sharp, undeniably capable.

Your path is not to slow down. Your path is to learn how to turn intensity into mastery.`,
  },
  voyager: {
    label: "The Voyager",
    tag: "Discovery • Identity • Confidence",
    color: COLORS.brightTeal,
    story: `You are someone who is becoming.

You grow through experiences that change you on the inside. You want to feel proud of yourself — not just for what you do, but for who you are becoming.

Sometimes the journey feels confusing or overwhelming. That’s okay. It means you are in motion. Your path is not to rush choosing. Your path is to walk, reflect, and rise into yourself.`,
  },
  specialist: {
    label: "The Specialist",
    tag: "Depth • Excellence • Focus (Early)",
    color: "#C28B37",
    story: `You care about excellence. You want to be among the few who are truly good at something — not just another person in the crowd.

Your focus is strong. Your identity is sharp. But sometimes, this turns into comparison and pressure to stay ahead. You worry that exploring will make you fall behind.

Your growth is not in narrowing more. Your growth is in exploring just enough to choose with truth, not fear.`,
  },
  brandwagon: {
    label: "The Brand-Wagon",
    tag: "Vibe • Aesthetic • Social Proof",
    color: "#F2A900",
    story: `You have a strong sense of style, vibe, energy. You care how life feels. You care how life looks. You want to be seen — not invisible.

But sometimes, you chase what is popular instead of what is real. You fear missing out.

Your growth is not in giving up beauty or expression. Your growth is in choosing what feels true, even when no one is watching.`,
  },
  conventional: {
    label: "The Conventional",
    tag: "Stability • Clarity • Structure",
    color: "#6B7280",
    story: `You care about safety, clarity, and doing things right. You want a path you can trust — one that doesn’t fall apart under you.

When the way forward is unclear, anxiety rises — not because you are weak, but because you care about consequences.

Your growth is not in being reckless. Your growth is in taking small, supported steps into the unknown.`,
  },
  performer: {
    label: "The Performer",
    tag: "Admiration • Presence • Image",
    color: "#E14949",
    story: `You shine. You know how to carry yourself. You know how to be noticed.

You speak confidence — but underneath, there is a quiet fear: “If I am not impressive, will I still matter?”

Your excitement is real. Your charisma is real.
The mask is what hurts you, not the ambition behind it. Your growth begins the moment you let yourself be seen not as perfect — but as human.`,
  },
};

/** ========== QUESTIONS (no persona names shown to user) ========= */
const QUESTIONS = [
  { a: { text: "I want to achieve big things.", persona: "rocket" }, b: { text: "I want to understand myself better.", persona: "voyager" } },
  { a: { text: "I like to try many things before choosing.", persona: "voyager" }, b: { text: "I want to stick to one field I decided.", persona: "specialist" } },
  { a: { text: "I feel happy when I improve and get better.", persona: "rocket" }, b: { text: "I feel happy when I look confident and impressive.", persona: "performer" } },
  { a: { text: "I enjoy doing things that help me grow inside.", persona: "voyager" }, b: { text: "I enjoy things that look fun or cool.", persona: "brandwagon" } },
  { a: { text: "I like clear plans and steps.", persona: "conventional" }, b: { text: "I like freedom to figure things out.", persona: "voyager" } },
  { a: { text: "I keep trying even when it’s hard.", persona: "rocket" }, b: { text: "I lose interest if it stops being exciting.", persona: "brandwagon" } },
  { a: { text: "I don’t mind starting from scratch.", persona: "rocket" }, b: { text: "I want someone to explain clearly first.", persona: "conventional" } },
  { a: { text: "I want respect for my skills.", persona: "rocket" }, b: { text: "I want to be admired for my vibe and style.", persona: "performer" } },
  { a: { text: "I want to explore more before choosing.", persona: "voyager" }, b: { text: "I want to specialise now and go deep.", persona: "specialist" } },
  { a: { text: "I like talking about ideas and learning.", persona: "voyager" }, b: { text: "I like talking about goals and success.", persona: "rocket" } },
  { a: { text: "I feel stressed with no clear direction.", persona: "conventional" }, b: { text: "I’m okay figuring it out while moving.", persona: "rocket" } },
  { a: { text: "I choose things that help me grow long-term.", persona: "rocket" }, b: { text: "I choose things that look exciting now.", persona: "brandwagon" } },
  { a: { text: "I’m okay starting at zero and learning slowly.", persona: "voyager" }, b: { text: "I feel uncomfortable if I’m not already good.", persona: "performer" } },
  { a: { text: "I like people who challenge me to grow.", persona: "voyager" }, b: { text: "I like people who hype me up.", persona: "brandwagon" } },
  { a: { text: "I want life to feel big.", persona: "rocket" }, b: { text: "I want life to feel real and meaningful.", persona: "voyager" } },
  { a: { text: "I like reflecting on why I do things.", persona: "voyager" }, b: { text: "I usually just move on without reflecting.", persona: "performer" } },
  { a: { text: "I don’t mind messy learning.", persona: "voyager" }, b: { text: "I prefer when things are simple and clear.", persona: "conventional" } },
  { a: { text: "I want to earn respect through my work.", persona: "rocket" }, b: { text: "I want attention and to be noticed.", persona: "performer" } },
  { a: { text: "I like slow, meaningful personal growth.", persona: "voyager" }, b: { text: "I like quick wins and visible results.", persona: "brandwagon" } },
  { a: { text: "Few things define my identity yet.", persona: "voyager" }, b: { text: "I’ve already decided who I am.", persona: "specialist" } },
  { a: { text: "I take initiative when something needs doing.", persona: "rocket" }, b: { text: "I wait for clear instructions.", persona: "conventional" } },
  { a: { text: "I enjoy doing things even if nobody sees.", persona: "voyager" }, b: { text: "I enjoy it more when people notice.", persona: "performer" } },
  { a: { text: "I feel proud when I complete something difficult.", persona: "rocket" }, b: { text: "I feel proud when I look confident doing it.", persona: "performer" } },
  { a: { text: "I like exploring different interests to discover myself.", persona: "voyager" }, b: { text: "I like sticking to the identity I present.", persona: "specialist" } },
  { a: { text: "I want to grow in real life, not just in my image.", persona: "voyager" }, b: { text: "I want to be seen as impressive.", persona: "performer" } },
];

/** ========== SMALL UI HELPERS ========= */
function ProgressBar({ value }) {
  return (
    <div style={{ background: "#E5E7EB", height: 8, borderRadius: 999, width: "100%" }}>
      <div
        style={{
          width: `${value}%`,
          height: 8,
          borderRadius: 999,
          background: COLORS.enterpriseBlue,
          transition: "width 200ms ease",
        }}
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, variant = "a" }) {
  const bg = variant === "a" ? "#FFFFFF" : "#FFFFFF";
  const bc = variant === "a" ? COLORS.enterpriseBlue : COLORS.brightTeal;
  const hover = "0 8px 24px rgba(0,0,0,0.08)";
  return (
    <button
      onClick={onClick}
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
        cursor: "pointer",
      }}
      onMouseOver={(e) => (e.currentTarget.style.boxShadow = hover)}
      onMouseOut={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}
    >
      {children}
    </button>
  );
}

/** ========== APP ========= */
export default function App() {
  const [i, setI] = useState(0);
  const [scores, setScores] = useState({
    rocket: 0, voyager: 0, specialist: 0, brandwagon: 0, conventional: 0, performer: 0,
  });
  const [stage, setStage] = useState("quiz"); // "quiz" | "lead" | "result"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const pct = Math.round((i / QUESTIONS.length) * 100);

  // Leaderboard (top & second)
  const sorted = useMemo(() => {
    return Object.keys(PERSONAS)
      .map((k) => ({ key: k, score: scores[k] }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);
  const top = sorted[0]?.key;
  const second = sorted[1]?.key;

  function choose(personaKey) {
    setScores((s) => ({ ...s, [personaKey]: (s[personaKey] || 0) + 1 }));
    const next = i + 1;
    if (next >= QUESTIONS.length) {
      setStage("lead"); // ask for name/email BEFORE reveal
    } else {
      setI(next);
    }
  }

  async function submitLeadAndShowResults() {
    setSendError("");
    if (!name.trim() || !email.trim()) {
      setSendError("Please enter your name and email.");
      return;
    }
    // Show results immediately; send in background
    setStage("result");

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("SCRIPT_URL_HERE")) return;

    try {
      setSending(true);
      const payload = {
        timestamp: new Date().toISOString(),
        name,
        email,
        scores,
        top,
        second,
      };
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script often needs this; response can't be read but request is sent
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    setScores({ rocket: 0, voyager: 0, specialist: 0, brandwagon: 0, conventional: 0, performer: 0 });
    setStage("quiz");
    setName(""); setEmail("");
    setSending(false); setSent(false); setSendError("");
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.sand, color: COLORS.ink, fontSize: 18 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.deepBlue, margin: 0 }}>LE Persona Quiz</h1>
          <p style={{ marginTop: 6, opacity: 0.75, fontSize: 14 }}>
            Rocket • Voyager • Specialist • Brand-Wagon • Conventional • Performer
          </p>
        </header>

        {stage === "quiz" && (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>Question {i + 1} of {QUESTIONS.length}</span>
              <span style={{ fontSize: 14, color: COLORS.enterpriseBlue, fontWeight: 600 }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} />

            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.deepBlue, marginBottom: 14 }}>
                Which one sounds more like you?
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                <PrimaryButton variant="a" onClick={() => choose(QUESTIONS[i].a.persona)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Badge letter="A" />
                    <span>{QUESTIONS[i].a.text}</span>
                  </span>
                </PrimaryButton>

                <PrimaryButton variant="b" onClick={() => choose(QUESTIONS[i].b.persona)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Badge letter="B" />
                    <span>{QUESTIONS[i].b.text}</span>
                  </span>
                </PrimaryButton>
              </div>
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
                style={{
                  background: COLORS.enterpriseBlue, color: "#fff", padding: "12px 16px",
                  borderRadius: 12, fontWeight: 700, border: 0, cursor: "pointer"
                }}
              >
                Show my result
              </button>
              <button
                onClick={restart}
                style={{
                  background: "#EEF2FF", color: COLORS.deepBlue, padding: "12px 16px",
                  borderRadius: 12, fontWeight: 600, border: 0, cursor: "pointer"
                }}
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
            {top && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: COLORS.enterpriseBlue, marginBottom: 6 }}>
                  Your Persona
                </div>
                <h2 style={{ fontSize: 32, margin: "0 0 6px", color: PERSONAS[top].color, fontWeight: 900 }}>
                  {PERSONAS[top].label}
                </h2>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>{PERSONAS[top].tag}</div>
                <p style={{ whiteSpace: "pre-line", lineHeight: 1.55 }}>{PERSONAS[top].story}</p>
              </div>
            )}

            {second && (
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: COLORS.deepBlue, marginBottom: 6 }}>
                  Growth Direction
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999,
                  padding: "6px 12px", background: COLORS.sand, color: PERSONAS[second].color, fontWeight: 700
                }}>
                  → {PERSONAS[second].label}
                </div>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>Your profile (counts):</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {sorted.map(({ key, score }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
                    <span style={{ color: PERSONAS[key].color, fontSize: 14 }}>{PERSONAS[key].label}</span>
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

/** ======= Small components ======= */
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
        border: `1px solid ${COLORS.border}`,
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
          fontSize: 16,
        }}
      />
    </label>
  );
}
