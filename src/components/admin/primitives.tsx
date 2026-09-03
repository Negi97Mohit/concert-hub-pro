import { useState } from "react";

export const inputClass =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function Field({
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

export type FieldSpec = { key: string; label: string; multiline?: boolean };

export function ObjectEditor({
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

/** Reorders an array by moving `from` in front of / behind `to`. */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const copy = [...items];
  const [row] = copy.splice(from, 1);
  copy.splice(to, 0, row!);
  return copy;
}

export const addButtonClass =
  "cursor-pointer rounded-sm border border-primary bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/20";

/**
 * Editable list of objects. Rows can be dragged to change their order and the
 * "Add new" button sits at the top so the new (open) row is immediately visible.
 */
export function ListEditor({
  items,
  fields,
  onChange,
  labelFor,
  addLabel,
}: {
  items: Record<string, unknown>[];
  fields: FieldSpec[];
  onChange: (next: Record<string, unknown>[]) => void;
  labelFor?: (item: Record<string, unknown>, index: number) => string;
  addLabel?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const update = (index: number, next: Record<string, unknown>) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    onChange(reorder(items, index, target));
    setOpen(open === index ? target : open);
  };

  const drop = (target: number) => {
    if (dragIndex === null) return;
    onChange(reorder(items, dragIndex, target));
    setDragIndex(null);
    setOverIndex(null);
    setOpen(null);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={addButtonClass}
        onClick={() => {
          const blank: Record<string, unknown> = {};
          fields.forEach((f) => (blank[f.key] = ""));
          onChange([blank, ...items]);
          setOpen(0);
        }}
      >
        + {addLabel ?? "Add new"}
      </button>
      <p className="text-xs text-muted-foreground">Drag a row by its handle to change the order.</p>

      {items.map((item, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(i);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            drop(i);
          }}
          className={`rounded-sm border bg-background ${
            overIndex === i && dragIndex !== null && dragIndex !== i
              ? "border-primary"
              : "border-border"
          } ${dragIndex === i ? "opacity-50" : ""}`}
        >
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <span className="cursor-grab select-none px-1 text-muted-foreground" aria-hidden="true">
              ⠿
            </span>
            <button
              type="button"
              className="flex-1 cursor-pointer text-left text-sm"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {labelFor ? labelFor(item, i) : `Item ${i + 1}`}
            </button>
            <button
              type="button"
              className="cursor-pointer px-2 text-xs"
              onClick={() => move(i, -1)}
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className="cursor-pointer px-2 text-xs"
              onClick={() => move(i, 1)}
              aria-label="Move down"
            >
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
    </div>
  );
}

export function StringListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={addButtonClass}
        onClick={() => onChange(["", ...items])}
      >
        + Add paragraph
      </button>
      {items.map((text, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) onChange(reorder(items, dragIndex, i));
            setDragIndex(null);
          }}
          className="rounded-sm border border-border p-3"
        >
          <span className="cursor-grab select-none text-muted-foreground" aria-hidden="true">
            ⠿
          </span>
          <textarea
            className={`${inputClass} mt-2 min-h-28`}
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
    </div>
  );
}
