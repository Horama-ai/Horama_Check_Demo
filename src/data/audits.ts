import type { Audit, Zone, Checkpoint, Issue, Stage, CheckStatus } from '../types';

// Helper to create checkpoints for a zone
const createCheckpoints = (
  zoneId: string,
  category: string,
  items: Array<{
    desc: string;
    criteria: string;
    status: CheckStatus;
    operatorNote?: string;
    aiNote?: string;
  }>
): Checkpoint[] => {
  return items.map((item, idx) => ({
    id: `${zoneId}-cp-${idx + 1}`,
    zoneId,
    category,
    description: item.desc,
    criteria: item.criteria,
    status: item.status,
    notes: (item.operatorNote || item.aiNote) ? {
      operator: item.operatorNote,
      operatorAt: item.operatorNote ? new Date() : undefined,
      ai: item.aiNote,
      aiGeneratedAt: item.aiNote ? new Date(Date.now() - 86400000) : undefined,
    } : undefined,
    checkedAt: item.status !== 'pending' ? new Date() : undefined,
    checkedBy: item.status !== 'pending' ? 'Auditeur' : undefined,
  }));
};

// AI generated notes for checkpoints
const aiNotes = {
  entrance: "Vérifier l'accessibilité PMR et la visibilité de la signalétique depuis le parking. S'assurer que le flux est fluide même en cas d'affluence.",
  exit: "Contrôler que les issues de secours sont dégagées et que le comptage est possible pour le suivi de jauge.",
  village: "Attention particulière aux allées principales qui doivent rester dégagées. Vérifier le positionnement des extincteurs.",
  pathway: "Vérifier l'état du sol et l'éclairage sur toute la longueur du cheminement.",
  barrier: "S'assurer de la continuité du barriérage et de l'absence de brèches.",
  signage: "Contrôler la cohérence du fléchage et la lisibilité des panneaux.",
};

