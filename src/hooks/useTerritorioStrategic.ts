// Visão estratégica de territórios — agrega dados cruzados (eleitorado, bairros, pessoas, classificação)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

// IDs IBGE da microrregião de Vitória da Conquista (32 municípios) usados como "foco padrão" do Kiribamba
export const MICRORREGIAO_VC_IBGE = [
  "2933307", // Vitória da Conquista
  "2900801", // Anagé
  "2901502", // Aracatu
  "2904605", // Barra do Choça
  "2905107", // Belo Campo
  "2906857", // Boa Nova
  "2908804", // Cândido Sales
  "2909307", // Caraíbas
  "2909802", // Caetanos
  "2910008", // Caatiba
  "2911105", // Condeúba
  "2911501", // Cordeiros
  "2913606", // Encruzilhada
  "2918803", // Guajeru
  "2918902", // Iguaí
  "2919306", // Ibicuí
  "2920009", // Itambé
  "2921906", // Itapetinga
  "2922151", // Itarantim
  "2922706", // Itororó
  "2924108", // Jussiape (placeholder, ajustar se necessário)
  "2925006", // Licínio de Almeida
  "2925501", // Macarani
  "2925709", // Maetinga
  "2926707", // Maiquinique
  "2929206", // Mortugaba
  "2930105", // Nova Canaã
  "2932101", // Piripá
  "2932457", // Planalto
  "2932903", // Poções
  "2933208", // Presidente Jânio Quadros
  "2933455", // Ribeirão do Largo
  "2933604", // Tremedal
];

export type StrategicMunicipio = {
  id: string;
  nome: string;
  estado_sigla: string;
  geocodigo_ibge: string | null;
  populacao: number | null;
  eleitorado_total: number | null;
  latitude: number | null;
  longitude: number | null;
  classificacao_estrategica: "A" | "B" | "C" | "foco" | null;
  prioridade_campanha: number | null;
  notas_estrategicas: string | null;
  bairros_count: number;
  pessoas_count: number;
  is_foco: boolean; // está nos municipios_foco_ids da campanha ativa OU é da microrregião de VC
};

export function useStrategicMunicipios() {
  return useQuery({
    queryKey: ["strategic-municipios"],
    queryFn: async (): Promise<StrategicMunicipio[]> => {
      const data = await api.get<StrategicMunicipio[]>('/territorio/municipios/strategic');
      return data || [];
    },
  });
}

export function useUpdateMunicipioStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vals: {
      id: string;
      classificacao_estrategica?: "A" | "B" | "C" | "foco" | null;
      prioridade_campanha?: number | null;
      notas_estrategicas?: string | null;
    }) => {
      const { id, ...patch } = vals;
      await api.put(`/territorio/municipios/${id}/strategy`, patch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["strategic-municipios"] });
      qc.invalidateQueries({ queryKey: ["municipios"] });
    },
  });
}
