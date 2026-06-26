import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
