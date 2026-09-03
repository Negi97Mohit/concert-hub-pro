import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ConcertLinks } from "@/components/ConcertLinks";
import { formatLongDate, splitConcerts, useToday } from "@/lib/concerts";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SiteImage } from "@/components/SiteImage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alexandra Dovgan — Pianist" },
      {
        name: "description",
        content:
          "Official site of pianist Alexandra Dovgan: biography, 2026/27 concert schedule, photogallery, media and press.",
      },
      { property: "og:title", content: "Alexandra Dovgan — Pianist" },
      {
        property: "og:description",
        content:
          "Biography, concert schedule, photogallery, media and press of pianist Alexandra Dovgan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const today = useToday();
  const {
    artist: ARTIST,
    bioIntro: BIO_INTRO,
    concerts: CONCERTS,
    media: MEDIA,
    news: NEWS,
    photos: PHOTOS,
    quotes: QUOTES,
    reviews: REVIEWS,
    images,
  } = useSiteContent();
  const { upcoming } = splitConcerts(CONCERTS, today);

  return (
    <div className="min-h-screen">
      <SiteHeader compact />

      <section className="mx-auto grid min-h-[70vh] max-w-[1400px] items-center gap-10 px-6 pb-20 md:grid-cols-2 md:px-12 md:pb-28">
        <div className="fade-up my-auto flex flex-col justify-center">
          <h1 className="font-display text-6xl leading-[0.95] text-primary md:text-8xl lg:text-9xl">
            {ARTIST.first}
            <span className="mt-2 block italic">{ARTIST.last}</span>
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <span className="h-px w-14 bg-primary/60" />
            <span className="eyebrow">Pianist</span>
          </div>
        </div>
        <figure className="fade-up">
          <SiteImage
            image={images["homeHero"]}
            alt={ARTIST.name}
            loading="eager"
            className="aspect-[4/5] w-full shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)]"
          />
        </figure>
      </section>

      <div className="mx-auto max-w-[1400px] border-t border-border px-6 py-4 md:px-12">
        <span className="eyebrow">{ARTIST.season}</span>
      </div>

      {/* Biography */}
      <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-24 md:grid-cols-[1fr_1.1fr] md:px-12">
        <figure>
          <SiteImage
            image={images["homeBio"]}
            alt={`${ARTIST.name} in performance`}
            className="aspect-[4/5] w-full"
          />
          <figcaption className="mt-3 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            Photography by Vladimir Volkov
          </figcaption>
        </figure>
        <div>
          <p className="eyebrow">Biography / Piano</p>
          <h2 className="mt-6 font-display text-4xl leading-tight text-foreground md:text-5xl">
            A rare depth of concentration at the keyboard.
          </h2>
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">{BIO_INTRO}</p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Alexandra's musical development has been greatly influenced by her creative
            communication with one of the most outstanding pianists of our time, Grigory Sokolov.
          </p>
          <Link to="/bio" className="rule-link mt-10 inline-block">
            Read the full biography →
          </Link>
        </div>
      </section>

      {/* Schedule */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-12">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">Concerts</h2>
        <p className="mt-3 text-sm text-muted-foreground">{ARTIST.season}</p>
        <ul className="mt-10 border-t border-border">
          {upcoming.slice(0, 5).map((c, i) => (
            <li
              key={`${c.date}-${i}`}
              className="grid gap-2 border-b border-border py-6 md:grid-cols-[140px_1fr_240px] md:items-baseline"
            >
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                {formatLongDate(c.when)}
              </span>
              <span>
                <span className="font-display text-2xl text-foreground">{c.venue}</span>
                <ConcertLinks concert={c} today={today} />
              </span>
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground md:text-right">
                {c.town}, {c.country}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/season" className="rule-link mt-10 inline-block">
          View the calendar & archive →
        </Link>
      </section>

      {/* Gallery strip */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24 md:px-12">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">Photogallery</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {PHOTOS.slice(1, 5).map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.caption}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
        <Link to="/gallery" className="rule-link mt-10 inline-block">
          All photos →
        </Link>
      </section>

      {/* Watch */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24 md:px-12">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">Watch</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {MEDIA.filter((m) => m.youtubeId)
            .slice(0, 2)
            .map((m) => (
              <div key={m.url}>
                <div className="aspect-video w-full bg-secondary">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${m.youtubeId}`}
                    title={m.title}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{m.title}</p>
              </div>
            ))}
        </div>
        <Link to="/media" className="rule-link mt-10 inline-block">
          All videos →
        </Link>
      </section>

      {/* Quotes */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24 md:px-12">
        <div className="grid gap-12 md:grid-cols-2">
          {QUOTES.map((q) => (
            <blockquote key={q.author} className="border-l border-primary/40 pl-6">
              <p className="font-display text-2xl italic leading-snug text-foreground">
                “{q.text}”
              </p>
              <footer className="mt-5 text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                {q.author} / {q.year}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Press */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24 md:px-12">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">Selected press</h2>
        <ul className="mt-10 space-y-6">
          {REVIEWS.slice(0, 3).map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer" className="group block">
                <p className="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
                  “{r.title}”
                </p>
                <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {r.place} · {r.outlet} / {r.date}
                </p>
              </a>
            </li>
          ))}
        </ul>
        <Link to="/press" className="rule-link mt-10 inline-block">
          All press →
        </Link>
      </section>

      {/* News */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24 md:px-12">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">News</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
          {NEWS.map((n) => (
            <a key={n.url} href={n.url} target="_blank" rel="noreferrer" className="group contents">
              <img src={n.image} alt={n.title} loading="lazy" className="w-full object-cover" />
              <p className="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
                {n.title}
              </p>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
