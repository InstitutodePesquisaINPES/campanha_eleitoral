import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export const useGamificacao = () => {
  const rankingQuery = useQuery({
    queryKey: ['gamificacao-ranking'],
    queryFn: async () => {
      const res = await api.get('/gamificacao/ranking');
      return res.data;
    },
  });

  return {
    rankingQuery,
  };
};
