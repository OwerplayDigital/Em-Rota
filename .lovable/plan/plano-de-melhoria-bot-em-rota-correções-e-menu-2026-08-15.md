# Plano de Melhoria: Bot EM ROTA - Correções e Menu

Implementar o fluxo de "CORRIGIR DIA", "REABRIR DIA" e melhorias de UX no bot Telegram "EM ROTA", mantendo o fuso horário America/Sao_Paulo e garantindo que o bot não exija /start após o fechamento.

## Alterações Propostas

### Backend (`src/integrations/supabase/telegram.server.ts`)

1. **Gestão de Estados de Correção**:
    - Implementar um sistema de estados persistentes no banco ou contexto para saber qual campo está sendo corrigido (ganhos, entregas, odômetro).
    - Criar o menu `CORRIGIR DIA` com botões: GANHOS, ENTREGAS, ODÔMETRO FINAL, REABRIR DIA, CANCELAR.

2. **Fluxos de Correção**:
    - **GANHOS**: Atualizar `total_earned` e recalcular médias.
    - **ENTREGAS**: Atualizar `total_deliveries` e recalcular R$/entrega.
    - **ODÔMETRO FINAL**: Validar `odometer_end >= odometer_start`, atualizar e recalcular distância/médias.

3. **Reabrir Dia**:
    - Alterar `work_day.status` para `in_progress`.
    - Preservar sessões e horários existentes.
    - Retornar ao menu operacional (INICIAR JORNADA, FECHAR DIA, MENU).

4. **UX e Menu Operacional**:
    - Garantir que `FECHAR DIA` mostre o resumo e o botão `CORRIGIR DIA`.
    - Remover "quantidade de sessões" do resumo.
    - Manter botões relevantes visíveis após cada ação (ex: após Encerrar Jornada, mostrar Iniciar Jornada e Fechar Dia).
    - Substituir todas as instâncias de "DIÁRIA" por "EM ROTA".

### Database (`public.work_days`)
- Adicionar uma coluna temporária ou utilizar um campo de metadados se necessário para rastrear o estado da conversa/correção (ou usar a lógica de "valor nulo" atual expandida). *Nota: Preferível usar a lógica de campos nulos/status para evitar mudanças de schema.*

## Plano de Verificação

- **Testes Manuais**:
    1. Fechar o dia e verificar se o botão `CORRIGIR DIA` aparece.
    2. Testar correção de cada campo e validar se as médias no resumo atualizam.
    3. Testar `REABRIR DIA` e verificar se `INICIAR JORNADA` volta a funcionar.
    4. Validar se o fuso horário America/Sao_Paulo permanece correto.
