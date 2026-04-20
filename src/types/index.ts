// Page types
export type PageId = 'dashboard' | 'zones' | 'checkpoints' | 'issues' | 'report' | 'history';

// Audit types
export type AuditStatus = 'pending' | 'in_progress' | 'completed';
export type CheckStatus = 'pending' | 'passed' | 'failed' | 'warning' | 'na';
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

// Stage/Event status
export type StageStatus = 'upcoming' | 'live' | 'completed';

// Stage/Étape (like Tour de France stage)
export interface Stage {
  id: string;
  number: number;
  name: string;
  location: string;
  date: Date;
  status: StageStatus;
  audit?: Audit;
}

// Zone in village
export interface Zone {
  id: string;
  name: string;
  shortName: string;
  type: 'entrance' | 'exit' | 'pathway' | 'sensitive' | 'barrier' | 'signage' | 'general';
  checkpoints: Checkpoint[];
  status: CheckStatus;
  completedChecks: number;
  totalChecks: number;
  issues: number;
}

// Notes for checkpoints
export interface CheckpointNotes {
  operator?: string;
  operatorAt?: Date;
  ai?: string;
  aiGeneratedAt?: Date;
}

// Individual checkpoint to verify
export interface Checkpoint {
  id: string;
  zoneId: string;
  category: string;
  description: string;
  criteria: string;
  status: CheckStatus;
  notes?: CheckpointNotes;
  photos?: string[];
  checkedAt?: Date;
  checkedBy?: string;
}

// Issue/anomaly found during audit
export interface Issue {
  id: string;
  zoneId: string;
  zoneName: string;
  checkpointId?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  photos?: string[];
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

// Audit event/stage
export interface Audit {
  id: string;
  stageId: string;
  name: string;
  location: string;
  date: Date;
  status: AuditStatus;
  zones: Zone[];
  issues: Issue[];
  completedChecks: number;
  totalChecks: number;
  passRate: number;
  auditor?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Historical audit for comparison (legacy - now we use Stage)
export interface AuditHistory {
  id: string;
  name: string;
  location: string;
  date: Date;
  passRate: number;
  issuesFound: number;
  issuesResolved: number;
}
