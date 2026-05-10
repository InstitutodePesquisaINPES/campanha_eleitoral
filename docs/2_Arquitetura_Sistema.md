# Arquitetura de Engenharia
**Plataforma Kiribamba**

---

## 1. Visão Geral da Stack

O Kiribamba é desenhado para alta concorrência e estabilidade corporativa. Optou-se por uma estrutura **Monorepo**, garantindo que as fronteiras entre o front-end visual e o back-end transacional sejam fluidas para o desenvolvedor, mas impenetráveis para o usuário final.

### Stack Tecnológica:
- **Frontend (Visual):** React 18, Vite, TailwindCSS, Shadcn UI, Framer Motion, TanStack Query, React Hook Form + Zod.
- **Backend (API):** NestJS 11 (Node.js), TypeScript estrito, JWT Passport, RxJS.
- **Banco de Dados (Storage):** PostgreSQL gerenciado via Prisma ORM v7.

---

## 2. Multi-Tenancy e RLS (Row-Level Security)

A maior premissa de um SaaS Político é a **inviolabilidade de dados**. Um candidato não pode, sob hipótese alguma, ter acesso aos eleitores de um concorrente hospedado na mesma plataforma.

Para resolver isso de forma imune a erro humano no desenvolvimento:
- Utilizamos **Prisma Client Extensions** para injetar automaticamente o filtro de inquilino (Tenant).
- Toda consulta e gravação no banco de dados recebe obrigatoriamente a assinatura do `tenantId`.
- No lado da API, o decorator `@CurrentTenant()` aciona o interceptador global e repassa essa variável para o ORM. Não há como realizar um "SELECT * FROM pessoas" sem que a extensão adicione na retaguarda "WHERE tenant_id = XYZ".

---

## 3. Segurança e Auditoria 100% Type-Safe

Após rigorosas auditorias estruturais (Hardening), a API NestJS não possui instâncias vulneráveis de `@Body() data: any`. 
- Todo Payload injetado no backend passa por um **DTO (Data Transfer Object)** protegido pelo `class-validator`.
- As saídas são higienizadas para evitar injeção SQL, e scripts cross-site (XSS) são tratados nos pipes de transformação.

---

## 4. Ecossistema Frontend

- **Acesso:** Baseado em contexto (`useUserRoles()`). A plataforma detecta as permissões de acesso: *Admin*, *Coordenador*, *Liderança*, *Operador* ou *Visualizador*.
- **Roteamento:** As páginas vitais são encapsuladas por um componente `<ProtectedRoute />` que lida transparentemente com tokens expirados (HTTP 401) e permissões insuficientes (HTTP 403).
- **PWA (Progressive Web App):** 
  - A interface possui um Manifesto Web válido gerado pelo `vite-plugin-pwa`. 
  - Utiliza estratégias do Workbox (`NetworkFirst`) que persistem consultas de API no IndexedDB/CacheStorage do navegador por até 7 dias, habilitando o uso do App mesmo sem rede móvel na rua.

---

## 5. Infraestrutura de Produção e Deploy

O deploy é focado na containerização (Docker):
1. O Frontend é compilado estaticamente para HTML/CSS/JS e hospedado e servido de forma assíncrona por um container NGINX otimizado (`nginx.conf` estrito).
2. O Backend (NestJS) possui seu próprio cluster, compilado utilizando Node LTS Alpine.
