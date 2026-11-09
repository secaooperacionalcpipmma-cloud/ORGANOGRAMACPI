import React, { useState, useRef, useEffect } from 'react';
import { 
  GrandCommand, 
  SubordinateUnit, 
  UserRole, 
  TopCommandInfo 
} from '../types/organogram';
import { initialCpeSpecialUnit } from '../data/seedData';
import { matchesCommand, matchesUnit, normalizeCpai, normalizeText } from '../utils/searchUtils';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  ExternalLink,
  Layers,
  LayoutGrid,
  Columns,
  List,
  Maximize2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
  Shield
} from 'lucide-react';

interface OrganogramViewProps {
  topCommand: TopCommandInfo;
  commands: GrandCommand[];
  units: SubordinateUnit[];
  role: UserRole;
  selectedCommandId: string | null;
  onSelectCommand: (id: string | null) => void;
  onSelectUnit: (unit: SubordinateUnit) => void;
  onAddUnit: (commandId?: string) => void;
  onEditUnit: (unit: SubordinateUnit) => void;
  onDeleteUnit: (unit: SubordinateUnit) => void;
  onEditCommand: (cmd: GrandCommand) => void;
  searchTerm: string;
  onClearSearch?: () => void;
}

type ViewMode = 'pdf-exact' | 'mobile-tree' | 'columns' | 'grid' | 'table';

