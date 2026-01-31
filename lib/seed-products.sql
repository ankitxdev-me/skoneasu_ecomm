-- Demo Luxury Jewelry Products
-- Execute this after the main schema

-- Insert sample products for Rings
INSERT INTO products (name, slug, description, short_description, price, discount_price, sku, stock_quantity, category_id, featured, best_seller, new_arrival) 
SELECT 
  'Eternal Diamond Solitaire Ring',
  'eternal-diamond-solitaire-ring',
  'A timeless symbol of eternal love, this stunning solitaire ring features a brilliant-cut diamond set in premium 18K white gold. The elegant 4-prong setting showcases the diamond''s natural brilliance while ensuring maximum security.',
  'Brilliant-cut diamond solitaire in 18K white gold',
  45000.00,
  39999.00,
  'RING-SOL-001',
  15,
  id,
  true,
  true,
  false
FROM categories WHERE slug = 'rings';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, best_seller) 
SELECT 
  'Rose Gold Infinity Band',
  'rose-gold-infinity-band',
  'Celebrate endless love with this exquisite infinity band crafted in lustrous 18K rose gold. Delicate diamond accents trace the infinity pattern, symbolizing eternal commitment and timeless elegance.',
  'Diamond infinity pattern in 18K rose gold',
  28500.00,
  'RING-INF-002',
  20,
  id,
  true
FROM categories WHERE slug = 'rings';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, new_arrival) 
SELECT 
  'Royal Sapphire Halo Ring',
  'royal-sapphire-halo-ring',
  'Make a statement with this magnificent sapphire halo ring. A deep blue Ceylon sapphire is encircled by a halo of brilliant diamonds, all set in platinum for a truly regal appearance.',
  'Ceylon sapphire with diamond halo in platinum',
  67000.00,
  'RING-SAP-003',
  8,
  id,
  true
FROM categories WHERE slug = 'rings';

-- Insert products for Earrings
INSERT INTO products (name, slug, description, short_description, price, discount_price, sku, stock_quantity, category_id, featured) 
SELECT 
  'Cascade Diamond Drop Earrings',
  'cascade-diamond-drop-earrings',
  'Elevate any ensemble with these breathtaking cascade drop earrings. Multiple tiers of brilliant diamonds create a stunning waterfall effect, set in 18K white gold for maximum sparkle.',
  'Multi-tier diamond drops in white gold',
  52000.00,
  48999.00,
  'EAR-CAS-001',
  12,
  id,
  true
FROM categories WHERE slug = 'earrings';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, best_seller, new_arrival) 
SELECT 
  'Pearl Elegance Studs',
  'pearl-elegance-studs',
  'Classic beauty meets contemporary design in these lustrous pearl stud earrings. Each perfectly matched South Sea pearl is crowned with a sparkling diamond in 18K yellow gold.',
  'South Sea pearls with diamond accents',
  18500.00,
  'EAR-PRL-002',
  25,
  id,
  true,
  true
FROM categories WHERE slug = 'earrings';

-- Insert products for Necklaces
INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, featured, best_seller) 
SELECT 
  'Heritage Diamond Riviera',
  'heritage-diamond-riviera',
  'A masterpiece of craftsmanship, this diamond riviera necklace features graduated brilliant-cut diamonds set in platinum. Each diamond is meticulously selected for perfect color and clarity.',
  'Graduated diamond necklace in platinum',
  185000.00,
  'NECK-RIV-001',
  5,
  id,
  true,
  true
FROM categories WHERE slug = 'necklaces';

INSERT INTO products (name, slug, description, short_description, price, discount_price, sku, stock_quantity, category_id, new_arrival) 
SELECT 
  'Emerald Blossom Pendant',
  'emerald-blossom-pendant',
  'Inspired by nature''s beauty, this pendant features a magnificent Colombian emerald surrounded by delicate diamond petals. The floral design is both timeless and romantic.',
  'Colombian emerald with diamond petals',
  42000.00,
  38999.00,
  'NECK-EME-002',
  10,
  id,
  true
FROM categories WHERE slug = 'necklaces';

-- Insert products for Bracelets
INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, featured) 
SELECT 
  'Diamond Tennis Bracelet',
  'diamond-tennis-bracelet',
  'The ultimate in classic elegance, this tennis bracelet features a continuous line of perfectly matched round brilliant diamonds in 18K white gold. A timeless addition to any jewelry collection.',
  'Continuous diamond line in white gold',
  95000.00,
  'BRAC-TEN-001',
  7,
  id,
  true
FROM categories WHERE slug = 'bracelets';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, best_seller) 
SELECT 
  'Rose Gold Charm Bangle',
  'rose-gold-charm-bangle',
  'A modern classic, this sleek bangle in 18K rose gold features removable diamond-accented charms that allow for personal customization. Perfect for everyday elegance.',
  'Customizable charm bangle in rose gold',
  32000.00,
  'BRAC-CHA-002',
  18,
  id,
  true
FROM categories WHERE slug = 'bracelets';

-- Insert product images for the first few products
INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 1
FROM products WHERE slug = 'eternal-diamond-solitaire-ring';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800', 2
FROM products WHERE slug = 'eternal-diamond-solitaire-ring';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800', 1
FROM products WHERE slug = 'rose-gold-infinity-band';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 1
FROM products WHERE slug = 'royal-sapphire-halo-ring';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 1
FROM products WHERE slug = 'cascade-diamond-drop-earrings';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1624446767831-4f1ab36b4cb5?w=800', 1
FROM products WHERE slug = 'pearl-elegance-studs';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 1
FROM products WHERE slug = 'heritage-diamond-riviera';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1610694955152-6a0dc8ddb8e6?w=800', 1
FROM products WHERE slug = 'emerald-blossom-pendant';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800', 1
FROM products WHERE slug = 'diamond-tennis-bracelet';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 1
FROM products WHERE slug = 'rose-gold-charm-bangle';

-- Insert product variants (sizes for rings)
INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
SELECT id, 'Size', '5', 3, 0
FROM products WHERE slug = 'eternal-diamond-solitaire-ring';

INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
SELECT id, 'Size', '6', 5, 0
FROM products WHERE slug = 'eternal-diamond-solitaire-ring';

INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
SELECT id, 'Size', '7', 4, 0
FROM products WHERE slug = 'eternal-diamond-solitaire-ring';

INSERT INTO product_variants (product_id, variant_type, variant_value, stock, price_modifier)
SELECT id, 'Size', '8', 3, 0
FROM products WHERE slug = 'eternal-diamond-solitaire-ring';

-- Insert a sample coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, usage_limit, active)
VALUES ('WELCOME10', 'percent', 10, 10000, 5000, NOW() + INTERVAL '30 days', 100, true);

INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, usage_limit, active)
VALUES ('LUXURY2000', 'fixed', 2000, 30000, NOW() + INTERVAL '60 days', 50, true);
