import React, { useState, useRef } from 'react';
import { 
  AIAnalysisReport, 
  UnitDiffItem, 
  UserRole 
} from '../types/organogram';
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  FileCheck, 
  FileText,
  ArrowRight,
  ShieldAlert,
  Phone,
  User,
  MapPin,
  Lock,
  Layers,
  FileCode
} from 'lucide-react';

interface SmartUpdateSectionProps {
  role: UserRole;
  onApplyChanges: (approvedItems: UnitDiffItem[], reportSummary: string, imageBase64?: string) => Promise<boolean>;
  onRefreshDatabase: () => void;
  onGoToOrganogram: () => void;
}

export const SmartUpdateSection: React.FC<SmartUpdateSectionProps> = ({
  role,
  onApplyChanges,
  onRefreshDatabase,
  onGoToOrganogram
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('application/pdf');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [report, setReport] = useState<AIAnalysisReport | null>(null);
  const [diffItems, setDiffItems] = useState<UnitDiffItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('TODAS');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setReport(null);
    setApplySuccess(false);

    const type = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
    setMimeType(type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64Data(result);
      if (type.startsWith('image/')) {
        setPreviewUrl(result);
      } else {
        setPreviewUrl(null); // PDF icon will be rendered
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Run AI analysis through backend Gemini endpoint
  const runAIAnalysis = async () => {
    if (!base64Data) {
      setErrorMsg('Por favor, faça upload de um arquivo PDF (ou imagem do organograma) primeiro.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStage('Carregando e decodificando documento PDF com Gemini 3.8 Flash...');

    try {
      setTimeout(() => {
        setAnalysisStage('Processando documento PDF e extraindo comandos, batalhões e comandantes...');
      }, 1000);

      setTimeout(() => {
        setAnalysisStage('Comparando com a base de dados atual do sistema e calculando diferenças...');
      }, 2500);

      const res = await fetch('/api/ai/analyze-organogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'application/pdf',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Falha ao processar o arquivo PDF com Inteligência Artificial.');
      }

      const rep: AIAnalysisReport = json.report;
      setReport(rep);
      setDiffItems(rep.itens);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro durante a leitura do PDF.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Quick Official PDF Loader: tests the official PDF file uploaded to the app
  const handleLoadOfficialPdf = async () => {
    try {
      setIsAnalyzing(true);
      setErrorMsg(null);
      setAnalysisStage('Carregando arquivo oficial "NOVO ORGANOGRAMA V1 CPI 2026.pdf"...');

      const pdfUrl = '/assets/aistudio/NOVO_ORGANOGRAMA_V1_CPI_2026_-_NOVA_ORGANIZA__O_DO_CPI_-_ORGANOGRAMA_ATUALIZADO_e3ec6213.pdf';
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Str = reader.result as string;
        setBase64Data(base64Str);
        setMimeType('application/pdf');
        setSelectedFile(new File([blob], 'NOVO_ORGANOGRAMA_V1_CPI_2026.pdf', { type: 'application/pdf' }));
        
        setAnalysisStage('Executando modelo Gemini 3.8 Flash nativo em documento PDF...');
        
        const res = await fetch('/api/ai/analyze-organogram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Str,
            mimeType: 'application/pdf',
          }),
        });

        const json = await res.json();
        if (json.success) {
          setReport(json.report);
          setDiffItems(json.report.itens);
        } else {
          throw new Error(json.message);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Falha ao processar o PDF oficial: ' + e.message);
      setIsAnalyzing(false);
    }
  };

  const toggleItemApproval = (index: number) => {
    setDiffItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], aprovado: !updated[index].aprovado };
      return updated;
    });
  };

  const selectAll = (approved: boolean) => {
    setDiffItems(prev => prev.map(item => ({
      ...item,
      aprovado: item.status !== 'NENHUMA ALTERAÇÃO' ? approved : false
    })));
  };

  const handleConfirmAndApply = async () => {
    if (role !== 'ADMINISTRADOR') {
      setErrorMsg('Apenas usuários com perfil de ADMINISTRADOR podem confirmar e aplicar alterações na base de dados.');
      return;
    }

    const approvedOnly = diffItems.filter(i => i.aprovado);
    if (approvedOnly.length === 0) {
      setErrorMsg('Nenhuma alteração foi selecionada para aplicação.');
      return;
    }

    setIsApplying(true);
    setErrorMsg(null);

    try {
      const success = await onApplyChanges(
        approvedOnly,
        report?.resumoIA || `Atualização de ${approvedOnly.length} unidade(s) via análise de PDF pela IA`,
        base64Data || undefined
      );

      if (success) {
        setApplySuccess(true);
        onRefreshDatabase();
      } else {
        setErrorMsg('Falha ao registrar alterações no servidor.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao aplicar alterações.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelUpdate = () => {
    setReport(null);
    setDiffItems([]);
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Data(null);
    setApplySuccess(false);
  };

  // Filter diff items by status
  const displayedDiffs = diffItems.filter(item => {
    if (filterStatus === 'TODAS') return true;
    if (filterStatus === 'ALTERACOES') return item.status !== 'NENHUMA ALTERAÇÃO';
    if (filterStatus === 'CONFERENCIA') return item.requerConferencia;
    return item.status === filterStatus;
  });

  const approvedCount = diffItems.filter(i => i.aprovado).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Institutional Banner */}
      <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-[#005a2b] rounded-lg border border-emerald-300">
              <FileText className="w-6 h-6 text-[#005a2b]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                ATUALIZAÇÃO INTELIGENTE DO ORGANOGRAMA POR PDF
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Envie o arquivo PDF oficial do organograma do CPI (ou captura de tela). A Inteligência Artificial (Gemini 3.8 Flash) fará a leitura nativa do documento PDF, identificará Grandes Comandos, Batalhões, Comandantes, Postos (QOEM) e Telefones, comparará com a base existente e informará detalhadamente todas as mudanças identificadas para confirmação.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLoadOfficialPdf}
              disabled={isAnalyzing}
              className="px-3.5 py-2 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Testar com o PDF Oficial do CPI</span>
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        {!report && (
          <div className="mt-6 space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-[#005a2b] bg-emerald-50/50'
                  : 'border-slate-300 hover:border-[#005a2b] bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf, image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-emerald-100/70 rounded-full text-[#005a2b]">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-[#005a2b] rounded border border-emerald-300">
                    Formato Recomendado: Documento PDF Oficial
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Clique para selecionar ou arraste o arquivo PDF do organograma aqui'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Suporta arquivos <strong>.PDF</strong> nativos com diagramação completa do CPI, além de imagens PNG e JPEG.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview and Start Analysis Button */}
            {selectedFile && (
              <div className="bg-slate-50 p-4 rounded-md border border-slate-300 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Pré-visualização"
                      className="w-16 h-16 object-contain rounded border border-slate-300 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-rose-100 border border-rose-300 rounded flex flex-col items-center justify-center text-rose-700">
                      <FileText className="w-8 h-8" />
                      <span className="text-[9px] font-black uppercase mt-0.5">PDF</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB • Pronto para leitura com Gemini 3.8 Flash
                    </p>
                  </div>
                </div>

                <button
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full md:w-auto px-6 py-2.5 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-extrabold rounded-md shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{analysisStage || 'Analisando Documento PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>ANALISAR PDF E IDENTIFICAR MUDANÇAS</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#005a2b] animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Processando Documento PDF por Inteligência Artificial
            </h4>
            <p className="text-xs text-slate-600 font-medium">{analysisStage}</p>
            <div className="w-full max-w-md mx-auto bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#005a2b] h-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded-md flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {applySuccess && (
        <div className="bg-emerald-50 border-2 border-[#005a2b] rounded-lg p-6 text-center space-y-3 shadow-md animate-in fade-in duration-300">
          <CheckCircle className="w-12 h-12 text-[#005a2b] mx-auto" />
          <h3 className="text-lg font-black text-slate-900 uppercase">
            Alterações Aplicadas com Sucesso ao Banco de Dados!
          </h3>
          <p className="text-xs text-slate-700 max-w-xl mx-auto">
            Todas as mudanças identificadas no documento PDF foram registradas no sistema. Um snapshot de auditoria foi armazenado no Histórico de Versões.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onGoToOrganogram}
              className="px-5 py-2 bg-[#005a2b] hover:bg-[#004722] text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5"
            >
              <span>Ver Organograma Atualizado</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancelUpdate}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded"
            >
              Analisar Outro Arquivo PDF
            </button>
          </div>
        </div>
      )}

      {/* RELATÓRIO DE ANÁLISE: Informa todas as mudanças identificadas */}
      {report && !applySuccess && (
        <div className="bg-white border-2 border-black rounded-lg shadow-sm p-4 md:p-6 space-y-6">
          {/* Header of Report */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-[#005a2b]" />
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase">
                  RELATÓRIO DE MUDANÇAS IDENTIFICADAS NO PDF
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Arquivo analisado: <strong>{selectedFile?.name || 'Documento PDF'}</strong> • Data: <strong>{report.dataAnalise}</strong> • Confiança da IA: <strong>{report.confiancaMedia}%</strong>
              </p>
            </div>

            {/* Action Buttons: Confirm and Cancel */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelUpdate}
                disabled={isApplying}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded"
              >
                CANCELAR
              </button>

              <button
                onClick={handleConfirmAndApply}
                disabled={isApplying || approvedCount === 0}
                className={`px-5 py-2 text-xs font-black rounded shadow-md flex items-center space-x-1.5 transition-all ${
                  approvedCount > 0
                    ? 'bg-[#005a2b] hover:bg-[#004722] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>APLICANDO REGISTROS...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>CONFIRMAR E APLICAR ALTERAÇÕES ({approvedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statistics summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
              <span className="text-lg font-black text-slate-900">{report.totalIdentificados}</span>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Unidades no PDF</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-center">
              <span className="text-lg font-black text-amber-700">{report.totalAlteracoes}</span>
              <p className="text-[10px] font-bold text-amber-800 uppercase">Alterações Comandante</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-center">
              <span className="text-lg font-black text-blue-700">{report.totalContatosAtualizados}</span>
              <p className="text-[10px] font-bold text-blue-800 uppercase">Contatos Atualizados</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-center">
              <span className="text-lg font-black text-emerald-700">{report.totalNovas}</span>
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Novas Unidades</p>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-2.5 rounded text-center col-span-2 sm:col-span-1">
              <span className="text-lg font-black text-slate-600">{report.totalSemAlteracao}</span>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sem Alteração</p>
            </div>
          </div>

          {/* AI Observation Message */}
          <div className="bg-slate-50 border-l-4 border-[#005a2b] p-3 text-xs text-slate-700">
            <strong>Parecer Técnico da IA:</strong> {report.resumoIA}
          </div>

          {/* Table filter and batch controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-500 mr-1 text-[11px]">Filtrar:</span>
              {[
                { id: 'TODAS', label: 'Todas as Unidades' },
                { id: 'ALTERACOES', label: 'Somente com Mudanças' },
                { id: 'ALTERAÇÃO IDENTIFICADA', label: 'Comandante/Posto' },
                { id: 'CONTATO ATUALIZADO', label: 'Contatos' },
                { id: 'NOVA UNIDADE IDENTIFICADA', label: 'Novas Unidades' },
                { id: 'NENHUMA ALTERAÇÃO', label: 'Conformes (Sem Alteração)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    filterStatus === f.id
                      ? 'bg-[#005a2b] text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => selectAll(true)}
                className="text-[#005a2b] hover:underline font-bold"
              >
                Marcar Todos
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => selectAll(false)}
                className="text-slate-500 hover:underline font-medium"
              >
                Desmarcar Todos
              </button>
            </div>
          </div>

          {/* Informing what changed: Side-by-side Diff Cards */}
          <div className="space-y-3">
            {displayedDiffs.map((diff, idx) => {
              const originalIndex = diffItems.indexOf(diff);
              
              let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
              if (diff.status === 'ALTERAÇÃO IDENTIFICADA') {
                badgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
              } else if (diff.status === 'CONTATO ATUALIZADO') {
                badgeColor = 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
              } else if (diff.status === 'NOVA UNIDADE IDENTIFICADA') {
                badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
              } else if (diff.status === 'COMANDO TRANSFERIDO') {
                badgeColor = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
              }

              return (
                <div 
                  key={idx}
                  className={`border-2 rounded-lg p-3.5 transition-all ${
                    diff.aprovado ? 'border-[#005a2b] bg-white shadow-xs' : 'border-slate-300 bg-slate-50/70 opacity-80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={diff.aprovado}
                        onChange={() => toggleItemApproval(originalIndex)}
                        className="w-4 h-4 text-[#005a2b] focus:ring-[#005a2b] rounded cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-slate-900">{diff.identificacao}</span>
                          <span className="text-xs font-bold text-[#005a2b]">({diff.grandCommandSigla})</span>
                        </div>
                        {diff.dadosNovos.nome && (
                          <p className="text-[11px] text-slate-500 font-medium">{diff.dadosNovos.nome}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded border uppercase ${badgeColor}`}>
                        Situação: {diff.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border">
                        Confiança: {diff.confianca}%
                      </span>
                      {diff.requerConferencia && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Conferência Manual</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comparativo: ANTERIOR vs NOVO (Informando exatamente o que mudou) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                    {/* Informação Anterior */}
                    <div className="bg-slate-100/70 p-2.5 rounded border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Informação Anterior no Sistema
                      </p>
                      {diff.dadosAnteriores ? (
                        <div className="space-y-1 text-slate-700">
                          <p>
                            <span className="font-semibold text-slate-500">Comandante:</span>{' '}
                            <span className="font-bold text-slate-900">{diff.dadosAnteriores.comandante}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Telefone:</span>{' '}
                            <span className="font-mono">{diff.dadosAnteriores.telefone || 'Nenhum'}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Município Sede:</span>{' '}
                            <span>{diff.dadosAnteriores.municipio}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Comando:</span>{' '}
                            <span>{diff.dadosAnteriores.grandCommandSigla}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Unidade não constava no cadastro anterior.</p>
                      )}
                    </div>

                    {/* Nova Informação do PDF */}
                    <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-300">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#005a2b] mb-1.5">
                        Nova Informação Extraída do PDF
                      </p>
                      <div className="space-y-1 text-slate-800">
                        <p>
                          <span className="font-semibold text-slate-500">Novo Comandante:</span>{' '}
                          <span className={`font-bold ${diff.dadosAnteriores && diff.dadosAnteriores.comandante !== diff.dadosNovos.comandante ? 'text-amber-800 bg-amber-100 px-1 rounded font-black' : 'text-slate-900'}`}>
                            {diff.dadosNovos.comandante}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">Novo Telefone:</span>{' '}
                          <span className={`font-mono ${diff.dadosAnteriores && diff.dadosAnteriores.telefone !== diff.dadosNovos.telefone ? 'text-blue-800 bg-blue-100 px-1 rounded font-black' : 'text-slate-900'}`}>
                            {diff.dadosNovos.telefone || 'Nenhum'}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">Município Sede:</span>{' '}
                          <span>{diff.dadosNovos.municipio}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">Grande Comando:</span>{' '}
                          <span>{diff.dadosNovos.grandCommandSigla}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Confirmation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black">
            <p className="text-xs text-slate-600">
              Total de alterações marcadas para aplicação:{' '}
              <strong className="text-[#005a2b] font-black">{approvedCount} de {diffItems.length}</strong>
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelUpdate}
                disabled={isApplying}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded"
              >
                CANCELAR
              </button>

              <button
                onClick={handleConfirmAndApply}
                disabled={isApplying || approvedCount === 0}
                className={`px-5 py-2 text-xs font-black rounded shadow-md flex items-center space-x-1.5 ${
                  approvedCount > 0
                    ? 'bg-[#005a2b] hover:bg-[#004722] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>APLICANDO REGISTROS...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>CONFIRMAR E APLICAR ALTERAÇÕES ({approvedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
