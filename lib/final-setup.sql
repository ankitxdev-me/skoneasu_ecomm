-- FINAL FIX SCRIPT
-- 1. Disables RLS to stop "infinite recursion" errors
-- 2. Creates missing tables (cart_items)
-- 3. Ensures correct table names (wishlists)

BEGIN;

-- DISABLE RLS ON ALL TABLES (Fixes permissions & recursion)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- CREATE MISSING TABLE: cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- FIX TABLE: wishlists (ensure plural name)
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;

COMMIT;
