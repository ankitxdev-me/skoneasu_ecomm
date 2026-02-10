-- Safely recreate the INSERT policy for store_settings
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.store_settings;

CREATE POLICY "Enable insert for admins only" ON public.store_settings
  FOR INSERT WITH CHECK (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Ensure cod_enabled key exists in the table
INSERT INTO public.store_settings (key, value, description)
VALUES ('cod_enabled', 'true', 'Enable Cash on Delivery')
ON CONFLICT (key) DO NOTHING;
