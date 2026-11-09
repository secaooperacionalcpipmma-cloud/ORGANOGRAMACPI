import React from 'react';
import { TopCommandInfo, UserRole } from '../types/organogram';
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
  Phone
} from 'lucide-react';

interface HeaderProps {
  topCommand: TopCommandInfo;
  role: UserRole;
  onToggleRole: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
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
  onExportPdf,
  onExportPng,
  onPrint,
  searchTerm,
  onSearchChange,
  onRefresh,
  isExporting = false
}) => {
  return (
    <header className="bg-white border-b-4 border-[#005a2b] shadow-md sticky top-0 z-30 print:relative print:border-none">
      {/* Top green institutional bar */}
      <div className="bg-[#005a2b] text-white px-4 py-1.5 text-xs font-semibold flex flex-wrap items-center justify-between tracking-wide">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-amber-300" />
          <span>ESTADO DO MARANHÃO • POLÍCIA MILITAR DO MARANHÃO (PMMA)</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-100">{topCommand.sede}</span>
          </span>
          <span className="hidden md:flex items-center space-x-1">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-100">{topCommand.contato}</span>
          </span>
          <span className="flex items-center space-x-1 bg-[#004722] px-2 py-0.5 rounded text-[11px]">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>Última atualização: {topCommand.dataAtualizacao}</span>
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Emblem & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group flex-shrink-0">
            <img
              src="/assets/aistudio/CPI_8bc02a05.jpg"
              alt="Emblema Oficial CPI PMMA"
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md rounded border border-slate-200 bg-white p-1"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#005a2b] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
              2026
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
                {topCommand.titulo}
              </h1>
              <span className="bg-emerald-100 text-[#005a2b] text-xs font-bold px-2 py-0.5 rounded border border-emerald-300 uppercase">
                Oficial
              </span>
            </div>
            <p className="text-xs md:text-sm font-bold text-[#005a2b] uppercase tracking-wide">
              {topCommand.subtitulo}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Comandante Geral: <strong className="text-slate-800">{topCommand.comandanteGeral}</strong> • Comandante CPI: <strong className="text-slate-800">{topCommand.comandanteCPI}</strong>
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2">
          {/* Smart Search Bar & Quick Filters */}
          <div className="flex flex-col gap-1 sm:w-72 md:w-80">
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
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
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

          {/* Export tools */}
          <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
            <button
              onClick={onExportPdf}
              disabled={isExporting}
              title="Exportar Organograma em PDF Oficial"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden lg:inline">PDF</span>
            </button>

            <button
              onClick={onExportPng}
              disabled={isExporting}
              title="Baixar imagem PNG de alta resolução"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">PNG</span>
            </button>

            <button
              onClick={onPrint}
              title="Imprimir Organograma"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Imprimir</span>
            </button>
          </div>

          {/* User Role Switcher */}
          <div className="border-l border-slate-200 pl-2">
            <button
              onClick={onToggleRole}
              title={`Perfil Atual: ${role}. Clique para alterar.`}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded shadow-xs transition-all ${
                role === 'ADMINISTRADOR'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              {role === 'ADMINISTRADOR' ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-700" />
                  <span>ADMINISTRADOR</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>CONSULTA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
