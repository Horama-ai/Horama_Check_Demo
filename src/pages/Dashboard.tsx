import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, ChevronRight, Radio, MapPin } from 'lucide-react';
import type { Audit, PageId, Stage } from '../types';
import { Card, Badge, Progress } from '../components/ui';

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
    criticalIssues: number;
    passRate: number;
  };
  onNavigate: (page: PageId) => void;
  stages: Stage[];
  selectedStageId: string;
  onStageSelect: (stageId: string) => void;
}

export function Dashboard({ audit, stats, onNavigate, stages, selectedStageId, onStageSelect }: DashboardProps) {
  const progressPercent = Math.round((stats.completedChecks / stats.totalChecks) * 100);

  const getStatusColor = (passRate: number) => {
    if (passRate >= 90) return 'text-emerald-500';
    if (passRate >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  // Priority issues (critical and major)
  const priorityIssues = audit.issues
    .filter(i => (i.severity === 'critical' || i.severity === 'major') && i.status !== 'resolved')
    .slice(0, 3);

  // Zones needing attention
  const attentionZones = audit.zones
    .filter(z => z.status === 'failed' || z.status === 'warning' || z.completedChecks < z.totalChecks)
    .slice(0, 4);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {audit.status === 'in_progress' && (
            <Badge variant="warning">
              <Radio className="w-3 h-3 mr-1" />
              En cours
            </Badge>
          )}
          {audit.status === 'completed' && (
            <Badge variant="success">Terminé</Badge>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">{audit.name}</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {audit.location} • {audit.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Timeline - Horizontal scroll on mobile */}
      <div className="mb-6 -mx-4 px-4 lg:mx-0 lg:px-0">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Étapes</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {stages.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            const isLive = stage.status === 'live';
            const isCompleted = stage.status === 'completed';

            return (
              <button
                key={stage.id}
                onClick={() => onStageSelect(stage.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all ${
                  isSelected
                    ? isLive
                      ? 'bg-rose-50 border-rose-200'
                      : isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-gray-100 border-gray-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isLive && <Radio className="w-3 h-3 text-rose-500" />}
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  {stage.status === 'upcoming' && <Clock className="w-3 h-3 text-gray-400" />}
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    isSelected ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    É{stage.number}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">{stage.location}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
        {/* Progress Circle */}
        <Card className="p-4 lg:p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 lg:w-24 lg:h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={progressPercent >= 90 ? '#10b981' : progressPercent >= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 2.51} 251`}
                  initial={{ strokeDasharray: '0 251' }}
                  animate={{ strokeDasharray: `${progressPercent * 2.51} 251` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-extralight text-gray-900 ${progressPercent === 100 ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-3xl'}`}>{progressPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Progression</p>
              <p className="text-lg lg:text-xl font-medium text-gray-900">
                {stats.completedChecks}/{stats.totalChecks}
              </p>
              <p className="text-sm text-gray-500">contrôles effectués</p>
              <p className="text-xs text-gray-400 mt-1">{stats.completedZones}/{stats.totalZones} zones</p>
            </div>
          </div>
        </Card>

        {/* Pass Rate */}
        <Card className="p-4 lg:p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Taux conformité</p>
          <p className={`text-3xl lg:text-4xl font-extralight ${getStatusColor(stats.passRate)}`}>
            {stats.passRate}%
          </p>
          <div className="mt-2">
            <Progress value={stats.passRate} max={100} size="sm" />
          </div>
        </Card>

        {/* Open Issues */}
        <Card className="p-4 lg:p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Écarts ouverts</p>
          <p className={`text-3xl lg:text-4xl font-extralight ${stats.openIssues > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {stats.openIssues}
          </p>
          {stats.criticalIssues > 0 && (
            <p className="text-xs text-rose-500 font-medium mt-1">
              {stats.criticalIssues} critique{stats.criticalIssues > 1 ? 's' : ''}
            </p>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xl lg:text-2xl font-extralight text-emerald-600">{stats.passedChecks}</p>
          <p className="text-[10px] text-emerald-600 uppercase">Conformes</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 text-center">
          <p className="text-xl lg:text-2xl font-extralight text-rose-600">{stats.failedChecks}</p>
          <p className="text-[10px] text-rose-600 uppercase">Non conf.</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-xl lg:text-2xl font-extralight text-amber-600">{stats.warningChecks}</p>
          <p className="text-[10px] text-amber-600 uppercase">À vérifier</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl lg:text-2xl font-extralight text-gray-500">{stats.pendingChecks}</p>
          <p className="text-[10px] text-gray-500 uppercase">En attente</p>
        </div>
      </div>

      {/* Priority Issues */}
      {priorityIssues.length > 0 && (
        <Card className="p-4 lg:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Écarts prioritaires</h2>
            <button
              onClick={() => onNavigate('issues')}
              className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {priorityIssues.map((issue) => {
              const severityConfig = issue.severity === 'critical'
                ? { bg: 'bg-rose-50', border: 'border-l-rose-400', iconBg: 'bg-rose-100', iconColor: 'text-rose-500' }
                : { bg: 'bg-amber-50', border: 'border-l-amber-400', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' };

              const statusConfig = issue.status === 'open'
                ? { label: 'Ouvert', color: 'text-rose-600' }
                : { label: 'En cours', color: 'text-amber-600' };

              const formatTime = (date: Date) => {
                const now = new Date();
                const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
                if (diff < 1) return "À l'instant";
                if (diff < 60) return `Il y a ${diff} min`;
                if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
                return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
              };

              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-xl border-l-4 ${severityConfig.bg} ${severityConfig.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${severityConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className={`w-5 h-5 ${severityConfig.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={issue.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                          {issue.severity === 'critical' ? 'Critique' : 'Majeur'}
                        </Badge>
                        <span className={`text-xs ${statusConfig.color} flex items-center gap-1`}>
                          {issue.status === 'open' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
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
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Zones needing attention */}
      {attentionZones.length > 0 && (
        <Card className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Zones à traiter</h2>
            <button
              onClick={() => onNavigate('zones')}
              className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {attentionZones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  zone.status === 'failed' ? 'bg-rose-100' :
                  zone.status === 'warning' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  {zone.status === 'failed' || zone.status === 'warning' ? (
                    <AlertTriangle className={`w-5 h-5 ${
                      zone.status === 'failed' ? 'text-rose-500' : 'text-amber-500'
                    }`} />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{zone.shortName}</p>
                  <p className="text-xs text-gray-500">
                    {zone.completedChecks}/{zone.totalChecks} contrôles
                    {zone.issues > 0 && ` • ${zone.issues} écart${zone.issues > 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-light ${
                    zone.status === 'failed' ? 'text-rose-500' :
                    zone.status === 'warning' ? 'text-amber-500' : 'text-gray-500'
                  }`}>
                    {Math.round((zone.completedChecks / zone.totalChecks) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
