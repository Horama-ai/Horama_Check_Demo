import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, ChevronDown, Camera, MessageSquare } from 'lucide-react';
import type { Zone, Checkpoint, CheckStatus } from '../types';
import { Card, Badge, StatusIndicator, Button } from '../components/ui';

interface CheckpointsProps {
  zones: Zone[];
}

export function Checkpoints({ zones }: CheckpointsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'failed'>('all');
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);

  // Flatten all checkpoints with zone info
  const allCheckpoints = zones.flatMap(zone =>
    zone.checkpoints.map(cp => ({ ...cp, zoneName: zone.shortName }))
  );

  // Group by zone
  const groupedByZone = zones.map(zone => ({
    ...zone,
    filteredCheckpoints: zone.checkpoints.filter(cp => {
      if (filter === 'pending') return cp.status === 'pending';
      if (filter === 'failed') return cp.status === 'failed' || cp.status === 'warning';
      return true;
    })
  })).filter(zone => zone.filteredCheckpoints.length > 0);

  const getStatusAction = (status: CheckStatus) => {
    switch (status) {
      case 'passed': return { label: 'Conforme', color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'failed': return { label: 'Non conforme', color: 'text-rose-600', bg: 'bg-rose-100' };
      case 'warning': return { label: 'À vérifier', color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'na': return { label: 'N/A', color: 'text-gray-600', bg: 'bg-gray-100' };
      default: return { label: 'En attente', color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Contrôles</h1>
        <p className="text-gray-500 mt-1">{allCheckpoints.length} points de contrôle</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Tous', count: allCheckpoints.length },
          { id: 'pending', label: 'En attente', count: allCheckpoints.filter(c => c.status === 'pending').length },
          { id: 'failed', label: 'Non conformes', count: allCheckpoints.filter(c => c.status === 'failed' || c.status === 'warning').length },
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

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-emerald-600">
            {allCheckpoints.filter(c => c.status === 'passed').length}
          </p>
          <p className="text-[10px] text-emerald-600 uppercase">OK</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-rose-600">
            {allCheckpoints.filter(c => c.status === 'failed').length}
          </p>
          <p className="text-[10px] text-rose-600 uppercase">KO</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-amber-600">
            {allCheckpoints.filter(c => c.status === 'warning').length}
          </p>
          <p className="text-[10px] text-amber-600 uppercase">Att.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-gray-500">
            {allCheckpoints.filter(c => c.status === 'pending').length}
          </p>
          <p className="text-[10px] text-gray-500 uppercase">Rest.</p>
        </div>
      </div>

      {/* Checkpoints grouped by zone */}
      <div className="space-y-3">
        {groupedByZone.map((zone) => (
          <Card key={zone.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <StatusIndicator
                  status={zone.status}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">{zone.shortName}</p>
                  <p className="text-xs text-gray-500">
                    {zone.filteredCheckpoints.length} contrôle{zone.filteredCheckpoints.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedZone === zone.id ? 'rotate-180' : ''
              }`} />
            </button>

            <AnimatePresence>
              {expandedZone === zone.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {zone.filteredCheckpoints.map((checkpoint) => (
                      <div
                        key={checkpoint.id}
                        className="p-4 flex items-start gap-3"
                        onClick={() => setSelectedCheckpoint(checkpoint)}
                      >
                        <StatusIndicator status={checkpoint.status} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{checkpoint.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{checkpoint.criteria}</p>
                        </div>
                        <Badge variant={
                          checkpoint.status === 'passed' ? 'success' :
                          checkpoint.status === 'failed' ? 'danger' :
                          checkpoint.status === 'warning' ? 'warning' : 'default'
                        } size="sm">
                          {getStatusAction(checkpoint.status).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Checkpoint Action Modal */}
      <AnimatePresence>
        {selectedCheckpoint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 z-50"
              onClick={() => setSelectedCheckpoint(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 z-50"
            >
              <div className="bg-white rounded-t-3xl shadow-xl safe-area-bottom">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                <div className="px-5 pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Point de contrôle</p>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedCheckpoint.description}</h3>
                  <p className="text-sm text-gray-500 mt-2">{selectedCheckpoint.criteria}</p>
                </div>

                {/* Quick Actions */}
                <div className="p-4 grid grid-cols-4 gap-3">
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 active:bg-emerald-100 transition-colors">
                    <Check className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Conforme</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-rose-50 active:bg-rose-100 transition-colors">
                    <X className="w-6 h-6 text-rose-600" />
                    <span className="text-xs font-medium text-rose-700">Non conf.</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-50 active:bg-amber-100 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">À vérifier</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors">
                    <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-medium">N/A</span>
                    <span className="text-xs font-medium text-gray-600">N/A</span>
                  </button>
                </div>

                {/* Additional Actions */}
                <div className="px-4 pb-4 flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 text-gray-700">
                    <Camera className="w-5 h-5" />
                    <span className="text-sm font-medium">Photo</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 text-gray-700">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">Note</span>
                  </button>
                </div>

                <div className="px-4 pb-6">
                  <Button variant="ghost" fullWidth onClick={() => setSelectedCheckpoint(null)}>
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
