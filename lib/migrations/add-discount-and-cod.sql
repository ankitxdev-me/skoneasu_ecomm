-- Add discount column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;

-- Add COD setting to store_settings
INSERT INTO store_settings (key, value)
VALUES ('cod_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
