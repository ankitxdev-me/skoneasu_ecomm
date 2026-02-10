-- FORCE ENABLE PUBLIC ACCESS
-- Run this to fix "Failed to load product" errors

BEGIN;

-- 1. Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

-- 2. Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Products" ON products;
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);

-- 3. Product Images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Images" ON product_images;
CREATE POLICY "Public Read Images" ON product_images FOR SELECT USING (true);

-- 4. Product Variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Variants" ON product_variants;
CREATE POLICY "Public Read Variants" ON product_variants FOR SELECT USING (true);

-- 5. Reviews (for product details page)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Reviews" ON reviews;
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);

COMMIT;
