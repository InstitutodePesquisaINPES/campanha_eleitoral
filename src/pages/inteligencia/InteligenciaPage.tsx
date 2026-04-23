import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HeatmapLacunas } from "@/components/inteligencia/HeatmapLacunas";
import { LacunasTable } from "@/components/inteligencia/LacunasTable";
import { Brain } from "lucide-react";
import { InteligenciaNavBar } from "@/components/inteligencia-shared/InteligenciaNavBar";
import { useCampanhas } from "@/hooks/useCampanhas";

export default function InteligenciaPage() {
  const { data: campanhas = [] } = useCampanhas();
  const [campanhaId] = useState(campanhas[0]?.id);
  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1500px] mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Inteligência Territorial
          </h1>
          <p className="text-sm text-muted-foreground">
            Onde a campanha precisa de presença urgente — cruzamento de demandas, cobertura e classificação estratégica.
          </p>
        </div>
        <InteligenciaNavBar campanhaId={campanhaId} />
        <HeatmapLacunas />
        <LacunasTable />
      </div>
    </AppLayout>
  );
}
