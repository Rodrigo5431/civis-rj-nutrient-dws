import { Card } from "@/components/ui/card";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";
import {
  formatBRL,
  isObraAtiva,
  isRiscoAlto,
  numero,
  type Obra,
} from "@/lib/civis";

export function KpiCards({ obras }: { obras: Obra[] }) {
  const ativas = obras.filter(isObraAtiva).length;

  const riscoFinanceiro = obras
    .filter(isRiscoAlto)
    .reduce((sum, o) => sum + numero(o.area) * 2500, 0);

  // ROI / "verba recuperada" = 8% do risco financeiro evitado pela predição
  const verbaRecuperada = riscoFinanceiro * 0.08;

  const items = [
    {
      label: "Obras Ativas",
      value: ativas.toLocaleString("pt-BR"),
      icon: Activity,
      hint: "em andamento + atrasadas",
      accent: "text-cyan-300",
    },
    {
      label: "Risco Financeiro",
      value: formatBRL(riscoFinanceiro),
      icon: AlertTriangle,
      hint: "área × R$ 2.500 (risco alto)",
      accent: "text-amber-300",
    },
    {
      label: "Verba Recuperada (ROI)",
      value: formatBRL(verbaRecuperada),
      icon: TrendingUp,
      hint: "projeção via modelo preditivo",
      accent: "text-emerald-400 font-bold text-4xl",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card
            key={it.label}
            className="relative overflow-hidden border-white/10 bg-white/5 p-5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(60% 80% at 0% 0%, rgba(56,189,248,0.18), transparent 60%)",
              }}
            />
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {it.label}
                </p>
                <p
                  className={
                    it.label === "Verba Recuperada (ROI)"
                      ? "text-emerald-400 font-bold text-4xl"
                      : `text-3xl font-bold ${it.accent}`
                  }
                >
                  {it.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{it.hint}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                <Icon className="size-5 text-cyan-200" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
