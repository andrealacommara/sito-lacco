import postgres from "https://esm.sh/postgres@3.4.5";

// Connessione Postgres DIRETTA (non PostgREST). Lo schema `instagram` è volutamente
// fuori dalle exposed schemas del Data API: l'unico modo per leggerlo/scriverlo è
// una connessione al DB con le credenziali service-level. SUPABASE_DB_URL è
// iniettata di default nelle Edge Functions.
//
// prepare:false → compatibile con il pooler in transaction mode (pgbouncer non
// supporta prepared statement persistenti).
let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!_sql) {
    const url = Deno.env.get("SUPABASE_DB_URL");

    if (!url) throw new Error("SUPABASE_DB_URL not set");
    _sql = postgres(url, { prepare: false });
  }

  return _sql;
}
