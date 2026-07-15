import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    tagline: "Fresh from the atelier",
    description:
      "The latest expressions of modern modest luxury — freshly landed, ready to be yours.",
    accent: "#e7d4b4",
  },
  {
    slug: "luxury-pret",
    name: "Luxury Pret",
    tagline: "Ready to wear, ready to shine",
    description:
      "Elevated ready-to-wear pieces in the finest fabrics, finished with couture-level detail.",
    accent: "#d4b483",
  },
  {
    slug: "casual-wear",
    name: "Casual Wear",
    tagline: "Everyday elegance",
    description:
      "Effortless silhouettes for the everyday — comfort woven into quiet luxury.",
    accent: "#d8cfc4",
  },
  {
    slug: "formal-wear",
    name: "Formal Wear",
    tagline: "For moments that matter",
    description:
      "Statement formals for weddings, soirées and celebrations that deserve to be remembered.",
    accent: "#c9a56d",
  },
  {
    slug: "festive-collection",
    name: "Festive Collection",
    tagline: "Celebrate in grace",
    description:
      "Richly embellished festive wear crafted to make every occasion unforgettable.",
    accent: "#b8925a",
  },
  {
    slug: "sale",
    name: "Season End Sale",
    tagline: "Up to 40% off",
    description:
      "Timeless elegance, now at irresistible prices. Limited pieces, limited time.",
    accent: "#f7e7e6",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
