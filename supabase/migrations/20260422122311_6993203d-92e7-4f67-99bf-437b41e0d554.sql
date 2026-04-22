
DO $$
DECLARE
  v_camp uuid;
  v_inicio date;
  v_fase_pre uuid;
BEGIN
  SELECT id, data_inicio_plano INTO v_camp, v_inicio
  FROM public.campanhas WHERE nome ILIKE '%kiribamba%' LIMIT 1;

  IF v_camp IS NULL THEN RETURN; END IF;

  -- Regenera plano (preserva concluídas se flag ligada)
  PERFORM public.gerar_plano_90_dias(v_camp);

  SELECT id INTO v_fase_pre FROM public.campanha_fases
  WHERE campanha_id = v_camp AND fase = 'pre_campanha';

  -- Tarefas extras solicitadas
  INSERT INTO public.campanha_tarefas
    (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, descricao, prioridade, ordem)
  VALUES
    (v_camp, v_fase_pre, 1, v_inicio, 1, 'organizacao',
     'REUNIÃO GERAL DE FUNDAÇÃO · Definir coordenadores e custo da equipe',
     'Definir formalmente: Coordenador Geral de Campanha, Coordenador de Marketing, Secretaria Executiva, Assessoria de Imprensa, Jurídico Eleitoral, Tesoureiro. Apresentar planilha de custo total da equipe (salários, ajudas, prazos). Ata assinada por todos os presentes.',
     'urgente', 0),
    (v_camp, v_fase_pre, 2, v_inicio + 1, 1, 'digital',
     'Diagnóstico completo das redes sociais do candidato',
     'Auditoria de Instagram, Facebook, TikTok, YouTube e X do candidato: seguidores, engajamento médio, sentimento dos comentários, posts virais, gaps de conteúdo, comparação com concorrentes diretos. Entrega: relatório com score atual e plano de evolução.',
     'urgente', 1),
    (v_camp, v_fase_pre, 6, v_inicio + 5, 1, 'juridico',
     'ASSINATURA DOS CONTRATOS DA EQUIPE',
     'Assinatura formal de todos os contratos da equipe de campanha definida no D1 (coordenadores, secretaria, assessoria, jurídico, marketing). Anexar cópias assinadas neste card.',
     'urgente', 2)
  ON CONFLICT DO NOTHING;
END $$;
