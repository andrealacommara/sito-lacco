import { getSupabaseAdmin, jsonResponse } from "../_shared/clients.ts";

// Gestisce eventi Resend → aggiorna Supabase come unica fonte di verità.
// Verifica la firma HMAC-SHA256 del webhook.

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!secret) return false;
  const signature = req.headers.get("svix-signature") ?? "";
  const msgId = req.headers.get("svix-id") ?? "";
  const msgTimestamp = req.headers.get("svix-timestamp") ?? "";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signedContent = `${msgId}.${msgTimestamp}.${body}`;
  const expectedSig = signature.split(" ").find((s) => s.startsWith("v1,"))?.slice(3);
  if (!expectedSig) return false;

  const sigBytes = Uint8Array.from(atob(expectedSig), (c) => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(signedContent));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false }, 405);
  }

  const body = await req.text();
  const valid = await verifySignature(req, body);
  if (!valid) {
    return jsonResponse({ ok: false, error: "Invalid signature" }, 401);
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false }, 400);
  }

  const type = event.type as string;
  const data = event.data as Record<string, unknown>;
  const email = (data?.email_to as string[] | undefined)?.[0] ?? (data?.email as string);

  if (!email) return jsonResponse({ ok: true }, 200);

  const supabase = getSupabaseAdmin();

  if (type === "contact.unsubscribed") {
    await supabase.from("subscribers").update({ status: "unsubscribed" }).eq("email", email);
  } else if (type === "email.bounced") {
    await supabase.from("subscribers").update({ status: "bounced" }).eq("email", email);
  } else if (type === "email.complained") {
    // Complaint GDPR: status unsubscribed immediatamente
    await supabase.from("subscribers").update({ status: "unsubscribed" }).eq("email", email);
  }

  return jsonResponse({ ok: true }, 200);
});
