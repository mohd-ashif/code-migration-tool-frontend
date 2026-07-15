import { LayoutDashboard, Network, ClipboardList, Settings, Key, FileCode2 } from 'lucide-react';
import Progress from './Progress';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { setActiveTab, ActiveTab } from '../../store/slices/uiSlice';
import { motion } from 'framer-motion';
import { defaultTransition } from '../../animations/variants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state: RootState) => state.ui.activeTab);
  const isReduced = useReducedMotion();

  const menuItems: Array<{ id: ActiveTab; label: string; icon: any; category: 'WORKSPACE' | 'CONFIGURE' }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'WORKSPACE' },
    { id: 'graph', label: 'Dependency Graph', icon: Network, category: 'WORKSPACE' },
    { id: 'jobs', label: 'Recent Jobs', icon: ClipboardList, category: 'WORKSPACE' },
    { id: 'targets', label: 'Target Frameworks', icon: Settings, category: 'CONFIGURE' },
    { id: 'apiKeys', label: 'API Keys', icon: Key, category: 'CONFIGURE' },
  ];

  const categories = ['WORKSPACE', 'CONFIGURE'];

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

        {/* Menu Categories */}
        <nav className="space-y-6 flex-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1.5">
              {!collapsed && (
                <span className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase px-2 mb-2 font-mono">
                  {cat}
                </span>
              )}
              <ul className="space-y-1">
                {menuItems
                  .filter((item) => item.category === cat)
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

      {/* Bottom Section - Monthly Runs */}
      {!collapsed && (
        <div className="p-4 border-t border-[#1E1F35] bg-[#07070C]">
          <div className="bg-[#0B0B12]/50 border border-[#1E1F35] rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-semibold uppercase tracking-wider font-mono">Monthly runs</span>
              <span className="font-mono text-gray-500">
                <strong className="text-success font-bold">340</strong> / 1000
              </span>
            </div>
            <Progress value={340} max={1000} size="sm" />
          </div>
        </div>
      )}
    </aside>
  );
}
