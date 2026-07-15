// Import Haneen Grace real catalogue into Supabase.
// Run: node --env-file=.env.local scripts/import-products.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env (run with --env-file=.env.local)");

const sb = createClient(url, key, { auth: { persistSession: false } });
const IMG = `${url}/storage/v1/object/public/product-images`;

// [code, ext(s) per photo]
const photos = {
  "01": ["01-1.jpg", "01-2.png", "01-3.png"],
  "02": ["02-1.jpg", "02-2.png", "02-3.png"],
  "03": ["03-1.jpg", "03-2.jpg"],
  "04": ["04-1.jpg", "04-2.jpg"],
  "05": ["05-1.jpg", "05-2.jpg"],
  "06": ["06-1.jpg", "06-2.jpg"],
  "07": ["07-1.jpg", "07-2.jpg"],
  "08": ["08-1.jpg", "08-2.jpg"],
  "09": ["09-1.jpg"],
  "10": ["10-1.jpg", "10-2.jpg"],
  "11": ["11-1.jpeg", "11-2.jpeg"],
};
const imgs = (code, alt) =>
  photos[code].map((f, i) => ({ url: `${IMG}/${f}`, alt, is_primary: i === 0 }));

const P = [
  { code:"01", slug:"crimson-rose-embroidered-lawn", title:"Crimson Rose Embroidered Lawn",
    cat:"luxury-pret", price:5999, sale:3999, color:["Crimson","#b81d34"], swatch:["#c62a41","#8f1526"],
    rating:4.9, reviews:64, stock:12, featured:true, best:false,
    short:"Richly embroidered crimson lawn three-piece with a monar net dupatta.",
    desc:"Crimson Rose is celebration in every thread — a high-quality lawn shirt adorned with intricate embroidery across the front, sleeves and daman patch, paired with printed trousers and a flowing monar net dupatta. An unstitched three-piece, ready to be tailored to you.",
    tags:["embroidered","lawn","3-piece","unstitched"] },

  { code:"02", slug:"sage-mist-embroidered-lawn", title:"Sage Mist Embroidered Lawn",
    cat:"luxury-pret", price:7999, sale:5500, color:["Sage","#b7c4a0"], swatch:["#c3cfac","#9fb083"],
    rating:4.9, reviews:52, stock:10, featured:false, best:true,
    short:"Soft sage embroidered three-piece with a delicate lace-edged dupatta.",
    desc:"Sage Mist is quiet luxury — an embroidered shirt and sleeves finished with a scalloped lace dupatta and an embroidered daman patch. A breathable unstitched three-piece made for effortless grace.",
    tags:["embroidered","lawn","lace","3-piece","unstitched"] },

  { code:"03", slug:"magenta-mirage-embroidered-suit", title:"Magenta Mirage Embroidered Suit",
    cat:"luxury-pret", price:5999, sale:3400, color:["Magenta","#8e2158"], swatch:["#9a2a63","#6d1846"],
    rating:4.8, reviews:41, stock:14, featured:true, best:false,
    short:"Magenta three-piece with tonal gold thread embroidery and a chiffon dupatta.",
    desc:"Magenta Mirage glows with warmth — an embroidered shirt and sleeves detailed in golden thread, completed with an embroidered dupatta and daman patch. An unstitched three-piece made for memorable evenings.",
    tags:["embroidered","3-piece","unstitched","chiffon"] },

  { code:"04", slug:"ivory-noir-printed-silk", title:"Ivory Noir Printed Silk",
    cat:"casual-wear", price:5999, sale:2800, color:["Ivory & Black","#d9cfbf"], swatch:["#e8ddc9","#b9b0a0"],
    rating:4.7, reviews:33, stock:9, featured:false, best:false,
    short:"Ivory printed silk three-piece with striking monochrome floral artistry.",
    desc:"Ivory Noir pairs lustrous ivory silk with bold black floral prints across the shirt and dupatta. A premium printed silk unstitched three-piece — understated, elegant and unforgettable.",
    tags:["printed","silk","3-piece","unstitched"] },

  { code:"05", slug:"azure-heritage-printed-silk", title:"Azure Heritage Printed Silk",
    cat:"casual-wear", price:5999, sale:2800, color:["Azure","#8aa6c4"], swatch:["#dfe3e8","#8aa6c4"],
    rating:4.8, reviews:47, stock:8, featured:false, best:true,
    short:"Ivory silk three-piece with blue Mughal-inspired printed borders.",
    desc:"Azure Heritage drapes you in artistry — high-quality printed silk in ivory with intricate blue paisley and Mughal motifs across the shirt, trousers and dupatta. A luxurious unstitched three-piece.",
    tags:["printed","silk","3-piece","unstitched"] },

  { code:"06", slug:"ivory-garden-printed-silk", title:"Ivory Garden Printed Silk",
    cat:"casual-wear", price:5999, sale:2800, color:["Ivory Bloom","#e3d5bd"], swatch:["#ece0c8","#cdbf9f"],
    rating:4.7, reviews:29, stock:8, featured:false, best:false,
    short:"Ivory silk three-piece blooming with multicolour floral prints.",
    desc:"Ivory Garden is a bouquet in silk — a printed ivory shirt bordered with vivid floral artistry, paired with matching trousers and dupatta. A high-quality printed silk unstitched three-piece.",
    tags:["printed","silk","floral","3-piece","unstitched"] },

  { code:"07", slug:"peony-blush-printed-silk", title:"Peony Blush Printed Silk",
    cat:"casual-wear", price:5999, sale:2800, color:["Peony Blush","#e7c8ce"], swatch:["#f0dade","#d9b3bb"],
    rating:4.8, reviews:58, stock:8, featured:true, best:false,
    short:"Ivory silk three-piece with romantic pink peony prints.",
    desc:"Peony Blush is soft romance — luminous ivory silk scattered with blush peonies and finished with a sage border, complete with a printed silk dupatta. A high-quality unstitched three-piece.",
    tags:["printed","silk","floral","3-piece","unstitched"] },

  { code:"08", slug:"lilac-whisper-embroidered-net", title:"Lilac Whisper Embroidered Net",
    cat:"festive-collection", price:6999, sale:4800, color:["Lilac","#c3b0e0"], swatch:["#d3c3ea","#b299d6"],
    rating:5.0, reviews:38, stock:6, featured:true, best:false,
    short:"Lilac embroidered net three-piece with tissue and pearl detailing.",
    desc:"Lilac Whisper is festive finesse — an embroidered shirt, sleeves and patches on a khadi net base with a richly embroidered dupatta, tissue accents and delicate pearl work. An unstitched three-piece for celebrations you'll never forget.",
    tags:["embroidered","net","tissue","festive","3-piece","unstitched"] },

  { code:"09", slug:"olive-empress-embroidered-chiffon", title:"Olive Empress Embroidered Chiffon",
    cat:"formal-wear", price:6999, sale:3499, color:["Olive","#5c6234"], swatch:["#666c3c","#464a24"],
    rating:4.9, reviews:44, stock:10, featured:false, best:true,
    short:"Olive-green embroidered chiffon three-piece with golden thread work.",
    desc:"Olive Empress is regal calm — an embroidered chiffon shirt and sleeves detailed in golden thread, paired with an embroidered dupatta. An unstitched three-piece for formal occasions that call for grace.",
    tags:["embroidered","chiffon","formal","3-piece","unstitched"] },

  { code:"10", slug:"midnight-noir-embroidered-suit", title:"Midnight Noir Embroidered Suit",
    cat:"luxury-pret", price:6999, sale:4800, color:["Black","#262421"], swatch:["#3a3733","#201e1c"],
    rating:4.9, reviews:51, stock:7, featured:true, best:true,
    short:"Black embroidered lawn three-piece with silver-white artistry and a ready-to-wear dupatta.",
    desc:"Midnight Noir is bold elegance — a black lawn shirt and sleeves alive with intricate silver-white embroidery, finished with a ready-to-wear embroidered dupatta. A striking unstitched three-piece.",
    tags:["embroidered","lawn","3-piece","unstitched"] },

  { code:"11", slug:"aqua-butterfly-embroidered-lawn", title:"Aqua Butterfly Embroidered Lawn",
    cat:"luxury-pret", price:6999, sale:3999, color:["Aqua","#9fd6ce"], swatch:["#b6e2db","#8fcabf"],
    rating:4.8, reviews:36, stock:9, featured:false, best:false,
    short:"Aqua embroidered lawn three-piece with butterfly motifs and a printed dupatta.",
    desc:"Aqua Butterfly takes flight — a mint-aqua lawn shirt embroidered with delicate butterfly motifs, paired with printed trousers and a soft printed dupatta. A fresh unstitched three-piece for daytime grace.",
    tags:["embroidered","lawn","butterfly","3-piece","unstitched"] },
];

const rows = P.map((p) => ({
  slug: p.slug,
  sku: `HG-${p.code}`,
  title: p.title,
  short_description: p.short,
  description: p.desc,
  price: p.price,
  sale_price: p.sale,
  category_slug: p.cat,
  collections: ["new-arrivals", "sale"],
  sizes: [], // unstitched — no sizes
  colors: [{ name: p.color[0], hex: p.color[1] }],
  swatch: p.swatch,
  images: imgs(p.code, p.title),
  stock: p.stock,
  featured: p.featured,
  best_seller: p.best,
  new_arrival: true,
  rating: p.rating,
  review_count: p.reviews,
  tags: p.tags,
  is_active: true,
}));

// Replace the demo catalogue with the real one.
const { error: delErr } = await sb.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
if (delErr) throw delErr;

const { data, error } = await sb.from("products").insert(rows).select("slug,title");
if (error) throw error;

console.log(`Inserted ${data.length} products:`);
data.forEach((d) => console.log(" •", d.title));
