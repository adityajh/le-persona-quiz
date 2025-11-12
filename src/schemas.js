// src/schemas.js
import { z } from "zod";

export const PersonaSchema = z.object({
  label: z.string(),
  tag: z.string(),
  color: z.string(),
  story: z.string()
});

export const PersonasSchema = z.record(PersonaSchema);

export const OptionSchema = z.object({
  text: z.string(),
  persona: z.enum(["rocket", "voyager", "specialist", "aspirant", "rooted", "performer"])
});

export const QuestionSchema = z.object({
  a: OptionSchema,
  b: OptionSchema
});

export const QuizDataSchema = z.object({
  personas: PersonasSchema,
  questions: z.array(QuestionSchema).min(1)
});
