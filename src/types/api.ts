// Contratto FE ↔ BE per le Edge Functions Supabase
// Endpoint base: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/'

// POST /functions/v1/subscribe
export type SubscribeBody = {
  email: string;
  firstName?: string;
  releaseSlug?: string;
  source: "presave_form" | "newsletter_form";
  consent: true;
  _hp?: string; // honeypot (deve essere vuoto)
};
export type SubscribeResponse = {
  ok: boolean;
  message: string;
};

// GET /functions/v1/confirm?token=xxx
export type ConfirmResponse = {
  ok: boolean;
  alreadyConfirmed?: boolean;
  error?: string;
};

// GET /functions/v1/unsubscribe?token=xxx
export type UnsubscribeResponse = {
  ok: boolean;
  error?: string;
};

// GET /functions/v1/admin-subscribers (richiede Bearer JWT)
export type AdminSubscriber = {
  id: string;
  email: string;
  firstName?: string;
  status: "pending" | "confirmed" | "unsubscribed" | "bounced";
  source: "presave_form" | "newsletter_form" | "manual";
  releaseSlug?: string;
  consentTimestamp?: string;
  createdAt: string;
};
export type AdminSubscribersResponse = {
  subscribers: AdminSubscriber[];
  total: number;
};

// POST /functions/v1/admin-subscribers (aggiunta manuale, richiede Bearer JWT)
export type AdminAddSubscriberBody = {
  email: string;
  firstName?: string;
  consentTimestamp: string; // ISO date del consenso raccolto di persona
  note?: string;
};

// POST /functions/v1/admin-broadcast (richiede Bearer JWT)
// Il FE renderizza l'HTML via announcementEmailHtml() e lo passa come htmlBody
export type BroadcastBody = {
  subject: string;
  htmlBody: string;
  dry?: boolean; // se true, restituisce solo recipientCount senza inviare
};
export type BroadcastResponse = {
  ok: boolean;
  broadcastId?: string;
  recipientCount?: number;
  dry?: boolean;
  error?: string;
};
