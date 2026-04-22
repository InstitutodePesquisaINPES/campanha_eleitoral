import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "coordenador" | "lideranca" | "operador" | "visualizador";

const MANAGE_ROLES: AppRole[] = ["admin", "coordenador", "lideranca", "operador"];

export function useUserRoles() {
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []).map((r: { role: string }) => r.role as AppRole);
    },
    enabled: !!user && !loading,
    staleTime: 30_000,
  });
}

export function useHasRole(role: AppRole) {
  const { data: roles = [] } = useUserRoles();
  return roles.includes(role);
}

export function useIsAdmin() {
  return useHasRole("admin");
}

export function useCanManage() {
  const { data: roles = [] } = useUserRoles();
  return roles.some((role) => MANAGE_ROLES.includes(role));
}
