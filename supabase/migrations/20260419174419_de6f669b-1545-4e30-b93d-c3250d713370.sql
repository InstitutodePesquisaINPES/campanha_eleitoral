-- Recriar view com SECURITY INVOKER (respeita RLS do chamador)
DROP VIEW IF EXISTS public.v_busca_global;

CREATE VIEW public.v_busca_global
WITH (security_invoker = true)
AS
SELECT 'pessoa'::text AS tipo, p.id, p.full_name AS titulo,
       COALESCE(p.cpf, p.cnpj, p.razao_social) AS subtitulo,
       '/pessoas'::text AS link, p.created_at
FROM public.pessoas p
UNION ALL
SELECT 'demanda'::text, d.id, d.titulo, d.protocolo, '/demandas', d.created_at
FROM public.demandas d
UNION ALL
SELECT 'agenda'::text, a.id, a.titulo, a.local, '/agenda', a.created_at
FROM public.agenda a
UNION ALL
SELECT 'municipio'::text, m.id, m.nome, e.sigla, '/territorios', m.created_at
FROM public.municipios m JOIN public.estados e ON e.id = m.estado_id
UNION ALL
SELECT 'campanha'::text, c.id, c.nome, c.cargo::text, '/plano', c.created_at
FROM public.campanhas c
UNION ALL
SELECT 'despesa'::text, dp.id, dp.descricao, 'R$ ' || dp.valor::text, '/financeiro', dp.created_at
FROM public.despesas dp
UNION ALL
SELECT 'material'::text, mt.id, mt.nome, mt.tipo::text, '/materiais', mt.created_at
FROM public.materiais mt;