import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/bio", label: "Biography" },
  { to: "/season", label: "Concerts" },
  { to: "/gallery", label: "Photogallery" },
  { to: "/media", label: "Media" },
  { to: "/press", label: "Press" },
  { to: "/contact", label: "Contact" },
] as const;

export function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      setIsScrolling(true);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isVisible = !isScrolling || open;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-4 bottom-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-background/90 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-md transition-all duration-300 hover:border-emerald-400 sm:right-8 sm:bottom-8 sm:h-14 sm:w-14 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-90 opacity-0"
        }`}
      >
        <span className="relative block h-3 w-5">
          <span
            className={`absolute left-0 h-0.5 w-full bg-foreground transition-all duration-300 ${
              open ? "top-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 h-0.5 w-full bg-foreground transition-all duration-300 ${
              open ? "top-1/2 -rotate-45" : "top-full"
            }`}
          />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-[60] bg-background/80 backdrop-blur-2xl transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full w-full items-center justify-center px-6">
          <ul className="flex w-full max-w-md flex-col items-center gap-4 text-center sm:gap-6">
            {NAV.map((item, i) => (
              <li
                key={item.to}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                className={`transition-all duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="font-display text-3xl leading-none text-foreground transition-colors hover:text-primary sm:text-5xl"
                  activeProps={{ className: "italic text-primary" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const { artist: ARTIST } = useSiteContent();
  return (
    <>
      <FloatingMenu />
      {compact ? null : (
        <header className="mx-auto max-w-[1400px] px-6 pt-12 pb-4 md:px-12 md:pt-16">
          <Link to="/" className="block">
            <h2 className="font-display text-4xl leading-[0.9] tracking-tight text-primary sm:text-6xl md:text-7xl">
              Alexandra<span className="block italic">Dovgan</span>
            </h2>
            <span className="mt-4 block text-[0.6875rem] uppercase tracking-[0.34em] text-muted-foreground">
              {ARTIST.instrument === "Piano" ? "Pianist" : ARTIST.instrument}
            </span>
          </Link>
        </header>
      )}
    </>
  );
}

export function SiteFooter() {
  const { artist: ARTIST } = useSiteContent();
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-10 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-12">
        <span>
          {ARTIST.name} — {ARTIST.instrument}
        </span>
        <span>General management · AMC — Artists Management Company, Verona</span>
        <a
          href="mailto:office@amcmusic.com"
          className="text-primary transition-opacity hover:opacity-70"
        >
          office@amcmusic.com
        </a>
      </div>
    </footer>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="fade-up mx-auto max-w-[1400px] px-6 pt-16 pb-14 md:px-12 md:pt-24">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] text-primary md:text-7xl">
        {title}
      </h1>
      {lead ? (
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">{lead}</p>
      ) : null}
    </div>
  );
}
