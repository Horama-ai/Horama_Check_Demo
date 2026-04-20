import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ChevronRight, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import type { PageId } from '../types';
import { auditHistory, getCompletedStages } from '../data/audits';
import { Card, Progress, Badge } from '../components/ui';

interface AuditHistoryProps {
  onNavigate: (page: PageId) => void;
}

export function AuditHistory({ onNavigate: _onNavigate }: AuditHistoryProps) {
  const completedStages = getCompletedStages();

  // Chart data - using completed stages
  const chartData = [...auditHistory].reverse().map((audit, idx) => ({
    name: `É${completedStages[idx]?.number || idx + 1}`,
    fullName: audit.location,
    taux: audit.passRate,
    écarts: audit.issuesFound,
    objectif: 90,
  }));

  // Calculate statistics
  const avgPassRate = Math.round(auditHistory.reduce((acc, a) => acc + a.passRate, 0) / auditHistory.length);
  const totalIssues = auditHistory.reduce((acc, a) => acc + a.issuesFound, 0);
  const resolvedIssues = auditHistory.reduce((acc, a) => acc + a.issuesResolved, 0);
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

  // Trend (compare last 2)
  const trend = auditHistory.length >= 2 ? auditHistory[0].passRate - auditHistory[1].passRate : 0;

  // Best and worst
  const bestAudit = [...auditHistory].sort((a, b) => b.passRate - a.passRate)[0];
  const worstAudit = [...auditHistory].sort((a, b) => a.passRate - b.passRate)[0];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = chartData.find(d => d.name === label);
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <p className="font-medium mb-1">{data?.fullName || label}</p>
          <p className="text-emerald-400">Conformité: {payload[0]?.value}%</p>
          {payload[1] && <p className="text-amber-400">Écarts: {payload[1]?.value}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Historique</h1>
        <p className="text-gray-500 mt-1">{auditHistory.length} audits précédents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {/* Average Pass Rate */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Moyenne</span>
          </div>
          <p className={`text-3xl lg:text-4xl font-extralight ${
            avgPassRate >= 90 ? 'text-emerald-500' : avgPassRate >= 80 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {avgPassRate}%
          </p>
        </Card>

        {/* Trend */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            )}
            <span className="text-xs text-gray-500 uppercase tracking-wide">Tendance</span>
          </div>
          <p className={`text-3xl lg:text-4xl font-extralight ${
            trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </p>
        </Card>

        {/* Total Issues */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Écarts</span>
          </div>
          <p className="text-3xl lg:text-4xl font-extralight text-gray-900">{totalIssues}</p>
          <p className="text-xs text-gray-500 mt-1">{resolvedIssues} résolus</p>
        </Card>

        {/* Resolution Rate */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Résolution</span>
          </div>
          <p className="text-3xl lg:text-4xl font-extralight text-emerald-500">{resolutionRate}%</p>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-4 lg:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Évolution de la conformité</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Conformité
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-500" />
              Objectif 90%
            </span>
          </div>
        </div>
        <div className="h-56 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTaux" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c7ff2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0c7ff2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                domain={[70, 100]}
                ticks={[70, 80, 90, 100]}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} />
              <Area
                type="monotone"
                dataKey="taux"
                stroke="#0c7ff2"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTaux)"
                dot={{ fill: '#0c7ff2', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, stroke: '#0c7ff2', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Best/Worst Performance */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 bg-emerald-50 border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase">Meilleur</span>
          </div>
          <p className="text-lg font-medium text-emerald-900">{bestAudit?.location}</p>
          <p className="text-2xl font-light text-emerald-600">{bestAudit?.passRate}%</p>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase">À améliorer</span>
          </div>
          <p className="text-lg font-medium text-amber-900">{worstAudit?.location}</p>
          <p className="text-2xl font-light text-amber-600">{worstAudit?.passRate}%</p>
        </Card>
      </div>

      {/* Past Audits List */}
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Audits par étape</h2>
      <div className="space-y-3">
        {auditHistory.map((audit, idx) => {
          const stageNumber = completedStages.length - idx;
          return (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="p-4 lg:p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center ${
                    audit.passRate >= 90 ? 'bg-emerald-50' : audit.passRate >= 80 ? 'bg-amber-50' : 'bg-rose-50'
                  }`}>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">É</p>
                      <p className={`text-lg font-semibold ${
                        audit.passRate >= 90 ? 'text-emerald-600' : audit.passRate >= 80 ? 'text-amber-600' : 'text-rose-600'
                      }`}>{stageNumber}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm lg:text-base font-medium text-gray-900 truncate">{audit.location}</p>
                      <Badge
                        variant={audit.passRate >= 90 ? 'success' : audit.passRate >= 80 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {audit.passRate >= 90 ? 'OK' : audit.passRate >= 80 ? 'Att.' : 'KO'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{audit.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      <span>•</span>
                      <span>{audit.issuesFound} écart{audit.issuesFound > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={audit.passRate} max={100} size="sm" />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xl lg:text-2xl font-light ${
                      audit.passRate >= 90 ? 'text-emerald-500' : audit.passRate >= 80 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {audit.passRate}%
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 hidden lg:block" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Insight Card */}
      <Card className="p-4 lg:p-5 mt-6 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Analyse de performance</p>
            <p className="text-sm text-blue-700">
              {avgPassRate >= 90 ? (
                <>Excellente performance globale. Le taux de conformité moyen de {avgPassRate}% dépasse l'objectif de 90%.</>
              ) : avgPassRate >= 85 ? (
                <>Performance satisfaisante. Le taux moyen de {avgPassRate}% est proche de l'objectif. Points d'attention identifiés sur {totalIssues - resolvedIssues} écarts non résolus.</>
              ) : (
                <>Des améliorations sont nécessaires. Le taux moyen de {avgPassRate}% est en-dessous de l'objectif de 90%. Priorité aux zones récurrentes.</>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
