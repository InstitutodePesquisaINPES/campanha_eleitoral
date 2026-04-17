
-- Adiciona escopo geográfico estendido às campanhas:
-- estado_id (obrigatório para cargos estaduais/federais)
-- municipios_foco_ids (lista opcional de municípios com foco)
ALTER TABLE public.campanhas
  ADD COLUMN IF NOT EXISTS estado_id uuid REFERENCES public.estados(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS municipios_foco_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

CREATE INDEX IF NOT EXISTS idx_campanhas_estado_id ON public.campanhas(estado_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_municipios_foco ON public.campanhas USING GIN (municipios_foco_ids);
