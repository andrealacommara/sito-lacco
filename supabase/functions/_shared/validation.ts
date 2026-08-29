export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Identifica il chiamante per il rate limiting.
//
// Supabase serve le Edge Function dietro Cloudflare, quindi la fonte giusta è
// `cf-connecting-ip`: lo scrive l'edge di Cloudflare con l'IP reale del chiamante
// e sovrascrive qualsiasi valore inviato dal client, quindi non è falsificabile.
// `x-real-ip` porta lo stesso valore ed è il ripiego naturale.
//
// `x-forwarded-for` è invece deliberatamente l'ULTIMA scelta: verificato sui log
// del progetto, qui non contiene l'IP del client ma la catena di proxy interni
// (gli acceleratori AWS 13.248.123.x), che cambia ad ogni richiesta. Usarlo
// sparpaglierebbe lo stesso chiamante su bucket diversi, rendendo inefficace il
// limite per-IP. Resta come rete di sicurezza se un giorno Cloudflare sparisse
// dalla catena, e in quel caso la prima voce è la convenzione corretta.
export function getRateLimitKey(req: Request): string {
  const cloudflareIp = req.headers.get("cf-connecting-ip");

  if (cloudflareIp) return cloudflareIp;

  const realIp = req.headers.get("x-real-ip");

  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwarded || "unknown";
}
