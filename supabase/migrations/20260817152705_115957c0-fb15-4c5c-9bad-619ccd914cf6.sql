ALTER TABLE public.work_days ADD COLUMN IF NOT EXISTS daily_goal numeric(10,2);
GRANT ALL ON public.work_days TO authenticated;
GRANT ALL ON public.work_days TO service_role;