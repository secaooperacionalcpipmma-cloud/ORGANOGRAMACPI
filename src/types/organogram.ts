export interface SubUnit {
  id: string;
  tipo: 'Companhia' | 'Pelotão' | 'Destacamento' | 'Grupamento' | 'Outro';
  nome: string;
  municipio: string;
  responsavel?: string;
  contato?: string;
}

export interface SubordinateUnit {
  id: string;
  identificacao: string; // e.g. "15º BPM"
  tipo: 'Batalhão' | 'Companhia Independente' | 'Comando Especializado' | 'CIMT' | 'EPMONT' | 'BMT' | 'Outro';
  nome: string; // e.g. "15º Batalhão de Polícia Militar"
  grandCommandId: string; // e.g. "cpa-i-1"
  municipio: string; // e.g. "Bacabal"
  municipiosJurisdicao?: string[];
  comandante: string; // e.g. "TEN CEL QOEM LEILA"
  posto: string; // e.g. "TEN CEL QOEM"
  telefone: string; // e.g. "(99) 98103-6565"
  email?: string;
  emblemaUrl?: string;
  subunidades?: SubUnit[];
  observacoes?: string;
  emRegulamentacao?: boolean;
}

export interface GrandCommand {
  id: string;
  sigla: string; // e.g. "CPAI-1" or "CPA I - 1"
  nome: string; // e.g. "Comando de Policiamento de Área do Interior - 1"
  comandante: string;
  posto: string;
  telefone: string;
  email: string;
  municipioSede: string;
  emblemaUrl: string;
  ordem: number;
  regiao?: string;
}

export interface TopCommandInfo {
  titulo: string;
  subtitulo: string;
  instituicao: string;
  sigla: string;
  comandanteGeral: string;
  comandanteCPI: string;
  sede: string;
  contato: string;
  email: string;
  dataAtualizacao: string;
  emblemaPrincipalUrl?: string;
}

export type ChangeStatus = 
  | 'ALTERAÇÃO IDENTIFICADA'
  | 'CONTATO ATUALIZADO'
  | 'NOVA UNIDADE IDENTIFICADA'
  | 'COMANDO TRANSFERIDO'
  | 'NENHUMA ALTERAÇÃO'
  | 'CONFERÊNCIA MANUAL RECOMENDADA';

export interface UnitDiffItem {
  identificacao: string;
  unitId?: string;
  grandCommandSigla: string;
  status: ChangeStatus;
  campoModificado?: string[];
  confianca: number; // 0-100
  requerConferencia: boolean;
  dadosAnteriores?: {
    identificacao: string;
    grandCommandSigla: string;
    nome: string;
    comandante: string;
    posto: string;
    municipio: string;
    telefone: string;
    email: string;
  } | null;
  dadosNovos: {
    identificacao: string;
    grandCommandSigla: string;
    nome?: string;
    comandante: string;
    posto?: string;
    municipio: string;
    telefone: string;
    email?: string;
  };
  aprovado: boolean;
}

export interface AIAnalysisReport {
  id: string;
  dataAnalise: string;
  totalIdentificados: number;
  totalAlteracoes: number;
  totalNovas: number;
  totalContatosAtualizados: number;
  totalSemAlteracao: number;
  totalRequerConferencia: number;
  confiancaMedia: number;
  itens: UnitDiffItem[];
  imagemUrl?: string;
  resumoIA: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  usuario: string;
  tipoAcao: 'ATUALIZAÇÃO POR PDF IA' | 'ATUALIZAÇÃO POR PRINT IA' | 'EDIÇÃO MANUAL' | 'RESTAURAÇÃO' | 'IMPORTAÇÃO';
  descricao: string;
  totalAlteracoes: number;
  imagemUrl?: string;
  snapshot: {
    topCommand: TopCommandInfo;
    commands: GrandCommand[];
    units: SubordinateUnit[];
    timestamp: string;
  };
}

export interface OrganogramDatabase {
  topCommand: TopCommandInfo;
  commands: GrandCommand[];
  units: SubordinateUnit[];
  history: HistoryRecord[];
  lastUpdated: string;
}

export type UserRole = 'ADMINISTRADOR' | 'CONSULTA';
