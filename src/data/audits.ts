import type { Audit, Zone, Checkpoint, Issue, AuditHistory } from '../types';

// Helper to create checkpoints for a zone
const createCheckpoints = (zoneId: string, category: string, items: Array<{ desc: string; criteria: string; status: 'pending' | 'passed' | 'failed' | 'warning' | 'na' }>): Checkpoint[] => {
  return items.map((item, idx) => ({
    id: `${zoneId}-cp-${idx + 1}`,
    zoneId,
    category,
    description: item.desc,
    criteria: item.criteria,
    status: item.status,
    checkedAt: item.status !== 'pending' ? new Date() : undefined,
    checkedBy: item.status !== 'pending' ? 'Auditeur A' : undefined,
  }));
};

// Current audit zones
const zones: Zone[] = [
  {
    id: 'z1',
    name: 'Entrée Principale - Accès Public Nord',
    shortName: 'Entrée Nord',
    type: 'entrance',
    status: 'passed',
    completedChecks: 8,
    totalChecks: 8,
    issues: 0,
    checkpoints: createCheckpoints('z1', 'Accès', [
      { desc: 'Signalétique directionnelle visible', criteria: 'Panneaux visibles à 10m minimum', status: 'passed' },
      { desc: 'Cheminement dégagé', criteria: 'Largeur min. 2m, sans obstacle', status: 'passed' },
      { desc: 'Barriérage en place', criteria: 'Barrières continues et stables', status: 'passed' },
      { desc: 'Point de contrôle identifiable', criteria: 'Zone de filtrage clairement délimitée', status: 'passed' },
      { desc: 'Éclairage fonctionnel', criteria: 'Éclairage suffisant sur toute la zone', status: 'passed' },
      { desc: 'Accessibilité PMR', criteria: 'Rampe et signalétique PMR présentes', status: 'passed' },
      { desc: 'Issues de secours visibles', criteria: 'Panneaux sortie de secours illuminés', status: 'passed' },
      { desc: 'Zone d\'attente délimitée', criteria: 'File d\'attente organisée', status: 'passed' },
    ]),
  },
  {
    id: 'z2',
    name: 'Entrée Secondaire - Accès Est',
    shortName: 'Entrée Est',
    type: 'entrance',
    status: 'warning',
    completedChecks: 6,
    totalChecks: 8,
    issues: 1,
    checkpoints: createCheckpoints('z2', 'Accès', [
      { desc: 'Signalétique directionnelle visible', criteria: 'Panneaux visibles à 10m minimum', status: 'warning' },
      { desc: 'Cheminement dégagé', criteria: 'Largeur min. 2m, sans obstacle', status: 'passed' },
      { desc: 'Barriérage en place', criteria: 'Barrières continues et stables', status: 'passed' },
      { desc: 'Point de contrôle identifiable', criteria: 'Zone de filtrage clairement délimitée', status: 'passed' },
      { desc: 'Éclairage fonctionnel', criteria: 'Éclairage suffisant sur toute la zone', status: 'passed' },
      { desc: 'Accessibilité PMR', criteria: 'Rampe et signalétique PMR présentes', status: 'passed' },
      { desc: 'Issues de secours visibles', criteria: 'Panneaux sortie de secours illuminés', status: 'pending' },
      { desc: 'Zone d\'attente délimitée', criteria: 'File d\'attente organisée', status: 'pending' },
    ]),
  },
  {
    id: 'z3',
    name: 'Sortie Principale - Accès Sud',
    shortName: 'Sortie Sud',
    type: 'exit',
    status: 'passed',
    completedChecks: 6,
    totalChecks: 6,
    issues: 0,
    checkpoints: createCheckpoints('z3', 'Sortie', [
      { desc: 'Signalétique sortie visible', criteria: 'Panneaux "Sortie" visibles', status: 'passed' },
      { desc: 'Cheminement dégagé', criteria: 'Largeur min. 3m pour flux sortant', status: 'passed' },
      { desc: 'Barriérage canalisateur', criteria: 'Flux dirigé vers points de sortie', status: 'passed' },
      { desc: 'Zone tampon suffisante', criteria: 'Espace de dispersion extérieur', status: 'passed' },
      { desc: 'Éclairage fonctionnel', criteria: 'Éclairage suffisant', status: 'passed' },
      { desc: 'Comptage possible', criteria: 'Point de comptage accessible', status: 'passed' },
    ]),
  },
  {
    id: 'z4',
    name: 'Zone Village - Espace Partenaires',
    shortName: 'Village',
    type: 'general',
    status: 'failed',
    completedChecks: 10,
    totalChecks: 12,
    issues: 2,
    checkpoints: createCheckpoints('z4', 'Village', [
      { desc: 'Plan d\'implantation respecté', criteria: 'Stands positionnés selon plan', status: 'passed' },
      { desc: 'Allées principales dégagées', criteria: 'Largeur min. 3m maintenue', status: 'failed' },
      { desc: 'Signalétique stands visible', criteria: 'Identification claire des partenaires', status: 'passed' },
      { desc: 'Points info présents', criteria: 'Bornes info aux carrefours', status: 'passed' },
      { desc: 'Poubelles en nombre suffisant', criteria: '1 poubelle / 50m²', status: 'warning' },
      { desc: 'Zone ombragée disponible', criteria: 'Espaces couverts accessibles', status: 'passed' },
      { desc: 'Points d\'eau identifiés', criteria: 'Fontaines signalées', status: 'passed' },
      { desc: 'Extincteurs visibles', criteria: '1 extincteur visible / zone', status: 'passed' },
      { desc: 'Issues de secours accessibles', criteria: 'Accès non obstrués', status: 'failed' },
      { desc: 'Câblage sécurisé', criteria: 'Câbles protégés ou enterrés', status: 'passed' },
      { desc: 'Sanitaires accessibles', criteria: 'Fléchage vers sanitaires', status: 'pending' },
      { desc: 'Zone fumeur délimitée', criteria: 'Espace fumeur identifié', status: 'pending' },
    ]),
  },
  {
    id: 'z5',
    name: 'Zone Technique - Backstage',
    shortName: 'Backstage',
    type: 'sensitive',
    status: 'passed',
    completedChecks: 5,
    totalChecks: 5,
    issues: 0,
    checkpoints: createCheckpoints('z5', 'Zone Technique', [
      { desc: 'Accès restreint signalé', criteria: 'Panneau "Zone Technique"', status: 'passed' },
      { desc: 'Contrôle d\'accès en place', criteria: 'Badge requis pour entrée', status: 'passed' },
      { desc: 'Issues de secours dégagées', criteria: 'Sorties non obstruées', status: 'passed' },
      { desc: 'Matériel stocké correctement', criteria: 'Pas d\'encombrement', status: 'passed' },
      { desc: 'Extincteurs accessibles', criteria: 'Extincteurs visibles et accessibles', status: 'passed' },
    ]),
  },
  {
    id: 'z6',
    name: 'Cheminement Public - Axe Principal',
    shortName: 'Axe Principal',
    type: 'pathway',
    status: 'warning',
    completedChecks: 4,
    totalChecks: 6,
    issues: 1,
    checkpoints: createCheckpoints('z6', 'Cheminement', [
      { desc: 'Largeur conforme', criteria: 'Min. 4m pour flux bidirectionnel', status: 'passed' },
      { desc: 'Sol praticable', criteria: 'Surface plane et stable', status: 'warning' },
      { desc: 'Signalétique directionnelle', criteria: 'Fléchage aux intersections', status: 'passed' },
      { desc: 'Éclairage continu', criteria: 'Éclairage sur tout le parcours', status: 'passed' },
      { desc: 'Points de repère', criteria: 'Repères visuels identifiables', status: 'pending' },
      { desc: 'Zones de repos', criteria: 'Bancs ou espaces de pause', status: 'pending' },
    ]),
  },
  {
    id: 'z7',
    name: 'Barriérage Périmétrique - Zone Nord',
    shortName: 'Périmètre Nord',
    type: 'barrier',
    status: 'passed',
    completedChecks: 4,
    totalChecks: 4,
    issues: 0,
    checkpoints: createCheckpoints('z7', 'Barriérage', [
      { desc: 'Continuité du barriérage', criteria: 'Aucune brèche visible', status: 'passed' },
      { desc: 'Stabilité des barrières', criteria: 'Barrières solidement fixées', status: 'passed' },
      { desc: 'Hauteur conforme', criteria: 'Min. 1.10m de hauteur', status: 'passed' },
      { desc: 'Points de passage contrôlés', criteria: 'Ouvertures uniquement aux accès', status: 'passed' },
    ]),
  },
  {
    id: 'z8',
    name: 'Signalétique Générale',
    shortName: 'Signalétique',
    type: 'signage',
    status: 'pending',
    completedChecks: 0,
    totalChecks: 6,
    issues: 0,
    checkpoints: createCheckpoints('z8', 'Signalétique', [
      { desc: 'Plan général visible', criteria: 'Plan à chaque entrée', status: 'pending' },
      { desc: 'Fléchage toilettes', criteria: 'Directions vers sanitaires', status: 'pending' },
      { desc: 'Fléchage points d\'eau', criteria: 'Directions vers fontaines', status: 'pending' },
      { desc: 'Fléchage secours', criteria: 'Directions vers poste secours', status: 'pending' },
      { desc: 'Fléchage sorties', criteria: 'Directions vers sorties', status: 'pending' },
      { desc: 'Information programme', criteria: 'Horaires et activités affichés', status: 'pending' },
    ]),
  },
];

