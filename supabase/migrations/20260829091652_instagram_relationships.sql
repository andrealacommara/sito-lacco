-- Revisione della logica follower/seguiti.
--
-- Da applicare A MANO, un blocco alla volta (SQL editor o `supabase migration up
-- --file`): la history locale e quella remota sono disgiunte, `supabase db push`
-- non va usato. I blocchi (e) sono distruttivi: eseguire prima le `select` di
-- conteggio commentate sopra ogni delete.
--
-- Problemi risolti:
--  · username con case/decorazioni diverse tra followers_*.json e following.json
--    → la stessa persona conta due volte e resta in "non ti ricambiano" per sempre
--  · snapshot follower e seguiti non accoppiati → diff tra fotografie di date diverse
--  · affidabilità dell'export ricalcolata a read-time contro un conteggio LIVE
--    → la lista spariva da sola man mano che i follower crescevano
--  · nessun modo di registrare "questo profilo ora mi segue" tra un export e l'altro

-- ── (a) Normalizzazione username a minuscolo ────────────────────────────────
-- Dedup prima dell'update, altrimenti la primary key esplode.

-- followers: fra due righe che collassano sulla stessa forma canonica tengo
-- quella che ha la data di inizio follow (serve alla fedeltà/tenure).
delete from instagram.followers a
using instagram.followers b
where a.snapshot_id = b.snapshot_id
  and lower(a.username) = lower(b.username)
  and a.username <> b.username
  and (
    (a.followed_you_at is null and b.followed_you_at is not null)
    or (
      (a.followed_you_at is null) = (b.followed_you_at is null)
      and a.username > b.username
    )
  );
update instagram.followers
  set username = lower(username)
  where username <> lower(username);

delete from instagram.following a
using instagram.following b
where a.snapshot_id = b.snapshot_id
  and lower(a.username) = lower(b.username)
  and a.username > b.username;
update instagram.following
  set username = lower(username)
  where username <> lower(username);

-- marked_unfollowed: PK sullo username, tengo la spunta più vecchia.
delete from instagram.marked_unfollowed a
using instagram.marked_unfollowed b
where lower(a.username) = lower(b.username)
  and a.username <> b.username
  and (a.marked_at, a.username) > (b.marked_at, b.username);
update instagram.marked_unfollowed
  set username = lower(username)
  where username <> lower(username);

-- account_tags: tengo il tag più recente.
delete from instagram.account_tags a
using instagram.account_tags b
where lower(a.username) = lower(b.username)
  and a.username <> b.username
  and (a.tagged_at, a.username) < (b.tagged_at, b.username);
update instagram.account_tags
  set username = lower(username)
  where username <> lower(username);

-- Gli eventi non hanno vincoli di unicità: basta l'update.
update instagram.follow_events
  set username = lower(username)
  where username <> lower(username);
update instagram.unfollow_events
  set username = lower(username)
  where username <> lower(username);

-- Forma canonica garantita anche in futuro. In DO block perché Postgres non ha
-- `add constraint if not exists`: così il blocco è rieseguibile senza errori.
do $$
begin
  alter table instagram.followers
    add constraint followers_username_lower check (username = lower(username));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table instagram.following
    add constraint following_username_lower check (username = lower(username));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table instagram.marked_unfollowed
    add constraint marked_unfollowed_username_lower check (username = lower(username));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table instagram.account_tags
    add constraint account_tags_username_lower check (username = lower(username));
exception when duplicate_object then null;
end $$;

-- Il vincolo sui tag mancava: la validazione viveva solo nell'edge function.
do $$
begin
  alter table instagram.account_tags
    add constraint account_tags_tag_valid check (tag in ('persona', 'vip', 'pagina'));
exception when duplicate_object then null;
end $$;

-- ── (b) Accoppiamento follower ↔ seguiti dello stesso upload ────────────────
-- Prima i due lati del diff erano scelti indipendentemente con
-- `order by captured_at desc limit 1`: bastava un export senza lista "Seguiti"
-- per confrontare fotografie di date diverse.
alter table instagram.follower_snapshots
  add column if not exists following_snapshot_id bigint
    references instagram.following_snapshots(id);

