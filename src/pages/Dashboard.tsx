import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, MapPin, ChevronRight } from 'lucide-react';
import type { Audit, PageId } from '../types';
import { Card, Progress, Badge, StatTile } from '../components/ui';

interface DashboardProps {
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
    inProgressIssues: number;
    criticalIssues: number;
    passRate: number;
  };
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ audit, stats, onNavigate }: DashboardProps) {
  const progressPercent = Math.round((stats.completedChecks / stats.totalChecks) * 100);

  // Priority issues (critical first, then open)
  const priorityIssues = audit.issues
    .filter(i => i.status !== 'resolved' && i.status !== 'dismissed')
    .sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 3);

  // Zones needing attention (failed or in progress)
  const zonesNeedingAttention = audit.zones
    .filter(z => z.status === 'failed' || z.status === 'warning' || z.completedChecks < z.totalChecks)
    .slice(0, 4);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={audit.status === 'completed' ? 'success' : audit.status === 'in_progress' ? 'warning' : 'default'}>
            {audit.status === 'completed' ? 'Terminé' : audit.status === 'in_progress' ? 'En cours' : 'En attente'}
          </Badge>
          {stats.criticalIssues > 0 && (
            <Badge variant="danger">{stats.criticalIssues} critique{stats.criticalIssues > 1 ? 's' : ''}</Badge>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">{audit.name}</h1>
        <p className="text-gray-500 mt-1">{audit.location} • {audit.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Main Progress Card */}
      <Card className="p-5 lg:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Progression de l'audit</p>
            <p className="text-3xl lg:text-4xl font-extralight text-gray-900 mt-1">{progressPercent}%</p>
          </div>
          <div className="w-16 h-16 lg:w-20 lg:h-20 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke={progressPercent >= 90 ? '#34d399' : progressPercent >= 50 ? '#fbbf24' : '#f87171'}
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 1000' }}
                animate={{ strokeDasharray: `${progressPercent * 2.83} 1000` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>
        <Progress value={stats.completedChecks} max={stats.totalChecks} size="lg" />
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span>{stats.completedChecks} / {stats.totalChecks} contrôles</span>
          <span>{stats.completedZones} / {stats.totalZones} zones</span>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <StatTile
          label="Conformes"
          value={stats.passedChecks}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="success"
        />
        <StatTile
          label="Non conformes"
          value={stats.failedChecks}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="danger"
        />
        <StatTile
          label="À vérifier"
          value={stats.warningChecks}
          color="warning"
        />
        <StatTile
          label="En attente"
          value={stats.pendingChecks}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Pass Rate */}
      <Card className="p-5 lg:p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Taux de conformité</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl lg:text-5xl font-extralight ${
            stats.passRate >= 90 ? 'text-emerald-500' : stats.passRate >= 70 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {stats.passRate}%
          </span>
          <span className="text-gray-400">sur les contrôles effectués</span>
        </div>
      </Card>

      {/* Priority Issues */}
      {priorityIssues.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Écarts prioritaires</h2>
            <button
              onClick={() => onNavigate('issues')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {priorityIssues.map((issue, idx) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`p-4 border-l-4 ${
                  issue.severity === 'critical' ? 'border-l-rose-400' :
                  issue.severity === 'major' ? 'border-l-amber-400' : 'border-l-gray-300'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{issue.zoneName}</p>
                    </div>
                    <Badge
                      variant={issue.severity === 'critical' ? 'danger' : issue.severity === 'major' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {issue.severity === 'critical' ? 'Critique' : issue.severity === 'major' ? 'Majeur' : 'Mineur'}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Zones Needing Attention */}
      {zonesNeedingAttention.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Zones à compléter</h2>
            <button
              onClick={() => onNavigate('zones')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {zonesNeedingAttention.map((zone, idx) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className="p-4 flex items-center gap-3"
                  onClick={() => onNavigate('zones')}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    zone.status === 'failed' ? 'bg-rose-100' :
                    zone.status === 'warning' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`w-5 h-5 ${
                      zone.status === 'failed' ? 'text-rose-500' :
                      zone.status === 'warning' ? 'text-amber-500' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{zone.shortName}</p>
                    <p className="text-xs text-gray-500">{zone.completedChecks}/{zone.totalChecks} contrôles</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-light text-gray-900">{Math.round((zone.completedChecks / zone.totalChecks) * 100)}%</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