// Issues found during audit
const issues: Issue[] = [
  {
    id: 'i1',
    zoneId: 'z2',
    zoneName: 'Entrée Est',
    checkpointId: 'z2-cp-1',
    title: 'Signalétique partiellement masquée',
    description: 'Le panneau directionnel est partiellement masqué par un arbre. Visibilité réduite à environ 5m au lieu des 10m requis.',
    severity: 'minor',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'i2',
    zoneId: 'z4',
    zoneName: 'Village',
    checkpointId: 'z4-cp-2',
    title: 'Allée principale encombrée',
    description: 'Matériel de stand débordant sur l\'allée principale, réduisant la largeur à 2m au lieu des 3m minimum requis.',
    severity: 'major',
    status: 'open',
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'i3',
    zoneId: 'z4',
    zoneName: 'Village',
    checkpointId: 'z4-cp-9',
    title: 'Issue de secours obstruée',
    description: 'Cartons et matériel stockés devant l\'issue de secours côté ouest. Accès impossible en l\'état.',
    severity: 'critical',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5400000),
    assignedTo: 'Équipe Logistique',
  },
  {
    id: 'i4',
    zoneId: 'z6',
    zoneName: 'Axe Principal',
    checkpointId: 'z6-cp-2',
    title: 'Zone de sol irrégulière',
    description: 'Présence de trous et irrégularités sur environ 5m. Risque de chute, surtout pour PMR.',
    severity: 'major',
    status: 'open',
    createdAt: new Date(Date.now() - 1800000),
  },
];

