# Evolução do Fluxo CORRIGIR DIA — EM ROTA

Este plano detalha a implementação das melhorias no bot Telegram do sistema EM ROTA, permitindo correções retroativas de horários, odômetros, ganhos e entregas, além da adição de novas jornadas.

## Objetivos
- Permitir correção de Horário de Início/Fim, Odômetro Inicial/Final, Ganhos e Entregas via Telegram.
- Implementar funcionalidade de adicionar jornadas retroativas.
- Suportar seleção de jornada específica quando houver múltiplas jornadas no dia.
- Garantir recálculos automáticos de métricas e suporte a valores decimais.
- Manter compatibilidade com funcionalidades existentes e UX Dark Premium.

## Etapas de Implementação

### 1. Preparação e Investigação
- Identificar fluxos atuais de correção em `src/integrations/supabase/telegram.server.ts`.
- Verificar relacionamentos entre `work_days` e `sessions`.

### 2. Atualização dos Menus e Estados
- Modificar `correctionMenu` para incluir as novas opções.
- Implementar novos estados explícitos em `notes` (ex: `CORRECT:SELECT_SESSION`, `CORRECT:START_TIME`, `ADDSESSION:START_TIME`).
- Adicionar suporte a `VOLTAR` e `CANCELAR` em todas as etapas.

### 3. Implementação dos Handlers de Correção
- **Seleção de Jornada**: Se houver >1 jornada, perguntar qual deseja corrigir exibindo os horários.
- **Horários**: Validar formato (ex: `09:35`, `9:35`) e garantir que Fim >= Início.
- **Odômetros**: Suportar `,` e `.` como separadores decimais, converter para `parseFloat`.
- **Ganhos e Entregas**: Validar tipos e converter adequadamente.

### 4. Funcionalidade ADICIONAR JORNADA
- Criar fluxo para solicitar Início e Odômetro Inicial.
- Validar duplicidade antes de inserir na tabela `sessions`.
- Vincular automaticamente ao `work_day` de hoje (America/Sao_Paulo).

### 5. Recálculos e Resumo
- Após qualquer correção, disparar lógica de recálculo de métricas.
- Exibir confirmação curta com os novos valores (ex: `13,3 km`).

### 6. Validação e Testes
- Testar cada campo de correção individualmente.
- Validar fluxos com múltiplas jornadas.
- Garantir que odômetros decimais não quebrem o painel web (já preparado na etapa anterior).

## Detalhes Técnicos
- **Timezone**: Fixo em `America/Sao_Paulo`.
- **Formatação**: Brasileiro (`DD/MM/AAAA`, `R$ 0,00`).
- **Persistência**: Estados salvos na coluna `notes` da tabela `work_days`.
- **Segurança**: Validação de `TELEGRAM_ALLOWED_USER_ID`.
