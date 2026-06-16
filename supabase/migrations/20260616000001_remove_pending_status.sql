-- Rimuove lo stato "pending" e l'infrastruttura di doppio opt-in.
-- Il flusso è single opt-in dal PR #74 (giugno 2026): nessuna riga usa più
-- confirm_token/double_optin_confirmed e 0 iscritti sono in stato pending.

alter table public.subscribers
  drop column if exists confirm_token,
  drop column if exists double_optin_confirmed;

alter table public.subscribers
  alter column status set default 'confirmed';

alter table public.subscribers
  drop constraint if exists subscribers_status_check;

alter table public.subscribers
  add constraint subscribers_status_check
  check (status in ('confirmed', 'unsubscribed', 'bounced'));
