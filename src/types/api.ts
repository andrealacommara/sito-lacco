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
  status: "confirmed" | "unsubscribed" | "bounced";
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

// PATCH /functions/v1/admin-subscribers (disiscrizione manuale, richiede Bearer JWT)
export type AdminUnsubscribeBody = {
  ids: string[];
};
export type AdminUnsubscribeResponse = {
  ok: boolean;
  updated?: number;
  error?: string;
};

// POST /functions/v1/admin-broadcast (richiede Bearer JWT)
// Il FE renderizza l'HTML via announcementEmailHtml() e lo passa come htmlBody.
// Se recipientIds è presente, invia solo a quei subscriber (invio singolo) invece
// che all'intera audience Resend.
export type BroadcastBody = {
  subject: string;
  htmlBody: string;
  dry?: boolean; // se true, restituisce solo recipientCount senza inviare
  recipientIds?: string[];
};
export type BroadcastResponse = {
  ok: boolean;
  broadcastId?: string;
  recipientCount?: number;
  sent?: number;
  failed?: number;
  dry?: boolean;
  syncUpdated?: number; // quanti subscriber sono stati riallineati con Resend prima dell'invio "a tutti"
  error?: string;
};

// POST /functions/v1/admin-sync-resend (richiede Bearer JWT)
export type AdminSyncResendResponse = {
  ok: boolean;
  checked?: number;
  updated?: number;
  error?: string;
};

// POST /functions/v1/send-magic-link
export type SendMagicLinkBody = {
  redirectTo?: string;
};
export type SendMagicLinkResponse = {
  ok: boolean;
  message?: string;
};

// GET /functions/v1/admin-stats (richiede Bearer JWT)
export type AdminStatsResponse = {
  ok: boolean;
  confirmed?: number;
  unsubscribed?: number;
  bounced?: number;
  newLast7Days?: number;
  error?: string;
};

// ── Instagram analytics (tutti richiedono Bearer JWT) ────────────────────────

export type InstagramGrowthPoint = {
  date: string; // YYYY-MM-DD
  followers: number;
  follows: number;
};

export type InstagramPost = {
  id: string;
  permalink: string | null;
  caption: string | null;
  mediaType: string | null; // IMAGE | VIDEO | CAROUSEL_ALBUM | REEL | STORY
  postedAt: string | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  reach: number | null;
  views: number | null;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
  // Metriche extra delle storie (reach/replies/navigation/...).
  storyMetrics?: Record<string, number | null> | null;
  engagement: number;
};

export type InstagramRecentUnfollower = {
  username: string;
  since: string | null; // was_following_since
  detectedAt: string;
};

// Crescita scomposta: follower guadagnati/persi per giorno.
export type InstagramFlowPoint = {
  date: string; // YYYY-MM-DD
  gained: number;
  lost: number;
};

// Serie storica engagement di un post (accumulo nei giorni dopo la pubblicazione).
export type InstagramVelocity = {
  id: string;
  series: {
    capturedAt: string; // YYYY-MM-DD
    likes: number;
    comments: number;
    saves: number;
  }[];
};

// Diff tra gli ultimi due snapshot dei "seguiti".
export type InstagramFollowingChanges = {
  stoppedFollowing: string[];
  startedFollowing: string[];
};

// Non-mutuals persistenti (ultimo snapshot follower ↔ seguiti).
// available = false se non c'è ancora uno snapshot dei seguiti.
export type InstagramNonMutuals = {
  available: boolean;
  reliable: boolean; // false se l'export follower è incompleto (periodo ristretto)
  notFollowingBack: string[]; // segui ma non ti seguono
  fans: string[]; // ti seguono ma non li segui
};

// Tag manuale assegnato a un account nella lista "Non ti ricambiano".
export type InstagramAccountTag = "persona" | "vip" | "pagina";

// Demografica follower da Instagram (chiave dimensione → valore → conteggio).
// Es: { age: { "25-34": 45 }, gender: { F: 60, M: 40 }, country: { IT: 80 } }.
export type InstagramDemographics = {
  age?: Record<string, number>;
  gender?: Record<string, number>;
  country?: Record<string, number>;
  city?: Record<string, number>;
};

// GET /functions/v1/admin-instagram-stats
export type InstagramStatsResponse = {
  ok: boolean;
  followers?: number | null;
  follows?: number | null;
  mediaCount?: number | null;
  delta7d?: number | null;
  unfollowersLast30?: number;
  growth?: InstagramGrowthPoint[];
  posts?: InstagramPost[];
  flow?: InstagramFlowPoint[];
  velocity?: InstagramVelocity[];
  followingChanges?: InstagramFollowingChanges;
  nonMutuals?: InstagramNonMutuals;
  markedUnfollowed?: string[];
  // Tag manuali per account: username → tag (persona | vip | pagina).
  tags?: Record<string, InstagramAccountTag>;
  demographics?: InstagramDemographics | null;
  recentUnfollowers?: InstagramRecentUnfollower[];
  tokenExpiresAt?: string | null;
  error?: string;
};

// POST /functions/v1/admin-instagram-export
// Il client estrae le liste dallo ZIP (JSZip) e invia solo il JSON pulito.
export type InstagramExportBody = {
  followers: { username: string; followedYouAt: string | null }[];
  following?: { username: string }[];
};
export type InstagramExportResponse = {
  ok: boolean;
  snapshotId?: number;
  isFirstSnapshot?: boolean;
  total?: number;
  gained?: number;
  unfollowers?: { username: string; since: string | null }[];
  error?: string;
};

// POST /functions/v1/admin-instagram-snapshot (trigger manuale dall'admin)
export type InstagramSnapshotResponse = {
  ok: boolean;
  followers?: number;
  mediaTracked?: number;
  alertSent?: boolean;
  error?: string;
};
