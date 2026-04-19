DO $$
DECLARE
  v_estado_ba uuid;
  v_mun_vc uuid;
  v_campanha_id uuid;
  v_foco_ids uuid[] := '{}';
  v_mun_id uuid;
  v_pretty_names text[] := ARRAY[
    'Anagé','Aracatu','Barra do Choça','Belo Campo','Bom Jesus da Serra',
    'Caatiba','Cândido Sales','Caraíbas','Condeúba','Cordeiros',
    'Encruzilhada','Guajeru','Iguaí','Itambé','Itapetinga',
    'Itarantim','Itororó','Jacaraci','Licínio de Almeida','Macarani',
    'Maetinga','Maiquinique','Mortugaba','Nova Canaã','Piripá',
    'Planalto','Poções','Potiraguá','Presidente Jânio Quadros','Ribeirão do Largo',
    'Tremedal'
  ];
  v_name_pretty text;
  v_name_norm text;
  i int;
BEGIN
  SELECT id INTO v_estado_ba FROM public.estados WHERE sigla = 'BA' LIMIT 1;
  IF v_estado_ba IS NULL THEN
    INSERT INTO public.estados (sigla, nome, geocodigo_ibge, latitude, longitude)
    VALUES ('BA', 'Bahia', '29', -12.9714, -38.5014)
    RETURNING id INTO v_estado_ba;
  END IF;

  SELECT id INTO v_mun_vc FROM public.municipios
   WHERE estado_id = v_estado_ba AND public.unaccent(lower(nome)) = 'vitoria da conquista' LIMIT 1;
  IF v_mun_vc IS NULL THEN
    INSERT INTO public.municipios (estado_id, nome, geocodigo_ibge, latitude, longitude, populacao, eleitorado_total)
    VALUES (v_estado_ba, 'Vitória da Conquista', '2933307', -14.8615, -40.8442, 341128, 245000)
    RETURNING id INTO v_mun_vc;
  END IF;

  FOR i IN 1..array_length(v_pretty_names, 1) LOOP
    v_name_pretty := v_pretty_names[i];
    v_name_norm := public.unaccent(lower(v_name_pretty));
    SELECT id INTO v_mun_id FROM public.municipios
     WHERE estado_id = v_estado_ba AND public.unaccent(lower(nome)) = v_name_norm LIMIT 1;
    IF v_mun_id IS NULL THEN
      INSERT INTO public.municipios (estado_id, nome) VALUES (v_estado_ba, v_name_pretty)
      RETURNING id INTO v_mun_id;
    END IF;
    v_foco_ids := array_append(v_foco_ids, v_mun_id);
  END LOOP;

  SELECT id INTO v_campanha_id FROM public.campanhas
   WHERE nome ILIKE 'Kiribamba%' AND cargo = 'deputado_estadual' LIMIT 1;

  IF v_campanha_id IS NULL THEN
    INSERT INTO public.campanhas (
      nome, cargo, partido_sigla, numero_urna, coligacao,
      estado_id, municipio_id, municipios_foco_ids,
      data_eleicao, data_inicio_plano, meta_votos, orcamento_total,
      ativa, observacoes
    ) VALUES (
      'Kiribamba Deputado Estadual', 'deputado_estadual',
      'AVANTE', '70', 'Coligação Avante Bahia',
      v_estado_ba, v_mun_vc, v_foco_ids,
      DATE '2026-10-04', CURRENT_DATE, 45000, 360000, true,
      'Campanha Kiribamba (Avante 70) — Deputado Estadual BA. Base: Vitória da Conquista. Expansão: microrregião do Sudoeste baiano.'
    ) RETURNING id INTO v_campanha_id;
  ELSE
    UPDATE public.campanhas SET
      partido_sigla='AVANTE', numero_urna='70', coligacao='Coligação Avante Bahia',
      estado_id=v_estado_ba, municipio_id=v_mun_vc, municipios_foco_ids=v_foco_ids,
      data_eleicao=DATE '2026-10-04',
      meta_votos=COALESCE(meta_votos,45000),
      orcamento_total=COALESCE(NULLIF(orcamento_total,0),360000),
      ativa=true, updated_at=now()
    WHERE id=v_campanha_id;
  END IF;

  PERFORM public.inicializar_parametros_campanha(v_campanha_id);

  UPDATE public.campanha_parametros SET
    escala_deputado_estadual=3.5, pct_visitas_sobre_votos=0.40, pct_cadastro_sobre_votos=0.35,
    min_visitas_semana=35, min_fiscais=80, min_orcamento_reais=200000,
    custo_por_voto_reais=4.5, votos_por_fiscal=250, preservar_concluidas=true
  WHERE campanha_id=v_campanha_id;

  PERFORM public.gerar_plano_90_dias(v_campanha_id);

  UPDATE public.campanhas SET ativa=false WHERE id <> v_campanha_id;
END $$;