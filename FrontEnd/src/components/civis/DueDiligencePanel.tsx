import { useState } from 'react';
import { Search, AlertTriangle, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface NewsResult {
  position: number;
  title: string;
  link: string;
  source: string | { name: string };
  date: string;
  snippet?: string;
}

export function DueDiligencePanel() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const runDiligence = async () => {
    if (!companyName.trim()) return;
    
    setLoading(true);
    setError('');
    setHasSearched(false);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/audits';
      const response = await fetch(`${baseUrl}/diligence?companyName=${encodeURIComponent(companyName)}`);
      
      if (!response.ok) {
        throw new Error('Falha ao comunicar com o servidor');
      }

      const data = await response.json();
      
      if (data.news_results) {
        setNews(data.news_results);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível realizar a varredura no momento. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <Card className="border-white/10 bg-white/[0.03] p-8 text-slate-100 w-full max-w-5xl mx-auto min-h-[600px]">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Search className="text-blue-400 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-widest text-blue-300">
            Diligência Investigativa em Tempo Real
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Powered by SerpApi | Varredura de riscos, atrasos e investigações associadas à empreiteira.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Ex: Construtora Odebrecht..."
          className="flex-1 rounded-md border border-white/10 bg-slate-900/80 px-5 py-4 text-base text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runDiligence()}
        />
        <button
          onClick={runDiligence}
          disabled={loading || !companyName.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 px-8 rounded-md shadow-lg transition-colors flex items-center gap-2 text-base"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Executar Varredura'}
        </button>
      </div>

      {error && (
        <div className="p-5 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {hasSearched && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {news.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-emerald-900/10 border border-emerald-800/30 rounded-xl text-emerald-400">
              <ShieldCheck className="w-16 h-16 mb-4 text-emerald-500" />
              <h3 className="text-xl font-bold text-emerald-400">Nenhum risco iminente detectado</h3>
              <p className="text-base text-emerald-500/80 text-center mt-2 max-w-lg">
                A varredura em tempo real não encontrou notícias recentes sobre fraudes, atrasos ou investigações do TCU para esta empreiteira.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-amber-900/20 border border-amber-800/50 rounded-lg text-amber-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <span className="text-base font-medium">Atenção: Foram encontrados {news.length} registros públicos que exigem revisão antes da aprovação do contrato.</span>
              </div>

              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {news.map((item, index) => (
                  <div key={index} className="p-5 bg-slate-900/60 border border-white/5 rounded-xl hover:bg-slate-800/80 transition-colors shadow-sm">
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-semibold leading-relaxed mb-3 text-base">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                          <span className="bg-slate-950 px-3 py-1.5 rounded-md border border-white/5 text-blue-300">
                            {typeof item.source === 'string' ? item.source : item.source?.name || 'Fonte Desconhecida'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-3 bg-slate-950 rounded-lg border border-white/5 transition-colors group flex-shrink-0"
                        title="Ler notícia original"
                      >
                        <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}