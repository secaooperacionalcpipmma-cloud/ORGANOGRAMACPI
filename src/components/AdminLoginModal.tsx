import React, { useState } from 'react';
import { UserRole } from '../types/organogram';
import { Shield, Lock, Unlock, X, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  currentRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSetRole: (role: UserRole) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  currentRole,
  isOpen,
  onClose,
  onSetRole
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-configured administrative pin for institutional operations
    if (password === 'cpi2026' || password === 'admin' || password === 'pmma') {
      onSetRole('ADMINISTRADOR');
      setPassword('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('Senha institucional incorreta. Utilize a senha padrão do CPI (cpi2026).');
    }
  };

  const handleSwitchToConsulta = () => {
    onSetRole('CONSULTA');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border-2 border-black rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#005a2b] text-white p-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-black uppercase tracking-wide">
              Controle de Acesso Institucional
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-800">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <p>Perfil Atual: <strong className="text-slate-900">{currentRole}</strong></p>
            <p className="text-slate-500 text-[11px]">
              O perfil <strong>ADMINISTRADOR</strong> possui controle total para editar unidades, subir prints para IA e restaurar versões. O perfil <strong>CONSULTA</strong> é destinado à navegação e visualização.
            </p>
          </div>

          {currentRole === 'CONSULTA' ? (
            <form onSubmit={handleAdminAuth} className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 rounded text-xs flex items-center space-x-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Senha Institucional de Administrador
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha (padrão: cpi2026)"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Dica de acesso: utilize a credencial <code>cpi2026</code></p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005a2b] hover:bg-[#004722] text-white rounded font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Entrar como Administrador</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Você está conectado com privilégios completos de Administrador.</span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Continuar
                </button>
                <button
                  onClick={handleSwitchToConsulta}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Mudar para Modo Consulta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
