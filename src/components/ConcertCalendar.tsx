import { useCallback, useMemo, useRef, useState } from "react";
import { ConcertLinks } from "@/components/ConcertLinks";
import { formatLongDate, monthKey, monthLabel, type DatedConcert } from "@/lib/concerts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarDay({
  day,
  date,
  events,
  today,
}: {
  day: number;
  date: Date;
  events: DatedConcert[];
  today: Date;
}) {
  const isToday = date.getTime() === today.getTime();
  const hasEvent = events.length > 0;
  const isPastDay = hasEvent && events.every((c) => c.when.getTime() < today.getTime());
  const cellRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; arrow: number } | null>(null);

  const place = useCallback(() => {
    const el = cellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(280, window.innerWidth - margin * 2);
    const anchorX = r.left + r.width / 2;
    let left = anchorX - width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    return setPos({ left, top: r.bottom + 8, arrow: anchorX - left });
  }, []);

  return (
    <div
      ref={cellRef}
      onMouseEnter={hasEvent ? place : undefined}
      onMouseLeave={hasEvent ? () => setPos(null) : undefined}
      className={[
        "group relative flex aspect-square flex-col items-center justify-center border border-border/60 text-xs transition-colors duration-200 sm:text-sm",
        hasEvent && !isPastDay
          ? "cursor-pointer bg-primary/10 font-medium text-primary hover:bg-primary/20"
          : "",
        hasEvent && isPastDay
          ? "cursor-pointer bg-muted/30 text-muted-foreground/60 hover:bg-muted/50 hover:text-muted-foreground"
          : "",
        !hasEvent ? "text-muted-foreground/70 hover:bg-secondary/40 hover:text-foreground" : "",
        isToday ? "outline outline-1 outline-primary" : "",
      ].join(" ")}
    >
      <span>{day}</span>
      {hasEvent && (
        <span
          className={["mt-1 h-1.5 w-1.5 rounded-full", isPastDay ? "bg-muted-foreground/40" : "bg-primary"].join(" ")}
        />
      )}

      {hasEvent && pos && (
        <div
          className="pointer-events-auto fixed z-50 max-h-[60vh] overflow-y-auto rounded-sm border border-border bg-card p-4 text-left shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] animate-fade-in"
          style={{
            left: pos.left,
            top: pos.top,
            width: `min(17.5rem, calc(100vw - 1.5rem))`,
          }}
        >
          <div
            className="absolute -top-1 h-2 w-2 rotate-45 border-l border-t border-border bg-card"
            style={{ left: pos.arrow - 4 }}
          />

          <ul className="space-y-4">
            {events.map((c, i) => {
              const isPast = c.when.getTime() < today.getTime();
              return (
                <li key={`${c.date}-${i}`} className={i > 0 ? "border-t border-border pt-4" : ""}>
                  <p
                    className={[
                      "text-[0.6875rem] uppercase tracking-[0.24em]",
                      isPast ? "text-muted-foreground" : "text-primary",
                    ].join(" ")}
                  >
                    {formatLongDate(c.when)}
                    {c.time ? ` · ${c.time}` : ""}
                    {isPast ? " · Archived" : ""}
                  </p>
                  <p className="mt-1 font-display text-lg text-foreground">{c.venue}</p>
                  <p className="text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {c.town}, {c.country}
                  </p>
                  <ConcertLinks concert={c} today={today} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}



type Props = {
  concerts: DatedConcert[];
  today: Date;
  /** Month the calendar opens on; defaults to the viewer's current month. */
  initialMonth?: Date;
};

export function ConcertCalendar({ concerts, today, initialMonth }: Props) {
  const [cursor, setCursor] = useState<Date>(
    () => initialMonth ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const upcomingConcerts = useMemo(
    () => concerts.filter((c) => c.when.getTime() >= today.getTime()),
    [concerts, today],
  );

  // Group every concert (upcoming + archived) so past concerts also appear on
  // the calendar grid, rendered as disabled/muted dots with a hover card.
  const byDay = useMemo(() => {
    const map = new Map<string, DatedConcert[]>();
    for (const c of concerts) {
      const key = `${c.when.getFullYear()}-${c.when.getMonth()}-${c.when.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), c]);
    }
    return map;
  }, [concerts]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = (monthStart.getDay() + 6) % 7; // Monday-first grid

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthConcerts = upcomingConcerts
    .filter((c) => monthKey(c.when) === monthKey(monthStart))
    .sort((a, b) => a.when.getTime() - b.when.getTime());

  const shift = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <div className="grid w-full min-w-0 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="shrink-0 cursor-pointer text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Prev
          </button>
          <h3 className="min-w-0 truncate text-center font-display text-xl text-foreground sm:text-2xl md:text-3xl">
            {monthLabel(monthStart)}
          </h3>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="shrink-0 cursor-pointer text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary"
          >
            Next →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-px text-center">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="pb-2 text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {d.slice(0, 2)}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`e-${i}`} className="aspect-square" />;
            const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
            const events = byDay.get(`${date.getFullYear()}-${date.getMonth()}-${day}`) ?? [];

            return (
              <CalendarDay
                key={day}
                day={day}
                date={date}
                events={events}
                today={today}
              />
            );
          })}
        </div>


        <p className="mt-4 flex flex-wrap items-center gap-5 text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Upcoming
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" /> Archived
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 outline outline-1 outline-primary" /> Today
          </span>
        </p>
      </div>

      <div>
        <p className="eyebrow">{monthLabel(monthStart)}</p>
        {monthConcerts.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No upcoming concerts listed this month.
          </p>
        ) : (
          <ul className="mt-6 border-t border-border">
            {monthConcerts.map((c, i) => (
              <li
                key={`${c.date}-${i}`}
                className="border-b border-border py-5 transition-colors duration-200 hover:bg-secondary/60"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                    {c.date}
                    {c.time ? ` · ${c.time}` : ""}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                    Upcoming
                  </span>
                </div>
                <p className="mt-2 font-display text-xl text-foreground">{c.venue}</p>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {c.town}, {c.country}
                </p>
                <ConcertLinks concert={c} today={today} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
