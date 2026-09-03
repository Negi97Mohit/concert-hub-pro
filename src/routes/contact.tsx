import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { CONTACTS } from "@/data/dovgan";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Management — Alexandra Dovgan" },
      {
        name: "description",
        content:
          "Booking and management contacts for pianist Alexandra Dovgan: AMC Artists Management Company Verona and local representation.",
      },
      { property: "og:title", content: "Contact & Management — Alexandra Dovgan" },
      {
        property: "og:description",
        content:
          "Booking and management contacts for pianist Alexandra Dovgan, worldwide and local representation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const line = "text-base leading-relaxed text-muted-foreground";
const link = "text-primary transition-opacity hover:opacity-70";

function Contact() {
  const g = CONTACTS.general;

  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading
        eyebrow="Contact"
        title="Management"
        lead="For concert bookings, press enquiries and general information, please contact the artist's management."
      />

      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 md:grid-cols-2 md:px-12">
        <section className="border-t border-border pt-8">
          <p className="eyebrow">{g.label}</p>
          <h2 className="mt-4 font-display text-3xl text-foreground md:text-4xl">{g.name}</h2>
          <p className={`mt-4 ${line}`}>{g.company}</p>
          <p className={line}>{g.address}</p>
          <ul className="mt-6 space-y-2">
            <li className={line}>
              Mobile{" "}
              <a className={link} href={`tel:${g.mobile.replace(/\s/g, "")}`}>
                {g.mobile}
              </a>
            </li>
            <li className={line}>
              Office{" "}
              <a className={link} href={`tel:${g.phone.replace(/\s/g, "")}`}>
                {g.phone}
              </a>
            </li>
            <li className={line}>
              <a className={link} href={`mailto:${g.email}`}>
                {g.email}
              </a>
            </li>
            <li className={line}>
              <a className={link} href={`mailto:${g.officeEmail}`}>
                {g.officeEmail}
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-12">
          {CONTACTS.locals.map((c) => (
            <div key={c.email} className="border-t border-border pt-8">
              <p className="eyebrow">{c.role}</p>
              <h2 className="mt-4 font-display text-3xl text-foreground md:text-4xl">{c.name}</h2>
              <p className={`mt-4 ${line}`}>{c.company}</p>
              <ul className="mt-6 space-y-2">
                <li className={line}>
                  <a className={link} href={`tel:${c.phone.replace(/\s/g, "")}`}>
                    {c.phone}
                  </a>
                </li>
                <li className={line}>
                  <a className={link} href={`mailto:${c.email}`}>
                    {c.email}
                  </a>
                </li>
                {c.website ? (
                  <li className={line}>
                    <a className={link} href={c.website} target="_blank" rel="noreferrer">
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
