-- Money precision hardening for Em Rota.
-- The application currently names these fields:
--   ifood_earned  = ganhos_ifood
--   uber_earned   = ganhos_uber
--   total_earned  = faturamento_total
-- Extra/Particular is derived from total_earned - platform earnings, so it is
-- calculated in integer cents in the application rather than stored twice.

ALTER TABLE public.work_days
  ALTER COLUMN ifood_earned TYPE numeric(10,2)
    USING CASE WHEN ifood_earned IS NULL THEN NULL ELSE round(ifood_earned::numeric, 2) END,
  ALTER COLUMN uber_earned TYPE numeric(10,2)
    USING CASE WHEN uber_earned IS NULL THEN NULL ELSE round(uber_earned::numeric, 2) END,
  ALTER COLUMN total_earned TYPE numeric(10,2)
    USING CASE WHEN total_earned IS NULL THEN NULL ELSE round(total_earned::numeric, 2) END,
  ALTER COLUMN daily_goal TYPE numeric(10,2)
    USING CASE WHEN daily_goal IS NULL THEN NULL ELSE round(daily_goal::numeric, 2) END;

COMMENT ON COLUMN public.work_days.ifood_earned IS 'Ganhos iFood em BRL, exatamente 2 casas decimais.';
COMMENT ON COLUMN public.work_days.uber_earned IS 'Ganhos Uber em BRL, exatamente 2 casas decimais.';
COMMENT ON COLUMN public.work_days.total_earned IS 'Faturamento total em BRL, exatamente 2 casas decimais.';
COMMENT ON COLUMN public.work_days.daily_goal IS 'Meta diária em BRL, exatamente 2 casas decimais.';
