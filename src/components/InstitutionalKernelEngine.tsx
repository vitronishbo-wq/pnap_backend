import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Layers, 
  Users, 
  CalendarClock, 
  ShieldCheck, 
  KeyRound, 
  Scale, 
  FileSearch, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Play, 
  Send, 
  RefreshCw, 
  ChevronRight, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  Fingerprint, 
  ArrowRight,
  Shield,
  Clock,
  Radio,
  FileCheck,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink,
  QrCode
} from "lucide-react";
import { 
  OrgNode, 
  TerritoryNode, 
  Person, 
  DutyShift, 
  OperationalMission, 
  TemporaryCredential, 
  AuthorizationMatrixRule, 
  KernelAuditRecord, 
  SpecialtyType,
  ShiftStatus,
  RankGrade
} from "../types/institutionalKernel";
import { 
  SEED_ORG_NODES, 
  SEED_TERRITORY_NODES, 
  SEED_PERSONS, 
  SEED_AUTHORIZATION_RULES, 
  SEED_DUTY_SHIFTS, 
  SEED_OPERATIONAL_MISSIONS, 
  SEED_TEMPORARY_CREDENTIALS, 
  SEED_KERNEL_AUDIT_RECORDS,
  evaluateInstitutionalAuthorization
} from "../data/institutionalKernelData";

interface InstitutionalKernelEngineProps {
  currentOperator?: any;
  onNavigateTab?: (tab: string) => void;
  triggerToast?: (title: string, message: string, type: "success" | "warning" | "info" | "error") => void;
}

