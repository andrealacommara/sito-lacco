// Email HTML template functions — mirrors supabase/functions/_shared/email.ts
// Used by the admin page to preview emails before sending.

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Lacco</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#111;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:#F31260;padding:20px 32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.08em;">LACCO</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          ${content}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 24px;border-top:1px solid #222;">
          <p style="margin:0;font-size:12px;color:#555;line-height:1.5;">
            Hai ricevuto questa email perché hai richiesto aggiornamenti sulle uscite di Lacco.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function confirmEmailHtml(firstName: string | undefined, confirmUrl: string): string {
  const name = firstName?.trim();
  const greeting = name ? `Hey ${name},` : "Hey,";
  return baseTemplate(`
    <p style="margin:0 0 16px;font-size:16px;color:#e0e0e0;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:16px;color:#e0e0e0;line-height:1.6;">
      Conferma la tua email per ricevere aggiornamenti sulle prossime uscite di Lacco.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F31260;border-radius:8px;">
          <a href="${confirmUrl}"
             style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;
                    color:#fff;text-decoration:none;letter-spacing:0.02em;">
            Conferma iscrizione
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#666;">
      Se non hai fatto tu questa richiesta, puoi ignorare questa email.
    </p>
  `);
}

export function announcementEmailHtml(opts: {
  firstName?: string;
  releaseTitle: string;
  releaseUrl: string;
  unsubscribeUrl: string;
}): string {
  const name = opts.firstName?.trim();
  const greeting = name ? `Hey ${name},` : "Hey,";
  return baseTemplate(`
    <p style="margin:0 0 8px;font-size:16px;color:#e0e0e0;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:16px;color:#e0e0e0;line-height:1.6;">
      È uscito il nuovo singolo:
    </p>
    <p style="margin:0 0 24px;font-size:28px;font-weight:700;color:#fff;">
      ${opts.releaseTitle}
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F31260;border-radius:8px;">
          <a href="${opts.releaseUrl}"
             style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;
                    color:#fff;text-decoration:none;letter-spacing:0.02em;">
            Ascolta ora
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#666;">
      Buon ascolto — Lacco<br/>
      <a href="${opts.unsubscribeUrl}" style="color:#555;text-decoration:underline;">
        Disiscrivi
      </a>
    </p>
  `);
}
