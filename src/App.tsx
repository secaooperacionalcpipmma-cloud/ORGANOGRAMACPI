import React, { useState, useEffect } from 'react';
import { 
  OrganogramDatabase, 
  SubordinateUnit, 
  GrandCommand, 
  UserRole, 
  UnitDiffItem 
} from './types/organogram';
import { initialDatabase } from './data/seedData';
import { Header } from './components/Header';
import { Navbar, NavTab } from './components/Navbar';
import { OrganogramView } from './components/OrganogramView';
import { SmartUpdateSection } from './components/SmartUpdateSection';
import { UnitDetailModal } from './components/UnitDetailModal';
import { UnitEditModal } from './components/UnitEditModal';
import { GrandCommandEditModal } from './components/GrandCommandEditModal';
import { EmblemsManager } from './components/EmblemsManager';
import { ReportsView } from './components/ReportsView';
import { HistoryView } from './components/HistoryView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ExportModal } from './components/ExportModal';
import { OfficialPdfModelSheet } from './components/OfficialPdfModelSheet';
import { 
  exportVisualOrganogramPdf, 
  exportVisualOrganogramPng, 
  exportCadastralReportPdf, 
  exportCadastralReportPng, 
  printOrganogram 
} from './utils/exportUtils';
import { 
  ShieldAlert, 
  Building, 
  MapPin, 
  Users, 
  Plus, 
  RefreshCw, 
  Settings, 
  RotateCcw, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<OrganogramDatabase>(initialDatabase);
  const [activeTab, setActiveTab] = useState<NavTab>('organograma');
  const [role, setRole] = useState<UserRole>('ADMINISTRADOR');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);

  // Modals
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<SubordinateUnit | null>(null);
  const [editingUnit, setEditingUnit] = useState<SubordinateUnit | null>(null);
  const [isUnitEditModalOpen, setIsUnitEditModalOpen] = useState<boolean>(false);
  const [defaultCommandForNewUnit, setDefaultCommandForNewUnit] = useState<string | undefined>(undefined);

  const [editingCommand, setEditingCommand] = useState<GrandCommand | null>(null);
  const [isCommandEditModalOpen, setIsCommandEditModalOpen] = useState<boolean>(false);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportModalFormat, setExportModalFormat] = useState<'all' | 'pdf' | 'png'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Fetch organogram data from server
  const fetchOrganogram = async () => {
    try {
      const res = await fetch('/api/organogram');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDatabase(json.data);
        }
      }
    } catch (e) {
      console.warn('Could not fetch from server API, using local seed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganogram();
  }, []);

  // Save or edit unit
  const handleSaveUnit = async (unitData: SubordinateUnit) => {
    try {
      const res = await fetch('/api/organogram/unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData)
      });
      if (res.ok) {
        await fetchOrganogram();
      } else {
        throw new Error('Falha ao salvar unidade no servidor.');
      }
    } catch (err: any) {
      // Fallback local update
      setDatabase(prev => {
        const units = [...prev.units];
        const idx = units.findIndex(u => u.id === unitData.id);
        if (idx >= 0) units[idx] = unitData;
        else units.push(unitData);
        return { ...prev, units };
      });
    }
  };

  // Delete unit
  const handleDeleteUnit = async (unit: SubordinateUnit) => {
    if (role !== 'ADMINISTRADOR') return;
    const confirmDelete = window.confirm(`Deseja realmente excluir a unidade ${unit.identificacao} (${unit.nome})?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/organogram/unit/${unit.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchOrganogram();
      }
    } catch (err) {
      setDatabase(prev => ({
        ...prev,
        units: prev.units.filter(u => u.id !== unit.id)
      }));
    }
  };

  // Save or edit Grand Command
  const handleSaveCommand = async (cmdData: GrandCommand) => {
    try {
      const res = await fetch('/api/organogram/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmdData)
      });
      if (res.ok) {
        await fetchOrganogram();
      }
    } catch (err) {
      setDatabase(prev => {
        const commands = [...prev.commands];
        const idx = commands.findIndex(c => c.id === cmdData.id);
        if (idx >= 0) commands[idx] = cmdData;
        else commands.push(cmdData);
        return { ...prev, commands };
      });
    }
  };

  // Emblem updates
  const handleUpdateCommandEmblem = async (cmdId: string, url: string) => {
    const cmd = database.commands.find(c => c.id === cmdId);
    if (cmd) {
      await handleSaveCommand({ ...cmd, emblemaUrl: url });
    }
  };

  const handleUpdateUnitEmblem = async (unitId: string, url: string) => {
    const unit = database.units.find(u => u.id === unitId);
    if (unit) {
      await handleSaveUnit({ ...unit, emblemaUrl: url });
    }
  };

  // Apply AI changes
  const handleApplyAIChanges = async (
    approvedItems: UnitDiffItem[], 
    reportSummary: string, 
    imageBase64?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/ai/apply-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedItems,
          usuario: 'Administrador CPI/PMMA',
          imagemUrl: imageBase64 ? 'Imagem arquivada' : undefined,
          reportSummary
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchOrganogram();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Rollback version
  const handleRestoreVersion = async (versionId: string) => {
    const res = await fetch(`/api/history/restore/${versionId}`, { method: 'POST' });
    const json = await res.json();
    if (res.ok && json.success) {
      await fetchOrganogram();
    } else {
      throw new Error(json.message || 'Falha ao restaurar versão.');
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    const ok = window.confirm('Atenção: isto restaurará o organograma institucional para a base oficial inicial da PMMA. Deseja continuar?');
    if (!ok) return;

    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        await fetchOrganogram();
        alert('Dados oficiais restaurados com sucesso.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export handlers for Dual Versions (Visual Model from PDF Anexo + Cadastral Report)
  const handleExportVisualPdf = async () => {
    setIsExporting(true);
    try {
      await exportVisualOrganogramPdf('official-pdf-model-sheet');
    } catch (e: any) {
      alert(`Erro ao exportar PDF do modelo oficial: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportVisualPng = async () => {
    setIsExporting(true);
    try {
      await exportVisualOrganogramPng('official-pdf-model-sheet');
    } catch (e: any) {
      alert(`Erro ao exportar PNG do modelo oficial: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCadastralPdf = () => {
    setIsExporting(true);
    try {
      exportCadastralReportPdf(database);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCadastralPng = async () => {
    setIsExporting(true);
    try {
      await exportCadastralReportPng('report-printable-area');
    } catch (e: any) {
      alert(`Erro ao exportar PNG do relatório: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenExportModal = (format: 'all' | 'pdf' | 'png' = 'all') => {
    setExportModalFormat(format);
    setIsExportModalOpen(true);
  };

  const handlePrint = () => {
    printOrganogram();
  };

  const openAddUnitModal = (commandId?: string) => {
    setEditingUnit(null);
    setDefaultCommandForNewUnit(commandId);
    setIsUnitEditModalOpen(true);
  };

  const openEditUnitModal = (unit: SubordinateUnit) => {
    setEditingUnit(unit);
    setIsUnitEditModalOpen(true);
  };

  const openEditCommandModal = (cmd: GrandCommand) => {
    setEditingCommand(cmd);
    setIsCommandEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 selection:bg-emerald-200">
      {/* Header */}
      <Header
        topCommand={database.topCommand}
        role={role}
        onToggleRole={() => setIsAdminLoginOpen(true)}
        onExportVisualPdf={handleExportVisualPdf}
        onExportCadastralPdf={handleExportCadastralPdf}
        onExportVisualPng={handleExportVisualPng}
        onExportCadastralPng={handleExportCadastralPng}
        onOpenExportModal={handleOpenExportModal}
        onPrint={handlePrint}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchOrganogram}
        isExporting={isExporting}
      />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* TAB 1: Organograma Completo */}
        {activeTab === 'organograma' && (
          <OrganogramView
            topCommand={database.topCommand}
            commands={database.commands}
            units={database.units}
            role={role}
            selectedCommandId={selectedCommandId}
            onSelectCommand={setSelectedCommandId}
            onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
            onAddUnit={openAddUnitModal}
            onEditUnit={openEditUnitModal}
            onDeleteUnit={handleDeleteUnit}
            onEditCommand={openEditCommandModal}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        )}

        {/* TAB 2: Atualização Inteligente por Print (IA) */}
        {activeTab === 'atualizacao_ia' && (
          <SmartUpdateSection
            role={role}
            onApplyChanges={handleApplyAIChanges}
            onRefreshDatabase={fetchOrganogram}
            onGoToOrganogram={() => setActiveTab('organograma')}
          />
        )}

        {/* TAB 3: Grandes Comandos (CPAI) */}
        {activeTab === 'comandos' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 w-full space-y-6">
            <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
                    <ShieldAlert className="w-6 h-6 text-[#005a2b]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">
                      GRANDES COMANDOS DA PMMA (CPAI-1 AO CPAI-9)
                    </h2>
                    <p className="text-xs text-slate-600">
                      Estrutura operacional regional de Comando do Policiamento do Interior
                    </p>
                  </div>
                </div>

                {role === 'ADMINISTRADOR' && (
                  <button
                    onClick={() => {
                      setEditingCommand(null);
                      setIsCommandEditModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Grande Comando</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {database.commands.map(cmd => {
                  const cmdUnits = database.units.filter(u => u.grandCommandId === cmd.id);
                  return (
                    <div key={cmd.id} className="border-2 border-black rounded-lg p-4 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="font-black text-base text-[#005a2b]">{cmd.sigla}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-[#005a2b] px-2 py-0.5 rounded border border-emerald-300">
                            {cmdUnits.length} Unidades
                          </span>
                        </div>

                        <div className="my-3 flex items-center space-x-3">
                          {cmd.emblemaUrl && (
                            <img src={cmd.emblemaUrl} alt="" className="w-16 h-16 object-contain rounded bg-white p-1 border border-slate-200 shadow-xs" />
                          )}
                          <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase">{cmd.nome}</h4>
                            <p className="text-[11px] font-semibold text-slate-600">{cmd.regiao}</p>
                            <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#005a2b]" />
                              <span>Sede: {cmd.municipioSede}</span>
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1">
                          <p><span className="text-slate-500 font-semibold">Comandante:</span> <strong className="text-slate-900">{cmd.comandante}</strong></p>
                          <p><span className="text-slate-500 font-semibold">Telefone:</span> <span className="font-mono">{cmd.telefone}</span></p>
                          <p><span className="text-slate-500 font-semibold">E-mail:</span> <span className="text-slate-700">{cmd.email}</span></p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedCommandId(cmd.id);
                            setActiveTab('organograma');
                          }}
                          className="text-xs font-bold text-[#005a2b] hover:underline flex items-center space-x-1"
                        >
                          <span>Ver no Organograma</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        {role === 'ADMINISTRADOR' && (
                          <button
                            onClick={() => openEditCommandModal(cmd)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs flex items-center space-x-1 border border-slate-300"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Unidades e Batalhões */}
        {activeTab === 'unidades' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 w-full space-y-6">
            <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
                    <Building className="w-6 h-6 text-[#005a2b]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">
                      CATÁLOGO DE BATALHÕES E UNIDADES ({database.units.length})
                    </h2>
                    <p className="text-xs text-slate-600">
                      Batalhões (BPMs) e Companhias Independentes (CIPMs) do interior maranhense
                    </p>
                  </div>
                </div>

                {role === 'ADMINISTRADOR' && (
                  <button
                    onClick={() => openAddUnitModal()}
                    className="px-4 py-2 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Nova Unidade</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {database.units.map(unit => {
                  const cmd = database.commands.find(c => c.id === unit.grandCommandId);
                  return (
                    <div 
                      key={unit.id}
                      onClick={() => setSelectedUnitForDetail(unit)}
                      className="border-2 border-black rounded-lg p-3.5 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <span className="font-black text-sm text-[#005a2b]">{unit.identificacao}</span>
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {cmd?.sigla}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-2">{unit.nome}</p>
                        <p className="text-xs text-slate-600 flex items-center space-x-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#005a2b]" />
                          <span>{unit.municipio}</span>
                        </p>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 my-2 text-xs">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Comandante</p>
                          <p className="font-black text-slate-900">{unit.comandante}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-mono text-[11px]">{unit.telefone}</span>
                        <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                          {role === 'ADMINISTRADOR' && (
                            <>
                              <button
                                onClick={() => openEditUnitModal(unit)}
                                className="p-1 hover:text-[#005a2b] text-slate-600"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(unit)}
                                className="p-1 hover:text-rose-600 text-slate-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Municípios */}
        {activeTab === 'municipios' && (
          <ReportsView database={database} />
        )}

        {/* TAB 6: Comandantes e Contatos */}
        {activeTab === 'comandantes' && (
          <ReportsView database={database} />
        )}

        {/* TAB 7: Gerenciamento de Emblemas */}
        {activeTab === 'emblemas' && (
          <EmblemsManager
            commands={database.commands}
            units={database.units}
            role={role}
            onUpdateCommandEmblem={handleUpdateCommandEmblem}
            onUpdateUnitEmblem={handleUpdateUnitEmblem}
          />
        )}

        {/* TAB 8: Relatórios e Estatísticas */}
        {activeTab === 'relatorios' && (
          <ReportsView database={database} />
        )}

        {/* TAB 9: Histórico e Rollback */}
        {activeTab === 'historico' && (
          <HistoryView
            history={database.history}
            role={role}
            onRestoreVersion={handleRestoreVersion}
          />
        )}

        {/* TAB 10: Configurações e Manutenção */}
        {activeTab === 'configuracoes' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 w-full space-y-6">
            <div className="bg-white border-2 border-black rounded-lg shadow-sm p-6 space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <Settings className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase">
                    CONFIGURAÇÕES DO SISTEMA E AUDITORIA
                  </h2>
                  <p className="text-xs text-slate-600">
                    Parâmetros gerais do Comando do Policiamento do Interior (CPI) e redefinição de fábrica
                  </p>
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 space-y-2">
                <h4 className="font-black text-sm text-rose-900 uppercase flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>Restauração para Base Oficial de Fábrica (PMMA 2026)</span>
                </h4>
                <p className="text-xs text-rose-800">
                  Restaura todos os Grandes Comandos (CPAI-1 a CPAI-9), os emblemas oficiais e a relação completa de batalhões para os dados de implantação inicial.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleResetDemo}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded flex items-center space-x-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Base de Dados Original</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <UnitDetailModal
        unit={selectedUnitForDetail}
        commands={database.commands}
        role={role}
        onClose={() => setSelectedUnitForDetail(null)}
        onEdit={(unit) => {
          setSelectedUnitForDetail(null);
          openEditUnitModal(unit);
        }}
      />

      <UnitEditModal
        unit={editingUnit}
        commands={database.commands}
        defaultCommandId={defaultCommandForNewUnit}
        isOpen={isUnitEditModalOpen}
        onClose={() => setIsUnitEditModalOpen(false)}
        onSave={handleSaveUnit}
      />

      <GrandCommandEditModal
        command={editingCommand}
        isOpen={isCommandEditModalOpen}
        onClose={() => setIsCommandEditModalOpen(false)}
        onSave={handleSaveCommand}
      />

      <AdminLoginModal
        currentRole={role}
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSetRole={setRole}
      />

      {/* Offscreen High-Resolution Render Sheet for Pristine PDF/PNG Capture of the Attached Model */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '-99999px', 
          top: '0', 
          pointerEvents: 'none', 
          zIndex: -100, 
          width: '1580px' 
        }} 
        aria-hidden="true"
      >
        <OfficialPdfModelSheet database={database} id="official-pdf-model-sheet" />
      </div>

      {/* Export Modal with Both Versions (Attached Model & Existing Cadastral Report) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        database={database}
        initialFormat={exportModalFormat}
      />
    </div>
  );
}
