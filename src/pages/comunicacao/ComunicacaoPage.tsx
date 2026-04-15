import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ComunicacaoModule } from "@/components/comunicacao/ComunicacaoModule";

export default function ComunicacaoPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ComunicacaoModule />
      </AppLayout>
    </ProtectedRoute>
  );
}
