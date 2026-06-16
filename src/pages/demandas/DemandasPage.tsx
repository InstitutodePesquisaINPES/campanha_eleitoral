import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemandasList } from "@/components/demandas/DemandasList";
import { DemandaDetail } from "@/components/demandas/DemandaDetail";
import { DemandasKPIs } from "@/components/demandas/DemandasKPIs";
import { DemandasSLADashboard } from "@/components/demandas/DemandasSLADashboard";

export default function DemandasPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("lista");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Demandas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Atendimento ao cidadão · SLA · Encaminhamentos · Resolução</p>
        </div>

        {selectedId ? (
          <DemandaDetail demandaId={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="lista" className="gap-1"><FileText className="h-4 w-4" />Lista</TabsTrigger>
              <TabsTrigger value="sla" className="gap-1"><Activity className="h-4 w-4" />SLA & Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="lista" className="space-y-4">
              <DemandasKPIs />
              <DemandasList onSelect={setSelectedId} />
            </TabsContent>
            <TabsContent value="sla">
              <DemandasSLADashboard onSelect={(id) => { setSelectedId(id); setTab("lista"); }} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
