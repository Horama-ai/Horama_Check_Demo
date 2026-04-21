import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, CheckCircle2, AlertTriangle, Clock, FileText, X, ChevronRight, Globe } from 'lucide-react';
import type { Audit } from '../types';
import { Card, Badge, Button, StatusIndicator } from '../components/ui';

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

type FilterType = 'passed' | 'failed' | 'warning' | 'pending' | null;

export function Report({ audit, stats }: ReportProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(null);
  const progressPercent = Math.round((stats.completedChecks / stats.totalChecks) * 100);

  const getGlobalStatus = () => {
    if (progressPercent < 100) return { label: 'En cours', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (stats.passRate >= 90) return { label: 'Conforme', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (stats.passRate >= 70) return { label: 'Partiellement conforme', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Non conforme', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const globalStatus = getGlobalStatus();

  // Get all checkpoints with zone info
  const allCheckpoints = audit.zones.flatMap(zone =>
    zone.checkpoints.map(cp => ({ ...cp, zoneName: zone.shortName }))
  );

  // Filter checkpoints by status
  const getFilteredCheckpoints = (filter: FilterType) => {
    if (!filter) return [];
    return allCheckpoints.filter(cp => cp.status === filter);
  };

  const filteredCheckpoints = getFilteredCheckpoints(selectedFilter);

  // Critical issues list
  const criticalIssues = audit.issues.filter(i => i.severity === 'critical' && i.status !== 'resolved');

  const getFilterTitle = (filter: FilterType) => {
    switch (filter) {
      case 'passed': return 'Contrôles conformes';
      case 'failed': return 'Contrôles non conformes';
      case 'warning': return 'Contrôles à vérifier';
      case 'pending': return 'Contrôles en attente';
      default: return '';
    }
  };

  const getFilterColor = (filter: FilterType) => {
    switch (filter) {
      case 'passed': return 'bg-emerald-50';
      case 'failed': return 'bg-rose-50';
      case 'warning': return 'bg-amber-50';
      case 'pending': return 'bg-gray-50';
      default: return 'bg-white';
    }
  };

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
            <p className="text-xs text-gray-500 uppercase tracking-wide">Opérateur</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-[10px] font-medium text-gray-600">OP</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Opérateur</p>
              <Globe className="w-3 h-3 text-gray-400" />
            </div>
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

      {/* Detailed Stats - Clickable */}
      <Card className="p-5 lg:p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Détail des contrôles</h3>

        <div className="space-y-3">
          {/* Conformes */}
          <button
            onClick={() => setSelectedFilter('passed')}
            className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Conformes</p>
                <p className="text-xs text-gray-500">{stats.passedChecks} contrôles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-emerald-600">{Math.round((stats.passedChecks / stats.totalChecks) * 100)}%</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Non conformes */}
          <button
            onClick={() => setSelectedFilter('failed')}
            className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <X className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Non conformes</p>
                <p className="text-xs text-gray-500">{stats.failedChecks} contrôles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-rose-600">{Math.round((stats.failedChecks / stats.totalChecks) * 100)}%</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* À vérifier */}
          <button
            onClick={() => setSelectedFilter('warning')}
            className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">À vérifier</p>
                <p className="text-xs text-gray-500">{stats.warningChecks} contrôles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-amber-600">{Math.round((stats.warningChecks / stats.totalChecks) * 100)}%</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* En attente */}
          <button
            onClick={() => setSelectedFilter('pending')}
            className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">En attente</p>
                <p className="text-xs text-gray-500">{stats.pendingChecks} contrôles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-gray-500">{Math.round((stats.pendingChecks / stats.totalChecks) * 100)}%</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </Card>

      {/* Synthèse */}
      <Card className="p-5 lg:p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Synthèse</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            L'audit présente un taux de conformité {stats.passRate >= 90 ? 'excellent' : stats.passRate >= 70 ? 'satisfaisant' : 'insuffisant'} de{' '}
            <span className="font-semibold">{stats.passRate}%</span>.
            {stats.failedChecks > 0 ? (
              <> Sur les <span className="font-semibold">{stats.totalChecks} points de contrôle</span> vérifiés,{' '}
              <span className="font-semibold text-rose-600">{stats.failedChecks} non-conformité{stats.failedChecks > 1 ? 's' : ''}</span>{' '}
              {stats.failedChecks > 1 ? 'ont été identifiées' : 'a été identifiée'} nécessitant une action corrective. </>
            ) : (
              <> L'ensemble des <span className="font-semibold">{stats.totalChecks} points de contrôle</span> vérifiés sont conformes aux exigences. </>
            )}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {stats.warningChecks > 0 && (
              <><span className="font-semibold text-amber-600">{stats.warningChecks} point{stats.warningChecks > 1 ? 's' : ''}</span>{' '}
              nécessite{stats.warningChecks > 1 ? 'nt' : ''} une vérification complémentaire. </>
            )}
            {stats.openIssues > 0 ? (
              <>Actuellement, <span className="font-semibold">{stats.openIssues} écart{stats.openIssues > 1 ? 's' : ''}</span>{' '}
              reste{stats.openIssues > 1 ? 'nt' : ''} ouvert{stats.openIssues > 1 ? 's' : ''}{' '}
              {stats.criticalIssues > 0 && (
                <>dont <span className="font-semibold text-rose-600">{stats.criticalIssues} critique{stats.criticalIssues > 1 ? 's' : ''}</span></>
              )}.</>
            ) : (
              <>Aucun écart n'est actuellement ouvert.</>
            )}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            La couverture de l'audit s'étend sur <span className="font-semibold">{stats.totalZones} zones</span>,
            dont <span className="font-semibold">{stats.completedZones}</span> ont été entièrement contrôlées
            ({Math.round((stats.completedZones / stats.totalZones) * 100)}% de couverture).
          </p>
        </div>

        {/* Summary stats tiles */}
        <div className="rounded-xl overflow-hidden mt-5">
          <div className="grid grid-cols-2 gap-px bg-gray-200">
            <div className="p-3 lg:p-4 bg-gray-50">
              <p className="text-xs lg:text-sm font-medium text-gray-900 mb-1">Zones auditées</p>
              <p className="text-xl lg:text-2xl font-extralight text-gray-900">{stats.completedZones}/{stats.totalZones}</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((stats.completedZones / stats.totalZones) * 100)}% complété</p>
            </div>
            <div className="p-3 lg:p-4 bg-gray-50">
              <p className="text-xs lg:text-sm font-medium text-gray-900 mb-1">Contrôles effectués</p>
              <p className="text-xl lg:text-2xl font-extralight text-gray-900">{stats.completedChecks}/{stats.totalChecks}</p>
              <p className="text-xs text-gray-500 mt-1">{progressPercent}% complété</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommandations */}
      <Card className="p-5 lg:p-6 mb-6 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Recommandations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            {
              title: 'Actions correctives prioritaires',
              description: stats.failedChecks > 0
                ? `Traiter en priorité les ${stats.failedChecks} non-conformité${stats.failedChecks > 1 ? 's' : ''} identifiée${stats.failedChecks > 1 ? 's' : ''} pour assurer la conformité réglementaire.`
                : 'Maintenir les bonnes pratiques actuelles et poursuivre la veille réglementaire.'
            },
            {
              title: 'Vérifications complémentaires',
              description: stats.warningChecks > 0
                ? `Clarifier le statut des ${stats.warningChecks} point${stats.warningChecks > 1 ? 's' : ''} en attente de vérification avant le prochain audit.`
                : 'Aucune vérification complémentaire requise à ce stade.'
            },
            {
              title: 'Suivi des écarts',
              description: stats.openIssues > 0
                ? `Établir un plan d'action pour résoudre les ${stats.openIssues} écart${stats.openIssues > 1 ? 's' : ''} ouvert${stats.openIssues > 1 ? 's' : ''} avec des délais précis.`
                : 'Tous les écarts ont été traités. Documenter les actions réalisées.'
            },
            {
              title: 'Préparation prochain audit',
              description: 'Planifier une revue de pré-audit 2 semaines avant la prochaine échéance pour anticiper les points sensibles.'
            }
          ].map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 lg:p-4 bg-white rounded-xl"
            >
              <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gray-900 text-white text-xs lg:text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</p>
                <p className="text-xs lg:text-sm text-gray-600">{rec.description}</p>
              </div>
            </motion.div>
          ))}
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

      {/* Checkpoint List Panel */}
      <AnimatePresence>
        {selectedFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 z-50"
              onClick={() => setSelectedFilter(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50"
            >
              <div className={`bg-white rounded-t-3xl lg:rounded-2xl w-full lg:max-w-lg max-h-[70vh] lg:max-h-[80vh] overflow-hidden shadow-xl flex flex-col`}>
                {/* Header */}
                <div className={`p-5 ${getFilterColor(selectedFilter)} border-b border-gray-100 flex-shrink-0`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{getFilterTitle(selectedFilter)}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{filteredCheckpoints.length} contrôles</p>
                    </div>
                    <button
                      onClick={() => setSelectedFilter(null)}
                      className="p-2 hover:bg-white/50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredCheckpoints.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucun contrôle</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCheckpoints.map((cp) => (
                        <div
                          key={cp.id}
                          className="p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-start gap-3">
                            <StatusIndicator status={cp.status} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{cp.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{(cp as any).zoneName} • {cp.criteria}</p>
                              {cp.notes?.operator && (
                                <p className="text-xs text-gray-600 mt-2 italic">"{cp.notes.operator}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex-shrink-0 safe-area-bottom">
                  <Button variant="ghost" fullWidth onClick={() => setSelectedFilter(null)}>
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
