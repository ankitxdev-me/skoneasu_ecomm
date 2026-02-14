-- Create a function to atomically check and apply a coupon
CREATE OR REPLACE FUNCTION public.apply_coupon(coupon_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  -- Select the coupon with row locking to prevent race conditions
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = coupon_code
  AND active = true
  FOR UPDATE;

  -- 1. Check if coupon exists
  IF v_coupon IS NULL THEN
    RAISE EXCEPTION 'Invalid coupon code';
  END IF;

  -- 2. Check Expiry
  IF v_coupon.expiry_date IS NOT NULL AND v_coupon.expiry_date < NOW() THEN
    RAISE EXCEPTION 'Coupon has expired';
  END IF;

  -- 3. Check Usage Limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RAISE EXCEPTION 'Coupon usage limit reached';
  END IF;

  -- 4. Increment usage count
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = v_coupon.id;

  -- Return the coupon data
  RETURN row_to_json(v_coupon);
END;
$$;
