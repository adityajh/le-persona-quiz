export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const scriptUrl = process.env.VITE_GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      return res.status(500).json({ ok: false, error: "Missing VITE_GOOGLE_SCRIPT_URL" });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(response.ok ? 200 : 500).json({ ok: response.ok, data });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
