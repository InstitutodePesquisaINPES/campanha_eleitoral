import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";
import { MunicipiosTab } from "@/components/territorial/MunicipiosTab";
import { BairrosTab } from "@/components/territorial/BairrosTab";
import { ZonasTab } from "@/components/territorial/ZonasTab";
import { AreasTab } from "@/components/territorial/AreasTab";
import { TerritorioStats } from "@/components/territorial/TerritorioStats";
import { ImportIBGETab } from "@/components/territorial/ImportIBGETab";
import { ImportBairrosTab } from "@/components/territorial/ImportBairrosTab";

export default function TerritoriosPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Cadastro Territorial
          </h1>
        </div>

        <TerritorioStats />

        <Tabs defaultValue="municipios">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="municipios">Municípios</TabsTrigger>
            <TabsTrigger value="bairros">Bairros</TabsTrigger>
            <TabsTrigger value="zonas">Zonas & Seções</TabsTrigger>
            <TabsTrigger value="areas">Áreas de Atuação</TabsTrigger>
            <TabsTrigger value="importar">Importar</TabsTrigger>
          </TabsList>
          <TabsContent value="municipios" className="space-y-4">
            <MunicipiosTab />
          </TabsContent>
          <TabsContent value="bairros"><BairrosTab /></TabsContent>
          <TabsContent value="zonas"><ZonasTab /></TabsContent>
          <TabsContent value="areas"><AreasTab /></TabsContent>
          <TabsContent value="importar" className="space-y-4">
            <ImportIBGETab />
            <ImportBairrosTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
