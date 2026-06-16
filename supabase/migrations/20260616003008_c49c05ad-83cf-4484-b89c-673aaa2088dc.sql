
-- 1) security_invoker=on em TODAS as views públicas
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind='v' AND n.nspname='public'
  LOOP
    EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', r.relname);
  END LOOP;
END $$;

-- 2) search_path fixo
ALTER FUNCTION public.tse_cstr(text)                SET search_path = public;
ALTER FUNCTION public.tse_cint(integer, integer)    SET search_path = public;
ALTER FUNCTION public.faixa_votos_vereador(integer) SET search_path = public;

-- 3) RLS permissiva em ai_uso_log
DROP POLICY IF EXISTS "Sistema insere uso" ON public.ai_uso_log;
CREATE POLICY "Usuário insere próprio uso" ON public.ai_uso_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 4) REVOKE EXECUTE em SECURITY DEFINER internas
REVOKE EXECUTE ON FUNCTION public.audit_trigger_func()                FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_aprovacao_after_update()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_contrato_after_insert()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_tarefa_anexo_espelha_documento() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_tarefa_anexo_remove_espelho()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notificar_demanda_urgente()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_demanda_protocolo()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_demanda_sla()                   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_estoque_on_movimentacao()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.criar_aprovacoes_contrato(uuid)     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.criar_notificacao(uuid, text, text, public.notificacao_tipo, public.notificacao_prioridade, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notificar_gestores(text, text, public.notificacao_tipo, public.notificacao_prioridade, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.inicializar_parametros_campanha(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.popular_vereadores_historicos(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- 5) RPCs realmente usadas pelo frontend ficam disponíveis a usuário logado
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
