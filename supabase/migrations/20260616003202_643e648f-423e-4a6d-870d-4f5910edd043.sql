
CREATE INDEX IF NOT EXISTS idx_tse_csv_arq_status_atividade
  ON public.tse_csv_arquivos (status, ultima_atividade_em, created_at)
  WHERE status IN ('aguardando','processando');

CREATE INDEX IF NOT EXISTS idx_demandas_responsavel_status
  ON public.demandas (responsavel_id, status)
  WHERE status NOT IN ('resolvida','arquivada');

CREATE INDEX IF NOT EXISTS idx_agenda_municipio_data
  ON public.agenda (municipio_id, data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_agenda_responsavel_data
  ON public.agenda (responsavel_id, data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_tse_resultados_agg
  ON public.tse_resultados_secao (ano, uf, cod_municipio_tse, cargo);

CREATE INDEX IF NOT EXISTS idx_tse_votcand_perfil_agg
  ON public.tse_votacao_candidato_perfil (ano, uf, cargo, municipio);
