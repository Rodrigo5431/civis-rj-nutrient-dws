import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  isRiscoAlto,
  RECHARTS_TOOLTIP_STYLE,
  type Obra,
} from "@/lib/civis";

export function RankingChart({
  obras,
  bairroFiltrado,
}: {
  obras: Obra[];
  bairroFiltrado: string | null;
}) {
  const isEmpreiteiraView = !!bairroFiltrado;

  const data = useMemo(() => {
    const key = isEmpreiteiraView ? "empreiteira" : "bairro";
    const counts = new Map<string, number>();
    for (const o of obras) {
      const k = ((o as any)[key] ?? "").toString().trim();
      if (!k) continue;
      if (k === "NÃO ESPECIFICADO (CIDADE)") continue;
      const weight = isRiscoAlto(o) ? 3 : 1;
      counts.set(k, (counts.get(k) ?? 0) + weight);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [obras, isEmpreiteiraView]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
        {isEmpreiteiraView
          ? `Top Empreiteiras — ${bairroFiltrado}`
          : "Ranking Crítico de Bairros"}
      </h3>
      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              width={140}
            />
            <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} cursor={{ fill: "#1e293b55" }} />
            <Bar dataKey="value" fill="#22d3ee" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
