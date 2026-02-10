-- Add variant_id column to order_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'variant_id'
    ) THEN
        ALTER TABLE order_items
        ADD COLUMN variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Verify FK or add it if column existed but FK didn't (safeguard)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_variant_id_fkey'
    ) THEN
        ALTER TABLE order_items
        ADD CONSTRAINT order_items_variant_id_fkey
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE SET NULL;
    END IF;
END $$;
