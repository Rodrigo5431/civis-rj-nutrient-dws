import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Bot, CheckCircle, Loader2, Sparkles, Wand2 } from "lucide-react";

type AuditStatus =
  | "PENDING_EXTRACTION"
  | "PROCESSING"
  | "EXTRACTED"
  | "FAILED"
  | "APPROVED"
  | "REJECTED";

interface AuditUploadResponse {
  id: string;
  idObra: string;
  status: AuditStatus;
  fileName: string;
  dwsDocumentId: string;
  dwsViewerUrl: string;
  uploadedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export function ContractAuditor() {
  const [idObra, setIdObra] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditUploadResponse | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  
  const [parecerIA, setParecerIA] = useState<string | null>(null);
  const [isGeneratingParecer, setIsGeneratingParecer] = useState<boolean>(false);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idObra || !file) {
      setError("Informe o ID da obra e selecione um PDF.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Formato inválido. Por favor, envie apenas arquivos no formato PDF.");
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError("O arquivo é muito grande. O limite máximo é de 10MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setParecerIA(null);

    const formData = new FormData();
    formData.append("id_obra", idObra);
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (errorData && errorData.error) {
          throw new Error(errorData.error);
        }
        
        throw new Error(`Falha no upload (status ${response.status})`);
      }

      const data: AuditUploadResponse = await response.json();
      setAudit(data);
      setIsApproved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido no upload.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleApprove() {
    if (!audit) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${audit.id}/approve`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error(`Falha ao aprovar (status ${response.status})`);
      }
      setIsApproved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao aprovar contrato.");
    }
  }

  async function handleGerarParecerIA() {
    if (!audit) return;
    
    setIsGeneratingParecer(true);
    setError(null);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            {
              role: "system",
              content: "Você é o Copiloto Civis, um auditor sênior de obras públicas. Seja direto, técnico e profissional."
            },
            {
              role: "user",
              content: `Gere um parecer final de auditoria de 1 parágrafo para a obra ${audit.idObra}. 
              Considere os seguintes dados:
              - Extração de Contrato (Nutrient DWS): Validação Concluída sem adulterações.
              - Varredura na Web (SerpApi): Nenhum risco iminente ou fraude detectada.
              Finalize recomendando a liberação do orçamento para início das atividades.`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("Falha ao gerar parecer com a IA.");
      
      const data = await response.json();
      setParecerIA(data.choices[0].message.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar parecer.");
    } finally {
      setIsGeneratingParecer(false);
    }
  }

  return (
    <Card className="border-white/10 bg-white/[0.03] p-8 text-slate-100 w-full min-h-[600px]">
      <div className="mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-widest text-cyan-300">
            Auditoria de Contratos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Powered by Nutrient DWS API
          </p>
        </div>
        {isApproved && (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Contrato Validado
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form onSubmit={handleUpload} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">ID da Obra / Processo Licitatório</span>
              <input
                type="text"
                value={idObra}
                onChange={(e) => setIdObra(e.target.value)}
                className="rounded-md border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                placeholder="Ex: OBR-2024-001"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">Documento (PDF)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="rounded-md border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 file:mr-4 file:rounded file:border-0 file:bg-cyan-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-cyan-500/20 cursor-pointer transition-all"
              />
            </label>

            <button
              type="submit"
              disabled={isUploading}
              className="mt-4 w-full md:w-max rounded-md bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              {isUploading ? "Processando Documento..." : "Enviar para Extração (Nutrient)"}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded text-sm text-red-400">
                {error}
              </div>
            )}
          </form>
        </div>

        <div>
          {audit ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6 h-full flex flex-col shadow-inner">
              <div className="mb-6 flex flex-wrap gap-6 text-sm border-b border-white/5 pb-4">
                <p><strong className="text-cyan-400 uppercase text-xs tracking-wider">Status</strong><br/> <span className="font-medium">{audit.status}</span></p>
                <p><strong className="text-cyan-400 uppercase text-xs tracking-wider">DWS ID</strong><br/> <span className="font-mono text-xs">{audit.dwsDocumentId}</span></p>
              </div>

              <div className="mb-6 flex flex-1 min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-slate-950/80">
                <div className="text-center text-slate-400 p-6">
                  <p className="mb-3 font-semibold text-slate-300 text-lg">DWS Viewer</p>
                  <p className="text-sm mb-4">Simulação do visualizador de documentos Nutrient</p>
                  <p className="text-xs break-all px-4 font-mono text-slate-500">{audit.dwsViewerUrl}</p>
                </div>
              </div>

              {!isApproved ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="w-full rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-all flex justify-center items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprovar Extração de Dados
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  {!parecerIA ? (
                    <button
                      type="button"
                      onClick={handleGerarParecerIA}
                      disabled={isGeneratingParecer}
                      className="w-full rounded-md bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition-all flex justify-center items-center gap-2 border border-indigo-400/30"
                    >
                      {isGeneratingParecer ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-indigo-200" />
                      )}
                      {isGeneratingParecer ? "Analisando Dados..." : "Gerar Parecer Final com IA"}
                    </button>
                  ) : (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3 text-indigo-300">
                        <Bot className="w-5 h-5" />
                        <h3 className="font-semibold text-sm uppercase tracking-wide">Parecer do Copiloto</h3>
                      </div>
                      <p className="text-sm text-indigo-100 leading-relaxed">
                        {parecerIA}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-900/20 p-8 h-full flex flex-col items-center justify-center text-slate-500 border-dashed text-center">
              <Wand2 className="w-12 h-12 mb-4 text-slate-700" />
              <p className="font-medium text-slate-400">Nenhum contrato em análise</p>
              <p className="text-sm mt-2">Faça o upload do documento ao lado para iniciar a extração de dados com a Nutrient DWS.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}