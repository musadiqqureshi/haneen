-- ============================================================================
-- Haneen Grace — Seed data
-- Run AFTER 0001_initial_schema.sql and 0002_rls_policies.sql.
-- Safe to re-run: uses ON CONFLICT ... DO NOTHING / DO UPDATE.
-- ============================================================================

-- ---------- Categories ------------------------------------------------------
insert into public.categories (slug, name, tagline, description, accent, sort_order) values
  ('new-arrivals',       'New Arrivals',      'Fresh from the atelier',       'The latest expressions of modern modest luxury — freshly landed, ready to be yours.', '#e7d4b4', 1),
  ('luxury-pret',        'Luxury Pret',       'Ready to wear, ready to shine', 'Elevated ready-to-wear pieces in the finest fabrics, finished with couture-level detail.', '#d4b483', 2),
  ('casual-wear',        'Casual Wear',       'Everyday elegance',            'Effortless silhouettes for the everyday — comfort woven into quiet luxury.', '#d8cfc4', 3),
  ('formal-wear',        'Formal Wear',       'For moments that matter',      'Statement formals for weddings, soirées and celebrations that deserve to be remembered.', '#c9a56d', 4),
  ('festive-collection', 'Festive Collection','Celebrate in grace',           'Richly embellished festive wear crafted to make every occasion unforgettable.', '#b8925a', 5),
  ('sale',               'Season End Sale',   'Up to 40% off',                'Timeless elegance, now at irresistible prices. Limited pieces, limited time.', '#f7e7e6', 6)
on conflict (slug) do nothing;

-- ---------- Products --------------------------------------------------------
insert into public.products
  (slug, sku, title, short_description, description, price, sale_price, category_slug,
   collections, sizes, colors, swatch, stock, featured, best_seller, new_arrival,
   rating, review_count, tags)
