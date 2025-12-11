-- FIX: Allow user deletion by cascading favorites
-- The error "violates foreign key constraint" happens because we try to delete a user
-- who still has records in the 'favorites' table.

-- 1. Drop the old strict constraint
ALTER TABLE public.favorites
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- 2. Add new constraint with ON DELETE CASCADE
-- This means: When a User is deleted, automatically delete their Favorites.
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
