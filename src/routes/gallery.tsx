import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useSiteContent } from "@/hooks/useSiteContent";
import { fitClass } from "@/lib/image-slots";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photogallery — Alexandra Dovgan, Pianist" },
      {
        name: "description",
        content:
          "Official photogallery of pianist Alexandra Dovgan, photographed by Vladimir Volkov.",
      },
      { property: "og:title", content: "Photogallery — Alexandra Dovgan" },
      {
        property: "og:description",
        content: "Press photographs of pianist Alexandra Dovgan by Vladimir Volkov.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { photos: PHOTOS } = useSiteContent();
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading
        eyebrow="Photogallery"
        title="Photographs"
        lead="All press photographs © Vladimir Volkov."
      />

      <div className="mx-auto max-w-[1400px] columns-1 gap-6 px-6 sm:columns-2 lg:columns-3 md:px-12">
        {PHOTOS.map((p) => (
          <figure key={p.src} className="mb-6 break-inside-avoid">
            <a href={p.src} target="_blank" rel="noreferrer">
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className={`w-full ${fitClass(p.fit)}`}
              />
            </a>
            <figcaption className="mt-2 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}
