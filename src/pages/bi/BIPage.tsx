import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { BIDashboard } from "@/components/bi/BIDashboard";

export default function BIPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <BIDashboard />
      </AppLayout>
    </ProtectedRoute>
  );
}
