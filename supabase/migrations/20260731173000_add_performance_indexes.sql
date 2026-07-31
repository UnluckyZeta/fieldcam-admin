-- Migration: Add High-Performance B-Tree Indexes for Photo Logs
-- Accelerates queries across 100,000+ photo logs for Risk Center, Engineer Detail Pages, and Photo Verification.

-- 1. Accelerates Risk Center & Date Filtering (ORDER BY taken_at DESC)
CREATE INDEX IF NOT EXISTS idx_photo_logs_taken_at 
ON public.photo_logs (taken_at DESC);

-- 2. Accelerates Engineer Details Page (/engineers/[id])
CREATE INDEX IF NOT EXISTS idx_photo_logs_eng_taken 
ON public.photo_logs (engineer_id, taken_at DESC);

-- 3. Accelerates Unreviewed / Flagged Risk Center Audits
CREATE INDEX IF NOT EXISTS idx_photo_logs_review_status 
ON public.photo_logs (review_status) 
WHERE review_status IS NOT NULL;

-- 4. Accelerates 1-Click Verification Lookups (/verify?tag=FC-XXXXXX)
CREATE INDEX IF NOT EXISTS idx_photo_logs_photo_tag 
ON public.photo_logs (photo_tag);

-- 5. Accelerates Device Security & Multi-Device Audits
CREATE INDEX IF NOT EXISTS idx_photo_logs_device_id 
ON public.photo_logs (device_id, taken_at DESC);
