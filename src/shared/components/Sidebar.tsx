import { LayoutDashboard, Network, ClipboardList, Settings, Key, FileCode2, History, FileText, CreditCard } from 'lucide-react';
import Progress from './Progress';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { setActiveTab, ActiveTab } from '../../store/slices/uiSlice';
import { motion } from 'framer-motion';
import { defaultTransition } from '../../animations/variants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useUsage } from '../../hooks/useUsage';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state: RootState) => state.ui.activeTab);
  const workspaceName = useAppSelector((state: RootState) => state.workspace.currentWorkspaceName);
  const isReduced = useReducedMotion();
  const { usage } = useUsage();

  const menuItems: Array<{ id: ActiveTab; label: string; icon: any; category: 'WORKSPACE' | 'HISTORY' | 'CONFIGURE' }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'WORKSPACE' },
    { id: 'graph', label: 'Dependency Graph', icon: Network, category: 'WORKSPACE' },
    { id: 'jobs', label: 'Recent Jobs', icon: ClipboardList, category: 'WORKSPACE' },
    { id: 'history', label: 'Migration History', icon: History, category: 'HISTORY' },
    { id: 'reports', label: 'Reports', icon: FileText, category: 'HISTORY' },
    { id: 'targets', label: 'Target Frameworks', icon: Settings, category: 'CONFIGURE' },
    { id: 'apiKeys', label: 'API Keys', icon: Key, category: 'CONFIGURE' },
    { id: 'billing', label: 'Billing', icon: CreditCard, category: 'CONFIGURE' },
  ];

  const categories: Array<{ key: 'WORKSPACE' | 'HISTORY' | 'CONFIGURE'; label: string }> = [
    { key: 'WORKSPACE', label: 'Workspace' },
    { key: 'HISTORY', label: 'Data' },
    { key: 'CONFIGURE', label: 'Configure' },
  ];

  return (
    <aside className={`bg-[#08080E] border-r border-[#1E1F35] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex flex-col flex-1 py-6 ${collapsed ? 'px-3' : 'px-4'}`}>
        {/* Logo Section */}
        <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <motion.div 
            whileHover={isReduced ? {} : { rotate: 8, scale: 1.05 }}
            className="p-2.5 bg-gradient-to-br from-primary to-[#A68CFF] text-white rounded-xl shadow-glow cursor-pointer"
          >
            <FileCode2 className="w-5 h-5" />
          </motion.div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide leading-none">Migration Studio</h2>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider block mt-1 uppercase">AST • AI • V1.0</span>
            </div>
          )}
        </div>

        {/* Workspace Badge */}
        {!collapsed && workspaceName && (
          <div className="mb-5 px-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/15 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-primary/70 shrink-0" />
              <span className="text-[11px] font-semibold text-primary/90 truncate">{workspaceName}</span>
            </div>
          </div>
        )}

        {/* Menu Categories */}
        <nav className="space-y-5 flex-1">
          {categories.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              {!collapsed && (
                <span className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase px-2 mb-2 font-mono">
                  {label}
                </span>
              )}
              <ul className="space-y-1">
                {menuItems
                  .filter((item) => item.category === key)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id} className="relative">
                        <button
                          onClick={() => dispatch(setActiveTab(item.id))}
                          className={`w-full flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all group relative ${
                            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                          } ${
                            isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                          title={collapsed ? item.label : undefined}
                        >
                          {/* Sliding Active Indicator Bubble */}
                          {isActive && (
                            <motion.span
                              layoutId="sidebarActiveBubble"
                              className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl shadow-glow-sm pointer-events-none"
                              transition={defaultTransition}
                            />
                          )}
                          <Icon className={`w-4 h-4 shrink-0 relative z-10 transition-transform group-hover:scale-115 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`} />
                          {!collapsed && <span className="relative z-10">{item.label}</span>}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section - Live Usage */}
      {!collapsed && (
        <div className="p-4 border-t border-[#1E1F35] bg-[#07070C]">
          <div className="bg-[#0B0B12]/50 border border-[#1E1F35] rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-semibold uppercase tracking-wider font-mono">Monthly runs</span>
              <span className="font-mono text-gray-500">
                <strong className="text-success font-bold">{usage?.jobCount ?? 0}</strong> / {usage?.totalMigrations ?? 100}
              </span>
            </div>
            <Progress value={usage?.jobCount ?? 0} max={usage?.totalMigrations ?? 100} size="sm" />
          </div>
        </div>
      )}
    </aside>
  );
}

