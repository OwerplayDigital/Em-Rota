# Evolução Visual e Funcional: Separação Uber/iFood

Este plano detalha a implementação da separação de ganhos entre as plataformas Uber e iFood, abrangendo desde o banco de dados até o Bot do Telegram e o Painel Web.

## Alterações Técnicas

### 1. Banco de Dados (Supabase)
- **Migração:** Adição das colunas `uber_earned` e `ifood_earned` (ambas `numeric(10,2)` com default `0`).
- **Lógica de Integridade:** `total_earned` passará a ser a soma de `uber_earned + ifood_earned`.

### 2. Bot do Telegram (`telegram.server.ts`)
- **Novo Fluxo de Ganhos:** Ao registrar ou corrigir ganhos, o bot solicitará a plataforma (Uber ou iFood).
- **Interface:** Inclusão de botões de seleção de plataforma após a entrada do valor.
- **Persistência:** Atualização das colunas específicas e do total consolidado no banco.

### 3. Backend do Dashboard (`dashboard-utils.ts`)
- **Novas Métricas:** Implementação de cálculos para `totalUber` e `totalIfood` no utilitário de métricas.
- **Consistência:** Garantir que todos os cálculos de eficiência utilizem o valor total consolidado.

### 4. Interface Web (Dashboard)
- **Visualização Proporcional:** Inclusão de um card de "Distribuição por Plataforma" com barras de progresso ou cores distintas para Uber e iFood.
- **Detalhamento:** Exibição dos valores individuais por plataforma nos cards de resumo e histórico.

## Resumo de Diagnóstico
STATUS: PLANEJAMENTO
CAUSA: Necessidade de diferenciar a origem dos ganhos entre plataformas.
CORREÇÃO: Alteração de schema, lógica de bot e componentes de visualização.
PRÓXIMO PASSO: Executar migração de banco de dados e atualizar lógica do bot.
