/**
 * Named image slots used across the public pages. The admin page lets the
 * editor pick a picture for each slot, choose how it should be framed and
 * see the recommended pixel dimensions.
 */

export type ImageFit = "cover" | "contain" | "fill" | "center";

export type ImageSetting = {
  src: string;
  /** How the image should sit inside its frame. */
  fit?: ImageFit;
};

export const IMAGE_FITS: { value: ImageFit; label: string; hint: string }[] = [
  { value: "cover", label: "Fill frame (crop)", hint: "Fills the frame, cropping the overflow." },
  { value: "contain", label: "Fit inside", hint: "Whole image visible, may leave empty space." },
  { value: "fill", label: "Stretch", hint: "Stretches the image to the frame, distorting it." },
  { value: "center", label: "Centre (no scaling)", hint: "Original size, centred in the frame." },
];

export function fitClass(fit: ImageFit | undefined): string {
  switch (fit) {
    case "contain":
      return "object-contain";
    case "fill":
      return "object-fill";
    case "center":
      return "object-none object-center";
    default:
      return "object-cover";
  }
}

export type ImageSlot = {
  key: string;
  label: string;
  /** Where the image appears, for the admin UI. */
  section: string;
  /** Recommended source dimensions. */
  dimensions: string;
};

export const IMAGE_SLOTS: ImageSlot[] = [
  {
    key: "homeHero",
    label: "Hero portrait",
    section: "Home page",
    dimensions: "1200 × 1500 px (portrait 4:5)",
  },
  {
    key: "homeBio",
    label: "Biography teaser image",
    section: "Home page",
    dimensions: "1200 × 1500 px (portrait 4:5)",
  },
  {
    key: "bioPortrait",
    label: "Sticky portrait",
    section: "Biography page",
    dimensions: "900 × 1200 px (portrait 3:4)",
  },
  {
    key: "bioLowerLeft",
    label: "Lower image — left",
    section: "Biography page",
    dimensions: "1200 × 900 px (landscape 4:3)",
  },
  {
    key: "bioLowerRight",
    label: "Lower image — right",
    section: "Biography page",
    dimensions: "1200 × 900 px (landscape 4:3)",
  },
];

export function slotDimensions(key: string): string {
  return IMAGE_SLOTS.find((s) => s.key === key)?.dimensions ?? "";
}
