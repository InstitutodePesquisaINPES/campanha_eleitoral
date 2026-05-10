import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export const useComunicacao = () => {
  const dispararEmMassaMutation = useMutation({
    mutationFn: async (campanhaId: string) => {
      const res = await api.post('/comunicacao/enviar/massa', { campanhaId });
      return res.data;
    },
  });

  const gerarSegmentacaoMutation = useMutation({
    mutationFn: async (filtros: any) => {
      const res = await api.post('/pessoas/segmentacao', filtros);
      return res.data;
    },
  });

  return {
    dispararEmMassaMutation,
    gerarSegmentacaoMutation,
  };
};
