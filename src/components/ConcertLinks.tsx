import { useEffect, useState } from "react";
import { concertInfoUrl, concertTicketsUrl, formatLongDate, type DatedConcert } from "@/lib/concerts";

type Props = {
  concert: DatedConcert;
  today?: Date;
  /** Hide the Tickets link (e.g. for archived past concerts). */
  hideTickets?: boolean;
  className?: string;
};

/**
 * Renders the "More info" and "Tickets" actions for a single concert.
 * "More info" opens a panel with the concert's description text (when set)
 * plus the external link; tickets link out directly.
 */
export function ConcertLinks({ concert, today, hideTickets, className }: Props) {
  const isPast = today ? concert.when.getTime() < today.getTime() : false;
  const showTickets = !hideTickets && !isPast;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = "cursor-pointer text-primary underline-offset-4 transition-opacity hover:underline";

  return (
    <>
      <div
        className={[
          "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.6875rem] uppercase tracking-[0.24em]",
          className ?? "",
        ].join(" ")}
      >
        <button
          type="button"
          className={linkClass}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          More info
        </button>
        {showTickets ? (
          <a
            href={concertTicketsUrl(concert)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            onClick={(e) => e.stopPropagation()}
          >
            Tickets ↗
          </a>
        ) : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto border border-border bg-background p-6 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
              {formatLongDate(concert.when)}
              {concert.time ? ` · ${concert.time}` : ""}
            </p>
            <h3 className="mt-3 font-display text-2xl text-foreground">{concert.venue}</h3>
            <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
              {concert.town}, {concert.country}
            </p>
            {concert.infoText ? (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {concert.infoText}
              </p>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Further details for this concert are available on the organiser's page.
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-5 text-[0.6875rem] uppercase tracking-[0.24em]">
              <a
                href={concertInfoUrl(concert)}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Open full details ↗
              </a>
              {showTickets ? (
                <a
                  href={concertTicketsUrl(concert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Tickets ↗
                </a>
              ) : null}
              <button
                type="button"
                className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
