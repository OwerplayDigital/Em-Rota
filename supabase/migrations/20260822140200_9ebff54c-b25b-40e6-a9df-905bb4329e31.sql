-- Add columns for platform-specific earnings
ALTER TABLE public.work_days 
ADD COLUMN uber_earned NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN ifood_earned NUMERIC(10,2) DEFAULT 0.00;

COMMENT ON COLUMN public.work_days.uber_earned IS 'Ganhos na plataforma Uber';
COMMENT ON COLUMN public.work_days.ifood_earned IS 'Ganhos na plataforma iFood';
