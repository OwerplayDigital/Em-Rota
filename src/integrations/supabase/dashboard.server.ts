import { supabaseAdmin } from './client.server';

export const getDashboardData = async (startDate: string, endDate: string) => {
  if (!startDate || !endDate) throw new Error("startDate and endDate are required");

  // Fetch active day (today) for goal configuration
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: todayDay } = await supabaseAdmin
    .from('work_days')
    .select('daily_goal')
    .eq('date', todayStr)
    .maybeSingle();

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

  return { workDays, sessions, todayGoal: todayDay?.daily_goal || null };
};

export const updateDailyGoal = async (goal: number) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Check if day exists
  const { data: existing } = await supabaseAdmin
    .from('work_days')
    .select('id')
    .eq('date', todayStr)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('work_days')
      .update({ daily_goal: goal })
      .eq('id', (existing as any).id);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('work_days')
      .insert({ 
        date: todayStr, 
        daily_goal: goal,
        status: 'in_progress' 
      } as any);
    if (error) throw error;
  }
  
  return { success: true };
};