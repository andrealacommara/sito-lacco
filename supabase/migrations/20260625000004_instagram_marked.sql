-- Gestione "da togliere": username che hai segnato come unfollowed (persistente).
-- Alimenta la lista "Non ti ricambiano" nella scheda Follower: le spunte restano
-- tra un upload e l'altro. Quando togli davvero il follow, la persona sparisce
-- dalla lista al prossimo export (non è più tra i tuoi seguiti).
create table if not exists instagram.marked_unfollowed (
  username   text primary key,
  marked_at  timestamptz not null default now()
);
alter table instagram.marked_unfollowed enable row level security;
