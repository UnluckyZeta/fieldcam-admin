-- Migration: Force synced_at to ALWAYS be set by PostgreSQL server NOW() on INSERT
-- Prevents any client payload from faking or overriding the server sync timestamp

CREATE OR REPLACE FUNCTION public.force_photo_logs_synced_at_now()
RETURNS TRIGGER AS $$
BEGIN
  NEW.synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_force_photo_logs_synced_at ON public.photo_logs;

CREATE TRIGGER trg_force_photo_logs_synced_at
BEFORE INSERT ON public.photo_logs
FOR EACH ROW
EXECUTE FUNCTION public.force_photo_logs_synced_at_now();
