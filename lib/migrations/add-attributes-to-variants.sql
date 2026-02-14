-- Add attributes column to product_variants to support multi-dimensional variants
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS variant_name TEXT;

-- Example attributes: {"Size": "S", "Color": "Red"}
-- variant_name: "S / Red"

-- Existing variants will have empty attributes. 
-- We can migrate them if needed, but since the table was empty/re-created, it's fine.
