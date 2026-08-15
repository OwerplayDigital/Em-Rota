import { supabaseAdmin } from './src/integrations/supabase/client.server';

async function cleanup() {
  console.log('Iniciando limpeza...');
  try {
    // A deleção de work_days deve limpar sessions devido ao ON DELETE CASCADE
    const { count: wdCount, error: wdError } = await supabaseAdmin
      .from('work_days')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (wdError) throw wdError;
    console.log('Registros de teste removidos.');

    // Validação final
    const { count: wdFinal } = await supabaseAdmin.from('work_days').select('*', { count: 'exact', head: true });
    const { count: sFinal } = await supabaseAdmin.from('sessions').select('*', { count: 'exact', head: true });

    console.log(`Validação: work_days=${wdFinal}, sessions=${sFinal}`);
    console.log('SUCCESS: Limpeza concluída.');
  } catch (err) {
    console.error('ERRO:', err);
    process.exit(1);
  }
}

cleanup();
