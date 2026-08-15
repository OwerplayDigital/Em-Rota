import { supabaseAdmin } from './integrations/supabase/client.server';

async function cleanup() {
  console.log('Starting cleanup...');
  try {
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (sessionError) throw sessionError;
    console.log('Sessions cleaned.');

    const { error: workDayError } = await supabaseAdmin
      .from('work_days')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (workDayError) throw workDayError;
    console.log('Work days cleaned.');

    console.log('SUCCESS: Cleanup complete.');
  } catch (err) {
    console.error('ERROR during cleanup:', err);
    process.exit(1);
  }
}

cleanup();
