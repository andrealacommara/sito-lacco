-- Keep-alive per Supabase free tier (pausa dopo ~7 giorni di inattività)
-- Esegue una query banale ogni 3 giorni a mezzogiorno UTC

select cron.schedule(
  'keep-alive',
  '0 12 */3 * *',
  'SELECT count(*) FROM public.subscribers LIMIT 1'
);
