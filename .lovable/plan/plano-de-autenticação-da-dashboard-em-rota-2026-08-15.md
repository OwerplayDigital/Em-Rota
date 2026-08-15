# Plano de Autenticação da Dashboard EM ROTA

Adicionar autenticação obrigatória via Supabase Auth à dashboard web, restringindo o acesso exclusivamente ao e-mail `owertech82@gmail.com`.

## Etapas

1. **Configuração do Supabase Auth:**
   - Habilitar autenticação por E-mail no backend.
   - Desabilitar cadastro público (Sign up) no backend se possível via política ou apenas não oferecer no front.
   - Criar o usuário `owertech82@gmail.com` manualmente (instrução ao usuário).

2. **Criação da Tela de Login:**
   - Criar a rota `/auth` com formulário profissional (E-mail/Senha).
   - Implementar lógica de login usando `supabase.auth.signInWithPassword`.
   - Adicionar tratamento de erros e estados de carregamento.

3. **Proteção de Rotas (Frontend):**
   - Criar um layout de rota autenticada (`_authenticated`) em `src/routes/_authenticated.tsx`.
   - Implementar verificação de sessão e e-mail no `beforeLoad` das rotas da dashboard.
   - Redirecionar usuários não autenticados ou com e-mail incorreto para `/auth`.
   - Mover rotas existentes (`dashboard`, `historico`, `desempenho`) para dentro do grupo `_authenticated`.

4. **Proteção de Dados (Backend):**
   - Garantir que as Server Functions (`src/lib/*.functions.ts`) usem `.middleware([requireSupabaseAuth])`.
   - Implementar validação de e-mail dentro das Server Functions para garantir que apenas o proprietário acesse os dados.

5. **Validação:**
   - Testar login bem-sucedido.
   - Testar bloqueio de e-mail não autorizado.
   - Testar acesso direto a URLs protegidas.
   - Validar integridade do bot Telegram.

## Detalhes Técnicos

- **Tecnologia:** TanStack Start, Supabase Auth.
- **Autorização:** Hardcoded `ALLOWED_EMAIL = "owertech82@gmail.com"`.
- **UX:** Dark Premium theme mantido na tela de login.
