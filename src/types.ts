export interface FollowUpLog {
  id: string;
  date: string;
  officerName: string;
  actionTaken: string;
  nextSteps?: string;
}

export interface Condition {
  id: string;
  condition: string;
  expectedDate: string;
  followUpDate?: string;
  followUpAction?: string;
  isMet: boolean;
  dateMet?: string;
  logs: FollowUpLog[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  action: string;
  details: string;
}

export interface Exemption {
  id: string;
  customerName: string;
  accountNumber: string;
  loanAmount: number;
  currency?: string;
  loanPurpose: string;
  creditStatus: string;
  exemptionReason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'ESCALATED';
  dateRequested: string;
  dateGranted?: string;
  riskScore?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigations: string[];
  officerName: string;
  officerId: string;
  officerContact: string;
  notes?: string;
  originBranch?: string;
  creditAppRef?: string;
  conditions: Condition[];
  auditTrail: AuditLog[];
  supportingDocuments?: Array<{ name: string; size: number; type: string; dataUrl?: string }>;
}
