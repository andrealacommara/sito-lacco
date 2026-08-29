-- Rate limiting per le Edge Function pubbliche.
--
-- Motivo: `send-magic-link`, `subscribe` e `send-contact-email` sono raggiungibili
-- senza autenticazione e spendono una email Resend per richiesta. Senza un tetto,
-- un loop di curl basta a riempire la casella admin e a bruciare la quota Resend
-- (con il rischio concreto di sospensione dell'account, che porterebbe giù anche
-- la newsletter).
--
-- Il contatore vive qui e non in memoria perché ogni Edge Function gira in isolati
-- effimeri e paralleli: un contatore per-isolato non vedrebbe mai il traffico
-- degli altri.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

-- Serve solo al cleanup periodico, che scansiona per finestra scaduta.
create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);

-- Nessuna policy: come `subscribers`, la tabella è raggiungibile solo dal
-- service_role usato dalle Edge Function.
alter table public.rate_limits enable row level security;

-- Consuma un colpo dal budget di `p_key` e dice se la richiesta può passare.
--
-- L'atomicità è il punto dell'intera funzione: senza `on conflict do update` in
-- una singola istruzione, due isolati concorrenti leggerebbero lo stesso count e
-- si sovrascriverebbero a vicenda, lasciando passare più richieste del dovuto
-- proprio sotto attacco, cioè quando la concorrenza è massima.
--
-- Finestra fissa (non scorrevole): al primo colpo dopo la scadenza il contatore
-- riparte da zero. Meno preciso di una sliding window, ma una sola riga e una
-- sola istruzione per richiesta.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_window_start timestamptz;
begin
  insert into public.rate_limits as rl (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set
      -- Finestra scaduta → riparte da 1; altrimenti incrementa.
      count = case
        when rl.window_start < now() - make_interval(secs => p_window_seconds)
          then 1
        else rl.count + 1
      end,
      window_start = case
        when rl.window_start < now() - make_interval(secs => p_window_seconds)
          then now()
        else rl.window_start
      end
  returning rl.count, rl.window_start into v_count, v_window_start;

  allowed := v_count <= p_limit;

  -- Secondi mancanti alla riapertura della finestra. Almeno 1: uno 0 in
  -- `Retry-After` inviterebbe il client a ritentare subito.
  retry_after := greatest(
    1,
    ceil(
      extract(epoch from (
        v_window_start + make_interval(secs => p_window_seconds) - now()
      ))
    )::integer
  );

  return next;
end;
$$;

-- Le righe scadute non servono a nulla ma la tabella cresce di una riga per IP
-- visto. pg_cron e pg_net sono già installati da 20260625000002_instagram_cron.sql;
-- `if not exists` li rende comunque sicuri se questa migration girasse da sola.
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'rate-limits-cleanup') then
    perform cron.unschedule('rate-limits-cleanup');
  end if;
end $$;

-- Ogni ora, al minuto 5. La finestra più lunga in uso è di un'ora: due ore di
-- margine evitano di cancellare righe ancora vive.
select cron.schedule(
  'rate-limits-cleanup',
  '5 * * * *',
  $$
  delete from public.rate_limits where window_start < now() - interval '2 hours';
  $$
);
