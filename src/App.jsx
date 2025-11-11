import React, { useMemo, useState } from "react";

// --- Brand palette (Let's Enterprise)
const COLORS = {
  enterpriseBlue: "#3663AD",
  deepBlue: "#160E44",
  brightTeal: "#25BCBD",
  sand: "#F6F4EF",
  ink: "#0F1224",
};

// --- Persona metadata
const PERSONAS = {
  rocket: {
    label: "The Rocket",
    tag: "Ambition • Mastery • Momentum",
    color: COLORS.enterpriseBlue,
    story: `You move with hunger. You’ve always felt there is something bigger you’re meant to do, and you are willing to chase it.\n\nYou don’t fear effort — what you fear is potential left unused. You want to meet the version of you that is powerful, sharp, undeniably capable.\n\nYour path is not to slow down. Your path is to learn how to turn intensity into mastery.`,
  },
  voyager: {
    label: "The Voyager",
    tag: "Discovery • Identity • Confidence",
    color: COLORS.brightTeal,
    story: `You are someone who is becoming.\n\nYou grow through experiences that change you on the inside. You want to feel proud of yourself — not just for what you do, but for who you are becoming.\n\nSometimes the journey feels confusing or overwhelming. That’s okay. It means you are in motion. Your path is not to rush choosing. Your path is to walk, reflect, and rise into yourself.`,
  },
  specialist: {
    label: "The Specialist",
    tag: "Depth • Excellence • Focus (Early)",
    color: "#C28B37",
    story: `You care about excellence. You want to be among the few who are truly good at something — not just another person in the crowd.\n\nYour focus is strong. Your identity is sharp. But sometimes, this turns into comparison and pressure to stay ahead. You worry that exploring will make you fall behind.\n\nYour growth is not in narrowing more. Your growth is in exploring just enough to choose with truth, not fear.`,
  },
  brandwagon: {
    label: "The Brand‑Wagon",
    tag: "Vibe • Aesthetic • Social Proof",
    color: "#F2A900",
    story: `You have a strong sense of style, vibe, energy. You care how life feels. You care how life looks. You want to be seen — not invisible.\n\nBut sometimes, you chase what is popular instead of what is real. You fear missing out.\n\nYour growth is not in giving up beauty or expression. Your growth is in choosing what feels true, even when no one is watching.`,
  },
  conventional: {
    label: "The Conventional",
    tag: "Stability • Clarity • Structure",
    color: "#6B7280",
    story: `You care about safety, clarity, and doing things right. You want a path you can trust — one that doesn’t fall apart under you.\n\nWhen the way forward is unclear, anxiety rises — not because you are weak, but because you care about consequences.\n\nYour growth is not in being reckless. Your growth is in taking small, supported steps into the unknown.`,
  },
  performer: {
    label: "The Performer",
    tag: "Admiration • Presence • Image",
    color: "#E14949",
    story: `You shine. You know how to carry yourself. You know how to be noticed.\n\nYou speak confidence — but underneath, there is a quiet fear: “If I am not impressive, will I still matter?”\n\nYour excitement is real. Your charisma is real. The mask is what hurts you, not the ambition behind it. Your growth begins the moment you let yourself be seen not as perfect — but as human.`,
  },
};

type PersonaKey = keyof typeof PERSONAS;

type Question = {
  a: { text: string; persona: PersonaKey };
  b: { text: string; persona: PersonaKey };
};

