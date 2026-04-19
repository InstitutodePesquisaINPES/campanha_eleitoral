// Funil eleitoral profissional — mapeado sobre o enum existente nivel_relacionamento
// Metodologia: estágios de conversão do eleitor (do desconhecido ao multiplicador)

export type NivelRelacionamento = "desconhecido" | "frio" | "morno" | "quente" | "aliado" | "lideranca";

export const NIVEL_FUNIL: Record<NivelRelacionamento, {
  label: string;
  curto: string;
  etapa: number;
  descricao: string;
  className: string;
  dot: string;
}> = {
  desconhecido: {
    label: "Não mapeado",
    curto: "Não mapeado",
    etapa: 0,
    descricao: "Cadastro recém-criado, sem qualificação ainda.",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  frio: {
    label: "1 · Identificado",
    curto: "Identificado",
    etapa: 1,
    descricao: "Eleitor mapeado, sem vínculo nem posição definida.",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  morno: {
    label: "2 · Simpatizante",
    curto: "Simpatizante",
    etapa: 2,
    descricao: "Demonstra simpatia, ainda não declarou voto.",
    className: "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  quente: {
    label: "3 · Apoiador",
    curto: "Apoiador",
    etapa: 3,
    descricao: "Voto declarado, disposto a divulgar a candidatura.",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  aliado: {
    label: "4 · Multiplicador",
    curto: "Multiplicador",
    etapa: 4,
    descricao: "Engaja terceiros, mobiliza rede própria pela campanha.",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  lideranca: {
    label: "5 · Liderança",
    curto: "Liderança",
    etapa: 5,
    descricao: "Referência local com capacidade de entregar votos em volume.",
    className: "bg-primary/15 text-primary border-primary/40",
    dot: "bg-primary",
  },
};

export const NIVEIS_ORDENADOS: NivelRelacionamento[] = ["desconhecido", "frio", "morno", "quente", "aliado", "lideranca"];

// Papéis no contexto eleitoral
export const PAPEL_INFO: Record<string, { label: string; descricao: string; grupo: "eleitoral" | "operacional" | "externo" }> = {
  eleitor:            { label: "Eleitor",            descricao: "Pessoa do território, mapeada na base eleitoral.",        grupo: "eleitoral" },
  apoiador:           { label: "Apoiador",           descricao: "Declarou apoio público à candidatura.",                    grupo: "eleitoral" },
  lideranca:          { label: "Liderança",          descricao: "Multiplicador com influência sobre rede de eleitores.",    grupo: "eleitoral" },
  coordenador_bairro: { label: "Coord. de Bairro",   descricao: "Responsável operacional pela mobilização local.",          grupo: "operacional" },
  equipe:             { label: "Equipe da campanha", descricao: "Membro da estrutura interna (assessoria, voluntário).",    grupo: "operacional" },
  doador:             { label: "Doador",             descricao: "Contribuiu financeiramente — declarável ao TSE.",          grupo: "operacional" },
  fornecedor:         { label: "Fornecedor",         descricao: "Empresa/PF que presta serviço à campanha.",                grupo: "operacional" },
  demandante:         { label: "Demandante",         descricao: "Cidadão que abriu uma demanda no SIGT.",                   grupo: "externo" },
  imprensa:           { label: "Imprensa",           descricao: "Jornalista, blog, rádio ou veículo de comunicação.",       grupo: "externo" },
  institucional:      { label: "Institucional",      descricao: "Representante de poder público ou entidade.",              grupo: "externo" },
};

export const ESCOLARIDADES = [
  "Não alfabetizado",
  "Fundamental incompleto",
  "Fundamental completo",
  "Médio incompleto",
  "Médio completo",
  "Superior incompleto",
  "Superior completo",
  "Pós-graduação",
];

export const SEGMENTOS_EMPRESA = [
  "Comércio varejista",
  "Construção civil",
  "Serviços",
  "Indústria",
  "Agronegócio",
  "Saúde",
  "Educação",
  "Transporte e logística",
  "Tecnologia",
  "Alimentação",
  "Imprensa e comunicação",
  "Associação / ONG",
  "Outros",
];
