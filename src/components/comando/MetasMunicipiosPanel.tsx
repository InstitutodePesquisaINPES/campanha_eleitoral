import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wand2, Map, AlertTriangle } from "lucide-react";
import { useCoberturaTerritorial, useUpsertMetaMunicipio, useDistribuirMetaProporcional } from "@/hooks/useMetasMunicipios";
import { useCanManage } from "@/hooks/useUserRoles";

export function MetasMunicipiosPanel({ campanhaId, metaGlobal }: { campanhaId: string; metaGlobal: number | null }) {
  const canManage = useCanManage();
  const { data: rows = [], isLoading } = useCoberturaTerritorial(campanhaId);
  const upsert = useUpsertMetaMunicipio();
  const distribuir = useDistribuirMetaProporcional();

  const totais = useMemo(() => {
    const somaMeta = rows.reduce((s, r) => s + (r.meta_votos || 0), 0);
    const somaCad = rows.reduce((s, r) => s + (r.cadastrados || 0), 0);
    const somaEleit = rows.reduce((s, r) => s + (r.eleitorado_tse || 0), 0);
    return { somaMeta, somaCad, somaEleit };
  }, [rows]);

  const metaGlobalNum = metaGlobal ?? 0;
  const gap = metaGlobalNum > 0 ? metaGlobalNum - totais.somaMeta : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              Metas por município de foco
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Edite a meta de votos e cadastros por município. A soma deve fechar com a meta global.
            </p>
          </div>
          {canManage && rows.length > 0 && metaGlobalNum > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={distribuir.isPending}
              onClick={() => distribuir.mutate({ campanha_id: campanhaId, meta_global: metaGlobalNum, municipios: rows })}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" />
              {distribuir.isPending ? "Distribuindo..." : "Sugerir distribuição (proporcional ao eleitorado)"}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <Badge variant="outline">Meta global: <strong className="ml-1">{metaGlobalNum.toLocaleString("pt-BR")}</strong></Badge>
          <Badge variant="outline">Soma metas municipais: <strong className="ml-1">{totais.somaMeta.toLocaleString("pt-BR")}</strong></Badge>
          {metaGlobalNum > 0 && Math.abs(gap) > 0 && (
            <Badge variant="outline" className={gap > 0 ? "text-warning border-warning/40" : "text-info border-info/40"}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {gap > 0 ? `Falta distribuir ${gap.toLocaleString("pt-BR")} votos` : `Excedeu em ${Math.abs(gap).toLocaleString("pt-BR")} votos`}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Defina os <strong>municípios de foco</strong> da campanha em <em>Plano de Campanha → Escopo</em>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Município</TableHead>
                  <TableHead className="text-right">Eleitorado TSE</TableHead>
                  <TableHead className="text-right">Cadastrados</TableHead>
                  <TableHead className="w-32">Meta votos</TableHead>
                  <TableHead className="w-32">Meta cadastros</TableHead>
                  <TableHead className="w-28">Prioridade</TableHead>
                  <TableHead className="w-32">% atingido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const pct = r.meta_votos > 0 ? Math.min(100, Math.round((r.cadastrados / r.meta_votos) * 100)) : 0;
                  return (
                    <RowEditor
                      key={r.municipio_id}
                      row={r}
                      campanhaId={campanhaId}
                      pct={pct}
                      canManage={canManage}
                      onSave={(patch) => upsert.mutate({ campanha_id: campanhaId, municipio_id: r.municipio_id, ...patch })}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RowEditor({ row, pct, canManage, onSave }: {
  row: any;
  campanhaId: string;
  pct: number;
  canManage: boolean;
  onSave: (patch: any) => void;
}) {
  const [meta, setMeta] = useState(row.meta_votos);
  const [metaC, setMetaC] = useState(row.meta_cadastros);
  const [prio, setPrio] = useState(row.prioridade);

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{row.municipio_nome}</div>
        <div className="text-[10px] text-muted-foreground">{row.bairros_count} bairros mapeados</div>
      </TableCell>
      <TableCell className="text-right text-sm">{(row.eleitorado_tse || 0).toLocaleString("pt-BR")}</TableCell>
      <TableCell className="text-right text-sm">{(row.cadastrados || 0).toLocaleString("pt-BR")}</TableCell>
      <TableCell>
        <Input
          type="number" className="h-8 text-xs" disabled={!canManage}
          value={meta}
          onChange={(e) => setMeta(Number(e.target.value))}
          onBlur={() => meta !== row.meta_votos && onSave({ meta_votos: meta })}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number" className="h-8 text-xs" disabled={!canManage}
          value={metaC}
          onChange={(e) => setMetaC(Number(e.target.value))}
          onBlur={() => metaC !== row.meta_cadastros && onSave({ meta_cadastros: metaC })}
        />
      </TableCell>
      <TableCell>
        <Select value={prio} onValueChange={(v) => { setPrio(v); onSave({ prioridade: v }); }} disabled={!canManage}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs font-medium w-8 text-right">{pct}%</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