// --- Forced‑choice items (25)
const QUESTIONS: Question[] = [
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
  { a: { text: "I choose things that help me grow long‑term.", persona: "rocket" }, b: { text: "I choose things that look exciting now.", persona: "brandwagon" } },
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

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ background: "#E5E7EB" }} className="w-full h-2 rounded-full">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${value}%`, background: COLORS.enterpriseBlue }}
      />
    </div>
  );
}

function App() {
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<Record<PersonaKey, number>>({
    rocket: 0,
    voyager: 0,
    specialist: 0,
    brandwagon: 0,
    conventional: 0,
    performer: 0,
  });
  const [done, setDone] = useState(false);

  const pct = Math.round(((i) / QUESTIONS.length) * 100);

  function choose(persona: PersonaKey) {
    setScores((s) => ({ ...s, [persona]: (s[persona] || 0) + 1 }));
    const next = i + 1;
    if (next >= QUESTIONS.length) {
      setDone(true);
    }
    setI(next);
  }

  function restart() {
    setI(0);
    setDone(false);
    setScores({ rocket: 0, voyager: 0, specialist: 0, brandwagon: 0, conventional: 0, performer: 0 });
  }

  const sorted = useMemo(() => {
    return (Object.keys(PERSONAS) as PersonaKey[])
      .map((k) => ({ key: k, score: scores[k] }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);

  const top = sorted[0]?.key as PersonaKey | undefined;
  const second = sorted[1]?.key as PersonaKey | undefined;

  return (
    <div className="min-h-screen" style={{ background: COLORS.sand, color: COLORS.ink }}>
      <div className="max-w-xl mx-auto px-5 pb-20 pt-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>LE Persona Quiz</h1>
          <p className="text-sm opacity-80">Rocket • Voyager • Specialist • Brand‑Wagon • Conventional • Performer</p>
        </header>

        {!done ? (
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-70">Question {i + 1} of {QUESTIONS.length}</span>
              <span className="text-sm font-medium" style={{ color: COLORS.enterpriseBlue }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} />

            {i < QUESTIONS.length && (
              <div className="mt-6">
                <p className="text-base font-medium mb-4" style={{ color: COLORS.deepBlue }}>
                  Which one sounds more like you?
                </p>
                <div className="grid gap-3">
                  <button
                    onClick={() => choose(QUESTIONS[i].a.persona)}
                    className="w-full text-left p-4 rounded-2xl border hover:shadow transition"
                    style={{ borderColor: COLORS.enterpriseBlue }}
                  >
                    <span className="block font-semibold mb-1" style={{ color: PERSONAS[QUESTIONS[i].a.persona].color }}>A • {PERSONAS[QUESTIONS[i].a.persona].label}</span>
                    <span className="opacity-90">{QUESTIONS[i].a.text}</span>
                  </button>
                  <button
                    onClick={() => choose(QUESTIONS[i].b.persona)}
                    className="w-full text-left p-4 rounded-2xl border hover:shadow transition"
                    style={{ borderColor: COLORS.brightTeal }}
                  >
                    <span className="block font-semibold mb-1" style={{ color: PERSONAS[QUESTIONS[i].b.persona].color }}>B • {PERSONAS[QUESTIONS[i].b.persona].label}</span>
                    <span className="opacity-90">{QUESTIONS[i].b.text}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6">
            {top && (
              <div className="mb-6">
                <div className="text-sm uppercase tracking-wide mb-2" style={{ color: COLORS.enterpriseBlue }}>Your Persona</div>
                <h2 className="text-3xl font-extrabold mb-2" style={{ color: PERSONAS[top].color }}>{PERSONAS[top].label}</h2>
                <div className="text-sm mb-3 opacity-80">{PERSONAS[top].tag}</div>
                <p className="whitespace-pre-line leading-relaxed">{PERSONAS[top].story}</p>
              </div>
            )}

            {second && (
              <div className="mb-6">
                <div className="text-sm uppercase tracking-wide mb-2" style={{ color: COLORS.deepBlue }}>Growth Direction</div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm" style={{ background: COLORS.sand, color: PERSONAS[second].color }}>
                  → {PERSONAS[second].label}
                </div>
              </div>
            )}

            <div className="grid gap-2 mt-6">
              <div className="text-sm opacity-70">Your profile (counts):</div>
              <div className="grid grid-cols-2 gap-2">
                {sorted.map(({ key, score }) => (
                  <div key={key} className="flex items-center justify-between rounded-xl px-3 py-2 border" style={{ borderColor: "#e5e7eb" }}>
                    <span className="text-sm" style={{ color: PERSONAS[key].color }}>{PERSONAS[key].label}</span>
                    <span className="text-sm font-semibold">{score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={restart} className="px-4 py-2 rounded-xl text-white" style={{ background: COLORS.enterpriseBlue }}>Restart</button>
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl" style={{ color: COLORS.deepBlue, background: "#EEF2FF" }}>Print / Save</button>
            </div>
          </div>
        )}

        <footer className="mt-8 text-xs opacity-60">
          <div>© Let’s Enterprise — Persona Quiz</div>
        </footer>
      </div>
    </div>
  );
}

export default App;
