# Piano: SMTP personalizzato su Supabase via Resend

## Perché

Di default Supabase limita l'invio di email auth (magic link) a ~30 al giorno.
Collegando Resend come SMTP, il limite sale a 3.000 email/mese (piano free).
Il dominio è già verificato su Resend perché ci gira la newsletter.

## Step 1 — Credenziali SMTP da Resend

1. Vai su resend.com → accedi
2. API Keys → crea una nuova API key (o usa quella esistente della newsletter)
3. Tieni a portata di mano la chiave: `re_xxxxxxxxxxxx`

Credenziali da usare nel passo successivo:

| Campo    | Valore              |
|----------|---------------------|
| Host     | `smtp.resend.com`   |
| Porta    | `465`               |
| Username | `resend`            |
| Password | la tua API key      |

## Step 2 — Configura Supabase

1. Vai su supabase.com → apri il progetto
2. **Project Settings → Auth → SMTP Settings**
3. Abilita **"Enable Custom SMTP"**
4. Compila i campi:
   - **Sender name:** es. `Andrea La Commara`
   - **Sender email:** un indirizzo del dominio già verificato su Resend (es. `noreply@tuodominio.it`)
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** la tua API key Resend
5. Salva

## Step 3 — Testa

1. Supabase dashboard → Authentication → Users
2. Invia un magic link a te stesso
3. Verifica che l'email arrivi (controlla anche spam la prima volta)

## Note

- Il dominio deve essere verificato su Resend — lo è già grazie alla newsletter
- I nuovi limiti diventano quelli di Resend: 3.000 email/mese, 100/giorno (free)
- Newsletter e magic link sono ora entrambi centralizzati su Resend
