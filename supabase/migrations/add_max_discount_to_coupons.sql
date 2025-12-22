-- Add max_discount_amount column to coupons table
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10, 2);

COMMENT ON COLUMN coupons.max_discount_amount IS 'Maximum absolute discount amount for percentage-based coupons';
