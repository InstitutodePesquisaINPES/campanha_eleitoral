import { useMemo, useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";

const TARGETS = [
  { key: "nome", label: "Nome *", required: true },
  { key: "documento", label: "CPF/CNPJ" },
  { key: "email", label: "E-mail" },
  { key: "telefone", label: "Telefone" },
  { key: "status", label: "Etapa" },
  { key: "valor_estimado", label: "Valor Estimado" },
  { key: "valor_confirmado", label: "Valor Comprometido" },
  { key: "valor_recebido", label: "Valor Recebido" },
  { key: "data_contato", label: "Data Contato" },
  { key: "data_confirmacao", label: "Data Comprometimento" },
  { key: "data_recebimento", label: "Data Recebimento" },
  { key: "observacoes", label: "Observações" },
] as const;

const STATUS_ENUM = ["prospect", "contatado", "negociando", "confirmado", "recebido", "recusado"] as const;

const SYNONYMS: Record<string, string> = {
  nome: "nome", name: "nome", doador: "nome", donor: "nome",
  documento: "documento", cpf: "documento", cnpj: "documento", doc: "documento",
  email: "email", "e-mail": "email", mail: "email",
  telefone: "telefone", fone: "telefone", celular: "telefone", phone: "telefone", tel: "telefone",
  status: "status", etapa: "status", estagio: "status", stage: "status",
  "valor estimado": "valor_estimado", estimado: "valor_estimado", estimated: "valor_estimado",
  "valor comprometido": "valor_confirmado", comprometido: "valor_confirmado", confirmado: "valor_confirmado", promised: "valor_confirmado",
  "valor recebido": "valor_recebido", recebido: "valor_recebido", received: "valor_recebido", pago: "valor_recebido",
  "data contato": "data_contato", "data_contato": "data_contato",
  "data confirmacao": "data_confirmacao", "data_confirmacao": "data_confirmacao", "data comprometimento": "data_confirmacao",
  "data recebimento": "data_recebimento", "data_recebimento": "data_recebimento", "data pagamento": "data_recebimento",
  observacoes: "observacoes", observacao: "observacoes", obs: "observacoes", notes: "observacoes", nota: "observacoes",
};

function norm(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseNumber(v: any): number | null {
  if (v == null || v === "") return null;
  const s = String(v).replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return isNaN(n) ? null : n;
}

function parseDate(v: any): string | null {
  if (!v) return null;
  const s = String(v).trim();
  // dd/mm/yyyy
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

const rowSchema = z.object({
  nome: z.string().trim().min(1, "nome vazio").max(200),
  documento: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  telefone: z.string().trim().max(30).optional().nullable(),
  status: z.enum(STATUS_ENUM).optional(),
  valor_estimado: z.number().nonnegative().optional().nullable(),
  valor_confirmado: z.number().nonnegative().optional().nullable(),
  valor_recebido: z.number().nonnegative().optional().nullable(),
  data_contato: z.string().nullable().optional(),
  data_confirmacao: z.string().nullable().optional(),
  data_recebimento: z.string().nullable().optional(),
  observacoes: z.string().max(2000).optional().nullable(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CaptacaoImportDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // targetKey -> csvHeader
  const [importing, setImporting] = useState(false);
  const [dedupe, setDedupe] = useState<"none" | "skip" | "update">("skip");

  function reset() {
    setRows([]); setHeaders([]); setMapping({});
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    Papa.parse<any>(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const hs = res.meta.fields ?? [];
        setHeaders(hs);
        setRows(res.data as any[]);
        // auto-map
        const auto: Record<string, string> = {};
        for (const t of TARGETS) {
          const found = hs.find((h) => SYNONYMS[norm(h)] === t.key);
          if (found) auto[t.key] = found;
        }
        setMapping(auto);
      },
      error: (err) => toast.error("Falha ao ler CSV: " + err.message),
    });
  }

  const preview = useMemo(() => {
    return rows.slice(0, 10).map((row, idx) => {
      const mapped: any = {};
      for (const t of TARGETS) {
        const col = mapping[t.key];
        if (!col) continue;
        let v: any = row[col];
        if (["valor_estimado", "valor_confirmado", "valor_recebido"].includes(t.key)) v = parseNumber(v);
        else if (["data_contato", "data_confirmacao", "data_recebimento"].includes(t.key)) v = parseDate(v);
        else if (t.key === "status") {
          const s = norm(String(v ?? "prospect")).replace(/\s+/g, "");
          v = (STATUS_ENUM as readonly string[]).includes(s) ? s : "prospect";
        } else if (v != null) v = String(v).trim();
        mapped[t.key] = v;
      }
      const parsed = rowSchema.safeParse(mapped);
      return { idx: idx + 1, mapped, ok: parsed.success, error: parsed.success ? null : parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") };
    });
  }, [rows, mapping]);

  const validCount = useMemo(() => {
    return rows.reduce((acc, row) => {
      const mapped: any = {};
      for (const t of TARGETS) {
        const col = mapping[t.key];
        if (!col) continue;
        let v: any = row[col];
        if (["valor_estimado", "valor_confirmado", "valor_recebido"].includes(t.key)) v = parseNumber(v);
        else if (["data_contato", "data_confirmacao", "data_recebimento"].includes(t.key)) v = parseDate(v);
        else if (t.key === "status") {
          const s = norm(String(v ?? "prospect")).replace(/\s+/g, "");
          v = (STATUS_ENUM as readonly string[]).includes(s) ? s : "prospect";
        } else if (v != null) v = String(v).trim();
        mapped[t.key] = v;
      }
      return acc + (rowSchema.safeParse(mapped).success ? 1 : 0);
    }, 0);
  }, [rows, mapping]);

  async function importar() {
    if (!mapping.nome) { toast.error("Mapeie ao menos a coluna 'Nome'"); return; }
    setImporting(true);
    try {
      // build all valid payloads
      const payloads: any[] = [];
      const errors: string[] = [];
      rows.forEach((row, idx) => {
        const mapped: any = {};
        for (const t of TARGETS) {
          const col = mapping[t.key];
          if (!col) continue;
          let v: any = row[col];
          if (["valor_estimado", "valor_confirmado", "valor_recebido"].includes(t.key)) v = parseNumber(v);
          else if (["data_contato", "data_confirmacao", "data_recebimento"].includes(t.key)) v = parseDate(v);
          else if (t.key === "status") {
            const s = norm(String(v ?? "prospect")).replace(/\s+/g, "");
            v = (STATUS_ENUM as readonly string[]).includes(s) ? s : "prospect";
          } else if (v != null && v !== "") v = String(v).trim();
          else v = null;
          mapped[t.key] = v;
        }
        const parsed = rowSchema.safeParse(mapped);
        if (parsed.success) {
          const clean: any = { ...parsed.data };
          // remove empty strings/nulls
          Object.keys(clean).forEach(k => { if (clean[k] === "" || clean[k] === undefined) clean[k] = null; });
          if (!clean.status) clean.status = "prospect";
          payloads.push(clean);
        } else {
          errors.push(`Linha ${idx + 2}: ${parsed.error.issues[0].message}`);
        }
      });

      // dedupe check
      let toInsert = payloads;
      let toUpdate: any[] = [];
      if (dedupe !== "none") {
        const docs = payloads.map(p => p.documento).filter(Boolean);
        const mails = payloads.map(p => p.email).filter(Boolean);
        const existing: Record<string, string> = {};
        if (docs.length) {
          const { data } = await supabase.from("captacao_doadores").select("id,documento").in("documento", docs);
          (data || []).forEach((d: any) => { if (d.documento) existing["doc:" + d.documento] = d.id; });
        }
        if (mails.length) {
          const { data } = await supabase.from("captacao_doadores").select("id,email").in("email", mails);
          (data || []).forEach((d: any) => { if (d.email) existing["mail:" + d.email] = d.id; });
        }
        toInsert = [];
        payloads.forEach(p => {
          const hit = (p.documento && existing["doc:" + p.documento]) || (p.email && existing["mail:" + p.email]);
          if (hit) {
            if (dedupe === "update") toUpdate.push({ ...p, id: hit });
          } else toInsert.push(p);
        });
      }

      let inserted = 0, updated = 0;
      for (let i = 0; i < toInsert.length; i += 500) {
        const chunk = toInsert.slice(i, i + 500);
        const { error } = await supabase.from("captacao_doadores").insert(chunk);
        if (error) throw error;
        inserted += chunk.length;
      }
      for (const u of toUpdate) {
        const { id, ...rest } = u;
        const { error } = await supabase.from("captacao_doadores").update(rest).eq("id", id);
        if (!error) updated++;
      }

      toast.success(`Importado: ${inserted} novos${updated ? `, ${updated} atualizados` : ""}${errors.length ? `, ${errors.length} com erro` : ""}`);
      qc.invalidateQueries({ queryKey: ["captacao_doadores"] });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Erro na importação: " + e.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle>Importar doadores via CSV</DialogTitle></DialogHeader>

        {!rows.length ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Envie um CSV com cabeçalho. Aceita separador vírgula ou ponto-e-vírgula.</p>
            <Input type="file" accept=".csv,text/csv" onChange={onFile} />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Colunas reconhecidas automaticamente:</strong></p>
              <p>nome, documento (cpf/cnpj), email, telefone, status/etapa, valor estimado/comprometido/recebido, data de contato/confirmação/recebimento, observações.</p>
              <p>Colunas não reconhecidas podem ser mapeadas manualmente após o upload.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mapping */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Mapeamento de colunas</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TARGETS.map((t) => (
                  <div key={t.key}>
                    <Label className="text-xs">{t.label}</Label>
                    <Select value={mapping[t.key] ?? "__none__"} onValueChange={(v) => setMapping({ ...mapping, [t.key]: v === "__none__" ? "" : v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— não importar —</SelectItem>
                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedupe */}
            <div className="flex items-center gap-3">
              <Label className="text-xs">Duplicados (por documento/email):</Label>
              <Select value={dedupe} onValueChange={(v: any) => setDedupe(v)}>
                <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">Ignorar existentes</SelectItem>
                  <SelectItem value="update">Atualizar existentes</SelectItem>
                  <SelectItem value="none">Inserir mesmo assim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold">Preview (10 primeiras linhas)</h4>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300"><CheckCircle2 className="h-3 w-3 mr-1" />{validCount} válidas</Badge>
                  {rows.length - validCount > 0 && <Badge variant="outline" className="bg-red-500/10 text-red-300"><AlertTriangle className="h-3 w-3 mr-1" />{rows.length - validCount} com erro</Badge>}
                  <Badge variant="outline">{rows.length} total</Badge>
                </div>
              </div>
              <div className="border rounded max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Nome</TableHead>
                      <TableHead className="text-xs">Doc</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Estimado</TableHead>
                      <TableHead className="text-xs">Status linha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((p) => (
                      <TableRow key={p.idx} className={p.ok ? "" : "bg-red-500/5"}>
                        <TableCell className="text-xs">{p.idx}</TableCell>
                        <TableCell className="text-xs">{p.mapped.nome ?? "—"}</TableCell>
                        <TableCell className="text-xs">{p.mapped.documento ?? "—"}</TableCell>
                        <TableCell className="text-xs">{p.mapped.email ?? "—"}</TableCell>
                        <TableCell className="text-xs">{p.mapped.status ?? "—"}</TableCell>
                        <TableCell className="text-xs">{p.mapped.valor_estimado ?? "—"}</TableCell>
                        <TableCell className="text-xs">
                          {p.ok ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300">ok</Badge>
                            : <span className="text-red-300 text-[10px]">{p.error}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {rows.length > 10 && (
              <Alert><AlertDescription className="text-xs">Mostrando 10 de {rows.length}. Todas serão validadas na importação.</AlertDescription></Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {rows.length > 0 && (
            <>
              <Button variant="outline" onClick={reset}>Trocar arquivo</Button>
              <Button onClick={importar} disabled={importing || validCount === 0}>
                <Upload className="h-3 w-3 mr-1" />
                {importing ? "Importando..." : `Importar ${validCount} linha(s)`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
