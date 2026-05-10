import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export type PessoaInput = {
  fullName: string;
  tipoPessoa?: string;
  cpf?: string;
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  dataNascimento?: string;
  genero?: string;
  escolaridade?: string;
  nivelRelacionamento?: string;
  observacoes?: string;
};

// ---- PESSOAS ----
export function usePessoas(search?: string, nivel?: string, tipo?: string) {
  return useQuery({
    queryKey: ["pessoas", search, nivel, tipo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (nivel && nivel !== "all") params.append("nivel", nivel);
      if (tipo && tipo !== "all") params.append("tipo", tipo);
      
      const queryStr = params.toString();
      return api.get<any[]>(`/pessoas${queryStr ? `?${queryStr}` : ''}`);
    },
  });
}

export function usePessoa(id?: string) {
  return useQuery({
    queryKey: ["pessoa", id],
    queryFn: async () => {
      if (!id) return null;
      return api.get<any>(`/pessoas/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreatePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: PessoaInput) => {
      return api.post<any>("/pessoas", values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
}

export function useUpdatePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & Partial<PessoaInput>) => {
      return api.patch<any>(`/pessoas/${id}`, values);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["pessoas"] });
      qc.invalidateQueries({ queryKey: ["pessoa", vars.id] });
    },
  });
}

export function useDeletePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<void>(`/pessoas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
}

// ---- CONTATOS ----
export function useContatos(pessoaId?: string) {
  return useQuery({
    queryKey: ["pessoas_contatos", pessoaId],
    queryFn: async () => {
      return api.get<any[]>(`/pessoas/${pessoaId}/contatos`);
    },
    enabled: !!pessoaId,
  });
}

export function useCreateContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { pessoaId: string; tipo: string; valor: string; principal?: boolean }) => {
      const { pessoaId, ...data } = values;
      return api.post<any>(`/pessoas/${pessoaId}/contatos`, data);
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["pessoas_contatos", v.pessoaId] }),
  });
}

export function useDeleteContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoaId }: { id: string; pessoaId: string }) => {
      await api.delete<void>(`/pessoas/contatos/${id}`);
      return pessoaId;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["pessoas_contatos", pessoaId] }),
  });
}

// ---- ENDEREÇOS ----
export function useEnderecos(pessoaId?: string) {
  return useQuery({
    queryKey: ["pessoas_enderecos", pessoaId],
    queryFn: async () => {
      return api.get<any[]>(`/pessoas/${pessoaId}/enderecos`);
    },
    enabled: !!pessoaId,
  });
}

export function useCreateEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { pessoaId: string; logradouro?: string; numero?: string; complemento?: string; bairroId?: string; municipioId?: string; cep?: string; tipo?: string }) => {
      const { pessoaId, ...data } = values;
      return api.post<any>(`/pessoas/${pessoaId}/enderecos`, data);
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["pessoas_enderecos", v.pessoaId] }),
  });
}

export function useDeleteEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoaId }: { id: string; pessoaId: string }) => {
      await api.delete<void>(`/pessoas/enderecos/${id}`);
      return pessoaId;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["pessoas_enderecos", pessoaId] }),
  });
}

// ---- PAPÉIS ----
export function usePapeis(pessoaId?: string) {
  return useQuery({
    queryKey: ["pessoas_papeis", pessoaId],
    queryFn: async () => {
      return api.get<any[]>(`/pessoas/${pessoaId}/papeis`);
    },
    enabled: !!pessoaId,
  });
}

export function useCreatePapel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { pessoaId: string; papel: string; ativo?: boolean }) => {
      const { pessoaId, ...data } = values;
      return api.post<any>(`/pessoas/${pessoaId}/papeis`, data);
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["pessoas_papeis", v.pessoaId] }),
  });
}

export function useDeletePapel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoaId }: { id: string; pessoaId: string }) => {
      await api.delete<void>(`/pessoas/papeis/${id}`);
      return pessoaId;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["pessoas_papeis", pessoaId] }),
  });
}

// ---- TAGS ----
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      return api.get<any[]>('/pessoas/tags');
    },
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { nome: string; cor?: string; categoria?: string }) => {
      return api.post<any>('/pessoas/tags', values);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useAddPessoaTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pessoaId, tagId }: { pessoaId: string; tagId: string }) => {
      return api.post<void>(`/pessoas/${pessoaId}/tags/${tagId}`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
}

export function useRemovePessoaTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pessoaId, tagId }: { pessoaId: string; tagId: string }) => {
      return api.delete<void>(`/pessoas/${pessoaId}/tags/${tagId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
}

// HISTORICO E CONSENTIMENTOS NAO IMPLEMENTADOS AINDA NA API (Mockados)
export function useHistorico(pessoaId?: string) {
  return useQuery({
    queryKey: ["pessoas_historico", pessoaId],
    queryFn: async () => [],
    enabled: !!pessoaId,
  });
}

export function useCreateHistorico() {
  return useMutation({ mutationFn: async () => {} });
}

export function useConsentimentos(pessoaId?: string) {
  return useQuery({
    queryKey: ["pessoas_consentimentos", pessoaId],
    queryFn: async () => [],
    enabled: !!pessoaId,
  });
}

export function useCreateConsentimento() {
  return useMutation({ mutationFn: async () => {} });
}
