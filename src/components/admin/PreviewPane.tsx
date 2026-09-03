import { useEffect, useRef, useState } from "react";
import { DRAFT_MESSAGE } from "@/hooks/useSiteContent";
import type { SiteContent } from "@/lib/site-content";

export const PREVIEW_PAGES = [
  { label: "Home", path: "/" },
  { label: "Biography", path: "/bio" },
  { label: "Photogallery", path: "/gallery" },
  { label: "Season", path: "/season" },
  { label: "Media", path: "/media" },
  { label: "Press", path: "/press" },
  { label: "Contact", path: "/contact" },
] as const;

type Props = {
  content: SiteContent;
  path: string;
  onPathChange: (path: string) => void;
};

/**
 * Live preview of the public website inside the admin page. Unsaved content is
 * pushed into the iframe with postMessage, so every edit is visible instantly.
 */
export function PreviewPane({ content, path, onPathChange }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => setReady(false), [path]);

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      frameRef.current?.contentWindow?.postMessage(
        { type: DRAFT_MESSAGE, content },
        window.location.origin,
      );
    }, 150);
    return () => clearTimeout(id);
  }, [content, ready, path]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <select
          className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
        >
          {PREVIEW_PAGES.map((p) => (
            <option key={p.path} value={p.path}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={`cursor-pointer rounded-sm px-2 py-1 text-[0.625rem] uppercase tracking-[0.18em] ${
                device === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
          Live preview — unsaved
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-muted p-3">
        <iframe
          ref={frameRef}
          key={path}
          src={path}
          title="Website preview"
          onLoad={() => setReady(true)}
          className={`mx-auto h-full min-h-[70vh] border border-border bg-background ${
            device === "mobile" ? "w-[390px]" : "w-full"
          }`}
        />
      </div>
    </div>
  );
}
