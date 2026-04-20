import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, AlertTriangle, Clock, X } from 'lucide-react';
import type { Zone, PageId } from '../types';
import { Card, Badge, Progress, StatusIndicator, Button } from '../components/ui';

interface ZonesProps {
  zones: Zone[];
  onNavigate: (page: PageId) => void;
}

export function Zones({ zones }: ZonesProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'issues'>('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const filteredZones = zones.filter(zone => {
    if (filter === 'pending') return zone.completedChecks < zone.totalChecks;
    if (filter === 'issues') return zone.status === 'failed' || zone.status === 'warning';
    return true;
  });

  const getZoneIcon = (zone: Zone) => {
    if (zone.status === 'passed') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (zone.status === 'failed') return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (zone.status === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getZoneTypeLabel = (type: Zone['type']) => {
    const labels = {
      entrance: 'Entrée',
      exit: 'Sortie',
      pathway: 'Cheminement',
      sensitive: 'Zone sensible',
      barrier: 'Barriérage',
      signage: 'Signalétique',
      general: 'Général',
    };
    return labels[type];
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Zones</h1>
        <p className="text-gray-500 mt-1">{zones.length} zones à auditer</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Toutes', count: zones.length },
          { id: 'pending', label: 'À compléter', count: zones.filter(z => z.completedChecks < z.totalChecks).length },
          { id: 'issues', label: 'Avec écarts', count: zones.filter(z => z.status === 'failed' || z.status === 'warning').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Zones List */}
      <div className="space-y-3">
        {filteredZones.map((zone, idx) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card
              className="p-4 lg:p-5"
              onClick={() => setSelectedZone(zone)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center ${
                  zone.status === 'passed' ? 'bg-emerald-50' :
                  zone.status === 'failed' ? 'bg-rose-50' :
                  zone.status === 'warning' ? 'bg-amber-50' : 'bg-gray-50'
                }`}>
                  {getZoneIcon(zone)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm lg:text-base font-medium text-gray-900 truncate">{zone.shortName}</p>
                    <Badge variant={
                      zone.status === 'passed' ? 'success' :
                      zone.status === 'failed' ? 'danger' :
                      zone.status === 'warning' ? 'warning' : 'default'
                    } size="sm">
                      {zone.status === 'passed' ? 'OK' :
                       zone.status === 'failed' ? 'KO' :
                       zone.status === 'warning' ? 'Att.' : 'En cours'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{zone.name}</p>
                  <div className="mt-2">
                    <Progress value={zone.completedChecks} max={zone.totalChecks} size="sm" />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg lg:text-xl font-light text-gray-900">
                    {zone.completedChecks}/{zone.totalChecks}
                  </p>
                  <p className="text-xs text-gray-500">contrôles</p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 hidden lg:block" />
              </div>

              {zone.issues > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="text-sm text-rose-600">{zone.issues} écart{zone.issues > 1 ? 's' : ''} signalé{zone.issues > 1 ? 's' : ''}</span>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Zone Detail Modal */}
      <AnimatePresence>
        {selectedZone && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 z-50"
              onClick={() => setSelectedZone(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50"
            >
              <div className="bg-white rounded-t-3xl lg:rounded-2xl w-full lg:max-w-2xl max-h-[85vh] lg:max-h-[80vh] overflow-hidden shadow-xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{getZoneTypeLabel(selectedZone.type)}</p>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedZone.shortName}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)] lg:max-h-[calc(80vh-80px)]">
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Progression</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((selectedZone.completedChecks / selectedZone.totalChecks) * 100)}%
                      </span>
                    </div>
                    <Progress value={selectedZone.completedChecks} max={selectedZone.totalChecks} size="lg" />
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedZone.completedChecks} sur {selectedZone.totalChecks} contrôles effectués
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-extralight text-emerald-500">
                        {selectedZone.checkpoints.filter(cp => cp.status === 'passed').length}
                      </p>
                      <p className="text-xs text-gray-500">Conformes</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-extralight text-rose-500">
                        {selectedZone.checkpoints.filter(cp => cp.status === 'failed').length}
                      </p>
                      <p className="text-xs text-gray-500">Non conformes</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-extralight text-gray-500">
                        {selectedZone.checkpoints.filter(cp => cp.status === 'pending').length}
                      </p>
                      <p className="text-xs text-gray-500">En attente</p>
                    </div>
                  </div>

                  {/* Checkpoints List */}
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Points de contrôle</h3>
                  <div className="space-y-2">
                    {selectedZone.checkpoints.map((checkpoint) => (
                      <div
                        key={checkpoint.id}
                        className={`p-4 rounded-xl border ${
                          checkpoint.status === 'passed' ? 'border-emerald-200 bg-emerald-50/50' :
                          checkpoint.status === 'failed' ? 'border-rose-200 bg-rose-50/50' :
                          checkpoint.status === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                          'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <StatusIndicator status={checkpoint.status} size="md" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{checkpoint.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{checkpoint.criteria}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
                  <Button fullWidth onClick={() => setSelectedZone(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
