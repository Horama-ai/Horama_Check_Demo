import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Menu,
  X,
  History
} from 'lucide-react';
import { BottomNav } from './components/ui';
import { Dashboard } from './pages/Dashboard';
import { Zones } from './pages/Zones';
import { Checkpoints } from './pages/Checkpoints';
import { Issues } from './pages/Issues';
import { Report } from './pages/Report';
import { AuditHistory } from './pages/History';
import { currentAudit, getAuditStats } from './data/audits';
import type { PageId } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = getAuditStats(currentAudit);

  const navItems = [
    { id: 'dashboard' as PageId, label: 'Accueil', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'zones' as PageId, label: 'Zones', icon: <MapPin className="w-5 h-5" /> },
    { id: 'checkpoints' as PageId, label: 'Contrôles', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'issues' as PageId, label: 'Écarts', icon: <AlertTriangle className="w-5 h-5" />, badge: stats.openIssues + stats.inProgressIssues },
    { id: 'report' as PageId, label: 'Rapport', icon: <FileText className="w-5 h-5" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard audit={currentAudit} stats={stats} onNavigate={setCurrentPage} />;
      case 'zones':
        return <Zones zones={currentAudit.zones} onNavigate={setCurrentPage} />;
      case 'checkpoints':
        return <Checkpoints zones={currentAudit.zones} />;
      case 'issues':
        return <Issues issues={currentAudit.issues} />;
      case 'report':
        return <Report audit={currentAudit} stats={stats} />;
      case 'history':
        return <AuditHistory onNavigate={setCurrentPage} />;
      default:
        return <Dashboard audit={currentAudit} stats={stats} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="font-extralight text-2xl text-gray-900 tracking-tight">HORAMA</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Check by Horama</div>
        </div>

        {/* Audit Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="px-3 py-2.5 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 truncate">{currentAudit.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{currentAudit.location} • {currentAudit.date.toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r" />
                )}
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage('history')}
              className={`relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                currentPage === 'history' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {currentPage === 'history' && (
                <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r" />
              )}
              <History className="w-5 h-5" />
              <span>Historique</span>
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-xs font-medium text-white">{currentAudit.auditor?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentAudit.auditor || 'Auditeur'}</p>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="font-semibold text-gray-900 text-sm">HORAMA Check</div>
            <div className="text-xs text-gray-500">{currentAudit.name}</div>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-gray-900/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <div className="font-extralight text-xl text-gray-900">HORAMA</div>
                  <div className="text-xs text-gray-500 font-medium uppercase">Check</div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100">
                <div className="px-3 py-2.5 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{currentAudit.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentAudit.location}</p>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {[...navItems, { id: 'history' as PageId, label: 'Historique', icon: <History className="w-5 h-5" /> }].map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        items={navItems}
        activeId={currentPage}
        onChange={(id) => setCurrentPage(id as PageId)}
      />
    </div>
  );
}

export default App;
