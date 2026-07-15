import Image from "next/image";
import { FabricSwatch } from "./fabric-swatch";
import type { ProductImage as ProductImageType } from "@/types";

/**
 * Renders a product photo when available, gracefully falling back to the
 * elegant fabric-gradient swatch when a product has no image yet.
 */
export function ProductImage({
  images,
  swatch,
  index = 0,
  alt,
  label,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  className = "object-cover",
}: {
  images?: ProductImageType[];
  swatch: [string, string];
  index?: number;
  alt?: string;
  label?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const img =
    images?.[index] ??
    images?.find((i) => i.is_primary) ??
    images?.[0];

  if (img?.url) {
    return (
      <Image
        src={img.url}
        alt={img.alt ?? alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }
  return <FabricSwatch swatch={swatch} label={label} />;
}
