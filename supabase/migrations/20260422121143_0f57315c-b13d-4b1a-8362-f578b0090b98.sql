
-- 1) Atualiza função gerar_plano_90_dias adicionando pacote ROBUSTO de captação + base VC
CREATE OR REPLACE FUNCTION public.gerar_plano_90_dias(_campanha_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inicio date; v_eleicao date; v_cargo cargo_eleitoral;
  v_meta_votos integer; v_municipios_foco uuid[];
  v_mun_id uuid; v_mun_nome text; v_mun_base_nome text;
  v_meta_cadastro integer; v_meta_visitas integer; v_visitas_semana integer;
  v_fiscais_estimados integer; v_orcamento_min numeric; v_escala numeric;
  v_concluidas_titulos text[]; p RECORD; t JSONB;
  v_fase_alvo uuid; v_dia_marco int;
  v_duracao int; v_num_fases int; v_num_semanas int;
  v_fim_pre int; v_fim_lanc int; v_fim_cons int;
  v_fase_pre uuid; v_fase_lanc uuid; v_fase_cons uuid; v_fase_reta uuid;
  i int; v_semana_inicio int; v_semana_fim int;
  v_codigo_fase_semana fase_campanha;
  v_municipio_base_id uuid;
BEGIN
  SELECT data_inicio_plano, data_eleicao, cargo, COALESCE(meta_votos, 3000), COALESCE(municipios_foco_ids, '{}'), municipio_id
    INTO v_inicio, v_eleicao, v_cargo, v_meta_votos, v_municipios_foco, v_municipio_base_id
  FROM public.campanhas WHERE id = _campanha_id;

  IF v_inicio IS NULL THEN RAISE EXCEPTION 'Campanha não encontrada'; END IF;

  SELECT nome INTO v_mun_base_nome FROM public.municipios WHERE id = v_municipio_base_id;
  v_mun_base_nome := COALESCE(v_mun_base_nome, 'Base');

  PERFORM public.inicializar_parametros_campanha(_campanha_id);
  SELECT * INTO p FROM public.campanha_parametros WHERE campanha_id = _campanha_id;

  v_duracao := GREATEST(30, COALESCE(p.duracao_dias, 90));
  v_num_fases := GREATEST(3, LEAST(8, COALESCE(p.num_fases, 4)));
  v_num_semanas := CEIL(v_duracao::numeric / 7)::int;

  v_escala := CASE v_cargo
    WHEN 'vereador' THEN p.escala_vereador
    WHEN 'prefeito' THEN p.escala_prefeito
    WHEN 'vice_prefeito' THEN p.escala_vice_prefeito
    WHEN 'deputado_estadual' THEN p.escala_deputado_estadual
    WHEN 'deputado_federal' THEN p.escala_deputado_federal
    WHEN 'senador' THEN p.escala_senador
    WHEN 'governador' THEN p.escala_governador
    WHEN 'vice_governador' THEN p.escala_vice_governador
    WHEN 'presidente' THEN p.escala_presidente
    ELSE 1.0
  END;

  v_meta_cadastro     := GREATEST(p.min_cadastro, (v_meta_votos * p.pct_cadastro_sobre_votos)::int);
  v_meta_visitas      := GREATEST(p.min_visitas, (v_meta_votos * p.pct_visitas_sobre_votos)::int);
  v_visitas_semana    := GREATEST(p.min_visitas_semana, (v_meta_visitas / GREATEST(1,v_num_semanas))::int);
  v_fiscais_estimados := GREATEST(p.min_fiscais, (v_meta_votos / NULLIF(p.votos_por_fiscal,0))::int);
  v_orcamento_min     := GREATEST(p.min_orcamento_reais, v_meta_votos * p.custo_por_voto_reais * v_escala);

  IF p.preservar_concluidas THEN
    SELECT COALESCE(array_agg(titulo), '{}') INTO v_concluidas_titulos
    FROM public.campanha_tarefas WHERE campanha_id = _campanha_id AND status = 'concluida';
    DELETE FROM public.campanha_tarefas WHERE campanha_id = _campanha_id AND status <> 'concluida';
  ELSE
    v_concluidas_titulos := '{}';
    DELETE FROM public.campanha_tarefas WHERE campanha_id = _campanha_id;
  END IF;

  DELETE FROM public.campanha_metas WHERE campanha_id = _campanha_id;
  DELETE FROM public.campanha_semanas WHERE campanha_id = _campanha_id;
  DELETE FROM public.campanha_fases WHERE campanha_id = _campanha_id;

  v_fim_pre  := (v_duracao * 0.23)::int;
  v_fim_lanc := (v_duracao * 0.50)::int;
  v_fim_cons := (v_duracao * 0.83)::int;

  INSERT INTO public.campanha_fases (campanha_id, fase, nome, data_inicio, data_fim, foco, ordem) VALUES
    (_campanha_id, 'pre_campanha', 'Pré-campanha · Estruturação da base e captação', v_inicio,                   v_inicio + v_fim_pre,  format('Captação de recursos, comitê em %s, núcleo executivo, identidade visual e diagnóstico territorial', v_mun_base_nome), 1),
    (_campanha_id, 'lancamento',   'Lançamento · Consolidação em ' || v_mun_base_nome,    v_inicio + v_fim_pre + 1,   v_inicio + v_fim_lanc, format('Apresentação pública em %s, ativação dos redutos e lideranças, expansão para microrregião', v_mun_base_nome), 2),
    (_campanha_id, 'consolidacao','Consolidação · Expansão regional',     v_inicio + v_fim_lanc + 1,  v_inicio + v_fim_cons, 'Programa de governo, eventos por território, lideranças religiosas e comerciais, anúncios segmentados', 3),
    (_campanha_id, 'reta_final',   'Reta Final · Conversão e mobilização',      v_inicio + v_fim_cons + 1,  v_inicio + v_duracao - 1, 'Mobilização total na base e foco, fiscais por seção, boca de urna e dia D', 4);

  SELECT id INTO v_fase_pre  FROM public.campanha_fases WHERE campanha_id = _campanha_id AND fase = 'pre_campanha';
  SELECT id INTO v_fase_lanc FROM public.campanha_fases WHERE campanha_id = _campanha_id AND fase = 'lancamento';
  SELECT id INTO v_fase_cons FROM public.campanha_fases WHERE campanha_id = _campanha_id AND fase = 'consolidacao';
  SELECT id INTO v_fase_reta FROM public.campanha_fases WHERE campanha_id = _campanha_id AND fase = 'reta_final';

  -- SEMANAS DINÂMICAS
  FOR i IN 1..v_num_semanas LOOP
    v_semana_inicio := (i-1)*7 + 1;
    v_semana_fim := LEAST(i*7, v_duracao);
    v_codigo_fase_semana := CASE
      WHEN v_semana_inicio <= v_fim_pre THEN 'pre_campanha'::fase_campanha
      WHEN v_semana_inicio <= v_fim_lanc THEN 'lancamento'::fase_campanha
      WHEN v_semana_inicio <= v_fim_cons THEN 'consolidacao'::fase_campanha
      ELSE 'reta_final'::fase_campanha
    END;

    INSERT INTO public.campanha_semanas (campanha_id, numero_semana, data_inicio, data_fim, fase, foco_principal, meta_campo, meta_digital, meta_financeiro)
    VALUES (
      _campanha_id, i,
      v_inicio + (v_semana_inicio - 1),
      v_inicio + (v_semana_fim - 1),
      v_codigo_fase_semana,
      CASE
        WHEN i = 1 THEN format('Semana 1 · Captação inicial + comitê em %s', v_mun_base_nome)
        WHEN i = 2 THEN format('Semana 2 · Núcleo executivo + base de doadores + diagnóstico de %s', v_mun_base_nome)
        WHEN v_codigo_fase_semana = 'pre_campanha' THEN format('Semana %s · Estruturação e diagnóstico', i)
        WHEN v_codigo_fase_semana = 'lancamento'   THEN format('Semana %s · Mobilização e visitas em %s', i, v_mun_base_nome)
        WHEN v_codigo_fase_semana = 'consolidacao' THEN format('Semana %s · Expansão e propostas', i)
        ELSE                                              format('Semana %s · Reta final e conversão', i)
      END,
      CASE
        WHEN i <= 2 THEN format('Mapear redutos em %s + cadastrar 50 lideranças', v_mun_base_nome)
        ELSE format('%s visitas + %s cadastros', v_visitas_semana, (v_meta_cadastro / GREATEST(1,v_num_semanas))::int)
      END,
      CASE
        WHEN i <= 2 THEN 'Estruturar perfis, identidade visual e narrativa'
        WHEN v_codigo_fase_semana = 'pre_campanha' THEN '3 posts/semana + estruturação de redes'
        WHEN v_codigo_fase_semana = 'lancamento'   THEN '1 post/dia + 2 reels/semana + lives'
        WHEN v_codigo_fase_semana = 'consolidacao' THEN 'Anúncios segmentados + cobertura de eventos'
        ELSE                     'Bombardeio diário + mobilização do voto'
      END,
      CASE
        WHEN i = 1 THEN format('META: captar 25%% do orçamento total (R$ %s)', to_char(v_orcamento_min*0.25, 'FM999G999G999D00'))
        WHEN i = 2 THEN format('META: captar 50%% do orçamento total acumulado (R$ %s)', to_char(v_orcamento_min*0.50, 'FM999G999G999D00'))
        WHEN v_codigo_fase_semana = 'pre_campanha' THEN format('R$ %s/semana', to_char(v_orcamento_min/v_num_semanas, 'FM999G999G999D00'))
        WHEN v_codigo_fase_semana = 'reta_final'   THEN 'Pagamento de fornecedores e fechamento'
        ELSE 'Controle semanal de gastos'
      END
    );
  END LOOP;

  -- METAS POR FASE (com captação reforçada)
  INSERT INTO public.campanha_metas (campanha_id, fase, area, meta, indicador, valor_meta, ordem) VALUES
    (_campanha_id, 'pre_campanha', 'financeiro', 'Captar 50% do orçamento nas 2 primeiras semanas', 'R$ captados', (v_orcamento_min*0.50)::int, 1),
    (_campanha_id, 'pre_campanha', 'organizacao','Montar comitê físico em ' || v_mun_base_nome, 'Comitê operante (sim/não)', 1, 2),
    (_campanha_id, 'pre_campanha', 'organizacao','Montar equipe núcleo executivo',    'Pessoas-chave contratadas',       GREATEST(8,(v_escala*5)::int),       3),
    (_campanha_id, 'pre_campanha', 'campo',      'Mapear lideranças de ' || v_mun_base_nome,  'Lideranças cadastradas',  100,            4),
    (_campanha_id, 'pre_campanha', 'digital',    'Estruturar redes sociais',  'Seguidores iniciais',     GREATEST(500,(v_escala*1000)::int),  5),
    (_campanha_id, 'pre_campanha', 'financeiro', 'Definir orçamento total e governança',   'Orçamento aprovado (R$)', v_orcamento_min,                     6),
    (_campanha_id, 'lancamento',   'campo',      'Consolidar nome em ' || v_mun_base_nome,   'Bairros visitados na base',     30,                7),
    (_campanha_id, 'lancamento',   'digital',    'Crescer base digital',      'Seguidores total',        GREATEST(2500,(v_escala*5000)::int), 8),
    (_campanha_id, 'consolidacao', 'campo',      'Expandir cobertura regional',        'Municípios visitados',       GREATEST(15,array_length(v_municipios_foco,1)),     9),
    (_campanha_id, 'consolidacao', 'campo',      'Apoiadores ativos',         'Apoiadores cadastrados',  v_meta_cadastro,                     10),
    (_campanha_id, 'consolidacao', 'digital',    'Engajamento alto',          'Interações/semana',       GREATEST(5000,(v_escala*10000)::int),11),
    (_campanha_id, 'reta_final',   'campo',      'Fiscais por seção',         'Fiscais treinados',       v_fiscais_estimados,                 12),
    (_campanha_id, 'reta_final',   'campo',      'Meta de votos',             'Votos recebidos',         v_meta_votos,                        13);

  -- ============================================================
  -- TAREFAS PRÉ-CAMPANHA (REFORÇADO: captação + estruturação base)
  -- Dias 1-21 (3 primeiras semanas) com foco intenso nas 2 primeiras
  -- ============================================================
  INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, descricao, prioridade, ordem)
  SELECT _campanha_id, v_fase_pre,
         dia_int,
         v_inicio + dia_int - 1,
         GREATEST(1, CEIL(dia_int::numeric/7)::int),
         area::area_campanha,
         replace(titulo, '{base}', v_mun_base_nome),
         replace(descricao, '{base}', v_mun_base_nome),
         prioridade::prioridade_demanda, ord
  FROM (VALUES
    -- SEMANA 1 (dias 1-7): KICKOFF + CAPTAÇÃO + COMITÊ
    (1, 'organizacao','KICKOFF: Reunião de fundação da campanha','Definir coordenador geral, tesoureiro, secretária executiva e ata de constituição da campanha.','urgente',1),
    (1, 'financeiro','Definir tesoureiro e abrir conta bancária de campanha','CNPJ eleitoral + conta específica + procuração financeira.','urgente',2),
    (1, 'juridico','Verificar elegibilidade, certidões e ficha limpa','Certidões TSE, ficha limpa, filiação Avante regular há mais de 6 meses.','urgente',3),
    (2, 'financeiro','Montar matriz de captação · 50 doadores prioritários','Lista nominal com valor-alvo por doador (empresários, lideranças, classe média alta de {base}).','urgente',4),
    (2, 'organizacao','Localizar e contratar comitê físico em {base}','Imóvel central em {base} com mínimo 100m², estacionamento, salas de reunião.','urgente',5),
    (3, 'financeiro','Reunião 1:1 com 10 doadores âncora em {base}','Pitch de campanha + pedido formal de aporte. Meta: R$ 100k comprometidos.','urgente',6),
    (3, 'organizacao','Recrutar coordenador de campo de {base}','Liderança local com histórico em campanhas e penetração em bairros redutos.','urgente',7),
    (4, 'organizacao','Recrutar coordenador digital','Profissional sênior com portfólio em campanhas eleitorais. Equipe mínima de 3 pessoas.','urgente',8),
    (4, 'comunicacao','Definir slogan, bordões e narrativa central','Mensagem-âncora com base em pesquisa qualitativa e história pessoal do candidato.','urgente',9),
    (5, 'comunicacao','Produzir identidade visual completa (logo, paleta, manual)','Manual de marca alinhado à identidade Avante (azul #003DA5 + amarelo #FFD100).','urgente',10),
    (5, 'financeiro','Cotar 3 fornecedores: gráfica, brindes, audiovisual','Cotações formais, condições de pagamento e prazos.','alta',11),
    (6, 'campo','Diagnóstico territorial completo de {base}','Mapeamento dos 50 bairros de {base} com classificação A/B/C por potencial eleitoral.','urgente',12),
    (6, 'digital','Criar e profissionalizar Instagram, Facebook, TikTok, YouTube','Perfis verificados, identidade unificada, bio, links e foto profissional.','urgente',13),
    (7, 'organizacao','Reunião de fechamento Semana 1 · KPIs','Avaliação: captação realizada vs meta, comitê pronto, núcleo formado.','alta',14),

    -- SEMANA 2 (dias 8-14): EXPANSÃO CAPTAÇÃO + BASE DE DADOS + LIDERANÇAS
    (8, 'financeiro','Evento de captação privado em {base} · 30 convidados','Jantar/almoço em local discreto. Apresentação de plano e pedido de apoio financeiro.','urgente',15),
    (8, 'dados','Importar base TSE 2022 + base própria no SIGT','Eleitores históricos + cadastro de simpatizantes + lideranças.','urgente',16),
    (9, 'campo','Café com 50 lideranças comunitárias de {base}','Presidentes de associação, líderes religiosos, comerciantes locais.','urgente',17),
    (9, 'organizacao','Definir cadeia de comando e organograma oficial','Documento oficial com responsabilidades por área e linha de reporte.','alta',18),
    (10, 'comunicacao','Gravar vídeo de apresentação oficial (peça âncora)','Roteiro emocional com história pessoal, propostas e ligação com {base}.','urgente',19),
    (10, 'campo','Recrutar 1 referência por bairro reduto A em {base}','Mínimo 15 referências classe A na base. Cadastro completo no SIGT.','urgente',20),
    (11, 'financeiro','Reunião com associações empresariais de {base}','ACVC, CDL, Sindicatos. Apresentação de propostas para o setor produtivo.','alta',21),
    (11, 'digital','Plano editorial de 30 dias publicado','Calendário detalhado de posts, temas, formatos e responsáveis.','alta',22),
    (12, 'comunicacao','Pesquisa qualitativa rápida em {base} (3 grupos focais)','Percepção do nome, rejeição, temas relevantes para a base.','alta',23),
    (12, 'logistica','Receber 1ª remessa de material institucional','Santinhos, adesivos, camisetas, banner do comitê.','alta',24),
    (13, 'campo','Treinamento intensivo de 30 cabos eleitorais','Discurso, abordagem porta-a-porta, registro no app SIGT, conduta legal.','urgente',25),
    (13, 'financeiro','Fechamento financeiro Semana 2 · Meta 50% captado','Conferência de captação: meta R$ ' || to_char(v_orcamento_min*0.50, 'FM999G999G999D00') || '.','urgente',26),
    (14, 'organizacao','Reunião de fechamento Semana 2 · Go/No-go fase 2','Avaliação final da fase de estruturação. Decisão de prosseguir para lançamento.','urgente',27),

    -- SEMANA 3 (dias 15-21): PREPARAÇÃO PARA LANÇAMENTO
    (15, 'comunicacao','Definir local e data oficial do lançamento em {base}','Local com capacidade para 500+ pessoas. Mídia local convidada.','urgente',28),
    (16, 'campo','Roteirizar 1ª caminhada após lançamento','Bairro reduto A, horário, lideranças confirmadas, mídia.','alta',29),
    (17, 'comunicacao','Aprovar peças de divulgação do lançamento','Convites, banners, posts, vídeo teaser.','alta',30),
    (18, 'logistica','Logística completa do evento de lançamento','Som, palco, segurança, alimentação, transporte de apoiadores.','alta',31),
    (19, 'digital','Aquecimento de redes para lançamento','Stories, contagem regressiva, depoimentos de lideranças.','alta',32),
    (20, 'organizacao','Reunião geral pré-lançamento com toda equipe','Alinhamento operacional final. Briefing por área.','urgente',33),
    (21, 'campo','Confirmar presença de 30 lideranças no lançamento','Ligações 1:1 + transporte garantido.','alta',34)
  ) AS x(dia_int, area, titulo, descricao, prioridade, ord)
  WHERE replace(titulo, '{base}', v_mun_base_nome) <> ALL(v_concluidas_titulos);

  -- TAREFAS LANÇAMENTO (com foco em consolidar nome em VC)
  INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, descricao, prioridade, ordem)
  SELECT _campanha_id, v_fase_lanc,
         GREATEST(1, (pct * v_duracao)::int),
         v_inicio + GREATEST(1, (pct * v_duracao)::int) - 1,
         GREATEST(1, CEIL((pct * v_duracao)/7)::int),
         area::area_campanha,
         replace(titulo, '{base}', v_mun_base_nome),
         replace(descricao, '{base}', v_mun_base_nome),
         prioridade::prioridade_demanda, ord
  FROM (VALUES
    (0.235,'comunicacao','EVENTO DE LANÇAMENTO OFICIAL em {base}','Ato público massivo com lideranças, mídia regional e base mobilizada.','urgente',40),
    (0.245,'digital','Live de lançamento + cobertura completa','Cobertura ao vivo do evento em todas as redes. Edição rápida em 24h.','urgente',41),
    (0.260,'campo','Caminhada inaugural em bairro reduto de {base}','Marca o início oficial do trabalho de campo. Mídia presente.','alta',42),
    (0.290,'campo','Visitas porta-a-porta em 100% dos bairros A de {base}','Cobertura total dos bairros classificados como redutos na base.','urgente',43),
    (0.315,'comunicacao','Distribuição estratégica em pontos de fluxo de {base}','Praças, feiras, igrejas, escolas, terminais de ônibus.','alta',44),
    (0.340,'campo','Carreata principal em {base}','Mobilização visual e sonora pelos principais corredores da cidade.','urgente',45),
    (0.370,'digital','Campanha de anúncios geo-segmentada em {base}','Investimento concentrado por bairro reduto. CTR e CPM monitorados diariamente.','urgente',46),
    (0.395,'organizacao','Reunião semanal de avaliação · KPIs ao vivo','Dashboard SIGT projetado. Ajustes táticos na hora.','alta',47),
    (0.420,'campo','Atendimento estruturado de demandas de {base}','Resposta em 48h às demandas registradas. Fortalece imagem.','urgente',48),
    (0.450,'comunicacao','Vídeo: prova social de entregas em {base}','Depoimentos de moradores beneficiados por mediações.','alta',49),
    (0.480,'financeiro','Fechamento financeiro mensal + nova captação','Meta: captar 25% adicional do orçamento. Reportar ao tesoureiro.','urgente',50),
    (0.495,'organizacao','Revisão estratégica de meio de campanha','Pesquisa quantitativa em {base}. Ajuste de rota se necessário.','urgente',51)
  ) AS x(pct, area, titulo, descricao, prioridade, ord)
  WHERE replace(titulo, '{base}', v_mun_base_nome) <> ALL(v_concluidas_titulos);

  -- TAREFAS CONSOLIDAÇÃO (expansão regional mantendo VC)
  INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, descricao, prioridade, ordem)
  SELECT _campanha_id, v_fase_cons,
         GREATEST(1, (pct * v_duracao)::int),
         v_inicio + GREATEST(1, (pct * v_duracao)::int) - 1,
         GREATEST(1, CEIL((pct * v_duracao)/7)::int),
         area::area_campanha,
         replace(titulo, '{base}', v_mun_base_nome),
         replace(descricao, '{base}', v_mun_base_nome),
         prioridade::prioridade_demanda, ord
  FROM (VALUES
    (0.510,'comunicacao','Lançar programa de governo completo em {base}','Documento oficial com propostas detalhadas. Evento na base.','urgente',60),
    (0.535,'campo','Expansão para 5 municípios da microrregião','Eventos âncora em cidades estratégicas mantendo {base} como QG.','urgente',61),
    (0.560,'campo','Mutirão de cadastro de eleitores em {base}','Porta-a-porta intensivo. Meta: 5.000 cadastros novos na base.','alta',62),
    (0.590,'digital','Anúncios segmentados por bairro/perfil','Mensagens específicas por território. Reforço em {base}.','urgente',63),
    (0.615,'campo','Reunião com lideranças religiosas de {base}','Pastores, padres, terreiros. Pacto pela base.','alta',64),
    (0.640,'campo','Carreata regional · {base} + 3 municípios vizinhos','Show de força territorial. Mídia regional cobrindo.','alta',65),
    (0.665,'comunicacao','Preparação para debates regionais','Briefing, simulações, blocos de resposta por tema.','urgente',66),
    (0.695,'campo','Caminhada bairro central/comercial de {base}','Comerciantes e classe média da base.','alta',67),
    (0.720,'dados','Pesquisa quantitativa em {base} + 5 municípios foco','Intenção, rejeição, percepção. Amostra mínima 800 entrevistas.','urgente',68),
    (0.750,'organizacao','Ajuste estratégico com base em pesquisa','Reposicionamento se necessário. Reunião de guerra.','urgente',69),
    (0.775,'financeiro','Reservar caixa para reta final','Mínimo 30% do orçamento total para últimos 15 dias.','urgente',70),
    (0.800,'comunicacao','Material HGPE finalizado e aprovado','Peças de TV/rádio prontas e versionadas.','urgente',71),
    (0.825,'organizacao','Reunião pré-reta final · mobilização total','Toda equipe alinhada para fase 4. Mobilização emocional.','urgente',72)
  ) AS x(pct, area, titulo, descricao, prioridade, ord)
  WHERE replace(titulo, '{base}', v_mun_base_nome) <> ALL(v_concluidas_titulos);

  -- TAREFAS RETA FINAL
  INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, descricao, prioridade, ordem)
  SELECT _campanha_id, v_fase_reta,
         LEAST(v_duracao, GREATEST(1, (pct * v_duracao)::int)),
         v_inicio + LEAST(v_duracao, GREATEST(1, (pct * v_duracao)::int)) - 1,
         GREATEST(1, CEIL((pct * v_duracao)/7)::int),
         area::area_campanha,
         replace(titulo, '{base}', v_mun_base_nome),
         replace(descricao, '{base}', v_mun_base_nome),
         prioridade::prioridade_demanda, ord
  FROM (VALUES
    (0.840,'campo','Mobilização total em {base} e foco regional','Todas as equipes em campo simultaneamente. Concentração em {base}.','urgente',80),
    (0.870,'comunicacao','Comício principal de encerramento em {base}','Grande ato público de massa na praça central da base.','urgente',81),
    (0.890,'digital','Bombardeio de conteúdo (3x/dia)','Saturação positiva nas redes. Ads no limite legal.','urgente',82),
    (0.915,'organizacao','Treinar fiscais por seção em {base} e foco','1 fiscal por seção mínimo. App de fiscalização operante.','urgente',83),
    (0.945,'campo','Mobilização porta-a-porta final em {base}','Último contato pessoal com indecisos da base.','urgente',84),
    (0.965,'logistica','Logística do dia da eleição · {base} + foco','Transporte, alimentação, fiscais, comitê de crise.','urgente',85),
    (0.985,'comunicacao','Mensagem final aos eleitores','Vídeo emocional de fechamento. Distribuição em massa.','urgente',86),
    (0.995,'organizacao','Briefing final dos fiscais · sala de guerra em {base}','Última orientação antes do dia D. Plantão 24h.','urgente',87),
    (1.000,'organizacao','DIA DA ELEIÇÃO · operação completa de {base}','Boca de urna, fiscalização total, mobilização do voto, sala de apuração.','urgente',88)
  ) AS x(pct, area, titulo, descricao, prioridade, ord)
  WHERE replace(titulo, '{base}', v_mun_base_nome) <> ALL(v_concluidas_titulos);

  -- TAREFAS POR CARGO LEGISLATIVO
  IF v_cargo IN ('deputado_estadual','deputado_federal','senador') THEN
    FOR t IN SELECT * FROM jsonb_array_elements(p.tarefas_legislativo) LOOP
      INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
      SELECT _campanha_id, v_fase_pre,
             LEAST(v_duracao,(t->>'dia')::int), v_inicio + LEAST(v_duracao,(t->>'dia')::int) - 1,
             COALESCE((t->>'semana')::int, 1),
             (t->>'area')::area_campanha, (t->>'titulo'),
             COALESCE((t->>'prioridade'), 'alta')::prioridade_demanda, 110
      WHERE (t->>'titulo') <> ALL(v_concluidas_titulos);
    END LOOP;
  END IF;

  -- TAREFAS POR MUNICÍPIO DE FOCO
  IF v_municipios_foco IS NOT NULL AND array_length(v_municipios_foco, 1) > 0 THEN
    FOREACH v_mun_id IN ARRAY v_municipios_foco LOOP
      SELECT nome INTO v_mun_nome FROM public.municipios WHERE id = v_mun_id;
      IF v_mun_nome IS NOT NULL AND v_mun_id <> v_municipio_base_id THEN
        FOR t IN SELECT * FROM jsonb_array_elements(p.tarefas_municipio_foco) LOOP
          v_fase_alvo := CASE COALESCE(t->>'fase','lancamento')
            WHEN 'pre_campanha' THEN v_fase_pre
            WHEN 'lancamento'   THEN v_fase_lanc
            WHEN 'consolidacao' THEN v_fase_cons
            WHEN 'reta_final'   THEN v_fase_reta
            ELSE v_fase_lanc END;
          INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
          SELECT _campanha_id, v_fase_alvo,
                 LEAST(v_duracao,(t->>'dia')::int), v_inicio + LEAST(v_duracao,(t->>'dia')::int) - 1,
                 COALESCE((t->>'semana')::int, 1),
                 (t->>'area')::area_campanha,
                 replace((t->>'titulo'), '{municipio}', v_mun_nome),
                 COALESCE((t->>'prioridade'),'alta')::prioridade_demanda, 200
          WHERE replace((t->>'titulo'), '{municipio}', v_mun_nome) <> ALL(v_concluidas_titulos);
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  -- MARCOS LEGAIS TSE (mantidos)
  IF p.tse_registro_ativo AND v_eleicao - p.tse_registro_dias BETWEEN v_inicio AND v_inicio + v_duracao - 1 THEN
    v_dia_marco := (v_eleicao - p.tse_registro_dias) - v_inicio + 1;
    v_fase_alvo := CASE WHEN v_dia_marco <= v_fim_pre THEN v_fase_pre WHEN v_dia_marco <= v_fim_lanc THEN v_fase_lanc WHEN v_dia_marco <= v_fim_cons THEN v_fase_cons ELSE v_fase_reta END;
    INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
    SELECT _campanha_id, v_fase_alvo, v_dia_marco, v_eleicao - p.tse_registro_dias,
           GREATEST(1,LEAST(v_num_semanas,((v_dia_marco-1)/7+1)::int)),
           'juridico'::area_campanha, format('TSE: Registro de candidatura (D-%s)', p.tse_registro_dias),
           'urgente'::prioridade_demanda, 300
    WHERE format('TSE: Registro de candidatura (D-%s)', p.tse_registro_dias) <> ALL(v_concluidas_titulos);
  END IF;

  IF p.tse_propaganda_ativo AND v_eleicao - p.tse_propaganda_dias BETWEEN v_inicio AND v_inicio + v_duracao - 1 THEN
    v_dia_marco := (v_eleicao - p.tse_propaganda_dias) - v_inicio + 1;
    v_fase_alvo := CASE WHEN v_dia_marco <= v_fim_pre THEN v_fase_pre WHEN v_dia_marco <= v_fim_lanc THEN v_fase_lanc WHEN v_dia_marco <= v_fim_cons THEN v_fase_cons ELSE v_fase_reta END;
    INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
    SELECT _campanha_id, v_fase_alvo, v_dia_marco, v_eleicao - p.tse_propaganda_dias,
           GREATEST(1,LEAST(v_num_semanas,((v_dia_marco-1)/7+1)::int)),
           'comunicacao'::area_campanha, format('TSE: Início da propaganda eleitoral (D-%s)', p.tse_propaganda_dias),
           'urgente'::prioridade_demanda, 301
    WHERE format('TSE: Início da propaganda eleitoral (D-%s)', p.tse_propaganda_dias) <> ALL(v_concluidas_titulos);
  END IF;

  IF p.tse_hgpe_ativo AND v_eleicao - p.tse_hgpe_dias BETWEEN v_inicio AND v_inicio + v_duracao - 1
     AND v_cargo IN ('prefeito','vice_prefeito','governador','vice_governador','senador','deputado_estadual','deputado_federal','presidente') THEN
    v_dia_marco := (v_eleicao - p.tse_hgpe_dias) - v_inicio + 1;
    v_fase_alvo := CASE WHEN v_dia_marco <= v_fim_pre THEN v_fase_pre WHEN v_dia_marco <= v_fim_lanc THEN v_fase_lanc WHEN v_dia_marco <= v_fim_cons THEN v_fase_cons ELSE v_fase_reta END;
    INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
    SELECT _campanha_id, v_fase_alvo, v_dia_marco, v_eleicao - p.tse_hgpe_dias,
           GREATEST(1,LEAST(v_num_semanas,((v_dia_marco-1)/7+1)::int)),
           'comunicacao'::area_campanha, format('TSE: Início HGPE rádio e TV (D-%s)', p.tse_hgpe_dias),
           'urgente'::prioridade_demanda, 302
    WHERE format('TSE: Início HGPE rádio e TV (D-%s)', p.tse_hgpe_dias) <> ALL(v_concluidas_titulos);
  END IF;

  IF p.tse_prestacao_ativo AND v_eleicao - p.tse_prestacao_dias BETWEEN v_inicio AND v_inicio + v_duracao - 1 THEN
    v_dia_marco := (v_eleicao - p.tse_prestacao_dias) - v_inicio + 1;
    v_fase_alvo := CASE WHEN v_dia_marco <= v_fim_pre THEN v_fase_pre WHEN v_dia_marco <= v_fim_lanc THEN v_fase_lanc WHEN v_dia_marco <= v_fim_cons THEN v_fase_cons ELSE v_fase_reta END;
    INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
    SELECT _campanha_id, v_fase_alvo, v_dia_marco, v_eleicao - p.tse_prestacao_dias,
           GREATEST(1,LEAST(v_num_semanas,((v_dia_marco-1)/7+1)::int)),
           'financeiro'::area_campanha, format('TSE: Prestação de contas parcial (D-%s)', p.tse_prestacao_dias),
           'urgente'::prioridade_demanda, 303
    WHERE format('TSE: Prestação de contas parcial (D-%s)', p.tse_prestacao_dias) <> ALL(v_concluidas_titulos);
  END IF;

  IF p.tse_debates_ativo AND v_eleicao - p.tse_debates_dias BETWEEN v_inicio AND v_inicio + v_duracao - 1
     AND v_cargo IN ('prefeito','governador','senador','presidente','deputado_estadual','deputado_federal') THEN
    v_dia_marco := (v_eleicao - p.tse_debates_dias) - v_inicio + 1;
    v_fase_alvo := CASE WHEN v_dia_marco <= v_fim_pre THEN v_fase_pre WHEN v_dia_marco <= v_fim_lanc THEN v_fase_lanc WHEN v_dia_marco <= v_fim_cons THEN v_fase_cons ELSE v_fase_reta END;
    INSERT INTO public.campanha_tarefas (campanha_id, fase_id, dia, data_prevista, semana, area, titulo, prioridade, ordem)
    SELECT _campanha_id, v_fase_alvo, v_dia_marco, v_eleicao - p.tse_debates_dias,
           GREATEST(1,LEAST(v_num_semanas,((v_dia_marco-1)/7+1)::int)),
           'comunicacao'::area_campanha, format('TSE: Período de debates oficiais (D-%s)', p.tse_debates_dias),
           'alta'::prioridade_demanda, 304
    WHERE format('TSE: Período de debates oficiais (D-%s)', p.tse_debates_dias) <> ALL(v_concluidas_titulos);
  END IF;

END;
$function$;

-- 2) Atualiza data de início e regenera o plano da campanha do Kiribamba
UPDATE public.campanhas
SET data_inicio_plano = '2026-04-23'
WHERE id = 'b01ff8a0-4170-4001-a7b8-d4b4995d74ce';

SELECT public.gerar_plano_90_dias('b01ff8a0-4170-4001-a7b8-d4b4995d74ce');
