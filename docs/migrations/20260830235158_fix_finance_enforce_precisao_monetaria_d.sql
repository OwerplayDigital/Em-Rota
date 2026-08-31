-- fix(finance): enforce precisão monetária de 2 casas decimais em todo o cálculo do Em Rota
-- Aplicada manualmente pelo usuário no editor de SQL do Lovable.
-- Registrada por GeckoAI em 2026-08-31T02:51:58.674Z

-- Money precision hardening for "Em Rota" (idempotent).
-- Enforce strict two-decimal monetary precision on all BRL columns.

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
