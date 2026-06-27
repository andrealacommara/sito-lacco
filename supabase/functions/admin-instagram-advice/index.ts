import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";

// Genera consigli IG con un LLM (Google Gemini 2.5 Flash, free tier). Riceve in
// POST il riassunto numerico calcolato dal frontend (buildAdvicePayload) e
// restituisce { ok, insights: [{ tone, text }] }, stessa shape dei consigli
// rule-based che sostituisce. La API key sta nei secrets Supabase, mai nel front.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Schema che obbliga Gemini a rispondere con l'array di consigli tipizzato.
const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      tone: { type: "STRING", enum: ["good", "warn", "tip"] },
      text: { type: "STRING" },
    },
    required: ["tone", "text"],
  },
};

const SYSTEM_PROMPT = `Sei un social media strategist esperto di Instagram per un artista musicale italiano (progetto "laccoverse").
Ricevi un riassunto in JSON delle metriche recenti dell'account.
Genera da 4 a 6 consigli azionabili, concreti e specifici per far crescere reach ed engagement, basati ESCLUSIVAMENTE sui dati forniti.
Regole:
- Scrivi in italiano, tono diretto e amichevole, dando del tu.
- Ogni consiglio è una frase singola e concisa (max ~160 caratteri), senza emoji.
- Correla più metriche quando ha senso (es. tipo di contenuto + orario migliore).
- Cita numeri reali presi dai dati quando rafforzano il consiglio.
- "tone": usa "good" per ciò che va bene da consolidare, "warn" per problemi da correggere, "tip" per suggerimenti operativi.
- Non inventare dati non presenti. Se un dato manca (null), ignoralo.`;

type Insight = { tone: "good" | "warn" | "tip"; text: string };

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Metodo non valido" }, 405, origin);
  }
  if (!(await verifyAdmin(req))) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");

  if (!apiKey) {
    return jsonResponse(
      { ok: false, error: "GEMINI_API_KEY non configurata" },
      500,
      origin,
    );
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "Body non valido" }, 400, origin);
  }

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Metriche dell'account:\n${JSON.stringify(payload)}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();

      return jsonResponse(
        { ok: false, error: `Gemini ${res.status}: ${detail.slice(0, 300)}` },
        502,
        origin,
      );
    }

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return jsonResponse(
        { ok: false, error: "Risposta Gemini vuota" },
        502,
        origin,
      );
    }

    const parsed = JSON.parse(text) as unknown;
    const insights: Insight[] = Array.isArray(parsed)
      ? parsed
          .filter(
            (i): i is Insight =>
              i != null &&
              typeof i === "object" &&
              typeof (i as Insight).text === "string" &&
              ["good", "warn", "tip"].includes((i as Insight).tone),
          )
          .map((i) => ({ tone: i.tone, text: i.text.trim() }))
      : [];

    if (insights.length === 0) {
      return jsonResponse(
        { ok: false, error: "Nessun consiglio generato" },
        502,
        origin,
      );
    }

    return jsonResponse({ ok: true, insights }, 200, origin);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, origin);
  }
});
