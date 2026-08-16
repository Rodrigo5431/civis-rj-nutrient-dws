import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";

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

export function ContractAuditor() {
  const [idObra, setIdObra] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditUploadResponse | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idObra || !file) {
      setError("Informe o ID da obra e selecione um PDF.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("id_obra", idObra);
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
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

  return (
    <Card className="border-white/10 bg-white/[0.03] p-6 text-slate-100">
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-cyan-300">
        Auditoria de Contratos (Nutrient DWS)
      </h2>

      <form onSubmit={handleUpload} className="flex flex-col gap-4 mb-8 max-w-xl">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-300">ID da Obra</span>
          <input
            type="text"
            value={idObra}
            onChange={(e) => setIdObra(e.target.value)}
            className="rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Ex: OBR-2024-001"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-300">Arquivo PDF (Edital/Contrato)</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 file:mr-4 file:rounded file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-cyan-500/20"
          />
        </label>

        <button
          type="submit"
          disabled={isUploading}
          className="mt-2 w-max rounded-md bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-cyan-500 disabled:opacity-50 transition-colors"
        >
          {isUploading ? "Enviando..." : "Enviar para Extração de Dados"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {audit && (
        <div className="rounded-lg border border-white/10 bg-slate-900/30 p-5">
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <p><strong className="text-cyan-300">Status:</strong> {audit.status}</p>
            <p><strong className="text-cyan-300">DWS ID:</strong> {audit.dwsDocumentId}</p>
          </div>

          {/* DWS Viewer Mock */}
          <div className="mb-5 flex h-[400px] items-center justify-center rounded-md border-2 border-dashed border-white/20 bg-slate-950">
            <div className="text-center text-slate-400">
              <p className="mb-2 font-medium text-slate-300">DWS Viewer (Componente Simulado)</p>
              <p className="text-xs break-all px-4">{audit.dwsViewerUrl}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isApproved}
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isApproved ? "✓ Contrato Validado e Assinado" : "Aprovar Dados e Assinar"}
          </button>
        </div>
      )}
    </Card>
  );
}