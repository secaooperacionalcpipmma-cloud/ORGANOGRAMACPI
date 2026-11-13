import React from 'react';
import { TopCommandInfo, UserRole } from '../types/organogram';
import { getCurrentDateBR } from '../utils/dateUtils';
import { 
  Shield, 
  Printer, 
  FileDown, 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  Clock, 
  Search, 
  RefreshCw,
  Building2,
  Phone,
  ChevronDown,
  Sparkles,
  FileText,
  Layers,
  Download
} from 'lucide-react';

interface HeaderProps {
  topCommand: TopCommandInfo;
  role: UserRole;
  onToggleRole: () => void;
  onExportVisualPdf: () => void;
  onExportCadastralPdf: () => void;
  onExportVisualPng: () => void;
  onExportCadastralPng: () => void;
  onOpenExportModal: (format?: 'all' | 'pdf' | 'png' | 'formato1' | 'formato2' | 'formato3') => void;
  onPrint: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  topCommand,
  role,
  onToggleRole,
  onExportVisualPdf,
  onExportCadastralPdf,
  onExportVisualPng,
  onExportCadastralPng,
  onOpenExportModal,
  onPrint,
  searchTerm,
  onSearchChange,
  onRefresh,
  isExporting = false
}) => {
  const [pdfMenuOpen, setPdfMenuOpen] = React.useState(false);
  const [pngMenuOpen, setPngMenuOpen] = React.useState(false);

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.export-menu-container')) {
        setPdfMenuOpen(false);
        setPngMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);
  return (
    <header className="bg-white border-b-4 border-[#005a2b] shadow-md sticky top-0 z-30 print:relative print:border-none">
      {/* Top green institutional bar */}
      <div className="bg-[#005a2b] text-white px-3 sm:px-4 py-1.5 text-xs font-semibold flex items-center justify-between tracking-wide gap-2 w-full max-w-full overflow-hidden">
        <div className="flex items-center space-x-1.5 min-w-0 truncate">
          <Shield className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span className="truncate text-[10px] sm:text-xs">ESTADO DO MARANHÃO • POLÍCIA MILITAR DO MARANHÃO (PMMA)</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] sm:text-xs flex-shrink-0">
          <span className="hidden md:flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-100">{topCommand.sede}</span>
          </span>
          <span className="flex items-center space-x-1 bg-[#004722] px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{getCurrentDateBR()}</span>
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Emblem & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative group flex-shrink-0">
            <img
              src="/assets/aistudio/CPI_8bc02a05.jpg"
              alt="Emblema Oficial CPI PMMA"
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-md rounded border border-slate-200 bg-white p-1"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#005a2b] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
              2026
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">
                {topCommand.titulo}
              </h1>
              <span className="bg-emerald-100 text-[#005a2b] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border border-emerald-300 uppercase">
                Oficial
              </span>
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[#005a2b] uppercase tracking-wide truncate">
              {topCommand.subtitulo}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium truncate">
              Cmdte Geral: <strong className="text-slate-800">{topCommand.comandanteGeral}</strong> • CPI: <strong className="text-slate-800">{topCommand.comandanteCPI}</strong>
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          {/* Smart Search Bar & Quick Filters */}
          <div className="flex flex-col gap-1 w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar CPAI-9, BPM, Comandante, Cidade..."
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005a2b] focus:border-[#005a2b] transition-all font-medium text-slate-900 shadow-2xs"
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-800"
                  title="Limpar pesquisa"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick CPAI Pills (Instant 1-tap navigation) */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar w-full">
              <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Comandos:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const targetSigla = `CPAI-${num}`;
                const isSelected = searchTerm.toUpperCase().replace(/[\s\-_/]/g, '').includes(`CPAI${num}`) ||
                                   searchTerm.toUpperCase().replace(/[\s\-_/]/g, '').includes(`CPA${num}`);
                return (
                  <button
                    key={num}
                    onClick={() => onSearchChange(isSelected ? '' : targetSigla)}
                    title={`Filtrar CPAI-${num}`}
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#005a2b] text-white shadow-xs scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    CPAI-{num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Tools & Role Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full export-menu-container">
            {/* PDF Button: Opens modal directly on mobile for zero clipping; dropdown on desktop */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => {
                  if (window.innerWidth < 640) {
                    onOpenExportModal('pdf');
                  } else {
                    setPdfMenuOpen(!pdfMenuOpen);
                    setPngMenuOpen(false);
                  }
                }}
                disabled={isExporting}
                title="Opções de Download em PDF (2 Versões)"
                className="w-full sm:w-auto flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded shadow-xs transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
                <ChevronDown className="w-3 h-3 text-rose-600 hidden sm:inline" />
              </button>

              {pdfMenuOpen && (
                <div className="hidden sm:block absolute right-0 top-full mt-1 w-64 bg-white border-2 border-black rounded-lg shadow-xl z-50 p-1.5 animate-in fade-in text-left">
                  <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-500 border-b border-slate-100">
                    Selecione o Formato em PDF:
                  </div>

                  <button
                    onClick={() => {
                      setPdfMenuOpen(false);
                      onExportVisualPdf();
                    }}
                    className="w-full p-2 text-left hover:bg-emerald-50 rounded flex items-start space-x-2 transition-colors group"
                  >
                    <Layers className="w-4 h-4 text-[#005a2b] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black text-slate-900 group-hover:text-[#005a2b] flex items-center space-x-1">
                        <span>FORMATO I (PDF)</span>
                        <span className="text-[9px] bg-emerald-100 text-[#005a2b] px-1 py-0.2 rounded font-bold">Print 01</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Organograma Gráfico Oficial 2026 em 9 colunas
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPdfMenuOpen(false);
                      onExportCadastralPdf();
                    }}
                    className="w-full p-2 text-left hover:bg-slate-100 rounded flex items-start space-x-2 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black text-slate-900 group-hover:text-slate-950 flex items-center space-x-1">
                        <span>FORMATO II (PDF)</span>
                        <span className="text-[9px] bg-slate-200 text-slate-800 px-1 py-0.2 rounded font-bold">Print 02</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Relatório Estatístico e Cadastral tabular
                      </p>
                    </div>
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setPdfMenuOpen(false);
                        onOpenExportModal('formato1');
                      }}
                      className="w-full py-1 px-2 text-center text-[10px] font-bold text-[#005a2b] hover:underline"
                    >
                      Abrir Central de Exportação...
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PNG Button: Opens modal directly on mobile for zero clipping; dropdown on desktop */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => {
                  if (window.innerWidth < 640) {
                    onOpenExportModal('formato3');
                  } else {
                    setPngMenuOpen(!pngMenuOpen);
                    setPdfMenuOpen(false);
                  }
                }}
                disabled={isExporting}
                title="FORMATO III: Opções de Download em Imagem PNG"
                className="w-full sm:w-auto flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded shadow-xs transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>FORMATO III (PNG)</span>
                <ChevronDown className="w-3 h-3 text-blue-600 hidden sm:inline" />
              </button>

              {pngMenuOpen && (
                <div className="hidden sm:block absolute right-0 top-full mt-1 w-64 bg-white border-2 border-black rounded-lg shadow-xl z-50 p-1.5 animate-in fade-in text-left">
                  <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-500 border-b border-slate-100">
                    FORMATO III – Download em Imagem:
                  </div>

                  <button
                    onClick={() => {
                      setPngMenuOpen(false);
                      onExportVisualPng();
                    }}
                    className="w-full p-2 text-left hover:bg-emerald-50 rounded flex items-start space-x-2 transition-colors group"
                  >
                    <Layers className="w-4 h-4 text-[#005a2b] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black text-slate-900 group-hover:text-[#005a2b] flex items-center space-x-1">
                        <span>FORMATO I em Imagem</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold">Print 01</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Imagem da prancha visual do organograma
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPngMenuOpen(false);
                      onExportCadastralPng();
                    }}
                    className="w-full p-2 text-left hover:bg-slate-100 rounded flex items-start space-x-2 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-black text-slate-900 group-hover:text-slate-950 flex items-center space-x-1">
                        <span>FORMATO II em Imagem</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold">Print 02</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Imagem do relatório cadastral tabular
                      </p>
                    </div>
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setPngMenuOpen(false);
                        onOpenExportModal('formato3');
                      }}
                      className="w-full py-1 px-2 text-center text-[10px] font-bold text-[#005a2b] hover:underline"
                    >
                      Ver detalhes e resoluções...
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Export Modal Opener */}
            <button
              onClick={() => onOpenExportModal('all')}
              disabled={isExporting}
              title="Central de Exportação (Comparar as duas versões)"
              className="flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#005a2b] hover:bg-[#004722] rounded shadow-xs transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onPrint}
              title="Imprimir Organograma"
              className="hidden sm:flex items-center px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {/* User Role Switcher */}
            <div className="flex-shrink-0">
              <button
                onClick={onToggleRole}
                title={`Perfil Atual: ${role}. Clique para alterar.`}
                className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-bold rounded shadow-xs transition-all whitespace-nowrap ${
                  role === 'ADMINISTRADOR'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                }`}
              >
                {role === 'ADMINISTRADOR' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span>ADMIN</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span>CONSULTA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
