CREATE OR REPLACE FUNCTION public.tse_estatisticas_globais()
RETURNS TABLE(
  eleitorado bigint,
  candidatos bigint,
  resultados bigint,
  locais bigint,
  prestacao_contas bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH
  el_agg AS (
    SELECT COALESCE(SUM(total_eleitores), 0)::bigint AS v FROM public.tse_eleitorado
  ),
  el_perfil AS (
    SELECT COALESCE(SUM(quantidade_eleitores), 0)::bigint AS v FROM public.tse_eleitorado_perfil
  ),
  cand_cad AS (
    SELECT COUNT(DISTINCT (ano, uf, cod_municipio_tse, numero_urna))::bigint AS v
    FROM public.tse_candidatos
    WHERE numero_urna IS NOT NULL
  ),
  cand_perfil AS (
    SELECT COUNT(DISTINCT (ano, uf, cod_municipio_tse, numero_candidato))::bigint AS v
    FROM public.tse_votacao_candidato_perfil
    WHERE numero_candidato IS NOT NULL
  )
  SELECT
    GREATEST((SELECT v FROM el_agg), (SELECT v FROM el_perfil)) AS eleitorado,
    GREATEST((SELECT v FROM cand_cad), (SELECT v FROM cand_perfil)) AS candidatos,
    (SELECT COUNT(*) FROM public.tse_resultados_secao)::bigint AS resultados,
    (SELECT COUNT(*) FROM public.tse_locais_votacao)::bigint AS locais,
    (SELECT COUNT(*) FROM public.tse_prestacao_contas)::bigint AS prestacao_contas;
$$;

GRANT EXECUTE ON FUNCTION public.tse_estatisticas_globais() TO authenticated, anon;