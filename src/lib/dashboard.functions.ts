import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDashboardData } from "@/integrations/supabase/dashboard.server";

export const fetchDashboardData = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    startDate: z.string(),
    endDate: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    return getDashboardData(data.startDate, data.endDate);
  });
