-- MASTER RESET SCHEMA
-- This script completely resets the database to a clean, working state.
-- It fixes missing columns, table names, permissions, and constraints.
-- WARNING: ALL EXISTING DATA WILL BE DELETED.

BEGIN;

-- 1. Drop existing tables (clean slate)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create Tables

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  sku TEXT UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VARIANTS
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- e.g., 'Size', 'Color'
  variant_value TEXT NOT NULL, -- e.g., '10', 'Red'
  stock INTEGER DEFAULT 0,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WISHLIST (Plural: wishlists)
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- CART ITEMS
CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percent' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  expiry_date TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  coupon_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  product_image TEXT,
  variant_details JSONB,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable RLS on ALL tables (Simplifies dev, fixes "recursion" errors)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- 4. Grant Permissions (Public/Auth access)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Removes any conflicting Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 6. Insert Seed Data (Categories)
INSERT INTO categories (name, slug, description, image_url) VALUES
('Rings', 'rings', 'Elegant rings for every occasion', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'),
('Necklaces', 'necklaces', 'Stunning necklaces to highlight your style', 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800'),
('Earrings', 'earrings', 'Beautiful earrings that sparkle', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'),
('Bracelets', 'bracelets', 'Charm bracelets and bangles', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO NOTHING;

-- 7. Insert Sample Products (Safe Insert)
DO $$
DECLARE
  ring_id UUID;
  neck_id UUID;
BEGIN
  SELECT id INTO ring_id FROM categories WHERE slug = 'rings' LIMIT 1;
  SELECT id INTO neck_id FROM categories WHERE slug = 'necklaces' LIMIT 1;

  IF ring_id IS NOT NULL THEN
    INSERT INTO products (name, slug, description, price, category_id, featured, stock_quantity)
    VALUES ('Diamond Solitaire Ring', 'diamond-solitaire-ring', 'Classic 1 carat diamond ring', 45000, ring_id, true, 10);
  END IF;

  IF neck_id IS NOT NULL THEN
     INSERT INTO products (name, slug, description, price, category_id, featured, stock_quantity)
     VALUES ('Gold Chain Necklace', 'gold-chain-necklace', '18k Gold Chain', 25000, neck_id, true, 15);
  END IF;
END $$;

COMMIT;

-- Force refresh
NOTIFY pgrst, 'reload config';