// Calculate totals
const totalChecks = zones.reduce((acc, z) => acc + z.totalChecks, 0);
const completedChecks = zones.reduce((acc, z) => acc + z.completedChecks, 0);
const passedChecks = zones.reduce((acc, z) =>
  acc + z.checkpoints.filter(cp => cp.status === 'passed').length, 0);

// Current audit
export const currentAudit: Audit = {
  id: 'audit-001',
  name: 'Village Départ - Étape 7',
  location: 'Nantes',
  date: new Date(),
  status: 'in_progress',
  zones,
  issues,
  completedChecks,
  totalChecks,
  passRate: Math.round((passedChecks / completedChecks) * 100) || 0,
  auditor: 'Jean-Pierre M.',
  startedAt: new Date(Date.now() - 14400000),
};

// Historical audits for comparison
export const auditHistory: AuditHistory[] = [
  {
    id: 'h1',
    name: 'Village Départ - Étape 6',
    location: 'Bordeaux',
    date: new Date(Date.now() - 86400000 * 2),
    passRate: 94,
    issuesFound: 3,
    issuesResolved: 3,
  },
  {
    id: 'h2',
    name: 'Village Départ - Étape 5',
    location: 'Toulouse',
    date: new Date(Date.now() - 86400000 * 4),
    passRate: 89,
    issuesFound: 5,
    issuesResolved: 5,
  },
  {
    id: 'h3',
    name: 'Village Départ - Étape 4',
    location: 'Pau',
    date: new Date(Date.now() - 86400000 * 6),
    passRate: 92,
    issuesFound: 4,
    issuesResolved: 4,
  },
  {
    id: 'h4',
    name: 'Village Départ - Étape 3',
    location: 'Bayonne',
    date: new Date(Date.now() - 86400000 * 8),
    passRate: 87,
    issuesFound: 6,
    issuesResolved: 6,
  },
  {
    id: 'h5',
    name: 'Village Départ - Étape 2',
    location: 'Saint-Sébastien',
    date: new Date(Date.now() - 86400000 * 10),
    passRate: 91,
    issuesFound: 4,
    issuesResolved: 4,
  },
];

// Stats for dashboard
export const getAuditStats = (audit: Audit) => {
  const zones = audit.zones;

  return {
    totalZones: zones.length,
    completedZones: zones.filter(z => z.completedChecks === z.totalChecks).length,
    totalChecks: audit.totalChecks,
    completedChecks: audit.completedChecks,
    passedChecks: zones.reduce((acc, z) =>
      acc + z.checkpoints.filter(cp => cp.status === 'passed').length, 0),
    failedChecks: zones.reduce((acc, z) =>
      acc + z.checkpoints.filter(cp => cp.status === 'failed').length, 0),
    warningChecks: zones.reduce((acc, z) =>
      acc + z.checkpoints.filter(cp => cp.status === 'warning').length, 0),
    pendingChecks: zones.reduce((acc, z) =>
      acc + z.checkpoints.filter(cp => cp.status === 'pending').length, 0),
    openIssues: audit.issues.filter(i => i.status === 'open').length,
    inProgressIssues: audit.issues.filter(i => i.status === 'in_progress').length,
    criticalIssues: audit.issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
    passRate: audit.passRate,
  };
};
