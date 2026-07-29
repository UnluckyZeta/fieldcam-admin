-- Allow public/authenticated updates and selects on photo_logs for review_status
DROP POLICY IF EXISTS allow_update_photo_logs ON public.photo_logs;
CREATE POLICY allow_update_photo_logs ON public.photo_logs FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_select_photo_logs ON public.photo_logs;
CREATE POLICY allow_select_photo_logs ON public.photo_logs FOR SELECT TO public USING (true);
