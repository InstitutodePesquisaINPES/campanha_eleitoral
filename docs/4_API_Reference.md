# 🌐 API Reference & Mapeamento de Endpoints
**Plataforma Kiribamba Enterprise | Documentação Completa de Rotas NestJS**

A API do Kiribamba é uma API RESTful corporativa restrita. Absolutamente todas as rotas de negócio (exceto login/cadastro e health) exigem dois níveis de segurança fortificados:
1. **`JwtAuthGuard`**: Verifica a integridade e validade do Token Bearer.
2. **`TenantGuard`**: O interceptor mais vital. Extrai o `tenantId` do token e bloqueia qualquer *Cross-Tenant Data Leakage*. Se a rota pedir o ID `X` mas este ID pertencer ao Tenant `B` (e o usuário for do `A`), a API devolve HTTP 403.

---

## 🔐 1. Governança e Autenticação

### `/auth` (Autenticação)
- `POST /auth/login`: Autentica com e-mail/senha. Retorna `access_token` JWT.
- `POST /auth/register`: Cria um novo usuário/Tenant. (Uso restrito em B2B).
- `POST /auth/refresh`: Atualiza o JWT sem necessidade de novo login.

### `/profile` (Perfil do Usuário)
- `GET /profile/me`: Retorna os dados completos do usuário atual, seu `tenantId` e suas patentes (`roles`).
- `PATCH /profile`: Atualiza dados básicos (nome, telefone, avatar).

### `/tenant` & `/system-settings` (Configurações da Conta)
- `GET /tenant`: Retorna dados do comitê/agência atual.
- `GET /system-settings`: Busca as variáveis de ambiente do Tenant (Branding, Logos, Pontuação do PWA).
- `PATCH /system-settings`: Atualiza as configurações (restrito a `admin`).

### `/equipe` (Gestão de Patentes e RBAC)
- `GET /equipe`: Lista todos os operadores do Comitê.
- `POST /equipe`: Recruta novo membro (Exige patente hierárquica superior à que está sendo criada).
- `PATCH /equipe/:id`: Promove/Rebaixa um membro.
- `GET /equipe/logs` e `GET /equipe/:id/logs`: Retorna a trilha de **Auditoria (AuditLog)** de atividades no sistema.

---

## 🎯 2. Núcleo Tático: CRM e Território

### `/pessoas` (CRM Eleitoral)
O coração da plataforma para captação de votos. Validado rigorosamente via DTOs.
- `GET /pessoas`: Lista e pesquisa eleitores na base (com paginação e filtros).
- `POST /pessoas`: Cadastra novo Eleitor (Otimizado para PWA).
- `GET /pessoas/:id`: Dossiê completo do eleitor.
- `PATCH /pessoas/:id`: Atualiza dados de contato.
- `POST /pessoas/segmentacao`: Busca avançada cruzando `Tags`, `Idade` e `Geometria`.
- `POST /pessoas/:id/enderecos`: Associa ou atualiza o endereço (necessário para o mapa de calor).

### `/territorial` & `/territorio` (Inteligência Geográfica)
- `GET /territorial/municipios`: Retorna base do IBGE do estado.
- `POST /territorial/zonas`: Cadastra Zonas Eleitorais ativas.
- `POST /territorial/secoes`: Cadastra Seções de votação georreferenciadas.
- `GET /territorio/mapa-calor`: Endpoint de BI que cospe coordenadas GeoJSON de onde os votos estão concentrados.

### `/campo` (Logística de Rua)
- `GET /campo/roteiros`: Lista roteiros de visita programados para o candidato.
- `POST /campo/roteiros`: Cria uma agenda de visitas (Door-to-door).
- `POST /campo/checkin`: Marca que a liderança esteve fisicamente no local.

---

## 💼 3. Núcleo Executivo: Estratégia e Finanças

### `/financeiro` & `/contratos`
- `GET /financeiro/orcamento`: Retorna limites de gastos vs. limite do TSE.
- `GET /financeiro/despesas`: Lista queima de caixa por categoria.
- `POST /financeiro/despesas`: Lança notas fiscais ou boletos de fornecedores.
- `GET /contratos`: Lista fornecedores (Gráficas, Produtoras, Cabos).
- `POST /contratos/:id/aprovar`: Fluxo de aprovação jurídica.

### `/campanhas` & `/strategy` (Plano de Voo)
- `GET /campanhas/ativas`: Retorna as eleições sendo disputadas pelo Tenant.
- `GET /strategy/eixos`: Retorna os pilares da campanha (Ex: "Saúde", "Educação").
- `POST /strategy/planos-acao`: Cadastra OKRs e Metas para a equipe bater.

### `/dashboard` & `/score`
- `GET /dashboard/kpis`: Rota de agregação pesada. Consolida números de votos, grana, agenda e demandas num único JSON para o `RoleBasedDashboard`.
- `GET /score/ranking`: Retorna a tabela de Gamificação (quem cadastrou mais eleitores hoje).

---

## 📢 4. Comunicação e Jurídico

### `/comunicacao` (War Room)
- `GET /comunicacao/pautas`: Lista as narrativas a serem atacadas no dia.
- `GET /comunicacao/mencoes`: Retorna menções positivas/negativas (Social Listening).
- `POST /comunicacao/disparos`: Dispara mensagens via WhatsApp/SMS para segmentos do CRM.

### `/demandas` (Ouvidoria)
- `GET /demandas`: Fila de pedidos da população (Asfalto, Saúde, Ofícios).
- `POST /demandas`: Abertura de ticket.
- `PATCH /demandas/:id/status`: Kanban de resolução (Aberto -> Em Análise -> Resolvido).

### `/materiais` & `/documentos`
- `GET /materiais`: Catálogo de santinhos, praguinhas e bandeiras.
- `POST /materiais/requisicao`: Liderança pede envio de 5.000 santinhos para sua base.
- `GET /documentos`: Repositório de arquivos PDF (Atas, Decisões do TSE).

---

## 🤖 5. Inteligência Artificial e Dados

### `/ai` (Copilots)
- `GET /ai/copilots`: Lista agentes configurados (Ex: "Estrategista-Chefe", "Assessor Jurídico").
- `POST /ai/chat`: Envia prompt do usuário com contexto para a OpenAI/Anthropic.
- `POST /ai/generate-copy`: Rota rápida para redigir textos de redes sociais com base numa Pauta.

### `/pesquisas` & `/inteligencia`
- `GET /pesquisas`: Lista pesquisas quantitativas e qualitativas registradas.
- `POST /pesquisas/upload`: Sobem relatórios de institutos para serem lidos pelo `/ai`.
- `GET /inteligencia/cruzamentos`: Endpoints focados em correlacionar Votos vs. Demandas Abertas.

---

## 🛡️ Formato de Respostas (Responses) e Status Codes

O backend implementa um Exception Filter global.
- **`200 OK` / `201 Created`**: Payload esperado.
- **`400 Bad Request`**: Falha de DTO (Validação do `class-validator`). Retorna a lista de campos incorretos. Ex: `["cpf must be a valid CPF number"]`.
- **`401 Unauthorized`**: JWT ausente ou expirado. Front-end deve varrer o local storage e forçar redirecionamento para `/login`.
- **`403 Forbidden`**: Tentativa de burlar `TenantId` ou tentativa de acesso a rota protegida por patente que o usuário não possui.
- **`404 Not Found`**: Registro inexistente no banco.
- **`500 Internal Server Error`**: Exceção não mapeada. Logada para auditoria do sistema.
