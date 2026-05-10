# Product Requirements Document (PRD)
**Plataforma Kiribamba | Inteligência e Comando Eleitoral**

---

## 1. Visão Geral (O Problema e a Solução)

A política moderna ainda opera em silos de dados. Campanhas gastam milhões, mas os prefeitos, deputados e coordenadores tomam decisões baseadas no "feeling" (achismo), planilhas de Excel quebradas e listas de transmissão de WhatsApp sem contexto geográfico. O **Kiribamba** nasce para erradicar a desorganização de campanhas, unindo inteligência de dados (BI), micro-segmentação territorial e comunicação em uma única plataforma SaaS Multi-Tenant. 

**O que o Kiribamba é:**
Um centro de comando tático. Uma plataforma "all-in-one" onde o QG de campanha analisa mapas de calor, a liderança cadastra eleitores, e o robô de IA cruza os dados do TSE para indicar onde há fuga de votos.

## 2. Público-Alvo e Personas

### Persona 1: "O Comandante" (Candidato ou Coordenador-Geral)
- **Dor:** Falta de clareza sobre onde a campanha está ganhando ou perdendo força. Não sabe exatamente o ROI (Retorno sobre Investimento) dos cabos eleitorais.
- **O que usa no App:** Dashboard Executivo de KPIs, War Room de Alertas Críticos, Mapas de Calor Georreferenciados (BI) e o Copilot de IA para ler cenários eleitorais diários.

### Persona 2: "O Líder Regional"
- **Dor:** Tem dificuldade para organizar o fluxo financeiro de santinhos e a agenda do candidato em sua região.
- **O que usa no App:** CRM Territorial, painel de Gestão de Demandas (ofícios, asfalto, consultas) e acompanhamento de Entregas Logísticas de materiais.

### Persona 3: "O Cabo Eleitoral / Militância"
- **Dor:** Internet 3G falha na periferia/interior; esquece o que conversou com o eleitor. Precisa de uma forma ágil de bater meta.
- **O que usa no App:** Versão PWA (Offline-first) no celular. Cadastra eleitores via formulário rápido, ganha pontos no Sistema de Gamificação por meta batida.

---

## 3. Core Features (Módulos Principais)

### 🗺️ Inteligência Territorial (GIS & BI)
- Integração de dados do IBGE e TSE.
- Visualização de polígonos, zonas, seções eleitorais e áreas de atuação.
- Mapa de Calor de redutos eleitorais.

### 👥 CRM Eleitoral Avançado
- Gestão hiper-segmentada: Eleitor, Apoiador, Liderança.
- Controle de engajamento (Frio, Morno, Quente, Garantido).
- Segmentação paramétrica para disparos de comunicação.

### 🤖 Copilot AI (War Room)
- Agente Inteligente treinado (LLM) que consome dados da própria plataforma.
- Categoria de robôs especialistas: Analista Financeiro, Jurídico Eleitoral, Estrategista.
- Prevenção ativa contra "Prompt Injection" garantindo o uso restrito ao escopo da campanha.

### 🏆 Motor de Gamificação
- Geração de "Scores" por engajamento e metas alcançadas.
- Ranking de Lideranças em tempo real, motivando a militância no campo.

### 📱 Mobilidade (PWA)
- Progressive Web App instalável nativamente em iOS/Android.
- Armazenamento em cache (Workbox) que mantém a interface viva sem internet.

---

## 4. Diferencial Competitivo (Moat)
Diferente das ferramentas genéricas de CRM (Salesforce, Hubspot), o Kiribamba possui ontologia estritamente eleitoral. Todos os dados respeitam a taxonomia do **TSE** (Tribunal Superior Eleitoral). O modelo multi-tenant robusto permite que a plataforma seja alugada simultaneamente para 100 candidatos diferentes, sem vazamento de dados, por conta do Row-Level Security (RLS).
