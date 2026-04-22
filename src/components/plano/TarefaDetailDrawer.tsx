import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUpdateTarefa, type Tarefa } from "@/hooks/useCampanhas";
import {
  useTarefaAnexos,
  useUploadTarefaAnexo,
  useDeleteTarefaAnexo,
  getSignedUrl,
  type TarefaAnexo,
} from "@/hooks/useTarefaAnexos";
import { FileText, Upload, Download, Trash2, CalendarDays, Clock } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTS = [
  { value: "pendente", label: "A fazer" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "atrasada", label: "Atrasada" },
];

const TIPOS_DOC = ["contrato", "ata", "comprovante", "proposta", "oficio", "midia", "outros"];

export function TarefaDetailDrawer({
  tarefa,
  open,
  onOpenChange,
  canManage,
}: {
  tarefa: Tarefa | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  canManage: boolean;
}) {
  const update = useUpdateTarefa();
  const { data: anexos = [] } = useTarefaAnexos(tarefa?.id);
  const upload = useUploadTarefaAnexo();
  const remove = useDeleteTarefaAnexo();

  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("outros");
  const [obs, setObs] = useState("");

  if (!tarefa) return null;

  const handleDownload = async (a: TarefaAnexo) => {
    try {
      const url = await getSignedUrl(a.storage_path);
      window.open(url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{tarefa.titulo}</SheetTitle>
          <SheetDescription className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(tarefa.data_prevista).toLocaleDateString("pt-BR")}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Dia {tarefa.dia} · Semana {tarefa.semana}</span>
            <Badge variant="outline" className="capitalize text-[10px]">{tarefa.area}</Badge>
            <Badge variant="outline" className="capitalize text-[10px]">{tarefa.prioridade}</Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 mt-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select
              value={tarefa.status}
              disabled={!canManage}
              onValueChange={(v) =>
                update.mutate({
                  id: tarefa.id,
                  status: v as never,
                  data_conclusao: v === "concluida" ? new Date().toISOString() : null,
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {tarefa.descricao && (
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tarefa.descricao}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Observações da execução</Label>
            <Textarea
              defaultValue={(tarefa as { observacoes?: string | null }).observacoes ?? ""}
              placeholder="Notas sobre o andamento, decisões, próximos passos..."
              disabled={!canManage}
              onBlur={(e) => {
                const val = e.target.value;
                if (val !== ((tarefa as { observacoes?: string | null }).observacoes ?? "")) {
                  update.mutate({ id: tarefa.id, observacoes: val } as never);
                }
              }}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentos anexados ({anexos.length})
              </Label>
            </div>

            {canManage && (
              <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px]">Título</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Contrato Coordenador" className="h-8" />
                  </div>
                  <div>
                    <Label className="text-[11px]">Tipo</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPOS_DOC.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[11px]">Observação (opcional)</Label>
                  <Input value={obs} onChange={(e) => setObs(e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-[11px]">Arquivo</Label>
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="h-9" />
                </div>
                <Button
                  size="sm"
                  className="w-full gap-1"
                  disabled={!file || !titulo || upload.isPending}
                  onClick={async () => {
                    if (!file || !titulo) return;
                    await upload.mutateAsync({
                      tarefa_id: tarefa.id,
                      campanha_id: tarefa.campanha_id,
                      titulo,
                      descricao: obs || undefined,
                      tipo_documento: tipo,
                      file,
                    });
                    setFile(null); setTitulo(""); setObs(""); setTipo("outros");
                  }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {upload.isPending ? "Enviando..." : "Enviar anexo"}
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Os anexos também aparecem no módulo Documentos da campanha.
                </p>
              </div>
            )}

            {anexos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum documento anexado.</p>
            ) : (
              <div className="space-y-1.5">
                {anexos.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent/40">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.titulo}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {a.arquivo_nome} · {a.tipo_documento} · {new Date(a.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDownload(a)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {canManage && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => { if (confirm(`Remover "${a.titulo}"?`)) remove.mutate(a); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