values
  ('sage-serenity-embroidered-3-piece','HG-SS-1001','Sage Serenity Embroidered 3-Piece',
   'Hand-embroidered sage lawn with scalloped organza dupatta.',
   'A whisper of spring in every thread. This sage-green ensemble pairs intricately embroidered lawn with a scalloped organza dupatta and delicate lace finishing. Fully stitched, lined and finished by hand at our atelier.',
   18500, 13900, 'luxury-pret', '{new-arrivals,sale}', '{XS,S,M,L,XL}',
   '[{"name":"Sage","hex":"#c7d2b0"},{"name":"Ivory","hex":"#f2ece1"}]', '{"#dfe7cf","#b9c79f"}',
   12, true, true, true, 4.9, 128, '{embroidered,lawn,organza,3-piece}'),

  ('crimson-noor-festive-anarkali','HG-CN-1002','Crimson Noor Festive Anarkali',
   'Deep crimson anarkali with gold zardozi and pearl work.',
   'Command the room in Crimson Noor. A flowing anarkali silhouette layered with gold zardozi, pearl detailing and a chiffon dupatta — crafted for the moments that deserve to be remembered.',
   42000, null, 'festive-collection', '{formal-wear,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Crimson","hex":"#9c1f2e"},{"name":"Wine","hex":"#6d1622"}]', '{"#b5273a","#7c1420"}',
   6, true, true, true, 5.0, 87, '{anarkali,zardozi,festive,wedding}'),

  ('ivory-grace-silk-kurta-set','HG-IG-1003','Ivory Grace Silk Kurta Set',
   'Pure ivory raw-silk kurta with printed silk trousers.',
   'Understated and endlessly elegant. Ivory Grace is a pure raw-silk kurta paired with printed silk straight trousers — modest luxury for the everyday and beyond.',
   22500, 16900, 'luxury-pret', '{casual-wear,sale}', '{XS,S,M,L,XL}',
   '[{"name":"Ivory","hex":"#f4efe6"},{"name":"Champagne","hex":"#e7d4b4"}]', '{"#f6f1e8","#e4d8c4"}',
   18, true, false, false, 4.8, 64, '{silk,kurta,minimal}'),

  ('olive-mirage-embellished-formal','HG-OM-1004','Olive Mirage Embellished Formal',
   'Olive net formal with sequin cascade and velvet border.',
   'Olive Mirage drapes you in depth. A sequin-cascaded net formal with a plush velvet border and gold accents — a modern heirloom for celebrations.',
   38900, null, 'formal-wear', '{festive-collection}', '{XS,S,M,L,XL}',
   '[{"name":"Olive","hex":"#5a5f34"},{"name":"Moss","hex":"#42461f"}]', '{"#6b7040","#464a24"}',
   4, false, true, true, 4.9, 51, '{net,sequin,formal,velvet}'),

  ('blush-petal-everyday-lawn','HG-BP-1005','Blush Petal Everyday Lawn',
   'Soft blush printed lawn 2-piece for daily grace.',
   'Blush Petal brings quiet joy to ordinary days. A soft floral-printed lawn two-piece, breathable and beautifully finished — the everyday essential you''ll reach for again and again.',
   9800, 6900, 'casual-wear', '{sale,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Blush","hex":"#f2d5d2"},{"name":"Rose","hex":"#e6b8b4"}]', '{"#f7e2df","#ecc7c3"}',
   30, false, true, true, 4.7, 203, '{lawn,printed,casual,everyday}'),

  ('champagne-dream-bridal-lehenga','HG-CD-1006','Champagne Dream Bridal Lehenga',
   'Champagne-gold bridal lehenga with dabka & resham work.',
   'For the bride who is grace personified. Champagne Dream is a fully hand-worked bridal lehenga in dabka, resham and crystal — a once-in-a-lifetime piece from the Haneen Grace couture line.',
   165000, null, 'festive-collection', '{formal-wear}', '{XS,S,M,L,XL}',
   '[{"name":"Champagne","hex":"#e2cfa6"},{"name":"Antique Gold","hex":"#c9a56d"}]', '{"#ead9b6","#cbae7c"}',
   2, true, false, true, 5.0, 19, '{bridal,lehenga,couture,hand-work}'),

  ('midnight-jasmine-chiffon-saree','HG-MJ-1007','Midnight Jasmine Chiffon Saree',
   'Navy chiffon saree with silver thread jasmine motifs.',
   'Midnight Jasmine is poetry in motion — a fluid navy chiffon saree scattered with silver-thread jasmine motifs and a hand-finished blouse piece.',
   28500, 21900, 'formal-wear', '{sale}', '{Free}',
   '[{"name":"Midnight","hex":"#232a3d"},{"name":"Ink","hex":"#161b2a"}]', '{"#2c3450","#1a2032"}',
   9, false, false, false, 4.8, 42, '{saree,chiffon,formal}'),

  ('rosewater-luxe-organza-3-piece','HG-RL-1008','Rosewater Luxe Organza 3-Piece',
   'Powder-pink organza with thread embroidery & sheesha.',
   'Rosewater Luxe is delicate strength. Powder-pink organza layered over cotton silk, alive with thread embroidery and mirror sheesha — luxury pret at its most feminine.',
   32000, null, 'luxury-pret', '{festive-collection,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Rosewater","hex":"#f0d7d9"},{"name":"Petal","hex":"#e3bcc0"}]', '{"#f4dee0","#e1bcc0"}',
   7, true, true, true, 4.9, 76, '{organza,embroidered,sheesha,luxury}'),

  ('sandstone-comfort-cotton-set','HG-SC-1009','Sandstone Comfort Cotton Set',
   'Warm sandstone cotton co-ord with wooden buttons.',
   'Sandstone Comfort is the ease you deserve. A warm-toned cotton co-ord with wooden button detailing and relaxed tailoring — modest, breathable, effortless.',
   8500, null, 'casual-wear', '{new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Sandstone","hex":"#d8c3a5"},{"name":"Camel","hex":"#c2a680"}]', '{"#e0ccae","#c8ab84"}',
   24, false, false, true, 4.6, 58, '{cotton,co-ord,casual}'),

  ('emerald-empress-velvet-shawl-set','HG-EE-1010','Emerald Empress Velvet Shawl Set',
   'Emerald velvet suit with tilla-worked pashmina shawl.',
   'Emerald Empress is winter royalty. A rich emerald velvet suit finished with a tilla-embroidered pashmina shawl — warmth and grandeur in equal measure.',
   54000, 43200, 'festive-collection', '{formal-wear,sale}', '{XS,S,M,L,XL}',
   '[{"name":"Emerald","hex":"#1f5c46"},{"name":"Forest","hex":"#123f30"}]', '{"#256b52","#123f30"}',
   5, true, false, false, 4.9, 33, '{velvet,shawl,tilla,winter}'),

  ('pearl-whisper-formal-gown','HG-PW-1011','Pearl Whisper Formal Gown',
   'Ivory pearl-embellished flared gown with cape sleeves.',
   'Pearl Whisper is a modern fairytale. An ivory flared gown with cascading pearl embellishment and graceful cape sleeves — modest glamour for the evening.',
   46500, null, 'formal-wear', '{luxury-pret,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Pearl","hex":"#efe9dd"},{"name":"Champagne","hex":"#e2cfa6"}]', '{"#f1ebe0","#e2cfa6"}',
   8, false, true, true, 4.8, 61, '{gown,pearl,formal,evening}'),

  ('terracotta-sunset-printed-lawn','HG-TS-1012','Terracotta Sunset Printed Lawn',
   'Terracotta digital-print lawn 3-piece with chiffon dupatta.',
   'Terracotta Sunset captures golden hour. A warm digital-print lawn three-piece with a soft chiffon dupatta — vibrant, breezy and effortlessly graceful.',
   11200, 7900, 'casual-wear', '{sale,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Terracotta","hex":"#c1704b"},{"name":"Clay","hex":"#a85a38"}]', '{"#cf7f59","#a85a38"}',
   21, false, true, true, 4.7, 142, '{lawn,digital-print,casual,3-piece}')
