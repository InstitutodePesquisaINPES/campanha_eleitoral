# Importação TSE via GitHub Actions

A importação de ZIPs grandes do TSE (eleitorado, locais de votação, candidatos, resultados por seção) roda **fora do Supabase**, em um runner do GitHub Actions, e envia os dados em lotes de 500 registros para a Edge Function `tse-ingest-chunk`.

## Por que GitHub Actions?

Edge Functions têm limites rígidos (150 MB RAM, 150 s, 2 s CPU) que não comportam:
- Download de ZIPs de 200 MB – 2 GB
- Descompactação + parse de CSVs com milhões de linhas

O runner do GitHub tem 7 GB RAM, 60 min de execução e largura de banda alta — perfeito para o trabalho.

## Setup (uma vez só)

### 1. Conectar projeto ao GitHub
No editor Lovable: **Connectors → GitHub → Connect project**, e crie/conecte um repositório.

### 2. Gerar token de ingestão
Em qualquer terminal:
```bash
openssl rand -hex 32
```
Copie o valor.

### 3. Adicionar segredos no GitHub
No repositório: **Settings → Secrets and variables → Actions → New repository secret**

| Nome                 | Valor                                                   |
|----------------------|---------------------------------------------------------|
| `SUPABASE_URL`       | `https://lryjfthdzmrgudamuqiu.supabase.co`              |
| `TSE_INGEST_TOKEN`   | (o hex gerado acima)                                    |

### 4. Adicionar o mesmo token como secret no Supabase
Já está provisionado pelo Lovable abaixo (após você confirmar). Use **exatamente** o mesmo valor.

## Como rodar uma importação

1. No GitHub, vá em **Actions → TSE Import (ZIP → Supabase) → Run workflow**
2. Escolha:
   - **tipo**: `eleitorado`, `locais`, `candidatos` ou `resultados`
   - **ano**: `2024`, `2022`, `2020`...
   - **uf**: `BA` (ou outra UF, ou `BR` para arquivo nacional)
3. Clique em **Run workflow**

O job:
- Baixa o ZIP oficial do CDN do TSE
- Extrai o CSV em stream
- Filtra pela UF escolhida (quando aplicável)
- Envia em chunks de 500 para a edge function
- O primeiro chunk **limpa** os dados anteriores do mesmo `ano + uf` (idempotente)

Acompanhe o progresso na aba **Actions** ou em `tse_import_logs` no banco.

## Arquivos do TSE usados

| Tipo         | URL base                                                                                          |
|--------------|---------------------------------------------------------------------------------------------------|
| eleitorado   | `cdn.tse.jus.br/estatistica/sead/odsele/perfil_eleitorado/perfil_eleitorado_<ANO>.zip`            |
| locais       | `cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_<ANO>.zip` |
| candidatos   | `cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_<ANO>.zip`                    |
| resultados   | `cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_<ANO>_<UF>.zip`               |

## Troubleshooting

- **HTTP 403 ao baixar**: o TSE eventualmente troca a estrutura de URL. Verifique em https://dadosabertos.tse.jus.br e ajuste `buildUrl()` em `scripts/tse-import.mjs`.
- **Ingest falhou 401**: `TSE_INGEST_TOKEN` no GitHub ≠ secret no Supabase.
- **Demorou demais**: aumente o timeout em `.github/workflows/tse-import.yml` ou rode por UF específica (não `BR`).
