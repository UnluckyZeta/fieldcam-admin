-- Migration: Add ota_version column to photo_logs and update photo_logs_with_engineer view

ALTER TABLE public.photo_logs
ADD COLUMN IF NOT EXISTS ota_version text;

CREATE OR REPLACE VIEW public.photo_logs_with_engineer AS
SELECT
  pl.id,
  pl.engineer_id,
  pl.engineer_code,
  pl.device_id,
  pl.latitude,
  pl.longitude,
  pl.accuracy,
  pl.altitude,
  pl.speed,
  pl.heading,
  pl.address,
  pl.taken_at,
  pl.device_timezone,
  pl.captured_online,
  pl.network_type,
  pl.synced_at,
  pl.signature,
  pl.photo_tag,
  pl.time_confidence,
  pl.review_status,
  pl.reviewed_at,
  pl.reviewed_by,
  pl.mocked,
  p.full_name,
  p.email,
  p.phone,
  p.region,
  pl.ota_version
FROM public.photo_logs pl
LEFT JOIN public.profiles p ON pl.engineer_id = p.id;
