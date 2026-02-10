-- Create a table for store settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read settings (needed for frontend to display shipping costs)
CREATE POLICY "Enable read access for all users" ON public.store_settings
  FOR SELECT USING (true);

-- Allow only admins to update settings
CREATE POLICY "Enable update for admins only" ON public.store_settings
  FOR UPDATE USING (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  ) WITH CHECK (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Insert default values if not exists
INSERT INTO public.store_settings (key, value, description)
VALUES 
  ('shipping_fee', '70', 'Standard shipping fee in INR'),
  ('free_shipping_threshold', '999', 'Minimum order value for free shipping in INR')
ON CONFLICT (key) DO NOTHING;
