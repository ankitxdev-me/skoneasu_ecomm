-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- e.g., 'Size', 'Color'
  variant_value TEXT NOT NULL, -- e.g., '10', 'Red'
  stock INTEGER DEFAULT 0,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
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

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  shipping_address_id UUID REFERENCES addresses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
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

-- RLS POLICIES (Basic Setup)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (true); -- Warning: open for demo

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (true); -- Warning: open for demo

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
