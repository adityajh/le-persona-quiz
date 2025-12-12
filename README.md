# LE Persona Quiz

A lightweight, data-driven persona assessment web app built with React + Vite, designed for behavioural persona discovery.  
Quiz content is configuration-driven, scored via a central engine, and final results can be submitted to a backend endpoint.

This project is part of the Let’s Enterprise (LE) assessment ecosystem.

---

## Repository Structure

le-persona-quiz/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── data/
│       └── quiz.json        # Personas, questions, options, weights
├── api/
│   └── submit.js            # Backend endpoint for submitting results
└── src/
    ├── main.jsx             # React entry point
    ├── App.jsx              # Quiz flow and UI state
    ├── engine.js            # Scoring and persona resolution logic
    ├── schemas.js           # Data shape definitions / helpers
    └── lib/
        └── loadData.js      # Runtime loader for quiz.json

---

## What the App Does

1. Loads quiz configuration from public/data/quiz.json
2. Renders questions dynamically
3. Tracks user responses
4. Computes persona scores using a central scoring engine
5. Determines the dominant persona
6. Optionally submits results to /api/submit
7. Displays the persona reveal screen

---

## Quiz Configuration (Important)

All quiz content lives in:

public/data/quiz.json

This file contains:
- Persona definitions
- Persona reveal text
- Questions
- Options per question
- Weight mappings per option

Key rule:
To change personas, questions, or reveal copy, only edit quiz.json.  
No React code changes are required.

---

## Scoring Logic

All scoring logic is centralized in:

src/engine.js

Responsibilities:
- Accept user responses
- Apply option weights from quiz.json
- Aggregate scores per persona
- Resolve the final persona deterministically

No answer is treated as “good” or “bad” — all options represent different behavioural tendencies.

---

## Runtime Flow

1. main.jsx mounts the React app
2. App.jsx loads quiz data and manages quiz state
3. loadData.js fetches quiz.json
4. engine.js computes persona scores
5. /api/submit receives final results (optional)
6. Final persona is displayed to the user

---

## Backend Submission

Endpoint:
POST /api/submit

Purpose:
- Capture final persona
- Capture response data
- Log results externally (Google Sheets, database, etc.)

If deployed on Vercel, this functions as a serverless API route.

---

## Local Development

Install dependencies:
npm install

Run the dev server:
npm run dev

Vite will start a local server (typically at http://localhost:5173).

---

## Production Build

npm run build

The production-ready files are generated in the dist/ folder.

---

## Updating Content (Non-Developers)

Change personas:
Edit public/data/quiz.json

Change questions or options:
Edit public/data/quiz.json

Change scoring behaviour:
Edit src/engine.js

Avoid moving scoring logic into App.jsx.  
The current separation is intentional and should be preserved.

---

## Debugging Tips

Blank screen:
- Check browser console for errors
- Verify quiz.json is loading correctly (Network tab)

Unexpected persona results:
- Check weight mappings in quiz.json
- Review aggregation logic in engine.js

Results not saving:
- Inspect api/submit.js
- Confirm deployment routing and permissions

---

## Design Philosophy

- Behaviour over labels
- Data-driven, not opinion-driven
- Single source of truth for content
- Reflection and conversation tool, not a diagnostic test

---

## Author

Aditya Jhunjhunwala  
Founder – Let’s Enterprise  
https://www.letsenterprise.in

---

## License

Internal / Educational Use  
Not licensed for commercial redistribution
