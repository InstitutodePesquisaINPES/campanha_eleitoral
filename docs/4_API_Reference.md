# API Reference
**Plataforma Kiribamba | Documentação de Rotas NestJS**

A API do Kiribamba é restrita. Quase todas as rotas exigem dois níveis de segurança:
1. **`JwtAuthGuard`**: Verifica se a requisição possui um Token Bearer válido.
2. **`TenantGuard`**: Lê o ID do tenant alocado no token e o repassa via Contexto.

---

## 1. Autenticação e Perfil (`/auth` & `/profile`)

- `POST /auth/login`: Autentica com e-mail/senha. Retorna `access_token`.
- `POST /auth/register`: Cria um novo usuário na plataforma. Requer DTO.
- `GET /profile/me`: Retorna os dados do usuário atual e do seu Tenant.

---

## 2. CRM e Eleitorado (`/pessoas`)
Todos os endpoints são validados por DTOs específicos.

- `GET /pessoas`: Lista e pesquisa eleitores na base do Tenant (paginado).
- `POST /pessoas`: Cadastra nova Pessoa (`CreatePessoaDto`).
- `PATCH /pessoas/:id`: Atualiza dados (`UpdatePessoaDto`).
- `POST /pessoas/segmentacao`: Busca avançada cruzando tags e geografia (`GerarSegmentacaoDto`).
- `POST /pessoas/:id/enderecos`: Associa endereço (`CreateEnderecoDto`).

---

## 3. Inteligência Territorial (`/territorial`)
Rotas para desenhar o mapa tático da campanha (Cidades, Bairros, Zonas).

- `GET /territorial/municipios`: Retorna municípios do estado.
- `POST /territorial/municipios`: Cria região mapeada (`CreateMunicipioDto`).
- `POST /territorial/zonas`: Cadastra Zona Eleitoral (`CreateZonaDto`).
- `POST /territorial/secoes`: Cadastra Seção de votação (`CreateSecaoDto`).

---

## 4. IA Copilot Corporativo (`/ai`)
Motor LLM interno focado em análise eleitoral.

- `GET /ai/copilots`: Lista todos os copilotos configurados (Estrategistas, Jurídicos).
- `POST /ai/copilots`: Cria um novo bot (`CreateAiCopilotDto`).
- `POST /ai/chat`: Envia histórico de chat para o LLM. Prevenção a Prompt Injection nativa via DTO (`AiChatPayloadDto`).

---

## 5. Gamificação e Metas (`/gamificacao`)

- `GET /gamificacao/ranking`: Processa em tempo real quem são os Cabos Eleitorais/Lideranças com mais engajamento ou captação, retornando os Top Scores para renderização do painel no App.

---

## Formato Padrão de Resposta

O backend usa interceptadores para padronizar erros.
- **200/201**: Sucesso. Retorna Objeto ou Array.
- **400 Bad Request**: Erro de Validação de DTO (ex: faltou enviar o município no Payload).
- **401 Unauthorized**: Token expirado ou inválido (Força Logout no Front-end).
- **403 Forbidden**: Tenant mismatch ou falta de Role de Administrador.
