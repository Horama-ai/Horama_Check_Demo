import { motion } from 'framer-motion';
import { Calendar, MapPin, TrendingUp, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PageId } from '../types';
import { auditHistory } from '../data/audits';
import { Card, Progress } from '../components/ui';

interface AuditHistoryProps {
  onNavigate: (page: PageId) => void;
}

export function AuditHistory({ onNavigate: _onNavigate }: AuditHistoryProps) {
  // Chart data
  const chartData = [...auditHistory].reverse().map(audit => ({
    name: audit.location.substring(0, 8),
    taux: audit.passRate,
    écarts: audit.issuesFound,
  }));

  // Average pass rate
  const avgPassRate = Math.round(auditHistory.reduce((acc, a) => acc + a.passRate, 0) / auditHistory.length);

  // Trend (compare last 2)
  const trend = auditHistory[0].passRate - auditHistory[1].passRate;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Historique</h1>
        <p className="text-gray-500 mt-1">{auditHistory.length} audits précédents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Taux moyen</span>
          </div>
          <p className={`text-3xl lg:text-4xl font-extralight ${
            avgPassRate >= 90 ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            {avgPassRate}%
          </p>
        </Card>

        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            {trend >= 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
            <span className="text-xs text-gray-500 uppercase tracking-wide">Tendance</span>
          </div>
          <p className={`text-3xl lg:text-4xl font-extralight ${
            trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-4 lg:p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Évolution du taux de conformité</h2>
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                domain={[0, 100]}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  `${value}${name === 'taux' ? '%' : ''}`,
                  name === 'taux' ? 'Conformité' : 'Écarts'
                ]}
              />
              <Bar dataKey="taux" fill="#0c7ff2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Past Audits List */}
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Audits passés</h2>
      <div className="space-y-3">
        {auditHistory.map((audit, idx) => (
          <motion.div
            key={audit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card className="p-4 lg:p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center ${
                  audit.passRate >= 90 ? 'bg-emerald-50' : audit.passRate >= 70 ? 'bg-amber-50' : 'bg-rose-50'
                }`}>
                  {audit.passRate >= 90 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <AlertTriangle className={`w-6 h-6 ${audit.passRate >= 70 ? 'text-amber-500' : 'text-rose-500'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm lg:text-base font-medium text-gray-900 truncate">{audit.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{audit.location}</span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>{audit.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={audit.passRate} max={100} size="sm" />
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xl lg:text-2xl font-light ${
                    audit.passRate >= 90 ? 'text-emerald-500' : audit.passRate >= 70 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {audit.passRate}%
                  </p>
                  <p className="text-xs text-gray-500">{audit.issuesFound} écarts</p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 hidden lg:block" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comparison Note */}
      <Card className="p-4 lg:p-5 mt-6 bg-gray-50 border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Capitalisation :</span> Les résultats des audits passés permettent d'identifier les points récurrents et d'améliorer la préparation des prochaines étapes.
        </p>
      </Card>
    </div>
  );
}