on conflict (slug) do nothing;

-- ---------- Coupons ---------------------------------------------------------
insert into public.coupons (code, description, discount_type, amount, min_order, is_active) values
  ('GRACE10',  'Welcome offer — 10% off your first order',       'percent', 10, 0,     true),
  ('FESTIVE15','Festive season — 15% off orders over PKR 25,000', 'percent', 15, 25000, true),
  ('FREESHIP', 'Free shipping on any order',                      'fixed',   350, 0,   true)
on conflict (code) do nothing;

-- ---------- Banners ---------------------------------------------------------
insert into public.banners (title, subtitle, image_url, link_url, placement, sort_order, is_active) values
  ('Season End Sale', 'Up to 40% off — timeless elegance, irresistible prices', '/brand/hero-banner.png', '/shop/sale', 'home_hero', 1, true)
on conflict do nothing;

-- ---------- Settings --------------------------------------------------------
insert into public.settings (key, value) values
  ('store', '{
    "name": "Haneen Grace",
    "tagline": "Luxury Pret • Modest Wear",
    "currency": "PKR",
    "free_shipping_threshold": 15000,
    "shipping_fee": 350,
    "cod_enabled": true,
    "advance_payment_enabled": true,
    "advance_percent": 30,
    "phone": "+92 300 0000000",
    "email": "hello@haneengrace.com",
    "whatsapp": "+92 300 0000000",
    "instagram": "https://instagram.com/haneengrace"
  }'::jsonb)
on conflict (key) do update set value = excluded.value;

-- ---------- Bootstrap an admin ---------------------------------------------
-- After you sign up in the app, promote your account to admin by email:
--   update public.profiles set role = 'admin'
--   where email = 'you@example.com';
