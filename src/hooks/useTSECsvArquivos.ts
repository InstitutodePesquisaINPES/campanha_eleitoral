import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TseCsvStatus =
  | "aguardando"
  | "processando"
  | "pausado"
  | "concluido"
  | "erro";

export type TseCsvTipo =
  | "eleitorado_perfil"
  | "votacao_candidato_perfil"
  | "eleitorado"
  | "locais"
  | "candidatos"
  | "resultados";

export interface TseCsvArquivo {
  id: string;
  nome_original: string;
  tipo: TseCsvTipo;
  ano: number;
  uf: string;
  storage_path: string;
  tabela_destino: string;
  tamanho_bytes: number | null;
  total_linhas: number | null;
  linhas_processadas: number;
  byte_cursor: number;
  status: TseCsvStatus;
  progress_pct: number;
  municipios_filtro: string[] | null;
  chunk_size: number;
  error_msg: string | null;
  attempts: number;
  ultima_atividade_em: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const TABELA_POR_TIPO: Record<TseCsvTipo, string> = {
  eleitorado_perfil: "tse_eleitorado_perfil",
  votacao_candidato_perfil: "tse_votacao_candidato_perfil",
  eleitorado: "tse_eleitorado",
  locais: "tse_locais_votacao",
  candidatos: "tse_candidatos",
  resultados: "tse_resultados_secao",
};

export function useTSECsvArquivos() {
  return useQuery({
    queryKey: ["tse-csv-arquivos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tse_csv_arquivos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as TseCsvArquivo[];
    },
    refetchInterval: 3000,
  });
}

export function useRunTSECsvWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("tse-csv-worker", {
        body: { trigger: "manual" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tse-csv-arquivos"] }),
  });
}

export function usePausarTSECsvArquivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tse_csv_arquivos")
        .update({ status: "pausado" })
        .eq("id", id)
        .in("status", ["aguardando", "processando"]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tse-csv-arquivos"] }),
  });
}

export function useRetomarTSECsvArquivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tse_csv_arquivos")
        .update({ status: "aguardando", error_msg: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tse-csv-arquivos"] }),
  });
}

export function useReprocessarTSECsvArquivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tse_csv_arquivos")
        .update({
          status: "aguardando",
          byte_cursor: 0,
          linhas_processadas: 0,
          progress_pct: 0,
          error_msg: null,
          header_line: null,
          attempts: 0,
          started_at: null,
          finished_at: null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tse-csv-arquivos"] }),
  });
}

export function useExcluirTSECsvArquivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (arquivo: TseCsvArquivo) => {
      // remove do storage primeiro
      await supabase.storage.from("tse-csv-uploads").remove([arquivo.storage_path]);
      const { error } = await supabase
        .from("tse_csv_arquivos")
        .delete()
        .eq("id", arquivo.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tse-csv-arquivos"] }),
  });
}

export function useDownloadTSECsv() {
  return useMutation({
    mutationFn: async (arquivo: TseCsvArquivo) => {
      const { data, error } = await supabase.storage
        .from("tse-csv-uploads")
        .createSignedUrl(arquivo.storage_path, 300);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    },
  });
}

// Tamanho de cada parte (40 MB) — fica abaixo do limite de upload do plano (50 MB).
// O navegador divide o File em N partes e sobe cada uma com upload() padrão.
// O worker depois lê as partes em sequência como se fossem um único arquivo.
const PART_SIZE = 40 * 1024 * 1024;

// Upload + criação do registro de fila. retorna o arquivo criado.
export async function arquivarCsvParaProcessamento(opts: {
  file: File;
  tipo: TseCsvTipo;
  ano: number;
  uf: string;
  municipios_filtro?: string[] | null;
  chunk_size?: number;
  onProgress?: (pct: number) => void;
}): Promise<TseCsvArquivo> {
  const { file, tipo, ano, uf } = opts;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Usuário não autenticado");

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const baseDir = `${userId}/${ts}_${safeName}`;

  // Divide o arquivo em partes de PART_SIZE bytes e sobe cada uma como um objeto separado.
  // Isso evita totalmente o limite de upload do Storage (50 MB padrão) sem depender do plano.
  const totalParts = Math.max(1, Math.ceil(file.size / PART_SIZE));
  const partsPaths: string[] = [];
  const partsSizes: number[] = [];

  for (let i = 0; i < totalParts; i++) {
    const start = i * PART_SIZE;
    const end = Math.min(file.size, start + PART_SIZE);
    const blob = file.slice(start, end);
    const partName = `${baseDir}/part-${String(i).padStart(5, "0")}.csv`;

    let attempt = 0;
    // Retry simples por parte
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { error } = await supabase.storage
        .from("tse-csv-uploads")
        .upload(partName, blob, {
          contentType: "text/csv",
          upsert: true,
          cacheControl: "3600",
        });
      if (!error) break;
      attempt++;
      if (attempt >= 3) {
        throw new Error(
          `Falha ao enviar parte ${i + 1}/${totalParts}: ${error.message}`,
        );
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }

    partsPaths.push(partName);
    partsSizes.push(end - start);

    // Progresso por parte
    const pct = Math.min(99, Math.round(((i + 1) / totalParts) * 100));
    opts.onProgress?.(pct);
  }
  opts.onProgress?.(100);

  // O storage_path "lógico" é a primeira parte (mantém compatibilidade com o restante)
  const { data, error } = await supabase
    .from("tse_csv_arquivos")
    .insert({
      nome_original: file.name,
      tipo,
      ano,
      uf,
      storage_path: partsPaths[0],
      tabela_destino: TABELA_POR_TIPO[tipo],
      tamanho_bytes: file.size,
      parts_total: totalParts,
      parts_paths: partsPaths,
      parts_sizes: partsSizes,
      municipios_filtro:
        opts.municipios_filtro && opts.municipios_filtro.length > 0
          ? opts.municipios_filtro
          : null,
      chunk_size: opts.chunk_size ?? 500,
      created_by: userId,
      status: "aguardando",
    })
    .select("*")
    .single();
  if (error) throw error;

  // Dispara o worker uma vez (fast-start)
  supabase.functions.invoke("tse-csv-worker", { body: { trigger: "fast-start" } }).catch(() => {});

  return data as TseCsvArquivo;
}
