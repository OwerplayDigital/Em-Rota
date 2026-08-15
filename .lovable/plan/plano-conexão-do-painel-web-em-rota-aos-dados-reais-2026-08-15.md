# Plano - Conexão do Painel Web Em Rota aos Dados Reais

Conectar a interface visual do dashboard, histórico e desempenho aos dados reais do backend (tabelas `work_days` e `sessions`), mantendo a integridade do bot Telegram e o design aprovado.

## Etapas Técnicas

### 1. Camada de Dados (Backend)
- Criado `src/integrations/supabase/dashboard.server.ts` para centralizar a busca de dados no banco usando `supabaseAdmin` (necessário para acesso unificado dado o modelo de usuário único do projeto).
- Criado `src/lib/dashboard.functions.ts` com a Server Function `fetchDashboardData` para servir os dados ao frontend de forma segura.

### 2. Utilitários de Cálculo e Formatação
- Implementar `src/lib/dashboard-utils.ts` com lógica compartilhada para:
  - Formatação de data (brasileiro DD/MM/AAAA).
  - Cálculos de distância (odômetro), tempo (sessions), ganhos e médias (R$/h, R$/km, R$/entrega).
  - Filtros de período usando `America/Sao_Paulo`.
  - Tratamento de divisão por zero e estados vazios.

### 3. Integração Frontend
- **Dashboard (`src/routes/dashboard.tsx`)**:
  - Implementar `useSuspenseQuery` para carregar dados reais baseados no filtro selecionado.
  - Substituir mocks nos cards de indicadores e métricas de eficiência.
  - Implementar gráficos dinâmicos reais usando Recharts.
- **Histórico (`src/routes/historico.tsx`)**:
  - Listar jornadas reais ordenadas por data descrescente.
  - Implementar abertura do painel lateral com detalhes e lista de sessões do dia selecionado.
- **Desempenho (`src/routes/desempenho.tsx`)**:
  - Popular métricas avançadas e recordes com dados agregados.

### 4. Filtros e Estados
- Sincronizar o seletor de período (Hoje, 7 dias, etc.) com as datas de início/fim passadas para a query.
- Garantir que estados vazios exibam a mensagem "Sem registros neste período".

## Considerações de Segurança e Performance
- Uso de `createServerFn` para proteger a lógica de backend.
- Minimização de chamadas ao banco buscando dados em lote e derivando métricas no cliente/server fn.
- Nenhuma alteração no fluxo ou código do bot Telegram.
