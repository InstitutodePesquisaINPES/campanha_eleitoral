# Usuários de Teste - SIGT

## Credenciais

Todos os usuários usam a senha: `Sigt@2024`

| Email | Papel | Nome |
|-------|-------|------|
| admin@sigt.test | admin | Admin SIGT |
| coordenador@sigt.test | coordenador | Maria Coordenadora |
| lideranca@sigt.test | liderança | João Liderança |
| operador@sigt.test | operador | Ana Operadora |
| visualizador@sigt.test | visualizador | Carlos Visualizador |

## Edge Function

A função `seed-test-users` pode ser chamada para recriar os usuários (idempotente).

Também disponível via botão **"Seed Usuários Teste"** no Painel Administrativo > Usuários & Papéis.

## Permissões por Papel

| Papel | Acesso |
|-------|--------|
| **admin** | Acesso total + painel administrativo + gestão de papéis |
| **coordenador** | CRUD em todas as entidades (has_manage_role) |
| **liderança** | Visualização completa |
| **operador** | Visualização completa |
| **visualizador** | Apenas visualização |
