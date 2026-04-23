import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Promove uma liderança para o CRM (cria pessoa) e vincula via pessoa_id.
 */
export function usePromoverLiderancaParaCRM() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (lideranca: any) => {
      if (lideranca.pessoa_id) {
        toast.info("Liderança já está no CRM");
        return lideranca.pessoa_id;
      }

      // 1. Cria a pessoa
      const { data: pessoa, error: e1 } = await supabase.from("pessoas").insert({
        full_name: lideranca.nome,
        tipo_pessoa: "pf",
        nivel_relacionamento: lideranca.status === "aliado" ? "aliado" : "lideranca",
        observacoes: `[Liderança ${lideranca.classificacao}] ${lideranca.observacoes ?? ""}`.trim(),
        created_by: user?.id,
      } as any).select().single();
      if (e1) throw e1;

      // 2. Cria contatos
      if (lideranca.telefone) {
        await supabase.from("pessoas_contatos").insert({
          pessoa_id: pessoa.id, tipo: "celular", valor: lideranca.telefone, principal: true,
        });
      }
      if (lideranca.whatsapp && lideranca.whatsapp !== lideranca.telefone) {
        await supabase.from("pessoas_contatos").insert({
          pessoa_id: pessoa.id, tipo: "whatsapp", valor: lideranca.whatsapp,
        });
      }

      // 3. Adiciona papel de liderança
      await supabase.from("pessoas_papeis").insert({
        pessoa_id: pessoa.id, papel: "lideranca", ativo: true,
      } as any);

      // 4. Vincula a liderança à pessoa
      const { error: e4 } = await supabase.from("liderancas_locais")
        .update({ pessoa_id: pessoa.id })
        .eq("id", lideranca.id);
      if (e4) throw e4;

      return pessoa.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liderancas"] });
      qc.invalidateQueries({ queryKey: ["pessoas"] });
      qc.invalidateQueries({ queryKey: ["inteligencia-kpis"] });
      toast.success("Liderança adicionada ao CRM");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/**
 * Cria demanda territorial vinculada a um bairro/município (a partir do mapa estratégico).
 */
export function useCriarDemandaTerritorial() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { titulo: string; descricao?: string; bairro_id?: string; municipio_id?: string; prioridade?: string }) => {
      const { data, error } = await supabase.from("demandas").insert({
        titulo: input.titulo,
        descricao: input.descricao,
        prioridade: (input.prioridade ?? "alta") as any,
        protocolo: "TEMP",
        created_by: user?.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demandas"] });
      qc.invalidateQueries({ queryKey: ["inteligencia-kpis"] });
      toast.success("Demanda criada");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/**
 * Adiciona/promove um município ao plano estratégico (cria registro em municipios_estrategicos).
 */
export function useAdicionarMunicipioAoPlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { campanha_id: string; municipio_id: string; classificacao?: string; meta_votos?: number; observacoes?: string }) => {
      const { data, error } = await supabase.from("municipios_estrategicos")
        .upsert({
          campanha_id: input.campanha_id,
          municipio_id: input.municipio_id,
          classificacao: (input.classificacao ?? "expansao") as any,
          meta_votos: input.meta_votos ?? 0,
          score: 50,
          prioridade: 3,
          observacoes: input.observacoes,
        }, { onConflict: "campanha_id,municipio_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["municipios-estrategicos"] });
      qc.invalidateQueries({ queryKey: ["inteligencia-kpis"] });
      toast.success("Município adicionado ao plano");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
