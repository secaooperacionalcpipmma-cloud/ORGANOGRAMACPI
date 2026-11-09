import React, { useState, useRef } from 'react';
import { GrandCommand, SubordinateUnit, UserRole } from '../types/organogram';
import { 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Building, 
  AlertCircle 
} from 'lucide-react';

interface EmblemsManagerProps {
  commands: GrandCommand[];
  units: SubordinateUnit[];
  role: UserRole;
  onUpdateCommandEmblem: (commandId: string, url: string) => Promise<void>;
  onUpdateUnitEmblem: (unitId: string, url: string) => Promise<void>;
}

export const EmblemsManager: React.FC<EmblemsManagerProps> = ({
  commands,
  units,
  role,
  onUpdateCommandEmblem,
  onUpdateUnitEmblem
}) => {
  const [selectedTargetType, setSelectedTargetType] = useState<'command' | 'unit'>('command');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(commands[0]?.id || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndAssign = async () => {
    if (!previewImage) {
      setStatusMsg({ type: 'error', text: 'Selecione uma imagem primeiro.' });
      return;
    }

    if (role !== 'ADMINISTRADOR') {
      setStatusMsg({ type: 'error', text: 'Apenas Administradores podem atualizar emblemas.' });
      return;
    }

    setIsUploading(true);
    setStatusMsg(null);

    try {
      // Send to server upload endpoint
      const res = await fetch('/api/emblems/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: previewImage,
          filename: `emblema_${selectedTargetType}_${selectedTargetId}.png`
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Falha no upload do emblema.');
      }

      const emblemUrl = json.url;

      if (selectedTargetType === 'command') {
        await onUpdateCommandEmblem(selectedTargetId, emblemUrl);
      } else {
        await onUpdateUnitEmblem(selectedTargetId, emblemUrl);
      }

      setStatusMsg({ type: 'success', text: 'Emblema atualizado e vinculado com sucesso!' });
      setPreviewImage(null);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Erro ao vincular emblema.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
          <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
            <Shield className="w-6 h-6 text-[#005a2b]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              CADASTRO E GERENCIAMENTO DOS EMBLEMAS INSTITUCIONAIS
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Gerencie os brasões e insígnias oficiais de cada Grande Comando (CPAI-1 a CPAI-9) e de suas unidades subordinadas. Preservação de proporção original e substituição com persistência permanente.
            </p>
          </div>
        </div>

        {/* Upload Box */}
        {role === 'ADMINISTRADOR' ? (
          <div className="mt-6 bg-slate-50 border border-slate-300 rounded-lg p-5">
            <h3 className="text-sm font-black text-slate-900 uppercase mb-3 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-[#005a2b]" />
              <span>Vincular ou Substituir Emblema Oficial</span>
            </h3>

            {statusMsg && (
              <div className={`p-3 rounded mb-4 text-xs font-bold ${
                statusMsg.type === 'success' ? 'bg-emerald-100 text-[#005a2b] border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {statusMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Estrutura</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTargetType('command');
                      setSelectedTargetId(commands[0]?.id || '');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-colors ${
                      selectedTargetType === 'command'
                        ? 'bg-[#005a2b] text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    Grande Comando
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTargetType('unit');
                      setSelectedTargetId(units[0]?.id || '');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-colors ${
                      selectedTargetType === 'unit'
                        ? 'bg-[#005a2b] text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    Unidade / Batalhão
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione o {selectedTargetType === 'command' ? 'Grande Comando' : 'Batalhão/Unidade'}
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-[#005a2b] focus:outline-none"
                >
                  {selectedTargetType === 'command' ? (
                    commands.map(cmd => (
                      <option key={cmd.id} value={cmd.id}>
                        {cmd.sigla} - {cmd.nome} ({cmd.municipioSede})
                      </option>
                    ))
                  ) : (
                    units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.identificacao} - {u.nome} ({u.municipio})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selecionar Imagem</label>
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 flex items-center justify-center space-x-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Escolher Arquivo...</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadAndAssign}
                    disabled={isUploading || !previewImage}
                    className={`py-1.5 px-4 rounded text-xs font-bold text-white flex items-center space-x-1 ${
                      previewImage && !isUploading ? 'bg-[#005a2b] hover:bg-[#004722]' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </div>

            {previewImage && (
              <div className="mt-4 flex items-center space-x-3 p-3 bg-white border border-emerald-300 rounded">
                <img src={previewImage} alt="Preview" className="w-16 h-16 object-contain rounded border border-slate-200" />
                <div className="text-xs">
                  <p className="font-bold text-[#005a2b]">Pré-visualização do Novo Emblema</p>
                  <p className="text-slate-500 text-[11px]">Clique em "Salvar" para confirmar a vinculação.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Perfil de consulta ativo. O upload e substituição de emblemas é restrito a administradores.</span>
          </div>
        )}
      </div>

      {/* Emblems Grid of the 9 CPAIs */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
          <span>EMBLEMAS OFICIAIS DOS GRANDES COMANDOS (CPAI-1 AO CPAI-9)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {commands.map((cmd) => (
            <div 
              key={cmd.id}
              className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden flex flex-col items-center text-center p-4 hover:shadow-md transition-shadow relative"
            >
              <div className="w-full bg-[#005a2b] text-white py-1.5 px-3 rounded mb-4 border border-black">
                <h4 className="font-black text-sm uppercase">{cmd.sigla}</h4>
                <p className="text-[10px] text-emerald-100">{cmd.nome}</p>
              </div>

              <div className="w-36 h-36 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center mb-3">
                {cmd.emblemaUrl ? (
                  <img
                    src={cmd.emblemaUrl}
                    alt={`Emblema ${cmd.sigla}`}
                    className="max-w-full max-h-full object-contain drop-shadow-md rounded"
                  />
                ) : (
                  <div className="text-slate-400 text-xs font-bold uppercase">
                    Sem Emblema
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-700 w-full space-y-1 pt-2 border-t border-slate-100">
                <p><strong>Sede:</strong> {cmd.municipioSede}</p>
                <p><strong>Comandante:</strong> {cmd.comandante}</p>
                <p className="text-[11px] text-slate-500">{cmd.telefone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
