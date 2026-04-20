
-- Comparativo entre eleições por município (histórico de eleitorado, candidatos, eleitos)
CREATE OR REPLACE FUNCTION public.tse_comparativo_eleicoes(_uf text DEFAULT 'BA', _municipio text DEFAULT NULL, _cargo text DEFAULT NULL)
RETURNS TABLE(
  ano integer,
  total_eleitores bigint,
  total_candidatos bigint,
  total_eleitos bigint,
  total_votos_nominais bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH eleitores AS (
    SELECT ano, SUM(quantidade_eleitores)::bigint AS qt
    FROM public.tse_eleitorado_perfil
    WHERE uf = _uf AND (_municipio IS NULL OR municipio = _municipio)
    GROUP BY ano
  ),
  cands AS (
    SELECT ano,
      COUNT(*)::bigint AS qt_cand,
      COUNT(*) FILTER (WHERE eleito)::bigint AS qt_eleitos,
      COALESCE(SUM(votos_recebidos),0)::bigint AS qt_votos
    FROM public.tse_candidatos c
    WHERE uf = _uf
      AND (_cargo IS NULL OR lower(cargo) LIKE '%' || lower(_cargo) || '%')
      AND (_municipio IS NULL OR EXISTS (
        SELECT 1 FROM public.tse_eleitorado_perfil e
        WHERE e.uf = c.uf AND e.ano = c.ano AND e.municipio = _municipio
      ))
    GROUP BY ano
  )
  SELECT COALESCE(e.ano, c.ano) AS ano,
         COALESCE(e.qt, 0),
         COALESCE(c.qt_cand, 0),
         COALESCE(c.qt_eleitos, 0),
         COALESCE(c.qt_votos, 0)
  FROM eleitores e FULL OUTER JOIN cands c ON c.ano = e.ano
  ORDER BY ano;
$$;

-- Agregação de votos por LOCAL de votação (mais útil que seção isolada)
CREATE OR REPLACE FUNCTION public.tse_origem_votos_local(_ano integer, _uf text, _cod_municipio_tse text, _cargo text DEFAULT NULL, _numero_votavel text DEFAULT NULL)
RETURNS TABLE(
  zona integer,
  codigo_local text,
  nome_local text,
  bairro text,
  endereco text,
  latitude double precision,
  longitude double precision,
  total_secoes bigint,
  total_votos bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH r AS (
    SELECT zona, secao, SUM(votos)::bigint AS votos
    FROM public.tse_resultados_secao
    WHERE ano = _ano AND uf = _uf AND cod_municipio_tse = _cod_municipio_tse
      AND (_cargo IS NULL OR lower(cargo) = lower(_cargo))
      AND (_numero_votavel IS NULL OR numero_votavel = _numero_votavel)
    GROUP BY zona, secao
  )
  SELECT l.zona, l.codigo_local, l.nome_local, l.bairro, l.endereco, l.latitude, l.longitude,
         COUNT(DISTINCT r.secao)::bigint AS total_secoes,
         COALESCE(SUM(r.votos),0)::bigint AS total_votos
  FROM public.tse_locais_votacao l
  LEFT JOIN r ON r.zona = l.zona
  WHERE l.ano = _ano AND l.uf = _uf AND l.cod_municipio_tse = _cod_municipio_tse
  GROUP BY l.zona, l.codigo_local, l.nome_local, l.bairro, l.endereco, l.latitude, l.longitude
  ORDER BY total_votos DESC NULLS LAST;
$$;
