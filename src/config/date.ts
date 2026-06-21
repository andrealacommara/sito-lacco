// Helper per costruire le date di uscita del catalogo.
// `time` è opzionale (default mezzanotte): d("2026-07-03") oppure d("2026-07-03", "18:00").
export function d(date: string, time = "00:00"): Date {
  return new Date(`${date}T${time}:00`);
}

// Data lunga in italiano con la prima lettera maiuscola, es. "Venerdì, 3 luglio 2026".
// Usata dal badge data (LiveEventCard, ReleaseDateBadge).
export function formatLongDate(date: Date): string {
  const s = date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return s.charAt(0).toUpperCase() + s.slice(1);
}