-- Backfill: per ogni snapshot follower, il following snapshot temporalmente più
-- vicino (stesso upload = pochi secondi di distanza); se non c'è, l'ultimo
-- precedente disponibile.
update instagram.follower_snapshots fs
set following_snapshot_id = (
  select gs.id
  from instagram.following_snapshots gs
  order by abs(extract(epoch from (gs.captured_at - fs.captured_at))) asc
  limit 1
)
where following_snapshot_id is null;

-- ── (c) Affidabilità dell'export congelata sullo snapshot ───────────────────
-- Era ricalcolata a ogni lettura confrontando un total_count fermo all'ultimo
-- upload con followers_count aggiornato ogni giorno dal cron: crescendo i
-- follower la soglia scattava da sola e la lista spariva.
alter table instagram.follower_snapshots
  add column if not exists reliable boolean not null default true;

update instagram.follower_snapshots fs
set reliable = coalesce(
  fs.total_count >= (
    select a.followers_count * 0.85
    from instagram.account_snapshots a
    where a.followers_count > 0
    order by abs(a.captured_at - fs.captured_at::date) asc
    limit 1
  ),
  true
);

-- ── (d) Override manuale "ora mi segue" ─────────────────────────────────────
-- Tra un export e l'altro non c'è modo di sapere che qualcuno ha ricominciato a
-- seguirti (la Graph API non espone la lista follower). Questa tabella registra
-- la correzione a mano; il prossimo export affidabile la azzera perché torna a
-- essere la fonte di verità.
create table if not exists instagram.relationship_overrides (
  username    text primary key check (username = lower(username)),
  state       text not null check (state in ('follows_you')),
  set_at      timestamptz not null default now(),
  snapshot_id bigint references instagram.follower_snapshots(id)
);
alter table instagram.relationship_overrides enable row level security;

-- ── (e) Pulizia dei dati falsi ──────────────────────────────────────────────
-- DISTRUTTIVO. Lanciare prima la select di conteggio, poi il delete.

-- Falsi unfollow generati da export troncati.
-- select count(*) from instagram.unfollow_events e
--   join instagram.follower_snapshots s on s.id = e.gone_between
--   where s.reliable = false;
delete from instagram.unfollow_events e
using instagram.follower_snapshots s
where s.id = e.gone_between and s.reliable = false;

-- Falsi "riacquisti": lo snapshot che li ha generati è completo, ma il precedente
-- era troncato, quindi quei follower non erano mai stati persi davvero.
-- select count(*) from instagram.follow_events e
--   join instagram.follower_snapshots s on s.id = e.gained_between
--   where exists (select 1 from instagram.follower_snapshots p
--                 where p.captured_at < s.captured_at and p.reliable = false
--                 order by p.captured_at desc limit 1);
delete from instagram.follow_events e
using instagram.follower_snapshots s
where s.id = e.gained_between
  and (
    select p.reliable
    from instagram.follower_snapshots p
    where p.captured_at < s.captured_at
    order by p.captured_at desc
    limit 1
  ) is false;

-- Spunte "tolto" su profili che non segui più (o che ora ti ricambiano):
-- la spunta non significa più niente e li farebbe riapparire già barrati.
-- select count(*) from instagram.marked_unfollowed where username not in (...);
delete from instagram.marked_unfollowed m
where not exists (
  select 1 from instagram.following f
  where f.username = m.username
    and f.snapshot_id = (
      select id from instagram.following_snapshots order by captured_at desc limit 1
    )
);

-- Tag orfani rispetto all'ultima fotografia (follower ∪ seguiti).
-- NON eseguito: a differenza delle spunte, un tag stantio non fa danno (da questa
-- revisione admin-instagram-stats non lo restituisce più fuori dall'universo
-- corrente) ed è lavoro di classificazione fatto a mano che tornerebbe utile se
-- quel profilo rientrasse in lista. Scommentare solo per fare pulizia davvero.
/*
delete from instagram.account_tags t
where not exists (
  select 1 from instagram.following f
  where f.username = t.username
    and f.snapshot_id = (
      select id from instagram.following_snapshots order by captured_at desc limit 1
    )
)
and not exists (
  select 1 from instagram.followers fo
  where fo.username = t.username
    and fo.snapshot_id = (
      select id from instagram.follower_snapshots order by captured_at desc limit 1
    )
);
*/
