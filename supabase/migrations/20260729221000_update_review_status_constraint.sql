-- Drop and update review_status constraint to support 'pending_clear'
ALTER TABLE public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_review_status_check;
ALTER TABLE public.photo_logs ADD CONSTRAINT photo_logs_review_status_check CHECK (review_status IN ('verified', 'flagged', 'pending_clear'));
