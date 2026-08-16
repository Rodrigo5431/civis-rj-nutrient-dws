import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Brain, Layers, Sigma } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { isRiscoAlto, isRiscoBaixo, isRiscoMedio, RECHARTS_TOOLTIP_STYLE, type Obra } from "@/lib/civis";

const PESOS_MODELO = [
  { fator: "Atraso histórico", peso: 92 },
  { fator: "Área da obra", peso: 78 },
  { fator: "Empreiteira", peso: 71 },
  { fator: "Zona de atuação", peso: 64 },
  { fator: "Densidade urbana", peso: 58 },
  { fator: "Tipo de obra", peso: 49 },
];

export function LabIA({ obras }: { obras: Obra[] }) {
  const stacked = useMemo(() => {
    const map = new Map<string, { zona: string; Alto: number; Médio: number; Baixo: number }>();
    for (const o of obras) {
      const z = (o.zona_atuacao ?? "n/d").toString().trim() || "n/d";
      if (!map.has(z)) map.set(z, { zona: z, Alto: 0, Médio: 0, Baixo: 0 });
      const row = map.get(z)!;
      if (isRiscoAlto(o)) row.Alto += 1;
      else if (isRiscoMedio(o)) row.Médio += 1;
      else if (isRiscoBaixo(o)) row.Baixo += 1;
    }
    return Array.from(map.values()).sort((a, b) =>
      (b.Alto + b.Médio + b.Baixo) - (a.Alto + a.Médio + a.Baixo),
    );
  }, [obras]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ExplainerCard
          icon={Layers}
          title="K-Means Clustering"
          body="Agrupa obras em clusters por similaridade (área, atraso, zona). Detecta padrões anômalos de empreiteiras que repetem perfis de risco."
        />
        <ExplainerCard
          icon={Brain}
          title="Classificação Preditiva"
          body="Gradient Boosting treinado em obras históricas. Probabilidade de atraso > 30 dias usada como input para o rótulo Alto/Médio/Baixo."
        />
        <ExplainerCard
          icon={Sigma}
          title="Score Composto"
          body="Combinação ponderada dos 6 fatores ao lado. Recalibrado a cada nova obra recebida via Realtime."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-cyan-300">
              Pesos do Modelo Preditivo
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer>
              <RadarChart data={PESOS_MODELO}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="fator" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#334155" />
                <Radar
                  dataKey="peso"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.35}
                />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-cyan-300">
              Distribuição de Risco por Zona de Atuação
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer>
              <BarChart data={stacked} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="zona" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} cursor={{ fill: "#1e293b55" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
                <Bar dataKey="Alto" stackId="r" fill="#ef4444" />
                <Bar dataKey="Médio" stackId="r" fill="#f59e0b" />
                <Bar dataKey="Baixo" stackId="r" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-cyan-300">
            Payload bruto · Auditoria do modelo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {obras.slice(0, 30).map((o, i) => (
            <JsonRow key={(o.id as any) ?? i} obra={o} index={i} />
          ))}
          {obras.length > 30 && (
            <p className="pt-2 text-xs text-muted-foreground">
              Exibindo 30 de {obras.length.toLocaleString("pt-BR")} obras. Use os filtros para refinar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JsonRow({ obra, index }: { obra: Obra; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground hover:bg-muted/60">
        <span className="truncate">
          <span className="mr-2 text-muted-foreground">#{String(index + 1).padStart(3, "0")}</span>
          <span className="font-medium text-foreground">{obra.bairro ?? "—"}</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span>{obra.empreiteira ?? "—"}</span>
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-1 max-h-[260px] overflow-auto rounded-md border border-border bg-background p-3 text-xs text-foreground">
          {JSON.stringify(obra, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ExplainerCard({
  icon: Icon,
  title,
  body,
}: {
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
            <Icon className="size-4 text-cyan-300" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
