-- Suporte a Pessoa Física e Jurídica no CRM
DO $$ BEGIN
  CREATE TYPE public.tipo_pessoa AS ENUM ('pf','pj');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.porte_empresa AS ENUM ('mei','me','epp','medio','grande');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.pessoas
  ADD COLUMN IF NOT EXISTS tipo_pessoa public.tipo_pessoa NOT NULL DEFAULT 'pf',
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS razao_social text,
  ADD COLUMN IF NOT EXISTS nome_fantasia text,
  ADD COLUMN IF NOT EXISTS inscricao_estadual text,
  ADD COLUMN IF NOT EXISTS inscricao_municipal text,
  ADD COLUMN IF NOT EXISTS porte public.porte_empresa,
  ADD COLUMN IF NOT EXISTS segmento text,
  ADD COLUMN IF NOT EXISTS site text,
  ADD COLUMN IF NOT EXISTS data_fundacao date,
  ADD COLUMN IF NOT EXISTS responsavel_legal text;

CREATE INDEX IF NOT EXISTS idx_pessoas_tipo_pessoa ON public.pessoas(tipo_pessoa);
CREATE INDEX IF NOT EXISTS idx_pessoas_cnpj ON public.pessoas(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON public.pessoas(cpf) WHERE cpf IS NOT NULL;