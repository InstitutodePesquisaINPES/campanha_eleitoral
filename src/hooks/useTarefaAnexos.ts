import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TarefaAnexo = {
  id: string;
  tarefa_id: string;
  campanha_id: string;
  titulo: string;
  descricao: string | null;
  tipo_documento: string | null;
  storage_path: string;
  arquivo_nome: string | null;
  arquivo_tamanho: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export function useTarefaAnexos(tarefaId?: string) {
  return useQuery({
    queryKey: ["tarefa-anexos", tarefaId],
    enabled: !!tarefaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanha_tarefa_anexos" as never)
        .select("*")
        .eq("tarefa_id", tarefaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TarefaAnexo[];
    },
  });
}

export function useUploadTarefaAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      tarefa_id: string;
      campanha_id: string;
      titulo: string;
      descricao?: string;
      tipo_documento?: string;
      file: File;
    }) => {
      const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${input.campanha_id}/${input.tarefa_id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("tarefa-documentos")
        .upload(path, input.file, { contentType: input.file.type, upsert: false });
      if (upErr) throw upErr;

      const { data: userRes } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("campanha_tarefa_anexos" as never)
        .insert({
          tarefa_id: input.tarefa_id,
          campanha_id: input.campanha_id,
          titulo: input.titulo,
          descricao: input.descricao ?? null,
          tipo_documento: input.tipo_documento ?? "outros",
          storage_path: path,
          arquivo_nome: input.file.name,
          arquivo_tamanho: input.file.size,
          mime_type: input.file.type,
          uploaded_by: userRes.user?.id ?? null,
        } as never)
        .select()
        .single();
      if (error) {
        // tenta limpar arquivo se falhou registrar
        await supabase.storage.from("tarefa-documentos").remove([path]);
        throw error;
      }
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefa-anexos", vars.tarefa_id] });
      qc.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Anexo enviado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTarefaAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (anexo: TarefaAnexo) => {
      await supabase.storage.from("tarefa-documentos").remove([anexo.storage_path]);
      const { error } = await supabase
        .from("campanha_tarefa_anexos" as never)
        .delete()
        .eq("id", anexo.id);
      if (error) throw error;
    },
    onSuccess: (_d, anexo) => {
      qc.invalidateQueries({ queryKey: ["tarefa-anexos", anexo.tarefa_id] });
      qc.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Anexo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("tarefa-documentos")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
