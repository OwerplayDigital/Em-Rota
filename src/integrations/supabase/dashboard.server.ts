import { supabaseAdmin } from './client.server';

export const getDashboardData = async (startDate: string, endDate: string) => {
  // We use supabaseAdmin to bypass RLS for the user as this is a single-user system (TELEGRAM_ALLOWED_USER_ID)
  // The client will call this via server function which is safe.
  
  // Fetch work days in range
  const { data: workDays, error: wdError } = await supabaseAdmin
    .from('work_days')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (wdError) throw wdError;

  // Fetch all sessions for these work days
  const workDayIds = workDays.map(wd => wd.id);
  
  let sessions: any[] = [];
  if (workDayIds.length > 0) {
    const { data: sessData, error: sessError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .in('work_day_id', workDayIds)
      .eq('status', 'completed');
    
    if (sessError) throw sessError;
    sessions = sessData || [];
  }

  return { workDays, sessions };
};
