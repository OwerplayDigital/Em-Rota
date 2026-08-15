ALTER TABLE public.work_days ADD COLUMN IF NOT EXISTS notes TEXT;
GRANT ALL ON public.work_days TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_days TO authenticated;