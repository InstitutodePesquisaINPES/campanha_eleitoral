# Project Memory

## Core
SIGT — Sistema Integrado de Gestão Territorial para campanhas Avante. Flexível para qualquer candidato/cargo/UF; nome, cargo, base e nº de urna vêm 100% da tabela `campanhas`.
Marca Avante: azul #003DA5 + amarelo #FFD100. Sora display, Inter body. Sidebar escura institucional.
Supabase backend with RLS. RBAC via user_roles + has_role(). Portuguese UI. has_manage_role() = admin OR coordenador.
Painel inicial usa CampanhaHero + ConsultorBriefing (análise estratégica data-driven, sem nome próprio de consultor). Nunca mockar dados.

## Memories
- [Avante brand](mem://design/avante-candidato-brand) — Cores, tipografia, classes utilitárias .brand-* e regras de uso
- [RBAC](mem://features/rbac) — 5 roles: admin, coordenador, lideranca, operador, visualizador
- [Territorial](mem://features/territorial) — 8 tabelas: estados, municipios, distritos, bairros, comunidades, zonas, secoes, areas_atuacao
- [CRM](mem://features/crm) — 10 tabelas: pessoas, contatos, enderecos, papeis, tags, vinculos, historico, consentimentos, anexos + Storage bucket
