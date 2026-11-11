import React, { useState } from 'react';
import { OrganogramDatabase } from '../types/organogram';
import {
  X,
  FileDown,
  Image as ImageIcon,
  CheckCircle2,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  Shield,
  Loader2,
  Eye
} from 'lucide-react';
import {
  exportVisualOrganogramPdf,
  exportVisualOrganogramPng,
  exportCadastralReportPdf,
  exportCadastralReportPng,
  OFFICIAL_ORIGINAL_PDF_URL,
  printOrganogram
} from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: OrganogramDatabase;
  initialFormat?: 'all' | 'pdf' | 'png';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  database,
  initialFormat = 'all'
}) => {
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'png'>(initialFormat);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Action handlers
  const handleDownloadVisualPdf = async () => {
    setLoadingAction('visual-pdf');
    try {
      await exportVisualOrganogramPdf(
        'official-pdf-model-sheet',
        `ORGANOGRAMA_CPI_2026_MODELO_OFICIAL_${Date.now()}.pdf`
      );
      showSuccess('PDF do Modelo Oficial (Prancha 9 Colunas) gerado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao gerar PDF do modelo oficial: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadVisualPng = async () => {
    setLoadingAction('visual-png');
    try {
      await exportVisualOrganogramPng(
        'official-pdf-model-sheet',
        `ORGANOGRAMA_CPI_2026_MODELO_OFICIAL_${Date.now()}.png`
      );
      showSuccess('Imagem PNG do Modelo Oficial exportada em alta resolução!');
    } catch (err: any) {
      alert(`Erro ao gerar imagem PNG do modelo oficial: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadCadastralPdf = () => {
    setLoadingAction('cadastral-pdf');
    try {
      exportCadastralReportPdf(
        database,
        `RELATORIO_CADASTRAL_CPI_PMMA_2026_${Date.now()}.pdf`
      );
      showSuccess('PDF do Relatório Cadastral gerado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao gerar relatório cadastral: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadCadastralPng = async () => {
    setLoadingAction('cadastral-png');
    try {
      await exportCadastralReportPng(
        'report-printable-area',
        `RELATORIO_CADASTRAL_CPI_PMMA_2026_${Date.now()}.png`
      );
      showSuccess('Imagem PNG do Relatório Cadastral exportada!');
    } catch (err: any) {
      alert(`Erro ao gerar imagem do relatório cadastral: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadOriginalPdf = () => {
    const link = document.createElement('a');
    link.href = OFFICIAL_ORIGINAL_PDF_URL;
    link.download = 'NOVO_ORGANOGRAMA_V1_CPI_2026_ORGANOGRAMA_ATUALIZADO.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Download do arquivo PDF original anexo iniciado!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border-2 border-black rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#005a2b] text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#004722] rounded-lg border border-emerald-400">
              <Download className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-wide uppercase">
                EXPORTAR ORGANOGRAMA INSTITUCIONAL 2026
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Escolha a versão desejada: Modelo Gráfico Oficial (PDF Anexo) ou Relatório Cadastral Operacional.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#004722] rounded-md text-emerald-100 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs: FORMATO I, FORMATO II, FORMATO III */}
        <div className="bg-slate-100 px-3 sm:px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-md border border-slate-300 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setFormatFilter('all')}
              title="FORMATO I: Exibir todos os formatos (PDF e Imagem PNG)"
              className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 rounded text-center transition-colors ${
                formatFilter === 'all'
                  ? 'bg-[#005a2b] text-white shadow-xs font-black'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>FORMATO I</span>
            </button>
            <button
              onClick={() => setFormatFilter('pdf')}
              title="FORMATO II: Filtrar opções apenas em PDF"
              className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 rounded flex items-center justify-center space-x-1 transition-colors ${
                formatFilter === 'pdf'
                  ? 'bg-rose-700 text-white shadow-xs font-black'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 flex-shrink-0" />
              <span>FORMATO II</span>
            </button>
            <button
              onClick={() => setFormatFilter('png')}
              title="FORMATO III: Filtrar opções apenas em Imagem PNG"
              className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 rounded flex items-center justify-center space-x-1 transition-colors ${
                formatFilter === 'png'
                  ? 'bg-blue-700 text-white shadow-xs font-black'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>FORMATO III</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              printOrganogram();
            }}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#005a2b] px-3 py-1 bg-white rounded border border-slate-300 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir Direto na Impressora</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2 flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body: Comparison of Both Versions */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ========================================================= */}
            {/* VERSÃO 1: MODELO GRÁFICO OFICIAL (IDÊNTICO AO PDF ANEXO) */}
            {/* ========================================================= */}
            <div className="border-2 border-[#005a2b] bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#005a2b] text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Modelo Anexo (2026)</span>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
                    <Layers className="w-5 h-5 text-[#005a2b]" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                      1. Modelo Gráfico Oficial
                    </h4>
                    <span className="text-[11px] font-bold text-[#005a2b]">
                      Prancha Visual Completa em 9 Colunas
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Visual idêntico ao modelo oficial em PDF: prancha panorâmica com os 9 Grandes Comandos
                  (CPA I-1 ao CPA I-9), todos os emblemas institucionais coloridos, linhas conectoras verdes,
                  bloco CPE de Barreirinhas, quadro resumo dos Comandantes de Área e data automática.
                </p>

                {/* Visual Feature Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4 text-[10px] font-bold">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    9 Colunas Oficiais
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    Emblemas CPAI 1 a 9
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    Quadro CMT's de Área
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    Estrutura CPE
                  </span>
                </div>
              </div>

              {/* Action Buttons for Version 1 */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {(formatFilter === 'all' || formatFilter === 'pdf') && (
                  <button
                    onClick={handleDownloadVisualPdf}
                    disabled={loadingAction !== null}
                    className="w-full py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loadingAction === 'visual-pdf' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando PDF da Prancha Oficial...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Baixar em PDF (Prancha Oficial)</span>
                      </>
                    )}
                  </button>
                )}

                {(formatFilter === 'all' || formatFilter === 'png') && (
                  <button
                    onClick={handleDownloadVisualPng}
                    disabled={loadingAction !== null}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loadingAction === 'visual-png' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando Imagem PNG...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Baixar em Imagem (PNG Alta Resolução)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Direct download of original PDF file */}
                <button
                  onClick={handleDownloadOriginalPdf}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
                  title="Baixar cópia idêntica do arquivo original em PDF enviado"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>Baixar Arquivo PDF Original Anexo (.pdf)</span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* VERSÃO 2: RELATÓRIO CADASTRAL (VERSÃO EXISTENTE NO SISTEMA) */}
            {/* ========================================================= */}
            <div className="border-2 border-black bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Versão Cadastral
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300">
                    <FileText className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                      2. Relatório Operacional
                    </h4>
                    <span className="text-[11px] font-bold text-slate-600">
                      Versão Cadastral Tabular Multipágina
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Relatório administrativo multipágina ideal para despachos, arquivo e controle operacional.
                  Contém relação cadastral detalhada com todas as unidades (BPMs e CIPMs), cidades sede,
                  jurisdições municipais, postos, telefones e e-mails de cada comando.
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4 text-[10px] font-bold">
                  <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                    Listagem Completa
                  </span>
                  <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                    Tabelas por Comando
                  </span>
                  <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                    E-mails e Contatos
                  </span>
                  <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                    Paginação Oficial
                  </span>
                </div>
              </div>

              {/* Action Buttons for Version 2 */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {(formatFilter === 'all' || formatFilter === 'pdf') && (
                  <button
                    onClick={handleDownloadCadastralPdf}
                    disabled={loadingAction !== null}
                    className="w-full py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loadingAction === 'cadastral-pdf' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando Relatório Cadastral...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Baixar em PDF (Relatório Cadastral)</span>
                      </>
                    )}
                  </button>
                )}

                {(formatFilter === 'all' || formatFilter === 'png') && (
                  <button
                    onClick={handleDownloadCadastralPng}
                    disabled={loadingAction !== null}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loadingAction === 'cadastral-png' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando Imagem PNG...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Baixar em Imagem (PNG)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-[#005a2b]" />
            <span>Polícia Militar do Maranhão • Documentos Oficiais CPI 2026</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 rounded shadow-2xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
