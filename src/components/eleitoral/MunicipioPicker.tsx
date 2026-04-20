import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTSEMunicipioResumo } from "@/hooks/useEleitoralTSE";

export function MunicipioPicker({
  uf, ano, value, onChange,
}: {
  uf: string; ano: number;
  value: { cod: string; nome: string } | null;
  onChange: (v: { cod: string; nome: string } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: municipios = [] } = useTSEMunicipioResumo(uf, ano);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="h-9 w-64 justify-between font-normal">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{value?.nome ?? "Todos os municípios"}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Buscar município..." />
          <CommandList>
            <CommandEmpty>Nenhum município.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => { onChange(null); setOpen(false); }}
                className="text-xs"
              >
                <Check className={cn("mr-2 h-3.5 w-3.5", !value ? "opacity-100" : "opacity-0")} />
                Todos os municípios
              </CommandItem>
              {municipios.map((m: any) => (
                <CommandItem
                  key={m.cod_municipio_tse}
                  value={m.municipio ?? m.cod_municipio_tse}
                  onSelect={() => { onChange({ cod: m.cod_municipio_tse, nome: m.municipio }); setOpen(false); }}
                  className="text-xs"
                >
                  <Check className={cn("mr-2 h-3.5 w-3.5", value?.cod === m.cod_municipio_tse ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1 truncate">{m.municipio}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{(m.total_eleitores ?? 0).toLocaleString("pt-BR")}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
