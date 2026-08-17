import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDashboardData, updateDailyGoal } from "@/integrations/supabase/dashboard.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED_EMAIL = "owertech82@gmail.com";

export const fetchDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    startDate: z.string(),
    endDate: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Backend security: double check authorized email
    if (context.claims.email !== ALLOWED_EMAIL) {
      throw new Error("Forbidden: Email not authorized");
    }
    return getDashboardData(data.startDate, data.endDate);
  });

export const saveDailyGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    goal: z.number()
  }).parse(data))
  .handler(async ({ data, context }) => {
    if (context.claims.email !== ALLOWED_EMAIL) {
      throw new Error("Forbidden: Email not authorized");
    }
    return updateDailyGoal(data.goal);
  });

