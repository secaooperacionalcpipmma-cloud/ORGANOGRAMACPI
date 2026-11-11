import React, { useState } from 'react';
import { OrganogramDatabase } from '../types/organogram';
import { 
  FileText, 
  FileDown, 
  Image as ImageIcon, 
  Printer, 
  Building, 
  Users, 
  MapPin, 
  Search, 
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { 
  exportVisualOrganogramPdf,
  exportVisualOrganogramPng,
  exportCadastralReportPdf, 
  exportCadastralReportPng, 
  OFFICIAL_ORIGINAL_PDF_URL,
  printOrganogram 
} from '../utils/exportUtils';
import { ExportModal } from './ExportModal';

interface ReportsViewProps {
  database: OrganogramDatabase;
}

type ReportSubTab = 'comandos' | 'comandantes' | 'municipios' | 'auditoria';

export const ReportsView: React.FC<ReportsViewProps> = ({ database }) => {
  const [activeReport, setActiveReport] = useState<ReportSubTab>('comandos');
  const [filterText, setFilterText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  // Group by municipality
  const municipalityMap = new Map<string, string[]>();
  database.units.forEach(u => {
    const list = municipalityMap.get(u.municipio) || [];
    list.push(u.identificacao);
    municipalityMap.set(u.municipio, list);
    
    // Also include jurisdictions
    if (u.municipiosJurisdicao) {
      u.municipiosJurisdicao.forEach(m => {
        if (m !== u.municipio) {
          const mList = municipalityMap.get(m) || [];
          if (!mList.includes(`${u.identificacao} (Jurisdição)`)) {
            mList.push(`${u.identificacao} (Jurisdição)`);
          }
          municipalityMap.set(m, mList);
        }
      });
    }
  });

  const sortedMunicipalities = Array.from(municipalityMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  // Version 1: Visual Model handlers (PDF Anexo)
  const handleVisualPdf = async () => {
    setIsExporting(true);
    try {
      await exportVisualOrganogramPdf('official-pdf-model-sheet');
      showFeedback('PDF do Modelo Gráfico Oficial (Anexo) baixado com sucesso!');
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleVisualPng = async () => {
    setIsExporting(true);
    try {
      await exportVisualOrganogramPng('official-pdf-model-sheet');
      showFeedback('Imagem PNG do Modelo Gráfico Oficial baixada em alta resolução!');
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Version 2: Cadastral Report handlers (Versão Existente)
  const handleCadastralPdf = () => {
    setIsExporting(true);
    try {
      exportCadastralReportPdf(database);
      showFeedback('PDF do Relatório Cadastral Operacional baixado com sucesso!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCadastralPng = async () => {
    setIsExporting(true);
    try {
      await exportCadastralReportPng('report-printable-area');
      showFeedback('Imagem PNG do Relatório Cadastral baixada!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
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
    showFeedback('Download do arquivo PDF original anexo iniciado!');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner with Dual Version Download Cards */}
      <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
              <Download className="w-6 h-6 text-[#005a2b]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                CENTRAL DE DOWNLOADS E EXPORTAÇÃO OFICIAL (2026)
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Baixe o organograma nas 2 versões oficiais disponíveis: o <strong>Modelo Gráfico 9 Colunas (PDF Anexo)</strong> ou o <strong>Relatório Cadastral Tabular (Versão Existente)</strong> em PDF e Imagem PNG.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Abrir Central de Exportação</span>
            </button>

            <button
              onClick={printOrganogram}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {exportFeedback && (
          <div className="mt-3 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-md flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{exportFeedback}</span>
          </div>
        )}

        {/* FORMATO I, FORMATO II & FORMATO III CARDS */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: FORMATO I – Modelo Gráfico Oficial (Print 01) */}
          <div className="bg-emerald-50/60 border-2 border-[#005a2b] rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#005a2b]" />
                  <span className="font-black text-xs text-slate-900 uppercase">
                    FORMATO I – Organograma Gráfico Oficial (PDF)
                  </span>
                </div>
                <span className="bg-[#005a2b] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  Print 01
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Prancha visual panorâmica oficial em 9 colunas com os dados atualizados do sistema (conforme visualizado no computador - Print 01), com todos os Grandes Comandos, unidades subordinadas, comandantes, contatos e emblemas.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-wrap items-center gap-2">
              <button
                onClick={handleVisualPdf}
                disabled={isExporting}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded flex items-center space-x-1 shadow-2xs transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Baixar FORMATO I (PDF)</span>
              </button>

              <button
                onClick={handleVisualPng}
                disabled={isExporting}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded flex items-center space-x-1 shadow-2xs transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>FORMATO I em Imagem (PNG)</span>
              </button>

              <button
                onClick={handleDownloadOriginalPdf}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-[#005a2b] border border-emerald-400 text-[11px] font-bold rounded flex items-center space-x-1 transition-colors"
                title="Download direto do PDF original anexo"
              >
                <ExternalLink className="w-3 h-3" />
                <span>PDF Original Anexo</span>
              </button>
            </div>
          </div>

          {/* Card 2: FORMATO II – Relatório Estatístico e Cadastral (Print 02) */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span className="font-black text-xs text-slate-900 uppercase">
                    FORMATO II – Relatório Estatístico e Cadastral (PDF)
                  </span>
                </div>
                <span className="bg-slate-700 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  Print 02
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Relatório executivo multipágina com diagramação tabular oficial da PMMA (conforme Print 02), catálogo de unidades por Grande Comando, cidades sede, comandantes, telefones e e-mails.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <button
                onClick={handleCadastralPdf}
                disabled={isExporting}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded flex items-center space-x-1 shadow-2xs transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Baixar FORMATO II (PDF)</span>
              </button>

              <button
                onClick={handleCadastralPng}
                disabled={isExporting}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded flex items-center space-x-1 shadow-2xs transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>FORMATO II em Imagem (PNG)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-300 text-xs font-bold space-x-1">
            <button
              onClick={() => setActiveReport('comandos')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeReport === 'comandos' ? 'bg-[#005a2b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unidades por Grande Comando
            </button>
            <button
              onClick={() => setActiveReport('comandantes')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeReport === 'comandantes' ? 'bg-[#005a2b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Relação de Comandantes
            </button>
            <button
              onClick={() => setActiveReport('municipios')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeReport === 'municipios' ? 'bg-[#005a2b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cobertura de Municípios ({sortedMunicipalities.length})
            </button>
            <button
              onClick={() => setActiveReport('auditoria')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeReport === 'auditoria' ? 'bg-[#005a2b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auditoria de Alterações
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filtrar dados do relatório..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Canvas Area */}
      <div id="report-printable-area" className="space-y-6">
        {/* SUBTAB 1: UNIDADES POR GRANDE COMANDO */}
        {activeReport === 'comandos' && (
          <div className="space-y-6">
            {database.commands.map(cmd => {
              const cmdUnits = database.units.filter(u => {
                if (u.grandCommandId !== cmd.id) return false;
                if (!filterText) return true;
                const t = filterText.toLowerCase();
                return u.identificacao.toLowerCase().includes(t) || u.municipio.toLowerCase().includes(t) || u.comandante.toLowerCase().includes(t);
              });

              if (filterText && cmdUnits.length === 0) return null;

              return (
                <div key={cmd.id} className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-[#005a2b] text-white p-3 border-b-2 border-black flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      {cmd.emblemaUrl && (
                        <img src={cmd.emblemaUrl} alt="" className="w-10 h-10 object-contain bg-white rounded p-0.5" />
                      )}
                      <div>
                        <h3 className="font-black text-sm uppercase">{cmd.sigla} - {cmd.nome}</h3>
                        <p className="text-xs text-emerald-200">Sede: {cmd.municipioSede} • Comandante: {cmd.comandante}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-white text-[#005a2b] px-2.5 py-1 rounded">
                      {cmdUnits.length} Unidades
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Unidade</th>
                          <th className="py-2 px-3">Tipo</th>
                          <th className="py-2 px-3">Município Sede</th>
                          <th className="py-2 px-3">Comandante</th>
                          <th className="py-2 px-3">Telefone</th>
                          <th className="py-2 px-3">E-mail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {cmdUnits.map((u, i) => (
                          <tr key={u.id} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="py-2 px-3 font-extrabold text-[#005a2b]">{u.identificacao}</td>
                            <td className="py-2 px-3 font-medium">{u.tipo}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{u.municipio}</td>
                            <td className="py-2 px-3 font-black">{u.comandante}</td>
                            <td className="py-2 px-3 font-mono">{u.telefone}</td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{u.email || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUBTAB 2: RELAÇÃO DE COMANDANTES */}
        {activeReport === 'comandantes' && (
          <div className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#005a2b] text-white p-3 border-b-2 border-black">
              <h3 className="font-black text-sm uppercase">RELAÇÃO GERAL DE OFICIAIS COMANDANTES</h3>
              <p className="text-xs text-emerald-100">Total de comandantes e chefes cadastrados no CPI e unidades subordinadas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Unidade / Função</th>
                    <th className="py-2 px-3">Posto / Graduação</th>
                    <th className="py-2 px-3">Nome do Comandante</th>
                    <th className="py-2 px-3">Município</th>
                    <th className="py-2 px-3">Contato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Top CPI Commander */}
                  <tr className="bg-emerald-50/70 font-bold">
                    <td className="py-2 px-3 text-[#005a2b] font-black">COMANDO GERAL / CPI</td>
                    <td className="py-2 px-3">CEL QOEM</td>
                    <td className="py-2 px-3 font-black text-slate-900">{database.topCommand.comandanteCPI}</td>
                    <td className="py-2 px-3">{database.topCommand.sede}</td>
                    <td className="py-2 px-3 font-mono">{database.topCommand.contato}</td>
                  </tr>

                  {/* Grand Commands */}
                  {database.commands.map(cmd => (
                    <tr key={cmd.id} className="bg-slate-50 font-semibold">
                      <td className="py-2 px-3 font-black text-[#005a2b]">{cmd.sigla}</td>
                      <td className="py-2 px-3">{cmd.posto}</td>
                      <td className="py-2 px-3 font-black text-slate-900">{cmd.comandante}</td>
                      <td className="py-2 px-3">{cmd.municipioSede}</td>
                      <td className="py-2 px-3 font-mono">{cmd.telefone}</td>
                    </tr>
                  ))}

                  {/* Subordinate Units */}
                  {database.units
                    .filter(u => {
                      if (!filterText) return true;
                      const t = filterText.toLowerCase();
                      return u.comandante.toLowerCase().includes(t) || u.identificacao.toLowerCase().includes(t);
                    })
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-extrabold text-slate-900">{u.identificacao}</td>
                        <td className="py-2 px-3 text-slate-600">{u.posto}</td>
                        <td className="py-2 px-3 font-black text-[#005a2b]">{u.comandante}</td>
                        <td className="py-2 px-3 text-slate-800">{u.municipio}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{u.telefone}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: COBERTURA DE MUNICÍPIOS */}
        {activeReport === 'municipios' && (
          <div className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#005a2b] text-white p-3 border-b-2 border-black flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm uppercase">DISTRIBUIÇÃO POR MUNICÍPIO DO MARANHÃO</h3>
                <p className="text-xs text-emerald-100">Cidades com sede de batalhão ou abrangidas pela jurisdição policial militar</p>
              </div>
              <span className="text-xs font-bold bg-white text-[#005a2b] px-2.5 py-1 rounded">
                {sortedMunicipalities.length} Municípios Mapeados
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sortedMunicipalities
                .filter(([mun]) => mun.toLowerCase().includes(filterText.toLowerCase()))
                .map(([mun, unitsList]) => (
                  <div key={mun} className="p-3 border border-slate-200 rounded-md bg-slate-50 hover:bg-white hover:border-[#005a2b] transition-all">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-slate-900 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#005a2b]" />
                      <span>{mun}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {unitsList.map((u, i) => (
                        <span key={i} className="text-[10px] font-bold bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-700">
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SUBTAB 4: AUDITORIA */}
        {activeReport === 'auditoria' && (
          <div className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#005a2b] text-white p-3 border-b-2 border-black">
              <h3 className="font-black text-sm uppercase">RELATÓRIO DE AUDITORIA E ALTERAÇÕES</h3>
              <p className="text-xs text-emerald-100">Registro cronológico de todas as atualizações no organograma</p>
            </div>
            <div className="divide-y divide-slate-200">
              {database.history.map((h) => (
                <div key={h.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {h.tipoAcao}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {new Date(h.timestamp).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-xs text-slate-500">por: <strong>{h.usuario}</strong></span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">{h.descricao}</p>
                  </div>
                  <span className="text-xs font-bold text-[#005a2b] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start md:self-center">
                    {h.totalAlteracoes} registros
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        database={database}
        initialFormat="all"
      />
    </div>
  );
};
