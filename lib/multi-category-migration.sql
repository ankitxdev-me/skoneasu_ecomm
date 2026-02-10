-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- RLS Object
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product categories are viewable by everyone" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert product categories" ON product_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update product categories" ON product_categories FOR UPDATE USING (true);
CREATE POLICY "Admins can delete product categories" ON product_categories FOR DELETE USING (true);

-- Migrate existing data
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id
FROM products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Optional: You can drop the category_id column from products later
-- ALTER TABLE products DROP COLUMN category_id;
