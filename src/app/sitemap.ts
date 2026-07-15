import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

const BASE = "https://haneengrace.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/track-order",
    "/wishlist",
    "/faq",
    "/shipping-policy",
    "/return-policy",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${BASE}/shop/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
