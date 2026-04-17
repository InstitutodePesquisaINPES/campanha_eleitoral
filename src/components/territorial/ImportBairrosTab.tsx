import { useState } from "react";
import { useEstados, useMunicipios, useBairros, useCreateBairro } from "@/hooks/useTerritorio";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

export function ImportBairrosTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: estados = [] } = useEstados();
  const [estadoId, setEstadoId] = useState<string>("");
  const { data: municipios = [] } = useMunicipios(estadoId || undefined);
  const [municipioId, setMunicipioId] = useState<string>("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!municipioId) {
      toast({ variant: "destructive", title: "Selecione o município" });
      return;
    }
    const linhas = texto
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (linhas.length === 0) {
      toast({ variant: "destructive", title: "Cole ao menos um bairro" });
      return;
    }

    setLoading(true);
    try {
      // dedup contra existentes (case-insensitive)
      const { data: existentes } = await supabase
        .from("bairros")
        .select("nome")
        .eq("municipio_id", municipioId);
      const set = new Set((existentes || []).map((b: any) => b.nome.toLowerCase()));
      const novos = Array.from(new Set(linhas))
        .filter((n) => !set.has(n.toLowerCase()))
        .map((nome) => ({ nome, municipio_id: municipioId }));

      if (novos.length === 0) {
        toast({ title: "Nada a importar", description: "Todos os bairros já existem." });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("bairros").insert(novos);
      if (error) throw error;

      qc.invalidateQueries({ queryKey: ["bairros"] });
      qc.invalidateQueries({ queryKey: ["territorio-stats"] });
      toast({ title: `${novos.length} bairros importados!`, description: `${linhas.length - novos.length} já existiam` });
      setTexto("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Importar Bairros em Lote
        </CardTitle>
        <CardDescription>
          Cole uma lista (um bairro por linha). Nomes duplicados serão ignorados automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Estado *</Label>
            <Select value={estadoId} onValueChange={(v) => { setEstadoId(v); setMunicipioId(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {estados.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.sigla} - {e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Município *</Label>
            <Select value={municipioId} onValueChange={setMunicipioId} disabled={!estadoId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {municipios.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Lista de bairros (um por linha)</Label>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={"Centro\nJardim das Flores\nVila Nova\n..."}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {texto.split("\n").filter((l) => l.trim()).length} linha(s)
          </p>
        </div>

        <Button onClick={handleImport} disabled={loading || !municipioId || !texto.trim()}>
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
          Importar
        </Button>
      </CardContent>
    </Card>
  );
}
