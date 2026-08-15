import { supabaseAdmin } from './integrations/supabase/client.server';

async function cleanup() {
  console.log('Limpando registros...');
  try {
    const { error: wdError } = await supabaseAdmin
      .from('work_days')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (wdError) throw wdError;
    
    const { count: wdFinal } = await supabaseAdmin.from('work_days').select('*', { count: 'exact', head: true });
    const { count: sFinal } = await supabaseAdmin.from('sessions').select('*', { count: 'exact', head: true });

    console.log(`WORK_DAYS: ${wdFinal} REGISTROS`);
    console.log(`SESSIONS: ${sFinal} REGISTROS`);
    console.log('ERRO: NENHUM');
  } catch (err) {
    console.error('ERRO:', err.message);
    process.exit(1);
  }
}

cleanup();
