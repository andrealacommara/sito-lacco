-- Instagram analytics (uso personale admin, mono-utente @laccoverse).
-- Schema dedicato `instagram`, FUORI da `public`: non viene auto-esposto dal Data
-- API (anon/authenticated). L'accesso passa SOLO dalle Edge Functions con
-- service_role. Vedi instagram-analytics-design.md (sezione 5).

create schema if not exists instagram;

-- service_role bypassa la RLS ma ha comunque bisogno dell'USAGE sullo schema e dei
-- privilegi sulle tabelle (uno schema nuovo non li concede in automatico).
grant usage on schema instagram to service_role;
alter default privileges in schema instagram
  grant all on tables to service_role;
alter default privileges in schema instagram
  grant all on sequences to service_role;

-- ── Token long-lived persistito (riga singola) ──────────────────────────────
-- Il token Graph dura 60gg ma è rinnovabile all'infinito. I secret Deno.env sono
-- read-only a runtime, quindi il token "vivo" vive qui: bootstrap da IG_GRAPH_TOKEN
-- al primo run, poi lo snapshot lo rinfresca e riscrive qui (set-and-forget).
create table instagram.app_config (
  id                smallint primary key default 1 check (id = 1),
  access_token      text,
  token_expires_at  timestamptz,
  updated_at        timestamptz not null default now()
);
alter table instagram.app_config enable row level security;

-- ── Snapshot giornaliero automatico (Graph API) ─────────────────────────────
-- Guida il trigger "calo netto".
create table instagram.account_snapshots (
  id              bigint generated always as identity primary key,
  captured_at     date not null default current_date,
  followers_count int not null,
  follows_count   int not null,
  media_count     int not null,
  insights        jsonb,            -- reach, demografia aggregata, ecc.
  created_at      timestamptz not null default now(),
  unique (captured_at)
);
alter table instagram.account_snapshots enable row level security;

-- ── Snapshot della lista follower completa (1 per upload export) ─────────────
create table instagram.follower_snapshots (
  id            bigint generated always as identity primary key,
  captured_at   timestamptz not null default now(),
  source        text not null default 'export',
  total_count   int not null
);
alter table instagram.follower_snapshots enable row level security;

-- Membership: chi era follower in quello snapshot.
-- NOTA: la chiave è lo USERNAME (l'export non fornisce un ID numerico stabile).
create table instagram.followers (
  snapshot_id     bigint not null
    references instagram.follower_snapshots(id) on delete cascade,
  username        text not null,
  followed_you_at timestamptz,      -- dal campo "timestamp" dell'export
  primary key (snapshot_id, username)
);
alter table instagram.followers enable row level security;

-- ── Eventi derivati dal diff tra due snapshot consecutivi ────────────────────
create table instagram.unfollow_events (
  id                  bigint generated always as identity primary key,
  username            text not null,
  detected_at         timestamptz not null default now(),
  gone_between        bigint references instagram.follower_snapshots(id),
  was_following_since timestamptz       -- da followed_you_at
);
alter table instagram.unfollow_events enable row level security;

create table instagram.follow_events (
  id              bigint generated always as identity primary key,
  username        text not null,
  detected_at     timestamptz not null default now(),
  gained_between  bigint references instagram.follower_snapshots(id)
);
alter table instagram.follow_events enable row level security;

-- ── Report sui post (Graph API, automatico). Serie storica per post ──────────
create table instagram.media_insights (
  id            bigint generated always as identity primary key,
  ig_media_id   text not null,
  captured_at   timestamptz not null default now(),
  media_type    text,             -- IMAGE | VIDEO | CAROUSEL_ALBUM | REEL
  permalink     text,
  caption       text,
  posted_at     timestamptz,
  likes    int,
  comments int,
  saves    int,
  shares   int,
  reach    int,
  views    int,
  unique (ig_media_id, captured_at)
);
alter table instagram.media_insights enable row level security;

-- Indici per le query di dashboard più frequenti.
create index idx_ig_account_snapshots_captured
  on instagram.account_snapshots (captured_at desc);
create index idx_ig_media_insights_media
  on instagram.media_insights (ig_media_id, captured_at desc);
create index idx_ig_unfollow_events_detected
  on instagram.unfollow_events (detected_at desc);
create index idx_ig_follow_events_detected
  on instagram.follow_events (detected_at desc);
