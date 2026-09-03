import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press — Alexandra Dovgan, Pianist" },
      {
        name: "description",
        content:
          "Reviews of pianist Alexandra Dovgan from Milan, Erl, Madrid, Tokyo, Barcelona, Vienna, Munich, Brescia and Bergamo.",
      },
      { property: "og:title", content: "Press — Alexandra Dovgan" },
      {
        property: "og:description",
        content: "Selected international reviews of pianist Alexandra Dovgan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PressPage,
});

const STEP = 10;

function PressPage() {
  const { quotes: QUOTES, reviews: REVIEWS } = useSiteContent();
  const [count, setCount] = useState(STEP);
  const visible = REVIEWS.slice(0, count);
  const remaining = REVIEWS.length - visible.length;

  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading eyebrow="Press" title="Reviews" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-2">
          {QUOTES.map((q) => (
            <blockquote key={q.author} className="border-l border-primary/40 pl-6">
              <p className="font-display text-2xl italic leading-snug text-foreground">
                “{q.text}”
              </p>
              <footer className="mt-4 text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                {q.author} / {q.year}
              </footer>
            </blockquote>
          ))}
        </div>

        <ul className="mt-20 border-t border-border">
          {visible.map((r) => (
            <li
              key={r.url}
              className="-mx-4 border-b border-border px-4 transition-colors duration-200 hover:bg-secondary/60"
            >
              <a href={r.url} target="_blank" rel="noreferrer" className="group block py-6">
                <p className="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
                  “{r.title}”
                </p>
                <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {r.date} · {r.place} · {r.outlet}
                </p>
              </a>
            </li>
          ))}
        </ul>

        {remaining > 0 ? (
          <button
            type="button"
            onClick={() => setCount((c) => c + STEP)}
            className="rule-link mt-10 inline-block cursor-pointer"
          >
            Load more reviews ({remaining}) →
          </button>
        ) : (
          <p className="mt-10 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            All {REVIEWS.length} reviews shown
          </p>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
