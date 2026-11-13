import React, { useState } from 'react';
import { SubordinateUnit, GrandCommand, UserRole } from '../types/organogram';
import { COMPANHIAS_POR_CPAI } from '../data/companhiasData';
import { normalizeUnitId } from '../utils/searchUtils';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Copy, 
  Check, 
  MessageSquare, 
  Edit, 
  Layers, 
  Building2,
  ExternalLink 
} from 'lucide-react';

interface UnitDetailModalProps {
  unit: SubordinateUnit | null;
  commands: GrandCommand[];
  role: UserRole;
  onClose: () => void;
  onEdit: (unit: SubordinateUnit) => void;
}

export const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  unit,
  commands,
  role,
  onClose,
  onEdit
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!unit) return null;

  const parentCmd = commands.find(c => c.id === unit.grandCommandId);
  const emblemToDisplay = unit.emblemaUrl || parentCmd?.emblemaUrl || '/assets/aistudio/CPAI_1_9c470153.jpg';

  const unitIdNorm = normalizeUnitId(unit.identificacao);
  const officialBatalhaoCompanhias = COMPANHIAS_POR_CPAI
    .flatMap(g => g.batalhoes)
    .find(b => {
      const baseNorm = normalizeUnitId(b.upm.split(/\s*-\s*/)[0]);
      const fullNorm = normalizeUnitId(b.upm);
      return baseNorm === unitIdNorm || fullNorm === unitIdNorm;
    });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cleanPhone = unit.telefone.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border-2 border-black rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Institutional Green */}
        <div className="bg-[#005a2b] text-white p-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center space-x-3">
            {emblemToDisplay && (
              <img
                src={emblemToDisplay}
                alt="Emblema"
                className="w-12 h-12 object-contain bg-white rounded p-1 border border-white/20"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black uppercase tracking-wide">
                  {unit.identificacao}
                </h3>
                <span className="text-[10px] font-bold bg-white text-[#005a2b] px-2 py-0.5 rounded uppercase">
                  {unit.tipo}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium">
                Subordinado ao: {parentCmd ? `${parentCmd.sigla} - ${parentCmd.nome}` : 'Grande Comando'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* Main Info Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Denominação Oficial</p>
              <h4 className="text-sm font-black text-slate-900">{unit.nome}</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Município Sede</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#005a2b]" />
                  <span className="font-bold text-slate-900 text-xs">{unit.municipio}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Grande Comando Responsável</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <Shield className="w-4 h-4 text-[#005a2b]" />
                  <span className="font-bold text-slate-900 text-xs">{parentCmd?.sigla} ({parentCmd?.municipioSede})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commander Card */}
          <div className="border-2 border-black rounded-lg p-4 bg-white space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#005a2b]">
              COMANDO DA UNIDADE
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-slate-900">{unit.comandante}</p>
                <p className="text-xs font-semibold text-slate-600">Posto/Graduação: {unit.posto || 'Oficial PMMA'}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 text-[#005a2b] font-bold text-xs border border-emerald-300">
                Titular
              </span>
            </div>
          </div>

          {/* Contacts and Direct Actions */}
          <div className="space-y-2">
            <h5 className="font-extrabold uppercase text-xs text-slate-700 tracking-wide">
              CANAIS DE CONTATO OFICIAL
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone Card */}
              <div className="bg-slate-50 border border-slate-300 rounded p-3 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Telefone Funcional / Plantão</p>
                  <p className="text-xs font-mono font-bold text-slate-900">{unit.telefone || 'Não informado'}</p>
                </div>
                {unit.telefone && (
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => copyToClipboard(unit.telefone, 'tel')}
                      className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-700 flex items-center justify-center space-x-1"
                    >
                      {copiedField === 'tel' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'tel' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/55${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Email Card */}
              <div className="bg-slate-50 border border-slate-300 rounded p-3 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">E-mail Institucional</p>
                  <p className="text-xs font-mono font-medium text-slate-800 break-all">{unit.email || 'Não cadastrado'}</p>
                </div>
                {unit.email && (
                  <div className="pt-1 border-t border-slate-200">
                    <button
                      onClick={() => copyToClipboard(unit.email || '', 'email')}
                      className="w-full py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-700 flex items-center justify-center space-x-1"
                    >
                      {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'email' ? 'Copiado!' : 'Copiar E-mail'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Jurisdiction / Municipalities Covered */}
          <div className="space-y-2">
            <h5 className="font-extrabold uppercase text-xs text-slate-700 tracking-wide">
              ÁREA DE ATUAÇÃO E MUNICÍPIOS SOB JURISDIÇÃO
            </h5>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded">
              {unit.municipiosJurisdicao && unit.municipiosJurisdicao.length > 0 ? (
                unit.municipiosJurisdicao.map((mun, i) => (
                  <span 
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      mun === unit.municipio 
                        ? 'bg-[#005a2b] text-white font-bold border-black' 
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  >
                    {mun} {mun === unit.municipio && ' (Sede)'}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">Sede: {unit.municipio}</span>
              )}
            </div>
          </div>

          {/* Subunits (Nível 3) */}
          {unit.subunidades && unit.subunidades.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-extrabold uppercase text-xs text-slate-700 tracking-wide flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-[#005a2b]" />
                <span>SUBUNIDADES VINCULADAS (NÍVEL 3)</span>
              </h5>
              <div className="divide-y divide-slate-200 border border-slate-300 rounded overflow-hidden">
                {unit.subunidades.map(sub => (
                  <div key={sub.id} className="p-2.5 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{sub.nome}</p>
                      <p className="text-[11px] text-slate-500">
                        {sub.tipo} • {sub.municipio} {sub.responsavel ? `• Resp: ${sub.responsavel}` : ''}
                      </p>
                    </div>
                    {sub.contato && (
                      <span className="font-mono text-[11px] text-slate-600 font-semibold">{sub.contato}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Companhias / Pelotões / DPMs from PDF */}
          {officialBatalhaoCompanhias && officialBatalhaoCompanhias.companhias.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-extrabold uppercase text-xs text-slate-700 tracking-wide flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#005a2b]" />
                <span>COMPANHIAS, PELOTÕES E DPMs PERTENCENTES ({officialBatalhaoCompanhias.companhias.length})</span>
              </h5>
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-3">Cidade / Localidade</th>
                      <th className="py-1.5 px-3">Companhia / Pelotão / DPM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {officialBatalhaoCompanhias.companhias.map((c, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-1.5 px-3 font-bold text-slate-900">{c.cidade}</td>
                        <td className="py-1.5 px-3 font-extrabold text-[#005a2b]">{c.companhia || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3.5 border-t border-slate-300 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">PMMA • CPI • Sistema de Organograma 2026</span>
          
          <div className="flex items-center space-x-2">
            {role === 'ADMINISTRADOR' && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(unit);
                }}
                className="px-4 py-1.5 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded flex items-center space-x-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Unidade</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