// Create zones for a completed audit (all checked)
const createCompletedZones = (passRate: number): Zone[] => {
  const failRatio = (100 - passRate) / 100;

  return [
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
        { desc: 'Signalétique directionnelle visible', criteria: 'Panneaux visibles à 10m minimum', status: 'passed', aiNote: aiNotes.entrance },
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
      status: failRatio > 0.1 ? 'failed' : 'passed',
      completedChecks: 8,
      totalChecks: 8,
      issues: failRatio > 0.1 ? 1 : 0,
      checkpoints: createCheckpoints('z2', 'Accès', [
        { desc: 'Signalétique directionnelle visible', criteria: 'Panneaux visibles à 10m minimum', status: failRatio > 0.1 ? 'failed' : 'passed', operatorNote: failRatio > 0.1 ? 'Panneau partiellement masqué par végétation' : undefined },
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
      id: 'z3',
      name: 'Sortie Principale - Accès Sud',
      shortName: 'Sortie Sud',
      type: 'exit',
      status: 'passed',
      completedChecks: 6,
      totalChecks: 6,
      issues: 0,
      checkpoints: createCheckpoints('z3', 'Sortie', [
        { desc: 'Signalétique sortie visible', criteria: 'Panneaux "Sortie" visibles', status: 'passed', aiNote: aiNotes.exit },
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
      status: failRatio > 0.05 ? 'failed' : 'passed',
      completedChecks: 12,
      totalChecks: 12,
      issues: failRatio > 0.05 ? 2 : 0,
      checkpoints: createCheckpoints('z4', 'Village', [
        { desc: 'Plan d\'implantation respecté', criteria: 'Stands positionnés selon plan', status: 'passed', aiNote: aiNotes.village },
        { desc: 'Allées principales dégagées', criteria: 'Largeur min. 3m maintenue', status: failRatio > 0.08 ? 'failed' : 'passed', operatorNote: failRatio > 0.08 ? 'Matériel débordant sur allée' : undefined },
        { desc: 'Signalétique stands visible', criteria: 'Identification claire des partenaires', status: 'passed' },
        { desc: 'Points info présents', criteria: 'Bornes info aux carrefours', status: 'passed' },
        { desc: 'Poubelles en nombre suffisant', criteria: '1 poubelle / 50m²', status: 'passed' },
        { desc: 'Zone ombragée disponible', criteria: 'Espaces couverts accessibles', status: 'passed' },
        { desc: 'Points d\'eau identifiés', criteria: 'Fontaines signalées', status: 'passed' },
        { desc: 'Extincteurs visibles', criteria: '1 extincteur visible / zone', status: 'passed' },
        { desc: 'Issues de secours accessibles', criteria: 'Accès non obstrués', status: failRatio > 0.05 ? 'failed' : 'passed', operatorNote: failRatio > 0.05 ? 'Issue ouest obstruée' : undefined },
        { desc: 'Câblage sécurisé', criteria: 'Câbles protégés ou enterrés', status: 'passed' },
        { desc: 'Sanitaires accessibles', criteria: 'Fléchage vers sanitaires', status: 'passed' },
        { desc: 'Zone fumeur délimitée', criteria: 'Espace fumeur identifié', status: 'passed' },
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
      status: 'passed',
      completedChecks: 6,
      totalChecks: 6,
      issues: 0,
      checkpoints: createCheckpoints('z6', 'Cheminement', [
        { desc: 'Largeur conforme', criteria: 'Min. 4m pour flux bidirectionnel', status: 'passed', aiNote: aiNotes.pathway },
        { desc: 'Sol praticable', criteria: 'Surface plane et stable', status: 'passed' },
        { desc: 'Signalétique directionnelle', criteria: 'Fléchage aux intersections', status: 'passed' },
        { desc: 'Éclairage continu', criteria: 'Éclairage sur tout le parcours', status: 'passed' },
        { desc: 'Points de repère', criteria: 'Repères visuels identifiables', status: 'passed' },
        { desc: 'Zones de repos', criteria: 'Bancs ou espaces de pause', status: 'passed' },
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
        { desc: 'Continuité du barriérage', criteria: 'Aucune brèche visible', status: 'passed', aiNote: aiNotes.barrier },
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
      status: 'passed',
      completedChecks: 6,
      totalChecks: 6,
      issues: 0,
      checkpoints: createCheckpoints('z8', 'Signalétique', [
        { desc: 'Plan général visible', criteria: 'Plan à chaque entrée', status: 'passed', aiNote: aiNotes.signage },
        { desc: 'Fléchage toilettes', criteria: 'Directions vers sanitaires', status: 'passed' },
        { desc: 'Fléchage points d\'eau', criteria: 'Directions vers fontaines', status: 'passed' },
        { desc: 'Fléchage secours', criteria: 'Directions vers poste secours', status: 'passed' },
        { desc: 'Fléchage sorties', criteria: 'Directions vers sorties', status: 'passed' },
        { desc: 'Information programme', criteria: 'Horaires et activités affichés', status: 'passed' },
      ]),
    },
  ];
};

// Create zones for current (in-progress) audit
const createCurrentZones = (): Zone[] => [
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
      { desc: 'Signalétique directionnelle visible', criteria: 'Panneaux visibles à 10m minimum', status: 'passed', aiNote: aiNotes.entrance },
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
      { desc: 'Signalétique directionnelle visible', criteria: 'Panneaux visibles à 10m minimum', status: 'warning', operatorNote: 'Panneau partiellement masqué, à vérifier', aiNote: aiNotes.entrance },
      { desc: 'Cheminement dégagé', criteria: 'Largeur min. 2m, sans obstacle', status: 'passed' },
      { desc: 'Barriérage en place', criteria: 'Barrières continues et stables', status: 'passed' },
      { desc: 'Point de contrôle identifiable', criteria: 'Zone de filtrage clairement délimitée', status: 'passed' },
      { desc: 'Éclairage fonctionnel', criteria: 'Éclairage suffisant sur toute la zone', status: 'passed' },
      { desc: 'Accessibilité PMR', criteria: 'Rampe et signalétique PMR présentes', status: 'passed' },
      { desc: 'Issues de secours visibles', criteria: 'Panneaux sortie de secours illuminés', status: 'pending', aiNote: 'Vérifier l\'illumination de nuit' },
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
      { desc: 'Signalétique sortie visible', criteria: 'Panneaux "Sortie" visibles', status: 'passed', aiNote: aiNotes.exit },
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
      { desc: 'Plan d\'implantation respecté', criteria: 'Stands positionnés selon plan', status: 'passed', aiNote: aiNotes.village },
      { desc: 'Allées principales dégagées', criteria: 'Largeur min. 3m maintenue', status: 'failed', operatorNote: 'Matériel de stand débordant sur l\'allée principale' },
      { desc: 'Signalétique stands visible', criteria: 'Identification claire des partenaires', status: 'passed' },
      { desc: 'Points info présents', criteria: 'Bornes info aux carrefours', status: 'passed' },
      { desc: 'Poubelles en nombre suffisant', criteria: '1 poubelle / 50m²', status: 'warning', operatorNote: 'Manque 2 poubelles côté est' },
      { desc: 'Zone ombragée disponible', criteria: 'Espaces couverts accessibles', status: 'passed' },
      { desc: 'Points d\'eau identifiés', criteria: 'Fontaines signalées', status: 'passed' },
      { desc: 'Extincteurs visibles', criteria: '1 extincteur visible / zone', status: 'passed' },
      { desc: 'Issues de secours accessibles', criteria: 'Accès non obstrués', status: 'failed', operatorNote: 'Issue ouest obstruée par cartons' },
      { desc: 'Câblage sécurisé', criteria: 'Câbles protégés ou enterrés', status: 'passed' },
      { desc: 'Sanitaires accessibles', criteria: 'Fléchage vers sanitaires', status: 'pending', aiNote: 'Vérifier le fléchage depuis la zone restauration' },
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
      { desc: 'Largeur conforme', criteria: 'Min. 4m pour flux bidirectionnel', status: 'passed', aiNote: aiNotes.pathway },
      { desc: 'Sol praticable', criteria: 'Surface plane et stable', status: 'warning', operatorNote: 'Zone irrégulière sur 5m, risque de chute' },
      { desc: 'Signalétique directionnelle', criteria: 'Fléchage aux intersections', status: 'passed' },
      { desc: 'Éclairage continu', criteria: 'Éclairage sur tout le parcours', status: 'passed' },
      { desc: 'Points de repère', criteria: 'Repères visuels identifiables', status: 'pending', aiNote: 'Identifier les totems de repérage' },
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
      { desc: 'Continuité du barriérage', criteria: 'Aucune brèche visible', status: 'passed', aiNote: aiNotes.barrier },
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
      { desc: 'Plan général visible', criteria: 'Plan à chaque entrée', status: 'pending', aiNote: aiNotes.signage },
      { desc: 'Fléchage toilettes', criteria: 'Directions vers sanitaires', status: 'pending' },
      { desc: 'Fléchage points d\'eau', criteria: 'Directions vers fontaines', status: 'pending' },
      { desc: 'Fléchage secours', criteria: 'Directions vers poste secours', status: 'pending' },
      { desc: 'Fléchage sorties', criteria: 'Directions vers sorties', status: 'pending' },
      { desc: 'Information programme', criteria: 'Horaires et activités affichés', status: 'pending' },
    ]),
  },
];

// Create issues for a completed audit
const createIssuesForCompletedAudit = (auditId: string, passRate: number): Issue[] => {
  const issues: Issue[] = [];

  if (passRate < 95) {
    issues.push({
      id: `${auditId}-i1`,
      zoneId: 'z4',
      zoneName: 'Village',
      checkpointId: 'z4-cp-9',
      title: 'Issue de secours temporairement obstruée',
      description: 'Matériel stocké devant l\'issue. Déplacé pendant l\'audit.',
      severity: 'major',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000 * 2),
      resolvedAt: new Date(Date.now() - 86400000 * 2 + 3600000),
    });
  }

  if (passRate < 92) {
    issues.push({
      id: `${auditId}-i2`,
      zoneId: 'z2',
      zoneName: 'Entrée Est',
      checkpointId: 'z2-cp-1',
      title: 'Signalétique partiellement masquée',
      description: 'Panneau masqué par branche. Élagage effectué.',
      severity: 'minor',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000 * 2),
      resolvedAt: new Date(Date.now() - 86400000 * 2 + 7200000),
    });
  }

  if (passRate < 90) {
    issues.push({
      id: `${auditId}-i3`,
      zoneId: 'z4',
      zoneName: 'Village',
      checkpointId: 'z4-cp-2',
      title: 'Allée encombrée',
      description: 'Stand débordant. Recadré avec l\'exposant.',
      severity: 'major',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000 * 2),
      resolvedAt: new Date(Date.now() - 86400000 * 2 + 1800000),
    });
  }

  return issues;
};

// Issues for current audit
const currentIssues: Issue[] = [
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

// Create audit for a completed stage
const createCompletedAudit = (stageId: string, stageName: string, location: string, date: Date, passRate: number): Audit => {
  const zones = createCompletedZones(passRate);
  const totalChecks = zones.reduce((acc, z) => acc + z.totalChecks, 0);
  const issues = createIssuesForCompletedAudit(stageId, passRate);

  return {
    id: `audit-${stageId}`,
    stageId,
    name: stageName,
    location,
    date,
    status: 'completed',
    zones,
    issues,
    completedChecks: totalChecks,
    totalChecks,
    passRate,
    auditor: 'Jean-Pierre M.',
    startedAt: new Date(date.getTime() - 14400000),
    completedAt: new Date(date.getTime() - 3600000),
  };
};

// Create current audit
const currentZones = createCurrentZones();
const currentTotalChecks = currentZones.reduce((acc, z) => acc + z.totalChecks, 0);
const currentCompletedChecks = currentZones.reduce((acc, z) => acc + z.completedChecks, 0);
const currentPassedChecks = currentZones.reduce((acc, z) =>
  acc + z.checkpoints.filter(cp => cp.status === 'passed').length, 0);

const currentAuditData: Audit = {
  id: 'audit-current',
  stageId: 's7',
  name: 'Village Départ - Étape 7',
  location: 'Nantes',
  date: new Date(),
  status: 'in_progress',
  zones: currentZones,
  issues: currentIssues,
  completedChecks: currentCompletedChecks,
  totalChecks: currentTotalChecks,
  passRate: Math.round((currentPassedChecks / currentCompletedChecks) * 100) || 0,
  auditor: 'Jean-Pierre M.',
  startedAt: new Date(Date.now() - 14400000),
};

// All stages
export const stages: Stage[] = [
  // Completed stages
  {
    id: 's1',
    number: 1,
    name: 'Étape 1 - Grand Départ',
    location: 'Bilbao',
    date: new Date(Date.now() - 86400000 * 14),
    status: 'completed',
    audit: createCompletedAudit('s1', 'Village Départ - Étape 1', 'Bilbao', new Date(Date.now() - 86400000 * 14), 96),
  },
  {
    id: 's2',
    number: 2,
    name: 'Étape 2',
    location: 'Saint-Sébastien',
    date: new Date(Date.now() - 86400000 * 12),
    status: 'completed',
    audit: createCompletedAudit('s2', 'Village Départ - Étape 2', 'Saint-Sébastien', new Date(Date.now() - 86400000 * 12), 91),
  },
  {
    id: 's3',
    number: 3,
    name: 'Étape 3',
    location: 'Bayonne',
    date: new Date(Date.now() - 86400000 * 10),
    status: 'completed',
    audit: createCompletedAudit('s3', 'Village Départ - Étape 3', 'Bayonne', new Date(Date.now() - 86400000 * 10), 87),
  },
  {
    id: 's4',
    number: 4,
    name: 'Étape 4',
    location: 'Pau',
    date: new Date(Date.now() - 86400000 * 8),
    status: 'completed',
    audit: createCompletedAudit('s4', 'Village Départ - Étape 4', 'Pau', new Date(Date.now() - 86400000 * 8), 92),
  },
  {
    id: 's5',
    number: 5,
    name: 'Étape 5',
    location: 'Toulouse',
    date: new Date(Date.now() - 86400000 * 6),
    status: 'completed',
    audit: createCompletedAudit('s5', 'Village Départ - Étape 5', 'Toulouse', new Date(Date.now() - 86400000 * 6), 89),
  },
  {
    id: 's6',
    number: 6,
    name: 'Étape 6',
    location: 'Bordeaux',
    date: new Date(Date.now() - 86400000 * 4),
    status: 'completed',
    audit: createCompletedAudit('s6', 'Village Départ - Étape 6', 'Bordeaux', new Date(Date.now() - 86400000 * 4), 94),
  },
  // Current stage (live)
  {
    id: 's7',
    number: 7,
    name: 'Étape 7',
    location: 'Nantes',
    date: new Date(),
    status: 'live',
    audit: currentAuditData,
  },
  // Upcoming stages
  {
    id: 's8',
    number: 8,
    name: 'Étape 8',
    location: 'Limoges',
    date: new Date(Date.now() + 86400000 * 2),
    status: 'upcoming',
  },
  {
    id: 's9',
    number: 9,
    name: 'Étape 9',
    location: 'Clermont-Ferrand',
    date: new Date(Date.now() + 86400000 * 4),
    status: 'upcoming',
  },
  {
    id: 's10',
    number: 10,
    name: 'Étape 10',
    location: 'Lyon',
    date: new Date(Date.now() + 86400000 * 6),
    status: 'upcoming',
  },
  {
    id: 's11',
    number: 11,
    name: 'Étape 11',
    location: 'Grenoble',
    date: new Date(Date.now() + 86400000 * 8),
    status: 'upcoming',
  },
  {
    id: 's12',
    number: 12,
    name: 'Étape 12',
    location: 'Gap',
    date: new Date(Date.now() + 86400000 * 10),
    status: 'upcoming',
  },
];

// Export current audit (for backward compatibility)
export const currentAudit = currentAuditData;

// Get audit by stage ID
export const getAuditByStageId = (stageId: string): Audit | undefined => {
  const stage = stages.find(s => s.id === stageId);
  return stage?.audit;
};

// Get live stage
export const getLiveStage = (): Stage | undefined => {
  return stages.find(s => s.status === 'live');
};

// Get completed stages
export const getCompletedStages = (): Stage[] => {
  return stages.filter(s => s.status === 'completed');
};

// Get upcoming stages
export const getUpcomingStages = (): Stage[] => {
  return stages.filter(s => s.status === 'upcoming');
};

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

// Legacy export for history page
export const auditHistory = stages
  .filter(s => s.status === 'completed' && s.audit)
  .map(s => ({
    id: s.id,
    name: s.audit!.name,
    location: s.location,
    date: s.date,
    passRate: s.audit!.passRate,
    issuesFound: s.audit!.issues.length,
    issuesResolved: s.audit!.issues.filter(i => i.status === 'resolved').length,
  }))
  .reverse();
