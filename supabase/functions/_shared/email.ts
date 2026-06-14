// Wrapper Resend per invio email transazionale
import { getResendApiKey } from "./clients.ts";

const FROM = "Lacco <no-reply@lacco.it>";
const REPLY_TO = "ciao@lacco.it";

export async function sendConfirmEmail(
  to: string,
  firstName: string | undefined,
  confirmUrl: string,
): Promise<void> {
  const name = firstName ?? "ciao";
  const html = `
    <p>Hey ${name},</p>
    <p>Conferma la tua email per ricevere aggiornamenti sulle uscite di Lacco:</p>
    <p><a href="${confirmUrl}" style="background:#F31260;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Conferma iscrizione</a></p>
    <p>Se non hai fatto tu questa richiesta, ignora questa email.</p>
    <p>— Lacco</p>
  `;
  await resendSend({ to, subject: "Conferma la tua iscrizione", html });
}

export async function resendSend(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      reply_to: REPLY_TO,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}
