-- Fix permissions/RLS for public viewing
BEGIN;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON product_variants;
CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);

COMMIT;
