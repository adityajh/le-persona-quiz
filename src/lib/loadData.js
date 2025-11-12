// src/lib/loadData.js
import { QuizDataSchema } from "../schemas";

export async function loadQuizData() {
  const res = await fetch("/data/quiz.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load quiz.json (${res.status})`);
  const json = await res.json();
  const data = QuizDataSchema.parse(json); // throws with readable errors
  return data;
}
