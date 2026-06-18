# Piano: colore tab browser su mobile (theme-color)

## Cosa fa

Il meta tag `theme-color` cambia il colore della barra del browser su mobile
quando l'utente visita il sito. Funziona su Safari 15+ (iOS) e Chrome su Android.

## Dove intervenire

Nel file del layout base, dentro `<head>`.
Di solito è `app/layout.tsx` (Next.js App Router) o `pages/_document.tsx`.

## Cosa aggiungere

Versione semplice (un solo colore):

```html
<meta name="theme-color" content="#COLORE_HEX">
```

Versione con supporto dark mode:

```html
<meta name="theme-color" content="#COLORE_CHIARO" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#COLORE_SCURO"  media="(prefers-color-scheme: dark)">
```

Sostituisci `#COLORE_HEX` con il colore del sito (es. il colore primario del brand).

## Come verificare

1. Apri il sito da Safari su iPhone
2. Il colore della barra in alto del browser deve corrispondere a quello impostato
3. Prova anche la tab switcher — il colore appare anche lì
