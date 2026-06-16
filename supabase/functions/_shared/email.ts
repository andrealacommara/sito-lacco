import { getResendApiKey } from "./clients.ts";

const FROM = "Lacco <fan@lacco.it>";
const REPLY_TO = "ciao@lacco.it";
const LOGO_URL = "https://lacco.it/logo-lacco.png";

// ── HTML templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string, unsubscribeUrl?: string): string {
  const unsubFooter = unsubscribeUrl
    ? `<p style="margin:12px 0 0;font-size:11px;color:#bbb;">
        <a href="${unsubscribeUrl}" style="color:#bbb;text-decoration:underline;">
          Disiscriviti dalla newsletter
        </a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<title>Lacco</title>
<style>
:root{color-scheme:light only;supported-color-schemes:light only;}
.rte-body p{margin:0 0 16px;font-size:16px;color:#333;line-height:1.7;}
.rte-body p:last-child{margin-bottom:0;}
.rte-body ul,.rte-body ol{margin:0 0 16px;padding-left:24px;}
.rte-body li{font-size:16px;color:#333;line-height:1.7;margin-bottom:4px;}
@media (prefers-color-scheme:dark){
  .email-card,.email-header,.email-body,.email-footer{background:#ffffff !important;}
  .email-text,.rte-body p,.rte-body li{color:#333333 !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;color:#333333;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" class="email-card" bgcolor="#ffffff" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
      <tr>
        <td class="email-header" bgcolor="#ffffff" style="padding:24px 32px;text-align:center;border-bottom:3px solid #F31260;background:#ffffff;">
          <img src="${LOGO_URL}" alt="Lacco" height="130"
               style="display:block;margin:0 auto;height:130px;width:auto;" />
        </td>
      </tr>
      <tr>
        <td class="email-body" bgcolor="#ffffff" style="padding:32px;background:#ffffff;">
          ${content}
          <p class="email-text" style="margin:24px 0 0;font-size:15px;color:#333;line-height:1.7;">A presto,<br/><strong>Lacco</strong></p>
        </td>
      </tr>
      <tr>
        <td class="email-footer" bgcolor="#ffffff" style="padding:16px 32px 24px;border-top:1px solid #e4e4e7;text-align:center;background:#ffffff;">
          <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
            Hai ricevuto questa email perché sei iscritto alla newsletter di Lacco.
          </p>
          ${unsubFooter}
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// Merge tag sostituito da Resend per i broadcast su Audience. Per gli invii a
// destinatari singoli (che non passano per l'Audience Broadcast) viene sostituito
// manualmente lato backend — vedi admin-broadcast/index.ts.
export const FIRST_NAME_MERGE_TAG = "{{{contact.first_name|}}}";

export function broadcastEmailHtml(opts: {
  body: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
}): string {
  const bodyHtml = opts.body;

  const imageSection = opts.imageUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr>
          <td align="center">
            <img src="${opts.imageUrl}" alt="" width="456"
                 style="display:block;width:100%;max-width:456px;height:auto;border-radius:8px;" />
          </td>
        </tr>
       </table>`
    : "";

  const ctaSection =
    opts.ctaText && opts.ctaUrl
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#F31260;border-radius:8px;">
                    <a href="${opts.ctaUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;
                              color:#fff;text-decoration:none;letter-spacing:0.02em;">
                      ${opts.ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
         </table>`
      : "";

  const greeting = `<p style="margin:0 0 20px;font-size:16px;color:#111;line-height:1.6;">Ciao ${FIRST_NAME_MERGE_TAG},</p>`;

  return baseTemplate(
    `${greeting}<div class="rte-body" style="font-size:16px;color:#333;line-height:1.7;">${bodyHtml}</div>${imageSection}${ctaSection}`,
    opts.unsubscribeUrl,
  );
}

export function welcomeEmailHtml(
  firstName: string | undefined,
  unsubscribeUrl: string,
): string {
  const name = firstName ? firstName.trim() : undefined;
  const greeting = name
    ? `<p style="margin:0 0 16px;font-size:16px;color:#111;line-height:1.6;">Ciao ${name}!</p>`
    : "";

  return baseTemplate(
    `
    ${greeting}
    <p style="margin:0 0 24px;font-size:16px;color:#333;line-height:1.6;">
      Benvenuto in famiglia!<br/>
      Sarai la prima persona a sapere delle novità di Lacco — nuove uscite, anteprime e aggiornamenti arriveranno direttamente qui.
    </p>
    <p style="margin:0;font-size:13px;color:#888;">
      Se non hai fatto tu questa richiesta, puoi ignorare questa email.
    </p>
  `,
    unsubscribeUrl,
  );
}

// ── Resend helpers ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  firstName: string | undefined,
  unsubscribeUrl: string,
): Promise<void> {
  await resendSend({
    to,
    subject: "Benvenuto in famiglia",
    html: welcomeEmailHtml(firstName, unsubscribeUrl),
  });
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

const BATCH_CHUNK_SIZE = 100; // limite Resend per richiesta su /emails/batch

export async function resendSendBatch(
  emails: { to: string; subject: string; html: string }[],
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += BATCH_CHUNK_SIZE) {
    const chunk = emails.slice(i, i + BATCH_CHUNK_SIZE);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getResendApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        chunk.map((e) => ({
          from: FROM,
          reply_to: REPLY_TO,
          to: e.to,
          subject: e.subject,
          html: e.html,
        })),
      ),
    });

    if (res.ok) {
      sent += chunk.length;
    } else {
      failed += chunk.length;
    }
  }

  return { sent, failed };
}
