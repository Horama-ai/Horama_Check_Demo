import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle2, X, MapPin, ChevronRight } from 'lucide-react';
import type { Issue } from '../types';
import { Card, Badge, Button, EmptyState } from '../components/ui';

interface IssuesProps {
  issues: Issue[];
}

export function Issues({ issues }: IssuesProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filteredIssues = issues.filter(issue => {
    if (filter === 'open') return issue.status === 'open' || issue.status === 'in_progress';
    if (filter === 'resolved') return issue.status === 'resolved' || issue.status === 'dismissed';
    return true;
  });

  const openCount = issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
  const criticalCount = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  const getSeverityConfig = (severity: Issue['severity']) => {
    switch (severity) {
      case 'critical': return { label: 'Critique', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-l-rose-400' };
      case 'major': return { label: 'Majeur', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-400' };
      case 'minor': return { label: 'Mineur', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-l-gray-400' };
      default: return { label: 'Info', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-400' };
    }
  };

  const getStatusConfig = (status: Issue['status']) => {
    switch (status) {
      case 'open': return { label: 'Ouvert', icon: AlertTriangle, color: 'text-rose-600' };
      case 'in_progress': return { label: 'En cours', icon: Clock, color: 'text-amber-600' };
      case 'resolved': return { label: 'Résolu', icon: CheckCircle2, color: 'text-emerald-600' };
      default: return { label: 'Rejeté', icon: X, color: 'text-gray-500' };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {criticalCount > 0 && (
            <Badge variant="danger">{criticalCount} critique{criticalCount > 1 ? 's' : ''}</Badge>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Écarts</h1>
        <p className="text-gray-500 mt-1">{openCount} écart{openCount > 1 ? 's' : ''} en attente de résolution</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Tous', count: issues.length },
          { id: 'open', label: 'Ouverts', count: openCount },
          { id: 'resolved', label: 'Résolus', count: issues.filter(i => i.status === 'resolved').length },
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-rose-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-rose-600">
            {issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length}
          </p>
          <p className="text-[10px] text-rose-600 uppercase">Critiques</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-amber-600">
            {issues.filter(i => i.severity === 'major' && i.status !== 'resolved').length}
          </p>
          <p className="text-[10px] text-amber-600 uppercase">Majeurs</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-gray-600">
            {issues.filter(i => i.severity === 'minor' && i.status !== 'resolved').length}
          </p>
          <p className="text-[10px] text-gray-500 uppercase">Mineurs</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extralight text-emerald-600">
            {issues.filter(i => i.status === 'resolved').length}
          </p>
          <p className="text-[10px] text-emerald-600 uppercase">Résolus</p>
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<CheckCircle2 className="w-12 h-12" />}
            title="Aucun écart"
            description={filter === 'open' ? "Tous les écarts ont été résolus" : "Aucun écart dans cette catégorie"}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue, idx) => {
            const severityConfig = getSeverityConfig(issue.severity);
            const statusConfig = getStatusConfig(issue.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`p-4 border-l-4 ${severityConfig.border} ${
                    issue.status === 'resolved' ? 'opacity-60' : ''
                  }`}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${severityConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className={`w-5 h-5 ${severityConfig.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={issue.severity === 'critical' ? 'danger' : issue.severity === 'major' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {severityConfig.label}
                        </Badge>
                        <span className={`text-xs ${statusConfig.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{issue.zoneName}</span>
                        <span>•</span>
                        <span>{formatTime(issue.createdAt)}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Issue Detail Modal - Fixed for mobile */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 z-50"
              onClick={() => setSelectedIssue(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-x-0 bottom-20 lg:bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 px-3 lg:px-0"
            >
              <div className="bg-white rounded-3xl lg:rounded-2xl w-full lg:max-w-lg max-h-[65vh] lg:max-h-[80vh] overflow-hidden shadow-xl flex flex-col">
                {/* Handle - Mobile only */}
                <div className="flex justify-center pt-3 pb-2 lg:hidden flex-shrink-0">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className={`p-5 lg:p-6 ${getSeverityConfig(selectedIssue.severity).bg} flex-shrink-0`}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant={selectedIssue.severity === 'critical' ? 'danger' : selectedIssue.severity === 'major' ? 'warning' : 'default'}
                    >
                      {getSeverityConfig(selectedIssue.severity).label}
                    </Badge>
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="p-2 hover:bg-white/50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedIssue.title}</h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedIssue.zoneName}</span>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedIssue.description}</p>

                  <div className="grid grid-cols-2 gap-4 mt-5 lg:mt-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Statut</p>
                      <div className={`flex items-center gap-2 ${getStatusConfig(selectedIssue.status).color}`}>
                        {(() => {
                          const Icon = getStatusConfig(selectedIssue.status).icon;
                          return <Icon className="w-4 h-4" />;
                        })()}
                        <span className="font-medium">{getStatusConfig(selectedIssue.status).label}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Signalé</p>
                      <p className="text-sm font-medium text-gray-900">{formatTime(selectedIssue.createdAt)}</p>
                    </div>
                  </div>

                  {selectedIssue.assignedTo && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assigné à</p>
                      <p className="text-sm font-medium text-gray-900">{selectedIssue.assignedTo}</p>
                    </div>
                  )}
                </div>

                {/* Actions - Fixed at bottom */}
                <div className="p-4 lg:p-5 border-t border-gray-100 space-y-3 flex-shrink-0 safe-area-bottom">
                  {selectedIssue.status === 'open' && (
                    <Button fullWidth>Marquer en cours</Button>
                  )}
                  {selectedIssue.status === 'in_progress' && (
                    <Button fullWidth>Marquer résolu</Button>
                  )}
                  <Button variant="ghost" fullWidth onClick={() => setSelectedIssue(null)}>
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
