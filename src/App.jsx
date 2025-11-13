import React from "react";
import {
  COLORS, initScores, sortedScores, maxScore,
  validateEmail, loadState, saveState, clearState, useQuizHotkeys
} from "./engine";
import { loadQuizData } from "./lib/loadData";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

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

function PrimaryButton({ children, onClick, role = "button", ariaChecked }) {
  const bg = "#FFFFFF";
  const bc = COLORS.enterpriseBlue;
  const hover = "0 8px 24px rgba(0,0,0,0.08)";
  return (
    <button
      onClick={onClick}
      role={role}
      aria-checked={ariaChecked}
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
        cursor: "pointer"
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
        border: `1px solid ${COLORS.border}`
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
          fontSize: 16
        }}
      />
    </label>
  );
}

export default function App() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");

  const [i, setI] = React.useState(0);
  const [scores, setScores] = React.useState(initScores());
  const [stage, setStage] = React.useState("quiz");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false
