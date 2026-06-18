import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { sendContactEmail } from "../_shared/email.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed" }, 405, origin);
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON" }, 400, origin);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) {
    return jsonResponse({ ok: false, message: "Nome obbligatorio" }, 400, origin);
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return jsonResponse({ ok: false, message: "Email non valida" }, 400, origin);
  }
  if (message.length < MIN_MESSAGE_LENGTH) {
    return jsonResponse({ ok: false, message: "Messaggio troppo breve" }, 400, origin);
  }

  try {
    await sendContactEmail(name, email, message);
  } catch (err) {
    console.error("Resend error:", err);
    return jsonResponse({ ok: false, message: "Errore nell'invio dell'email" }, 500, origin);
  }

  return jsonResponse({ ok: true }, 200, origin);
});
