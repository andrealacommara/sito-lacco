// Helper per costruire le date di uscita del catalogo.
// `time` è opzionale (default mezzanotte): d("2026-07-03") oppure d("2026-07-03", "18:00").
export function d(date: string, time = "00:00"): Date {
  return new Date(`${date}T${time}:00`);
}
