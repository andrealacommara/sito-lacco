import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { jsonResponse } from "./clients.ts";
import {
  enforceRateLimit,
  peekRateLimit,
  type RateLimitRule,
} from "./rateLimit.ts";

// Verifica che la richiesta provenga dall'admin: Bearer token Supabase valido il
// cui utente ha l'email == ADMIN_EMAIL. Stesso schema usato dalle altre admin-*.
export async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const {
    data: { user },
    error,
  } = await supabaseAnon.auth.getUser(token);
  const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";

  if (error || !user || user.email !== adminEmail) return false;

  return true;
}

// Budget speso SOLO sui tentativi falliti: l'admin autenticato non paga mai una
// query in più, mentre chi sonda gli endpoint viene fermato dopo pochi tentativi.
const FAILED_AUTH_RULES: RateLimitRule[] = [
  { name: "admin-auth-fail", limit: 20, windowSeconds: 300, scope: "ip" },
];

/**
 * Chokepoint unico per le funzioni admin-*: restituisce una risposta pronta
 * (401 o 429) se la richiesta va respinta, `null` se può proseguire.
 *
 * Ogni verifica costa un round-trip di rete a GoTrue (`auth.getUser`). Senza
 * limite, chiunque può farci pagare quel round-trip a raffica pur non avendo
 * credenziali. Qui si respinge a costo zero chi è già noto come bloccato, e si
 * consuma budget solo quando l'autenticazione fallisce davvero.
 */
export async function requireAdmin(
  req: Request,
  origin?: string | null,
): Promise<Response | null> {
  const limited = peekRateLimit(req, FAILED_AUTH_RULES, origin);

  if (limited) return limited;

  if (await verifyAdmin(req)) return null;

  const blocked = await enforceRateLimit(req, FAILED_AUTH_RULES, origin);

  if (blocked) return blocked;

  return jsonResponse(
    { ok: false, message: "Non autorizzato", error: "Non autorizzato" },
    401,
    origin,
  );
}
