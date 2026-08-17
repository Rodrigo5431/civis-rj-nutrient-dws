import { lazy, Suspense, useMemo, useState } from "react";
import { ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useObras } from "@/hooks/useObras";
import { AcessibilidadeHub } from "./AcessibilidadeHub";
import { AuditoriaTable } from "./AuditoriaTable";
import { CopilotoCivis } from "./CopilotoCivis";
import { FiltrosBar, type Filtros } from "./Filtros";
import { KpiCards } from "./KpiCards";
import { LabIA } from "./LabIA";
import { RankingChart } from "./RankingChart";
import { ContractAuditor } from "./ContractAuditor";
import { DueDiligencePanel } from "./DueDiligencePanel";

const MapaCivis = lazy(() =>
  import("./MapaCivis").then((m) => ({ default: m.MapaCivis })),
);

const norm = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function Dashboard() {
  const { obras, loading, error, lastUpdate } = useObras();
  const [filtros, setFiltros] = useState<Filtros>({
    zona: null,
    bairro: null,
    risco: null,
  });

  const obrasFiltradas = useMemo(() => {
    return obras.filter((o) => {
      if (filtros.zona && norm(o.zona_atuacao) !== filtros.zona) return false;
      if (filtros.bairro && norm(o.bairro) !== filtros.bairro) return false;
      if (filtros.risco && norm(o.risco_preditivo) !== filtros.risco) return false;
      return true;
    });
  }, [obras, filtros]);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at 10% -10%, rgba(34,211,238,0.10), transparent 60%),radial-gradient(800px 500px at 90% 0%, rgba(99,102,241,0.10), transparent 60%)",
        fontSize: "calc(1rem * var(--app-font-scale, 1))",
      }}
    >
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-sky-700/30 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
              <ShieldCheck className="size-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wide sm:text-lg">
                Civis RJ ·{" "}
                <span className="text-cyan-300">Centro de Comando Preditivo</span>
              </h1>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Obras Públicas · Realtime · IA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              {error ? (
                <>
                  <WifiOff className="size-3" /> off
                </>
              ) : (
                <>
                  <Wifi className="size-3" /> live ·{" "}
                  {obras.length.toLocaleString("pt-BR")} obras
                </>
              )}
            </span>
            {lastUpdate && (
              <span className="text-muted-foreground">
                upd {lastUpdate.toLocaleTimeString("pt-BR")}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Erro ao carregar obras: {error}
          </Card>
        )}

        <KpiCards obras={obrasFiltradas} />

        <Tabs defaultValue="op">
          <TabsList className="border border-white/10 bg-white/5">
            <TabsTrigger value="op">Visão Operacional</TabsTrigger>
            <TabsTrigger value="ia">Laboratório de IA</TabsTrigger>
            <TabsTrigger value="dws">Auditoria DWS</TabsTrigger>
            <TabsTrigger value="diligencia">Diligência (SerpApi)</TabsTrigger> 
          </TabsList>

          <TabsContent value="op" className="mt-4 space-y-6">
            <Card className="border-white/10 bg-white/[0.03] p-4">
              <FiltrosBar
                obras={obras}
                filtros={filtros}
                setFiltros={setFiltros}
              />
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <Card className="border-white/10 bg-white/[0.03] p-4 lg:col-span-3">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-300">
                  Mapa de Calor Operacional
                </h2>
                <Suspense
                  fallback={
                    <div className="grid h-[460px] place-items-center text-sm text-muted-foreground">
                      Carregando mapa...
                    </div>
                  }
                >
                  <MapaCivis obras={obrasFiltradas} />
                </Suspense>
              </Card>

              <Card className="border-white/10 bg-white/[0.03] p-4 lg:col-span-2">
                <RankingChart obras={obrasFiltradas} bairroFiltrado={filtros.bairro} />
              </Card>
            </div>

            <Card className="border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-300">
                Auditoria · Drill-down por obra
              </h2>
              <AuditoriaTable obras={obrasFiltradas} />
            </Card>

            {loading && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Conectando ao banco de obras...
              </p>
            )}
          </TabsContent>

          <TabsContent value="ia" className="mt-4">
            <LabIA obras={obrasFiltradas} />
          </TabsContent>

          <TabsContent value="dws" className="mt-4">
            <ContractAuditor />
          </TabsContent>

          <TabsContent value="diligencia" className="mt-4">
            <DueDiligencePanel />
          </TabsContent>

        </Tabs>

        <footer className="pt-6 text-center text-[11px] text-muted-foreground">
          Dados consumidos em tempo real via Supabase Realtime · IA via OpenRouter
        </footer>
      </main>

      <CopilotoCivis obras={obrasFiltradas} />
      <AcessibilidadeHub />
    </div>
  );
}