import type { Product } from "@/types";

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number; // 1–5
  title: string;
  body: string;
  date: string; // relative label, e.g. "2 weeks ago"
  verified: boolean;
  size: string;
}

/* ------------------------------------------------------------------
   Deterministic pseudo-random reviews.
   Reviews are seeded from the product slug so a given product always
   renders the same set — stable across SSR/CSR (no hydration mismatch)
   and consistent between page visits.
------------------------------------------------------------------ */

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Ayesha K.",
  "Fatima R.",
  "Zainab A.",
  "Hira M.",
  "Mahnoor S.",
  "Sana T.",
  "Iqra N.",
  "Rabia H.",
  "Areeba J.",
  "Komal F.",
  "Nimra Q.",
  "Maryam B.",
  "Aiman W.",
  "Bushra L.",
  "Dua Z.",
  "Eman C.",
  "Laiba D.",
  "Warda G.",
  "Sidra P.",
  "Anum V.",
  "Kanwal Y.",
  "Mehak I.",
  "Noor E.",
  "Sadia O.",
];

const LOCATIONS = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Sialkot",
  "Hyderabad",
  "Gujranwala",
  "London, UK",
  "Dubai, UAE",
];

const TITLES = [
  "Absolutely stunning in person",
  "Worth every rupee",
  "My new favourite outfit",
  "Elegant and so comfortable",
  "Even prettier than the pictures",
  "Perfect for the wedding season",
  "Beautiful craftsmanship",
  "Got so many compliments",
  "Luxury quality, gentle price",
  "Exactly what I hoped for",
  "Will definitely order again",
  "Loved the fabric and finish",
];

const BODIES = [
  "The fabric feels premium and the embroidery detailing is so delicate. Draped beautifully and the stitching was flawless.",
  "Ordered for a family function and received endless compliments. The colour is exactly as shown and the fit was true to size.",
  "Cash on delivery made it stress-free, and the packaging felt so luxurious. The dupatta is gorgeous in real life.",
  "Such a graceful cut — modest yet elegant. It's now my go-to for evening gatherings. Highly recommend Haneen Grace.",
  "The tailoring is immaculate and the finishing on the sleeves is beautiful. Comfortable enough to wear all day.",
  "I was nervous ordering online but the quality exceeded my expectations. The gold work catches the light beautifully.",
  "Delivery was quick and the piece arrived neatly pressed. The shade is rich and doesn't look cheap at all.",
  "Soft, breathable fabric that still feels formal. Perfect for our climate. The detailing is worth the price.",
  "This has become my favourite in my wardrobe. Elegant, timeless, and the modest silhouette is exactly my style.",
  "Beautiful hand-feel and the embroidery is neat on both sides. Sizing chart was accurate — ordered my usual size.",
  "Wore it to a mehndi and felt so put together. The colour is festive without being loud. Will be back for more.",
  "Genuinely impressed with the finish for the price. Looks far more expensive than it was. Thank you Haneen Grace!",
];

const DATE_LABELS = [
  "3 days ago",
  "1 week ago",
  "2 weeks ago",
  "3 weeks ago",
  "1 month ago",
  "6 weeks ago",
  "2 months ago",
  "3 months ago",
];

// Rating pool weighted toward 5★/4★ (occasional 3★) for an authentic mix.
const RATING_POOL = [5, 5, 5, 5, 4, 5, 4, 5, 4, 3];

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

/** Generate a stable set of reviews for a product. */
export function getReviews(product: Product, count = 5): Review[] {
  const rnd = mulberry32(hashString(product.slug));
  const usedNames = new Set<string>();
  const reviews: Review[] = [];

  for (let i = 0; i < count; i++) {
    // ensure distinct authors
    let author = pick(NAMES, rnd);
    let guard = 0;
    while (usedNames.has(author) && guard++ < 10) author = pick(NAMES, rnd);
    usedNames.add(author);

    reviews.push({
      id: `${product.slug}-r${i}`,
      author,
      location: pick(LOCATIONS, rnd),
      rating: pick(RATING_POOL, rnd),
      title: pick(TITLES, rnd),
      body: pick(BODIES, rnd),
      date: pick(DATE_LABELS, rnd),
      verified: rnd() > 0.15,
      size: product.sizes.length ? pick(product.sizes, rnd) : "M",
    });
  }

  return reviews;
}

/** Star-rating distribution (5★→1★ counts) scaled to reviewCount. */
export function ratingBreakdown(product: Product): number[] {
  const rnd = mulberry32(hashString(product.slug + "-dist"));
  const total = product.reviewCount || 0;
  // weights favouring high ratings, nudged by the product's own rating
  const base = [0.68, 0.22, 0.06, 0.025, 0.015];
  const weights = base.map((w) => w * (0.9 + rnd() * 0.2));
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((w) => Math.round((w / sum) * total));
  // reconcile rounding drift into the 5★ bucket
  const diff = total - counts.reduce((a, b) => a + b, 0);
  counts[0] += diff;
  return counts;
}
