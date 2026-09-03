import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media — Alexandra Dovgan, Pianist" },
      {
        name: "description",
        content:
          "Videos and broadcasts of pianist Alexandra Dovgan: Tonhalle Orchestra Zurich with Paavo Järvi, Mendelssohn Piano Concerto No. 1, TF1, France Inter and medici.tv.",
      },
      { property: "og:title", content: "Media — Alexandra Dovgan" },
      {
        property: "og:description",
        content: "Selected video, radio and television appearances of pianist Alexandra Dovgan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  const { media: MEDIA } = useSiteContent();
  const videos = MEDIA.filter((m) => m.youtubeId);
  const links = MEDIA.filter((m) => !m.youtubeId);

  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading eyebrow="Media" title="Watch & listen" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-10 md:grid-cols-2">
          {videos.map((m) => (
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

        <h2 className="mt-20 font-display text-4xl text-foreground">Broadcasts & features</h2>
        <ul className="mt-8 border-t border-border">
          {links.map((m) => (
            <li key={m.url} className="border-b border-border py-6">
              <a href={m.url} target="_blank" rel="noreferrer" className="group block">
                <p className="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
                  {m.title}
                </p>
                <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {m.source}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <SiteFooter />
    </div>
  );
}
