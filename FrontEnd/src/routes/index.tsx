import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/civis/Dashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Civis RJ · Centro de Comando Preditivo" },
      {
        name: "description",
        content:
          "Painel operacional preditivo de obras públicas do Rio de Janeiro: Realtime, IA e auditoria.",
      },
      { name: "theme-color", content: "#0b1220" },
    ],
  }),
});

function Index() {
  // Leaflet + Supabase Realtime são client-only. Evita SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-300">
        Inicializando Centro de Comando...
      </div>
    );
  }

  return <Dashboard />;
}
