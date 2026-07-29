-- Add mocked column to public.photo_logs
ALTER TABLE public.photo_logs
ADD COLUMN IF NOT EXISTS mocked boolean DEFAULT false;

-- Drop the view first to avoid column mismatch issues
DROP VIEW IF EXISTS public.photo_logs_with_engineer CASCADE;

-- Recreate view public.photo_logs_with_engineer including mocked
CREATE OR REPLACE VIEW public.photo_logs_with_engineer AS
SELECT 
  p.id,
  p.engineer_id,
  p.engineer_code,
  p.device_id,
  p.latitude,
  p.longitude,
  p.accuracy,
  p.altitude,
  p.speed,
  p.heading,
  p.address,
  p.taken_at,
  p.device_timezone,
  p.captured_online,
  p.network_type,
  p.synced_at,
  p.signature,
  p.photo_tag,
  p.time_confidence,
  p.review_status,
  p.reviewed_at,
  p.reviewed_by,
  p.mocked,
  eng.full_name,
  eng.email,
  eng.phone,
  eng.region
FROM public.photo_logs p
LEFT JOIN public.profiles eng ON p.engineer_id = eng.id;
