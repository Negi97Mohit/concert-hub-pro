import { useEffect, useState } from "react";
import type { Concert } from "@/data/dovgan";

export type DatedConcert = Concert & { when: Date };

/**
 * Returns the "more information" link for a concert. Falls back to a dummy
 * placeholder URL when no explicit `infoUrl` is set on the concert entry.
 */
export function concertInfoUrl(concert: Concert): string {
  return concert.infoUrl ?? "https://www.amcmusic.com/artists/alexandra-dovgan/";
}

/**
 * Returns the ticketing link for a concert. Falls back to a dummy
 * placeholder URL (clearly marked as a placeholder) when no explicit
 * `ticketsUrl` is set on the concert entry.
 */
export function concertTicketsUrl(concert: Concert): string {
  return (
    concert.ticketsUrl ??
    `https://tickets.example.com/?event=${encodeURIComponent(`${concert.venue} — ${concert.date}`)}`
  );
}

/** Parses the "DD/MM/YYYY" format used in the concert data. */
export function parseConcertDate(date: string): Date {
  const [d, m, y] = date.split("/").map((n) => Number(n));
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Returns the viewer's current day, re-evaluated in the browser so the
 * archive always reflects the visitor's local date (not build/server time).
 */
export function useToday(): Date {
  const [today, setToday] = useState<Date>(() => startOfToday());

  useEffect(() => {
    setToday(startOfToday());
    const id = setInterval(
      () =>
        setToday((prev) => {
          const next = startOfToday();
          return next.getTime() === prev.getTime() ? prev : next;
        }),
      60_000,
    );
    return () => clearInterval(id);
  }, []);

  return today;
}

export function withDates(concerts: Concert[]): DatedConcert[] {
  return concerts.map((c) => ({ ...c, when: parseConcertDate(c.date) }));
}

export function splitConcerts(concerts: Concert[], today: Date) {
  const all = withDates(concerts);
  const upcoming = all
    .filter((c) => c.when.getTime() >= today.getTime())
    .sort((a, b) => a.when.getTime() - b.when.getTime());
  const past = all
    .filter((c) => c.when.getTime() < today.getTime())
    .sort((a, b) => b.when.getTime() - a.when.getTime());
  return { upcoming, past };
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthLabel(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatLongDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/** Days until a concert, from the viewer's today. */
export function daysUntil(when: Date, today: Date): number {
  return Math.round((when.getTime() - today.getTime()) / 86_400_000);
}
