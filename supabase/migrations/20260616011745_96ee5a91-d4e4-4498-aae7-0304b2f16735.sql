
-- ============================================================
-- ONDA 3: TSE hash / dedupe / erro detalhado / cap de tentativas
-- ============================================================
ALTER TABLE public.tse_csv_arquivos
  ADD COLUMN IF NOT EXISTS file_hash text,
  ADD COLUMN IF NOT EXISTS linhas_erro int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error_line bigint,
  ADD COLUMN IF NOT EXISTS max_attempts int NOT NULL DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_tse_csv_file_hash
  ON public.tse_csv_arquivos (file_hash)
  WHERE file_hash IS NOT NULL;

-- Cap de tentativas: trigger que move para 'erro' se exceder max_attempts
CREATE OR REPLACE FUNCTION public.tg_tse_csv_cap_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.attempts >= NEW.max_attempts AND NEW.status IN ('aguardando','processando') THEN
    NEW.status := 'erro';
    NEW.error_msg := COALESCE(NEW.error_msg, '') || ' [auto] max_attempts atingido (' || NEW.max_attempts || ')';
    NEW.finished_at := now();
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.tg_tse_csv_cap_attempts() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_tse_csv_cap_attempts ON public.tse_csv_arquivos;
CREATE TRIGGER trg_tse_csv_cap_attempts
  BEFORE UPDATE ON public.tse_csv_arquivos
  FOR EACH ROW EXECUTE FUNCTION public.tg_tse_csv_cap_attempts();

-- ============================================================
-- ONDA 4: Demandas com SLA + histórico de status + view + trigger
-- ============================================================
ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS sla_horas int,
  ADD COLUMN IF NOT EXISTS respondida_em timestamptz,
  ADD COLUMN IF NOT EXISTS tempo_resposta_min int;

-- Tabela de histórico de mudanças de status
CREATE TABLE IF NOT EXISTS public.demandas_historico_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id uuid NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  status_anterior text,
  status_novo text NOT NULL,
  alterado_por uuid REFERENCES auth.users(id),
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.demandas_historico_status TO authenticated;
GRANT ALL ON public.demandas_historico_status TO service_role;

ALTER TABLE public.demandas_historico_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados leem histórico"
  ON public.demandas_historico_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema insere histórico"
  ON public.demandas_historico_status FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_dhs_demanda ON public.demandas_historico_status (demanda_id, created_at DESC);

-- Trigger: registra mudança de status + calcula tempo de resposta
CREATE OR REPLACE FUNCTION public.tg_demandas_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.demandas_historico_status (demanda_id, status_anterior, status_novo, alterado_por)
    VALUES (NEW.id, NULL, NEW.status::text, auth.uid());
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.demandas_historico_status (demanda_id, status_anterior, status_novo, alterado_por)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, auth.uid());

    -- marca respondida_em quando sai de aberta/em_andamento para resolvida/cancelada
    IF NEW.status::text IN ('resolvida','cancelada','encerrada') AND NEW.respondida_em IS NULL THEN
      NEW.respondida_em := now();
      NEW.tempo_resposta_min := GREATEST(0, EXTRACT(EPOCH FROM (now() - NEW.data_abertura))/60)::int;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.tg_demandas_status_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_demandas_status_change ON public.demandas;
CREATE TRIGGER trg_demandas_status_change
  BEFORE INSERT OR UPDATE OF status ON public.demandas
  FOR EACH ROW EXECUTE FUNCTION public.tg_demandas_status_change();

-- View de SLA das demandas
CREATE OR REPLACE VIEW public.v_demandas_sla
WITH (security_invoker=on) AS
SELECT
  d.id,
  d.protocolo,
  d.titulo,
  d.status,
  d.prioridade,
  d.responsavel_id,
  d.data_abertura,
  d.data_prazo,
  d.respondida_em,
  d.tempo_resposta_min,
  CASE
    WHEN d.status::text IN ('resolvida','cancelada','encerrada') THEN
      CASE WHEN d.respondida_em <= d.data_prazo THEN 'no_prazo' ELSE 'atrasada' END
    WHEN d.data_prazo IS NULL THEN 'sem_prazo'
    WHEN now() > d.data_prazo THEN 'vencida'
    WHEN now() > d.data_prazo - interval '24 hours' THEN 'vencendo'
    ELSE 'no_prazo'
  END AS situacao_sla,
  CASE
    WHEN d.data_prazo IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (d.data_prazo - now()))/3600
  END AS horas_restantes
FROM public.demandas d;

GRANT SELECT ON public.v_demandas_sla TO authenticated;
