import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminLogin,
  adminLogout,
  adminStatus,
  loadSiteContent,
  saveSiteContent,
  uploadSiteImage,
} from "@/lib/admin.functions";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "@/lib/site-content";
import { SITE_CONTENT_KEY } from "@/hooks/useSiteContent";
import {
  Field,
  ListEditor,
  ObjectEditor,
  StringListEditor,
  inputClass,
} from "@/components/admin/primitives";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { ImageSlotEditor } from "@/components/admin/ImageSlotEditor";
import { PreviewPane } from "@/components/admin/PreviewPane";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Site administration" },
      { name: "description", content: "Private content administration." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  "Artist",
  "Images",
  "Biography",
  "Quotes",
  "Photos",
  "Concerts",
  "News",
  "Media",
  "Press",
  "Contact",
  "Raw JSON",
] as const;
type Tab = (typeof TABS)[number];

/** Which public page the preview should open when a tab is selected. */
const TAB_PREVIEW: Record<Tab, string> = {
  Artist: "/",
  Images: "/",
  Biography: "/bio",
  Quotes: "/",
  Photos: "/gallery",
  Concerts: "/season",
  News: "/",
  Media: "/media",
  Press: "/press",
  Contact: "/contact",
  "Raw JSON": "/",
};

function AdminPage() {
  const status = useServerFn(adminStatus);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const load = useServerFn(loadSiteContent);
  const save = useServerFn(saveSiteContent);
  const upload = useServerFn(uploadSiteImage);
  const queryClient = useQueryClient();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [tab, setTab] = useState<Tab>("Artist");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewPath, setPreviewPath] = useState("/");

  useEffect(() => {
    void status()
      .then((r) => setAuthed(r.authed))
      .catch(() => setAuthed(false));
  }, [status]);

  useEffect(() => {
    if (!authed) return;
    void load()
      .then((r) => setContent(mergeContent(JSON.parse(r.json))))
      .catch((e) => {
        if (e instanceof Error && e.message.includes("Unauthorized")) {
          setAuthed(false);
          setError("Your admin session expired. Please sign in again.");
          return;
        }
        setMessage(e instanceof Error ? e.message : "Could not load site content");
      });
  }, [authed, load]);

  const patch = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  const selectTab = (next: Tab) => {
    setTab(next);
    setPreviewPath(TAB_PREVIEW[next]);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await save({ data: { content: content as unknown as Record<string, unknown> } });
      await queryClient.invalidateQueries({ queryKey: SITE_CONTENT_KEY });
      setMessage("Saved — the website is updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    setMessage("Uploading…");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
    try {
      const { url } = await upload({ data: { fileName: file.name, dataUrl } });
      setMessage("Image uploaded — remember to save.");
      return url;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
      throw e;
    }
  };

  const rawJson = useMemo(() => JSON.stringify(content, null, 2), [content]);

  if (authed === null) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <form
          className="w-full max-w-sm space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              const res = await login({ data: { username, password } });
              if (res.ok) setAuthed(true);
              else setError("Incorrect username or password.");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed. Please verify admin credentials.");
            }
          }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            Home
          </Link>
          <h1 className="font-display text-3xl text-primary">Administration</h1>
          <Field label="Username" value={username} onChange={setUsername} />
          <label className="block">
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-sm bg-primary px-4 py-2 text-sm uppercase tracking-[0.2em] text-primary-foreground"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span aria-hidden="true">←</span>
          Home
        </Link>
        <h1 className="font-display text-2xl text-primary">Site administration</h1>
        <div className="ml-auto flex items-center gap-3">
          {message && <span className="text-xs text-muted-foreground">{message}</span>}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="cursor-pointer rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            className="cursor-pointer text-xs uppercase tracking-[0.2em] text-muted-foreground"
            onClick={async () => {
              await logout();
              setAuthed(false);
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-border px-6 py-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selectTab(t)}
            className={`cursor-pointer rounded-sm px-3 py-1.5 text-xs uppercase tracking-[0.18em] ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className={showPreview ? "grid gap-0 xl:grid-cols-2" : ""}>
        <main className="max-w-[1000px] px-6 py-8">
          {tab === "Artist" && (
            <ObjectEditor
              item={content.artist as unknown as Record<string, unknown>}
              fields={[
                { key: "name", label: "Full name" },
                { key: "first", label: "First name" },
                { key: "last", label: "Last name" },
                { key: "instrument", label: "Instrument" },
                { key: "season", label: "Season label" },
                { key: "source", label: "Source URL" },
              ]}
              onChange={(next) => patch("artist", next as unknown as SiteContent["artist"])}
            />
          )}

          {tab === "Images" && (
            <ImageSlotEditor
              images={content.images}
              photos={content.photos}
              onChange={(next) => patch("images", next)}
              onUpload={uploadFile}
            />
          )}

          {tab === "Biography" && (
            <div className="space-y-8">
              <Field
                label="Short intro"
                multiline
                value={content.bioIntro}
                onChange={(v) => patch("bioIntro", v)}
              />
              <Field
                label="Bio date"
                value={content.bioDate}
                onChange={(v) => patch("bioDate", v)}
              />
              <section>
                <h2 className="mb-3 text-sm uppercase tracking-[0.2em]">Biography paragraphs</h2>
                <StringListEditor
                  items={content.bioParagraphs}
                  onChange={(v) => patch("bioParagraphs", v)}
                />
              </section>
              <section>
                <h2 className="mb-3 text-sm uppercase tracking-[0.2em]">Languages</h2>
                <ListEditor
                  items={content.bioLanguages as unknown as Record<string, unknown>[]}
                  labelFor={(i) => String(i["name"] ?? i["label"] ?? "")}
                  addLabel="Add language"
                  fields={[
                    { key: "label", label: "Code (ENG)" },
                    { key: "name", label: "Language name" },
                    { key: "excerpt", label: "Excerpt", multiline: true },
                    { key: "pdf", label: "PDF URL" },
                  ]}
                  onChange={(v) =>
                    patch("bioLanguages", v as unknown as SiteContent["bioLanguages"])
                  }
                />
              </section>
            </div>
          )}

          {tab === "Quotes" && (
            <ListEditor
              items={content.quotes as unknown as Record<string, unknown>[]}
              labelFor={(i) => String(i["author"] ?? "")}
              addLabel="Add quote"
              fields={[
                { key: "text", label: "Quote", multiline: true },
                { key: "author", label: "Author" },
                { key: "year", label: "Year" },
              ]}
              onChange={(v) => patch("quotes", v as unknown as SiteContent["quotes"])}
            />
          )}

          {tab === "Photos" && (
            <PhotoManager
              photos={content.photos}
              onChange={(v) => patch("photos", v)}
              onUpload={uploadFile}
            />
          )}

          {tab === "Concerts" && (
            <ListEditor
              items={content.concerts as unknown as Record<string, unknown>[]}
              labelFor={(i) => `${String(i["date"] ?? "")} — ${String(i["town"] ?? "")}`}
              addLabel="Add concert"
              fields={[
                { key: "date", label: "Date (DD/MM/YYYY)" },
                { key: "day", label: "Day (Wed)" },
                { key: "time", label: "Time (20:00)" },
                { key: "town", label: "Town" },
                { key: "country", label: "Country" },
                { key: "venue", label: "Venue" },
                { key: "infoUrl", label: "More info URL" },
                { key: "ticketsUrl", label: "Tickets URL" },
                {
                  key: "infoText",
                  label: "More info description (shown in the More info panel)",
                  multiline: true,
                },
              ]}
              onChange={(v) => patch("concerts", v as unknown as SiteContent["concerts"])}
            />
          )}

          {tab === "News" && (
            <ListEditor
              items={content.news as unknown as Record<string, unknown>[]}
              labelFor={(i) => String(i["title"] ?? "")}
              addLabel="Add news item"
              fields={[
                { key: "title", label: "Title", multiline: true },
                { key: "image", label: "Image URL" },
                { key: "url", label: "Link URL" },
              ]}
              onChange={(v) => patch("news", v as unknown as SiteContent["news"])}
            />
          )}

          {tab === "Media" && (
            <ListEditor
              items={content.media as unknown as Record<string, unknown>[]}
              labelFor={(i) => String(i["title"] ?? "")}
              addLabel="Add media item"
              fields={[
                { key: "title", label: "Title", multiline: true },
                { key: "url", label: "URL" },
                { key: "youtubeId", label: "YouTube ID (optional)" },
                { key: "source", label: "Source" },
              ]}
              onChange={(v) => patch("media", v as unknown as SiteContent["media"])}
            />
          )}

          {tab === "Press" && (
            <div className="space-y-8">
              <Field
                label="All reviews URL"
                value={content.allReviewsUrl}
                onChange={(v) => patch("allReviewsUrl", v)}
              />
              <ListEditor
                items={content.reviews as unknown as Record<string, unknown>[]}
                labelFor={(i) => `${String(i["date"] ?? "")} — ${String(i["outlet"] ?? "")}`}
                addLabel="Add review"
                fields={[
                  { key: "date", label: "Date (DD/MM/YYYY)" },
                  { key: "place", label: "Place" },
                  { key: "outlet", label: "Outlet" },
                  { key: "title", label: "Title", multiline: true },
                  { key: "url", label: "URL" },
                ]}
                onChange={(v) => patch("reviews", v as unknown as SiteContent["reviews"])}
              />
            </div>
          )}

          {tab === "Contact" && (
            <div className="space-y-8">
              <section>
                <h2 className="mb-3 text-sm uppercase tracking-[0.2em]">General management</h2>
                <ObjectEditor
                  item={content.contacts.general as unknown as Record<string, unknown>}
                  fields={[
                    { key: "label", label: "Label" },
                    { key: "name", label: "Name" },
                    { key: "mobile", label: "Mobile" },
                    { key: "email", label: "Email" },
                    { key: "company", label: "Company" },
                    { key: "address", label: "Address" },
                    { key: "phone", label: "Phone" },
                    { key: "officeEmail", label: "Office email" },
                  ]}
                  onChange={(next) =>
                    patch("contacts", {
                      ...content.contacts,
                      general: next as unknown as SiteContent["contacts"]["general"],
                    })
                  }
                />
              </section>
              <section>
                <h2 className="mb-3 text-sm uppercase tracking-[0.2em]">Local representation</h2>
                <ListEditor
                  items={content.contacts.locals as unknown as Record<string, unknown>[]}
                  labelFor={(i) => String(i["name"] ?? "")}
                  addLabel="Add representative"
                  fields={[
                    { key: "name", label: "Name" },
                    { key: "role", label: "Role" },
                    { key: "company", label: "Company" },
                    { key: "website", label: "Website" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                  ]}
                  onChange={(v) =>
                    patch("contacts", {
                      ...content.contacts,
                      locals: v as unknown as SiteContent["contacts"]["locals"],
                    })
                  }
                />
              </section>
            </div>
          )}

          {tab === "Raw JSON" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Edit anything directly. Invalid JSON will not be applied.
              </p>
              <textarea
                className={`${inputClass} min-h-[60vh] font-mono text-xs`}
                defaultValue={rawJson}
                onBlur={(e) => {
                  try {
                    setContent(mergeContent(JSON.parse(e.target.value)));
                    setMessage("JSON applied — remember to save.");
                  } catch {
                    setMessage("Invalid JSON — changes ignored.");
                  }
                }}
              />
            </div>
          )}
        </main>

        {showPreview && (
          <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] border-l border-border xl:block">
            <PreviewPane
              content={content}
              path={previewPath}
              onPathChange={setPreviewPath}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
