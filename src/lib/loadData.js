// src/lib/loadData.js
import { QuizDataSchema } from "../schemas";

export async function loadQuizData() {
  // Works even if the app is deployed under a subpath
  const base = (import.meta?.env?.BASE_URL) || "/";
  const url = base.replace(/\/+$/, "") + "/data/quiz.json";
  console.log("[Quiz] Fetching JSON from:", url);

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load quiz.json (${res.status}) at ${url}`);

  const json = await res.json();
  return QuizDataSchema.parse(json); // throws readable errors if the shape is wrong
}
