-- Tabella iscritti newsletter / pre-save
-- Unica fonte di verità per i contatti. Resend Audience è un mirror per l'invio.

create table if not exists public.subscribers (
  id                    uuid primary key default gen_random_uuid(),
  email                 text unique not null,
  first_name            text,
  release_slug          text,          -- null = iscrizione newsletter generica
  source                text not null
    check (source in ('presave_form', 'newsletter_form', 'manual')),
  consent               boolean not null default false,
  consent_timestamp     timestamptz,
  double_optin_confirmed boolean not null default false,
  confirm_token         text unique,   -- null dopo conferma (pulito per sicurezza)
  unsubscribe_token     text unique not null default gen_random_uuid()::text,
  resend_contact_id     text,          -- ID contatto in Resend Audience (dopo sync)
  status                text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed', 'bounced')),
  locale                text not null default 'it',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Indici per lookup veloci
create index if not exists idx_subscribers_email
  on public.subscribers (email);
create index if not exists idx_subscribers_confirm_token
  on public.subscribers (confirm_token);
create index if not exists idx_subscribers_unsubscribe_token
  on public.subscribers (unsubscribe_token);
create index if not exists idx_subscribers_status
  on public.subscribers (status);

-- Trigger per updated_at automatico
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscribers_updated_at
  before update on public.subscribers
  for each row execute function public.set_updated_at();

-- RLS: abilitato, nessuna policy per anon.
-- Solo le Edge Functions con service_role possono leggere/scrivere.
alter table public.subscribers enable row level security;

-- Tabella log broadcast (storico invii newsletter)
create table if not exists public.broadcasts (
  id              uuid primary key default gen_random_uuid(),
  template        text not null,
  subject         text not null,
  resend_id       text,              -- ID broadcast Resend
  recipient_count integer,
  sent_at         timestamptz not null default now()
);

alter table public.broadcasts enable row level security;
