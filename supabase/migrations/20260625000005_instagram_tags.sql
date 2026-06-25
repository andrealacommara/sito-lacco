-- Tag manuali per gli account della lista "Non ti ricambiano": classifichi a mano
-- ogni profilo (persona / VIP / pagina) per filtrarli. Instagram non espone il
-- conteggio follower di account terzi via API, quindi la categoria è manuale e
-- persistente. Un solo tag per username (ultima scelta vince).
create table if not exists instagram.account_tags (
  username   text primary key,
  tag        text not null,
  tagged_at  timestamptz not null default now()
);
alter table instagram.account_tags enable row level security;
