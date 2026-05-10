import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Settings, Brush, Trophy, Building } from "lucide-react";
import { ThemePanel } from "@/components/ui/ThemePanel";

export default function SettingsPage() {
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  const isAdmin = roles.includes("admin");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("system_settings").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const getSetting = (key: string, defaultValue: string = "") => {
    const s = settings.find((s: any) => s.key === key);
    if (!s) return defaultValue;
    const val = s.value;
    return typeof val === "string" ? val.replace(/^"|"$/g, "") : String(val);
  };

  // Eleição
  const [tipo, setTipo] = useState("");
  const [ano, setAno] = useState("");
  const [turno, setTurno] = useState("");
  const [uf, setUf] = useState("");

  // White Label / Branding
  const [brandName, setBrandName] = useState("");
  const [brandNumber, setBrandNumber] = useState("");
  const [brandSubtitle, setBrandSubtitle] = useState("");

  // Gamificação
  const [pontosPorEleitor, setPontosPorEleitor] = useState("");

  useEffect(() => {
    if (settings.length > 0) {
      setTipo(getSetting("eleicao_tipo"));
      setAno(getSetting("eleicao_ano"));
      setTurno(getSetting("eleicao_turno"));
      setUf(getSetting("eleicao_uf"));
      
      setBrandName(getSetting("brand_name", "KIRIBAMBA"));
      setBrandNumber(getSetting("brand_number", "70"));
      setBrandSubtitle(getSetting("brand_subtitle", "Avante · Dep. Federal"));
      
      setPontosPorEleitor(getSetting("gamificacao_pontos_base", "10"));
    }
  }, [settings]);

  const upsertSetting = async (key: string, value: string) => {
    // Check if exists
    const exists = settings.find((s: any) => s.key === key);
    if (exists) {
      await supabase.from("system_settings").update({ value: JSON.stringify(value), updated_by: user?.id }).eq("key", key);
    } else {
      await supabase.from("system_settings").insert({ key, value: JSON.stringify(value), updated_by: user?.id });
    }
  };

  const updateSettingMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        upsertSetting("eleicao_tipo", tipo),
        upsertSetting("eleicao_ano", ano),
        upsertSetting("eleicao_turno", turno),
        upsertSetting("eleicao_uf", uf),
        
        upsertSetting("brand_name", brandName),
        upsertSetting("brand_number", brandNumber),
        upsertSetting("brand_subtitle", brandSubtitle),
        
        upsertSetting("gamificacao_pontos_base", pontosPorEleitor),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({ title: "Configurações salvas e aplicadas em tempo real!" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao salvar" });
    }
  });

  if (rolesLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2 tracking-tight">
            <Settings className="h-7 w-7 text-blue-600" />
            Configurações e White Label
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os parâmetros globais e a identidade visual da campanha.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* THEME ENGINE */}
        <div className="md:col-span-2">
          <ThemePanel />
        </div>

        {/* IDENTIDADE VISUAL */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Brush className="w-5 h-5 text-indigo-500" /> Identidade Visual (Sidebar)</CardTitle>
              <CardDescription>Personalize o nome, número e cargo no menu principal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Nome da Campanha</Label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ex: JOÃO PREFEITO" className="font-bold" />
              </div>
              <div className="space-y-2">
                <Label>Número Eleitoral</Label>
                <Input value={brandNumber} onChange={(e) => setBrandNumber(e.target.value)} placeholder="Ex: 12" className="text-xl font-black w-32" />
              </div>
              <div className="space-y-2">
                <Label>Partido e Cargo (Subtítulo)</Label>
                <Input value={brandSubtitle} onChange={(e) => setBrandSubtitle(e.target.value)} placeholder="Ex: PDT · Prefeito de SP" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* GAMIFICAÇÃO */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Regras de Gamificação</CardTitle>
                <CardDescription>Defina o peso estratégico do engajamento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label>Pontos base por Eleitor Captado</Label>
                  <Input type="number" value={pontosPorEleitor} onChange={(e) => setPontosPorEleitor(e.target.value)} placeholder="Ex: 10" />
                  <p className="text-xs text-slate-500">Esta pontuação alimenta o Ranking de Lideranças automaticamente.</p>
                </div>
              </CardContent>
            </Card>

            {/* ELEIÇÃO */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Building className="w-5 h-5 text-emerald-500" /> Dados da Eleição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="municipal">Municipal</SelectItem>
                        <SelectItem value="estadual">Estadual</SelectItem>
                        <SelectItem value="federal">Federal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input value={ano} onChange={(e) => setAno(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Turno</Label>
                    <Select value={turno} onValueChange={setTurno}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1º Turno</SelectItem>
                        <SelectItem value="2">2º Turno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>UF</Label>
                    <Input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} maxLength={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button size="lg" className="px-12 font-bold shadow-md hover:shadow-lg transition-all" onClick={() => updateSettingMutation.mutate()} disabled={updateSettingMutation.isPending}>
            {updateSettingMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Salvar e Aplicar
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
