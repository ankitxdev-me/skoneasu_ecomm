-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  expiry_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can do everything
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Public can read active coupons (needed for validation?) 
-- Actually, validation should probably be an RPC or server-side only to prevent scraping.
-- But for now, let's allow read for validation logic if needed, or keep it strict.
-- Better to keep it strict and verify via API with Service Role or just Admin check? 
-- The user validation API will use Service Role to read coupons securely.

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
