import { formatLongDate } from "@/config/date";

function CalendarIcon() {
  return (
    <svg
      className="shrink-0"
      fill="none"
      height={15}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={15}
    >
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

type Props = {
  date: Date;
  variant?: "dark" | "light";
};

// Badge con la data di uscita, riproduce lo stile usato dalla LiveEventCard.
// `dark` per le card su sfondo scuro, `light` per la releasePage in tema chiaro.
export default function ReleaseDateBadge({ date, variant = "dark" }: Props) {
  const styles =
    variant === "dark"
      ? "border-white/15 bg-white/5 text-white"
      : "border-gray-200 bg-gray-100 text-gray-900";

  return (
    <div
      className={`inline-flex max-w-full items-center justify-center gap-2 rounded-full border px-3 sm:px-4 py-1.5 text-xs xs:text-sm sm:text-base font-semibold [&>svg]:text-danger ${styles}`}
    >
      <CalendarIcon />
      <span>{formatLongDate(date)}</span>
    </div>
  );
}
