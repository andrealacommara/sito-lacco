import { jsonResponse } from "./clients.ts";
import { getSql } from "./db.ts";
import { getRateLimitKey } from "./validation.ts";

// Rate limiting condiviso per le Edge Function.
//
// Il contatore sta in Postgres (`public.check_rate_limit`) perché gli isolati
// Deno sono effimeri e paralleli: un contatore in memoria non vedrebbe il
// traffico degli altri isolati. La memoria serve solo come cache dei verdetti
// di blocco — vedi `blockedUntil` sotto.

export interface RateLimitRule {
  /** Identifica il budget. Compare nella chiave: `<name>:<scope>`. */
  name: string;
  /** Richieste consentite nella finestra. */
  limit: number;
  windowSeconds: number;
  /**
   * "ip" → un budget per chiamante (best-effort: chi ruota IP lo aggira).
   * "global" → un solo budget per tutta la funzione. È questo che protegge
   * davvero la casella admin e la quota Resend.
   */
  scope: "ip" | "global";
}

// Cache dei soli verdetti di BLOCCO, per isolato. Una volta che una chiave è
// esaurita, le richieste successive nello stesso isolato costano zero query: è
// esattamente sotto attacco che il limiter deve essere economico.
// Non si cachea mai un verdetto positivo, altrimenti si lascerebbe passare
// traffico senza contarlo.
const blockedUntil = new Map<string, number>();

const MAX_CACHE_ENTRIES = 10_000;

function pruneCache(now: number) {
  for (const [key, until] of blockedUntil) {
    if (until <= now) blockedUntil.delete(key);
  }
  // Se dopo la potatura è ancora piena, la si svuota: al massimo si torna a
  // interrogare il DB, che resta la fonte di verità.
  if (blockedUntil.size > MAX_CACHE_ENTRIES) blockedUntil.clear();
}

function tooManyRequests(retryAfter: number, origin?: string | null) {
  // Il corpo porta sia `message` che `error`: le funzioni del progetto usano
  // l'una o l'altra chiave, così il messaggio arriva al client in entrambi i casi.
  const text = "Troppe richieste. Riprova tra qualche minuto.";

  return jsonResponse({ ok: false, message: text, error: text }, 429, origin, {
    "Retry-After": String(retryAfter),
  });
}

interface KeyedRule {
  rule: RateLimitRule;
  key: string;
}

function keysFor(req: Request, rules: RateLimitRule[]): KeyedRule[] {
  const ip = rules.some((r) => r.scope === "ip") ? getRateLimitKey(req) : "";

  return rules.map((rule) => ({
    rule,
    key: rule.scope === "global" ? `${rule.name}:global` : `${rule.name}:${ip}`,
  }));
}

function checkCache(
  keyed: KeyedRule[],
  now: number,
  origin?: string | null,
): Response | null {
  for (const { key } of keyed) {
    const until = blockedUntil.get(key);

    if (until && until > now) {
      return tooManyRequests(Math.ceil((until - now) / 1000), origin);
    }
  }

  return null;
}

/**
 * Guarda solo la cache in memoria, senza consumare budget né toccare il DB.
 *
 * Serve dove il budget va speso soltanto sui fallimenti (vedi `requireAdmin`):
 * si usa questa per respingere a costo zero chi è già noto come bloccato, e si
 * chiama `enforceRateLimit` solo dopo un tentativo andato male.
 */
export function peekRateLimit(
  req: Request,
  rules: RateLimitRule[],
  origin?: string | null,
): Response | null {
  const now = Date.now();

  pruneCache(now);

  return checkCache(keysFor(req, rules), now, origin);
}

/**
 * Consuma un colpo da ogni regola e restituisce una 429 pronta se una qualsiasi
 * è esaurita, `null` se la richiesta può proseguire.
 *
 * Va chiamata dopo il check del metodo e PRIMA di qualunque lavoro costoso
 * (parsing del body, query, Vault, GoTrue, invio email).
 */
export async function enforceRateLimit(
  req: Request,
  rules: RateLimitRule[],
  origin?: string | null,
): Promise<Response | null> {
  const now = Date.now();

  pruneCache(now);

  const keyed = keysFor(req, rules);

  // Prima la cache: se una chiave è già nota come bloccata, si risponde subito.
  const cached = checkCache(keyed, now, origin);

  if (cached) return cached;

  let sql: ReturnType<typeof getSql>;

  try {
    sql = getSql();
  } catch (err) {
    // Nessuna connessione configurata: si lascia passare, per la stessa ragione
    // di fail-open spiegata nel catch più sotto.
    console.error("rateLimit: getSql failed:", err);

    return null;
  }

  // Sequenziale e non in parallelo: se la prima regola blocca, le successive non
  // consumano budget inutilmente e si risparmia un round-trip.
  for (const { rule, key } of keyed) {
    try {
      const rows = await sql<{ allowed: boolean; retry_after: number }[]>`
        select allowed, retry_after
        from public.check_rate_limit(${key}, ${rule.limit}, ${rule.windowSeconds})
      `;
      const row = rows[0];

      if (row && !row.allowed) {
        const retryAfter = Math.max(1, row.retry_after);

        blockedUntil.set(key, now + retryAfter * 1000);
        console.warn(`rateLimit: blocked ${key} for ${retryAfter}s`);

        return tooManyRequests(retryAfter, origin);
      }
    } catch (err) {
      // FAIL-OPEN deliberato: se il DB è irraggiungibile, un limiter rotto non
      // deve diventare esso stesso l'interruzione di servizio che dovrebbe
      // prevenire. L'errore va nei log per accorgersene.
      console.error(`rateLimit: check failed for ${key}:`, err);
    }
  }

  return null;
}

/**
 * Cap sulla dimensione del corpo, letto da `content-length` prima di toccare il
 * body: scarta i payload sproporzionati senza spendere memoria a bufferizzarli.
 * Restituisce una 413 pronta, o `null` se la richiesta è accettabile.
 *
 * È un filtro a costo zero, non una garanzia: l'header può mancare (transfer
 * chunked) o mentire. Basta allo scopo, che è evitare di ingoiare corpi enormi
 * per errore o per dispetto.
 */
export function enforceBodySize(
  req: Request,
  maxBytes: number,
  origin?: string | null,
): Response | null {
  const declared = Number(req.headers.get("content-length") ?? "0");

  if (Number.isFinite(declared) && declared > maxBytes) {
    return jsonResponse(
      {
        ok: false,
        message: "Richiesta troppo grande",
        error: "Payload too large",
      },
      413,
      origin,
    );
  }

  return null;
}

/** Cap di default per gli endpoint pubblici, che accettano corpi minuscoli. */
export const PUBLIC_BODY_LIMIT = 10 * 1024;
