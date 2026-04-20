import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react';
import type { Audit } from '../types';
import { Card, Badge, Progress, Button } from '../components/ui';

interface ReportProps {
  audit: Audit;
  stats: {
    totalZones: number;
    completedZones: number;
    totalChecks: number;
    completedChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
    pendingChecks: number;
    openIssues: number;
    criticalIssues: number;
    passRate: number;
  };
}

export function Report({ audit, stats }: ReportProps) {
  const progressPercent = Math.round((stats.completedChecks / stats.totalChecks) * 100);

  const getGlobalStatus = () => {
    if (progressPercent < 100) return { label: 'En cours', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (stats.passRate >= 90) return { label: 'Conforme', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (stats.passRate >= 70) return { label: 'Partiellement conforme', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Non conforme', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const globalStatus = getGlobalStatus();

  // Critical issues list
  const criticalIssues = audit.issues.filter(i => i.severity === 'critical' && i.status !== 'resolved');

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Rapport</h1>
          <p className="text-gray-500 mt-1">Synthèse de l'audit</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Share2 className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Partager</span>
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Exporter</span>
          </Button>
        </div>
      </div>

      {/* Audit Info Card */}
      <Card className="p-5 lg:p-6 mb-6 border-l-4 border-l-gray-900">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rapport d'audit</p>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">{audit.name}</h2>
            <p className="text-gray-500 mt-1">{audit.location}</p>
          </div>
          <Badge variant={audit.status === 'completed' ? 'success' : 'warning'}>
            {audit.status === 'completed' ? 'Terminé' : 'En cours'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {audit.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Auditeur</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{audit.auditor || 'Non assigné'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Zones</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{audit.zones.length} auditées</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Contrôles</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{stats.totalChecks} points</p>
          </div>
        </div>
      </Card>

      {/* Global Status */}
      <Card className={`p-5 lg:p-6 mb-6 ${globalStatus.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center`}>
            {progressPercent < 100 ? (
              <Clock className={`w-7 h-7 ${globalStatus.color}`} />
            ) : stats.passRate >= 90 ? (
              <CheckCircle2 className={`w-7 h-7 ${globalStatus.color}`} />
            ) : (
              <AlertTriangle className={`w-7 h-7 ${globalStatus.color}`} />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Statut global</p>
            <p className={`text-xl lg:text-2xl font-semibold ${globalStatus.color}`}>{globalStatus.label}</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="rounded-2xl overflow-hidden mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 relative"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-900 rounded-r" />
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 pl-4">Progression</p>
            <p className="text-3xl lg:text-4xl font-extralight text-gray-900 tabular-nums pl-4">
              {progressPercent}<span className="text-lg text-gray-400">%</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Taux conformité</p>
            <p className={`text-3xl lg:text-4xl font-extralight tabular-nums ${
              stats.passRate >= 90 ? 'text-emerald-500' : stats.passRate >= 70 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {stats.passRate}<span className="text-lg text-gray-400">%</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Non conformités</p>
            <p className="text-3xl lg:text-4xl font-extralight text-rose-500 tabular-nums">
              {stats.failedChecks}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Écarts ouverts</p>
            <p className={`text-3xl lg:text-4xl font-extralight tabular-nums ${
              stats.openIssues > 0 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {stats.openIssues}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Detailed Stats */}
      <Card className="p-5 lg:p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Détail des contrôles</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Conformes</span>
              <span className="text-sm font-medium text-emerald-600">{stats.passedChecks}</span>
            </div>
            <Progress value={stats.passedChecks} max={stats.totalChecks} size="md" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Non conformes</span>
              <span className="text-sm font-medium text-rose-600">{stats.failedChecks}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(stats.failedChecks / stats.totalChecks) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">À vérifier</span>
              <span className="text-sm font-medium text-amber-600">{stats.warningChecks}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(stats.warningChecks / stats.totalChecks) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En attente</span>
              <span className="text-sm font-medium text-gray-500">{stats.pendingChecks}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(stats.pendingChecks / stats.totalChecks) * 100}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card className="p-5 lg:p-6 mb-6 border-rose-200 bg-rose-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-semibold text-rose-900 uppercase tracking-wide">Points critiques</h3>
          </div>
          <div className="space-y-3">
            {criticalIssues.map((issue) => (
              <div key={issue.id} className="p-3 bg-white rounded-xl">
                <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                <p className="text-xs text-gray-500 mt-1">{issue.zoneName}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 text-xs text-gray-400">
        <p className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Rapport généré par HORAMA Check
        </p>
        <p>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
}
