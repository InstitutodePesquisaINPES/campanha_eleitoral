ALTER TABLE public.tse_csv_arquivos
  ADD COLUMN IF NOT EXISTS parts_total integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parts_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS parts_sizes jsonb NOT NULL DEFAULT '[]'::jsonb;