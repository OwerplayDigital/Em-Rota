import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Sao_Paulo';

export const getDatesForPeriod = (period: string) => {
  const now = new Date();
  const zonedNow = toZonedTime(now, TIMEZONE);
  
  let start: Date;
  let end: Date = endOfDay(zonedNow);

  switch (period) {
    case 'Hoje':
      start = startOfDay(zonedNow);
      break;
    case '7 dias':
      start = startOfDay(subDays(zonedNow, 6));
      break;
    case 'Este mês':
      start = startOfMonth(zonedNow);
      break;
    case 'Este ano':
      start = startOfYear(zonedNow);
      break;
    default:
      start = startOfDay(zonedNow);
  }

  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
};

export const formatDateBR = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const formatTimeBR = (date: string | Date) => {
  if (!date) return '-';
  const zonedDate = toZonedTime(new Date(date), TIMEZONE);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  }).format(zonedDate);
};

export const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateMetrics = (workDays: any[], sessions: any[]) => {
  const totalEarned = workDays.reduce((acc, wd) => acc + (wd.total_earned || 0), 0);
  const totalUber = workDays.reduce((acc, wd) => acc + (wd.uber_earned || 0), 0);
  const totalIfood = workDays.reduce((acc, wd) => acc + (wd.ifood_earned || 0), 0);
  const totalDeliveries = workDays.reduce((acc, wd) => acc + (wd.total_deliveries || 0), 0);
  
  const totalDistance = workDays.reduce((acc, wd) => {
    if (wd.odometer_start !== null && wd.odometer_end !== null) {
      return acc + (Number(wd.odometer_end) - Number(wd.odometer_start));
    }
    return acc;
  }, 0);

  const totalMs = sessions.reduce((acc, s) => {
    if (s.start_time && s.end_time) {
      return acc + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime());
    }
    return acc;
  }, 0);

  const totalHours = totalMs / 3600000;

  return {
    totalEarned,
    totalUber,
    totalIfood,
    totalDeliveries,
    totalDistance,
    totalMs,
    totalHours,
    avgPerHour: totalHours > 0 ? totalEarned / totalHours : 0,
    avgPerKm: totalDistance > 0 ? totalEarned / totalDistance : 0,
    avgPerDelivery: totalDeliveries > 0 ? totalEarned / totalDeliveries : 0,
    deliveriesPerHour: totalHours > 0 ? totalDeliveries / totalHours : 0,
  };
};

export const calculateGoalMetrics = (workDays: any[], goal: number | null) => {
  if (goal === null) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = workDays.find(wd => wd.date === todayStr);
  const earnings = todayData?.total_earned || 0;
  
  const progress = (earnings / goal) * 100;
  const remaining = Math.max(0, goal - earnings);
  const isReached = earnings >= goal;

  return {
    goal,
    earnings,
    progress,
    remaining,
    isReached
  };
};

export const getChartData = (workDays: any[], sessions: any[]) => {
  // Group by date
  const dayMap = new Map();
  
  workDays.forEach(wd => {
    const metrics = calculateMetrics([wd], sessions.filter(s => s.work_day_id === wd.id));
    dayMap.set(wd.date, {
      date: wd.date,
      label: formatDateBR(wd.date),
      displayDate: formatDateBR(wd.date).split('/')[0],
      earned: metrics.totalEarned,
      deliveries: metrics.totalDeliveries,
      hours: metrics.totalHours,
    });
  });

  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};
