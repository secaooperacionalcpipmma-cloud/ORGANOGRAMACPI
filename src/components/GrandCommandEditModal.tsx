import React, { useState, useEffect } from 'react';
import { GrandCommand } from '../types/organogram';
import { X, Save, Shield } from 'lucide-react';

interface GrandCommandEditModalProps {
  command: GrandCommand | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (commandData: GrandCommand) => Promise<void>;
}

export const GrandCommandEditModal: React.FC<GrandCommandEditModalProps> = ({
  command,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<GrandCommand>>({
    sigla: '',
    nome: '',
    regiao: '',
    comandante: '',
    posto: 'CEL QOEM',
    telefone: '',
    email: '',
    municipioSede: '',
    emblemaUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (command) {
      setFormData(command);
    } else {
      setFormData({
        sigla: '',
        nome: '',
        regiao: '',
        comandante: '',
        posto: 'CEL QOEM',
        telefone: '',
        email: '',
        municipioSede: '',
        emblemaUrl: ''
      });
    }
  }, [command, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sigla?.trim() || !formData.nome?.trim()) {
      setErrorMsg('Sigla e Nome são obrigatórios.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const finalCmd: GrandCommand = {
        id: command?.id || `cpa-${Date.now()}`,
        sigla: formData.sigla.trim(),
        nome: formData.nome.trim(),
        regiao: formData.regiao?.trim() || 'Região Operacional',
        comandante: formData.comandante?.trim() || 'A DEFINIR',
        posto: formData.posto || 'CEL QOEM',
        telefone: formData.telefone?.trim() || '',
        email: formData.email?.trim() || '',
        municipioSede: formData.municipioSede?.trim() || 'Sede',
        emblemaUrl: formData.emblemaUrl || (command?.emblemaUrl || ''),
        ordem: command?.ordem || 10
      };

      await onSave(finalCmd);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar Grande Comando.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border-2 border-black rounded-lg shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#005a2b] text-white p-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-black uppercase tracking-wide">
              {command ? `Editar Grande Comando: ${command.sigla}` : 'Novo Grande Comando'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 rounded font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sigla (ex: CPAI-1)</label>
              <input
                type="text"
                required
                value={formData.sigla || ''}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-black text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Município Sede</label>
              <input
                type="text"
                required
                value={formData.municipioSede || ''}
                onChange={(e) => setFormData({ ...formData, municipioSede: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Região de Atuação</label>
            <input
              type="text"
              value={formData.regiao || ''}
              onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Comandante</label>
            <input
              type="text"
              value={formData.comandante || ''}
              onChange={(e) => setFormData({ ...formData, comandante: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-1.5 bg-[#005a2b] hover:bg-[#004722] text-white rounded font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
