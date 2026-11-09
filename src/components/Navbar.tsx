import React from 'react';
import { 
  Network, 
  ShieldAlert, 
  Building, 
  MapPin, 
  Users, 
  Image as ImageIcon, 
  Sparkles, 
  FileText, 
  History, 
  Settings 
} from 'lucide-react';
import { UserRole } from '../types/organogram';

export type NavTab = 
  | 'organograma'
  | 'comandos'
  | 'unidades'
  | 'municipios'
  | 'comandantes'
  | 'emblemas'
  | 'atualizacao_ia'
  | 'relatorios'
  | 'historico'
  | 'configuracoes';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  role: UserRole;
  pendingChangesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  role,
  pendingChangesCount = 0
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean; badge?: string }[] = [
    {
      id: 'organograma',
      label: 'Organograma Completo',
      icon: <Network className="w-4 h-4" />
    },
    {
      id: 'atualizacao_ia',
      label: 'Atualização por PDF (IA)',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      badge: pendingChangesCount > 0 ? `${pendingChangesCount}` : 'NOVO'
    },
    {
      id: 'comandos',
      label: 'Grandes Comandos (CPAI)',
      icon: <ShieldAlert className="w-4 h-4" />
    },
    {
      id: 'unidades',
      label: 'Unidades e Batalhões',
      icon: <Building className="w-4 h-4" />
    },
    {
      id: 'municipios',
      label: 'Municípios',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'comandantes',
      label: 'Comandantes e Contatos',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'emblemas',
      label: 'Gerenciamento de Emblemas',
      icon: <ImageIcon className="w-4 h-4" />
    },
    {
      id: 'relatorios',
      label: 'Relatórios & Estatísticas',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'historico',
      label: 'Histórico & Rollback',
      icon: <History className="w-4 h-4" />
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
      adminOnly: true
    }
  ];

  return (
    <nav className="bg-slate-900 text-slate-200 border-b border-slate-800 shadow-inner px-2 py-1 overflow-x-auto scrollbar-none print:hidden">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 min-w-max">
        {navItems.map((item) => {
          if (item.adminOnly && role !== 'ADMINISTRADOR') return null;

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-semibold transition-all relative ${
                isActive
                  ? 'bg-[#005a2b] text-white shadow-xs font-bold border-b-2 border-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase ml-1 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
