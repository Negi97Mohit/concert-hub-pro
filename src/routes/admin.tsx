import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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

/* ------------------------------------------------------------------ */
/* Small form primitives                                               */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean | undefined;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-28`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

type FieldSpec = { key: string; label: string; multiline?: boolean };

function ObjectEditor({
  item,
  fields,
  onChange,
}: {
  item: Record<string, unknown>;
  fields: FieldSpec[];
  onChange: (next: Record<string, unknown>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
          <Field
            label={f.label}
            multiline={f.multiline}
            value={String(item[f.key] ?? "")}
            onChange={(v) => onChange({ ...item, [f.key]: v })}
          />
        </div>
      ))}
    </div>
  );
}

function ListEditor({
  items,
  fields,
  onChange,
  labelFor,
}: {
  items: Record<string, unknown>[];
  fields: FieldSpec[];
  onChange: (next: Record<string, unknown>[]) => void;
  labelFor?: (item: Record<string, unknown>, index: number) => string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const update = (index: number, next: Record<string, unknown>) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [row] = copy.splice(index, 1);
    copy.splice(target, 0, row!);
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-sm border border-border">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <button
              type="button"
              className="flex-1 cursor-pointer text-left text-sm"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {labelFor ? labelFor(item, i) : `Item ${i + 1}`}
            </button>
            <button type="button" className="cursor-pointer px-2 text-xs" onClick={() => move(i, -1)}>
              ↑
            </button>
            <button type="button" className="cursor-pointer px-2 text-xs" onClick={() => move(i, 1)}>
              ↓
            </button>
            <button
              type="button"
              className="cursor-pointer px-2 text-xs text-destructive"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              Delete
            </button>
          </div>
          {open === i && (
            <div className="border-t border-border p-3">
              <ObjectEditor item={item} fields={fields} onChange={(next) => update(i, next)} />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.2em]"
        onClick={() => {
          const blank: Record<string, unknown> = {};
          fields.forEach((f) => (blank[f.key] = ""));
          onChange([blank, ...items]);
          setOpen(0);
        }}
      >
        Add new
      </button>
    </div>
  );
}

function StringListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((text, i) => (
        <div key={i} className="rounded-sm border border-border p-3">
          <textarea
            className={`${inputClass} min-h-28`}
            value={text}
            onChange={(e) => {
              const copy = [...items];
              copy[i] = e.target.value;
              onChange(copy);
            }}
          />
          <button
            type="button"
            className="mt-2 cursor-pointer text-xs text-destructive"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            Delete paragraph
          </button>
        </div>
      ))}
      <button
        type="button"
        className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.2em]"
        onClick={() => onChange([...items, ""])}
      >
        Add paragraph
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TABS = [
  "Artist",
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void status()
      .then((r) => setAuthed(r.authed))
      .catch(() => setAuthed(false));
  }, [status]);

  useEffect(() => {
    if (!authed) return;
    void load()
      .then((r) => setContent(mergeContent(JSON.parse(r.json))))
      .catch((e) => setMessage(e instanceof Error ? e.message : "Could not load site content"));
  }, [authed, load]);

  const patch = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

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

  const onUpload = async (file: File) => {
    setMessage("Uploading…");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
    try {
      const { url } = await upload({ data: { fileName: file.name, dataUrl } });
      patch("photos", [{ src: url, caption: file.name }, ...content.photos]);
      setMessage("Image uploaded — remember to save.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
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
            const res = await login({ data: { username, password } });
            if (res.ok) setAuthed(true);
            else setError("Incorrect username or password.");
          }}
        >
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
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded-sm px-3 py-1.5 text-xs uppercase tracking-[0.18em] ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-[1000px] px-6 py-8">
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

        {tab === "Biography" && (
          <div className="space-y-8">
            <Field
              label="Short intro"
              multiline
              value={content.bioIntro}
              onChange={(v) => patch("bioIntro", v)}
            />
            <Field label="Bio date" value={content.bioDate} onChange={(v) => patch("bioDate", v)} />
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
                fields={[
                  { key: "label", label: "Code (ENG)" },
                  { key: "name", label: "Language name" },
                  { key: "excerpt", label: "Excerpt", multiline: true },
                  { key: "pdf", label: "PDF URL" },
                ]}
                onChange={(v) => patch("bioLanguages", v as unknown as SiteContent["bioLanguages"])}
              />
            </section>
          </div>
        )}

        {tab === "Quotes" && (
          <ListEditor
            items={content.quotes as unknown as Record<string, unknown>[]}
            labelFor={(i) => String(i["author"] ?? "")}
            fields={[
              { key: "text", label: "Quote", multiline: true },
              { key: "author", label: "Author" },
              { key: "year", label: "Year" },
            ]}
            onChange={(v) => patch("quotes", v as unknown as SiteContent["quotes"])}
          />
        )}

        {tab === "Photos" && (
          <div className="space-y-6">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="cursor-pointer rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]"
                onClick={() => fileRef.current?.click()}
              >
                Upload photo
              </button>
            </div>
            <ListEditor
              items={content.photos as unknown as Record<string, unknown>[]}
              labelFor={(i) => String(i["caption"] ?? i["src"] ?? "")}
              fields={[
                { key: "src", label: "Image URL" },
                { key: "caption", label: "Caption" },
              ]}
              onChange={(v) => patch("photos", v as unknown as SiteContent["photos"])}
            />
          </div>
        )}

        {tab === "Concerts" && (
          <ListEditor
            items={content.concerts as unknown as Record<string, unknown>[]}
            labelFor={(i) => `${String(i["date"] ?? "")} — ${String(i["town"] ?? "")}`}
            fields={[
              { key: "date", label: "Date (DD/MM/YYYY)" },
              { key: "day", label: "Day (Wed)" },
              { key: "time", label: "Time (20:00)" },
              { key: "town", label: "Town" },
              { key: "country", label: "Country" },
              { key: "venue", label: "Venue" },
              { key: "infoUrl", label: "More info URL" },
              { key: "ticketsUrl", label: "Tickets URL" },
            ]}
            onChange={(v) => patch("concerts", v as unknown as SiteContent["concerts"])}
          />
        )}

        {tab === "News" && (
          <ListEditor
            items={content.news as unknown as Record<string, unknown>[]}
            labelFor={(i) => String(i["title"] ?? "")}
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
    </div>
  );
}
