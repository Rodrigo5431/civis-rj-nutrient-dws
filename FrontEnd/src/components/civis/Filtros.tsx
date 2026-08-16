import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Obra } from "@/lib/civis";

export type Filtros = {
  zona: string | null;
  bairro: string | null;
  risco: string | null;
};

const uniqueSorted = (arr: (string | null | undefined)[]) =>
  Array.from(
    new Set(
      arr
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

function Combobox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label={label}
          className="w-full justify-between border-white/10 bg-white/5 text-left font-normal"
        >
          <span className="truncate">
            <span className="text-muted-foreground">{label}:</span>{" "}
            <span className="text-foreground">{value ?? "Todos"}</span>
          </span>
          <ChevronsUpDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => onChange(null)}>
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === null ? "opacity-100" : "opacity-0",
                  )}
                />
                Todos
              </CommandItem>
              {options.map((opt) => (
                <CommandItem key={opt} value={opt} onSelect={() => onChange(opt)}>
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === opt ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FiltrosBar({
  obras,
  filtros,
  setFiltros,
}: {
  obras: Obra[];
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
}) {
  const zonas = useMemo(() => uniqueSorted(obras.map((o) => o.zona_atuacao)), [obras]);
  const bairros = useMemo(
    () =>
      uniqueSorted(
        obras
          .filter((o) => !filtros.zona || o.zona_atuacao?.trim() === filtros.zona)
          .map((o) => o.bairro),
      ),
    [obras, filtros.zona],
  );
  const riscos = useMemo(() => uniqueSorted(obras.map((o) => o.risco_preditivo)), [obras]);

  const active =
    filtros.zona !== null || filtros.bairro !== null || filtros.risco !== null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:flex-1">
        <Combobox
          label="Zona"
          value={filtros.zona}
          options={zonas}
          onChange={(v) => setFiltros({ ...filtros, zona: v, bairro: null })}
        />
        <Combobox
          label="Bairro"
          value={filtros.bairro}
          options={bairros}
          onChange={(v) => setFiltros({ ...filtros, bairro: v })}
        />
        <Combobox
          label="Risco"
          value={filtros.risco}
          options={riscos}
          onChange={(v) => setFiltros({ ...filtros, risco: v })}
        />
      </div>
      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFiltros({ zona: null, bairro: null, risco: null })}
        >
          <X className="mr-1 size-4" /> Limpar
        </Button>
      )}
    </div>
  );
}