export const OrganogramView: React.FC<OrganogramViewProps> = ({
  topCommand,
  commands,
  units,
  role,
  selectedCommandId,
  onSelectCommand,
  onSelectUnit,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onEditCommand,
  searchTerm,
  onClearSearch
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile-tree' : 'pdf-exact';
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('TODOS');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('TODOS');
  const [collapsedCommands, setCollapsedCommands] = useState<Record<string, boolean>>({});
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport and set appropriate defaults
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
      if (isMobile && viewMode === 'pdf-exact') {
        // Auto scale to fit mobile screen width
        const calculatedScale = Math.max(35, Math.floor((window.innerWidth / 1620) * 100));
        setZoomLevel(calculatedScale);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // Extract all unique cities for filtering
  const allCities = Array.from(new Set(units.map(u => u.municipio))).sort();

  // Smart filtering of commands based on advanced search (matches "CPAI-9", "CPAI9", "CPA/I-9", etc.)
  const matchedCommandIds = new Set<string>();
  if (searchTerm) {
    commands.forEach(cmd => {
      if (matchesCommand(cmd, searchTerm)) {
        matchedCommandIds.add(cmd.id);
      }
    });
  }

  // Filter units using multi-variant normalized search
  const filteredUnits = units.filter(unit => {
    const parentCmd = commands.find(c => c.id === unit.grandCommandId);

    // If search term is present, match either unit or parent command
    if (searchTerm) {
      const matchesThisUnit = matchesUnit(unit, parentCmd, searchTerm);
      const parentMatched = parentCmd ? matchesCommand(parentCmd, searchTerm) : false;
      if (!matchesThisUnit && !parentMatched) {
        return false;
      }
    }

    if (selectedCommandId && unit.grandCommandId !== selectedCommandId) {
      return false;
    }

    if (selectedTypeFilter !== 'TODOS') {
      if (selectedTypeFilter === 'BPM' && !unit.identificacao.includes('BPM')) return false;
      if (selectedTypeFilter === 'CIPM' && !unit.identificacao.includes('CIPM')) return false;
      if (selectedTypeFilter === 'ESPECIAL' && !unit.identificacao.includes('EPMONT') && !unit.identificacao.includes('BMT') && !unit.identificacao.includes('CIMT')) return false;
    }

    if (selectedCityFilter !== 'TODOS' && unit.municipio !== selectedCityFilter) {
      return false;
    }

    return true;
  });

  // Displayed commands
  const displayedCommands = selectedCommandId
    ? commands.filter(c => c.id === selectedCommandId)
    : [...commands]
        .filter(c => {
          if (!searchTerm) return true;
          // If search matches this command directly or any unit belonging to this command
          if (matchesCommand(c, searchTerm)) return true;
          return filteredUnits.some(u => u.grandCommandId === c.id);
        })
        .sort((a, b) => a.ordem - b.ordem);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 180));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 30));
  const handleResetZoom = () => setZoomLevel(100);
  const handleFitScreen = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const fitZoom = Math.min(100, Math.max(30, Math.floor((containerWidth / 1580) * 100)));
      setZoomLevel(fitZoom);
    } else {
      setZoomLevel(80);
    }
  };

  const toggleCommandCollapse = (commandId: string) => {
    setCollapsedCommands(prev => ({
      ...prev,
      [commandId]: !prev[commandId]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Control Bar: Filters, View Modes & Zoom */}
      <div className="bg-white border-b border-slate-300 px-3 md:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-xs print:hidden">
        {/* Left: Filters & Mobile View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile vs Desktop View Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold">
            <button
              onClick={() => {
                setViewMode('mobile-tree');
                setZoomLevel(100);
              }}
              title="Organograma Vertical Conectado (Ideal para celulares e tablets)"
              className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                viewMode === 'mobile-tree' ? 'bg-[#005a2b] text-white shadow-xs font-black' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Vertical</span>
            </button>

            <button
              onClick={() => setViewMode('pdf-exact')}
              title="Organograma Oficial 9 Colunas Idêntico ao PDF"
              className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                viewMode === 'pdf-exact' ? 'bg-[#005a2b] text-white shadow-xs font-black' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>9 Colunas (PDF)</span>
            </button>
          </div>

          {/* Grand Command Filter */}
          <select
            value={selectedCommandId || 'TODOS'}
            onChange={(e) => onSelectCommand(e.target.value === 'TODOS' ? null : e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
          >
            <option value="TODOS">Todos os Grandes Comandos</option>
            {commands.map(cmd => (
              <option key={cmd.id} value={cmd.id}>
                {cmd.sigla} - {cmd.comandante} ({cmd.municipioSede})
              </option>
            ))}
          </select>

          {/* Unit Type Filter */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-semibold">
            {['TODOS', 'BPM', 'ESPECIAL'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedTypeFilter === type
                    ? 'bg-[#005a2b] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {(selectedCommandId || selectedTypeFilter !== 'TODOS' || selectedCityFilter !== 'TODOS') && (
            <button
              onClick={() => {
                onSelectCommand(null);
                setSelectedTypeFilter('TODOS');
                setSelectedCityFilter('TODOS');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline px-1"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Right: Layout Switcher & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Additional layout modes for desktop */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-semibold">
            <button
              onClick={() => setViewMode('columns')}
              title="Visualização em Colunas"
              className={`p-1.5 rounded flex items-center space-x-1 ${
                viewMode === 'columns' ? 'bg-[#005a2b] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Colunas</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              title="Visualização em Grade"
              className={`p-1.5 rounded flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-[#005a2b] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela"
              className={`p-1.5 rounded flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-[#005a2b] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>

          {/* Zoom controls (especially useful in 9 Colunas mode) */}
          <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded px-1.5 py-1">
            <button
              onClick={handleZoomOut}
              title="Reduzir Zoom (-)"
              className="p-1 hover:bg-slate-100 rounded text-slate-700"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-800 w-9 text-center select-none">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Aumentar Zoom (+)"
              className="p-1 hover:bg-slate-100 rounded text-slate-700"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Zoom Padrão (100%)"
              className="p-1 hover:bg-slate-100 rounded text-slate-500"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={handleFitScreen}
              title="Ajustar à Largura da Tela"
              className="p-1 hover:bg-slate-100 rounded text-slate-500"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Admin Add Unit */}
          {role === 'ADMINISTRADOR' && (
            <button
              onClick={() => onAddUnit(selectedCommandId || undefined)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Unidade</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS NOTIFICATION BANNER */}
      {searchTerm && (
        <div className="bg-emerald-50 border-b-2 border-[#005a2b] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#005a2b]" />
            <span>
              Resultado da pesquisa por <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-emerald-300">"{searchTerm}"</strong>:
              {' '}<strong className="text-[#005a2b] font-black">{displayedCommands.length} Grande(s) Comando(s)</strong> e <strong className="text-[#005a2b] font-black">{filteredUnits.length} Unidade(s)</strong> encontradas.
            </span>
          </div>

          <button
            onClick={() => {
              if (onClearSearch) {
                onClearSearch();
              }
            }}
            className="text-slate-600 hover:text-slate-900 text-xs font-bold underline cursor-pointer"
          >
            Ver Todas as Unidades
          </button>
        </div>
      )}

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        id="organogram-canvas-container"
        className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 bg-white transition-all select-none"
      >
        {/* ============================================================== */}
        {/* MODE 1: MOBILE HIERARCHICAL TREE (Vertical Organogram)        */}
        {/* Responsive tree connected with genuine green military lines    */}
        {/* ============================================================== */}
        {viewMode === 'mobile-tree' && (
          <div className="max-w-3xl mx-auto py-2 px-1 sm:px-4 space-y-6">
            {/* Top Command Box (CPI) */}
            <div className="flex flex-col items-center">
              <div className="w-full bg-white border-2 border-black rounded-lg shadow-md overflow-hidden text-center">
                <div className="bg-[#005a2b] text-white py-2 px-3 border-b-2 border-black flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-300" />
                  <h2 className="text-sm sm:text-base font-black tracking-wider uppercase">
                    ORGANOGRAMA CPI 2026
                  </h2>
                </div>
                <div className="p-3 text-xs text-slate-800 space-y-1">
                  <p className="font-extrabold text-[#005a2b] uppercase">{topCommand.subtitulo}</p>
                  <p className="text-[11px] text-slate-600">
                    Comandante Geral: <strong className="text-slate-900">{topCommand.comandanteGeral}</strong>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Comandante CPI: <strong className="text-slate-900">{topCommand.comandanteCPI}</strong> • Tel: <a href={`tel:${topCommand.contato.replace(/\D/g, '')}`} className="font-mono font-bold text-[#005a2b] underline">{topCommand.contato}</a>
                  </p>
                </div>
              </div>

              {/* Central Trunk Connector Line (Green) */}
              <div className="w-1 h-6 bg-[#005a2b]"></div>
              <div className="w-full border-t-2 border-[#005a2b]"></div>
            </div>

            {/* Vertically Connected Grand Commands (CPA I-1 to CPA I-9) */}
            <div className="space-y-6">
              {displayedCommands.map((command) => {
                const cmdUnits = filteredUnits.filter(u => u.grandCommandId === command.id);
                const isCollapsed = collapsedCommands[command.id];

                return (
                  <div key={command.id} className="relative flex flex-col items-center">
                    {/* Vertical connector line from trunk */}
                    <div className="w-1 h-4 bg-[#005a2b] -mt-6"></div>

                    {/* Grand Command Node Card */}
                    <div className="w-full bg-white border-2 border-black rounded-lg shadow-md overflow-hidden transition-all hover:border-[#005a2b]">
                      {/* Emblem Positioned in the Center Above Command Info */}
                      <div className="bg-slate-50 py-2.5 px-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 bg-white border border-slate-300 rounded shadow-xs p-1 flex items-center justify-center flex-shrink-0">
                            {command.emblemaUrl ? (
                              <img 
                                src={command.emblemaUrl} 
                                alt={command.sigla} 
                                className="max-w-full max-h-full object-contain" 
                              />
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400">Sem Emblema</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                                {command.sigla}
                              </h3>
                              <span className="text-[10px] font-bold bg-[#005a2b] text-white px-2 py-0.5 rounded">
                                {cmdUnits.length} Unidades
                              </span>
                            </div>
                            <p className="font-extrabold text-xs text-[#005a2b] uppercase">
                              {command.comandante}
                            </p>
                            <p className="text-[11px] text-slate-600 flex items-center space-x-2 mt-0.5">
                              <span>Sede: <strong>{command.municipioSede}</strong></span>
                              <span>•</span>
                              <a href={`tel:${command.telefone.replace(/\D/g, '')}`} className="font-mono text-[#005a2b] font-bold hover:underline">
                                {command.telefone}
                              </a>
                            </p>
                          </div>
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          onClick={() => toggleCommandCollapse(command.id)}
                          className="p-2 hover:bg-slate-200 rounded-full text-slate-600"
                          title={isCollapsed ? 'Expandir Unidades' : 'Recolher Unidades'}
                        >
                          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Subordinate Units Connected Vertically */}
                      {!isCollapsed && (
                        <div className="p-3 bg-slate-50/70 border-t border-slate-200">
                          {/* Branch Connector Line */}
                          <div className="flex items-center justify-center mb-2">
                            <span className="text-[10px] font-black uppercase text-[#005a2b] bg-white px-2 py-0.5 rounded border border-[#005a2b]">
                              Unidades Subordinadas
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {cmdUnits.map((unit) => (
                              <div
                                key={unit.id}
                                onClick={() => onSelectUnit(unit)}
                                className={`bg-white border-2 rounded p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group ${
                                  unit.emRegulamentacao ? 'border-dashed border-slate-400 bg-slate-100/70' : 'border-black hover:border-[#005a2b]'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                  <h4 className="font-black text-xs text-slate-900 uppercase">
                                    {unit.identificacao}
                                  </h4>
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {unit.municipio}
                                  </span>
                                </div>

                                {!unit.emRegulamentacao ? (
                                  <div className="mt-1.5 space-y-0.5">
                                    <p className="font-extrabold text-[11px] text-[#005a2b] uppercase leading-tight">
                                      {unit.comandante}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
                                      <a
                                        href={`tel:${unit.telefone.replace(/\D/g, '')}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="font-mono font-bold text-slate-800 hover:text-[#005a2b]"
                                      >
                                        {unit.telefone}
                                      </a>
                                      <span className="text-[#005a2b] font-bold text-[10px]">Toque p/ ver</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                                    Em Regulamentação
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* CPE for CPA I-1 */}
                          {command.sigla === 'CPA I-1' && (
                            <div className="mt-3 pt-2 border-t-2 border-[#005a2b]">
                              <div className="bg-white border-2 border-black rounded p-2 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-black text-[#005a2b]">CPE - {initialCpeSpecialUnit.unidade}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-[9px] font-bold text-slate-700">
                                  {initialCpeSpecialUnit.municipios.map((m, i) => (
                                    <div key={i}>{m}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Summary Table Button / Bottom Section */}
            <div className="border-2 border-black bg-white rounded-lg p-3 text-center shadow-xs">
              <h4 className="font-black text-xs text-[#005a2b] uppercase mb-1">
                CMT's DE ÁREA DO INTERIOR
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                Todos os 9 Comandantes de Área atualizados
              </p>
              <div className="divide-y divide-slate-100 text-left text-xs">
                {commands.map(c => (
                  <div key={c.id} className="py-1 flex items-center justify-between text-[11px]">
                    <span className="font-black text-slate-900 w-16">{c.sigla}</span>
                    <span className="font-bold text-[#005a2b] flex-1">{c.comandante}</span>
                    <a href={`tel:${c.telefone.replace(/\D/g, '')}`} className="font-mono text-slate-700 font-semibold">{c.telefone}</a>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-bold text-slate-500">
                ÚLTIMA MODIFICAÇÃO: {topCommand.dataAtualizacao || '05/11/2026'}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: EXACT PDF 9-COLUMNS REPLICA                            */}
        {/* Pan & Zoom enabled for both mobile and desktop screens          */}
        {/* ============================================================== */}
        {viewMode === 'pdf-exact' && (
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150 inline-block min-w-full"
          >
            <div className="w-[1580px] mx-auto bg-white p-6 rounded-md select-none">
              {/* PDF Header with official title (Sem emblemas na lateral, conforme Print 03) */}
              <div className="text-center border-b-2 border-[#005a2b] pb-4 mb-4">
                <h1 className="text-3xl font-black text-[#005a2b] tracking-wider uppercase font-sans">
                  ORGANOGRAMA CPI 2026
                </h1>
                <p className="text-xs font-bold text-slate-700 tracking-wide mt-0.5">
                  POLÍCIA MILITAR DO MARANHÃO • COMANDO DO POLICIAMENTO DO INTERIOR
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Comandante Geral: <strong className="text-slate-800">{topCommand.comandanteGeral}</strong> • Comandante CPI: <strong className="text-slate-800">{topCommand.comandanteCPI}</strong> • Tel CPI: <strong className="text-slate-800">{topCommand.contato}</strong>
                </p>
              </div>

              {/* Green Horizontal Connection Bar */}
              <div className="relative mb-3">
                <div className="h-1.5 bg-[#005a2b] rounded-full w-full"></div>
              </div>

              {/* 9 COLUMNS HORIZONTAL MATRIX (CPA I-1 TO CPA I-9) */}
              <div className={`gap-3 items-start ${
                displayedCommands.length === 9 
                  ? 'grid grid-cols-9' 
                  : displayedCommands.length === 1 
                    ? 'flex justify-center max-w-sm mx-auto' 
                    : 'flex flex-wrap justify-center gap-6 max-w-5xl mx-auto'
              }`}>
                {displayedCommands.map((command) => {
                  const cmdUnits = filteredUnits.filter(u => u.grandCommandId === command.id);
                  const isHighlighted = matchedCommandIds.has(command.id);

                  return (
                    <div 
                      key={command.id} 
                      className={`flex flex-col items-center space-y-2 p-1 rounded transition-all ${
                        displayedCommands.length === 9 ? 'w-full' : 'w-56'
                      } ${
                        isHighlighted ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Vertical line from green bar to emblem */}
                      <div className="w-0.5 h-3 bg-[#005a2b]"></div>

                      {/* Official Emblem Box */}
                      <div className="w-16 h-16 bg-white border border-slate-300 rounded shadow-xs p-1 flex items-center justify-center hover:shadow-md transition-shadow">
                        {command.emblemaUrl ? (
                          <img 
                            src={command.emblemaUrl} 
                            alt={`Emblema ${command.sigla}`} 
                            className="max-w-full max-h-full object-contain" 
                          />
                        ) : (
                          <div className="text-[9px] font-bold text-slate-400 uppercase text-center">
                            Sem Emblema
                          </div>
                        )}
                      </div>

                      {/* Vertical connector line */}
                      <div className="w-0.5 h-2.5 bg-[#005a2b]"></div>

                      {/* Grand Command Card (Nível 1) */}
                      <div className="w-full bg-white border-2 border-black rounded p-2 text-center shadow-xs hover:border-[#005a2b] transition-colors relative group">
                        <h3 className="font-black text-xs text-slate-900 uppercase">
                          {command.sigla}
                        </h3>
                        <p className="font-extrabold text-[11px] text-slate-900 uppercase mt-0.5 leading-tight">
                          {command.comandante}
                        </p>
                        <p className="font-mono text-[10px] text-slate-700 mt-0.5 font-bold">
                          {command.telefone}
                        </p>

                        {role === 'ADMINISTRADOR' && (
                          <button
                            onClick={() => onEditCommand(command)}
                            className="absolute -top-1.5 -right-1.5 bg-white border border-slate-300 p-0.5 rounded-full shadow-xs text-slate-600 hover:text-[#005a2b] opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Editar Grande Comando"
                          >
                            <Edit className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {/* Vertical line leading to subordinate units */}
                      <div className="w-0.5 h-3 bg-[#005a2b]"></div>

                      {/* Subordinate Units Stack in Exact Vertical Sequence */}
                      <div className="w-full flex flex-col space-y-2">
                        {cmdUnits.map((unit) => (
                          <div
                            key={unit.id}
                            onClick={() => onSelectUnit(unit)}
                            className={`w-full bg-white border-2 rounded p-2 text-center shadow-2xs hover:shadow-md transition-all cursor-pointer relative group ${
                              unit.emRegulamentacao ? 'border-dashed border-slate-400 bg-slate-50' : 'border-black hover:border-[#005a2b]'
                            }`}
                          >
                            <h4 className="font-black text-[11px] text-slate-950 uppercase leading-snug">
                              {unit.identificacao}
                            </h4>
                            <p className="font-extrabold text-[10px] text-slate-800 uppercase leading-tight mt-0.5">
                              {unit.municipio}
                            </p>
                            
                            {!unit.emRegulamentacao && (
                              <>
                                <p className="font-extrabold text-[10px] text-[#005a2b] uppercase leading-tight mt-0.5">
                                  {unit.comandante}
                                </p>
                                <p className="font-mono text-[10px] text-slate-700 font-semibold mt-0.5">
                                  {unit.telefone}
                                </p>
                              </>
                            )}

                            {/* Admin Quick Actions */}
                            {role === 'ADMINISTRADOR' && (
                              <div 
                                className="absolute top-1 right-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => onEditUnit(unit)}
                                  className="p-0.5 hover:text-[#005a2b] text-slate-600"
                                  title="Editar"
                                >
                                  <Edit className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteUnit(unit)}
                                  className="p-0.5 hover:text-rose-600 text-slate-600"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Column 1 Special Box: CPE & 2º BPTUR Barreirinhas */}
                      {command.sigla === 'CPA I-1' && (
                        <div className="w-full flex flex-col items-center mt-3 pt-2 border-t-2 border-[#005a2b] space-y-2">
                          <div className="w-full bg-slate-100 border-2 border-black rounded p-1.5 text-center shadow-xs">
                            <span className="font-black text-xs text-slate-900 tracking-wider">CPE</span>
                          </div>

                          <div className="w-full bg-white border-2 border-black rounded p-1 text-center shadow-xs">
                            <span className="font-extrabold text-[10px] text-slate-900">
                              {initialCpeSpecialUnit.unidade}
                            </span>
                          </div>

                          <div className="w-full bg-white border-2 border-black rounded p-2 text-left shadow-xs">
                            <div className="text-[9px] font-bold text-slate-800 space-y-0.5 leading-tight">
                              {initialCpeSpecialUnit.municipios.map((m, idx) => (
                                <div key={idx}>{m}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM SECTION: CMT'S DE ÁREA TABLE + LAST UPDATE (As in PDF) */}
              <div className="mt-8 pt-4 border-t-2 border-[#005a2b] flex items-end justify-between gap-6">
                <div className="text-[11px] text-slate-500 font-medium">
                  Polícia Militar do Maranhão • Comando do Policiamento do Interior (CPI) • Organograma Oficial 2026
                </div>

                {/* CMT's DE ÁREA DO INTERIOR TABLE */}
                <div className="flex flex-col items-end space-y-3">
                  <div className="border-2 border-black rounded overflow-hidden shadow-xs bg-white">
                    <div className="bg-[#005a2b] text-white text-center font-black text-xs py-1 px-3 uppercase tracking-wide border-b border-black">
                      CMT's DE ÁREA DO INTERIOR
                    </div>
                    <table className="text-[10px] text-left">
                      <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <tr>
                          <th className="py-1 px-3 border-r border-slate-200">CPAI</th>
                          <th className="py-1 px-3 border-r border-slate-200">POSTO/NOME</th>
                          <th className="py-1 px-3 border-r border-slate-200">CONTATO</th>
                          <th className="py-1 px-3">E-MAIL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {commands.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-0.5 px-3 font-bold border-r border-slate-200 text-slate-900">{c.sigla}</td>
                            <td className="py-0.5 px-3 font-bold border-r border-slate-200 text-slate-900">{c.comandante}</td>
                            <td className="py-0.5 px-3 font-mono border-r border-slate-200 text-slate-800">{c.telefone}</td>
                            <td className="py-0.5 px-3 text-slate-600 font-mono text-[9px]">{c.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ÚLTIMA MODIFICAÇÃO (Dado automático) */}
                  <div className="border-2 border-black bg-white rounded p-1.5 text-center shadow-xs min-w-[200px]">
                    <p className="text-[9px] font-bold uppercase text-slate-600">
                      ÚLTIMA MODIFICAÇÃO (Dado automático)
                    </p>
                    <p className="text-xs font-black text-slate-900 font-mono">
                      {topCommand.dataAtualizacao || '05/11/2026'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: RESPONSIVE COLUMNS VIEW                                */}
        {/* ============================================================== */}
        {viewMode === 'columns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCommands.map((command) => {
              const cmdUnits = filteredUnits.filter(u => u.grandCommandId === command.id);
              return (
                <div key={command.id} className="bg-white border-2 border-black rounded shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-[#005a2b] text-white p-3 border-b-2 border-black flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {command.emblemaUrl && (
                        <img src={command.emblemaUrl} alt="" className="w-10 h-10 object-contain bg-white rounded p-0.5" />
                      )}
                      <div>
                        <h4 className="font-black text-sm uppercase">{command.sigla} - {command.nome}</h4>
                        <p className="text-xs text-emerald-200">{command.municipioSede} • Cmdte: {command.comandante}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-white text-[#005a2b] px-2 py-0.5 rounded">
                      {cmdUnits.length}
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-slate-100 flex-1 space-y-2">
                    {cmdUnits.map(unit => (
                      <div 
                        key={unit.id}
                        onClick={() => onSelectUnit(unit)}
                        className="pt-2 cursor-pointer hover:bg-emerald-50 p-2 rounded transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-[#005a2b]">{unit.identificacao}</span>
                          <span className="text-xs font-medium text-slate-600">{unit.municipio}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{unit.comandante}</p>
                        <p className="text-xs text-slate-500 font-mono">{unit.telefone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 4: GRID VIEW                                              */}
        {/* ============================================================== */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUnits.map((unit) => {
              const parentCmd = commands.find(c => c.id === unit.grandCommandId);
              return (
                <div 
                  key={unit.id}
                  onClick={() => onSelectUnit(unit)}
                  className="bg-white border-2 border-black rounded shadow-xs hover:shadow-md transition-all p-3 cursor-pointer relative"
                >
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
                    <span className="text-xs font-black bg-[#005a2b] text-white px-2 py-0.5 rounded uppercase">
                      {unit.identificacao}
                    </span>
                    <span className="text-xs font-bold text-[#005a2b]">
                      {parentCmd?.sigla}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 mb-1">{unit.nome}</p>
                  <p className="text-xs text-slate-600 flex items-center space-x-1 mb-1">
                    <MapPin className="w-3 h-3 text-[#005a2b]" />
                    <span>{unit.municipio}</span>
                  </p>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-xs my-2">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Comandante</p>
                    <p className="font-black text-slate-900 text-xs">{unit.comandante}</p>
                  </div>
                  <p className="text-xs font-mono text-slate-600 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-[#005a2b]" />
                    <span>{unit.telefone}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 5: TABLE VIEW                                             */}
        {/* ============================================================== */}
        {viewMode === 'table' && (
          <div className="bg-white border-2 border-black rounded shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#005a2b] text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Unidade</th>
                  <th className="py-2.5 px-3">Grande Comando</th>
                  <th className="py-2.5 px-3">Município</th>
                  <th className="py-2.5 px-3">Comandante</th>
                  <th className="py-2.5 px-3">Telefone</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUnits.map((unit) => {
                  const parentCmd = commands.find(c => c.id === unit.grandCommandId);
                  return (
                    <tr 
                      key={unit.id}
                      onClick={() => onSelectUnit(unit)}
                      className="hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-extrabold text-[#005a2b]">{unit.identificacao}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{parentCmd?.sigla}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{unit.municipio}</td>
                      <td className="py-2 px-3 font-black text-slate-900">{unit.comandante}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{unit.telefone}</td>
                      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectUnit(unit)}
                          className="text-[#005a2b] hover:underline font-bold mr-2"
                        >
                          Ver
                        </button>
                        {role === 'ADMINISTRADOR' && (
                          <button
                            onClick={() => onEditUnit(unit)}
                            className="text-slate-600 hover:text-slate-900 font-bold"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
