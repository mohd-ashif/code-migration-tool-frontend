import { LayoutDashboard, Network, ClipboardList, Settings, Key, FileCode2 } from 'lucide-react';
import Progress from './Progress';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { setActiveTab, ActiveTab } from '../../store/slices/uiSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state: RootState) => state.ui.activeTab);

  const menuItems: Array<{ id: ActiveTab; label: string; icon: any; category: 'WORKSPACE' | 'CONFIGURE' }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'WORKSPACE' },
    { id: 'graph', label: 'Dependency Graph', icon: Network, category: 'WORKSPACE' },
    { id: 'jobs', label: 'Recent Jobs', icon: ClipboardList, category: 'WORKSPACE' },
    { id: 'targets', label: 'Target Frameworks', icon: Settings, category: 'CONFIGURE' },
    { id: 'apiKeys', label: 'API Keys', icon: Key, category: 'CONFIGURE' },
  ];

  const categories = ['WORKSPACE', 'CONFIGURE'];

  return (
    <aside className="w-64 bg-darkSidebar border-r border-[#1E1F35] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div className="flex flex-col flex-1 py-6 px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="p-2.5 bg-gradient-to-br from-[#7C6CFF] to-[#A68CFF] text-white rounded-xl shadow-glow">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide leading-none">Migration Studio</h2>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider block mt-1 uppercase">AST • AI • V1.0</span>
          </div>
        </div>

        {/* Menu Categories */}
        <nav className="space-y-6 flex-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1.5">
              <span className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase px-2 mb-2 font-mono">
                {cat}
              </span>
              <ul className="space-y-1">
                {menuItems
                  .filter((item) => item.category === cat)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => dispatch(setActiveTab(item.id))}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group relative ${
                            isActive
                              ? 'bg-[#7C6CFF]/10 text-white border border-[#7C6CFF]/20 shadow-glow'
                              : 'text-gray-400 hover:text-white hover:bg-[#1E1F35]/50 border border-transparent'
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#7C6CFF] shadow-glow" />
                          )}
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#7C6CFF]' : 'text-gray-400 group-hover:text-white'}`} />
                          {item.label}
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
      <div className="p-4 border-t border-[#1E1F35] bg-[#0E0F1A]/80">
        <div className="bg-[#12131F]/50 border border-[#1E1F35] rounded-xl p-3.5 space-y-2.5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 font-semibold uppercase tracking-wider font-mono">Monthly runs</span>
            <span className="font-mono text-gray-500">
              <strong className="text-[#16C784]">340</strong> / 1000
            </span>
          </div>
          <Progress value={340} max={1000} size="sm" />
        </div>
      </div>
    </aside>
  );
}
