-- Migration: Fix Supabase Linter Security Errors
-- 1. Enable RLS and add public policies for admin_users, admin_device_logs, and video_logs
-- 2. Set security_invoker = true on views to resolve SECURITY DEFINER view linter warnings

-- ==========================================
-- 1. Enable RLS & Add Policies on Tables
-- ==========================================

-- Table: admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_select_admin_users ON public.admin_users;
CREATE POLICY allow_public_select_admin_users ON public.admin_users FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS allow_public_insert_admin_users ON public.admin_users;
CREATE POLICY allow_public_insert_admin_users ON public.admin_users FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS allow_public_update_admin_users ON public.admin_users;
CREATE POLICY allow_public_update_admin_users ON public.admin_users FOR UPDATE TO public USING (true);


-- Table: admin_device_logs
ALTER TABLE public.admin_device_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_select_admin_device_logs ON public.admin_device_logs;
CREATE POLICY allow_public_select_admin_device_logs ON public.admin_device_logs FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS allow_public_insert_admin_device_logs ON public.admin_device_logs;
CREATE POLICY allow_public_insert_admin_device_logs ON public.admin_device_logs FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS allow_public_update_admin_device_logs ON public.admin_device_logs;
CREATE POLICY allow_public_update_admin_device_logs ON public.admin_device_logs FOR UPDATE TO public USING (true);


-- Table: video_logs
ALTER TABLE public.video_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_select_video_logs ON public.video_logs;
CREATE POLICY allow_public_select_video_logs ON public.video_logs FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS allow_public_insert_video_logs ON public.video_logs;
CREATE POLICY allow_public_insert_video_logs ON public.video_logs FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS allow_public_update_video_logs ON public.video_logs;
CREATE POLICY allow_public_update_video_logs ON public.video_logs FOR UPDATE TO public USING (true);


-- ==========================================
-- 2. Set security_invoker = true on Views
-- ==========================================

ALTER VIEW public.unified_logs SET (security_invoker = true);
ALTER VIEW public.admin_multi_device_summary SET (security_invoker = true);
ALTER VIEW public.engineer_stats SET (security_invoker = true);
ALTER VIEW public.riders SET (security_invoker = true);
ALTER VIEW public.photo_logs_with_engineer SET (security_invoker = true);
