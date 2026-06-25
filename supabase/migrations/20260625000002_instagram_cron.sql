-- Scheduling Instagram analytics via pg_cron + pg_net.
--   1. ig-snapshot-daily   → snapshot Graph API ogni giorno (06:00 UTC)
--   2. ig-export-reminder-weekly → promemoria "carica l'export" (lun 09:00 UTC)
-- Entrambi invocano la stessa Edge Function `admin-instagram-snapshot` via HTTP,
-- autenticandosi con l'header `x-cron-secret`. Il segreto NON è nel file: viene
-- letto dal Vault di Supabase (nome `ig_cron_secret`), così non finisce in git.
--
-- PREREQUISITO DEPLOY (una tantum, stesso valore del secret Edge `CRON_SECRET`):
--   select vault.create_secret('<IL_TUO_CRON_SECRET>', 'ig_cron_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- URL pubblico delle Edge Functions del progetto (non è un segreto: è lo stesso
-- host di VITE_SUPABASE_URL).
-- https://hnjsfwhtnntjzpwzxgut.supabase.co/functions/v1/admin-instagram-snapshot

do $$
begin
  if exists (select 1 from cron.job where jobname = 'ig-snapshot-daily') then
    perform cron.unschedule('ig-snapshot-daily');
  end if;
  if exists (select 1 from cron.job where jobname = 'ig-export-reminder-weekly') then
    perform cron.unschedule('ig-export-reminder-weekly');
  end if;
end $$;

-- Snapshot giornaliero (06:00 UTC).
select cron.schedule(
  'ig-snapshot-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://hnjsfwhtnntjzpwzxgut.supabase.co/functions/v1/admin-instagram-snapshot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ig_cron_secret')
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Promemoria settimanale (lunedì 09:00 UTC): rete di sicurezza per il churn
-- mascherato. Stessa funzione con ?task=reminder → invia solo l'email-promemoria.
select cron.schedule(
  'ig-export-reminder-weekly',
  '0 9 * * 1',
  $$
  select net.http_post(
    url     := 'https://hnjsfwhtnntjzpwzxgut.supabase.co/functions/v1/admin-instagram-snapshot?task=reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ig_cron_secret')
    ),
    body    := '{}'::jsonb
  );
  $$
);
