---
name: Avante Kiribamba brand system
description: Sistema visual oficial da campanha Kiribamba (Avante 70 · Dep. Estadual BA). Cores, tipografia, classes utilitárias e regras de uso.
type: design
---

# Identidade Avante · Kiribamba 70

## Cores (HSL em index.css)
- **Azul institucional Avante** `--primary: 217 100% 32%` (#003DA5)
- **Azul profundo** `--primary-deep: 220 100% 22%` (header/hero base)
- **Azul claro / glow** `--primary-glow: 217 92% 46%`
- **Amarelo solar Avante** `--brand-yellow: 49 100% 50%` (#FFD100) — usado APENAS para destaque (nº de urna, CTAs, badges chave)
- **Sidebar escura institucional** fundo `220 60% 10%`, accent amarelo

## Tipografia
- **Display (h1-h4 / nº de urna):** Sora 700-900
- **Body / UI:** Inter 400-700

## Classes utilitárias (em index.css @layer components)
- `.brand-gradient` — gradiente azul (botões hero, headers fortes)
- `.brand-yellow-gradient` — gradiente amarelo (CTAs raros, badges chave)
- `.hero-gradient` — diagonal azul→amarelo (hero da campanha)
- `.brand-pill` — pílula amarela uppercase (sigla do partido)
- `.brand-number` — bloco amarelo com número grande (urna 70)
- `.stenio-quote` — citação com borda amarela esquerda (fala do consultor)

## Componentes-âncora
- `src/components/brand/CampanhaHero.tsx` — hero institucional com nº 70 gigante
- `src/components/brand/ConsultorBriefing.tsx` — painel "Stenio Fernando" com diagnóstico/recomendações

## Regras
1. **Amarelo é tinta de destaque**, não fundo de tela. Use apenas para nº 70, badge AVANTE, CTAs únicos por tela.
2. Sidebar é **sempre escura** com accent amarelo nos itens ativos.
3. H1/H2 sempre em Sora bold. Nunca usar serif.
4. Nº de urna **70** sempre em `.brand-number` (amarelo + Sora black + tabular-nums).
