-- ⚠️ INSTRUCTIONS:
-- 1. Replace 'PUT_EMAIL_HERE' with the actual email of the user you want to promote.
-- 2. Run this query in your Supabase SQL Editor.

UPDATE public.profiles
SET role = 'owner'
WHERE email = 'alexisrk310@gmail.com';

-- Verify the change
SELECT * FROM public.profiles WHERE role = 'owner';
