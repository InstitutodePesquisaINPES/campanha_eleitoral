import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMunicipios, useBairros } from "@/hooks/useTerritorio";
import { useAgendaItems } from "@/hooks/useAgenda";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const classificacaoColors: Record<string, string> = {
  reduto: "#10B981",
  expansao: "#3B82F6",
  disputa: "#F59E0B",
  risco: "#EF4444",
  baixa_presenca: "#6B7280",
};

const classificacaoLabels: Record<string, string> = {
  reduto: "Reduto", expansao: "Expansão", disputa: "Disputa", risco: "Risco", baixa_presenca: "Baixa Presença",
};

export function MapaInterativo() {
  const { data: municipios } = useMunicipios();
  const { data: bairros } = useBairros();
  const { data: agenda } = useAgendaItems();

  const [showMunicipios, setShowMunicipios] = useState(true);
  const [showBairros, setShowBairros] = useState(true);
  const [showAgenda, setShowAgenda] = useState(true);

  const center = useMemo(() => {
    const m = municipios?.find(m => m.latitude && m.longitude);
    if (m) return [m.latitude!, m.longitude!] as [number, number];
    return [-15.78, -47.93] as [number, number]; // Brasília default
  }, [municipios]);

  const municipiosWithCoords = municipios?.filter(m => m.latitude && m.longitude) || [];
  const bairrosWithCoords = bairros?.filter(b => b.latitude && b.longitude) || [];
  const agendaWithCoords = agenda?.filter(a => a.latitude && a.longitude) || [];

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Mapa Interativo</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={showMunicipios} onCheckedChange={(v) => setShowMunicipios(!!v)} />
          Municípios ({municipiosWithCoords.length})
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={showBairros} onCheckedChange={(v) => setShowBairros(!!v)} />
          Bairros ({bairrosWithCoords.length})
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={showAgenda} onCheckedChange={(v) => setShowAgenda(!!v)} />
          Eventos ({agendaWithCoords.length})
        </label>

        <div className="flex gap-2 ml-auto">
          {Object.entries(classificacaoColors).map(([key, color]) => (
            <Badge key={key} variant="outline" className="text-[10px]" style={{ borderColor: color, color }}>
              {classificacaoLabels[key]}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height: "calc(100vh - 260px)", minHeight: 400 }}>
            <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {showMunicipios && municipiosWithCoords.map(m => (
                <Marker key={m.id} position={[m.latitude!, m.longitude!]}>
                  <Popup>
                    <strong>{m.nome}</strong>
                    {m.populacao && <p className="text-xs">Pop: {m.populacao.toLocaleString("pt-BR")}</p>}
                    {m.eleitorado_total && <p className="text-xs">Eleitorado: {m.eleitorado_total.toLocaleString("pt-BR")}</p>}
                  </Popup>
                </Marker>
              ))}

              {showBairros && bairrosWithCoords.map(b => (
                <CircleMarker
                  key={b.id}
                  center={[b.latitude!, b.longitude!]}
                  radius={8}
                  pathOptions={{
                    fillColor: classificacaoColors[b.classificacao || "baixa_presenca"] || "#6B7280",
                    color: classificacaoColors[b.classificacao || "baixa_presenca"] || "#6B7280",
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{b.nome}</strong>
                    {b.classificacao && <p className="text-xs">Classif: {classificacaoLabels[b.classificacao]}</p>}
                  </Popup>
                </CircleMarker>
              ))}

              {showAgenda && agendaWithCoords.map(a => (
                <CircleMarker
                  key={a.id}
                  center={[a.latitude!, a.longitude!]}
                  radius={6}
                  pathOptions={{ fillColor: "#F59E0B", color: "#F59E0B", fillOpacity: 0.8, weight: 2 }}
                >
                  <Popup>
                    <strong>{a.titulo}</strong>
                    <p className="text-xs">{a.tipo} — {a.status}</p>
                    {a.local && <p className="text-xs">{a.local}</p>}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
