import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BackendProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  cpf: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const data = await api.get<BackendProfile>("/profile");
      if (!data) return null;
      return {
        ...data,
        user_id: data.userId,
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      } as Profile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "full_name" | "phone" | "cpf" | "avatar_url">>) => {
      if (!user) throw new Error("Not authenticated");
      const payload: Partial<BackendProfile> = {};
      if (updates.full_name !== undefined) payload.fullName = updates.full_name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.cpf !== undefined) payload.cpf = updates.cpf;
      if (updates.avatar_url !== undefined) payload.avatarUrl = updates.avatar_url;
      
      const data = await api.put<BackendProfile>("/profile", payload);
      if (!data) return null;
      return {
        ...data,
        user_id: data.userId,
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      } as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
