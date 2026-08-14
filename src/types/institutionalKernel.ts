// ============================================================================
// PNAP-AO • INSTITUTIONAL & OPERATIONAL KERNEL TYPES
// Arquitetura Formal: Entes, Pessoas, Funções, Missões, Turnos, Competências e Credenciais
// ============================================================================

export type OrgLevel = "MININT" | "DIRECAO_GERAL" | "DIRECAO_PROVINCIAL" | "ESTABELECIMENTO" | "SECCAO_SERVICO";
export type OrgType = 
  | "MINISTERIO" 
  | "DIRECAO_SUPERIOR" 
  | "DIRECAO_NACIONAL" 
  | "DIRECAO_PROVINCIAL" 
  | "ESTAB_PENITENCIARIO" 
  | "DEPARTAMENTO" 
  | "SECCAO" 
  | "REPARTICAO" 
  | "GABINETE"
  | "SERVICO_ESPECIALIZADO";

export interface OrgNode {
  id: string; // e.g. "ORG-MININT", "ORG-DGSP", "ORG-DP-LUA", "ORG-EP-VIANA", "ORG-SEC-CTRL-VIANA"
  name: string;
  code: string;
  level: OrgLevel;
  type: OrgType;
  parentId?: string | null;
  provinceCode?: string;
  prisonId?: string;
  headPersonId?: string;
  statutoryBasis?: string;
  active: boolean;
}

export type TerritoryLevel = "COUNTRY" | "PROVINCE" | "MUNICIPALITY" | "PRISON_FACILITY" | "PAVILION" | "BLOCK" | "CELL";

export interface TerritoryNode {
  id: string; // e.g. "GEO-AO", "GEO-PROV-LUA", "GEO-MUN-VIANA", "GEO-EP-VIANA", "GEO-PAV-A", "GEO-BLK-1", "GEO-CEL-101"
  name: string;
  code: string;
  level: TerritoryLevel;
  parentId?: string | null;
  provinceCode?: string;
  municipalityCode?: string;
  prisonId?: string;
  capacity?: number;
  currentOccupancy?: number;
  securityRegime?: "MAXIMO" | "MEDIO" | "MINIMO" | "TRANSITORIO" | "HOSPITALAR" | "DISCIPLINAR";
  active: boolean;
}

export type SpecialtyType = 
  | "OSA_COMANDO"
  | "OFICIAL_DIA"
  | "SARGENTO_DIA"
  | "SARGENTO_GUARDA"
  | "CONTROLO_PENAL"
  | "RESSOCIALIZACAO"
  | "ENFERMAGEM_SAUDE"
  | "LOGISTICA"
  | "RADIO_CCTV"
  | "MOTORISTA_TRANSPORTE"
  | "SEGURANCA_INSTITUCIONAL"
  | "DIRECTOR_ESTABELECIMENTO"
  | "INSPECTOR_SUPERVISAO"
  | "JURIDICO_CONTENCIOSO";

export type RankGrade = 
  | "COMISSARIO_PRISIONAL_PRINCIPAL"
  | "COMISSARIO_PRISIONAL"
  | "SUBCOMISSARIO_PRISIONAL"
  | "SUPERINTENDENTE_PRISIONAL_CHEFE"
  | "SUPERINTENDENTE_PRISIONAL"
  | "INTENDENTE_PRISIONAL"
  | "INSPECTOR_PRISIONAL_CHEFE"
  | "INSPECTOR_PRISIONAL"
  | "SUBINSPECTOR_PRISIONAL"
  | "PRIMEIRO_SUBCHEFE"
  | "SEGUNDO_SUBCHEFE"
  | "PRIMEIRO_AGENTE"
  | "SEGUNDO_AGENTE"
  | "GUARDA_PRISIONAL";

export interface Person {
  id: string; // UUID or string
  spNumber: string; // Canonical Institutional ID: "SP-000842"
  fullName: string;
  rank: RankGrade;
  primarySpecialty: SpecialtyType;
  secondarySpecialties?: SpecialtyType[];
  biNumber: string;
  nif?: string;
  phone?: string;
  email?: string;
  status: "ACTIVO" | "RESERVA" | "LICENCA" | "SUSPENSO" | "APOSENTADO";
  assignedOrgNodeId: string; // Current administrative assignment
  assignedProvinceCode: string;
  assignedPrisonId?: string;
  registeredAt: string;
  qualificationLevel?: string;
}

export type ShiftStatus = 
  | "DRAFT_DP"             // D-1 Preparado pela Direcção Provincial / EP
  | "SUBMITTED_TO_DG"      // Enviado para validação superior
  | "APPROVED_DG"          // Aprovado pela DG (Gera Missões & Credenciais)
  | "ACTIVE_IN_PROGRESS"   // Em execução operacional no terreno
  | "COMPLETED"            // Encerrado com relatório de turno
  | "REJECTED_DG";         // Devolvido pela DG para correção de escala

export interface ShiftSlot {
  slotId: string;
  specialty: SpecialtyType;
  roleLabel: string;
  requiredCount: number;
  assignedPersonIds: string[];
  mandatory: boolean;
}

