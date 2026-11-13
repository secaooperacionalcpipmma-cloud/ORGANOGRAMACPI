import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import {
  exportVisualOrganogramPdf,
  exportVisualOrganogramPng,
  exportCadastralReportPdf,
  exportCadastralReportPng,
  OFFICIAL_ORIGINAL_PDF_URL,
  printOrganogram
} from '../utils/exportUtils';
import { getCurrentDateBR } from '../utils/dateUtils';

export type ExportFormatTab = 'formato1' | 'formato2' | 'formato3';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: OrganogramDatabase;
  initialFormat?: 'all' | 'pdf' | 'png' | 'formato1' | 'formato2' | 'formato3';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  database,
  initialFormat = 'formato1'
}) => {
  // Resolve initial tab: 'pdf' -> 'formato1', 'png' -> 'formato3', etc.
  const resolveInitialTab = (f: string): ExportFormatTab => {
    if (f === 'formato2') return 'formato2';
    if (f === 'formato3' || f === 'png') return 'formato3';
    return 'formato1';
  };

  const [activeTab, setActiveTab] = useState<ExportFormatTab>(resolveInitialTab(initialFormat));
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(resolveInitialTab(initialFormat));
    }
  }, [isOpen, initialFormat]);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  // =========================================================================
  // ACTION HANDLERS
  // =========================================================================

  // FORMATO I: Organograma Gráfico Oficial 2026 (PDF dinâmico do sistema - Print 01)
  const handleDownloadFormato1Pdf = async () => {
    setLoadingAction('formato1-pdf');
    try {
      await exportVisualOrganogramPdf(
        'official-pdf-model-sheet',
        `ORGANOGRAMA_CPI_2026_FORMATO_I_${Date.now()}.pdf`
      );
      showSuccess('PDF do FORMATO I (Organograma Gráfico Oficial) gerado com sucesso com os dados do sistema!');
    } catch (err: any) {
      alert(`Erro ao gerar PDF do FORMATO I: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // FORMATO I em Imagem (PNG)
  const handleDownloadFormato1Png = async () => {
    setLoadingAction('formato1-png');
    try {
      await exportVisualOrganogramPng(
        'official-pdf-model-sheet',
        `ORGANOGRAMA_CPI_2026_FORMATO_I_${Date.now()}.png`
      );
      showSuccess('Imagem PNG do FORMATO I (Organograma Gráfico) exportada em alta resolução!');
    } catch (err: any) {
      alert(`Erro ao gerar imagem do FORMATO I: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // FORMATO II: Relatório Cadastral e Estatístico (PDF - Print 02)
  const handleDownloadFormato2Pdf = () => {
    setLoadingAction('formato2-pdf');
    try {
      exportCadastralReportPdf(
        database,
        `RELATORIO_CADASTRAL_CPI_PMMA_FORMATO_II_${Date.now()}.pdf`
      );
      showSuccess('PDF do FORMATO II (Relatório Estatístico e Cadastral) gerado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao gerar PDF do FORMATO II: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // FORMATO II em Imagem (PNG)
  const handleDownloadFormato2Png = async () => {
    setLoadingAction('formato2-png');
    try {
      await exportCadastralReportPng(
        'cadastral-report-sheet',
        `RELATORIO_CADASTRAL_CPI_PMMA_FORMATO_II_${Date.now()}.png`
      );
      showSuccess('Imagem PNG do FORMATO II (Relatório Cadastral) exportada com sucesso!');
    } catch (err: any) {
      alert(`Erro ao gerar imagem do FORMATO II: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Download do arquivo PDF original anexo
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
                CENTRAL DE EXPORTAÇÃO OFICIAL – CPI 2026
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Selecione o formato desejado: FORMATO I (Organograma Gráfico), FORMATO II (Relatório Cadastral) ou FORMATO III (Imagens PNG).
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
        <div className="bg-slate-100 px-3 sm:px-4 py-2.5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="grid grid-cols-3 sm:flex sm:items-center space-x-0 sm:space-x-1.5 bg-white p-1 rounded-lg border border-slate-300 text-xs font-black w-full sm:w-auto gap-1 sm:gap-0">
            {/* TAB 1: FORMATO I */}
            <button
              onClick={() => setActiveTab('formato1')}
              title="FORMATO I: Organograma Gráfico Oficial (Print 01)"
              className={`px-3 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'formato1'
                  ? 'bg-[#005a2b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span>FORMATO I</span>
            </button>

            {/* TAB 2: FORMATO II */}
            <button
              onClick={() => setActiveTab('formato2')}
              title="FORMATO II: Relatório Estatístico e Cadastral (Print 02)"
              className={`px-3 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'formato2'
                  ? 'bg-[#005a2b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span>FORMATO II</span>
            </button>

            {/* TAB 3: FORMATO III */}
            <button
              onClick={() => setActiveTab('formato3')}
              title="FORMATO III: Baixar tanto o Formato I quanto o II em formato de Imagem PNG"
              className={`px-3 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'formato3'
                  ? 'bg-[#005a2b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
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
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#005a2b] px-3 py-1.5 bg-white rounded border border-slate-300 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2.5 flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* ================================================================= */}
          {/* ABA 1: FORMATO I - ORGANOGRAMA GRÁFICO OFICIAL (PRINT 01)         */}
          {/* ================================================================= */}
          {activeTab === 'formato1' && (
            <div className="border-2 border-[#005a2b] bg-white rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300 flex-shrink-0">
                    <Layers className="w-6 h-6 text-[#005a2b]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-base sm:text-lg text-slate-900 uppercase">
                        FORMATO I – Organograma Gráfico Oficial 2026 (PDF)
                      </h4>
                      <span className="bg-emerald-100 text-[#005a2b] text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300 uppercase">
                        Print 01
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#005a2b]">
                      Prancha Visual Panorâmica em 9 Colunas Gerada a partir dos Dados do Sistema
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  Atualização: {getCurrentDateBR()}
                </div>
              </div>

              {/* Description & Requirements Box */}
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-lg p-3.5 text-xs text-slate-800 space-y-2">
                <p className="font-medium leading-relaxed">
                  Gera o documento <strong>PDF oficial</strong> idêntico ao modelo visual apresentado no computador (<strong>Print 01</strong>), extraindo e compilando em tempo real todos os dados cadastrados no sistema:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-bold text-[11px]">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#005a2b] flex-shrink-0" />
                    <span>9 Grandes Comandos (CPA I-1 ao CPA I-9)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#005a2b] flex-shrink-0" />
                    <span>Emblemas oficiais coloridos no topo</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#005a2b] flex-shrink-0" />
                    <span>Unidades subordinadas, municípios e comandantes</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#005a2b] flex-shrink-0" />
                    <span>Bloco CPE de Barreirinhas & Quadro CMT's de Área</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownloadFormato1Pdf}
                  disabled={loadingAction !== null}
                  className="w-full sm:flex-1 py-3 px-5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-black text-sm flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {loadingAction === 'formato1-pdf' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando PDF do FORMATO I a partir dos dados do sistema...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Baixar FORMATO I em PDF (Prancha 9 Colunas)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadOriginalPdf}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  title="Baixar arquivo PDF original anexo"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>Baixar Arquivo PDF Original Anexo (.pdf)</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA 2: FORMATO II - RELATÓRIO CADASTRAL E ESTATÍSTICO (PRINT 02)  */}
          {/* ================================================================= */}
          {activeTab === 'formato2' && (
            <div className="border-2 border-black bg-white rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-300 flex-shrink-0">
                    <FileText className="w-6 h-6 text-slate-800" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-base sm:text-lg text-slate-900 uppercase">
                        FORMATO II – Relatório Estatístico e Cadastral Oficial (PDF)
                      </h4>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded border border-slate-300 uppercase">
                        Print 02
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600">
                      Documento Executivo Tabular por Grande Comando (Conforme Print 02)
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {database.units.length} Unidades Cadastradas
                </div>
              </div>

              {/* Description Box */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs text-slate-800 space-y-2">
                <p className="font-medium leading-relaxed">
                  Gera o documento <strong>PDF executivo multipágina</strong> organizado em tabelas detalhadas conforme o modelo apresentado no <strong>Print 02</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-bold text-[11px]">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                    <span>Tabelas individuais por Grande Comando (CPAI-1 a 9)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                    <span>Colunas: Unidade, Tipo, Município Sede, Comandante, Telefone, E-mail</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                    <span>Diagramação executiva oficial da Polícia Militar do Maranhão</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                    <span>Formato A4 Paisagem pronto para impressão e despachos</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleDownloadFormato2Pdf}
                  disabled={loadingAction !== null}
                  className="w-full py-3 px-5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-black text-sm flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {loadingAction === 'formato2-pdf' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando PDF do Relatório Cadastral...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Baixar FORMATO II em PDF (Relatório Cadastral)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA 3: FORMATO III - BAIXAR FORMATO I E II EM IMAGEM (PNG)       */}
          {/* ================================================================= */}
          {activeTab === 'formato3' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                      FORMATO III – Exportação em Formato de Imagem de Alta Resolução (PNG)
                    </h4>
                    <p className="text-xs text-blue-900 font-medium">
                      Baixe tanto o <strong>FORMATO I</strong> quanto o <strong>FORMATO II</strong> em formato de imagem (.png) de alta definição:
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opção A: Formato I em Imagem */}
                <div className="border-2 border-[#005a2b] bg-white rounded-xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-[#005a2b]" />
                        <h5 className="font-black text-xs sm:text-sm text-slate-900 uppercase">
                          FORMATO I em Imagem
                        </h5>
                      </div>
                      <span className="bg-emerald-100 text-[#005a2b] text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        Print 01
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Imagem em altíssima resolução da prancha visual do Organograma Institucional 2026 em 9 colunas completas, com emblemas e conexões.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={handleDownloadFormato1Png}
                      disabled={loadingAction !== null}
                      className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                    >
                      {loadingAction === 'formato1-png' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gerando Imagem do FORMATO I...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Baixar FORMATO I em Imagem (PNG)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Opção B: Formato II em Imagem */}
                <div className="border-2 border-black bg-white rounded-xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-800" />
                        <h5 className="font-black text-xs sm:text-sm text-slate-900 uppercase">
                          FORMATO II em Imagem
                        </h5>
                      </div>
                      <span className="bg-slate-200 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        Print 02
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Imagem do Relatório Cadastral e Estatístico com as tabelas completas de Grandes Comandos, Batalhões, Comandantes e Municípios.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={handleDownloadFormato2Png}
                      disabled={loadingAction !== null}
                      className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                    >
                      {loadingAction === 'formato2-png' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gerando Imagem do FORMATO II...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Baixar FORMATO II em Imagem (PNG)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
