import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SiteImage } from "@/components/SiteImage";

export const Route = createFileRoute("/bio")({
  head: () => ({
    meta: [
      { title: "Biography — Alexandra Dovgan, Pianist" },
      {
        name: "description",
        content:
          "Full biography of pianist Alexandra Dovgan, born 2007, prize-winner of the Grand Piano Competition Moscow, in English, Italian, German and French.",
      },
      { property: "og:title", content: "Biography — Alexandra Dovgan" },
      {
        property: "og:description",
        content: "The complete biography of pianist Alexandra Dovgan, in four languages.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BioPage,
});

function BioPage() {
  const {
    bioDate: BIO_DATE,
    bioLanguages: BIO_LANGUAGES,
    bioParagraphs: BIO_PARAGRAPHS,
    quotes: QUOTES,
    images,
  } = useSiteContent();
  const [lang, setLang] = useState("ENG");
  const active = BIO_LANGUAGES.find((l) => l.label === lang) ?? BIO_LANGUAGES[0];

  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading eyebrow="Biography / Piano" title="Biography" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Left column — portrait, sticky on large screens */}
          <aside className="lg:sticky lg:top-16 lg:self-start">
            <SiteImage
              image={images["bioPortrait"]}
              alt="Alexandra Dovgan portrait"
              loading="eager"
              className="aspect-[3/4] w-full"
            />
            <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
              Photography by Vladimir Volkov
            </p>

            <div className="mt-10 border-t border-border pt-6">
              <p className="eyebrow">Download biography</p>
              <div className="mt-4 flex flex-col gap-2">
                {BIO_LANGUAGES.map((l) => (
                  <a
                    key={l.pdf}
                    href={l.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex w-fit cursor-pointer items-baseline gap-3 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="text-primary/70">[{l.label}]</span>
                    <span className="relative">
                      {l.name} (PDF)
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-primary transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Right column — language switch + text */}
          <div>
            <div className="flex flex-wrap items-center gap-8 border-b border-border pb-4">
              {BIO_LANGUAGES.map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => setLang(l.label)}
                  aria-pressed={l.label === lang}
                  className={`group relative cursor-pointer pb-1 text-[0.6875rem] uppercase tracking-[0.24em] transition-colors ${
                    l.label === lang ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-[1px] left-0 h-px w-full bg-primary transition-transform duration-300 ${
                      l.label === lang
                        ? "scale-x-100"
                        : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
                    }`}
                  />
                </button>
              ))}
            </div>

            {lang === "ENG" ? (
              <div className="mt-10 max-w-[62ch] space-y-7">
                <p className="font-display text-2xl leading-snug text-foreground md:text-[1.75rem]">
                  {BIO_PARAGRAPHS[0]}
                </p>
                {BIO_PARAGRAPHS.slice(1).map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-[0.95rem] leading-[1.9] text-muted-foreground"
                  >
                    {p}
                  </p>
                ))}
                <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                  {BIO_DATE}
                </p>
              </div>
            ) : (
              <div className="mt-10 max-w-[62ch] space-y-7">
                <p className="font-display text-2xl leading-snug text-foreground md:text-[1.75rem]">
                  {active!.excerpt}
                </p>
                <a
                  href={active!.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="rule-link cursor-pointer"
                >
                  {active!.name} — full biography (PDF) →
                </a>
              </div>
            )}

            <div className="mt-16 space-y-10 border-t border-border pt-12">
              {QUOTES.map((q) => (
                <blockquote key={q.author} className="max-w-[62ch] border-l border-primary/40 pl-6">
                  <p className="font-display text-xl italic leading-snug text-foreground md:text-2xl">
                    “{q.text}”
                  </p>
                  <footer className="mt-4 text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                    {q.author} / {q.year}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2">
          <SiteImage
            image={images["bioLowerLeft"]}
            alt="Alexandra Dovgan on stage"
            className="aspect-[4/3] w-full"
          />
          <SiteImage
            image={images["bioLowerRight"]}
            alt="Alexandra Dovgan at the piano"
            className="aspect-[4/3] w-full"
          />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
