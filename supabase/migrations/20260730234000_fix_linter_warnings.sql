-- Migration: Fix Supabase Linter Warnings
-- 1. Fix Function Search Paths (function_search_path_mutable)
-- 2. Revoke public/anon/authenticated EXECUTE on dangerous RPC functions (anon_security_definer_function_executable)
-- 3. Cleanup test tables and tighten administrative RLS policies (rls_policy_always_true)

-- ==========================================
-- 1. Fix Function Search Paths
-- ==========================================

DO $$
BEGIN
  -- force_photo_logs_synced_at_now
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'force_photo_logs_synced_at_now') THEN
    ALTER FUNCTION public.force_photo_logs_synced_at_now() SET search_path = public, pg_temp;
  END IF;

  -- delete_all_auth_users
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'delete_all_auth_users') THEN
    ALTER FUNCTION public.delete_all_auth_users() SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.delete_all_auth_users() FROM anon, authenticated, public;
  END IF;

  -- handle_admin_device_logging
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'handle_admin_device_logging') THEN
    ALTER FUNCTION public.handle_admin_device_logging() SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.handle_admin_device_logging() FROM anon, authenticated, public;
  END IF;

  -- handle_new_user
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
  END IF;

  -- get_server_time
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'get_server_time') THEN
    ALTER FUNCTION public.get_server_time() SET search_path = public, pg_temp;
  END IF;
END;
$$;


-- ==========================================
-- 2. Cleanup Test Tables & Overly Permissive Policies
-- ==========================================

-- Drop temporary test table if exists
DROP TABLE IF EXISTS public.rls_test CASCADE;

-- Tighten admin_users policies: keep SELECT for admin lookup, restrict INSERT/UPDATE
DROP POLICY IF EXISTS allow_public_insert_admin_users ON public.admin_users;
DROP POLICY IF EXISTS allow_public_update_admin_users ON public.admin_users;

-- Keep selective access for admin users
CREATE POLICY allow_admin_users_select ON public.admin_users FOR SELECT TO public USING (true);
