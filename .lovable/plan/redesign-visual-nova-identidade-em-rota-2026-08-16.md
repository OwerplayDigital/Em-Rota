# Redesign Visual - Nova Identidade EM ROTA

Evolução da identidade visual do painel web para um tema claro premium e tecnológico, focado em Azul Profundo e Azul Elétrico, transmitindo movimento e desempenho.

## Alterações Visuais

### Sistema de Design (CSS)
- Atualização das variáveis semânticas no `src/styles.css` para a nova paleta.
- Fundo: Azul acinzentado muito suave (`oklch(0.98 0.01 264)`).
- Primária (Ação): Azul Elétrico vibrante (`oklch(0.55 0.22 264)`).
- Estrutural: Azul Profundo (`oklch(0.20 0.04 264)`).
- Cards/Superfícies: Branco puro ou levemente azulado com bordas sutis.

### Layout e Componentes
- **Sidebar**: Fundo em Azul Profundo com transparência e desfoque, itens ativos em Azul Elétrico.
- **Header**: Refinamento tipográfico e adição de microdetalhes de movimento.
- **Cards de Métricas**: Destaque visual para "GANHOS", tipografia forte para valores numéricos, bordas arredondadas generosas.
- **Gráficos**: Paleta consistente em tons de azul, grids discretos e tooltips de alto contraste.
- **Tabelas (Histórico)**: Estilo limpo, linhas sutis e destaque para rentabilidade.

### Mobile
- Preservação da grade 2x2 para indicadores e métricas.
- Otimização do espaçamento para leitura rápida em movimento.

## Detalhes Técnicos
- Utilização de tokens `oklch` para precisão de cores.
- `framer-motion` para transições suaves de estado.
- Tailwind CSS v4 para estilização baseada em tokens.
- Nenhuma alteração em: banco de dados, lógica de negócio, Telegram ou webhooks.
