import {
  ALL_REVIEWS_URL,
  ARTIST,
  BIO_DATE,
  BIO_INTRO,
  BIO_LANGUAGES,
  BIO_PARAGRAPHS,
  CONCERTS,
  CONTACTS,
  MEDIA,
  NEWS,
  PHOTOS,
  QUOTES,
  REVIEWS,
  type Concert,
} from "@/data/dovgan";
import type { ImageFit, ImageSetting } from "@/lib/image-slots";

export type SitePhoto = { src: string; caption: string; fit?: ImageFit };

export type SiteContent = {
  artist: typeof ARTIST;
  bioIntro: string;
  bioParagraphs: string[];
  bioDate: string;
  bioLanguages: typeof BIO_LANGUAGES;
  quotes: typeof QUOTES;
  photos: SitePhoto[];
  concerts: Concert[];
  news: typeof NEWS;
  media: typeof MEDIA;
  reviews: typeof REVIEWS;
  allReviewsUrl: string;
  contacts: typeof CONTACTS;
  /** Named image slots on the home and biography pages. */
  images: Record<string, ImageSetting>;
};

/** Fallback content shipped with the site; the admin page overrides these values. */
export const DEFAULT_CONTENT: SiteContent = {
  artist: ARTIST,
  bioIntro: BIO_INTRO,
  bioParagraphs: BIO_PARAGRAPHS,
  bioDate: BIO_DATE,
  bioLanguages: BIO_LANGUAGES,
  quotes: QUOTES,
  photos: PHOTOS,
  concerts: CONCERTS,
  news: NEWS,
  media: MEDIA,
  reviews: REVIEWS,
  allReviewsUrl: ALL_REVIEWS_URL,
  contacts: CONTACTS,
  images: {
    homeHero: { src: PHOTOS[7]!.src, fit: "cover" },
    homeBio: { src: PHOTOS[6]!.src, fit: "cover" },
    bioPortrait: { src: PHOTOS[1]!.src, fit: "cover" },
    bioLowerLeft: { src: PHOTOS[8]!.src, fit: "cover" },
    bioLowerRight: { src: PHOTOS[4]!.src, fit: "cover" },
  },
};

/** Merge stored overrides (per top-level section) on top of the defaults. */
export function mergeContent(stored: unknown): SiteContent {
  if (!stored || typeof stored !== "object") return DEFAULT_CONTENT;
  const overrides = stored as Partial<SiteContent>;
  const merged = { ...DEFAULT_CONTENT };
  for (const key of Object.keys(DEFAULT_CONTENT) as (keyof SiteContent)[]) {
    const value = overrides[key];
    if (value !== undefined && value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (merged as any)[key] = value;
    }
  }
  merged.images = { ...DEFAULT_CONTENT.images, ...(overrides.images ?? {}) };
  return merged;
}
