import React, { useState } from 'react';
import { HistoryRecord, UserRole } from '../types/organogram';
import { 
  History, 
  RotateCcw, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Layers, 
  Image as ImageIcon 
} from 'lucide-react';

interface HistoryViewProps {
  history: HistoryRecord[];
  role: UserRole;
  onRestoreVersion: (id: string) => Promise<void>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  role,
  onRestoreVersion
}) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    if (role !== 'ADMINISTRADOR') {
      alert('Apenas usuários com perfil de ADMINISTRADOR podem restaurar versões anteriores.');
      return;
    }

    const confirmRestore = window.confirm('Deseja realmente restaurar esta versão do organograma? O estado atual será salvo antes da restauração.');
    if (!confirmRestore) return;

    setIsRestoring(id);
    setRestoreSuccess(null);

    try {
      await onRestoreVersion(id);
      setRestoreSuccess(`Versão restaurada com sucesso!`);
    } catch (e: any) {
      alert(e.message || 'Erro ao restaurar versão.');
    } finally {
      setIsRestoring(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
          <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
            <History className="w-6 h-6 text-[#005a2b]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              HISTÓRICO DE ATUALIZAÇÕES E RESTAURAÇÃO (ROLLBACK)
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Consulte todas as atualizações realizadas por Inteligência Artificial ou edições manuais. Cada versão possui um snapshot completo do organograma que pode ser inspecionado e restaurado a qualquer momento.
            </p>
          </div>
        </div>

        {restoreSuccess && (
          <div className="mt-4 p-3 bg-emerald-100 border border-emerald-300 text-[#005a2b] text-xs font-bold rounded flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{restoreSuccess}</span>
          </div>
        )}
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {history.map((record) => {
          const formattedDate = new Date(record.timestamp).toLocaleString('pt-BR');
          const isSelected = selectedRecord?.id === record.id;

          return (
            <div 
              key={record.id}
              className={`bg-white border-2 rounded-lg overflow-hidden shadow-xs transition-all ${
                isSelected ? 'border-[#005a2b] ring-2 ring-emerald-100' : 'border-black hover:border-[#005a2b]'
              }`}
            >
              {/* Card Header Bar */}
              <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                    record.tipoAcao === 'ATUALIZAÇÃO POR PDF IA' || record.tipoAcao === 'ATUALIZAÇÃO POR PRINT IA'
                      ? 'bg-emerald-100 text-[#005a2b] border-emerald-300'
                      : record.tipoAcao === 'RESTAURAÇÃO'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {record.tipoAcao}
                  </span>

                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-[#005a2b]" />
                    <span>{formattedDate}</span>
                  </div>

                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Responsável: <strong className="text-slate-800">{record.usuario}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedRecord(isSelected ? null : record)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded"
                  >
                    {isSelected ? 'Ocultar Detalhes' : 'Inspecionar Snapshot'}
                  </button>

                  {role === 'ADMINISTRADOR' && (
                    <button
                      onClick={() => handleRestore(record.id)}
                      disabled={isRestoring === record.id}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded flex items-center space-x-1 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isRestoring === record.id ? 'Restaurando...' : 'Restaurar Versão'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 text-xs text-slate-800 space-y-2">
                <p className="font-semibold text-slate-900">{record.descricao}</p>
                
                {record.imagemUrl && (
                  <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#005a2b]" />
                    <span>Print utilizado na atualização armazenado em cache</span>
                  </div>
                )}
              </div>

              {/* Expanded Snapshot Inspection Panel */}
              {isSelected && record.snapshot && (
                <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs space-y-3">
                  <h4 className="font-extrabold uppercase text-[#005a2b] tracking-wider text-[11px] flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>CONTEÚDO DO SNAPSHOT NESSA DATA</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-slate-300">
                      <p className="font-bold text-slate-700 mb-1">Grandes Comandos ({record.snapshot.commands.length})</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {record.snapshot.commands.map(c => (
                          <li key={c.id}><strong>{c.sigla}:</strong> {c.comandante} ({c.municipioSede})</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded border border-slate-300">
                      <p className="font-bold text-slate-700 mb-1">Unidades Registradas ({record.snapshot.units.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-1 text-slate-600 text-[11px]">
                        {record.snapshot.units.map(u => (
                          <div key={u.id} className="flex items-center justify-between border-b border-slate-100 py-0.5">
                            <span className="font-bold text-slate-900">{u.identificacao}</span>
                            <span>{u.comandante}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
