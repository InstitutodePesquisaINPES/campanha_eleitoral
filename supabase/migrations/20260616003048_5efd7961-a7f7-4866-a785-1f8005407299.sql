
-- Revoga EXECUTE público em TODAS as SECURITY DEFINER do schema public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef=true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END $$;

-- Re-concede apenas as RPCs realmente usadas pelo frontend
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_manage_role(uuid)                        TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_campanha_scope(uuid, uuid)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_municipio_scope(uuid, uuid)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_plano_campanha(uuid)                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_plano_90_dias(uuid)                    TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_dashboard_kpis(text, integer)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_comparativo_eleicoes(text, text, text)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_estatisticas_globais()                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_resumo_municipios(integer, text)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_eleitorado_agregado(text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_votos_por_secao(integer, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tse_origem_votos_local(integer, text, text, text, text) TO authenticated;
