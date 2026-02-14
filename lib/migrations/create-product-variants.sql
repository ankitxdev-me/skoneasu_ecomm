-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_type TEXT NOT NULL, -- e.g., 'Size', 'Color', 'Material'
    variant_value TEXT NOT NULL, -- e.g., 'XL', 'Red', 'Gold'
    price_modifier DECIMAL(10, 2) DEFAULT 0, -- Added to base price
    stock INTEGER DEFAULT 0, -- Changed from stock_quantity to stock to match API usage
    sku TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public read access
CREATE POLICY "Public can view product variants" 
    ON product_variants FOR SELECT 
    USING (true);

-- Admin full access
CREATE POLICY "Admins can manage product variants" 
    ON product_variants FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
