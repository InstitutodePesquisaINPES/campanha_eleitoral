---
name: Avante Candidato brand system
description: Sistema visual oficial das campanhas Avante no SIGT. Cores, tipografia, classes utilitárias e regras de uso. Flexível para qualquer candidato.
type: design
---

# Identidade Avante · Candidato

## Cores (HSL em index.css)
- **Azul institucional Avante** `--primary: 217 100% 32%` (#003DA5)
- **Azul profundo** `--primary-deep: 220 100% 22%` (header/hero base)
- **Azul claro / glow** `--primary-glow: 217 92% 46%`
- **Amarelo solar Avante** `--brand-yellow: 49 100% 50%` (#FFD100) — destaque (nº de urna, CTAs, badges chave)
- **Sidebar escura institucional** fundo `220 60% 10%`, accent amarelo

## Tipografia
- **Display (h1-h4 / nº de urna):** Sora 700-900
- **Body / UI:** Inter 400-700

## Classes utilitárias (em index.css @layer components)
- `.brand-gradient`, `.brand-yellow-gradient`, `.hero-gradient`
- `.brand-pill` (pílula amarela uppercase para sigla do partido)
- `.brand-number` (bloco amarelo com número de urna grande)
- `.stenio-quote` (citação com borda amarela esquerda — usado no Briefing do Consultor)

## Componentes-âncora
- `src/components/brand/CampanhaHero.tsx` — hero institucional. Nome/cargo/UF/base/nº de urna vêm 100% da campanha ativa (flexível).
- `src/components/brand/ConsultorBriefing.tsx` — painel "Briefing do Consultor" (análise estratégica), sem nome próprio de consultor — totalmente data-driven.

## Regras
1. **Amarelo é tinta de destaque**, não fundo de tela. Use apenas para nº de urna, badge AVANTE e CTAs únicos por tela.
2. Sidebar é **sempre escura** com accent amarelo nos itens ativos.
3. H1/H2 sempre em Sora bold. Nunca usar serif.
4. Nº de urna sempre em `.brand-number` (amarelo + Sora black + tabular-nums).
5. **Nada hardcoded de candidato/cidade/UF** nos componentes — sempre derivar de `campanhas` (nome, cargo, partido_sigla, numero_urna, municipios.nome, estados.sigla).
