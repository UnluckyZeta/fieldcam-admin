-- Allow public/anon read access on profiles for admin user lookup and search
DROP POLICY IF EXISTS allow_public_select_profiles ON public.profiles;
CREATE POLICY allow_public_select_profiles ON public.profiles FOR SELECT TO public USING (true);
