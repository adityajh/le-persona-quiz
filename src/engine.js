// src/engine.js
import React from "react";

export const COLORS = {
  enterpriseBlue: "#3663AD",
  deepBlue: "#160E44",
  brightTeal: "#25BCBD",
  sand: "#F6F4EF",
  ink: "#0F1224",
  border: "#E5E7EB"
};

export const STORAGE_KEY = "le-quiz-v2";

export function initScores() {
  return { rocket: 0, voyager: 0, specialist: 0, aspirant: 0, rooted: 0, performer: 0 };
}

export function sortedScores(scores) {
  return Object.keys(scores)
    .map((k) => ({ key: k, score: scores[k] }))
    .sort((a, b) => b.score - a.score);
}

export function maxScore(scores) {
  return Math.max(1, ...Object.values(scores));
}

export function validateEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.i === "number" && data.scores) return data;
  } catch {}
  return null;
}

export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function useQuizHotkeys(enabled, chooseA, chooseB) {
  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      if (e.key === "1") chooseA();
      if (e.key === "2") chooseB();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, chooseA, chooseB]);
}
