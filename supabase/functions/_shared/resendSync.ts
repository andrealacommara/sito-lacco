import { getSupabaseAdmin, RESEND_AUDIENCE_ID } from "./clients.ts";

type ResendContact = {
  email: string;
  unsubscribed: boolean;
};

async function fetchAllContacts(apiKey: string): Promise<ResendContact[]> {
  const res = await fetch(
    `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as {
    data: ResendContact[];
    has_more?: boolean;
  };

  // Senza un limit esplicito Resend ritorna tutti i contatti in un'unica risposta;
  // se in futuro l'audience crescesse oltre il default, andrebbe aggiunta paginazione.
  return body.data;
}

// Riallinea lo status dei subscriber su Supabase con lo stato "unsubscribed" reale
// su Resend. Usata sia dal bottone manuale "Sincronizza con Resend" sia, in modo
// automatico, prima di ogni invio massivo, per non spedire a chi si è disiscritto
// su Resend senza che il webhook l'avesse ancora propagato qui.
export async function syncResendContacts(
  apiKey: string,
): Promise<{ checked: number; updated: number }> {
  const supabase = getSupabaseAdmin();
  const contacts = await fetchAllContacts(apiKey);
  let updated = 0;

  for (const contact of contacts) {
    const targetStatus = contact.unsubscribed ? "unsubscribed" : "confirmed";
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("status")
      .eq("email", contact.email)
      .maybeSingle();

    if (!subscriber) continue;
    if (subscriber.status === targetStatus) continue;
    // Non toccare chi è "bounced": solo i casi confirmed <-> unsubscribed.
    if (
      subscriber.status !== "confirmed" &&
      subscriber.status !== "unsubscribed"
    )
      continue;

    await supabase
      .from("subscribers")
      .update({ status: targetStatus })
      .eq("email", contact.email);
    updated++;
  }

  return { checked: contacts.length, updated };
}
