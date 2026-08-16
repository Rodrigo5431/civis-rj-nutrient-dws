import { useEffect, useState } from "react";
import { obrasSupabase, type Obra } from "@/lib/civis";

type State = {
  obras: Obra[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
};

// Enriquece a linha crua do banco para alimentar a UI sem quebrar a
// regra de normalização exigida pela spec (situacao -> "Em Andamento" / "Atrasada").
function enrich(o: Obra): Obra {
  const raw = (o.situacao ?? "").toString().trim();
  let situacao = raw;
  if (/^\d+$/.test(raw)) {
    // Códigos CNO da Receita: 1/2 ativos, 3 atrasado, demais encerrados.
    if (raw === "1" || raw === "2") situacao = "Em Andamento";
    else if (raw === "3") situacao = "Atrasada";
    else situacao = "Concluída";
  }
  const empreiteira =
    (o as any).empreiteira ??
    (o as any).nome_responsavel ??
    (o as any).nome_empresarial ??
    null;
  return { ...o, situacao, empreiteira };
}


export function useObras(): State {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const { data, error } = await obrasSupabase.from("obras").select("*");
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setObras(((data as Obra[]) ?? []).map(enrich));
      setLastUpdate(new Date());
      setLoading(false);
    };


    fetchAll();

    const channel = obrasSupabase
      .channel("public:obras")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "obras" },
        () => {
          fetchAll();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      obrasSupabase.removeChannel(channel);
    };
  }, []);

  return { obras, loading, error, lastUpdate };
}
