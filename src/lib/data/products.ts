import type { Product } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL"];

/**
 * Mock catalogue. `swatch` holds two hex colours that render an elegant fabric
 * gradient placeholder until real photography is dropped into /public/products.
 * When Supabase is wired (Phase 2) these objects map 1:1 onto the products table.
 */
export const products: Product[] = [
  {
    id: "hg-1001",
    slug: "sage-serenity-embroidered-3-piece",
    title: "Sage Serenity Embroidered 3-Piece",
    shortDescription: "Hand-embroidered sage lawn with scalloped organza dupatta.",
    description:
      "A whisper of spring in every thread. This sage-green ensemble pairs intricately embroidered lawn with a scalloped organza dupatta and delicate lace finishing. Fully stitched, lined and finished by hand at our atelier.",
    price: 18500,
    salePrice: 13900,
    sku: "HG-SS-1001",
    category: "luxury-pret",
    collections: ["new-arrivals", "sale"],
    sizes: SIZES,
    colors: [
      { name: "Sage", hex: "#c7d2b0" },
      { name: "Ivory", hex: "#f2ece1" },
    ],
    stock: 12,
    featured: true,
    bestSeller: true,
    newArrival: true,
    rating: 4.9,
    reviewCount: 128,
    swatch: ["#dfe7cf", "#b9c79f"],
    tags: ["embroidered", "lawn", "organza", "3-piece"],
  },
  {
    id: "hg-1002",
    slug: "crimson-noor-festive-anarkali",
    title: "Crimson Noor Festive Anarkali",
    shortDescription: "Deep crimson anarkali with gold zardozi and pearl work.",
    description:
      "Command the room in Crimson Noor. A flowing anarkali silhouette layered with gold zardozi, pearl detailing and a chiffon dupatta — crafted for the moments that deserve to be remembered.",
    price: 42000,
    salePrice: null,
    sku: "HG-CN-1002",
    category: "festive-collection",
    collections: ["formal-wear", "new-arrivals"],
    sizes: SIZES,
    colors: [
      { name: "Crimson", hex: "#9c1f2e" },
      { name: "Wine", hex: "#6d1622" },
    ],
    stock: 6,
    featured: true,
    bestSeller: true,
    newArrival: true,
    rating: 5.0,
    reviewCount: 87,
    swatch: ["#b5273a", "#7c1420"],
    tags: ["anarkali", "zardozi", "festive", "wedding"],
  },
  {
    id: "hg-1003",
    slug: "ivory-grace-silk-kurta-set",
    title: "Ivory Grace Silk Kurta Set",
    shortDescription: "Pure ivory raw-silk kurta with printed silk trousers.",
    description:
      "Understated and endlessly elegant. Ivory Grace is a pure raw-silk kurta paired with printed silk straight trousers — modest luxury for the everyday and beyond.",
    price: 22500,
    salePrice: 16900,
    sku: "HG-IG-1003",
    category: "luxury-pret",
    collections: ["casual-wear", "sale"],
    sizes: SIZES,
    colors: [
      { name: "Ivory", hex: "#f4efe6" },
      { name: "Champagne", hex: "#e7d4b4" },
    ],
    stock: 18,
    featured: true,
    bestSeller: false,
    newArrival: false,
    rating: 4.8,
    reviewCount: 64,
    swatch: ["#f6f1e8", "#e4d8c4"],
    tags: ["silk", "kurta", "minimal"],
  },
  {
    id: "hg-1004",
    slug: "olive-mirage-embellished-formal",
    title: "Olive Mirage Embellished Formal",
    shortDescription: "Olive net formal with sequin cascade and velvet border.",
    description:
      "Olive Mirage drapes you in depth. A sequin-cascaded net formal with a plush velvet border and gold accents — a modern heirloom for celebrations.",
    price: 38900,
    salePrice: null,
    sku: "HG-OM-1004",
    category: "formal-wear",
    collections: ["festive-collection"],
    sizes: SIZES,
    colors: [
      { name: "Olive", hex: "#5a5f34" },
      { name: "Moss", hex: "#42461f" },
    ],
    stock: 4,
    featured: false,
    bestSeller: true,
    newArrival: true,
    rating: 4.9,
    reviewCount: 51,
    swatch: ["#6b7040", "#464a24"],
    tags: ["net", "sequin", "formal", "velvet"],
  },
  {
    id: "hg-1005",
    slug: "blush-petal-everyday-lawn",
    title: "Blush Petal Everyday Lawn",
    shortDescription: "Soft blush printed lawn 2-piece for daily grace.",
    description:
      "Blush Petal brings quiet joy to ordinary days. A soft floral-printed lawn two-piece, breathable and beautifully finished — the everyday essential you'll reach for again and again.",
    price: 9800,
    salePrice: 6900,
    sku: "HG-BP-1005",
    category: "casual-wear",
    collections: ["sale", "new-arrivals"],
    sizes: SIZES,
    colors: [
      { name: "Blush", hex: "#f2d5d2" },
      { name: "Rose", hex: "#e6b8b4" },
    ],
    stock: 30,
    featured: false,
    bestSeller: true,
    newArrival: true,
    rating: 4.7,
    reviewCount: 203,
    swatch: ["#f7e2df", "#ecc7c3"],
    tags: ["lawn", "printed", "casual", "everyday"],
  },
  {
    id: "hg-1006",
    slug: "champagne-dream-bridal-lehenga",
    title: "Champagne Dream Bridal Lehenga",
    shortDescription: "Champagne-gold bridal lehenga with dabka & resham work.",
    description:
      "For the bride who is grace personified. Champagne Dream is a fully hand-worked bridal lehenga in dabka, resham and crystal — a once-in-a-lifetime piece from the Haneen Grace couture line.",
    price: 165000,
    salePrice: null,
    sku: "HG-CD-1006",
    category: "festive-collection",
    collections: ["formal-wear"],
    sizes: SIZES,
    colors: [
      { name: "Champagne", hex: "#e2cfa6" },
      { name: "Antique Gold", hex: "#c9a56d" },
    ],
    stock: 2,
    featured: true,
    bestSeller: false,
    newArrival: true,
    rating: 5.0,
    reviewCount: 19,
    swatch: ["#ead9b6", "#cbae7c"],
    tags: ["bridal", "lehenga", "couture", "hand-work"],
  },
  {
    id: "hg-1007",
    slug: "midnight-jasmine-chiffon-saree",
    title: "Midnight Jasmine Chiffon Saree",
    shortDescription: "Navy chiffon saree with silver thread jasmine motifs.",
    description:
      "Midnight Jasmine is poetry in motion — a fluid navy chiffon saree scattered with silver-thread jasmine motifs and a hand-finished blouse piece.",
    price: 28500,
    salePrice: 21900,
    sku: "HG-MJ-1007",
    category: "formal-wear",
    collections: ["sale"],
    sizes: ["Free"],
    colors: [
      { name: "Midnight", hex: "#232a3d" },
      { name: "Ink", hex: "#161b2a" },
    ],
    stock: 9,
    featured: false,
    bestSeller: false,
    newArrival: false,
    rating: 4.8,
    reviewCount: 42,
    swatch: ["#2c3450", "#1a2032"],
    tags: ["saree", "chiffon", "formal"],
  },
  {
    id: "hg-1008",
    slug: "rosewater-luxe-organza-3-piece",
    title: "Rosewater Luxe Organza 3-Piece",
    shortDescription: "Powder-pink organza with thread embroidery & sheesha.",
    description:
      "Rosewater Luxe is delicate strength. Powder-pink organza layered over cotton silk, alive with thread embroidery and mirror sheesha — luxury pret at its most feminine.",
    price: 32000,
    salePrice: null,
    sku: "HG-RL-1008",
    category: "luxury-pret",
    collections: ["festive-collection", "new-arrivals"],
    sizes: SIZES,
    colors: [
      { name: "Rosewater", hex: "#f0d7d9" },
      { name: "Petal", hex: "#e3bcc0" },
    ],
    stock: 7,
    featured: true,
    bestSeller: true,
    newArrival: true,
    rating: 4.9,
    reviewCount: 76,
    swatch: ["#f4dee0", "#e1bcc0"],
    tags: ["organza", "embroidered", "sheesha", "luxury"],
  },
  {
    id: "hg-1009",
    slug: "sandstone-comfort-cotton-set",
    title: "Sandstone Comfort Cotton Set",
    shortDescription: "Warm sandstone cotton co-ord with wooden buttons.",
    description:
      "Sandstone Comfort is the ease you deserve. A warm-toned cotton co-ord with wooden button detailing and relaxed tailoring — modest, breathable, effortless.",
    price: 8500,
    salePrice: null,
    sku: "HG-SC-1009",
    category: "casual-wear",
    collections: ["new-arrivals"],
    sizes: SIZES,
    colors: [
      { name: "Sandstone", hex: "#d8c3a5" },
      { name: "Camel", hex: "#c2a680" },
    ],
    stock: 24,
    featured: false,
    bestSeller: false,
    newArrival: true,
    rating: 4.6,
    reviewCount: 58,
    swatch: ["#e0ccae", "#c8ab84" ],
    tags: ["cotton", "co-ord", "casual"],
  },
  {
    id: "hg-1010",
    slug: "emerald-empress-velvet-shawl-set",
    title: "Emerald Empress Velvet Shawl Set",
    shortDescription: "Emerald velvet suit with tilla-worked pashmina shawl.",
    description:
      "Emerald Empress is winter royalty. A rich emerald velvet suit finished with a tilla-embroidered pashmina shawl — warmth and grandeur in equal measure.",
    price: 54000,
    salePrice: 43200,
    sku: "HG-EE-1010",
    category: "festive-collection",
    collections: ["formal-wear", "sale"],
    sizes: SIZES,
    colors: [
      { name: "Emerald", hex: "#1f5c46" },
      { name: "Forest", hex: "#123f30" },
    ],
    stock: 5,
    featured: true,
    bestSeller: false,
    newArrival: false,
    rating: 4.9,
    reviewCount: 33,
    swatch: ["#256b52", "#123f30"],
    tags: ["velvet", "shawl", "tilla", "winter"],
  },
  {
    id: "hg-1011",
    slug: "pearl-whisper-formal-gown",
    title: "Pearl Whisper Formal Gown",
    shortDescription: "Ivory pearl-embellished flared gown with cape sleeves.",
    description:
      "Pearl Whisper is a modern fairytale. An ivory flared gown with cascading pearl embellishment and graceful cape sleeves — modest glamour for the evening.",
    price: 46500,
    salePrice: null,
    sku: "HG-PW-1011",
    category: "formal-wear",
    collections: ["luxury-pret", "new-arrivals"],
    sizes: SIZES,
    colors: [
      { name: "Pearl", hex: "#efe9dd" },
      { name: "Champagne", hex: "#e2cfa6" },
    ],
    stock: 8,
    featured: false,
    bestSeller: true,
    newArrival: true,
    rating: 4.8,
    reviewCount: 61,
    swatch: ["#f1ebe0", "#e2cfa6"],
    tags: ["gown", "pearl", "formal", "evening"],
  },
  {
    id: "hg-1012",
    slug: "terracotta-sunset-printed-lawn",
    title: "Terracotta Sunset Printed Lawn",
    shortDescription: "Terracotta digital-print lawn 3-piece with chiffon dupatta.",
    description:
      "Terracotta Sunset captures golden hour. A warm digital-print lawn three-piece with a soft chiffon dupatta — vibrant, breezy and effortlessly graceful.",
    price: 11200,
    salePrice: 7900,
    sku: "HG-TS-1012",
    category: "casual-wear",
    collections: ["sale", "new-arrivals"],
    sizes: SIZES,
    colors: [
      { name: "Terracotta", hex: "#c1704b" },
      { name: "Clay", hex: "#a85a38" },
    ],
    stock: 21,
    featured: false,
    bestSeller: true,
    newArrival: true,
    rating: 4.7,
    reviewCount: 142,
    swatch: ["#cf7f59", "#a85a38"],
    tags: ["lawn", "digital-print", "casual", "3-piece"],
  },
];

// ---- Selectors ---------------------------------------------------------------

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter(
    (p) => p.category === slug || p.collections.includes(slug as never),
  );
}

export const newArrivals = products.filter((p) => p.newArrival);
export const bestSellers = products.filter((p) => p.bestSeller);
export const featuredProducts = products.filter((p) => p.featured);
export const saleProducts = products.filter((p) => p.salePrice);

export function relatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}
