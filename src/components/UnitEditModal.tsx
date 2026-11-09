import React, { useState, useEffect } from 'react';
import { SubordinateUnit, GrandCommand, SubUnit } from '../types/organogram';
import { X, Save, Plus, Trash2, Building, Shield } from 'lucide-react';

interface UnitEditModalProps {
  unit: SubordinateUnit | null;
  commands: GrandCommand[];
  defaultCommandId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unitData: SubordinateUnit) => Promise<void>;
}

export const UnitEditModal: React.FC<UnitEditModalProps> = ({
  unit,
  commands,
  defaultCommandId,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<SubordinateUnit>>({
    identificacao: '',
    tipo: 'Batalhão',
    nome: '',
    grandCommandId: defaultCommandId || commands[0]?.id || 'cpa-i-1',
    municipio: '',
    municipiosJurisdicao: [],
    comandante: '',
    posto: 'TEN CEL QOEM',
    telefone: '',
    email: '',
    subunidades: []
  });

  const [jurisdicaoInput, setJurisdicaoInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      setFormData(unit);
      setJurisdicaoInput(unit.municipiosJurisdicao ? unit.municipiosJurisdicao.join(', ') : unit.municipio);
    } else {
      setFormData({
        identificacao: '',
        tipo: 'Batalhão',
        nome: '',
        grandCommandId: defaultCommandId || commands[0]?.id || 'cpa-i-1',
        municipio: '',
        municipiosJurisdicao: [],
        comandante: '',
        posto: 'TEN CEL QOEM',
        telefone: '',
        email: '',
        subunidades: []
      });
      setJurisdicaoInput('');
    }
  }, [unit, defaultCommandId, commands, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identificacao?.trim()) {
      setErrorMsg('A identificação da unidade é obrigatória (ex: 15º BPM).');
      return;
    }
    if (!formData.municipio?.trim()) {
      setErrorMsg('O município sede é obrigatório.');
      return;
    }

    const parsedJurisdicao = jurisdicaoInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (!parsedJurisdicao.includes(formData.municipio)) {
      parsedJurisdicao.unshift(formData.municipio);
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const finalUnit: SubordinateUnit = {
        id: unit?.id || `unit-${Date.now()}`,
        identificacao: formData.identificacao.trim(),
        tipo: formData.tipo || 'Batalhão',
        nome: formData.nome?.trim() || `${formData.identificacao.trim()} de Polícia Militar`,
        grandCommandId: formData.grandCommandId || commands[0].id,
        municipio: formData.municipio.trim(),
        municipiosJurisdicao: parsedJurisdicao,
        comandante: formData.comandante?.trim() || 'A DEFINIR',
        posto: formData.posto || 'TEN CEL QOEM',
        telefone: formData.telefone?.trim() || '',
        email: formData.email?.trim() || '',
        subunidades: formData.subunidades || []
      };

      await onSave(finalUnit);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar unidade.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSubunit = () => {
    const newSub: SubUnit = {
      id: `sub-${Date.now()}`,
      tipo: 'Companhia',
      nome: 'Nova Companhia / Sede',
      municipio: formData.municipio || 'Sede'
    };
    setFormData(prev => ({
      ...prev,
      subunidades: [...(prev.subunidades || []), newSub]
    }));
  };

  const removeSubunit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subunidades: (prev.subunidades || []).filter(s => s.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border-2 border-black rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#005a2b] text-white p-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-black uppercase tracking-wide">
              {unit ? `Editar Unidade: ${unit.identificacao}` : 'Cadastrar Nova Unidade Subordinada'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 rounded font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Identificação / Sigla <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.identificacao || ''}
                onChange={(e) => setFormData({ ...formData, identificacao: e.target.value })}
                placeholder="Ex: 15º BPM, 7ª CIPM"
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Unidade</label>
              <select
                value={formData.tipo || 'Batalhão'}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              >
                <option value="Batalhão">Batalhão de Polícia Militar (BPM)</option>
                <option value="Companhia Independente">Companhia Independente (CIPM)</option>
                <option value="Comando Especializado">Comando Especializado</option>
                <option value="Outro">Outra Estrutura</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo Oficial</label>
            <input
              type="text"
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: 15º Batalhão de Polícia Militar"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Grande Comando Vinculado</label>
            <select
              value={formData.grandCommandId}
              onChange={(e) => setFormData({ ...formData, grandCommandId: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            >
              {commands.map(cmd => (
                <option key={cmd.id} value={cmd.id}>
                  {cmd.sigla} - {cmd.nome} ({cmd.municipioSede})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Município Sede <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.municipio || ''}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                placeholder="Ex: Bacabal"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 font-semibold focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Posto / Graduação</label>
              <select
                value={formData.posto || 'TEN CEL QOEM'}
                onChange={(e) => setFormData({ ...formData, posto: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              >
                <option value="CEL QOEM">CEL QOEM (Coronel)</option>
                <option value="TEN CEL QOEM">TEN CEL QOEM (Tenente-Coronel)</option>
                <option value="MAJ QOEM">MAJ QOEM (Major)</option>
                <option value="CAP QOEM">CAP QOEM (Capitão)</option>
                <option value="1º TEN QOEM">1º TEN QOEM (Primeiro-Tenente)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo do Comandante</label>
            <input
              type="text"
              value={formData.comandante || ''}
              onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
              placeholder="Ex: TEN CEL QOEM LEILA"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone de Contato</label>
              <input
                type="text"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="Ex: (99) 98822-0015"
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail Institucional</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: 15bpm@pm.ma.gov.br"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Municípios sob Jurisdição (separados por vírgula)
            </label>
            <input
              type="text"
              value={jurisdicaoInput}
              onChange={(e) => setJurisdicaoInput(e.target.value)}
              placeholder="Ex: Bacabal, Olho d'Água das Cunhãs, Bom Lugar"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>

          {/* Subunits Editor */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700">Subunidades (Companhias, Pelotões, DPMs)</span>
              <button
                type="button"
                onClick={addSubunit}
                className="text-[11px] font-bold text-[#005a2b] hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar Subunidade</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {(formData.subunidades || []).map((sub, i) => (
                <div key={sub.id} className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-300">
                  <input
                    type="text"
                    value={sub.nome}
                    onChange={(e) => {
                      const updated = [...(formData.subunidades || [])];
                      updated[i] = { ...updated[i], nome: e.target.value };
                      setFormData({ ...formData, subunidades: updated });
                    }}
                    placeholder="Nome da Subunidade"
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={sub.municipio}
                    onChange={(e) => {
                      const updated = [...(formData.subunidades || [])];
                      updated[i] = { ...updated[i], municipio: e.target.value };
                      setFormData({ ...formData, subunidades: updated });
                    }}
                    placeholder="Município"
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubunit(sub.id)}
                    className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-300 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#005a2b] hover:bg-[#004722] text-white rounded font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Registro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
