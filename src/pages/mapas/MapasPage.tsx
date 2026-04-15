import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MapaInterativo } from "@/components/mapas/MapaInterativo";

export default function MapasPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <MapaInterativo />
      </AppLayout>
    </ProtectedRoute>
  );
}
