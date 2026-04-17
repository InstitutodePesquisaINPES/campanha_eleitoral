import { useState } from "react";
import { useCampanhaAtiva, useCampanhas, useCreateCampanha } from "@/hooks/useCampanhas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CampanhaEscopoForm, escopoDoCargo, type CargoEleitoral } from "./CampanhaEscopoForm";
import { toast } from "sonner";

const cargos: { v: CargoEleitoral; l: string }[] = [
  { v: "vereador", l: "Vereador" },
  { v: "prefeito", l: "Prefeito" },
  { v: "vice_prefeito", l: "Vice-Prefeito" },
  { v: "deputado_estadual", l: "Deputado Estadual" },
  { v: "deputado_federal", l: "Deputado Federal" },
  { v: "senador", l: "Senador" },
  { v: "governador", l: "Governador" },
  { v: "presidente", l: "Presidente" },
];

export function CampanhaSelector({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const { data: campanhas = [] } = useCampanhas();
  const { data: ativa } = useCampanhaAtiva();
  const [open, setOpen] = useState(false);
  const create = useCreateCampanha();

  const [form, setForm] = useState({
    nome: "",
    cargo: "vereador" as CargoEleitoral,
    data_eleicao: "2026-10-04",
    data_inicio_plano: new Date().toISOString().slice(0, 10),
    estado_id: "",
    municipio_id: "",
    municipios_foco_ids: [] as string[],
    meta_votos: 3000,
    numero_urna: "",
    partido_sigla: "",
  });

  const escopo = escopoDoCargo(form.cargo);
  const valido =
    !!form.nome &&
    (escopo === "municipal" ? !!form.municipio_id : !!form.estado_id);

  const current = value ?? ativa?.id;

  return (
    <div className="flex items-center gap-2">
      <Select value={current ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Selecione uma campanha" />
        </SelectTrigger>
        <SelectContent>
          {campanhas.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome} · {c.cargo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default" className="gap-1">
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Campanha · gera plano 90 dias</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Nome da campanha *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: João Silva 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Cargo *</Label>
                <Select
                  value={form.cargo}
                  onValueChange={(v) => setForm({ ...form, cargo: v as CargoEleitoral, estado_id: "", municipio_id: "", municipios_foco_ids: [] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cargos.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Nº Urna</Label>
                <Input value={form.numero_urna} onChange={(e) => setForm({ ...form, numero_urna: e.target.value })} placeholder="55123" />
              </div>
            </div>

            <CampanhaEscopoForm
              cargo={form.cargo}
              estadoId={form.estado_id}
              municipioId={form.municipio_id}
              municipiosFoco={form.municipios_foco_ids}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Início do plano</Label>
                <Input type="date" value={form.data_inicio_plano} onChange={(e) => setForm({ ...form, data_inicio_plano: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Data da eleição *</Label>
                <Input type="date" value={form.data_eleicao} onChange={(e) => setForm({ ...form, data_eleicao: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Meta de votos</Label>
                <Input type="number" value={form.meta_votos} onChange={(e) => setForm({ ...form, meta_votos: +e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Partido (sigla)</Label>
                <Input value={form.partido_sigla} onChange={(e) => setForm({ ...form, partido_sigla: e.target.value.toUpperCase() })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              disabled={!valido || create.isPending}
              onClick={async () => {
                if (!valido) {
                  toast.error(escopo === "municipal" ? "Selecione um município" : "Selecione um estado");
                  return;
                }
                await create.mutateAsync({
                  nome: form.nome,
                  cargo: form.cargo,
                  data_eleicao: form.data_eleicao,
                  data_inicio_plano: form.data_inicio_plano,
                  estado_id: form.estado_id || null,
                  municipio_id: form.municipio_id || null,
                  municipios_foco_ids: form.municipios_foco_ids,
                  meta_votos: form.meta_votos,
                  numero_urna: form.numero_urna || null,
                  partido_sigla: form.partido_sigla || null,
                } as never);
                setOpen(false);
              }}
            >
              {create.isPending ? "Gerando plano..." : "Criar e gerar plano 90d"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