export interface DutyShift {
  id: string; // e.g. "TURN-2026-08-15-EPV-01"
  prisonId: string;
  prisonName: string;
  provinceCode: string;
  shiftDate: string; // YYYY-MM-DD
  startTime: string; // "07:00"
  endTime: string;   // "19:00"
  shiftType: "DIURNO_12H" | "NOTURNO_12H" | "CONTINUO_24H" | "ESPECIAL_REFORCO";
  status: ShiftStatus;
  preparedByPersonId: string;
  preparedByPersonName: string;
  preparedAt: string;
  validatedByDgPersonId?: string;
  validatedByDgPersonName?: string;
  validatedAt?: string;
  rejectionReason?: string;
  slots: ShiftSlot[];
  totalPersonnel: number;
  osaPersonId?: string;
  osaPersonName?: string;
  generatedMissionCount?: number;
  notes?: string;
}

export type MissionStatus = "SCHEDULED" | "ACTIVE" | "EXPIRED" | "REVOKED";

export interface OperationalMission {
  id: string; // e.g. "MSN-2026-08-15-EPV-CTRL-001"
  shiftId: string;
  personId: string;
  spNumber: string;
  personName: string;
  rank: RankGrade;
  specialty: SpecialtyType;
  roleInShift: string;
  prisonId: string;
  prisonName: string;
  provinceCode: string;
  validFrom: string; // ISO DateTime
  validUntil: string; // ISO DateTime
  status: MissionStatus;
  authorizedActs: string[];
  restrictedActs: string[];
  supervisedByOsaId?: string;
  createdAt: string;
}

export interface TemporaryCredential {
  id: string; // e.g. "CRED-MSN-20260815-EPV-842"
  missionId: string;
  personId: string;
  spNumber: string;
  tokenHash: string; // Cryptographic session hash representation
  issuedAt: string;
  expiresAt: string;
  status: "VALID" | "EXPIRED" | "REVOKED";
  allowedActs: string[];
  scopePrisonId: string;
  scopeProvinceCode: string;
  signatureSeal: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedByPersonId?: string;
}

export type ActCategory = 
  | "JURIDICO_PENITENCIARIO"
  | "OPERACIONAL_MOVIMENTACAO"
  | "DISCIPLINA_SEGURANCA"
  | "CLINICO_SAUDE"
  | "RESSOCIALIZACAO"
  | "COMUNICACOES_CCTV"
  | "LOGISTICA_PATRIMONIO"
  | "ADMINISTRATIVO_ESTRUTURAL"
  | "AUDITORIA_INSPECAO";

export interface AuthorizationMatrixRule {
  actCode: string; // e.g. "REGISTAR_INGRESSO_RECLUSO"
  actName: string;
  category: ActCategory;
  description: string;
  allowedSpecialties: SpecialtyType[];
  allowedOrgLevels: OrgLevel[];
  allowedTerritorialScopes: ("NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT")[];
  requiresActiveMission: boolean;
  requiresOsaValidation: boolean;
  requiresDgAuthorization: boolean;
}

export interface AuthorizationEvaluationRequest {
  personId: string;
  spNumber: string;
  specialty: SpecialtyType;
  jurisdictionProvinceCode: string;
  jurisdictionPrisonId?: string;
  activeMissionId?: string;
  credentialToken?: string;
  targetActCode: string;
  targetEntityId?: string;
  targetEntityType?: string;
  requestTimestamp: string;
}

export interface AuthorizationEvaluationResult {
  authorized: boolean;
  decisionCode: "PERMITIDO" | "REJEITADO_SEM_MISSAO" | "REJEITADO_ESPECIALIDADE" | "REJEITADO_FORA_JURISDICAO" | "REJEITADO_CREDENCIAL_EXPIRADA" | "REJEITADO_REQUER_DG" | "REJEITADO_PESSOA_INATIVA";
  reason: string;
  evaluatedRule?: AuthorizationMatrixRule;
  evidenceTuple: {
    actorSp: string;
    entity: string;
    act: string;
    jurisdiction: string;
    mission: string;
    timestamp: string;
    authorization: string;
    result: string;
  };
}

export interface KernelAuditRecord {
  id: string; // e.g. "AUD-KRN-20260815-0001"
  timestamp: string;
  actorPersonId: string;
  actorSpNumber: string;
  actorName: string;
  actorRank: string;
  actorSpecialty: SpecialtyType;
  entityTargetType: string; // "RECLUSO" | "TURNO" | "ESTRUTURA" | "CELA" | "GUIA_TRANSITO" | "OCORRENCIA" | "CREDENCIAL"
  entityTargetId: string;
  actCode: string;
  actName: string;
  jurisdictionPrisonId: string;
  jurisdictionPrisonName: string;
  jurisdictionProvinceCode: string;
  missionId: string;
  credentialId?: string;
  authorized: boolean;
  authorizationRuleCode: string;
  resultStatus: "SUCCESS" | "BLOCKED" | "WARNING" | "SYSTEM_ERROR";
  description: string;
  payloadHash: string;
}
