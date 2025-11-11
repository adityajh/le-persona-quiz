import React, { useMemo, useState } from "react";

/** ========== BRAND ========= */
const COLORS = {
  enterpriseBlue: "#3663AD",
  deepBlue: "#160E44",
  brightTeal: "#25BCBD",
  sand: "#F6F4EF",
  ink: "#0F1224",
  border: "#E5E7EB",
};

// ⚠️ Put your Apps Script Web App URL here after you deploy the script (or leave as-is to skip sending)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwU7gBtfgcf7y5MKUV2_ysl0_TIcDv2jVegjIKa6scvOnhiNIfVIp8xTICfxIPAyPxyWA/exec";

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

  // ✅ Renamed: Brand-Wagon → The Aspirant (more driven tone)
  aspirant: {
    label: "The Aspirant",
    tag: "Drive • Prestige • Standards",
    color: "#D99100",
    story: `You set high standards and you want to earn your place among the best.

You believe the right challenge, environment, and reputation will unlock your next level — not for show, but for the discipline and network it forces you to build.

Your path is to chase recognition without being owned by it: choose standards that come from within, then prove them in the real world.`,
  },

  // ✅ Renamed: Conventional → The Rooted
  rooted: {
    label: "The Rooted",
    tag: "Family • Stability • Respect",
    color: "#6B7280",
    story: `You value stability, dignity, and choosing a path that family and society understand.

You are careful not because you lack courage, but because you understand consequences. You want to build a life that feels reliable, respected, and grounded.

Your path is not to break from your roots — it’s to grow in a direction that is true to you while honoring where you come from.`,
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

const QUESTIONS = [
  // 1
  { a: { text: "I enjoy taking on challenges with clear momentum.", persona: "rocket" },
    b: { text: "I enjoy exploring different directions before deciding.", persona: "voyager" } },

  // 2
  { a: { text: "I like focusing on one area for a long time.", persona: "specialist" },
    b: { text: "I like sampling multiple interests for a while.", persona: "voyager" } },

  // 3
  { a: { text: "I like being part of well-regarded programs or teams.", persona: "aspirant" },
    b: { text: "I like pushing myself through stretch tasks.", persona: "rocket" } },

  // 4
  { a: { text: "I feel comfortable with familiar, well-understood paths.", persona: "rooted" },
    b: { text: "I feel comfortable with open-ended paths.", persona: "voyager" } },

  // 5
  { a: { text: "I enjoy presenting my work to an audience.", persona: "performer" },
    b: { text: "I enjoy improving the craft quietly.", persona: "specialist" } },

  // 6
  { a: { text: "I prefer goals that are recognized by others (exams, ranks, badges).", persona: "aspirant" },
    b: { text: "I prefer goals that deepen one specific skill.", persona: "specialist" } },

  // 7
  { a: { text: "I like detailed plans and clear steps.", persona: "rooted" },
    b: { text: "I like moving first and refining the plan while working.", persona: "rocket" } },

  // 8
  { a: { text: "I’m energized when my effort is visible.", persona: "performer" },
    b: { text: "I’m energized by measurable progress toward recognized goals.", persona: "aspirant" } },

  // 9
  { a: { text: "I prefer mastering one tool thoroughly.", persona: "specialist" },
    b: { text: "I prefer trying several tools to compare.", persona: "voyager" } },

  // 10
  { a: { text: "I feel motivated by competitive environments.", persona: "aspirant" },
    b: { text: "I feel motivated by steady, predictable routines.", persona: "rooted" } },

  // 11
  { a: { text: "I tend to take initiative without being asked.", persona: "rocket" },
    b: { text: "I tend to step in when the moment needs a confident voice.", persona: "performer" } },

  // 12
  { a: { text: "I like unstructured time to figure things out.", persona: "voyager" },
    b: { text: "I like structured time with clear expectations.", persona: "rooted" } },

  // 13
  { a: { text: "I prefer depth even if progress is less visible.", persona: "specialist" },
    b: { text: "I prefer milestones that are easy to track and recognize.", persona: "aspirant" } },

  // 14
  { a: { text: "I enjoy fast checkpoints to track progress.", persona: "aspirant" },
    b: { text: "I enjoy slow thinking to connect ideas.", persona: "voyager" } },

  // 15
  { a: { text: "I enjoy collaborating in settings where people interact live.", persona: "performer" },
    b: { text: "I enjoy solo work that lets me concentrate.", persona: "specialist" } },

  // 16
  { a: { text: "I often consult family or mentors before a big choice.", persona: "rooted" },
    b: { text: "I often decide quickly and learn from the outcome.", persona: "rocket" } },

  // 17
  { a: { text: "I choose opportunities known for high standards.", persona: "aspirant" },
    b: { text: "I choose opportunities known for range and discovery.", persona: "voyager" } },

  // 18
  { a: { text: "I’m comfortable introducing myself to new groups.", persona: "performer" },
    b: { text: "I’m comfortable settling in and building gradually.", persona: "rooted" } },

  // 19
  { a: { text: "I like working with clear methods I repeat and refine.", persona: "specialist" },
    b: { text: "I like testing myself with new, tougher tasks.", persona: "rocket" } },

  // 20
  { a: { text: "I like journaling or debriefing after experiences.", persona: "voyager" },
    b: { text: "I like sharing takeaways in front of others.", persona: "performer" } },

  // 21
  { a: { text: "I feel driven when there’s a rank, stage, or selection to aim for.", persona: "aspirant" },
    b: { text: "I feel steady when there’s a routine I can trust.", persona: "rooted" } },

  // 22
  { a: { text: "I’m comfortable saying no to side tracks to protect focus.", persona: "specialist" },
    b: { text: "I’m comfortable saying yes to side tracks to learn.", persona: "voyager" } },

  // 23
  { a: { text: "I prefer roles where I can represent the team publicly.", persona: "performer" },
    b: { text: "I prefer roles with clear titles or credentials.", persona: "aspirant" } },

  // 24
  { a: { text: "I like polishing how something is delivered.", persona: "performer" },
    b: { text: "I like making sure the basics are covered.", persona: "rooted" } },

  // 25
  { a: { text: "I feel satisfied when effort turns into visible progress.", persona: "rocket" },
    b: { text: "I feel satisfied when technique becomes cleaner.", persona: "specialist" } },
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
  const bg = "#FFFFFF";
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

/** ========== APP ========= */
export default function App() {
  const [i, setI] = useState(0);
  const [scores, setScores] = useState({
    rocket: 0, voyager: 0, specialist: 0, aspirant: 0, rooted: 0, performer: 0,
  });
  const [stage, setStage] = useState("quiz"); // "quiz" | "lead" | "result"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const pct = Math.round((i / QUESTIONS.length) * 100);

  const sorted = useMemo(
    () =>
      Object.keys(PERSONAS)
        .map((k) => ({ key: k, score: scores[k] }))
        .sort((a, b) => b.score - a.score),
    [scores]
  );

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
    setScores({ rocket: 0, voyager: 0, specialist: 0, aspirant: 0, rooted: 0, performer: 0 });
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
            Rocket • Voyager • Specialist • Aspirant • Rooted • Performer
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
