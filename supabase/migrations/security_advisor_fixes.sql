-- Security Advisor Fixes
-- 1. Fix "Function Search Path Mutable"
--    Sets the search_path to 'public' to prevent search path hijacking vulnerabilities.

ALTER FUNCTION public.handle_default_address() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- For link_guest_orders, we infer signature from usage in src/actions/guest-linker.ts
-- If this fails due to signature mismatch, try running without arguments if the name is unique:
-- ALTER FUNCTION public.link_guest_orders SET search_path = public;
ALTER FUNCTION public.link_guest_orders(p_email text, p_user_id uuid) SET search_path = public;


-- 2. Ensure Guest Access Policies Exist BEFORE Enabling RLS
--    This is critical because enabling RLS on orders/order_items without guest policies WILL BREAK guest checkout.
--    We use DROP IF EXISTS to avoid errors if they already exist, and then (re)create them to ensure they are correct.

-- Orders: Guests (Anon) can insert orders if user_id is NULL
DROP POLICY IF EXISTS "Guests can insert orders" ON public.orders;
CREATE POLICY "Guests can insert orders" ON public.orders FOR INSERT 
WITH CHECK (
    auth.role() = 'anon' 
    AND user_id IS NULL
);

-- Order Items: Guests (Anon) can insert items. 
-- Ideally we check if they own the order, but for anonymous insert we just allow it if the linked order is guest.
DROP POLICY IF EXISTS "Guests can insert order items" ON public.order_items;
CREATE POLICY "Guests can insert order items" ON public.order_items FOR INSERT 
WITH CHECK (
    auth.role() = 'anon' 
    AND exists (
        select 1 from public.orders 
        where id = order_items.order_id 
        and user_id IS NULL
    )
);

-- 3. Fix "Policy Exists RLS Disabled" and "RLS Disabled in Public"
--    Enables Row Level Security on the tables.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Note: "Leaked Password Protection Disabled" must be fixed in Supabase Dashboard:
-- Go to Authentication > Security > Enable Leaked Password Protection.
