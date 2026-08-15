# Plano — Painel Web EM ROTA

Criar a experiência visual Dark Premium e a estrutura de navegação do painel web para visualização de dados do projeto EM ROTA.

## Objetivos
- Implementar Design System Dark Premium.
- Criar navegação lateral (Sidebar) elegante.
- Desenvolver páginas de Dashboard, Histórico e Desempenho.
- Garantir responsividade total.

## Detalhes Técnicos
- **Design**: Tailwind CSS v4 com tokens semânticos (Dark Mode fixo).
- **Navegação**: TanStack Router (novas rotas `/dashboard`, `/historico`, `/desempenho`).
- **Componentes**: Lucide React para ícones minimalistas, Shadcn para UI básica customizada.
- **Gráficos**: Recharts para visualizações de desempenho.

## Etapas
1.  **Fundação**: Configurar layout mestre em `__root.tsx` ou layout dedicado com Sidebar.
2.  **Dashboard**: Cards de resumo (Ganhos, Entregas, Tempo, Distância) e gráficos de evolução.
3.  **Histórico**: Tabela elegante com estados de visualização e detalhes expansíveis.
4.  **Desempenho**: Métricas calculadas (R$/h, R$/km) com estados vazios.
5.  **Refinamento**: Microinterações e ajustes de responsividade mobile.
