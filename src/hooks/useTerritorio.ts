import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

type ClassificacaoTerritorial = "reduto" | "expansao" | "disputa" | "risco" | "baixa_presenca";
type TipoAreaAtuacao = "equipe" | "lider" | "coordenador";

// ---- ESTADOS ----
export function useEstados() {
  return useQuery({
    queryKey: ["estados"],
    queryFn: async () => {
      return api.get<any[]>('/territorial/estados');
    },
  });
}

// ---- MUNICIPIOS ----
export function useMunicipios(estadoId?: string) {
  return useQuery({
    queryKey: ["municipios", estadoId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/municipios${estadoId ? `?estadoId=${estadoId}` : ''}`);
    },
  });
}

export function useCreateMunicipio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      return api.post<any>('/territorial/municipios', values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["municipios"] }),
  });
}

export function useUpdateMunicipio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      return api.patch<any>(`/territorial/municipios/${id}`, values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["municipios"] }),
  });
}

export function useDeleteMunicipio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<void>(`/territorial/municipios/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["municipios"] }),
  });
}

// ---- BAIRROS ----
export function useBairros(municipioId?: string) {
  return useQuery({
    queryKey: ["bairros", municipioId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/bairros${municipioId ? `?municipioId=${municipioId}` : ''}`);
    },
  });
}

export function useCreateBairro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      return api.post<any>('/territorial/bairros', values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bairros"] }),
  });
}

export function useUpdateBairro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      return api.patch<any>(`/territorial/bairros/${id}`, values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bairros"] }),
  });
}

export function useDeleteBairro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<void>(`/territorial/bairros/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bairros"] }),
  });
}

// ---- ZONAS ELEITORAIS ----
export function useZonas(municipioId?: string) {
  return useQuery({
    queryKey: ["zonas_eleitorais", municipioId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/zonas${municipioId ? `?municipioId=${municipioId}` : ''}`);
    },
  });
}

export function useCreateZona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      return api.post<any>('/territorial/zonas', values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zonas_eleitorais"] }),
  });
}

export function useDeleteZona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<void>(`/territorial/zonas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zonas_eleitorais"] }),
  });
}

// ---- SEÇÕES ELEITORAIS ----
export function useSecoes(zonaId?: string) {
  return useQuery({
    queryKey: ["secoes_eleitorais", zonaId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/secoes${zonaId ? `?zonaId=${zonaId}` : ''}`);
    },
    enabled: !!zonaId,
  });
}

export function useCreateSecao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      return api.post<any>('/territorial/secoes', values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["secoes_eleitorais"] }),
  });
}

export function useDeleteSecao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<void>(`/territorial/secoes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["secoes_eleitorais"] }),
  });
}

// ---- DISTRITOS ----
export function useDistritos(municipioId?: string) {
  return useQuery({
    queryKey: ["distritos", municipioId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/distritos${municipioId ? `?municipioId=${municipioId}` : ''}`);
    },
    enabled: !!municipioId,
  });
}

// ---- COMUNIDADES ----
export function useComunidades(bairroId?: string) {
  return useQuery({
    queryKey: ["comunidades", bairroId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/comunidades${bairroId ? `?bairroId=${bairroId}` : ''}`);
    },
    enabled: !!bairroId,
  });
}

// ---- ÁREAS DE ATUAÇÃO ----
export function useAreasAtuacao(municipioId?: string) {
  return useQuery({
    queryKey: ["areas_atuacao", municipioId],
    queryFn: async () => {
      return api.get<any[]>(`/territorial/areas-atuacao${municipioId ? `?municipioId=${municipioId}` : ''}`);
    },
  });
}

export function useCreateAreaAtuacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      return api.post<any>('/territorial/areas-atuacao', values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["areas_atuacao"] }),
  });
}

export function useDeleteAreaAtuacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<void>(`/territorial/areas-atuacao/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["areas_atuacao"] }),
  });
}
