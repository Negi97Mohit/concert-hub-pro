import { fitClass, type ImageSetting } from "@/lib/image-slots";

type Props = {
  image: ImageSetting | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/** Renders one of the configured image slots with the chosen framing mode. */
export function SiteImage({ image, alt, className, loading }: Props) {
  if (!image?.src) return null;
  return (
    <img
      src={image.src}
      alt={alt}
      loading={loading ?? "lazy"}
      className={[className ?? "", fitClass(image.fit)].join(" ")}
    />
  );
}
