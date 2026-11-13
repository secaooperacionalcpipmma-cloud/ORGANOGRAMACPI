import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  OrganogramDatabase,
  SubordinateUnit
} from '../types/organogram';
import {
  COMPANHIAS_POR_CPAI,
  COMPANHIAS_PDF_URL,
  BatalhaoCompanhias
} from '../data/companhiasData';
import {
  normalizeText,
  normalizeCpai,
  normalizeUnitId
} from '../utils/searchUtils';
import { getCurrentDateBR } from '../utils/dateUtils';
import {
  GitBranch,
  Search,
  MapPin,
  Shield,
  FileDown,
  ExternalLink,
  Building2,
  Layers,
  Filter,
  Phone,
  Eye
} from 'lucide-react';

interface CompanhiasViewProps {
  database: OrganogramDatabase;
  globalSearchTerm?: string;
  onSelectUnit?: (unit: SubordinateUnit) => void;
}

type SubunitFilterType = 'TODOS' | 'CIA' | 'PEL' | 'DPM' | 'SEDE';

export const CompanhiasView: React.FC<CompanhiasViewProps> = ({
  database,
  globalSearchTerm = '',
  onSelectUnit
}) => {
  const [selectedCpai, setSelectedCpai] = useState<string>('TODOS');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [subunitTypeFilter, setSubunitTypeFilter] = useState<SubunitFilterType>('TODOS');

  const effectiveQuery = (localSearch || globalSearchTerm).trim();

  // Helper to match a UPM string (e.g. "15º BPM" or "1ª CIMT - TIMON") with live unit data in database.units
  const findLiveUnit = (upm: string): SubordinateUnit | undefined => {
    const baseUpm = upm.split(/\s*-\s*/)[0];
    const targetNorm = normalizeUnitId(baseUpm);
    const fullNorm = normalizeUnitId(upm);
    return database.units.find((u) => {
      const uNorm = normalizeUnitId(u.identificacao);
      return uNorm === targetNorm || uNorm === fullNorm;
    });
  };

  // Totals across full dataset
  const stats = useMemo(() => {
    let totalBatalhoes = 0;
    let totalSubunidades = 0;
    const uniqueCidades = new Set<string>();

    COMPANHIAS_POR_CPAI.forEach((group) => {
      totalBatalhoes += group.batalhoes.length;
      group.batalhoes.forEach((b) => {
        totalSubunidades += b.companhias.length;
        b.companhias.forEach((c) => {
          uniqueCidades.add(normalizeText(c.cidade));
        });
      });
    });

    return {
      totalCpais: COMPANHIAS_POR_CPAI.length,
      totalBatalhoes,
      totalSubunidades,
      totalCidades: uniqueCidades.size
    };
  }, []);

  const matchesSubunitType = (companhia: string, filter: SubunitFilterType): boolean => {
    if (filter === 'TODOS') return true;
    const norm = normalizeText(companhia);
    if (filter === 'CIA') return norm.includes('cia');
    if (filter === 'PEL') return norm.includes('pel');
    if (filter === 'DPM') return norm.includes('dpm');
    if (filter === 'SEDE') {
      return norm.includes('sede') || norm.includes('cpe') || norm.includes('cprp') || norm.includes('epmont') || norm.includes('bmt');
    }
    return true;
  };

  // Filtered groups & batalhoes
  const filteredGroups = useMemo(() => {
    const qNorm = normalizeText(effectiveQuery);
    const qCpai = normalizeCpai(effectiveQuery);
    const qUnit = normalizeUnitId(effectiveQuery);

    return COMPANHIAS_POR_CPAI.map((group) => {
      // Pill CPAI filter
      if (selectedCpai !== 'TODOS' && group.cpai !== selectedCpai) {
        return null;
      }

      const groupCpaiNorm = normalizeCpai(group.cpai);
      const queryMatchesGroupCpai = Boolean(qCpai && groupCpaiNorm === qCpai);

      const filteredBatalhoes: BatalhaoCompanhias[] = group.batalhoes
        .map((b) => {
          const liveUnit = findLiveUnit(b.upm);
          const unitNorm = normalizeUnitId(b.upm.split(/\s*-\s*/)[0]);
          const queryMatchesUnit =
            queryMatchesGroupCpai ||
            (Boolean(qUnit) && unitNorm === qUnit) ||
            normalizeText(b.upm).includes(qNorm) ||
            normalizeText(b.sede).includes(qNorm) ||
            (liveUnit ? normalizeText(liveUnit.comandante).includes(qNorm) : false);

          const filteredRows = b.companhias.filter((row) => {
            if (!matchesSubunitType(row.companhia, subunitTypeFilter)) {
              return false;
            }
            if (!qNorm) return true;
            if (queryMatchesUnit) return true;
            return (
              normalizeText(row.cidade).includes(qNorm) ||
              normalizeText(row.companhia).includes(qNorm)
            );
          });

          // If unit is under regulation (0 rows) and matches search/filter
          if (b.companhias.length === 0 && subunitTypeFilter === 'TODOS') {
            if (!qNorm || queryMatchesUnit) {
              return b;
            }
            return null;
          }

          if (filteredRows.length === 0) return null;
          return {
            ...b,
            companhias: filteredRows
          };
        })
        .filter((b): b is BatalhaoCompanhias => b !== null);

      if (filteredBatalhoes.length === 0) return null;

      return {
        ...group,
        batalhoes: filteredBatalhoes
      };
    }).filter((g): g is NonNullable<typeof g> => g !== null);
  }, [selectedCpai, effectiveQuery, subunitTypeFilter, database.units]);

  // Helper badge color for Companhia / Pelotão / DPM
  const getCompanhiaBadgeStyle = (comp: string): string => {
    const n = normalizeText(comp);
    if (n.includes('sede') || n.includes('epmont') || n.includes('bmt')) {
      return 'bg-[#005a2b] text-white border-[#004722]';
    }
    if (n.includes('dpm')) {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    if (n.includes('cia')) {
      return 'bg-emerald-50 text-[#005a2b] border-emerald-300';
    }
    if (n.includes('pel')) {
      return 'bg-sky-50 text-sky-900 border-sky-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  // Export filtered or complete Batalhões & Companhias report to PDF
  const handleExportCompanhiasPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentDate = getCurrentDateBR();

    // Header
    doc.setFillColor(0, 90, 43);
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('POLÍCIA MILITAR DO MARANHÃO - COMANDO DO POLICIAMENTO DO INTERIOR', pageWidth / 2, 9, {
      align: 'center'
    });
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('RELAÇÃO OFICIAL DE BATALHÕES (UPM), CIDADES E COMPANHIAS / DPMs', pageWidth / 2, 15, {
      align: 'center'
    });
    doc.setFontSize(8);
    doc.text(`Gerado em: ${currentDate} • Filtro: ${selectedCpai}`, pageWidth / 2, 20.5, {
      align: 'center'
    });

    let y = 30;

    filteredGroups.forEach((group) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 15;
      }

      // CPAI banner
      doc.setFillColor(30, 41, 59);
      doc.rect(10, y, pageWidth - 20, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`${group.cpai} (${group.batalhoes.length} UPMs)`, 14, y + 4.8);
      y += 9;

      group.batalhoes.forEach((b) => {
        if (y > pageHeight - 22) {
          doc.addPage();
          y = 15;
        }

        // UPM header
        doc.setFillColor(0, 90, 43);
        doc.rect(10, y, pageWidth - 20, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${b.upm} - ${b.sede}`, 13, y + 4.2);
        doc.setFont('helvetica', 'normal');
        doc.text(`${b.companhias.length} registros`, pageWidth - 13, y + 4.2, { align: 'right' });
        y += 6.5;

        // Columns header
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(10, y, pageWidth - 20, 5, 'FD');
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('UPM', 13, y + 3.5);
        doc.text('CIDADE / LOCALIDADE', 48, y + 3.5);
        doc.text('COMPANHIA / PELOTÃO / DPM', 132, y + 3.5);
        y += 5.2;

        if (b.companhias.length === 0) {
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'italic');
          doc.text(b.observacao || 'Sem companhias cadastradas.', 13, y + 3.5);
          y += 6;
        } else {
          b.companhias.forEach((row, rIdx) => {
            if (y > pageHeight - 14) {
              doc.addPage();
              y = 15;
            }
            if (rIdx % 2 === 1) {
              doc.setFillColor(248, 250, 252);
              doc.rect(10, y - 0.5, pageWidth - 20, 5, 'F');
            }
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.text(b.upm, 13, y + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(row.cidade, 48, y + 3);
            doc.setFont('helvetica', 'bold');
            doc.text(row.companhia || '-', 132, y + 3);
            y += 5;
          });
        }

        y += 3;
      });
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(
        `PMMA • CPI • Batalhões e Companhias • Gerado em ${currentDate} • Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    doc.save(`BATALHOES_E_COMPANHIAS_CPI_PMMA_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 w-full space-y-5">
      {/* Header & Summary Card */}
      <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300 flex-shrink-0">
              <GitBranch className="w-6 h-6 text-[#005a2b]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
                  BATALHÕES E COMPANHIAS SUBORDINADAS (CIA / PEL / DPM)
                </h2>
                <span className="text-[10px] font-black bg-[#005a2b] text-white px-2 py-0.5 rounded uppercase">
                  CPAI-1 ao CPAI-9
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Relação completa das UPMs (Batalhões e Unidades) com as respectivas Companhias, Pelotões e DPMs distribuídos por cidade.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCompanhiasPdf}
              className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>

            <a
              href={COMPANHIAS_PDF_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Abrir Planilha PDF Original</span>
            </a>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase text-[#005a2b]">Grandes Comandos</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalCpais}</p>
            <p className="text-[11px] text-slate-600">CPAI-1 a CPAI-9</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Batalhões / UPMs</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalBatalhoes}</p>
            <p className="text-[11px] text-slate-600">Unidades mapeadas</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Companhias / Pelotões / DPM</p>
            <p className="text-xl sm:text-2xl font-black text-[#005a2b] mt-0.5">{stats.totalSubunidades}</p>
            <p className="text-[11px] text-slate-600">Subunidades listadas</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Cidades / Pontos</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalCidades}</p>
            <p className="text-[11px] text-slate-600">Municípios e núcleos</p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col md:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar por Batalhão (ex: 15 BPM), Cidade (ex: Bacabal), Companhia (ex: 2ª CIA) ou DPM..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005a2b] font-medium text-slate-900"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-800"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Subunit Type Pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md border border-slate-300 text-xs font-bold overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500 mx-1.5 flex-shrink-0" />
              {(
                [
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'CIA', label: 'Companhias (CIA)' },
                  { id: 'PEL', label: 'Pelotões' },
                  { id: 'DPM', label: 'DPM' },
                  { id: 'SEDE', label: 'Sedes / Outros' }
                ] as { id: SubunitFilterType; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSubunitTypeFilter(t.id)}
                  className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                    subunitTypeFilter === t.id
                      ? 'bg-[#005a2b] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* CPAI Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCpai('TODOS')}
              className={`px-3 py-1.5 rounded-md text-xs font-black whitespace-nowrap border transition-colors ${
                selectedCpai === 'TODOS'
                  ? 'bg-[#005a2b] text-white border-[#005a2b] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Todos os CPAIs
            </button>
            {COMPANHIAS_POR_CPAI.map((g) => (
              <button
                key={g.cpai}
                onClick={() => setSelectedCpai(g.cpai)}
                className={`px-3 py-1.5 rounded-md text-xs font-black whitespace-nowrap border transition-colors ${
                  selectedCpai === g.cpai
                    ? 'bg-[#005a2b] text-white border-[#005a2b] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {g.cpai}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results List */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-lg p-8 text-center space-y-2">
          <p className="text-sm font-black text-slate-800 uppercase">
            Nenhum batalhão ou companhia encontrado para o filtro aplicado
          </p>
          <p className="text-xs text-slate-500">
            Tente limpar a pesquisa ou selecionar &quot;Todos os CPAIs&quot;.
          </p>
          <button
            onClick={() => {
              setSelectedCpai('TODOS');
              setLocalSearch('');
              setSubunitTypeFilter('TODOS');
            }}
            className="mt-2 px-4 py-1.5 bg-[#005a2b] text-white text-xs font-bold rounded"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const cmdInfo = database.commands.find(
              (c) => normalizeCpai(c.sigla) === normalizeCpai(group.cpai)
            );
            const totalSubunitsInGroup = group.batalhoes.reduce(
              (acc, b) => acc + b.companhias.length,
              0
            );

            return (
              <section key={group.cpai} className="space-y-3">
                {/* CPAI Section Header */}
                <div className="bg-slate-900 text-white px-4 py-3 rounded-lg border-2 border-black flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center space-x-3">
                    {cmdInfo?.emblemaUrl ? (
                      <img
                        src={cmdInfo.emblemaUrl}
                        alt={group.cpai}
                        className="w-10 h-10 object-contain bg-white rounded p-0.5"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#005a2b] rounded flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wide">
                        {group.cpai} {cmdInfo ? `• Sede: ${cmdInfo.municipioSede}` : ''}
                      </h3>
                      {cmdInfo && (
                        <p className="text-[11px] text-emerald-300 font-semibold">
                          Comandante: {cmdInfo.comandante} • {cmdInfo.telefone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] font-black">
                    <span className="bg-[#005a2b] text-white px-2.5 py-1 rounded border border-emerald-400">
                      {group.batalhoes.length} Batalhões/UPMs
                    </span>
                    <span className="bg-white text-slate-900 px-2.5 py-1 rounded">
                      {totalSubunitsInGroup} Subunidades
                    </span>
                  </div>
                </div>

                {/* Battalions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.batalhoes.map((batalhao) => {
                    const liveUnit = findLiveUnit(batalhao.upm);

                    return (
                      <div
                        key={`${group.cpai}-${batalhao.upm}`}
                        className="bg-white border-2 border-black rounded-lg shadow-xs overflow-hidden flex flex-col"
                      >
                        {/* Battalion Header Bar */}
                        <div className="bg-[#005a2b] text-white px-4 py-2.5 border-b-2 border-black flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                              <h4 className="font-black text-sm uppercase truncate">
                                {batalhao.upm} — {batalhao.sede}
                              </h4>
                            </div>
                            {liveUnit && !liveUnit.emRegulamentacao && (
                              <p className="text-[11px] text-emerald-100 font-medium mt-0.5 truncate">
                                Cmdte: <strong className="text-white">{liveUnit.comandante}</strong>
                                {liveUnit.telefone ? ` • ${liveUnit.telefone}` : ''}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <span className="text-[11px] font-black bg-white text-[#005a2b] px-2 py-0.5 rounded whitespace-nowrap">
                              {batalhao.companhias.length} {batalhao.companhias.length === 1 ? 'Cia/Local' : 'Cias/Locais'}
                            </span>
                            {liveUnit && onSelectUnit && (
                              <button
                                onClick={() => onSelectUnit(liveUnit)}
                                title="Ver detalhes completos da UPM"
                                className="p-1 bg-[#004722] hover:bg-emerald-900 text-amber-300 rounded border border-emerald-400/50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Table / Rows of Cities & Companies */}
                        {batalhao.companhias.length === 0 ? (
                          <div className="p-4 text-center text-xs font-semibold text-slate-500 bg-slate-50 flex-1 flex items-center justify-center">
                            {batalhao.observacao || 'Unidade sem companhias detalhadas na planilha.'}
                          </div>
                        ) : (
                          <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                                <tr>
                                  <th className="py-2 px-3 w-[52%]">Cidade / Localidade</th>
                                  <th className="py-2 px-3 w-[48%]">Companhia do BPM</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {batalhao.companhias.map((item, idx) => (
                                  <tr
                                    key={`${batalhao.upm}-${item.cidade}-${item.companhia}-${idx}`}
                                    className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                                  >
                                    <td className="py-2 px-3 font-bold text-slate-900">
                                      <div className="flex items-center space-x-1.5">
                                        <MapPin className="w-3 h-3 text-[#005a2b] flex-shrink-0" />
                                        <span>{item.cidade}</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold border ${getCompanhiaBadgeStyle(
                                          item.companhia
                                        )}`}
                                      >
                                        {item.companhia || '-'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Card Footer with quick phone if available */}
                        {liveUnit?.telefone && (
                          <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="flex items-center space-x-1 font-mono font-semibold">
                              <Phone className="w-3 h-3 text-[#005a2b]" />
                              <span>{liveUnit.telefone}</span>
                            </span>
                            {onSelectUnit && (
                              <button
                                onClick={() => onSelectUnit(liveUnit)}
                                className="font-bold text-[#005a2b] hover:underline flex items-center space-x-1"
                              >
                                <Layers className="w-3 h-3" />
                                <span>Detalhes do Batalhão</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
