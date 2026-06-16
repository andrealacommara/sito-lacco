// Email HTML template functions — mirrors supabase/functions/_shared/email.ts
// Used by the admin page to preview emails before sending.

const LOGO_URL = "https://lacco.it/logo-lacco.png";

function baseTemplate(
  content: string,
  unsubscribeUrl?: string,
  logoUrl: string = LOGO_URL,
): string {
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
          <img src="${logoUrl}" alt="Lacco" height="130"
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
            Hai ricevuto questa email perché iscritto alla newsletter di Lacco.
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

export function welcomeEmailHtml(
  firstName: string | undefined,
  unsubscribeUrl: string,
): string {
  const name = firstName?.trim();
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

export function broadcastEmailHtml(opts: {
  body: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
  previewLogoUrl?: string;
  preview?: boolean;
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

  const greeting = opts.preview
    ? `<p style="margin:0 0 20px;font-size:16px;color:#111;line-height:1.6;">Ciao <span style="color:#F31260;">[Nome destinatario]</span>,</p>`
    : `<p style="margin:0 0 20px;font-size:16px;color:#111;line-height:1.6;">Ciao {{{contact.first_name|}}},</p>`;

  return baseTemplate(
    `${greeting}<div class="rte-body" style="font-size:16px;color:#333;line-height:1.7;">${bodyHtml}</div>${imageSection}${ctaSection}`,
    opts.unsubscribeUrl,
    opts.previewLogoUrl,
  );
}
