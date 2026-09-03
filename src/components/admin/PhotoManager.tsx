import { useRef, useState } from "react";
import { addButtonClass, inputClass, reorder } from "@/components/admin/primitives";
import { IMAGE_FITS, fitClass, type ImageFit } from "@/lib/image-slots";
import type { SitePhoto } from "@/lib/site-content";

type Props = {
  photos: SitePhoto[];
  onChange: (next: SitePhoto[]) => void;
  onUpload: (file: File) => Promise<string>;
};

/**
 * Photo library editor: thumbnails so the editor can see what they are
 * changing, drag-and-drop ordering, framing mode and per-photo uploads.
 */
export function PhotoManager({ photos, onChange, onUpload }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);

  const patch = (index: number, next: Partial<SitePhoto>) => {
    const copy = [...photos];
    copy[index] = { ...copy[index]!, ...next };
    onChange(copy);
  };

  const addBlank = () => onChange([{ src: "", caption: "", fit: "cover" }, ...photos]);

  const uploadInto = async (index: number, file: File) => {
    setBusy(index);
    try {
      const url = await onUpload(file);
      patch(index, { src: url, caption: photos[index]?.caption || file.name });
    } finally {
      setBusy(null);
    }
  };

  const uploadNew = async (file: File) => {
    setBusy("new");
    try {
      const url = await onUpload(file);
      onChange([{ src: url, caption: file.name, fit: "cover" }, ...photos]);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={addButtonClass} onClick={addBlank}>
          + Add photo
        </button>
        <input
          ref={newFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadNew(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="cursor-pointer rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]"
          onClick={() => newFileRef.current?.click()}
        >
          {busy === "new" ? "Uploading…" : "Upload photo"}
        </button>
        <p className="text-xs text-muted-foreground">
          Drag the thumbnails to reorder the photogallery. Recommended: at least 1200 px on the
          long edge.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo, i) => (
          <PhotoCard
            key={i}
            photo={photo}
            index={i}
            busy={busy === i}
            highlighted={overIndex === i && dragIndex !== null && dragIndex !== i}
            dragging={dragIndex === i}
            onDragStart={() => setDragIndex(i)}
            onDragOver={() => setOverIndex(i)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDrop={() => {
              if (dragIndex !== null) onChange(reorder(photos, dragIndex, i));
              setDragIndex(null);
              setOverIndex(null);
            }}
            onPatch={(next) => patch(i, next)}
            onDelete={() => onChange(photos.filter((_, j) => j !== i))}
            onFile={(file) => void uploadInto(i, file)}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  photo,
  index,
  busy,
  highlighted,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onPatch,
  onDelete,
  onFile,
}: {
  photo: SitePhoto;
  index: number;
  busy: boolean;
  highlighted: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onPatch: (next: Partial<SitePhoto>) => void;
  onDelete: () => void;
  onFile: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`space-y-3 rounded-sm border p-3 ${highlighted ? "border-primary" : "border-border"} ${
        dragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="cursor-grab select-none text-muted-foreground" aria-hidden="true">
          ⠿
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Photo {index + 1}
        </span>
        <button
          type="button"
          className="ml-auto cursor-pointer text-xs text-destructive"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      <div className="flex h-40 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.caption || "Photo preview"}
            className={`h-40 w-full ${fitClass(photo.fit)}`}
          />
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            No image yet
          </span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-[0.2em]"
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "Uploading…" : photo.src ? "Replace image" : "Upload image"}
      </button>

      <label className="block">
        <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Image URL
        </span>
        <input
          className={inputClass}
          value={photo.src}
          onChange={(e) => onPatch({ src: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Caption
        </span>
        <input
          className={inputClass}
          value={photo.caption}
          onChange={(e) => onPatch({ caption: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
          Framing
        </span>
        <select
          className={inputClass}
          value={photo.fit ?? "cover"}
          onChange={(e) => onPatch({ fit: e.target.value as ImageFit })}
        >
          {IMAGE_FITS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
