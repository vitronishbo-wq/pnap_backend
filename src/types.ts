export enum SystemPermission {
  VIEW_INMATES = "VIEW_INMATES",
  ADMIT_INMATE = "ADMIT_INMATE",
  MOVE_INMATE = "MOVE_INMATE", // Represents any transfers, cell changes, court escorts, hospital visits, etc.
  APPROVE_RELEASE = "APPROVE_RELEASE",
  VIEW_INCIDENTS = "VIEW_INCIDENTS",
  CREATE_INCIDENT = "CREATE_INCIDENT",
  VIEW_INTELLIGENCE = "VIEW_INTELLIGENCE", // Secret level Intelligence Reports
  CREATE_INTELLIGENCE = "CREATE_INTELLIGENCE",
  VIEW_CLINICAL = "VIEW_CLINICAL", // Confidential level Medical Records
  EDIT_CLINICAL = "EDIT_CLINICAL",
  VIEW_AUDITING = "VIEW_AUDITING", // National Audit Center
  MANAGE_DELEGATIONS = "MANAGE_DELEGATIONS",
  GENERATE_REPORTS = "GENERATE_REPORTS",
  SYSTEM_CONFIG = "SYSTEM_CONFIG"
}

export enum TerritorialScope {
  NATIONAL = "NATIONAL",
  PROVINCIAL = "PROVINCIAL",
  ESTABLISHMENT = "ESTABLISHMENT"
}

export enum FunctionalScope {
  GERAL = "GERAL",
  SEGURANCA = "SEGURANCA",
  INTELIGENCIA = "INTELIGENCIA",
  SAUDE = "SAUDE"
}

export enum InformationClassification {
  PUBLIC = "PUBLIC",
  RESTRICTED = "RESTRICTED",
  CONFIDENTIAL = "CONFIDENTIAL",
  SECRET = "SECRET"
}

export interface SystemRole {
  id: string; // e.g. "PRISON_DIRECTOR"
  name: string; // e.g. "Director da Cadeia"
  permissions: SystemPermission[];
  defaultFunctionalScope: FunctionalScope;
}

export interface OrganizationalUnit {
  id: string;
  name: string;
  level: TerritorialScope;
  parentId?: string;
  province?: string;
  prisonId?: string;
}

export interface Delegation {
  id: string;
  delegatorId: string; // operator ID who is delegating
  delegateeId: string; // operator ID receiving power
  roleId: string; // SystemRole ID being delegated
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  status: "ACTIVE" | "REVOKED" | "SCHEDULED" | "EXPIRED";
  reason: string;
  auditHash: string;
  statusHistory?: {
    status: "ACTIVE" | "REVOKED" | "SCHEDULED" | "EXPIRED";
    timestamp: string;
    operatorName: string;
    details: string;
  }[];
}

export interface InmateMovement {
  id: string; // e.g. "MOV-2026-0012"
  inmateId: string;
  inmateName: string;
  movementType: "ADMISSION" | "CELL_CHANGE" | "TRANSFER" | "COURT" | "HOSPITAL" | "RELEASE" | "DEATH";
  sourceUnitId?: string; // from (Prison / Ward / Cell)
  destinationUnitId?: string; // to (Prison / Ward / Cell)
  sourceLocName?: string;
  destinationLocName?: string;
  dateScheduled: string;
  dateExecuted?: string;
  status: "SCHEDULED" | "IN_TRANSIT" | "EXECUTED" | "CANCELLED" | "PENDING_APPROVAL";
  reason: string;
  operatorId: string; // Who authorized
  escortDetails?: string; // escort force
  digitalSignatureId?: string; // document link
  classification: InformationClassification;
  approvedBy?: string; // Operator ID who approved
  approvedByName?: string; // Operator Name who approved
  dateApproved?: string; // ISO date-time of approval
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  roleName: string;
  actionType: "LOGIN" | "LOGOUT" | "VIEW_INMATE" | "EXPORT_PDF" | "DOWNLOAD" | "TRANSFER_EXECUTE" | "CELL_CHANGE_EXECUTE" | "RELEASE_EXECUTE" | "LOGICAL_DELETE" | "DELEGATION_CREATE" | "PRINT_REPORT" | "MUNICIPALITY_CREATE" | "MUNICIPALITY_UPDATE" | "MUNICIPALITY_DELETE" | "PRISON_CREATE" | "PRISON_UPDATE" | "PRISON_DELETE" | "PAVILION_CREATE" | "PAVILION_UPDATE" | "PAVILION_DELETE" | "CELL_CREATE" | "CELL_UPDATE" | "CELL_DELETE";
  targetEntity: string; // Table or business concept
  targetId?: string; // Affected ID
  description: string;
  deviceIp: string;
  securityClassification: InformationClassification;
  integrityHash: string;
}

export interface DocumentSignature {
  id: string;
  documentId: string;
  signerName: string;
  signerRole: string;
  signerId: string;
  timestamp: string;
  sha256Hash: string;
  institutionalStamp: string; // e.g., "ASSINADO ELETRONICAMENTE - PNAP-AO"
}

export interface PrisonState {
  id: string;
  name: string;
  location: string;
  officialCapacity: number;
  operationalCapacity: number;
  currentOccupancy: number;
  riskBreakdown: { "Baixo": number; "Médio": number; "Alto": number; "Máximo": number };
  pavilions: any[];
  municipalityId: string;
}
