-- Tracked Engineers table for admin watchlist
CREATE TABLE IF NOT EXISTS public.tracked_engineers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  engineer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tracked_by text NOT NULL DEFAULT 'admin',
  reason text,
  tracked_at timestamptz DEFAULT now(),
  UNIQUE(engineer_id)
);

-- Enable RLS
ALTER TABLE public.tracked_engineers ENABLE ROW LEVEL SECURITY;

-- Allow full access via service role / anon key for admin app
CREATE POLICY "Allow full access for authenticated" ON public.tracked_engineers
  FOR ALL USING (true) WITH CHECK (true);
