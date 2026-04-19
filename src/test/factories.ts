/* Test data factories */
export const makeNotificacao = (overrides = {}) => ({
  id: "notif-1",
  user_id: "user-1",
  tipo: "info" as const,
  prioridade: "media" as const,
  titulo: "Teste",
  mensagem: "Mensagem teste",
  link: null,
  entidade_tipo: null,
  entidade_id: null,
  lida: false,
  lida_em: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const makeContrato = (overrides = {}) => ({
  id: "ct-1",
  numero: "001/2026",
  objeto: "Locação de equipamentos",
  valor: 25000,
  status: "rascunho",
  data_inicio: "2026-01-01",
  data_fim: "2026-12-31",
  ...overrides,
});

export const makeAprovacao = (overrides = {}) => ({
  id: "ap-1",
  contrato_id: "ct-1",
  ordem: 1,
  papel: "tesoureiro" as const,
  status: "pendente" as const,
  aprovador_id: null,
  observacao: null,
  exige_observacao: false,
  decidido_em: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const makeMunicipio = (overrides = {}) => ({
  id: "m-1",
  nome: "Salvador",
  populacao_2022: 2418005,
  area_km2: 693.27,
  idh: 0.759,
  urbano_pct: 99.5,
  densidade_hab_km2: 3488,
  ...overrides,
});