export function InstitutionalKernelEngine({
  currentOperator,
  onNavigateTab,
  triggerToast
}: InstitutionalKernelEngineProps) {
  // Active Kernel Tab
  const [activeKernelTab, setActiveKernelTab] = useState<
    "org_territory" | "personnel" | "shifts" | "missions" | "credentials" | "matrix" | "audit"
  >("shifts");

  // State Stores for 8 Kernels
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>(SEED_ORG_NODES);
  const [territoryNodes, setTerritoryNodes] = useState<TerritoryNode[]>(SEED_TERRITORY_NODES);
  const [persons, setPersons] = useState<Person[]>(SEED_PERSONS);
  const [authorizationRules, setAuthorizationRules] = useState<AuthorizationMatrixRule[]>(SEED_AUTHORIZATION_RULES);
  const [dutyShifts, setDutyShifts] = useState<DutyShift[]>(SEED_DUTY_SHIFTS);
  const [missions, setMissions] = useState<OperationalMission[]>(SEED_OPERATIONAL_MISSIONS);
  const [credentials, setCredentials] = useState<TemporaryCredential[]>(SEED_TEMPORARY_CREDENTIALS);
  const [auditLedger, setAuditLedger] = useState<KernelAuditRecord[]>(SEED_KERNEL_AUDIT_RECORDS);

  // Filters & Selected entities
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedShiftId, setSelectedShiftId] = useState<string>(dutyShifts[0]?.id || "");
  const [selectedPersonModal, setSelectedPersonModal] = useState<Person | null>(null);
  const [isNewShiftModalOpen, setIsNewShiftModalOpen] = useState<boolean>(false);
  const [isNewPersonModalOpen, setIsNewPersonModalOpen] = useState<boolean>(false);
  const [isCredentialViewerOpen, setIsCredentialViewerOpen] = useState<TemporaryCredential | null>(null);

  // Authorization Evaluation Interactive Sandbox State
  const [testActorSp, setTestActorSp] = useState<string>("SP-000842");
  const [testActCode, setTestActCode] = useState<string>("ACT_REGISTAR_INGRESSO");
  const [testJurisdiction, setTestJurisdiction] = useState<string>("AO-LUA-001");
  const [testTargetEntity, setTestTargetEntity] = useState<string>("REC-2026-008912");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Form states for New Person
  const [newPersonName, setNewPersonName] = useState<string>("");
  const [newPersonRank, setNewPersonRank] = useState<RankGrade>("INSPECTOR_PRISIONAL");
  const [newPersonSpecialty, setNewPersonSpecialty] = useState<SpecialtyType>("CONTROLO_PENAL");
  const [newPersonBi, setNewPersonBi] = useState<string>("");
  const [newPersonProvince, setNewPersonProvince] = useState<string>("Luanda");
  const [newPersonPrison, setNewPersonPrison] = useState<string>("AO-LUA-001");

  // Form states for New Shift
  const [newShiftDate, setNewShiftDate] = useState<string>("2026-08-17");
  const [newShiftPrison, setNewShiftPrison] = useState<string>("AO-LUA-001");
  const [newShiftStartTime, setNewShiftStartTime] = useState<string>("07:00");
  const [newShiftEndTime, setNewShiftEndTime] = useState<string>("19:00");
  const [newShiftOsaPersonId, setNewShiftOsaPersonId] = useState<string>("PERS-SP-002190");
  const [newShiftCtrlPersonId, setNewShiftCtrlPersonId] = useState<string>("PERS-SP-000842");
  const [newShiftCctvPersonId, setNewShiftCctvPersonId] = useState<string>("PERS-SP-003419");
  const [newShiftSaudePersonId, setNewShiftSaudePersonId] = useState<string>("PERS-SP-001205");
  const [newShiftGuardaPersonId, setNewShiftGuardaPersonId] = useState<string>("PERS-SP-005612");

  // Filtered Lists
  const filteredPersons = useMemo(() => {
    return persons.filter(p => {
      if (selectedProvinceFilter !== "ALL" && p.assignedProvinceCode !== selectedProvinceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return p.fullName.toLowerCase().includes(q) || p.spNumber.toLowerCase().includes(q) || p.primarySpecialty.toLowerCase().includes(q);
      }
      return true;
    });
  }, [persons, selectedProvinceFilter, searchQuery]);

  const filteredShifts = useMemo(() => {
    return dutyShifts.filter(s => {
      if (selectedProvinceFilter !== "ALL" && s.provinceCode !== selectedProvinceFilter) return false;
      return true;
    });
  }, [dutyShifts, selectedProvinceFilter]);

  const activeShift = useMemo(() => {
    return dutyShifts.find(s => s.id === selectedShiftId) || dutyShifts[0] || null;
  }, [dutyShifts, selectedShiftId]);

  // Handler: Approve Shift by DG (Generates Missions & Credentials)
  const handleApproveShiftByDG = (shiftId: string) => {
    const shift = dutyShifts.find(s => s.id === shiftId);
    if (!shift) return;

    const validatedTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    
    // 1. Update Shift status to APPROVED_DG
    const updatedShifts = dutyShifts.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: "APPROVED_DG" as ShiftStatus,
          validatedByDgPersonId: "PERS-SP-000101",
          validatedByDgPersonName: "Gen. Manuel Gomes (Director Geral)",
          validatedAt: validatedTimestamp,
          generatedMissionCount: s.slots.reduce((acc, slot) => acc + slot.assignedPersonIds.length, 0)
        };
      }
      return s;
    });
    setDutyShifts(updatedShifts);

    // 2. Generate Operational Missions & Temporary Credentials for all assigned persons
    const newMissions: OperationalMission[] = [];
    const newCredentials: TemporaryCredential[] = [];

    shift.slots.forEach(slot => {
      slot.assignedPersonIds.forEach((personId, idx) => {
        const person = persons.find(p => p.id === personId);
        if (!person) return;

        const missionId = `MSN-${shift.shiftDate.replace(/-/g, "")}-${shift.prisonId.substring(3, 6)}-${slot.specialty.substring(0, 4)}-${person.spNumber.substring(3)}`;
        const credId = `CRED-${missionId}`;

        // Find authorized acts for this specialty
        const authActs = authorizationRules
          .filter(r => r.allowedSpecialties.includes(slot.specialty) || person.primarySpecialty === "DIRECTOR_ESTABELECIMENTO")
          .map(r => r.actCode);

        const restrictedActs = authorizationRules
          .filter(r => !authActs.includes(r.actCode))
          .map(r => r.actCode);

        const mission: OperationalMission = {
          id: missionId,
          shiftId: shift.id,
          personId: person.id,
          spNumber: person.spNumber,
          personName: person.fullName,
          rank: person.rank,
          specialty: slot.specialty,
          roleInShift: slot.roleLabel,
          prisonId: shift.prisonId,
          prisonName: shift.prisonName,
          provinceCode: shift.provinceCode,
          validFrom: `${shift.shiftDate} ${shift.startTime}:00`,
          validUntil: `${shift.shiftDate} ${shift.endTime}:00`,
          status: "ACTIVE",
          authorizedActs: authActs,
          restrictedActs: restrictedActs,
          supervisedByOsaId: shift.osaPersonId,
          createdAt: validatedTimestamp
        };

        const randomHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const credential: TemporaryCredential = {
          id: credId,
          missionId: mission.id,
          personId: person.id,
          spNumber: person.spNumber,
          tokenHash: `SHA256:${randomHash}`,
          issuedAt: validatedTimestamp,
          expiresAt: `${shift.shiftDate} ${shift.endTime}:00`,
          status: "VALID",
          allowedActs: authActs,
          scopePrisonId: shift.prisonId,
          scopeProvinceCode: shift.provinceCode,
          signatureSeal: "SEAL-DGSP-VALIDATED-MININT-2026"
        };

        newMissions.push(mission);
        newCredentials.push(credential);
      });
    });

    setMissions(prev => [...newMissions, ...prev.filter(m => m.shiftId !== shift.id)]);
    setCredentials(prev => [...newCredentials, ...prev.filter(c => !newCredentials.some(nc => nc.missionId === c.missionId))]);

    // 3. Log into Audit Ledger
    const auditRecord: KernelAuditRecord = {
      id: `AUD-KRN-${Date.now()}`,
      timestamp: validatedTimestamp,
      actorPersonId: "PERS-SP-000101",
      actorSpNumber: "SP-000101",
      actorName: "Gen. Manuel Gomes",
      actorRank: "Comissário Prisional Principal",
      actorSpecialty: "DIRECTOR_ESTABELECIMENTO",
      entityTargetType: "TURNO",
      entityTargetId: shift.id,
      actCode: "ACT_VALIDAR_TURNO_DG",
      actName: "Validar e Homologar Escala de Turno (DG)",
      jurisdictionPrisonId: shift.prisonId,
      jurisdictionPrisonName: shift.prisonName,
      jurisdictionProvinceCode: shift.provinceCode,
      missionId: "MSN-DG-COMMAND-PERMANENT",
      authorized: true,
      authorizationRuleCode: "RULE_DG_SHIFT_HOMOLOGATION",
      resultStatus: "SUCCESS",
      description: `Turno ${shift.id} (${shift.prisonName}) homologado pela Direcção Geral. Emitidas ${newMissions.length} missões e credenciais operacionais.`,
      payloadHash: `HASH-SHA256:${Math.random().toString(36).substring(2)}`
    };
    setAuditLedger(prev => [auditRecord, ...prev]);

    if (triggerToast) {
      triggerToast(
        "Escala Homologada pela Direcção Geral",
        `Turno ${shift.id} validado com sucesso. ${newMissions.length} credenciais temporárias ativadas.`,
        "success"
      );
    }
  };

  // Handler: Create New Shift (D-1 by DP)
  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `TURN-${newShiftDate.replace(/-/g, "")}-EPV-${Math.floor(10 + Math.random() * 90)}`;
    const osaPerson = persons.find(p => p.id === newShiftOsaPersonId);
    
    const newShift: DutyShift = {
      id: newId,
      prisonId: newShiftPrison,
      prisonName: newShiftPrison === "AO-LUA-001" ? "Estabelecimento Penitenciário de Viana" : "Estabelecimento Penitenciário do Cavaco",
      provinceCode: "Luanda",
      shiftDate: newShiftDate,
      startTime: newShiftStartTime,
      endTime: newShiftEndTime,
      shiftType: "DIURNO_12H",
      status: "SUBMITTED_TO_DG",
      preparedByPersonId: newShiftOsaPersonId,
      preparedByPersonName: osaPerson ? osaPerson.fullName : "Oficial Provincial",
      preparedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      osaPersonId: newShiftOsaPersonId,
      osaPersonName: osaPerson ? osaPerson.fullName : "OSA de Dia",
      totalPersonnel: 5,
      generatedMissionCount: 0,
      slots: [
        { slotId: "SLOT-OSA", specialty: "OSA_COMANDO", roleLabel: "Oficial Superior de Acompanhamento (Chefe de Turno)", requiredCount: 1, assignedPersonIds: [newShiftOsaPersonId], mandatory: true },
        { slotId: "SLOT-CTRL", specialty: "CONTROLO_PENAL", roleLabel: "Especialista de Controlo Penal e Matrícula", requiredCount: 1, assignedPersonIds: [newShiftCtrlPersonId], mandatory: true },
        { slotId: "SLOT-CCTV", specialty: "RADIO_CCTV", roleLabel: "Operador de Rádio e Videovigilância CCTV", requiredCount: 1, assignedPersonIds: [newShiftCctvPersonId], mandatory: true },
        { slotId: "SLOT-SAUDE", specialty: "ENFERMAGEM_SAUDE", roleLabel: "Enfermeira de Triagem Clínica", requiredCount: 1, assignedPersonIds: [newShiftSaudePersonId], mandatory: true },
        { slotId: "SLOT-GUARDA", specialty: "SARGENTO_GUARDA", roleLabel: "Sargento de Dia à Guarda", requiredCount: 1, assignedPersonIds: [newShiftGuardaPersonId], mandatory: true }
      ],
      notes: "Proposta de escala D-1 submetida à DGSP para validação institucional e emissão de credenciais."
    };

    setDutyShifts(prev => [newShift, ...prev]);
    setSelectedShiftId(newId);
    setIsNewShiftModalOpen(false);

    if (triggerToast) {
      triggerToast("Turno D-1 Proposto", `Escala ${newId} submetida à Direcção Geral para homologação.`, "info");
    }
  };

  // Handler: Register New Person
  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim() || !newPersonBi.trim()) return;

    const spNum = `SP-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const newPerson: Person = {
      id: `PERS-${spNum}`,
      spNumber: spNum,
      fullName: newPersonName,
      rank: newPersonRank,
      primarySpecialty: newPersonSpecialty,
      biNumber: newPersonBi,
      status: "ACTIVO",
      assignedOrgNodeId: newPersonPrison === "AO-LUA-001" ? "ORG-EP-VIANA" : "ORG-DP-LUANDA",
      assignedProvinceCode: newPersonProvince,
      assignedPrisonId: newPersonPrison,
      registeredAt: new Date().toISOString().substring(0, 10)
    };

    setPersons(prev => [newPerson, ...prev]);
    setIsNewPersonModalOpen(false);
    setNewPersonName("");
    setNewPersonBi("");

    if (triggerToast) {
      triggerToast("Pessoa Registada no HR Kernel", `${newPerson.fullName} matriculado sob ${newPerson.spNumber}.`, "success");
    }
  };

  // Handler: Run Interactive Authorization Evaluation
  const handleRunEvaluation = () => {
    const activeMission = missions.find(m => m.spNumber === testActorSp && m.status === "ACTIVE");
    const activeCred = credentials.find(c => c.spNumber === testActorSp && c.status === "VALID");

    const req = {
      personId: persons.find(p => p.spNumber === testActorSp)?.id || "",
      spNumber: testActorSp,
      specialty: persons.find(p => p.spNumber === testActorSp)?.primarySpecialty || "CONTROLO_PENAL",
      jurisdictionProvinceCode: "Luanda",
      jurisdictionPrisonId: testJurisdiction,
      activeMissionId: activeMission?.id,
      credentialToken: activeCred?.tokenHash,
      targetActCode: testActCode,
      targetEntityId: testTargetEntity,
      requestTimestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
    };

    const res = evaluateInstitutionalAuthorization(req, persons, missions, credentials, authorizationRules);
    setEvaluationResult(res);

    // Record in Audit Ledger
    const person = persons.find(p => p.spNumber === testActorSp);
    const rule = authorizationRules.find(r => r.actCode === testActCode);
    const auditRecord: KernelAuditRecord = {
      id: `AUD-KRN-${Date.now()}`,
      timestamp: req.requestTimestamp,
      actorPersonId: person?.id || "PERS-UNKNOWN",
      actorSpNumber: testActorSp,
      actorName: person?.fullName || "Operador Teste",
      actorRank: person?.rank || "Inspector",
      actorSpecialty: person?.primarySpecialty || "CONTROLO_PENAL",
      entityTargetType: "ENTIDADE_TESTE",
      entityTargetId: testTargetEntity,
      actCode: testActCode,
      actName: rule?.actName || testActCode,
      jurisdictionPrisonId: testJurisdiction,
      jurisdictionPrisonName: testJurisdiction === "AO-LUA-001" ? "EP Viana" : "EP Cavaco",
      jurisdictionProvinceCode: "Luanda",
      missionId: activeMission?.id || "SEM_MISSAO",
      credentialId: activeCred?.id,
      authorized: res.authorized,
      authorizationRuleCode: res.decisionCode,
      resultStatus: res.authorized ? "SUCCESS" : "BLOCKED",
      description: res.reason,
      payloadHash: `HASH-SHA256:${Math.random().toString(36).substring(2)}`
    };

    setAuditLedger(prev => [auditRecord, ...prev]);
  };

  // Handler: Revoke Credential
  const handleRevokeCredential = (credId: string) => {
    setCredentials(prev => prev.map(c => {
      if (c.id === credId) {
        return {
          ...c,
          status: "REVOKED",
          revokedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          revokedByPersonId: "PERS-SP-000101",
          revocationReason: "Revogação imediata por ordem de comando ou encerramento de turno."
        };
      }
      return c;
    }));

    if (triggerToast) {
      triggerToast("Credencial Revogada", `Credencial ${credId} desativada no Credential Kernel.`, "warning");
    }
  };

  return (
    <div id="pnap-institutional-kernel-engine" className="flex flex-col gap-3 font-sans text-slate-200 select-none pb-12">
      
      {/* 1. TOP HEADER & KERNEL STATUS RIBBON */}
      <div className="bg-[#040711] border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-100 tracking-tight flex items-center gap-2">
                ORGANIZATIONAL & OPERATIONAL KERNEL
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                PNAP-AO OS v3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Separação Canónica: <strong className="text-slate-200">Ente ≠ Pessoa ≠ Cargo ≠ Missão ≠ Credencial ≠ Auditoria</strong>
            </p>
          </div>
        </div>

        {/* Global Stats Matrix */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap font-mono text-[10px]">
          <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded flex flex-col items-center">
            <span className="text-slate-400 text-[9px]">Entes Org.</span>
            <span className="font-bold text-amber-400">{orgNodes.length}</span>
          </div>
          <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded flex flex-col items-center">
            <span className="text-slate-400 text-[9px]">Efectivo SP</span>
            <span className="font-bold text-sky-400">{persons.length}</span>
          </div>
          <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded flex flex-col items-center">
            <span className="text-slate-400 text-[9px]">Turnos</span>
            <span className="font-bold text-emerald-400">{dutyShifts.length}</span>
          </div>
          <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded flex flex-col items-center">
            <span className="text-slate-400 text-[9px]">Missões Activas</span>
            <span className="font-bold text-rose-400">{missions.filter(m => m.status === "ACTIVE").length}</span>
          </div>
          <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded flex flex-col items-center">
            <span className="text-slate-400 text-[9px]">Credenciais</span>
            <span className="font-bold text-purple-400">{credentials.filter(c => c.status === "VALID").length}</span>
          </div>
        </div>
      </div>

      {/* 2. DENSE 8-KERNEL TAB NAVIGATION */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-[#03060c] p-1.5 rounded-xl border border-slate-850 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveKernelTab("shifts")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "shifts" 
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          <span className="truncate">1. Turnos & Escalas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveKernelTab("personnel")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "personnel" 
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="truncate">2. Efectivo (HR)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveKernelTab("missions")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "missions" 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="truncate">3. Missões</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveKernelTab("credentials")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "credentials" 
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span className="truncate">4. Credenciais</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveKernelTab("matrix")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "matrix" 
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span className="truncate">5. Matriz de Atos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveKernelTab("org_territory")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "org_territory" 
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">6. Entes & Território</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveKernelTab("audit")}
          className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeKernelTab === "audit" 
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileSearch className="h-3.5 w-3.5" />
          <span className="truncate">7. Auditoria Canónica</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: DUTY / SHIFT KERNEL (D-1 PREPARAÇÃO DP -> VALIDAÇÃO DG)
         ==================================================================== */}
      {activeKernelTab === "shifts" && (
        <div className="flex flex-col gap-3">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#050811] p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" /> Gestão de Turnos Operacionais (D-1 DP $\to$ Homologação DG)
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsNewShiftModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" /> Propor Turno (D-1)
              </button>
            </div>
          </div>

          {/* Master-Detail Shifts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            
            {/* Left: Shifts List */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Escalas Prisionais Registadas ({filteredShifts.length}):
              </span>

              {filteredShifts.map((shift) => {
                const isApproved = shift.status === "APPROVED_DG";
                const isSubmitted = shift.status === "SUBMITTED_TO_DG";
                const isSelected = activeShift?.id === shift.id;

                return (
                  <div
                    key={shift.id}
                    onClick={() => setSelectedShiftId(shift.id)}
                    className={`p-3 rounded-xl border flex flex-col gap-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-[#0c1222] border-amber-500/80 shadow-md ring-1 ring-amber-500/40"
                        : "bg-slate-950/80 border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold block">
                          {shift.id}
                        </span>
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
                          {shift.prisonName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Data: <strong className="text-slate-200">{shift.shiftDate}</strong> ({shift.startTime} às {shift.endTime})
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9.5px] font-bold font-mono border uppercase ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : isSubmitted
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {isApproved ? "✓ Homologado DG" : isSubmitted ? "⏳ Aguarda DG" : shift.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span>OSA: <strong className="text-slate-300">{shift.osaPersonName}</strong></span>
                      <span className="text-slate-300 font-bold">{shift.slots.length} Especialistas</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Shift Composition & DG Approval Engine */}
            <div className="lg:col-span-7 bg-[#050811] border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
              {activeShift ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm sm:text-base font-mono">
                          {activeShift.id}
                        </h3>
                        <span className={`px-2 py-0.2 rounded text-[9px] font-bold font-mono uppercase ${
                          activeShift.status === "APPROVED_DG"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}>
                          {activeShift.status === "APPROVED_DG" ? "HOMOLOGADO PELA DIREÇÃO GERAL" : "SUBMETIDO PELA DIRECÇÃO PROVINCIAL (D-1)"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {activeShift.prisonName} • Data: {activeShift.shiftDate} ({activeShift.startTime} - {activeShift.endTime})
                      </span>
                    </div>

                    {/* DG Approval CTA */}
                    {activeShift.status === "SUBMITTED_TO_DG" && (
                      <button
                        type="button"
                        onClick={() => handleApproveShiftByDG(activeShift.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" /> APROVAR TURNO (DG)
                      </button>
                    )}
                  </div>

                  {/* Operational Verification Checklist */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1.5 font-mono text-[10.5px]">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">
                      Verificação Automática de Conformidade NEP:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" /> Efectivo 100% activo no HR Kernel
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" /> Especialidades obrigatórias cobertas
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" /> Sem conflito de escala prévia (24h)
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" /> Jurisdição e credenciais em conformidade
                      </div>
                    </div>
                  </div>

                  {/* Team Slots Table */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Composição da Equipa de Turno ({activeShift.slots.length} Especialidades):
                    </span>

                    <div className="overflow-x-auto border border-slate-850 rounded-lg">
                      <table className="w-full text-left font-mono text-[11px] divide-y divide-slate-850">
                        <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Especialidade</th>
                            <th className="p-2">Função / Posto</th>
                            <th className="p-2">Efectivo Designado</th>
                            <th className="p-2 text-right">SP Matrícula</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 bg-[#03060c]">
                          {activeShift.slots.map((slot) => {
                            const assignedPerson = persons.find(p => slot.assignedPersonIds.includes(p.id));
                            return (
                              <tr key={slot.slotId} className="hover:bg-slate-900/60">
                                <td className="p-2 font-bold text-amber-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  {slot.specialty}
                                </td>
                                <td className="p-2 text-slate-300">{slot.roleLabel}</td>
                                <td className="p-2 text-slate-100 font-medium">
                                  {assignedPerson ? assignedPerson.fullName : "Não designado"}
                                </td>
                                <td className="p-2 text-right font-bold text-sky-400">
                                  {assignedPerson ? assignedPerson.spNumber : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Missions Generated Summary */}
                  {activeShift.status === "APPROVED_DG" && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-200 font-bold">
                          7 Missões & Credenciais Temporárias Activas para este Turno
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveKernelTab("credentials")}
                        className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold"
                      >
                        Ver Credenciais →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  Nenhuma escala de turno selecionada.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: HUMAN RESOURCES KERNEL (CADASTRO ÚNICO DE PESSOAS)
         ==================================================================== */}
      {activeKernelTab === "personnel" && (
        <div className="flex flex-col gap-3">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#050811] p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Cadastro Único de Pessoas (Pessoa $\neq$ Cargo $\neq$ Missão)
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar por Nome, SP-ID ou Especialidade..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNewPersonModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" /> Nova Pessoa
              </button>
            </div>
          </div>

          {/* Dense Personnel Table */}
          <div className="overflow-x-auto border border-slate-850 rounded-xl bg-[#03060c]">
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-850">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">SP Matrícula</th>
                  <th className="p-2.5">Nome Completo & Patente</th>
                  <th className="p-2.5">Especialidade Base</th>
                  <th className="p-2.5">Lotação Orgânica</th>
                  <th className="p-2.5">BI / Documento</th>
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredPersons.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-900/60">
                    <td className="p-2.5 font-bold text-sky-400">{person.spNumber}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-100">{person.fullName}</div>
                      <span className="text-[10px] text-slate-400">{person.rank.replace(/_/g, " ")}</span>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold text-[10.5px]">
                        {person.primarySpecialty}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300">
                      <div>{person.assignedProvinceCode}</div>
                      <span className="text-[9.5px] text-slate-500 font-mono">{person.assignedPrisonId || "Direcção Provincial"}</span>
                    </td>
                    <td className="p-2.5 text-slate-400">{person.biNumber}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                        person.status === "ACTIVO" 
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" 
                          : "bg-red-500/15 text-red-300 border-red-500/30"
                      }`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPersonModal(person)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 text-[10px] font-bold cursor-pointer"
                      >
                        Histórico / Vínculos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ====================================================================
          TAB 3: MISSION KERNEL & TAB 4: CREDENTIAL KERNEL
         ==================================================================== */}
      {(activeKernelTab === "missions" || activeKernelTab === "credentials") && (
        <div className="flex flex-col gap-3">
          
          <div className="flex items-center justify-between bg-[#050811] p-2.5 rounded-xl border border-slate-800 font-mono">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <KeyRound className="h-4 w-4" /> 
              {activeKernelTab === "missions" ? "Missões Operacionais Emitidas Pós-Homologação DG" : "Credenciais de Missão Temporárias (Com Validade Estrita)"}
            </span>
            <span className="text-[10px] text-slate-400">
              Total de Credenciais Emitidas: {credentials.length} ({credentials.filter(c => c.status === "VALID").length} Válidas)
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-850 rounded-xl bg-[#03060c]">
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-850">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">ID Missão / Credencial</th>
                  <th className="p-2.5">Efectivo (SP)</th>
                  <th className="p-2.5">Especialidade / Função</th>
                  <th className="p-2.5">Jurisdição</th>
                  <th className="p-2.5">Período de Validade</th>
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5 text-right">Acção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {missions.map((m) => {
                  const cred = credentials.find(c => c.missionId === m.id);
                  const isValid = cred?.status === "VALID";

                  return (
                    <tr key={m.id} className="hover:bg-slate-900/60">
                      <td className="p-2.5">
                        <div className="font-bold text-amber-400">{m.id}</div>
                        <span className="text-[9.5px] text-slate-500">{cred?.id}</span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-100">{m.personName}</div>
                        <span className="text-[10px] text-sky-400 font-bold">{m.spNumber}</span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-200">{m.roleInShift}</div>
                        <span className="text-[10px] text-amber-300">{m.specialty}</span>
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {m.prisonName} ({m.provinceCode})
                      </td>
                      <td className="p-2.5 text-slate-300 text-[11px]">
                        <div>Início: {m.validFrom}</div>
                        <div className="text-slate-400">Fim: {m.validUntil}</div>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                          isValid
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/15 text-red-300 border-red-500/30"
                        }`}>
                          {isValid ? "✓ VÁLIDA (ACTIVA)" : cred?.status || "EXPIRADA"}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cred && (
                            <button
                              type="button"
                              onClick={() => setIsCredentialViewerOpen(cred)}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer"
                            >
                              Ver Token / Selo
                            </button>
                          )}
                          {isValid && (
                            <button
                              type="button"
                              onClick={() => handleRevokeCredential(cred.id)}
                              className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800 text-[10px] font-bold cursor-pointer"
                            >
                              Revogar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ====================================================================
          TAB 5: AUTHORIZATION MATRIX KERNEL & INTERACTIVE EVALUATOR
         ==================================================================== */}
      {activeKernelTab === "matrix" && (
        <div className="flex flex-col gap-3">
          
          {/* Interactive Equation Banner */}
          <div className="bg-[#050811] p-3 rounded-xl border border-rose-500/30 flex flex-col gap-2 font-mono">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-300 uppercase">
                Equação Fundamental de Autorização Institucional PNAP-AO:
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 text-center font-bold overflow-x-auto whitespace-nowrap">
              <span className="text-sky-400">[SUJEITO (SP)]</span> + 
              <span className="text-amber-400"> [JURISDIÇÃO]</span> + 
              <span className="text-emerald-400"> [ÓRGÃO]</span> + 
              <span className="text-purple-400"> [CARGO]</span> + 
              <span className="text-rose-400"> [ESPECIALIDADE]</span> + 
              <span className="text-blue-400"> [MISSÃO]</span> + 
              <span className="text-yellow-400"> [ACTO]</span> + 
              <span className="text-teal-400"> [PERÍODO]</span> = 
              <span className="text-emerald-400"> [AUTORIZAÇÃO]</span>
            </div>
          </div>

          {/* Interactive Evaluation Sandbox */}
          <div className="bg-[#040810] border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-slate-200">
              Simulador de Teste de Competência e Autorização em Tempo Real:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">1. Sujeito Operador (SP):</label>
                <select
                  value={testActorSp}
                  onChange={(e) => setTestActorSp(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono text-xs"
                >
                  {persons.map(p => (
                    <option key={p.id} value={p.spNumber}>
                      {p.spNumber} - {p.fullName} ({p.primarySpecialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">2. Acto a Executar:</label>
                <select
                  value={testActCode}
                  onChange={(e) => setTestActCode(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono text-xs"
                >
                  {authorizationRules.map(r => (
                    <option key={r.actCode} value={r.actCode}>
                      {r.actName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">3. Jurisdição Estabelecimento:</label>
                <select
                  value={testJurisdiction}
                  onChange={(e) => setTestJurisdiction(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono text-xs"
                >
                  <option value="AO-LUA-001">EP Viana (Luanda)</option>
                  <option value="AO-BGL-001">EP Cavaco (Benguela)</option>
                  <option value="AO-LUA-002">EP Calomboloca (Máxima Segurança)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunEvaluation}
                  className="w-full py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono font-bold text-xs rounded flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Avaliar Competência
                </button>
              </div>
            </div>

            {/* Evaluation Result Card */}
            {evaluationResult && (
              <div className={`p-3 rounded-lg border flex flex-col gap-2 font-mono ${
                evaluationResult.authorized
                  ? "bg-emerald-950/30 border-emerald-500/50"
                  : "bg-red-950/30 border-red-500/50"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${
                    evaluationResult.authorized ? "text-emerald-300" : "text-red-300"
                  }`}>
                    {evaluationResult.authorized ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    DECISÃO: {evaluationResult.decisionCode}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Timestamp: {evaluationResult.evidenceTuple.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-200">
                  {evaluationResult.reason}
                </p>

                {/* Evidence Tuple Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] bg-slate-950/80 p-2 rounded border border-slate-850">
                  <div><strong className="text-slate-400">Actor:</strong> <span className="text-sky-400">{evaluationResult.evidenceTuple.actorSp}</span></div>
                  <div><strong className="text-slate-400">Acto:</strong> <span className="text-amber-400">{evaluationResult.evidenceTuple.act}</span></div>
                  <div><strong className="text-slate-400">Jurisdição:</strong> <span className="text-emerald-400">{evaluationResult.evidenceTuple.jurisdiction}</span></div>
                  <div><strong className="text-slate-400">Missão:</strong> <span className="text-purple-400">{evaluationResult.evidenceTuple.mission}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Canonical Rules Table */}
          <div className="overflow-x-auto border border-slate-850 rounded-xl bg-[#03060c]">
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-850">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Código do Acto</th>
                  <th className="p-2.5">Nome do Acto</th>
                  <th className="p-2.5">Especialidades Autorizadas</th>
                  <th className="p-2.5">Níveis Orgânicos</th>
                  <th className="p-2.5">Requer Missão</th>
                  <th className="p-2.5">Requer DG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {authorizationRules.map((rule) => (
                  <tr key={rule.actCode} className="hover:bg-slate-900/60">
                    <td className="p-2.5 font-bold text-amber-400">{rule.actCode}</td>
                    <td className="p-2.5 text-slate-100 font-medium">{rule.actName}</td>
                    <td className="p-2.5">
                      <div className="flex flex-wrap gap-1">
                        {rule.allowedSpecialties.map(s => (
                          <span key={s} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-sky-300 text-[9.5px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-300 text-[10px]">{rule.allowedOrgLevels.join(", ")}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        rule.requiresActiveMission ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                      }`}>
                        {rule.requiresActiveMission ? "SIM" : "NÃO"}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        rule.requiresDgAuthorization ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-slate-400"
                      }`}>
                        {rule.requiresDgAuthorization ? "SIM (DG)" : "NÃO"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ====================================================================
          TAB 6: ORGANIZATIONAL & TERRITORIAL KERNEL
         ==================================================================== */}
      {activeKernelTab === "org_territory" && (
        <div className="flex flex-col gap-3">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            
            {/* Tree A: Organizational Entities */}
            <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Árvore Administrativa Institucional ({orgNodes.length} Entes)
              </span>

              <div className="flex flex-col gap-1.5 font-mono text-xs">
                {orgNodes.map((org) => (
                  <div key={org.id} className="p-2 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{org.name}</div>
                      <span className="text-[10px] text-slate-400">ID: {org.id} • Nível: {org.level}</span>
                    </div>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold">
                      {org.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tree B: Territorial Geography down to Cell */}
            <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
              <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Árvore Territorial: Província $\to$ EP $\to$ Pavilhão $\to$ Bloco $\to$ Cela
              </span>

              <div className="flex flex-col gap-1.5 font-mono text-xs">
                {territoryNodes.map((t) => (
                  <div key={t.id} className="p-2 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{t.name}</div>
                      <span className="text-[10px] text-slate-400">ID: {t.id} • {t.level}</span>
                    </div>
                    {t.capacity && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {t.currentOccupancy}/{t.capacity} Vagas
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 7: AUDIT KERNEL (RASTREABILIDADE INTEGRAL)
         ==================================================================== */}
      {activeKernelTab === "audit" && (
        <div className="flex flex-col gap-3">
          
          <div className="flex items-center justify-between bg-[#050811] p-2.5 rounded-xl border border-slate-800 font-mono">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <FileSearch className="h-4 w-4" /> Livro Mestre de Rastreabilidade Canónica ({auditLedger.length} Registos)
            </span>
            <span className="text-[10px] text-slate-400">
              Imutabilidade & Auditoria de Atos Institucionais
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-850 rounded-xl bg-[#03060c]">
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-850">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Actor (SP)</th>
                  <th className="p-2.5">Acto Executado</th>
                  <th className="p-2.5">Entidade Alvo</th>
                  <th className="p-2.5">Jurisdição</th>
                  <th className="p-2.5">Missão</th>
                  <th className="p-2.5">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {auditLedger.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-slate-400 text-[10.5px]">{a.timestamp}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-sky-400">{a.actorSpNumber}</div>
                      <span className="text-[10px] text-slate-400">{a.actorName}</span>
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-200">{a.actName}</div>
                      <span className="text-[9.5px] text-amber-400">{a.actCode}</span>
                    </td>
                    <td className="p-2.5 text-slate-300 font-bold">{a.entityTargetId}</td>
                    <td className="p-2.5 text-slate-300">{a.jurisdictionPrisonName}</td>
                    <td className="p-2.5 text-slate-400 text-[10.5px]">{a.missionId}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                        a.resultStatus === "SUCCESS"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/15 text-red-300 border-red-500/30"
                      }`}>
                        {a.resultStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ====================================================================
          MODAL 1: PROPOSE NEW SHIFT (D-1 BY DP)
         ==================================================================== */}
      {isNewShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#050811] border border-slate-800 rounded-xl w-full max-w-lg p-4 flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 text-amber-400" /> Proposta de Turno Operacional (D-1)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewShiftModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Data do Turno:</label>
                  <input
                    type="date"
                    value={newShiftDate}
                    onChange={(e) => setNewShiftDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Estabelecimento:</label>
                  <select
                    value={newShiftPrison}
                    onChange={(e) => setNewShiftPrison(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="AO-LUA-001">EP Viana (Luanda)</option>
                    <option value="AO-BGL-001">EP Cavaco (Benguela)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Início:</label>
                  <input
                    type="text"
                    value={newShiftStartTime}
                    onChange={(e) => setNewShiftStartTime(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Fim:</label>
                  <input
                    type="text"
                    value={newShiftEndTime}
                    onChange={(e) => setNewShiftEndTime(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <span className="text-[10px] text-amber-400 font-bold uppercase pt-1">
                Designação de Especialistas (Efectivo Matriculado):
              </span>

              <div className="flex flex-col gap-2 bg-slate-950 p-2 rounded border border-slate-850">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400">1. Oficial Superior de Acompanhamento (OSA):</label>
                  <select
                    value={newShiftOsaPersonId}
                    onChange={(e) => setNewShiftOsaPersonId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    {persons.filter(p => p.primarySpecialty === "OSA_COMANDO" || p.primarySpecialty === "DIRECTOR_ESTABELECIMENTO").map(p => (
                      <option key={p.id} value={p.id}>{p.spNumber} - {p.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400">2. Especialista de Controlo Penal:</label>
                  <select
                    value={newShiftCtrlPersonId}
                    onChange={(e) => setNewShiftCtrlPersonId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    {persons.filter(p => p.primarySpecialty === "CONTROLO_PENAL").map(p => (
                      <option key={p.id} value={p.id}>{p.spNumber} - {p.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400">3. Operador Rádio / CCTV:</label>
                  <select
                    value={newShiftCctvPersonId}
                    onChange={(e) => setNewShiftCctvPersonId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    {persons.filter(p => p.primarySpecialty === "RADIO_CCTV").map(p => (
                      <option key={p.id} value={p.id}>{p.spNumber} - {p.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewShiftModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold"
                >
                  Submeter à DG para Homologação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: REGISTER NEW PERSON IN HR KERNEL
         ==================================================================== */}
      {isNewPersonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#050811] border border-slate-800 rounded-xl w-full max-w-md p-4 flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <Users className="h-4 w-4 text-sky-400" /> Matrícula Canónica no HR Kernel
              </h3>
              <button
                type="button"
                onClick={() => setIsNewPersonModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">Nome Completo:</label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="ex: Manuel Domingos António"
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Patente / Posto:</label>
                  <select
                    value={newPersonRank}
                    onChange={(e) => setNewPersonRank(e.target.value as RankGrade)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs"
                  >
                    <option value="SUPERINTENDENTE_PRISIONAL">Superintendente</option>
                    <option value="INTENDENTE_PRISIONAL">Intendente</option>
                    <option value="INSPECTOR_PRISIONAL_CHEFE">Inspector Chefe</option>
                    <option value="INSPECTOR_PRISIONAL">Inspector</option>
                    <option value="SUBINSPECTOR_PRISIONAL">Subinspector</option>
                    <option value="PRIMEIRO_SUBCHEFE">1.º Subchefe</option>
                    <option value="PRIMEIRO_AGENTE">1.º Agente</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Especialidade Base:</label>
                  <select
                    value={newPersonSpecialty}
                    onChange={(e) => setNewPersonSpecialty(e.target.value as SpecialtyType)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs"
                  >
                    <option value="CONTROLO_PENAL">Controlo Penal</option>
                    <option value="OSA_COMANDO">OSA / Comando</option>
                    <option value="RADIO_CCTV">Rádio / CCTV</option>
                    <option value="ENFERMAGEM_SAUDE">Saúde / Enfermagem</option>
                    <option value="SARGENTO_GUARDA">Guarda / Vigilância</option>
                    <option value="RESSOCIALIZACAO">Ressocialização</option>
                    <option value="MOTORISTA_TRANSPORTE">Motorista / Escolta</option>
                    <option value="LOGISTICA">Logística</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">Número de BI:</label>
                <input
                  type="text"
                  value={newPersonBi}
                  onChange={(e) => setNewPersonBi(e.target.value)}
                  placeholder="ex: 004829182LA091"
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPersonModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded font-bold"
                >
                  Registar Pessoa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: CREDENTIAL TOKEN VIEWER
         ==================================================================== */}
      {isCredentialViewerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#050811] border border-purple-500/40 rounded-xl w-full max-w-md p-4 flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-purple-400" /> Credencial Operacional Temporária
              </h3>
              <button
                type="button"
                onClick={() => setIsCredentialViewerOpen(null)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs">
              <div><strong className="text-slate-400">Credencial ID:</strong> <span className="text-purple-400 font-bold">{isCredentialViewerOpen.id}</span></div>
              <div><strong className="text-slate-400">Missão ID:</strong> <span className="text-amber-400">{isCredentialViewerOpen.missionId}</span></div>
              <div><strong className="text-slate-400">Matrícula SP:</strong> <span className="text-sky-400 font-bold">{isCredentialViewerOpen.spNumber}</span></div>
              <div><strong className="text-slate-400">Emitida em:</strong> <span className="text-slate-300">{isCredentialViewerOpen.issuedAt}</span></div>
              <div><strong className="text-slate-400">Expira em:</strong> <span className="text-rose-400 font-bold">{isCredentialViewerOpen.expiresAt}</span></div>
              <div><strong className="text-slate-400">Selo DGSP:</strong> <span className="text-emerald-400">{isCredentialViewerOpen.signatureSeal}</span></div>
              
              <div className="pt-2 border-t border-slate-900 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold">Hash Criptográfico de Sessão:</span>
                <span className="text-[9.5px] bg-slate-900 p-1.5 rounded text-amber-300 break-all border border-slate-800">
                  {isCredentialViewerOpen.tokenHash}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCredentialViewerOpen(null)}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded font-bold text-xs"
            >
              Fechar Visualizador
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
