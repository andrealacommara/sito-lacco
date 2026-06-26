-- Instagram analytics v2.
-- 1) Preview dei contenuti + metriche specifiche delle storie su media_insights.
-- 2) Lista "seguiti" (following) per lo studio "chi ho smesso di seguire",
--    mirror di follower_snapshots/followers.

-- ── Preview + storie su media_insights ──────────────────────────────────────
-- thumbnail_url: video/reel/storie · media_url: immagini · insights: metriche
-- storia (replies, navigation/exits, total_interactions, ...). Gli URL CDN di
-- Instagram sono firmati e a scadenza: si rinfrescano a ogni snapshot.
-- media_type ora include anche 'STORY' (nessun CHECK, colonna text libera).
alter table instagram.media_insights
  add column if not exists thumbnail_url text,
  add column if not exists media_url     text,
  add column if not exists insights      jsonb;

-- ── Snapshot della lista "seguiti" (1 per upload export) ─────────────────────
create table if not exists instagram.following_snapshots (
  id            bigint generated always as identity primary key,
  captured_at   timestamptz not null default now(),
  total_count   int not null
);
alter table instagram.following_snapshots enable row level security;

-- Membership: chi seguivi in quello snapshot (chiave = username, come followers).
create table if not exists instagram.following (
  snapshot_id     bigint not null
    references instagram.following_snapshots(id) on delete cascade,
  username        text not null,
  primary key (snapshot_id, username)
);
alter table instagram.following enable row level security;

create index if not exists idx_ig_following_snapshots_captured
  on instagram.following_snapshots (captured_at desc);
