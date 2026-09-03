import { useRef, useState } from "react";
import { inputClass } from "@/components/admin/primitives";
import { IMAGE_FITS, IMAGE_SLOTS, fitClass, type ImageFit, type ImageSetting } from "@/lib/image-slots";
import type { SitePhoto } from "@/lib/site-content";

type Props = {
  images: Record<string, ImageSetting>;
  photos: SitePhoto[];
  onChange: (next: Record<string, ImageSetting>) => void;
  onUpload: (file: File) => Promise<string>;
};

/**
 * Lets the editor choose the picture, framing mode and source for every named
 * image slot on the home and biography pages, with the recommended dimensions
 * shown next to each slot.
 */
export function ImageSlotEditor({ images, photos, onChange, onUpload }: Props) {
  const sections = Array.from(new Set(IMAGE_SLOTS.map((s) => s.section)));

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section}>
          <h2 className="mb-3 text-sm uppercase tracking-[0.2em]">{section}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {IMAGE_SLOTS.filter((s) => s.section === section).map((slot) => (
              <SlotCard
                key={slot.key}
                label={slot.label}
                dimensions={slot.dimensions}
                value={images[slot.key] ?? { src: "", fit: "cover" }}
                photos={photos}
                onChange={(next) => onChange({ ...images, [slot.key]: next })}
                onUpload={onUpload}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotCard({
  label,
  dimensions,
  value,
  photos,
  onChange,
  onUpload,
}: {
  label: string;
  dimensions: string;
  value: ImageSetting;
  photos: SitePhoto[];
  onChange: (next: ImageSetting) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      onChange({ ...value, src: await onUpload(file) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-sm border border-border p-3">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Recommended {dimensions}
        </p>
      </div>

      <div className="flex h-48 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {value.src ? (
          <img
            src={value.src}
            alt={label}
            className={`h-48 w-full ${fitClass(value.fit)}`}
          />
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            No image selected
          </span>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Choose from the photo library
        </span>
        <select
          className={inputClass}
          value={photos.some((p) => p.src === value.src) ? value.src : ""}
          onChange={(e) => onChange({ ...value, src: e.target.value })}
        >
          <option value="">— custom URL —</option>
          {photos.map((p, i) => (
            <option key={`${p.src}-${i}`} value={p.src}>
              {p.caption || `Photo ${i + 1}`}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Image URL
        </span>
        <input
          className={inputClass}
          value={value.src}
          onChange={(e) => onChange({ ...value, src: e.target.value })}
        />
      </label>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.2em]"
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "Uploading…" : "Upload new image"}
      </button>

      <label className="block">
        <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Framing
        </span>
        <select
          className={inputClass}
          value={value.fit ?? "cover"}
          onChange={(e) => onChange({ ...value, fit: e.target.value as ImageFit })}
        >
          {IMAGE_FITS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-muted-foreground">
          {IMAGE_FITS.find((f) => f.value === (value.fit ?? "cover"))?.hint}
        </span>
      </label>
    </div>
  );
}
