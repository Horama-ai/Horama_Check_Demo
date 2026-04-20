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
  History,
  ChevronDown,
  Calendar,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { BottomNav } from './components/ui';
import { Dashboard } from './pages/Dashboard';
import { Zones } from './pages/Zones';
import { Checkpoints } from './pages/Checkpoints';
import { Issues } from './pages/Issues';
import { Report } from './pages/Report';
import { AuditHistory } from './pages/History';
import { stages, getAuditStats, getLiveStage } from './data/audits';
import type { PageId, Stage } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>(getLiveStage()?.id || stages[0].id);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);

  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];
  const audit = selectedStage.audit;
  const stats = audit ? getAuditStats(audit) : null;

  const navItems = [
    { id: 'dashboard' as PageId, label: 'Accueil', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'zones' as PageId, label: 'Zones', icon: <MapPin className="w-5 h-5" /> },
    { id: 'checkpoints' as PageId, label: 'Contrôles', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'issues' as PageId, label: 'Écarts', icon: <AlertTriangle className="w-5 h-5" />, badge: stats?.openIssues },
    { id: 'report' as PageId, label: 'Rapport', icon: <FileText className="w-5 h-5" /> },
  ];

  const getStageStatusIcon = (status: Stage['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'live': return <Radio className="w-4 h-4 text-rose-500" />;
      case 'upcoming': return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Navigate to checkpoint detail
  const handleNavigateToCheckpoint = (checkpointId: string) => {
    setSelectedCheckpointId(checkpointId);
    setCurrentPage('checkpoints');
  };

  const renderPage = () => {
    if (!audit || !stats) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">Étape à venir</p>
            <p className="text-sm text-gray-400 mt-1">L'audit n'a pas encore commencé</p>
            <p className="text-sm text-gray-500 mt-4">
              {selectedStage.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard audit={audit} stats={stats} onNavigate={setCurrentPage} stages={stages} selectedStageId={selectedStageId} onStageSelect={setSelectedStageId} />;
      case 'zones':
        return <Zones zones={audit.zones} onNavigateToCheckpoint={handleNavigateToCheckpoint} />;
      case 'checkpoints':
        return <Checkpoints zones={audit.zones} selectedCheckpointId={selectedCheckpointId} onClearSelection={() => setSelectedCheckpointId(null)} />;
      case 'issues':
        return <Issues issues={audit.issues} />;
      case 'report':
        return <Report audit={audit} stats={stats} />;
      case 'history':
        return <AuditHistory onNavigate={setCurrentPage} />;
      default:
        return <Dashboard audit={audit} stats={stats} onNavigate={setCurrentPage} stages={stages} selectedStageId={selectedStageId} onStageSelect={setSelectedStageId} />;
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

        {/* Stage Selector */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <button
              onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getStageStatusIcon(selectedStage.status)}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedStage.name}</p>
                  <p className="text-xs text-gray-500">{selectedStage.location}</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${stageDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {stageDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto"
                >
                  {/* Live Stage */}
                  {stages.filter(s => s.status === 'live').length > 0 && (
                    <div className="p-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">En direct</p>
                      {stages.filter(s => s.status === 'live').map(stage => (
                        <button
                          key={stage.id}
                          onClick={() => { setSelectedStageId(stage.id); setStageDropdownOpen(false); }}
                          className={`w-full px-2 py-2 rounded-lg flex items-center gap-2 text-left ${selectedStageId === stage.id ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
                        >
                          <Radio className="w-4 h-4 text-rose-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                            <p className="text-xs text-gray-500">{stage.location}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Completed Stages */}
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">Terminées</p>
                    {stages.filter(s => s.status === 'completed').map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => { setSelectedStageId(stage.id); setStageDropdownOpen(false); }}
                        className={`w-full px-2 py-2 rounded-lg flex items-center gap-2 text-left ${selectedStageId === stage.id ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                          <p className="text-xs text-gray-500">{stage.location} • {stage.audit?.passRate}%</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Upcoming Stages */}
                  <div className="p-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">À venir</p>
                    {stages.filter(s => s.status === 'upcoming').map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => { setSelectedStageId(stage.id); setStageDropdownOpen(false); }}
                        className={`w-full px-2 py-2 rounded-lg flex items-center gap-2 text-left ${selectedStageId === stage.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stage.name}</p>
                          <p className="text-xs text-gray-400">{stage.location} • {stage.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
              <span className="flex-1 text-left">Historique</span>
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium">
              J
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Jean-Pierre M.</p>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
          >
            {getStageStatusIcon(selectedStage.status)}
            <span className="text-sm font-medium text-gray-900">{selectedStage.name}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${stageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className="w-10" />
        </div>

        {/* Mobile Stage Dropdown */}
        <AnimatePresence>
          {stageDropdownOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/20 z-40"
                onClick={() => setStageDropdownOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[60vh] overflow-y-auto"
              >
                {/* Same content as desktop dropdown */}
                {stages.filter(s => s.status === 'live').length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">En direct</p>
                    {stages.filter(s => s.status === 'live').map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => { setSelectedStageId(stage.id); setStageDropdownOpen(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left ${selectedStageId === stage.id ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
                      >
                        <Radio className="w-5 h-5 text-rose-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                          <p className="text-xs text-gray-500">{stage.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">Terminées</p>
                  {stages.filter(s => s.status === 'completed').map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => { setSelectedStageId(stage.id); setStageDropdownOpen(false); }}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left ${selectedStageId === stage.id ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                        <p className="text-xs text-gray-500">{stage.location} • {stage.audit?.passRate}%</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">À venir</p>
                  {stages.filter(s => s.status === 'upcoming').map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => { setSelectedStageId(stage.id); setStageDropdownOpen(false); }}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left ${selectedStageId === stage.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stage.name}</p>
                        <p className="text-xs text-gray-400">{stage.location}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div>
                  <div className="font-extralight text-xl text-gray-900 tracking-tight">HORAMA</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Check</div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl ${
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setCurrentPage('history'); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl ${
                      currentPage === 'history' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <History className="w-5 h-5" />
                    <span>Historique</span>
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        {renderPage()}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav
        items={navItems}
        activeId={currentPage}
        onChange={(id) => setCurrentPage(id as PageId)}
      />
    </div>
  );
}

export default App;
