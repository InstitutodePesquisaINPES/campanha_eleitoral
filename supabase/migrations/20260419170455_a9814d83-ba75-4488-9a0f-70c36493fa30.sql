-- Corrige enum cargo_eleitoral
ALTER TYPE public.cargo_eleitoral ADD VALUE IF NOT EXISTS 'vice_prefeito';
ALTER TYPE public.cargo_eleitoral ADD VALUE IF NOT EXISTS 'vice_governador';
ALTER TYPE public.cargo_eleitoral ADD VALUE IF NOT EXISTS 'presidente';

CREATE EXTENSION IF NOT EXISTS unaccent;