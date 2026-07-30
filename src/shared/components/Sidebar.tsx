import { useEffect } from 'react';
import { LayoutDashboard, Network, ClipboardList, Settings, Key, FileCode2, History, FileText, CreditCard, X } from 'lucide-react';
import Progress from './Progress';
import WorkspaceSelector from './WorkspaceSelector';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { setActiveTab, setMobileSidebarOpen, ActiveTab } from '../../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultTransition } from '../../animations/variants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useUsage } from '../../hooks/useUsage';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state: RootState) => state.ui.activeTab);
  const collapsed = useAppSelector((state: RootState) => state.ui.isSidebarCollapsed);
  const isMobileOpen = useAppSelector((state: RootState) => state.ui.isMobileSidebarOpen);
  const isReduced = useReducedMotion();
  const { usage } = useUsage();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const systemRole = (user as any)?.systemRole || (user as any)?.system_role;
  const isAdmin = systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN';

  // ESC key handler for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        dispatch(setMobileSidebarOpen(false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, dispatch]);

  const handleTabClick = (tabId: ActiveTab) => {
    dispatch(setActiveTab(tabId));
    dispatch(setMobileSidebarOpen(false));
  };

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

  const renderContent = (isMobile: boolean = false) => {
    const isCollapsedState = isMobile ? false : collapsed;
    return (
      <div className="flex flex-col h-full justify-between select-none">
        <div className={`flex flex-col flex-1 py-6 ${isCollapsedState ? 'px-3' : 'px-4'}`}>
          {/* Logo Section */}
          <div className={`flex items-center justify-between mb-8 px-2`}>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={isReduced ? {} : { rotate: 8, scale: 1.05 }}
                className="p-2.5 bg-gradient-to-br from-primary to-[#A68CFF] text-white rounded-xl shadow-glow cursor-pointer"
              >
                <FileCode2 className="w-5 h-5" />
              </motion.div>
              {!isCollapsedState && (
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide leading-none">Migration Studio</h2>
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider block mt-1 uppercase">AST • AI • V1.0</span>
                </div>
              )}
            </div>

            {isMobile && (
              <button
                onClick={() => dispatch(setMobileSidebarOpen(false))}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1E1F35] rounded-xl transition-all"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Workspace Selector Dropdown */}
          <WorkspaceSelector collapsed={isCollapsedState} />

          {/* Menu Categories */}
          <nav className="space-y-5 flex-1 mt-4">
            {categories.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                {!isCollapsedState && (
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
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all group relative ${
                              isCollapsedState ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                            } ${
                              isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
                            }`}
                            title={isCollapsedState ? item.label : undefined}
                          >
                            {/* Sliding Active Indicator Bubble */}
                            {isActive && (
                              <motion.span
                                layoutId={isMobile ? 'mobileSidebarActiveBubble' : 'sidebarActiveBubble'}
                                className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl shadow-glow-sm pointer-events-none"
                                transition={defaultTransition}
                              />
                            )}
                            <Icon className={`w-4 h-4 shrink-0 relative z-10 transition-transform group-hover:scale-115 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`} />
                            {!isCollapsedState && <span className="relative z-10">{item.label}</span>}
                          </button>
                        </li>
                      );
                    })}

                  {key === 'CONFIGURE' && isAdmin && (
                    <li>
                      <a
                        href="/admin"
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(setMobileSidebarOpen(false));
                          window.history.pushState({}, '', '/admin');
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className={`w-full flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all text-indigo-300 hover:bg-indigo-500/10 cursor-pointer ${
                          isCollapsedState ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                        }`}
                        title={isCollapsedState ? 'Admin Panel' : undefined}
                      >
                        <Settings className="w-4 h-4 shrink-0 text-indigo-400" />
                        {!isCollapsedState && <span>Admin Panel</span>}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section - Live Usage */}
        {!isCollapsedState && (
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
      </div>
    );
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className={`hidden md:flex bg-[#08080E] border-r border-[#1E1F35] flex-col justify-between h-screen sticky top-0 shrink-0 select-none transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => dispatch(setMobileSidebarOpen(false))}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
              aria-hidden="true"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-72 max-w-[80vw] bg-[#08080E] border-r border-[#1E1F35] h-full shadow-2xl z-10 overflow-y-auto"
            >
              {renderContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
