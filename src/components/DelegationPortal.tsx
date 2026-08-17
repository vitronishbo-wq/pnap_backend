import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Users,
  FileText,
  MapPin,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Lock,
  Trash2,
  X,
  Fingerprint,
  Check,
  Building,
  Filter,
  Printer,
  Download,
  Calendar,
  Briefcase,
  Crown,
  Zap,
  ArrowRight,
  History,
  Layers,
  Bell,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Mail,
  Edit3,
  Key,
  ShieldAlert,
  Eye,
  Info,
  Sliders,
  Activity,
  TrendingUp,
  Table
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  Cell as ReCell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from "recharts";
import { Delegation, SystemPermission, InformationClassification } from "../types";
import { OperatorProfile } from "../App";
import { QRCodeImg } from "./QRCodeImg";
import { exportDelegationListToPDF } from "../utils/pdfGenerator";
import { exportDelegationsToCSV, exportDelegationsToExcel } from "../utils/exportUtils";

// Predefined list of standard motifs as requested
const DELEGATION_REASONS = [
  { id: "VACATION", label: "Férias" },
  { id: "MEDICAL_LEAVE", label: "Baixa médica" },
  { id: "MISSION", label: "Missão" },
  { id: "TRAINING", label: "Formação" },
  { id: "SERVICE_COMMISSION", label: "Comissão de serviço" },
  { id: "TEMPORARY_ABSENCE", label: "Ausência temporária" },
  { id: "SUBSTITUTION", label: "Substituição" }
];

// Available system permissions for granular delegation selection
const DELEGATED_COMPETENCIES = [
  { id: "VIEW_INMATES", label: "Consultar Fichas de Reclusos", desc: "Acesso de leitura às fichas e prontuários" },
  { id: "ADMIT_INMATE", label: "Admissão e Cadastro", desc: "Registar novas admissões e dados operacionais base" },
  { id: "MOVE_INMATE", label: "Movimentação Geral", desc: "Solicitar transferências locais e mudanças de cela" },
  { id: "APPROVE_RELEASE", label: "Homologar Alvarás de Soltura", desc: "Aprovar libertações críticas (Supervisor)" },
  { id: "VIEW_INCIDENTS", label: "Painel de Incidentes", desc: "Visualizar desvios disciplinares e boletins" },
  { id: "CREATE_INCIDENT", label: "Registo Disciplinar", desc: "Criar ocorrências e relatar incidentes" },
  { id: "VIEW_INTELLIGENCE", label: "Relatórios de Inteligência (Sigilo Máximo)", desc: "Aceder a dossiês de segurança nacional" },
  { id: "VIEW_CLINICAL", label: "Acesso Clínico Geral", desc: "Visualizar dados médicos e prontuários de saúde" },
  { id: "EDIT_CLINICAL", label: "Prescrições e Diagnósticos", desc: "Gravar registos clínicos e prescrever medicação" },
  { id: "VIEW_AUDITING", label: "Trilhas de Auditoria Forense", desc: "Pesquisar registos de não-repúdio do sistema" },
  { id: "GENERATE_REPORTS", label: "Emissão de Relatórios Estatísticos", desc: "Exportar dados analíticos nacionais" },
  
  // Custom requested granular competencies for partial delegation
  { id: "APPROVE_VACATION", label: "Aprovar Férias de Oficiais", desc: "Autorizar e validar planos de férias e dispensas administrativas" },
  { id: "APPROVE_ESCORTS", label: "Aprovar Escoltas de Reclusos", desc: "Homologar planos de escoltas externas e piquetes operacionais" },
  { id: "ALTER_BIOMETRICS", label: "Alterar Dados Biométricos", desc: "Modificação de impressões digitais, íris ou perfis faciais", restricted: true },
  { id: "DELETE_INMATES", label: "Eliminar Registos de Reclusos", desc: "Exclusão permanente de fichas penais do sistema central", restricted: true },
];

interface DelegationPortalProps {
  delegations: Delegation[];
  setDelegations: React.Dispatch<React.SetStateAction<Delegation[]>>;
  operators: OperatorProfile[];
  currentOperator: OperatorProfile;
  writeAuditLog: (
    operator: any,
    action: string,
    table: string,
    rowId: string,
    desc: string,
    targetId?: string,
    targetName?: string
  ) => void;
}

export default function DelegationPortal({
  delegations,
  setDelegations,
  operators,
  currentOperator,
  writeAuditLog
}: DelegationPortalProps) {
  const isNationalOp = (currentOperator as any)?.territorialScope === "NATIONAL" || (currentOperator as any)?.level === "NATIONAL" || currentOperator?.role === "DIRECTOR_GERAL";
  const opProv = currentOperator?.province || "Huambo";

  // --- States ---
  const [activePortalTab, setActivePortalTab] = useState<"operations" | "executive">("operations");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState(isNationalOp ? "ALL" : opProv);
  const [prisonFilter, setPrisonFilter] = useState("ALL");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");

  useEffect(() => {
    if (!isNationalOp && opProv) {
      setProvinceFilter(opProv);
    }
  }, [isNationalOp, opProv]);

  // UI Modals / Panels
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation | null>(null);
  const activeSelectedDelegation = useMemo(() => {
    if (!selectedDelegation) return null;
    return delegations.find(d => d.id === selectedDelegation.id) || selectedDelegation;
  }, [selectedDelegation, delegations]);
  const [printableDelegation, setPrintableDelegation] = useState<Delegation | null>(null);
  const [showSaveComparisonModal, setShowSaveComparisonModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };
  
  // Simulated System Notifications log
  const [systemNotifications, setSystemNotifications] = useState<any[]>([
    {
      id: "not-1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "SMS",
      recipient: "Dr. Júlio Mbanza (+244 912 *** 888)",
      text: "NREP-AO: Delegação DEL-2026-001 ativada com sucesso. Validade até 25-06-2026."
    },
    {
      id: "not-2",
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      type: "EMAIL",
      recipient: "auditoria.central@minint.gov.ao",
      text: "NREP CUSTODIA: Nova delegação de competência provincial registada com hash SHA256-DEL8291."
    }
  ]);

  // --- Wizard form states ---
  const [wizardStep, setWizardStep] = useState(1);
  const [newDelegatorId, setNewDelegatorId] = useState(currentOperator.id);
  const [newDelegateeId, setNewDelegateeId] = useState("");
  const [newRoleId, setNewRoleId] = useState("PRISON_DIRECTOR");
  const [newReason, setNewReason] = useState("VACATION");
  const [newReasonDetail, setNewReasonDetail] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEndDate, setNewEndDate] = useState(new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0]);
  const [newStartTime, setNewStartTime] = useState("08:00");
  const [newEndTime, setNewEndTime] = useState("18:00");
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<"DESPACHO" | "ORDEM_SERVICO" | "PDF" | "ASSINATURA_DIGITAL">("DESPACHO");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentIssuer, setDocumentIssuer] = useState("Comando Geral do MININT");
  const [documentDigitalSignature, setDocumentDigitalSignature] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Permissions selection: start with all role permissions
  const [isGranular, setIsGranular] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // Signature Passphrase / Stamp
  const [signaturePhrase, setSignaturePhrase] = useState("");
  const [delegateeSignaturePhrase, setDelegateeSignaturePhrase] = useState("");
  const [signChecked, setSignChecked] = useState(false);
  const [acceptChecked, setAcceptChecked] = useState(false);

  // --- Simulated Time & Auto Lifecycle Management ---
  const [simulatedTime, setSimulatedTime] = useState<Date | null>(null);
  const [currentClock, setCurrentClock] = useState<Date>(new Date());

  // Interactive Timeline manipulation states
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [editReasonText, setEditReasonText] = useState("");
  const [isRenewingDate, setIsRenewingDate] = useState(false);
  const [renewDateValue, setRenewDateValue] = useState("");

  useEffect(() => {
    const clockInterval = setInterval(() => {
      if (simulatedTime) {
        setSimulatedTime(prev => {
          if (!prev) return null;
          return new Date(prev.getTime() + 1000);
        });
      } else {
        setCurrentClock(new Date());
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [simulatedTime]);

  const activeTime = simulatedTime || currentClock;

  const handleAdvanceTime = (minutes: number) => {
    const base = simulatedTime || new Date();
    setSimulatedTime(new Date(base.getTime() + minutes * 60 * 1000));
  };

  const formatActiveTime = (date: Date) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Africa/Luanda",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      };
      return date.toLocaleString("pt-PT", options);
    } catch (e) {
      return date.toISOString().replace("T", " ").substring(0, 19);
    }
  };

  // Run evaluated check for activation or expiry
  const evaluateTemporalStates = useCallback(() => {
    const now = activeTime;
    let currentIsoDate = "";
    let currentIsoTime = "";

    try {
      const optionsDate = { timeZone: "Africa/Luanda", year: "numeric", month: "2-digit", day: "2-digit" } as const;
      const optionsTime = { timeZone: "Africa/Luanda", hour: "2-digit", minute: "2-digit", hour12: false } as const;
      const dParts = now.toLocaleDateString("pt-PT", optionsDate).split("/"); // DD/MM/YYYY
      if (dParts.length === 3) {
        currentIsoDate = `${dParts[2]}-${dParts[1]}-${dParts[0]}`; // YYYY-MM-DD
      } else {
        currentIsoDate = now.toISOString().split("T")[0];
      }
      currentIsoTime = now.toLocaleTimeString("pt-PT", optionsTime); // HH:MM
    } catch (e) {
      currentIsoDate = now.toISOString().split("T")[0];
      currentIsoTime = now.toTimeString().split(" ")[0].substring(0, 5);
    }

    setDelegations(prev => {
      let changed = false;
      const updated = prev.map(del => {
        // 1. AUTO-REVOCATION / EXPIRE check
        if (del.status === "ACTIVE" || del.status === "SCHEDULED") {
          const hasExpiredDate = del.endDate < currentIsoDate;
          const hasExpiredTime = del.endDate === currentIsoDate && del.endTime && del.endTime < currentIsoTime;

          if (hasExpiredDate || hasExpiredTime) {
            changed = true;
            
            // Push notification log
            const delegateeName = operators.find(op => op.id === del.delegateeId)?.name || "Delegado";
            const delegatorName = operators.find(op => op.id === del.delegatorId)?.name || "Delegante";

            triggerNotification(
              "SMS",
              `${delegatorName} (+244 NREP)`,
              `NREP-AO: Delegação de poder ${del.id} para ${delegateeName} expirou às ${del.endTime || "23:59"} do dia ${del.endDate} e foi revogada automaticamente.`
            );

            writeAuditLog(
              { id: "SYSTEM", name: "Servidor Autónomo NREP" },
              "CELL_CHANGE_EXECUTE", // Standard compatible log type
              "Delegation",
              del.id,
              `[EXPIRAÇÃO AUTOMÁTICA] Delegação ${del.id} atingiu o termo final programado (${del.endDate} às ${del.endTime || "23:59"}). Competências outorgadas revogadas formalmente.`
            );

            return {
              ...del,
              status: "EXPIRED" as const,
              statusHistory: [
                ...(del.statusHistory || []),
                {
                  status: "EXPIRED" as const,
                  timestamp: new Date().toISOString(),
                  operatorName: "Sistema Autónomo",
                  details: `Termo do período temporal programado atingido às ${del.endTime || "23:59"} de ${del.endDate}. Revogação e cassação automática de privilégios executada.`
                }
              ]
            } as Delegation;
          }
        }

        // 2. AUTO-ACTIVATION check
        if (del.status === "SCHEDULED") {
          const hasStartedDate = del.startDate < currentIsoDate;
          const hasStartedTime = del.startDate === currentIsoDate && (!del.startTime || del.startTime <= currentIsoTime);

          if (hasStartedDate || hasStartedTime) {
            // Ensure it hasn't expired yet
            const hasExpiredDate = del.endDate < currentIsoDate;
            const hasExpiredTime = del.endDate === currentIsoDate && del.endTime && del.endTime < currentIsoTime;

            if (!hasExpiredDate && !hasExpiredTime) {
              changed = true;

              const delegateeName = operators.find(op => op.id === del.delegateeId)?.name || "Delegado";
              const delegatorName = operators.find(op => op.id === del.delegatorId)?.name || "Delegante";

              triggerNotification(
                "SMS",
                `${delegateeName} (+244 NREP)`,
                `NREP-AO: Delegação de poder ${del.id} para assumir cargo de ${del.roleId} foi ativada automaticamente às ${del.startTime || "00:00"}.`
              );

              writeAuditLog(
                { id: "SYSTEM", name: "Servidor Autónomo NREP" },
                "CELL_CHANGE_EXECUTE",
                "Delegation",
                del.id,
                `[ATIVAÇÃO AUTOMÁTICA] Delegação ${del.id} atingiu o período inicial programado (${del.startDate} às ${del.startTime || "00:00"}). Competências do delegado ativadas.`
              );

              return {
                ...del,
                status: "ACTIVE" as const,
                statusHistory: [
                  ...(del.statusHistory || []),
                  {
                    status: "ACTIVE" as const,
                    timestamp: new Date().toISOString(),
                    operatorName: "Sistema Autónomo",
                    details: `Período inicial programado atingido às ${del.startTime || "00:00"} de ${del.startDate}. Delegação de competências ativada automaticamente.`
                  }
                ]
              } as Delegation;
            }
          }
        }

        return del;
      });

      return changed ? updated : prev;
    });
  }, [activeTime, operators, writeAuditLog]);

  // --- Run evaluated check periodically & upon activeTime change ---
  useEffect(() => {
    evaluateTemporalStates();
    const interval = setInterval(evaluateTemporalStates, 5000); // evaluated every 5s for snappy simulation
    return () => clearInterval(interval);
  }, [evaluateTemporalStates]);

  // Helper to trigger simulated notifications
  const triggerNotification = (type: "SMS" | "EMAIL" | "INTERNAL", recipient: string, text: string) => {
    const newNot = {
      id: `not-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      type,
      recipient,
      text
    };
    setSystemNotifications(prev => [newNot, ...prev]);
  };

  // --- Computed Roster profiles & selection options ---
  const delegatorOptions = useMemo(() => {
    // High-ranking profiles capable of delegating authority
    return operators.filter(op => ["DIRECTOR_GERAL", "DIRECTOR_PROVINCIAL", "DIRECTOR_CADEIA"].includes(op.role));
  }, [operators]);

  const delegateeOptions = useMemo(() => {
    // Beneficiaries of delegations (cannot delegate to oneself)
    return operators.filter(op => op.id !== newDelegatorId);
  }, [operators, newDelegatorId]);

  // Get selected objects for details
  const selectedDelegatorObj = useMemo(() => operators.find(op => op.id === newDelegatorId), [operators, newDelegatorId]);
  const selectedDelegateeObj = useMemo(() => operators.find(op => op.id === newDelegateeId), [operators, newDelegateeId]);

  // Auto-fill default permissions of the selected role
  useEffect(() => {
    if (!isGranular && selectedDelegateeObj) {
      // Fetch permissions from delegatee's target role or similar
      const targetRole = newRoleId;
      // Define standard permissions for selected roles
      let perms: string[] = [];
      if (targetRole === "PROVINCIAL_DIRECTOR" || targetRole === "DIRECTOR_PROVINCIAL") {
        perms = ["VIEW_INMATES", "MOVE_INMATE", "VIEW_INCIDENTS", "CREATE_INCIDENT", "VIEW_AUDITING", "GENERATE_REPORTS"];
      } else if (targetRole === "PRISON_DIRECTOR" || targetRole === "DIRECTOR_CADEIA") {
        perms = ["VIEW_INMATES", "ADMIT_INMATE", "MOVE_INMATE", "VIEW_INCIDENTS", "CREATE_INCIDENT", "VIEW_CLINICAL", "GENERATE_REPORTS"];
      } else if (targetRole === "CHEFE_SEGURANCA") {
        perms = ["VIEW_INMATES", "MOVE_INMATE", "VIEW_INCIDENTS", "CREATE_INCIDENT", "VIEW_INTELLIGENCE"];
      } else if (targetRole === "CHEFE_SAUDE") {
        perms = ["VIEW_INMATES", "VIEW_CLINICAL", "EDIT_CLINICAL"];
      } else {
        perms = ["VIEW_INMATES", "VIEW_INCIDENTS"];
      }
      setSelectedPermissions(perms);
    }
  }, [newRoleId, isGranular, selectedDelegateeObj]);

  // --- Conflict Motor Validation ---
  const conflictAnalysis = useMemo(() => {
    if (!newDelegateeId) return { hasConflict: false, messages: [], type: "NONE" };
    
    const messages: string[] = [];
    let severity: "WARNING" | "CRITICAL" | "NONE" = "NONE";

    // 1. Conflict of Incompatible Duties (Segregação de Funções)
    // Delegatee already possesses active Auditor role or has system audit access, we delegate highly operational transfers or releases
    const delegateeObj = operators.find(op => op.id === newDelegateeId);
    const isAuditor = delegateeObj?.permissions.includes(SystemPermission.VIEW_AUDITING);
    const delegatesWriteMovement = selectedPermissions.includes("MOVE_INMATE") || selectedPermissions.includes("APPROVE_RELEASE");

    if (isAuditor && delegatesWriteMovement) {
      messages.push(`⚠️ VIOLAÇÃO DE SEGREGAÇÃO DE FUNÇÕES: O delegado ${delegateeObj?.name} possui atribuições de Auditoria Forense. Atribuir-lhe poderes operacionais de transferência/soltura viola os regulamentos internos do MININT.`);
      severity = "CRITICAL";
    }

    // 2. Overlap validation
    const overlap = delegations.find(del => 
      del.delegateeId === newDelegateeId && 
      del.status === "ACTIVE" &&
      ((newStartDate >= del.startDate && newStartDate <= del.endDate) || 
       (newEndDate >= del.startDate && newEndDate <= del.endDate))
    );

    if (overlap) {
      messages.push(`⚠️ CONFLITO DE SOBREPOSIÇÃO TEMPORAL: O delegado já possui uma portaria de delegação ativa (${overlap.id}) no intervalo de datas selecionado.`);
      severity = "WARNING";
    }

    // 3. Double Delegation (Duplicate high-level role)
    if (newRoleId === "PROVINCIAL_DIRECTOR" && delegations.some(del => del.roleId === "PROVINCIAL_DIRECTOR" && del.status === "ACTIVE" && del.id !== selectedDelegation?.id)) {
      messages.push(`⚠️ ALERTA DE DUPLICIDADE: Atualmente já existe um Diretor Provincial suplente com delegação ativa nesta jurisdição. Esta delegação duplicada criará duplo comando.`);
      severity = "WARNING";
    }

    return {
      hasConflict: messages.length > 0,
      messages,
      type: severity
    };
  }, [newDelegateeId, selectedPermissions, newStartDate, newEndDate, delegations, newRoleId, operators]);


  // --- Approval Chain Determiner ---
  const approvalChain = useMemo(() => {
    // If we delegate director-level authority or sensitive permissions, require Provincial and General approvals
    const isSensitive = newRoleId === "PROVINCIAL_DIRECTOR" || selectedPermissions.includes("VIEW_INTELLIGENCE") || selectedPermissions.includes("APPROVE_RELEASE");
    
    if (isSensitive) {
      return [
        { role: "DIRECTOR_PROVINCIAL", label: "Homologação Provincial", status: "PENDING", name: "Aguardando Diretor Provincial" },
        { role: "DIRECTOR_GERAL", label: "Despacho Geral", status: "PENDING", name: "Aguardando Diretor Geral" }
      ];
    } else {
      // Simple unit delegation only requires local authority check (or Provincial Director)
      return [
        { role: "DIRECTOR_PROVINCIAL", label: "Homologação Local/Provincial", status: "PENDING", name: "Aguardando Validação" }
      ];
    }
  }, [newRoleId, selectedPermissions]);


  // --- Filter and Search delegations ---
  const processedDelegations = useMemo(() => {
    // Helper to get operator province
    const getOperatorProvince = (opId: string) => {
      const op = operators.find(o => o.id === opId);
      if (op?.province) return op.province;
      if (op?.assignedPrisonId) {
        const pId = op.assignedPrisonId;
        if (pId.includes("HUAMBO") || pId.includes("BAI") || pId.includes("CAA")) return "Huambo";
        if (pId === "PRIS-01" || pId === "PRIS-02") return "Luanda";
        if (pId.includes("BEN-01")) return "Benguela";
        if (pId.includes("HUI-01")) return "Huíla";
        if (pId.includes("BENGO")) return "Bengo";
      }
      return "Direção Geral";
    };

    // Helper to get operator prison name
    const getOperatorPrison = (opId: string) => {
      const op = operators.find(o => o.id === opId);
      if (!op?.assignedPrisonId) return "Direção Geral";
      const pId = op.assignedPrisonId;
      if (pId === "PRIS-01") return "EP Viana";
      if (pId === "PRIS-02") return "EP Kakila";
      if (pId.includes("HUI-01") || pId.includes("LUBANGO")) return "EP Lubango";
      if (pId.includes("HUAMBO") || pId.includes("BAI") || pId.includes("CAA")) return "EP Huambo";
      if (pId.includes("BEN-01")) return "EP Benguela";
      if (pId.includes("BENGO")) return "EP Bengo";
      return pId;
    };

    return delegations.filter(del => {
      const delegatorObj = operators.find(op => op.id === del.delegatorId);
      const delegateeObj = operators.find(op => op.id === del.delegateeId);
      
      // 1. Smart Search Input Matcher
      let matchesSearch = true;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        
        const dProvince = getOperatorProvince(del.delegateeId).toLowerCase();
        const oProvince = getOperatorProvince(del.delegatorId).toLowerCase();
        const dPrison = getOperatorPrison(del.delegateeId).toLowerCase();
        const oPrison = getOperatorPrison(del.delegatorId).toLowerCase();
        
        let roleLabel = del.roleId.toLowerCase();
        if (del.roleId === "PROVINCIAL_DIRECTOR") roleLabel = "director provincial dir. provincial";
        else if (del.roleId === "PRISON_DIRECTOR") roleLabel = "director de unidade cadeia dir. cadeia director de cadeia";
        else if (del.roleId === "CHEFE_SEGURANCA") roleLabel = "chefe de segurança sic chef. segurança";
        else if (del.roleId === "CHEFE_SAUDE") roleLabel = "chefe de saúde clínica chef. saúde";

        let statusLabel = del.status.toLowerCase();
        if (del.status === "ACTIVE") statusLabel = "ativa vigente";
        else if (del.status === "REVOKED") statusLabel = "revogada formalmente";
        else if (del.status === "SCHEDULED") statusLabel = "agendada pendente";
        else if (del.status === "EXPIRED") statusLabel = "terminada expirada";

        let docTypeLabel = String((del as any).documentType || "").toLowerCase();
        if (docTypeLabel === "despacho") docTypeLabel = "despacho autorizador";
        else if (docTypeLabel === "ordem_servico") docTypeLabel = "ordem de serviço autorizadora ordem de servico";
        else if (docTypeLabel === "pdf") docTypeLabel = "ficheiro pdf justificativo documental";
        else if (docTypeLabel === "assinatura_digital") docTypeLabel = "assinatura digital selo digital chave de validação";

        const textToSearch = [
          del.id,
          del.delegatorId,
          del.delegateeId,
          delegatorObj?.name || "",
          delegateeObj?.name || "",
          del.reason,
          String((del as any).documentNumber || ""),
          String((del as any).documentName || ""),
          roleLabel,
          statusLabel,
          docTypeLabel,
          dProvince,
          oProvince,
          dPrison,
          oPrison
        ].join(" ").toLowerCase();

        matchesSearch = textToSearch.includes(query);
      }
      
      // 2. Discrete Multi-Field Filters
      const matchesRole = roleFilter === "ALL" || del.roleId === roleFilter;
      const matchesStatus = statusFilter === "ALL" || del.status === statusFilter;
      const matchesDate = !dateFilter || (del.startDate <= dateFilter && del.endDate >= dateFilter);
      
      const dProv = getOperatorProvince(del.delegateeId);
      const oProv = getOperatorProvince(del.delegatorId);
      const matchesProvince = provinceFilter === "ALL" || dProv === provinceFilter || oProv === provinceFilter;

      const dPrisId = delegateeObj?.assignedPrisonId || "DG";
      const oPrisId = delegatorObj?.assignedPrisonId || "DG";
      const matchesPrison = prisonFilter === "ALL" || dPrisId === prisonFilter || oPrisId === prisonFilter;

      const docType = (del as any).documentType || "DESPACHO";
      const matchesDocType = docTypeFilter === "ALL" || docType === docTypeFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDate && matchesProvince && matchesPrison && matchesDocType;
    });
  }, [delegations, operators, searchQuery, roleFilter, statusFilter, dateFilter, provinceFilter, prisonFilter, docTypeFilter]);

  // Unique list of provinces for filtering dropdown (Divisão Político-Administrativa 2024 - 21 Províncias)
  const uniqueProvincesList = useMemo(() => {
    if (!isNationalOp) return [opProv];
    const defaultProvinces = [
      "Cabinda", "Zaire", "Uíge", "Bengo", "Icolo e Bengo", "Luanda",
      "Cuanza-Norte", "Cuanza-Sul", "Malanje", "Lunda-Norte", "Lunda-Sul",
      "Benguela", "Huambo", "Bié", "Moxico", "Moxico Leste", "Huíla",
      "Namibe", "Cunene", "Cubango", "Cuando"
    ];
    const list = new Set<string>(defaultProvinces);
    operators.forEach(op => {
      if (op.province) {
        list.add(op.province);
      }
    });
    return Array.from(list).sort();
  }, [operators, isNationalOp, opProv]);

  // Unique list of prisons for filtering dropdown
  const uniquePrisonsList = useMemo(() => {
    const list = new Map<string, string>(); // ID -> Name
    operators.forEach(op => {
      if (op.assignedPrisonId) {
        let name = op.assignedPrisonId;
        if (op.assignedPrisonId === "PRIS-01") name = "EP Viana";
        else if (op.assignedPrisonId === "PRIS-02") name = "EP Kakila";
        else if (op.assignedPrisonId.includes("HUI-01") || op.assignedPrisonId.includes("LUBANGO")) name = "EP Lubango";
        else if (op.assignedPrisonId.includes("HUAMBO") || op.assignedPrisonId.includes("BAI") || op.assignedPrisonId.includes("CAA")) name = "EP Huambo";
        else if (op.assignedPrisonId.includes("BEN-01")) name = "EP Benguela";
        else if (op.assignedPrisonId.includes("BENGO")) name = "EP Bengo";
        list.set(op.assignedPrisonId, name);
      }
    });
    return Array.from(list.entries()).map(([id, name]) => ({ id, name }));
  }, [operators]);


  // --- Analytics Indicators & Detailed Aggregations ---
  const stats = useMemo(() => {
    const activeList = delegations.filter(d => d.status === "ACTIVE");
    const active = activeList.length;
    const pending = delegations.filter(d => (d as any).approvalStatus && (d as any).approvalStatus !== "APPROVED").length;
    const expired = delegations.filter(d => d.status === "EXPIRED").length;
    const revoked = delegations.filter(d => d.status === "REVOKED").length;
    const scheduled = delegations.filter(d => d.status === "SCHEDULED").length;
    
    // Calculate delegations expiring soon (within 48 hours relative to activeTime)
    const expiringSoonList = activeList.filter(d => {
      try {
        const endStr = `${d.endDate}T${d.endTime || "23:59"}:00`;
        const end = new Date(endStr);
        const diffMs = end.getTime() - activeTime.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        // Less than or equal to 48 hours, and not already expired (diffMs > 0)
        return diffHrs > 0 && diffHrs <= 48;
      } catch (e) {
        return false;
      }
    });
    const expiringSoon = expiringSoonList.length;

    // 5. Statistics by Province
    const getProvince = (opId: string) => {
      const op = operators.find(o => o.id === opId);
      if (op?.province) return op.province;
      if (op?.assignedPrisonId) {
        const pId = op.assignedPrisonId;
        if (pId.includes("HUAMBO") || pId.includes("BAI") || pId.includes("CAA")) return "Huambo";
        if (pId === "PRIS-01" || pId === "PRIS-02") return "Luanda";
        if (pId.includes("BEN-01")) return "Benguela";
        if (pId.includes("HUI-01")) return "Huíla";
        if (pId.includes("BENGO")) return "Bengo";
      }
      return "Direção Geral";
    };

    const provinceCounts: { [key: string]: number } = {};
    delegations.forEach(d => {
      const prov = getProvince(d.delegateeId);
      provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
    });
    const provinceChartData = Object.keys(provinceCounts).map(name => ({
      name,
      value: provinceCounts[name]
    }));

    // 6. Statistics by Role
    const roleLabels: { [key: string]: string } = {
      "PROVINCIAL_DIRECTOR": "Dir. Provincial",
      "DIRECTOR_PROVINCIAL": "Dir. Provincial",
      "PRISON_DIRECTOR": "Dir. Cadeia",
      "DIRECTOR_CADEIA": "Dir. Cadeia",
      "CHEFE_SEGURANCA": "Chef. Segurança",
      "PRISON_SECURITY_CHIEF": "Chef. Segurança",
      "CHEFE_SAUDE": "Chef. Saúde",
      "PRISON_HEALTH_CHIEF": "Chef. Saúde"
    };

    const roleCounts: { [key: string]: number } = {};
    delegations.forEach(d => {
      const label = roleLabels[d.roleId] || d.roleId;
      roleCounts[label] = (roleCounts[label] || 0) + 1;
    });
    const roleChartData = Object.keys(roleCounts).map(name => ({
      name,
      value: roleCounts[name]
    }));

    // 7. Statistics by Secrecy/Sigilo Level
    const sigiloCounts: { [key: string]: number } = {
      "SECRETO": 0,
      "CONFIDENCIAL": 0,
      "RESTRITO": 0,
      "PÚBLICO": 0
    };
    delegations.forEach(d => {
      let sigilo = "RESTRITO";
      if (d.permissions?.includes("VIEW_INTELLIGENCE")) {
        sigilo = "SECRETO";
      } else if (d.permissions?.includes("VIEW_CLINICAL") || d.permissions?.includes("EDIT_CLINICAL")) {
        sigilo = "CONFIDENCIAL";
      } else {
        const delegatee = operators.find(op => op.id === d.delegateeId);
        const level = delegatee?.sensitivityLevel;
        if (level === "SECRETO") sigilo = "SECRETO";
        else if (level === "CONFIDENCIAL") sigilo = "CONFIDENCIAL";
        else if (level === "RESTRITO") sigilo = "RESTRITO";
        else if (level === "PUBLICO") sigilo = "PÚBLICO";
      }
      sigiloCounts[sigilo] = (sigiloCounts[sigilo] || 0) + 1;
    });
    const sigiloChartData = Object.keys(sigiloCounts)
      .filter(name => sigiloCounts[name] > 0)
      .map(name => ({
        name,
        value: sigiloCounts[name]
      }));

    return { 
      active, 
      pending, 
      expired, 
      revoked, 
      scheduled, 
      expiringSoon, 
      expiringSoonList,
      provinceChartData,
      roleChartData,
      sigiloChartData
    };
  }, [delegations, activeTime, operators]);


  // --- Handlers ---
  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setTimeout(() => {
      setNewDocumentFile(file.name);
      setIsUploading(false);
    }, 1200);
  };

  const handleCreateDelegation = () => {
    if (!newDelegateeId) {
      alert("Por favor, selecione um delegado habilitado.");
      return;
    }

    let finalDocName = newDocumentName;
    if (documentType === "DESPACHO") {
      if (!documentNumber.trim()) {
        alert("Por favor, introduza o número do Despacho autorizador.");
        return;
      }
      finalDocName = `Despacho nº ${documentNumber} (${documentIssuer})`;
    } else if (documentType === "ORDEM_SERVICO") {
      if (!documentNumber.trim()) {
        alert("Por favor, introduza o número da Ordem de Serviço autorizadora.");
        return;
      }
      finalDocName = `Ordem de Serviço nº ${documentNumber} (${documentIssuer})`;
    } else if (documentType === "PDF") {
      if (!newDocumentFile) {
        alert("Por favor, anexe o ficheiro PDF do justificativo documental.");
        return;
      }
      finalDocName = newDocumentName || `PDF: ${newDocumentFile}`;
    } else if (documentType === "ASSINATURA_DIGITAL") {
      if (!documentDigitalSignature.trim()) {
        alert("Por favor, introduza a Assinatura Digital / Chave de Validação do documento.");
        return;
      }
      finalDocName = `Selo Eletrónico: ${documentDigitalSignature}`;
    }

    if (!finalDocName) {
      alert("Por favor, declare o justificativo documental (Despacho / Ordem / PDF / Selo Digital).");
      return;
    }

    if (!newReasonDetail.trim()) {
      alert("Por favor, introduza o detalhamento / observações sobre o motivo da delegação.");
      return;
    }

    if (!signaturePhrase) {
      alert("A assinatura digital do outorgante exige frase criptográfica.");
      return;
    }

    if (!delegateeSignaturePhrase) {
      alert("A assinatura digital do delegado exige frase criptográfica de consentimento.");
      return;
    }

    if (!signChecked) {
      alert("Por favor, confirme que declara a portaria homologada sob a norma de Não-Repúdio do MININT.");
      return;
    }

    if (!acceptChecked) {
      alert("Por favor, confirme que o oficial delegado aceita o termo de substituição.");
      return;
    }

    if (!showSaveComparisonModal) {
      setShowSaveComparisonModal(true);
      return;
    }

    // Determine starting status based on approval flow
    // If the active operator is Director Geral, they can immediately bypass provincial approval or sign both
    const activeRole = currentOperator.role;
    const needsApprovals = approvalChain.length > 0;
    
    let finalStatus: Delegation["status"] = "ACTIVE";
    let approvalStatus = "APPROVED";
    let isScheduled = newStartDate > new Date().toISOString().split("T")[0];

    if (isScheduled) {
      finalStatus = "SCHEDULED";
    }

    // If sensitive, default to pending approval unless current logged operator is DIRECTOR_GERAL
    if (needsApprovals && activeRole !== "DIRECTOR_GERAL") {
      finalStatus = "SCHEDULED"; // acts as pending
      approvalStatus = "PENDING_GENERAL";
    }

    const newId = `DEL-2026-0${delegations.length + 1}`;
    
    // Cryptographic-like SHA-256 seal incorporating BOTH signatures
    const seed = `${newId}-${newStartDate}-${newEndDate}-${newStartTime}-${newEndTime}-${newReason}-${signaturePhrase}-${delegateeSignaturePhrase}`;
    const calculatedHash = "SHA256-" + (seed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    // Generate distinct digital signatures for each officer
    const delegatorSgSeed = `${newDelegatorId}-${signaturePhrase}`;
    const delegateeSgSeed = `${newDelegateeId}-${delegateeSignaturePhrase}`;
    const delegatorSigVal = "SIG-MININT-OUT-" + (delegatorSgSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();
    const delegateeSigVal = "SIG-MININT-DLG-" + (delegateeSgSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    const delegationItem: Delegation = {
      id: newId,
      delegatorId: newDelegatorId,
      delegateeId: newDelegateeId,
      roleId: newRoleId,
      startDate: newStartDate,
      endDate: newEndDate,
      status: finalStatus,
      reason: `${DELEGATION_REASONS.find(r => r.id === newReason)?.label}: ${newReasonDetail || "Sem detalhes adicionais"}. Justificativo: ${finalDocName}`,
      auditHash: calculatedHash,
      delegatorSignature: delegatorSigVal,
      delegateeSignature: delegateeSigVal,
      permissions: selectedPermissions,
      statusHistory: [
        {
          status: "SCHEDULED",
          timestamp: new Date().toISOString(),
          operatorName: currentOperator.name,
          details: `Outorga de poderes militares gerada e co-assinada digitalmente com selo ${calculatedHash}. Assinatura Delegante: ${delegatorSigVal}, Assinatura Delegado: ${delegateeSigVal}.`
        }
      ]
    };

    // Store custom fields in standard object safely
    (delegationItem as any).startTime = newStartTime;
    (delegationItem as any).endTime = newEndTime;
    (delegationItem as any).documentName = finalDocName;
    (delegationItem as any).documentFile = newDocumentFile;
    (delegationItem as any).documentType = documentType;
    (delegationItem as any).documentNumber = documentNumber;
    (delegationItem as any).documentIssuer = documentIssuer;
    (delegationItem as any).documentDigitalSignature = documentDigitalSignature || (documentType === "ASSINATURA_DIGITAL" ? `SIG-DOC-MININT-${Math.random().toString(16).substring(2, 10).toUpperCase()}` : "");
    (delegationItem as any).approvalStatus = approvalStatus;
    (delegationItem as any).approvalChain = approvalChain.map(node => {
      if (node.role === currentOperator.role) {
        return { ...node, status: "SIGNED", name: currentOperator.name, date: new Date().toISOString() };
      }
      return node;
    });

    setDelegations(prev => [delegationItem, ...prev]);
    
    // Audit log
    writeAuditLog(
      currentOperator,
      "DELEGATION_CREATE",
      "Delegation",
      newId,
      `[IAM DELEGATION] Portaria ${newId} outorgada de ${selectedDelegatorObj?.name} para ${selectedDelegateeObj?.name}. Cargo: ${newRoleId}. Selo Forense: ${calculatedHash}`
    );

    // Simulated notifications (Automatic Email, SMS, Internal notifications for all critical roles)
    const delegatorName = selectedDelegatorObj?.name || "Delegante";
    const delegateeName = selectedDelegateeObj?.name || "Delegado";
    const auditorName = operators.find(op => op.username?.includes("auditor") || op.name?.toLowerCase().includes("auditor"))?.name || "Auditor Central de Segurança";
    const dirGeralName = operators.find(op => op.role === "DIRECTOR_GERAL")?.name || "Comissário-Geral Maria Kiala";

    const notificationRecipients = [
      { name: delegatorName, label: "Delegante" },
      { name: delegateeName, label: "Delegado" },
      { name: auditorName, label: "Auditor" },
      { name: dirGeralName, label: "Diretor Geral" }
    ];

    notificationRecipients.forEach(r => {
      // 1. Email notification
      triggerNotification(
        "EMAIL",
        r.name,
        `SICP-AO [NOTIFICAÇÃO OFICIAL]: Delegação de Competências ${newId} (Função: ${newRoleId}). Delegante: ${delegatorName}, Delegado: ${delegateeName}. Selo Forense: ${calculatedHash}. Esta é uma notificação automática de segurança enviada para o canal de e-mail do ${r.label}.`
      );
      // 2. SMS notification
      triggerNotification(
        "SMS",
        r.name,
        `MININT NREP: Portaria ${newId} outorgada de ${delegatorName} para ${delegateeName} (Validade: ${newStartDate} a ${newEndDate}). Notificação automática - ${r.label}.`
      );
      // 3. Internal notification
      triggerNotification(
        "INTERNAL",
        r.name,
        `Selo NREP-AO: Nova portaria de delegação ${newId} outorgando poderes ao oficial ${delegateeName} foi registada. Notificação do sistema para o ${r.label}.`
      );
    });

    // Reset Form & Close Wizard
    setIsWizardOpen(false);
    setShowSaveComparisonModal(false);
    setWizardStep(1);
    setNewDelegateeId("");
    setNewReasonDetail("");
    setSignaturePhrase("");
    setDelegateeSignaturePhrase("");
    setSignChecked(false);
    setAcceptChecked(false);
    setNewDocumentName("");
    setNewDocumentFile(null);
    setDocumentType("DESPACHO");
    setDocumentNumber("");
    setDocumentIssuer("Comando Geral do MININT");
    setDocumentDigitalSignature("");
  };

  const handleRevoke = (id: string) => {
    setDelegations(prev => prev.map(del => {
      if (del.id === id) {
        // Find roles and details for beautiful notifications
        const delegatorObj = operators.find(op => op.id === del.delegatorId);
        const delegateeObj = operators.find(op => op.id === del.delegateeId);
        const delegatorName = delegatorObj?.name || "Delegante";
        const delegateeName = delegateeObj?.name || "Delegado";
        const auditorName = operators.find(op => op.username?.includes("auditor") || op.name?.toLowerCase().includes("auditor"))?.name || "Auditor Central de Segurança";
        const dirGeralName = operators.find(op => op.role === "DIRECTOR_GERAL")?.name || "Comissário-Geral Maria Kiala";

        writeAuditLog(
          currentOperator,
          "CELL_CHANGE_EXECUTE", // standard compatible type
          "Delegation",
          id,
          `[DELEGAÇÃO REVOGADA] Portaria de delegação ${id} revogada unilateralmente por ${currentOperator.name}. Chaves criptográficas e privilégios associados a ${delegateeName} foram totalmente suspensos e invalidados no sistema central.`
        );

        // Notify Delegante, Delegado, Auditor, and Diretor Geral automatically
        const notificationRecipients = [
          { name: delegatorName, label: "Delegante" },
          { name: delegateeName, label: "Delegado" },
          { name: auditorName, label: "Auditor" },
          { name: dirGeralName, label: "Diretor Geral" }
        ];

        notificationRecipients.forEach(r => {
          // 1. Email
          triggerNotification(
            "EMAIL",
            r.name,
            `SICP-AO [REVOGAÇÃO DE EMERGÊNCIA]: Portaria ${id} revogada com efeito imediato por ${currentOperator.name}. Os privilégios outorgados ao oficial ${delegateeName} foram totalmente desativados por razões operacionais de segurança ou conveniência de serviço. Notificação enviada para o canal de e-mail do ${r.label}.`
          );
          // 2. SMS
          triggerNotification(
            "SMS",
            r.name,
            `MININT NREP: ALERTA! A Portaria ${id} foi REVOGADA imediatamente por ${currentOperator.name}. Privilégios suspensos na base de dados central. Canal: ${r.label}.`
          );
          // 3. Internal
          triggerNotification(
            "INTERNAL",
            r.name,
            `Selo NREP-AO: Revogação em 1-Clique executada para a portaria ${id}. Privilégios do oficial ${delegateeName} removidos do sistema. Notificação do sistema para o ${r.label}.`
          );
        });

        showToast(
          `A portaria ${id} foi revogada com sucesso! Todos os privilégios associados a ${delegateeName} foram de imediato invalidados e removidos do sistema central.`,
          "success"
        );

        return {
          ...del,
          status: "REVOKED" as const,
          statusHistory: [
            ...(del.statusHistory || []),
            {
              status: "REVOKED" as const,
              timestamp: new Date().toISOString(),
              operatorName: currentOperator.name,
              details: "Revogação instantânea e suspensão integral de privilégios de acesso via comando de 1-clique."
            }
          ]
        } as Delegation;
      }
      return del;
    }));
  };

  const handleApproveSubStep = (delId: string, nodeIndex: number) => {
    setDelegations(prev => prev.map(del => {
      if (del.id === delId) {
        const chain = [...((del as any).approvalChain || [])];
        chain[nodeIndex] = {
          ...chain[nodeIndex],
          status: "SIGNED",
          name: currentOperator.name,
          date: new Date().toISOString()
        };

        const allApproved = chain.every(n => n.status === "SIGNED");
        const nextStatus = allApproved ? "ACTIVE" : del.status;

        // Log audit
        writeAuditLog(
          currentOperator,
          "DELEGATION_CREATE",
          "Delegation",
          delId,
          `[HOMOLOGAÇÃO FLUXO] Homologado sub-nível ${chain[nodeIndex].label} na portaria ${delId} por ${currentOperator.name}.`
        );

        return {
          ...del,
          status: nextStatus,
          approvalStatus: allApproved ? "APPROVED" : "PENDING_GENERAL",
          approvalChain: chain,
          statusHistory: [
            ...(del.statusHistory || []),
            {
              status: nextStatus,
              timestamp: new Date().toISOString(),
              operatorName: currentOperator.name,
              details: `Fase de homologação '${chain[nodeIndex].label}' assinada digitalmente. Estado do fluxo: ${allApproved ? "Totalmente Aprovada" : "Pendente de despacho final"}.`
            }
          ]
        };
      }
      return del;
    }));
  };

  const handleAlteration = (delId: string, newReasonDetail: string) => {
    if (!newReasonDetail.trim()) return;
    setDelegations(prev => prev.map(del => {
      if (del.id === delId) {
        const timestamp = new Date().toISOString();
        const detailMsg = `[ALTERAÇÃO] Modificação de detalhes da portaria. Motivo ajustado para: "${newReasonDetail}". Alterado por despacho de ${currentOperator.name}.`;
        
        writeAuditLog(
          currentOperator,
          "CELL_CHANGE_EXECUTE",
          "Delegation",
          delId,
          `[IAM ALTERAÇÃO] Portaria ${delId} alterada por ${currentOperator.name}. Novo teor: ${newReasonDetail}`
        );

        triggerNotification("SMS", "Utilizadores NREP", `A portaria de delegação ${delId} foi ALTERADA pela Autoridade de Supervisão.`);

        return {
          ...del,
          reason: `Alterado: ${newReasonDetail}. Justificativo original: ${del.documentName || "Anexo"}`,
          statusHistory: [
            ...(del.statusHistory || []),
            {
              status: del.status,
              timestamp,
              operatorName: currentOperator.name,
              details: detailMsg
            }
          ]
        };
      }
      return del;
    }));
  };

  const handleRenewal = (delId: string, newEndDateVal: string) => {
    if (!newEndDateVal) return;
    setDelegations(prev => prev.map(del => {
      if (del.id === delId) {
        const timestamp = new Date().toISOString();
        const originalEndDate = del.endDate;
        const detailMsg = `[RENOVAÇÃO] Prorrogação do termo de vigência homologada de ${originalEndDate} para ${newEndDateVal} por conveniência e necessidade urgente do serviço.`;

        writeAuditLog(
          currentOperator,
          "CELL_CHANGE_EXECUTE",
          "Delegation",
          delId,
          `[IAM RENOVAÇÃO] Portaria ${delId} prorrogada de ${originalEndDate} para ${newEndDateVal} por ${currentOperator.name}`
        );

        triggerNotification("SMS", "Utilizadores NREP", `A validade da delegação de poder ${delId} foi PRORROGADA até ${newEndDateVal}.`);

        return {
          ...del,
          endDate: newEndDateVal,
          status: del.status === "EXPIRED" ? "ACTIVE" : del.status, // Reactivate if it was expired
          statusHistory: [
            ...(del.statusHistory || []),
            {
              status: del.status === "EXPIRED" ? "ACTIVE" : del.status,
              timestamp,
              operatorName: currentOperator.name,
              details: detailMsg
            }
          ]
        };
      }
      return del;
    }));
  };

  return (
    <div className="flex flex-col gap-5 text-slate-100 font-sans" id="delegations-main-wrapper">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[999] max-w-sm w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl flex items-start gap-3"
          >
            {toast.type === "success" && (
              <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 text-emerald-500 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
            {toast.type === "error" && (
              <div className="bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 text-rose-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            {toast.type === "info" && (
              <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-500 shrink-0">
                <Info className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {toast.type === "success" ? "Operação Concluída" : toast.type === "error" ? "Erro no Sistema" : "Aviso de Segurança"}
              </span>
              <p className="text-[11px] text-slate-250 mt-0.5 leading-relaxed font-sans">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-300 transition p-1 shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 🟢 PAINEL DE SIMULAÇÃO TEMPORAL (AUTOMATIC TEMPORARY DELEGATION SIMULATOR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <Clock className="h-5 w-5 animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${simulatedTime ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
              {simulatedTime ? "Simulador de Expirabilidade Automática Ativo" : "Tempo Oficial do Sistema (WAT/Angola)"}
            </span>
            <span className="text-sm font-mono font-black text-slate-100">
              {formatActiveTime(activeTime)}
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-tight max-w-lg">
              Para testar a <strong>Delegação Temporária Automática</strong>, outorgue uma nova delegação com data/hora final próxima e use os botões ao lado para acelerar o relógio. Ao atingir o termo final, a delegação será automaticamente revogada e desativada.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => handleAdvanceTime(10)}
            className="px-3 py-1.5 text-[9px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition active:scale-95 font-bold"
            title="Avançar 10 Minutos"
          >
            +10 Min
          </button>
          <button
            onClick={() => handleAdvanceTime(60)}
            className="px-3 py-1.5 text-[9px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition active:scale-95 font-bold"
            title="Avançar 1 Hora"
          >
            +1 Hora
          </button>
          <button
            onClick={() => handleAdvanceTime(1440)}
            className="px-3 py-1.5 text-[9px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition active:scale-95 font-bold"
            title="Avançar 1 Dia"
          >
            +1 Dia
          </button>
          {simulatedTime && (
            <button
              onClick={() => setSimulatedTime(null)}
              className="px-3 py-1.5 text-[9px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg border border-amber-500/30 transition active:scale-95 font-black"
              title="Voltar ao tempo real do servidor"
            >
              Repor Tempo Real
            </button>
          )}
        </div>
      </div>
      
      {/* SELETOR DE VISTAS DO PORTAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 gap-2 mb-3 pb-1" id="delegation-portal-tab-selector-container">
        <div className="flex gap-1" id="delegation-portal-tab-selector">
          <button
            onClick={() => setActivePortalTab("operations")}
            className={`px-4 py-2.5 text-xs font-mono uppercase font-black border-b-2 transition flex items-center gap-2 ${
              activePortalTab === "operations"
                ? "border-amber-500 text-amber-500 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40"
            }`}
            id="btn-tab-operations"
          >
            <Sliders className="h-3.5 w-3.5" />
            Operações e Outorgas
          </button>
          <button
            onClick={() => setActivePortalTab("executive")}
            className={`px-4 py-2.5 text-xs font-mono uppercase font-black border-b-2 transition flex items-center gap-2 ${
              activePortalTab === "executive"
                ? "border-amber-500 text-amber-500 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40"
            }`}
            id="btn-tab-executive"
          >
            <Activity className="h-3.5 w-3.5" />
            Painel Executivo (Indicadores de Controlo)
          </button>
        </div>

        {/* 12. EXPORTAÇÃO PARA INSPEÇÕES E AUDITORIAS */}
        <div className="flex flex-wrap items-center gap-2 px-1 py-1 bg-slate-950/60 border border-slate-800/80 rounded-lg" id="delegation-export-actions">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black pl-1">Auditoria / Exportação:</span>
          <button
            onClick={async () => {
              try {
                await exportDelegationListToPDF(delegations, operators, currentOperator.name);
              } catch (e) {
                console.error(e);
                alert("Erro ao gerar o relatório PDF.");
              }
            }}
            className="px-2 py-1 text-[9px] font-mono font-bold uppercase rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-900/60 text-rose-300 transition flex items-center gap-1 active:scale-95"
            id="btn-export-pdf"
            title="Exportar Registo de Auditoria para PDF"
          >
            <FileText className="h-3 w-3 text-rose-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportDelegationsToExcel(delegations, operators, currentOperator.name)}
            className="px-2 py-1 text-[9px] font-mono font-bold uppercase rounded bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-900/60 text-emerald-300 transition flex items-center gap-1 active:scale-95"
            id="btn-export-excel"
            title="Exportar Registo de Auditoria para Excel (.xls)"
          >
            <Table className="h-3 w-3 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportDelegationsToCSV(delegations, operators)}
            className="px-2 py-1 text-[9px] font-mono font-bold uppercase rounded bg-sky-950/50 hover:bg-sky-900 border border-sky-900/60 text-sky-300 transition flex items-center gap-1 active:scale-95"
            id="btn-export-csv"
            title="Exportar Registo de Auditoria para CSV"
          >
            <Download className="h-3 w-3 text-sky-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {activePortalTab === "operations" && (
        <>
          {/* 10. PAINEL EXECUTIVO (BENTO-STYLE CARDS) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5" id="bento-operations-stats">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden">
          <div className="absolute right-2.5 top-2.5 bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Delegações Ativas</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{stats.active}</span>
          <span className="text-[9px] text-slate-500">Privilégios outorgados em vigência</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden">
          <div className="absolute right-2.5 top-2.5 bg-amber-500/10 p-2 rounded-lg text-amber-500">
            <Clock className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Agendadas / Término</span>
          <span className="text-2xl font-bold font-mono text-amber-400">{stats.scheduled}</span>
          <span className="text-[9px] text-slate-500">Transição programada</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden">
          <div className="absolute right-2.5 top-2.5 bg-sky-500/10 p-2 rounded-lg text-sky-400">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Fluxos Pendentes</span>
          <span className="text-2xl font-bold font-mono text-sky-400">{stats.pending}</span>
          <span className="text-[9px] text-slate-500">Aguardando homologação formal</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden">
          <div className="absolute right-2.5 top-2.5 bg-rose-500/10 p-2 rounded-lg text-rose-500">
            <Trash2 className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Revogadas / Histórico</span>
          <span className="text-2xl font-bold font-mono text-slate-400">{stats.expired}</span>
          <span className="text-[9px] text-slate-500">Selo criptográfico desativado</span>
        </div>
      </div>

      {/* SEARCH, FILTER & ACTION BANNER */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 border border-amber-500/20">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Gestão de Delegações de Competência</h2>
              <p className="text-[10px] text-slate-400 font-sans">
                Outorga e revogação pontual de competências administrativas e de tutela policial militar de acordo com regulamentos.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full lg:w-auto font-sans font-bold text-[10.5px] uppercase tracking-wider py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-lg shadow-md border border-amber-400/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 shrink-0 text-slate-950" />
            Outorgar Nova Delegação
          </button>
        </div>

        {/* 13. PESQUISA INTELIGENTE & CONTROLES */}
        <div className="flex flex-col gap-3.5" id="smart-search-controls-container">
          {/* Row 1: Smart Search Text & Province & Estabelecimento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Campo Pesquisa por Texto */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisa Inteligente (Nome, NIP, Cargo, Província, Unidade, Estado...)"
                className="bg-slate-950 border border-slate-850 rounded-lg pl-8 pr-3 py-2 text-xxs text-slate-200 font-sans w-full focus:outline-none focus:border-amber-500"
                id="input-smart-search"
              />
            </div>

            {/* Filtro de Província */}
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-350 focus:outline-none focus:border-amber-500 cursor-pointer"
              id="select-filter-province"
            >
              <option value="ALL">Todas as Províncias</option>
              {uniqueProvincesList.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>

            {/* Filtro de Estabelecimento */}
            <select
              value={prisonFilter}
              onChange={(e) => setPrisonFilter(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-350 focus:outline-none focus:border-amber-500 cursor-pointer"
              id="select-filter-prison"
            >
              <option value="ALL">Todos os Estabelecimentos</option>
              <option value="DG">Direção Geral (Nacional)</option>
              {uniquePrisonsList.map(pris => (
                <option key={pris.id} value={pris.id}>{pris.name}</option>
              ))}
            </select>
          </div>

          {/* Row 2: Cargo & Tipo de Delegação & Estado & Data de Vigência */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Filtro de Cargo Outorgado */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-350 focus:outline-none focus:border-amber-500 cursor-pointer"
              id="select-filter-role"
            >
              <option value="ALL">Todos os Cargos</option>
              <option value="PROVINCIAL_DIRECTOR">Director Provincial</option>
              <option value="PRISON_DIRECTOR">Director de Unidade (Cadeia)</option>
              <option value="CHEFE_SEGURANCA">Chefe de Segurança (SIC)</option>
              <option value="CHEFE_SAUDE">Chefe de Saúde Clínica</option>
            </select>

            {/* Filtro de Tipo de Delegação */}
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-350 focus:outline-none focus:border-amber-500 cursor-pointer"
              id="select-filter-doc-type"
            >
              <option value="ALL">Todos os Instrumentos</option>
              <option value="DESPACHO">Despacho Autorizador</option>
              <option value="ORDEM_SERVICO">Ordem de Serviço</option>
              <option value="PDF">Ficheiro PDF Assinado</option>
              <option value="ASSINATURA_DIGITAL">Selo Forense Digital</option>
            </select>

            {/* Filtro de Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-350 focus:outline-none focus:border-amber-500 cursor-pointer"
              id="select-filter-status"
            >
              <option value="ALL">Qualquer Estado</option>
              <option value="ACTIVE">Ativa (Vigente)</option>
              <option value="SCHEDULED">Agendada / Pendente</option>
              <option value="EXPIRED">Terminada / Expirada</option>
              <option value="REVOKED">Revogada formalmente</option>
            </select>

            {/* Filtro por data de vigência */}
            <div className="flex gap-2 items-center w-full" id="filter-date-wrapper">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer flex-1"
                id="input-filter-date"
              />
              {(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL" || dateFilter || provinceFilter !== "ALL" || prisonFilter !== "ALL" || docTypeFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                    setDateFilter("");
                    setProvinceFilter("ALL");
                    setPrisonFilter("ALL");
                    setDocTypeFilter("ALL");
                  }}
                  className="px-2.5 py-2 text-[10px] font-mono font-bold uppercase rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 transition active:scale-95 animate-fade-in"
                  id="btn-clear-filters"
                  title="Limpar todos os filtros de pesquisa"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MASTER DELEGATIONS LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xxs select-none">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-400 font-mono uppercase text-[9px] tracking-wider">
                <th className="p-3.5 font-bold">Portaria / Identificador</th>
                <th className="p-3.5 font-bold">Oficial Outorgante (Delegante)</th>
                <th className="p-3.5 font-bold">Oficial Designado (Delegado)</th>
                <th className="p-3.5 font-bold">Cargo Outorgado</th>
                <th className="p-3.5 font-bold">Período de Vigência</th>
                <th className="p-3.5 font-bold">Estado do Fluxo</th>
                <th className="p-3.5 font-bold text-center">Ações de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850" id="delegations-table-body">
              {processedDelegations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="h-8 w-8 text-slate-700 animate-pulse" />
                      <span>Nenhum registo de portaria de delegação localizado com os filtros atuais.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                processedDelegations.map((del) => {
                  const delegatorObj = operators.find(op => op.id === del.delegatorId);
                  const delegateeObj = operators.find(op => op.id === del.delegateeId);
                  
                  // Safe cast
                  const customDel = del as any;

                  return (
                    <tr key={del.id} className="hover:bg-slate-850/35 transition duration-150">
                      {/* Portaria NIP ID */}
                      <td className="p-3.5 font-mono text-[10px] text-amber-500 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Crown className="h-3 w-3 text-amber-500/80" />
                          <span>{del.id}</span>
                        </div>
                      </td>

                      {/* Delegator */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-250">{delegatorObj?.name || "Direcção Geral"}</span>
                          <span className="text-[8.5px] font-mono text-slate-500">{delegatorObj?.roleName || "Director"}</span>
                        </div>
                      </td>

                      {/* Delegatee */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-200">{delegateeObj?.name || "Oficial Designado"}</span>
                          <span className="text-[8.5px] font-mono text-slate-500">{delegateeObj?.id}</span>
                        </div>
                      </td>

                      {/* Delegated Role */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[9px] uppercase font-bold text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 inline-block w-fit">
                            {del.roleId.replace("_", " ")}
                          </span>
                          <span className="text-[8.5px] text-slate-400 mt-1 max-w-[200px] truncate block" title={del.reason}>
                            {del.reason.split(":")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Validity Period */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5 font-mono text-[9px] text-slate-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span>{del.startDate} a {del.endDate}</span>
                          </div>
                          {customDel.startTime && (
                            <span className="text-[8.5px] text-slate-500 pl-4">
                              🕒 {customDel.startTime} às {customDel.endTime || "18:00"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* State badge / Approval status */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1">
                          {del.status === "ACTIVE" && (
                            <span className="bg-emerald-950/50 border border-emerald-900 text-emerald-400 font-mono uppercase font-black text-[8px] tracking-wider px-2 py-0.5 rounded-full w-fit">
                              ● Ativo / Vigente
                            </span>
                          )}
                          {del.status === "SCHEDULED" && (
                            <span className="bg-amber-950/50 border border-amber-900 text-amber-400 font-mono uppercase font-black text-[8px] tracking-wider px-2 py-0.5 rounded-full w-fit">
                              ● Agendado / Pendente
                            </span>
                          )}
                          {del.status === "EXPIRED" && (
                            <span className="bg-slate-950 border border-slate-800 text-slate-500 font-mono uppercase font-black text-[8px] tracking-wider px-2 py-0.5 rounded-full w-fit">
                              Expirada
                            </span>
                          )}
                          {del.status === "REVOKED" && (
                            <span className="bg-rose-950/50 border border-rose-900 text-rose-400 font-mono uppercase font-black text-[8px] tracking-wider px-2 py-0.5 rounded-full w-fit">
                              Revogada
                            </span>
                          )}

                          {/* Approval indicators if any */}
                          {customDel.approvalStatus && customDel.approvalStatus !== "APPROVED" && (
                            <span className="text-[8.5px] font-mono text-sky-400 font-semibold">
                              ⌛ Aguarda Homologação
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* 4. HISTORICO COMPLETO */}
                          <button
                            onClick={() => setSelectedDelegation(del)}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-350 p-1.5 rounded transition"
                            title="Consultar Histórico e Linha Temporal Completa"
                          >
                            <History className="h-3.5 w-3.5" />
                          </button>

                          {/* 12. IMPRIMIR ALVARÁ COM QR CODE */}
                          <button
                            onClick={() => setPrintableDelegation(del)}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-800 text-amber-500 p-1.5 rounded transition"
                            title="Visualizar e Imprimir Alvará Oficial"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* 11. REVOGAÇÃO EM UM CLIQUE */}
                          {(del.status === "ACTIVE" || del.status === "SCHEDULED") && (
                            <button
                              onClick={() => {
                                if (confirm(`Tem a certeza que deseja revogar imediatamente os poderes da portaria ${del.id}? Esta operação cessará os privilégios associados imediatamente.`)) {
                                  handleRevoke(del.id);
                                }
                              }}
                              className="bg-rose-950/80 border border-rose-900 hover:bg-rose-900 text-rose-200 px-2 py-1 text-[9px] font-mono font-bold uppercase rounded transition flex items-center gap-1 active:scale-95"
                              title="Revogação Imediata (1-Clique)"
                              id={`btn-revoke-${del.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Revogar Agora</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER DIVISIONAL GRID: INTERACTIVE WORKFLOW & NOTIFICATIONS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 2. REGISTO DO FLUXO DE APROVAÇÃO INTERACTIVO */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-mono text-amber-500 uppercase font-black tracking-wider flex items-center gap-1.5">
              ⚖️ Homologação e Fluxo de Aprovação Dual (Maker-Checker)
            </span>
            <p className="text-[9.5px] text-slate-400 font-sans mt-0.5">
              Portarias de delegação pendentes que exigem auditoria e assinaturas digitais por patentes de comando superior.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {delegations.filter(d => (d as any).approvalChain && (d as any).approvalStatus !== "APPROVED" && d.status !== "REVOKED").length === 0 ? (
              <div className="bg-slate-950/50 border border-slate-850 rounded-lg p-6 text-center text-slate-500 font-sans">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2 animate-bounce" />
                <span className="block text-xxs font-bold uppercase text-slate-400">Tudo Regularizado</span>
                <span className="text-[9.5px]">Nenhum fluxo de delegação pendente de homologação na sua jurisdição provincial ou nacional.</span>
              </div>
            ) : (
              delegations
                .filter(d => (d as any).approvalChain && (d as any).approvalStatus !== "APPROVED" && d.status !== "REVOKED")
                .map(del => {
                  const customDel = del as any;
                  const delegator = operators.find(o => o.id === del.delegatorId);
                  const delegatee = operators.find(o => o.id === del.delegateeId);

                  return (
                    <div key={del.id} className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 flex flex-col gap-3.5 hover:border-slate-800 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xxs font-extrabold text-amber-500">{del.id}</span>
                            <span className="text-[8.5px] font-mono text-slate-500 uppercase">Justificativa: {customDel.documentName}</span>
                          </div>
                          <span className="text-xxs font-bold text-slate-200 mt-1">
                            {delegator?.name} → {delegatee?.name} (Cargo: {del.roleId.replace("_", " ")})
                          </span>
                        </div>
                        <span className="bg-sky-950 text-sky-400 border border-sky-900/50 text-[7.5px] font-mono uppercase px-2 py-0.5 rounded font-black tracking-wider">
                          Maker-Checker Ativo
                        </span>
                      </div>

                      {/* Render Horizontal Stepper Flow */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        {customDel.approvalChain.map((node: any, idx: number) => {
                          const isActiveAuditor = currentOperator.role === node.role;
                          const signed = node.status === "SIGNED";

                          return (
                            <div 
                              key={idx} 
                              className={`border rounded-lg p-2 flex flex-col gap-1.5 transition ${
                                signed 
                                  ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300" 
                                  : "bg-slate-900/40 border-slate-800 text-slate-400"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[8.5px] font-mono uppercase font-black tracking-wider text-slate-400">{node.label}</span>
                                {signed ? (
                                  <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                                )}
                              </div>
                              <span className="text-[9.5px] font-sans leading-tight block">
                                {signed ? `✓ Assinado por ${node.name}` : node.name}
                              </span>
                              {signed && node.date && (
                                <span className="text-[7.5px] font-mono text-slate-500 block">Selo: {node.date.substring(0, 16).replace("T", " ")}</span>
                              )}

                              {/* Interactive approval action if logged operator has rights and hasn't signed */}
                              {!signed && isActiveAuditor && (
                                <button
                                  onClick={() => handleApproveSubStep(del.id, idx)}
                                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono uppercase font-black text-[8px] py-1 rounded transition mt-1"
                                >
                                  🔐 Assinar e Homologar Despacho
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* 9. PAINEL DE NOTIFICAÇÕES SIMULADO INTEGRADO */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-500 uppercase font-black tracking-wider flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              Notificações de IAM & Alertas (Audit)
            </span>
            <span className="bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono text-[7px] border border-slate-850">
              Live Feed
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
            {systemNotifications.map((not) => (
              <div key={not.id} className="bg-slate-950/75 border border-slate-850 rounded p-2 flex flex-col gap-1 text-[8.5px] leading-relaxed">
                <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500">
                  <span className={`px-1 rounded uppercase font-black ${
                    not.type === "SMS" ? "bg-amber-500/10 text-amber-400" : "bg-sky-500/10 text-sky-400"
                  }`}>{not.type}</span>
                  <span>{new Date(not.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="text-slate-400 font-mono text-[7.5px] block">{not.recipient}</span>
                <p className="text-slate-200">{not.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}

      {/* 10. PAINEL EXECUTIVO COMPLETO DE INDICADORES (EXECUTIVE DASHBOARD VIEW) */}
      {activePortalTab === "executive" && (
        <div className="flex flex-col gap-5 font-sans" id="executive-dashboard-view">
          
          {/* Grid de 4 Indicadores Principais de Visibilidade Executiva */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" id="exec-indicator-cards">
            {/* Ativas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden" id="card-active-delegations">
              <div className="absolute right-2.5 top-2.5 bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Delegações Ativas</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{stats.active}</span>
              <span className="text-[9px] text-slate-500">Competências em plena vigência legal</span>
            </div>

            {/* Expiradas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden" id="card-expired-delegations">
              <div className="absolute right-2.5 top-2.5 bg-slate-500/10 p-2 rounded-lg text-slate-450">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Delegações Expiradas</span>
              <span className="text-2xl font-bold font-mono text-slate-300">{stats.expired}</span>
              <span className="text-[9px] text-slate-500">Termo temporal atingido naturalmente</span>
            </div>

            {/* Revogadas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden" id="card-revoked-delegations">
              <div className="absolute right-2.5 top-2.5 bg-rose-500/10 p-2 rounded-lg text-rose-400">
                <Trash2 className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Delegações Revogadas</span>
              <span className="text-2xl font-bold font-mono text-rose-400">{stats.revoked}</span>
              <span className="text-[9px] text-slate-500">Revogadas antecipadamente por despacho</span>
            </div>

            {/* Prestes a Expirar */}
            <div className={`bg-slate-900 border rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden transition-all ${
              stats.expiringSoon > 0 ? "border-amber-500/40 bg-amber-500/5 shadow-amber-500/5" : "border-slate-800"
            }`} id="card-expiring-soon-delegations">
              <div className="absolute right-2.5 top-2.5 bg-amber-500/10 p-2 rounded-lg text-amber-500">
                <AlertTriangle className={`h-4.5 w-4.5 ${stats.expiringSoon > 0 ? "animate-bounce" : ""}`} />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">Prestes a Expirar</span>
              <span className={`text-2xl font-bold font-mono ${stats.expiringSoon > 0 ? "text-amber-400" : "text-slate-400"}`}>
                {stats.expiringSoon}
              </span>
              <span className="text-[9px] text-slate-500">Termo final nas próximas 48 horas</span>
            </div>
          </div>

          {/* Grid de Gráficos de Controlo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="exec-charts-grid">
            
            {/* Delegações por Província */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4.5 flex flex-col gap-4" id="chart-by-province-container">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">Delegações por Província</span>
                  <span className="text-[9px] text-slate-500">Distribuição territorial de competências delegadas</span>
                </div>
              </div>
              <div className="h-[220px] w-full">
                {stats.provinceChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                    Nenhum registo provincial disponível
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.provinceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} allowDecimals={false} />
                      <ReTooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                        labelStyle={{ color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}
                        itemStyle={{ color: "#f59e0b", fontSize: "10px", fontFamily: "monospace" }}
                      />
                      <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                        {stats.provinceChartData.map((entry, index) => (
                          <ReCell key={`cell-${index}`} fill={index % 2 === 0 ? "#f59e0b" : "#d97706"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Delegações por Cargo */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4.5 flex flex-col gap-4" id="chart-by-role-container">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">Delegações por Cargo</span>
                  <span className="text-[9px] text-slate-500">Distribuição por cargos e funções militares outorgadas</span>
                </div>
              </div>
              <div className="h-[220px] w-full">
                {stats.roleChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                    Nenhum registo de cargo disponível
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.roleChartData} layout="vertical" margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} width={85} />
                      <ReTooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                        labelStyle={{ color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}
                        itemStyle={{ color: "#10b981", fontSize: "10px", fontFamily: "monospace" }}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {stats.roleChartData.map((entry, index) => (
                          <ReCell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Delegações por Grau de Sigilo */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4.5 flex flex-col gap-4" id="chart-by-sigilo-container">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-sky-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">Delegações por Grau de Sigilo</span>
                  <span className="text-[9px] text-slate-500">Níveis de segurança e classificação de informação</span>
                </div>
              </div>
              <div className="h-[220px] w-full flex items-center justify-center relative">
                {stats.sigiloChartData.length === 0 ? (
                  <div className="text-[10px] text-slate-500 font-mono">
                    Nenhum registo classificado disponível
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-[110px] h-[110px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.sigiloChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {stats.sigiloChartData.map((entry, index) => {
                              let color = "#64748b"; // default
                              if (entry.name === "SECRETO") color = "#f43f5e"; // Rose
                              else if (entry.name === "CONFIDENCIAL") color = "#f59e0b"; // Amber
                              else if (entry.name === "RESTRITO") color = "#0ea5e9"; // Sky
                              else if (entry.name === "PÚBLICO") color = "#10b981"; // Emerald
                              return <ReCell key={`cell-${index}`} fill={color} />;
                            })}
                          </Pie>
                          <ReTooltip
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                            itemStyle={{ fontSize: "10px", fontFamily: "monospace" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      {stats.sigiloChartData.map((item, index) => {
                        let colorBg = "bg-slate-500";
                        let colorText = "text-slate-400";
                        if (item.name === "SECRETO") { colorBg = "bg-rose-500"; colorText = "text-rose-400"; }
                        else if (item.name === "CONFIDENCIAL") { colorBg = "bg-amber-500"; colorText = "text-amber-400"; }
                        else if (item.name === "RESTRITO") { colorBg = "bg-sky-500"; colorText = "text-sky-400"; }
                        else if (item.name === "PÚBLICO") { colorBg = "bg-emerald-500"; colorText = "text-emerald-400"; }
                        
                        return (
                          <div key={item.name} className="flex items-center justify-between text-[9.5px] border-b border-slate-800 pb-1 w-full">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${colorBg}`} />
                              <span className={`font-mono font-bold ${colorText}`}>{item.name}</span>
                            </div>
                            <span className="font-mono text-slate-300 font-semibold">{item.value} {item.value === 1 ? "del." : "dels."}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de Delegações Prestes a Expirar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col gap-4" id="expiring-soon-table-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">Avisos de Caducidade de Poderes (Nas próximas 48h)</span>
                  <span className="text-[9.5px] text-slate-500">Privilégios militares prestes a expirar - Acções recomendadas</span>
                </div>
              </div>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-0.5 font-mono text-[9px] font-bold">
                {stats.expiringSoon} Alertas Ativos
              </span>
            </div>

            {stats.expiringSoon === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-lg text-center flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="h-8 w-8 text-slate-600" />
                <span className="text-xs text-slate-400 font-semibold">Nenhum privilégio expira brevemente</span>
                <p className="text-[9.5px] text-slate-500 max-w-sm">
                  Todas as delegações de competência ativas possuem prazos confortáveis de vigência temporal ou são de caráter definitivo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Portaria ID</th>
                      <th className="py-2.5 px-3">Delegante (Oficial)</th>
                      <th className="py-2.5 px-3">Beneficiário (Delegado)</th>
                      <th className="py-2.5 px-3">Cargo Delegado</th>
                      <th className="py-2.5 px-3 text-center">Término Programado</th>
                      <th className="py-2.5 px-3 text-right">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.expiringSoonList.map(del => {
                      const delegatorObj = operators.find(op => op.id === del.delegatorId);
                      const delegateeObj = operators.find(op => op.id === del.delegateeId);
                      
                      let roleLabel = del.roleId;
                      if (del.roleId === "PROVINCIAL_DIRECTOR") roleLabel = "Director Provincial";
                      else if (del.roleId === "PRISON_DIRECTOR") roleLabel = "Director de Cadeia";
                      else if (del.roleId === "CHEFE_SEGURANCA") roleLabel = "Chefe de Segurança";
                      else if (del.roleId === "CHEFE_SAUDE") roleLabel = "Chefe de Saúde";

                      // Calculate remaining hours
                      const endStr = `${del.endDate}T${del.endTime || "23:59"}:00`;
                      const end = new Date(endStr);
                      const diffMs = end.getTime() - activeTime.getTime();
                      const diffHrs = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
                      const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

                      return (
                        <tr key={del.id} className="border-b border-slate-800/60 hover:bg-slate-900/40 text-[10.5px]">
                          <td className="py-2.5 px-3 font-mono font-black text-amber-400">
                            {del.id}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold block">{delegatorObj?.name || "N/A"}</span>
                            <span className="block text-[8.5px] text-slate-500 font-mono">{delegatorObj?.roleName || "Delegante"}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold block text-slate-200">{delegateeObj?.name || "N/A"}</span>
                            <span className="block text-[8.5px] text-slate-500 font-mono">NIP: {delegateeObj?.id || "N/A"}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-350 border border-slate-850 font-mono text-[8.5px]">
                              {roleLabel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-slate-200 font-mono font-bold block">{del.endDate} às {del.endTime || "23:59"}</span>
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-black text-amber-500 animate-pulse mt-0.5">
                              Caduca em {diffHrs}h {diffMins}m
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setPrintableDelegation(del);
                                }}
                                className="px-2 py-1 text-[9px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold uppercase rounded transition active:scale-95 whitespace-nowrap"
                              >
                                Prorrogar / Emitir
                              </button>
                              {(del.status === "ACTIVE" || del.status === "SCHEDULED") && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Tem a certeza que deseja revogar imediatamente os poderes da portaria ${del.id}? Esta operação cessará os privilégios associados imediatamente.`)) {
                                      handleRevoke(del.id);
                                    }
                                  }}
                                  className="bg-rose-950/80 border border-rose-900 hover:bg-rose-900 text-rose-200 px-2 py-1 text-[9px] font-mono font-bold uppercase rounded transition flex items-center gap-1 active:scale-95 whitespace-nowrap"
                                  title="Revogação Imediata (1-Clique)"
                                  id={`btn-revoke-exec-${del.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Revogar Agora</span>
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
            )}
          </div>
        </div>
      )}

      {/* --- 4. MODAL DETALHES & HISTÓRICO COMPLETO DA TIMELINE --- */}
      <AnimatePresence>
        {activeSelectedDelegation && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative"
            >
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-xxs uppercase tracking-wider text-slate-350">
                    Histórico Completo & Ciclo de Vida da Portaria • {activeSelectedDelegation.id}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDelegation(null);
                    setIsEditingReason(false);
                    setIsRenewingDate(false);
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-850">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Outorga de Privilégios</span>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-xxs">
                    <div>
                      <span className="text-slate-400 block font-sans">Delegante:</span>
                      <strong className="text-slate-200">
                        {operators.find(o => o.id === activeSelectedDelegation.delegatorId)?.name || "Direcção Geral"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Delegado:</span>
                      <strong className="text-slate-200">
                        {operators.find(o => o.id === activeSelectedDelegation.delegateeId)?.name || "Delegado"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* --- 7. DETALHES DO JUSTIFICATIVO DOCUMENTAL ANEXO --- */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 flex flex-col gap-2 text-xxs">
                  <div className="flex justify-between items-center">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase">Justificativo Documental Anexo</span>
                    <span className="bg-slate-900 text-slate-400 text-[6.5px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border border-slate-800">
                      {(activeSelectedDelegation as any).documentType || "DESPACHO"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1 text-[9.5px] border-t border-slate-900/55 pt-2">
                    <div>
                      <span className="text-slate-500 block font-sans text-[8px] uppercase">Nome do Documento / Ficheiro:</span>
                      <strong className="text-slate-350">
                        {(activeSelectedDelegation as any).documentName || activeSelectedDelegation.reason.split("Justificativo: ")[1] || "Não especificado"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans text-[8px] uppercase">Tipo Formal:</span>
                      <strong className="text-amber-500 font-mono text-[9px] uppercase">
                        {((activeSelectedDelegation as any).documentType || "DESPACHO").replace("_", " ")}
                      </strong>
                    </div>
                  </div>

                  {((activeSelectedDelegation as any).documentNumber || (activeSelectedDelegation as any).documentIssuer) && (
                    <div className="grid grid-cols-2 gap-2 mt-1 text-[9.5px] border-t border-slate-900/25 pt-1.5">
                      <div>
                        <span className="text-slate-500 block font-sans text-[8px] uppercase">Identificador / Número:</span>
                        <code className="text-slate-300 font-mono text-[9px]">
                          {(activeSelectedDelegation as any).documentNumber || "N/A"}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-sans text-[8px] uppercase">Órgão Emitente / Tutela:</span>
                        <strong className="text-slate-300">
                          {(activeSelectedDelegation as any).documentIssuer || "N/A"}
                        </strong>
                      </div>
                    </div>
                  )}

                  {((activeSelectedDelegation as any).documentDigitalSignature || (activeSelectedDelegation as any).documentFile) && (
                    <div className="mt-1 border-t border-slate-900/50 pt-1.5 text-[9.5px] flex flex-col gap-1">
                      {(activeSelectedDelegation as any).documentDigitalSignature && (
                        <div>
                          <span className="text-slate-500 block font-mono text-[8px] uppercase">Chave de Assinatura Digital do Documento</span>
                          <code className="text-emerald-500 font-mono font-bold select-all block break-all text-[8.2px] leading-tight">
                            {(activeSelectedDelegation as any).documentDigitalSignature}
                          </code>
                        </div>
                      )}
                      {(activeSelectedDelegation as any).documentFile && (
                        <div className="flex items-center gap-1.5 mt-0.5 bg-slate-900/50 p-1 rounded border border-slate-900">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[8.5px] font-mono text-slate-300 truncate">
                            Ficheiro: {(activeSelectedDelegation as any).documentFile}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Co-Signatures & Cryptographic Audit Seal */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 flex flex-col gap-2 text-xxs">
                  <span className="text-[8.5px] font-mono text-amber-500 uppercase font-bold">Assinaturas Eletrónicas e Selo de Não-Repúdio</span>
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-2 text-[9.5px]">
                    <div>
                      <span className="text-slate-500 block font-mono text-[8px] uppercase">Assinatura Delegante</span>
                      <code className="text-emerald-500 font-mono font-bold select-all block break-all text-[8px] leading-tight mt-0.5">
                        {activeSelectedDelegation.delegatorSignature || `SIG-MININT-OUT-${activeSelectedDelegation.delegatorId}-${activeSelectedDelegation.id}`}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono text-[8px] uppercase">Assinatura Delegado</span>
                      <code className="text-emerald-500 font-mono font-bold select-all block break-all text-[8px] leading-tight mt-0.5">
                        {activeSelectedDelegation.delegateeSignature || `SIG-MININT-DLG-${activeSelectedDelegation.delegateeId}-${activeSelectedDelegation.id}`}
                      </code>
                    </div>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-slate-500 block font-mono text-[8px] uppercase">Selo de Integridade Militar (SHA-256)</span>
                    <code className="text-slate-300 font-mono font-bold select-all block break-all text-[8.5px] leading-tight mt-0.5">
                      {activeSelectedDelegation.auditHash}
                    </code>
                  </div>
                </div>

                {/* --- COMPREHENSIVE 5-STAGE TIMELINE (CRIAÇÃO -> ALTERAÇÕES -> RENOVAÇÕES -> REVOGAÇÕES -> EXPIRAÇÃO) --- */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col gap-3.5">
                  <span className="text-[10px] font-mono text-amber-500 uppercase font-bold block">
                    Linha Temporal do Ciclo de Vida da Portaria
                  </span>

                  {(() => {
                    const hasAltered = activeSelectedDelegation.statusHistory?.some(h => h.details.includes("[ALTERAÇÃO]")) || activeSelectedDelegation.reason.startsWith("Alterado:");
                    const hasRenewed = activeSelectedDelegation.statusHistory?.some(h => h.details.includes("[RENOVAÇÃO]"));
                    const isRevoked = activeSelectedDelegation.status === "REVOKED";
                    const isExpired = activeSelectedDelegation.status === "EXPIRED";

                    return (
                      <div className="relative pl-6 border-l border-slate-800 flex flex-col gap-4">
                        {/* 1. CRIAÇÃO */}
                        <div className="relative">
                          {/* Bullet node */}
                          <div className="absolute -left-[30px] top-0.5 bg-emerald-950 border-2 border-emerald-500 rounded-full h-4 w-4 flex items-center justify-center">
                            <Check className="h-2 w-2 text-emerald-400 font-black" />
                          </div>
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold">1. Criação</span>
                              <span className="bg-emerald-950 text-emerald-400 text-[7px] font-mono uppercase px-1.5 py-0.2 rounded font-black border border-emerald-900">Ativa</span>
                            </div>
                            <p className="text-[9.5px] text-slate-300 mt-1">
                              Portaria criada e outorgada no dia <strong>{activeSelectedDelegation.startDate}</strong> às <strong>{activeSelectedDelegation.startTime || "08:00"}</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Transition Indicator: Criação ↓ Alterações */}
                        <div className="relative -ml-6 flex items-center gap-2 py-0.5">
                          <div className="w-2.5 h-[1px] bg-slate-800"></div>
                          <div className="flex items-center justify-center bg-slate-900 text-amber-500/90 text-[10px] font-mono font-bold border border-slate-800/80 rounded w-5 h-5 shadow-sm">
                            ↓
                          </div>
                          <div className="flex-grow h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
                        </div>

                        {/* 2. ALTERAÇÕES */}
                        <div className="relative">
                          {/* Bullet node */}
                          {hasAltered ? (
                            <div className="absolute -left-[30px] top-0.5 bg-emerald-950 border-2 border-emerald-500 rounded-full h-4 w-4 flex items-center justify-center">
                              <Check className="h-2 w-2 text-emerald-400 font-black" />
                            </div>
                          ) : (
                            <div className="absolute -left-[30px] top-0.5 bg-slate-900 border-2 border-slate-700 rounded-full h-4 w-4 flex items-center justify-center">
                              <div className="h-1 w-1 rounded-full bg-slate-500" />
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${hasAltered ? "text-emerald-400" : "text-slate-400"}`}>2. Alterações</span>
                                <span className={`text-[7px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${hasAltered ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-slate-800 text-slate-500"}`}>
                                  {hasAltered ? "Modificado" : "Nenhuma"}
                                </span>
                              </div>
                              {/* Inline alter button */}
                              {!hasAltered && (activeSelectedDelegation.status === "ACTIVE" || activeSelectedDelegation.status === "SCHEDULED") && !isEditingReason && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingReason(true);
                                    setEditReasonText(activeSelectedDelegation.reason.split(". Justificativo:")[0]);
                                  }}
                                  className="text-[8px] font-mono text-amber-500 hover:underline font-bold hover:text-amber-400 cursor-pointer"
                                >
                                  [✏️ Alterar]
                                </button>
                              )}
                            </div>

                            {isEditingReason ? (
                              <div className="flex flex-col gap-2 mt-2 bg-slate-900 p-2.5 rounded border border-slate-800">
                                <label className="text-[8px] font-mono text-slate-400 uppercase">Novo Justificativo/Teor de Delegação:</label>
                                <textarea
                                  value={editReasonText}
                                  onChange={(e) => setEditReasonText(e.target.value)}
                                  rows={2}
                                  className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xxs text-slate-200 font-sans focus:outline-none focus:border-amber-500"
                                  placeholder="Digite os novos pormenores..."
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsEditingReason(false)}
                                    className="px-2 py-1 text-[8px] font-mono uppercase bg-slate-800 hover:bg-slate-700 text-slate-400 rounded cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAlteration(activeSelectedDelegation.id, editReasonText);
                                      setIsEditingReason(false);
                                    }}
                                    className="px-2.5 py-1 text-[8px] font-mono uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded cursor-pointer"
                                  >
                                    Gravar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[9.5px] text-slate-300 mt-1 leading-normal">
                                {hasAltered ? (
                                  <span className="text-amber-400 font-semibold italic">
                                    "{activeSelectedDelegation.reason}"
                                  </span>
                                ) : (
                                  "Nenhuma alteração ou modificação registada até à data."
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Transition Indicator: Alterações ↓ Renovações */}
                        <div className="relative -ml-6 flex items-center gap-2 py-0.5">
                          <div className="w-2.5 h-[1px] bg-slate-800"></div>
                          <div className="flex items-center justify-center bg-slate-900 text-amber-500/90 text-[10px] font-mono font-bold border border-slate-800/80 rounded w-5 h-5 shadow-sm">
                            ↓
                          </div>
                          <div className="flex-grow h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
                        </div>

                        {/* 3. RENOVAÇÕES */}
                        <div className="relative">
                          {/* Bullet node */}
                          {hasRenewed ? (
                            <div className="absolute -left-[30px] top-0.5 bg-emerald-950 border-2 border-emerald-500 rounded-full h-4 w-4 flex items-center justify-center">
                              <Check className="h-2 w-2 text-emerald-400 font-black" />
                            </div>
                          ) : (
                            <div className="absolute -left-[30px] top-0.5 bg-slate-900 border-2 border-slate-700 rounded-full h-4 w-4 flex items-center justify-center">
                              <div className="h-1 w-1 rounded-full bg-slate-500" />
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${hasRenewed ? "text-emerald-400" : "text-slate-400"}`}>3. Renovações</span>
                                <span className={`text-[7px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${hasRenewed ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-slate-800 text-slate-500"}`}>
                                  {hasRenewed ? "Prorrogada" : "Sem Prorrogações"}
                                </span>
                              </div>
                              {/* Inline renewal button */}
                              {(activeSelectedDelegation.status === "ACTIVE" || activeSelectedDelegation.status === "SCHEDULED" || activeSelectedDelegation.status === "EXPIRED") && !isRenewingDate && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRenewingDate(true);
                                    setRenewDateValue(new Date(Date.parse(activeSelectedDelegation.endDate) + 7 * 24 * 3600 * 1000).toISOString().split("T")[0]);
                                  }}
                                  className="text-[8px] font-mono text-amber-500 hover:underline font-bold hover:text-amber-400 cursor-pointer"
                                >
                                  [⏳ Renovar]
                                </button>
                              )}
                            </div>

                            {isRenewingDate ? (
                              <div className="flex flex-col gap-2 mt-2 bg-slate-900 p-2.5 rounded border border-slate-800">
                                <label className="text-[8px] font-mono text-slate-400 uppercase">Novo Termo de Vigência:</label>
                                <input
                                  type="date"
                                  value={renewDateValue}
                                  onChange={(e) => setRenewDateValue(e.target.value)}
                                  className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xxs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsRenewingDate(false)}
                                    className="px-2 py-1 text-[8px] font-mono uppercase bg-slate-800 hover:bg-slate-700 text-slate-400 rounded cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRenewal(activeSelectedDelegation.id, renewDateValue);
                                      setIsRenewingDate(false);
                                    }}
                                    className="px-2.5 py-1 text-[8px] font-mono uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded cursor-pointer"
                                  >
                                    Confirmar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[9.5px] text-slate-300 mt-1 leading-normal">
                                Vigência final original/atual: <strong>{activeSelectedDelegation.endDate}</strong> às <strong>{activeSelectedDelegation.endTime || "18:00"}</strong>.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Transition Indicator: Renovações ↓ Revogações */}
                        <div className="relative -ml-6 flex items-center gap-2 py-0.5">
                          <div className="w-2.5 h-[1px] bg-slate-800"></div>
                          <div className="flex items-center justify-center bg-slate-900 text-amber-500/90 text-[10px] font-mono font-bold border border-slate-800/80 rounded w-5 h-5 shadow-sm">
                            ↓
                          </div>
                          <div className="flex-grow h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
                        </div>

                        {/* 4. REVOGAÇÕES */}
                        <div className="relative">
                          {/* Bullet node */}
                          {isRevoked ? (
                            <div className="absolute -left-[30px] top-0.5 bg-rose-950 border-2 border-rose-500 rounded-full h-4 w-4 flex items-center justify-center">
                              <Check className="h-2 w-2 text-rose-400 font-black" />
                            </div>
                          ) : (
                            <div className="absolute -left-[30px] top-0.5 bg-slate-900 border-2 border-slate-700 rounded-full h-4 w-4 flex items-center justify-center">
                              <div className="h-1 w-1 rounded-full bg-slate-500" />
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isRevoked ? "text-rose-400" : "text-slate-400"}`}>4. Revogações</span>
                                <span className={`text-[7px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${isRevoked ? "bg-rose-950 text-rose-400 border border-rose-900" : "bg-slate-850 text-slate-500"}`}>
                                  {isRevoked ? "Revogada" : "Não Revogada"}
                                </span>
                              </div>
                              {/* Revoke trigger inside timeline */}
                              {!isRevoked && (activeSelectedDelegation.status === "ACTIVE" || activeSelectedDelegation.status === "SCHEDULED") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Tem a certeza que deseja revogar imediatamente os poderes da portaria ${activeSelectedDelegation.id}? Esta operação cessará os privilégios associados imediatamente.`)) {
                                      handleRevoke(activeSelectedDelegation.id);
                                    }
                                  }}
                                  className="bg-rose-950/80 border border-rose-900 hover:bg-rose-900 text-rose-200 px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded transition flex items-center gap-1 active:scale-95 cursor-pointer"
                                  id={`btn-revoke-modal-${activeSelectedDelegation.id}`}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                  <span>Revogar Agora</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[9.5px] text-slate-300 mt-1 leading-normal">
                              {isRevoked ? (
                                <span className="text-rose-400 font-semibold">✓ Portaria revogada formalmente com suspensão total de competências.</span>
                              ) : (
                                "Poderes militares e de tutela encontram-se plenamente ativos/vigentes no período."
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Transition Indicator: Revogações ↓ Expiração */}
                        <div className="relative -ml-6 flex items-center gap-2 py-0.5">
                          <div className="w-2.5 h-[1px] bg-slate-800"></div>
                          <div className="flex items-center justify-center bg-slate-900 text-amber-500/90 text-[10px] font-mono font-bold border border-slate-800/80 rounded w-5 h-5 shadow-sm">
                            ↓
                          </div>
                          <div className="flex-grow h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
                        </div>

                        {/* 5. EXPIRAÇÃO */}
                        <div className="relative">
                          {/* Bullet node */}
                          {isExpired ? (
                            <div className="absolute -left-[30px] top-0.5 bg-slate-950 border-2 border-slate-500 rounded-full h-4 w-4 flex items-center justify-center">
                              <Check className="h-2 w-2 text-slate-400 font-black" />
                            </div>
                          ) : (
                            <div className="absolute -left-[30px] top-0.5 bg-slate-900 border-2 border-slate-700 rounded-full h-4 w-4 flex items-center justify-center">
                              <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isExpired ? "text-slate-400" : "text-amber-500"}`}>5. Expiração</span>
                              <span className={`text-[7px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${isExpired ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-amber-950/40 text-amber-500 border border-amber-900"}`}>
                                {isExpired ? "Expirada" : "Pendente"}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-slate-300 mt-1 leading-normal">
                              {isExpired ? (
                                <span className="text-slate-400 font-semibold">Atingido o termo final programado. Revogada automaticamente pelo sistema.</span>
                              ) : (
                                <span>Expiração programada automática: <strong>{activeSelectedDelegation.endDate}</strong> às <strong>{activeSelectedDelegation.endTime || "18:00"}</strong>.</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Vertical Stepper timeline for Raw Audit Log */}
                <div>
                  <span className="text-[10px] font-mono text-amber-500 uppercase font-bold block mb-3.5">
                    Histórico de Operações Detalhado (Audit Trail)
                  </span>

                  <div className="relative pl-5 border-l border-slate-800 flex flex-col gap-4.5">
                    {activeSelectedDelegation.statusHistory?.map((hist, idx) => (
                      <div key={idx} className="relative">
                        {/* Circle bullet */}
                        <div className="absolute -left-[25px] top-0.5 bg-slate-900 border-2 border-amber-500 rounded-full h-3 w-3 flex items-center justify-center">
                          <div className="bg-amber-500 rounded-full h-1 w-1"></div>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-[8px] font-mono text-slate-500">
                            <span>{new Date(hist.timestamp).toLocaleString("pt-PT")}</span>
                            <span>•</span>
                            <span className="uppercase text-amber-500 font-bold">{hist.status}</span>
                          </div>
                          <span className="text-xxs font-bold text-slate-300 mt-1">{hist.operatorName}</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{hist.details}</p>
                        </div>
                      </div>
                    ))}

                    {/* Automatic Termination end node if active */}
                    {activeSelectedDelegation.status === "ACTIVE" && (
                      <div className="relative text-slate-500">
                        <div className="absolute -left-[25px] top-0.5 bg-slate-900 border-2 border-slate-700 rounded-full h-3 w-3"></div>
                        <div className="flex flex-col text-[10px]">
                          <span className="text-[8px] font-mono text-slate-600 uppercase">Previsão de Término</span>
                          <span className="text-xxs font-bold text-slate-500 mt-1">Revogação Automática</span>
                          <p className="text-[9.5px] mt-0.5 leading-relaxed">
                            Agendada para encerrar em {activeSelectedDelegation.endDate} às {activeSelectedDelegation.endTime || "23:59"} sob tutela do motor temporal.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 border-t border-slate-850 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedDelegation(null);
                    setIsEditingReason(false);
                    setIsRenewingDate(false);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xxs uppercase px-4 py-2 rounded-lg border border-slate-850 transition"
                >
                  Fechar Histórico
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL COMPARADOR DE PERMISSÕES ANTES DE GRAVAR (AUDITORIA) --- */}
      <AnimatePresence>
        {showSaveComparisonModal && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col p-5 gap-4"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h2 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                      Auditoria de Segurança: Comparação de Permissões
                    </h2>
                    <span className="text-[9px] text-slate-400 font-sans">
                      Controlo obrigatório antes de gravar e selar a portaria no SICP-AO.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveComparisonModal(false)}
                  className="text-slate-400 hover:text-slate-100 transition p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* COMPARATIVE FLOW */}
              <div className="flex flex-col gap-3">
                
                {/* ANTES (Estado Atual) */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex flex-col gap-1.5">
                  <span className="text-[8px] font-mono text-slate-400 uppercase font-black block tracking-wider text-left">
                    ◀ ANTES (Privilégios Atuais do Delegado)
                  </span>
                  
                  <div className="flex flex-col gap-1 text-[9px] text-slate-450 text-left max-h-[100px] overflow-y-auto pr-1">
                    {selectedDelegateeObj ? (
                      selectedDelegateeObj.permissions && selectedDelegateeObj.permissions.length > 0 ? (
                        selectedDelegateeObj.permissions.map((p, idx) => {
                          const label = DELEGATED_COMPETENCIES.find(c => c.id === p)?.label || p;
                          return (
                            <span key={idx} className="block truncate text-slate-400 font-sans">
                              • {label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-500 italic block">Nenhum privilégio especial associado (Acesso Geral)</span>
                      )
                    ) : (
                      <span className="text-rose-400/85 italic block">Nenhum oficial selecionado</span>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-900/50 pt-1.5 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                    <span>Total de Competências</span>
                    <span className="font-bold text-slate-400">
                      {selectedDelegateeObj?.permissions?.length || 0}
                    </span>
                  </div>
                </div>

                {/* CENTRAL TRANSITION INDICATION (ANTES ↓ DEPOIS) */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-850 text-[10px] font-mono text-amber-500 font-black animate-pulse shadow-md">
                    <span>ANTES</span>
                    <span className="text-xs font-bold text-amber-400">↓</span>
                    <span>DEPOIS</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-sans mt-1">
                    Comparação de transição de privilégios com base no despacho anexado.
                  </span>
                </div>

                {/* DEPOIS (Estado Final Pós-Outorga) */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-950/60 flex flex-col gap-1.5">
                  <span className="text-[8px] font-mono text-emerald-400 uppercase font-black block tracking-wider text-left">
                    ▶ DEPOIS (Privilégios Finais Pós-Outorga)
                  </span>
                  
                  <div className="flex flex-col gap-1 text-[9px] text-slate-300 text-left max-h-[120px] overflow-y-auto pr-1">
                    {(() => {
                      if (!selectedDelegateeObj) {
                        return <span className="text-rose-450 italic block">Nenhum oficial selecionado</span>;
                      }
                      const finalPermissions = Array.from(new Set([
                        ...(selectedDelegateeObj.permissions || []),
                        ...selectedPermissions
                      ]));

                      return finalPermissions.map((p, idx) => {
                        const label = DELEGATED_COMPETENCIES.find(c => c.id === p)?.label || p;
                        const isNew = !selectedDelegateeObj.permissions?.includes(p);
                        return (
                          <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-900/10 py-0.5">
                            <span className={isNew ? "text-emerald-400 font-bold" : "text-slate-400 font-sans"}>
                              {isNew ? "★" : "•"} {label}
                            </span>
                            {isNew && (
                              <span className="bg-emerald-950/80 text-emerald-400 text-[6.5px] font-mono px-1 py-0.2 rounded border border-emerald-900 shrink-0 font-bold uppercase tracking-tight">
                                + DELEGADO
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="border-t border-slate-900/50 pt-1.5 flex items-center justify-between text-[8px] text-emerald-500 font-mono font-bold">
                    <span>Total de Competências Pós-Delegação</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedDelegateeObj ? Array.from(new Set([
                        ...(selectedDelegateeObj.permissions || []),
                        ...selectedPermissions
                      ])).length : 0}
                    </span>
                  </div>
                </div>

              </div>

              {/* AUDIT DETAILS WARNING & INFO */}
              <div className="bg-amber-950/25 p-3 rounded-lg border border-amber-950/50 text-left text-xxs leading-relaxed flex flex-col gap-1 text-slate-350">
                <span className="font-mono text-[8px] text-amber-500 font-black uppercase tracking-wide flex items-center gap-1">
                  ⚠️ Declaração de Conformidade & Rastreabilidade Penal
                </span>
                <p className="font-sans text-[8.5px] text-slate-400 leading-normal">
                  Ao prosseguir com a gravação, a transição acima será permanentemente registada na cadeia de blocos forense do MININT-AO com o selo criptográfico assinado. O oficial delegado passará a usufruir dos novos privilégios de imediato para assegurar a continuidade operacional.
                </p>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="border-t border-slate-800 pt-3 flex justify-between gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveComparisonModal(false)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-mono text-[9px] uppercase px-3.5 py-2 rounded-lg transition cursor-pointer"
                >
                  Voltar e Ajustar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCreateDelegation();
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[9px] uppercase px-4.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-3 w-3 text-slate-950 stroke-[3]" /> Confirmar & Gravar Portaria
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 12. MODAL IMPRESSÃO DE ALVARÁ OFICIAL --- */}
      <AnimatePresence>
        {printableDelegation && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white text-slate-900 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col h-[90vh]"
            >
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center text-white shrink-0">
                <span className="font-mono text-xxs uppercase tracking-wider text-amber-500">
                  Visualização de Alvará Oficial para Impressão
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir Alvará
                  </button>
                  <button
                    onClick={() => setPrintableDelegation(null)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Document Paper Layout to print */}
              <div className="p-8 overflow-y-auto flex-1 font-serif text-slate-900 bg-white" id="printable-alvara-paper">
                <div className="text-center flex flex-col items-center gap-2 border-b border-slate-300 pb-5">
                  <span className="font-serif uppercase tracking-widest text-xs font-bold block">SP — SERVIÇO PENITENCIÁRIO</span>
                  <span className="font-serif uppercase tracking-normal text-[10.5px] text-slate-500 block">NREP-AO - Base Central de Recursos Humanos</span>
                  <div className="w-10 h-1 bg-amber-500 mt-2"></div>
                </div>

                <div className="my-8 text-center">
                  <h3 className="text-sm font-bold uppercase font-serif tracking-wide text-slate-800">
                    Alvará de Outorga de Delegação de Poderes
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">ID DE REGISTO FORENSE: {printableDelegation.id}</span>
                </div>

                <div className="text-[11.5px] leading-relaxed text-justify font-serif flex flex-col gap-4">
                  <p>
                    Nos termos das diretivas vigentes sobre o controlo georreferenciado e segurança penitenciária, sob homologação
                    central eletrónica no NREP-AO, o outorgante outorga ao oficial abaixo identificado plenos poderes delegados para
                    exclusivo uso funcional.
                  </p>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg font-sans text-xxs my-2 flex flex-col gap-2">
                    <div>
                      <strong className="text-slate-600 block uppercase font-mono text-[8.5px]">Outorgante Delegante:</strong>
                      <span className="text-slate-800 font-bold">
                        {operators.find(o => o.id === printableDelegation.delegatorId)?.name || "Direcção Geral"} (NIP {printableDelegation.delegatorId})
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-600 block uppercase font-mono text-[8.5px]">Oficial Beneficiário Delegado:</strong>
                      <span className="text-slate-800 font-bold">
                        {operators.find(o => o.id === printableDelegation.delegateeId)?.name || "Oficial Designado"} (NIP {printableDelegation.delegateeId})
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-600 block uppercase font-mono text-[8.5px]">Competência / Cargo Delegado:</strong>
                      <span className="text-amber-700 font-bold uppercase font-mono">
                        {printableDelegation.roleId.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-600 block uppercase font-mono text-[8.5px]">Justificativa e Ordem Suporte:</strong>
                      <span className="text-slate-700">
                        {printableDelegation.reason}
                      </span>
                    </div>
                  </div>

                  <p>
                    O período de vigência desta portaria inicia no dia <strong>{printableDelegation.startDate}</strong> e cessa
                    obrigatoriamente no dia <strong>{printableDelegation.endDate}</strong> às <strong>{(printableDelegation as any).endTime || "23:59"}</strong>,
                    momento no qual as chaves criptográficas de autenticação expirarão automaticamente no sistema central.
                  </p>

                  <p>
                    <strong>Competências Granulares Outorgadas:</strong>
                    <div className="grid grid-cols-2 gap-1.5 font-sans text-[10px] text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 mt-1">
                      {printableDelegation.permissions?.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✓</span>
                          <span>{DELEGATED_COMPETENCIES.find(c => c.id === p)?.label || p}</span>
                        </div>
                      ))}
                    </div>
                  </p>
                </div>

                {/* Validation QR Code and Signatures block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 border-t border-slate-200 pt-6">
                  {/* QR Code component from NREP */}
                  <div className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded bg-slate-50">
                    <QRCodeImg 
                      text={`Selo Militar de Autenticidade NREP-AO\nDocumento ID: ${printableDelegation.id}\nOutorgante NIP: ${printableDelegation.delegatorId}\nAssinatura Outorgante: ${printableDelegation.delegatorSignature || "SIG-MININT-OUT-FALLBACK"}\nDelegado NIP: ${printableDelegation.delegateeId}\nAssinatura Delegado: ${printableDelegation.delegateeSignature || "SIG-MININT-DLG-FALLBACK"}\nHash Criptográfico SHA-256: ${printableDelegation.auditHash}\nValidade: ${printableDelegation.startDate} a ${printableDelegation.endDate}`}
                      size={105}
                    />
                    <span className="text-[8px] font-mono text-slate-500 mt-2 uppercase font-bold">QR Code de Validação Forense</span>
                  </div>

                  <div className="flex flex-col justify-between font-serif text-[10px] text-slate-700 gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-850 block font-sans uppercase text-[8px] tracking-wider text-slate-500">1. Assinatura Eletrónica do Delegante</span>
                        <span className="text-slate-800 font-semibold block">{operators.find(o => o.id === printableDelegation.delegatorId)?.name || "Delegante Oficial"}</span>
                        <span className="text-[7.5px] font-mono text-emerald-700 font-bold tracking-tight block uppercase mt-0.5">
                          ✓ CERTIFICADO DIGITAL: {printableDelegation.delegatorSignature || `SIG-MININT-OUT-${printableDelegation.delegatorId}-${printableDelegation.id}`}
                        </span>
                      </div>

                      <div className="border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-850 block font-sans uppercase text-[8px] tracking-wider text-slate-500">2. Assinatura Eletrónica do Delegado</span>
                        <span className="text-slate-800 font-semibold block">{operators.find(o => o.id === printableDelegation.delegateeId)?.name || "Delegado Oficial"}</span>
                        <span className="text-[7.5px] font-mono text-emerald-700 font-bold tracking-tight block uppercase mt-0.5">
                          ✓ CERTIFICADO DIGITAL: {printableDelegation.delegateeSignature || `SIG-MININT-DLG-${printableDelegation.delegateeId}-${printableDelegation.id}`}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-800 block uppercase font-sans text-[8px] tracking-wider text-slate-500">Selo Forense Criptográfico (SHA-256)</span>
                      <code className="text-[8.5px] font-mono text-slate-650 select-all block leading-tight mt-1 font-bold break-all">
                        {printableDelegation.auditHash}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATION WIZARD MODAL (15-Steps or combined fluid layout) --- */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col h-[85vh]"
            >
              {/* Wizard header */}
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Crown className="h-4.5 w-4.5 text-amber-500" />
                  <span className="font-mono text-xxs uppercase tracking-wider text-slate-350">
                    Assistente de Outorga de Delegação • Passo {wizardStep} de 3
                  </span>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Progress indicator */}
              <div className="bg-slate-950/40 px-5 py-2.5 border-b border-slate-850 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-xxs font-mono text-slate-400">
                  <span className={wizardStep === 1 ? "text-amber-400 font-bold" : "text-slate-600"}>1. Oficiais</span>
                  <ArrowRight className="h-3 w-3 text-slate-700" />
                  <span className={wizardStep === 2 ? "text-amber-400 font-bold" : "text-slate-600"}>2. Vigência & Motivo</span>
                  <ArrowRight className="h-3 w-3 text-slate-700" />
                  <span className={wizardStep === 3 ? "text-amber-400 font-bold" : "text-slate-600"}>3. Parcial & Assinatura</span>
                </div>
              </div>

              {/* Wizard Body content */}
              <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 text-xxs font-sans text-slate-300">
                
                {/* --- STEP 1: OUTORGANTE E DELEGADO --- */}
                {wizardStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[9.5px] text-amber-500 font-mono uppercase font-bold flex items-center gap-1">
                        🎖️ 1. Identificação dos Oficiais Envolvidos
                      </label>
                      <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                        Defina a autoridade outorgante de comando e o oficial de segurança beneficiário que assumirá a suplência no sistema.
                      </p>
                    </div>

                    {/* Seleção de Delegante */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] text-slate-400 font-mono uppercase font-bold">Oficial Delegante (Outorgante)</label>
                      <select
                        value={newDelegatorId}
                        onChange={(e) => setNewDelegatorId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded p-2 text-xxs text-slate-300 font-sans focus:outline-none focus:border-amber-500 cursor-pointer w-full"
                      >
                        {delegatorOptions.map(op => (
                          <option key={op.id} value={op.id}>
                            {op.name} ({op.roleName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seleção de Delegado */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] text-slate-400 font-mono uppercase font-bold">Oficial Beneficiário (Delegado de Poder)</label>
                      <select
                        value={newDelegateeId}
                        onChange={(e) => setNewDelegateeId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded p-2 text-xxs text-slate-300 font-sans focus:outline-none focus:border-amber-500 cursor-pointer w-full"
                      >
                        <option value="">Selecione o oficial de destino...</option>
                        {delegateeOptions.map(op => (
                          <option key={op.id} value={op.id}>
                            {op.name} - {op.roleName} ({op.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cargo a ser Delegado */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] text-slate-400 font-mono uppercase font-bold">Cargo / Funções a Serem Assumidas</label>
                      <select
                        value={newRoleId}
                        onChange={(e) => setNewRoleId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded p-2 text-xxs text-slate-300 font-sans focus:outline-none focus:border-amber-500 cursor-pointer w-full"
                      >
                        <option value="PROVINCIAL_DIRECTOR">Director Provincial (Provincial)</option>
                        <option value="PRISON_DIRECTOR">Director de Cadeia (Local)</option>
                        <option value="CHEFE_SEGURANCA">Chefe de Segurança (SIC)</option>
                        <option value="CHEFE_SAUDE">Chefe de Saúde Clínica</option>
                      </select>
                    </div>

                    {selectedDelegatorObj && selectedDelegateeObj && (
                      <div className="bg-slate-950 rounded-lg p-3 border border-slate-850 flex flex-col gap-1.5">
                        <span className="text-[8.5px] font-mono text-amber-500 uppercase font-bold">Escopo Jurisdicional da Delegação:</span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          <span>
                            Selo Provincial: <strong>{selectedDelegatorObj.province || "Nacional"}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- STEP 2: MOTIVO, VIGÊNCIA E DOCUMENTO --- */}
                {wizardStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[9.5px] text-amber-500 font-mono uppercase font-bold flex items-center gap-1">
                        🕒 2. Vigência Temporária & Motivo Regulamentar
                      </label>
                      <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                        Configure o motor de temporariedade da delegação. As datas e horas estabelecem a janela criptográfica exata da suplência.
                      </p>
                    </div>

                    {/* Motivo Obrigatório */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] text-slate-400 font-mono uppercase font-bold">Motivo da Suplência (Obrigatório)</label>
                        <select
                          value={newReason}
                          onChange={(e) => setNewReason(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded p-2 text-xxs text-slate-300 font-sans focus:outline-none focus:border-amber-500 cursor-pointer w-full"
                        >
                          {DELEGATION_REASONS.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] text-slate-400 font-mono uppercase font-bold">Detalhamento / Observações</label>
                        <input
                          type="text"
                          value={newReasonDetail}
                          onChange={(e) => setNewReasonDetail(e.target.value)}
                          placeholder="ex: Férias anuais, homologado despacho 21..."
                          className="bg-slate-950 border border-slate-800 rounded p-2 text-xxs text-slate-200 font-sans focus:outline-none focus:border-amber-500 w-full"
                        />
                      </div>
                    </div>

                    {/* 1. DELEGAÇÃO TEMPORÁRIA AUTOMÁTICA (DATA E HORA INICIAIS/FINAIS) */}
                    <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl flex flex-col gap-3">
                      <span className="text-[8.5px] font-mono text-amber-500 uppercase font-bold">Janela Temporal de Vigência Criptográfica</span>
                      
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Início */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-slate-400 font-mono uppercase">Data Inicial</label>
                          <input
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-slate-400 font-mono uppercase">Hora Inicial</label>
                          <input
                            type="time"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Fim */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-slate-400 font-mono uppercase">Data Final (Revogação Automática)</label>
                          <input
                            type="date"
                            value={newEndDate}
                            onChange={(e) => setNewEndDate(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-slate-400 font-mono uppercase">Hora Final (Revogação Automática)</label>
                          <input
                            type="time"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 7. JUSTIFICATIVO DOCUMENTAL */}
                    <div className="flex flex-col gap-3 border-t border-slate-850 pt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[9.5px] text-amber-500 font-mono uppercase font-bold">7. Justificativo Documental Obrigatório</label>
                        <span className="text-[8px] text-slate-500 uppercase font-mono">Tipo de Anexo</span>
                      </div>

                      {/* Document Type Selector Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "DESPACHO", label: "Despacho", desc: "Ato de comando", icon: FileText },
                          { id: "ORDEM_SERVICO", label: "Ordem de Serviço", desc: "Ato de execução", icon: Briefcase },
                          { id: "PDF", label: "Ficheiro PDF", desc: "Upload de documento", icon: FileText },
                          { id: "ASSINATURA_DIGITAL", label: "Assinatura Digital", desc: "Validação eletrónica", icon: Fingerprint }
                        ].map((t) => {
                          const IconComp = t.icon;
                          const isSelected = documentType === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setDocumentType(t.id as any);
                                // Set initial document number or defaults if empty
                                if (!documentNumber && t.id !== "PDF") {
                                  setDocumentNumber("124/2026");
                                }
                                if (t.id === "ASSINATURA_DIGITAL" && !documentDigitalSignature) {
                                  setDocumentDigitalSignature(`SIG-DOC-MININT-${Math.random().toString(16).substring(2, 10).toUpperCase()}`);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 focus:outline-none ${
                                isSelected
                                  ? "bg-amber-500/10 border-amber-500 text-amber-400"
                                  : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <IconComp className={`h-4 w-4 ${isSelected ? "text-amber-500" : "text-slate-500"}`} />
                                {isSelected && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xxs font-bold uppercase tracking-tight">{t.label}</span>
                                <span className="text-[7.5px] text-slate-500 font-mono truncate">{t.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Conditional Inputs based on Selection */}
                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-900 flex flex-col gap-3">
                        {/* Type: Despacho or Ordem de Serviço */}
                        {(documentType === "DESPACHO" || documentType === "ORDEM_SERVICO") && (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] text-slate-400 font-mono uppercase">
                                  {documentType === "DESPACHO" ? "Número do Despacho" : "Número da Ordem de Serviço"}
                                </label>
                                <input
                                  type="text"
                                  value={documentNumber}
                                  onChange={(e) => {
                                    setDocumentNumber(e.target.value);
                                    setNewDocumentName(`${documentType === "DESPACHO" ? "Despacho" : "Ordem de Serviço"} nº ${e.target.value} (${documentIssuer})`);
                                  }}
                                  placeholder="Ex: 124/2026"
                                  className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-200 font-mono focus:outline-none focus:border-amber-500 w-full"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] text-slate-400 font-mono uppercase">Órgão Emitente / Autoridade</label>
                                <input
                                  type="text"
                                  value={documentIssuer}
                                  onChange={(e) => {
                                    setDocumentIssuer(e.target.value);
                                    setNewDocumentName(`${documentType === "DESPACHO" ? "Despacho" : "Ordem de Serviço"} nº ${documentNumber} (${e.target.value})`);
                                  }}
                                  placeholder="Ex: Comando Provincial de Luanda"
                                  className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-250 font-sans focus:outline-none focus:border-amber-500 w-full"
                                />
                              </div>
                            </div>

                            {/* Optional file upload to go with the Despacho/Ordem */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[7.5px] text-slate-500 font-mono uppercase font-bold">Anexar Digitalização (Opcional)</span>
                              <div className="border border-dashed border-slate-800 rounded-lg p-3 text-center bg-slate-950/20 relative cursor-pointer hover:border-slate-800 transition flex items-center justify-center gap-2">
                                <input
                                  type="file"
                                  onChange={handleSimulatedUpload}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <FileText className="h-4 w-4 text-slate-500" />
                                <span className="text-[8px] font-sans text-slate-400">
                                  {isUploading ? "Verificando assinatura SHA256 do ficheiro..." : newDocumentFile ? `✓ Anexo carregado: ${newDocumentFile}` : "Carregar cópia em PDF (Opcional)"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Type: PDF File Upload Only */}
                        {documentType === "PDF" && (
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[8px] text-slate-400 font-mono uppercase font-bold">Nome Declarativo do Documento</label>
                              <input
                                type="text"
                                value={newDocumentName}
                                onChange={(e) => setNewDocumentName(e.target.value)}
                                placeholder="ex: Procuração Forense Homologada PDF"
                                className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-200 font-sans focus:outline-none focus:border-amber-500 w-full"
                              />
                            </div>

                            <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center bg-slate-950/40 relative cursor-pointer hover:border-slate-700 transition flex flex-col items-center justify-center gap-2">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  handleSimulatedUpload(e);
                                  if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    setNewDocumentName(file.name);
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="p-2 rounded-full bg-slate-900 border border-slate-800">
                                <FileText className="h-5 w-5 text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8.5px] font-sans font-semibold text-slate-300">
                                  {isUploading ? "Criptografando & Verificando Integridade do PDF..." : newDocumentFile ? `✓ PDF Associado com Sucesso` : "Arraste ou clique para selecionar o arquivo PDF"}
                                </span>
                                <span className="text-[7px] text-slate-500 font-mono uppercase">
                                  {newDocumentFile ? `Ficheiro: ${newDocumentFile}` : "Suporta apenas ficheiros .pdf assinados na rede do MININT"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Type: Digital Signature Link / Token */}
                        {documentType === "ASSINATURA_DIGITAL" && (
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[8px] text-slate-400 font-mono uppercase font-bold">Assinatura Digital de Tutela (Token de Validação)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={documentDigitalSignature}
                                  onChange={(e) => {
                                    setDocumentDigitalSignature(e.target.value);
                                    setNewDocumentName(`Selo Digital: ${e.target.value}`);
                                  }}
                                  placeholder="SIG-DOC-MININT-..."
                                  className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-emerald-400 font-mono focus:outline-none focus:border-amber-500 flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const generated = `SIG-DOC-MININT-${Math.random().toString(16).substring(2, 10).toUpperCase()}-${Date.now().toString().substring(8)}`;
                                    setDocumentDigitalSignature(generated);
                                    setNewDocumentName(`Selo Digital: ${generated}`);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[8.5px] font-mono uppercase rounded text-amber-500 transition shrink-0 font-bold"
                                >
                                  Gerar Selo
                                </button>
                              </div>
                            </div>

                            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 flex items-start gap-2">
                              <Fingerprint className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold">Validação Eletrónica do Ministério</span>
                                <p className="text-[8px] text-slate-400 font-sans mt-0.5 leading-normal text-left">
                                  Este documento é validado de forma eletrónica direta contra os servidores centrais do MININT, isentando a necessidade de anexo de ficheiro físico.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- STEP 3: GRANULAR COMPETS & AUTHS --- */}
                {wizardStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[9.5px] text-amber-500 font-mono uppercase font-bold flex items-center gap-1">
                        🔐 3. Delegação Parcial & Assinatura Digital Criptográfica
                      </label>
                      <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                        Selecione as permissões exatas delegadas e realize o selo de autenticidade no NREP-AO.
                      </p>
                    </div>

                    {/* 8. DELEGAÇÃO PARCIAL GRANULAR */}
                    <div className="bg-slate-950/50 p-3.5 border border-slate-850 rounded-xl flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] font-mono text-amber-500 uppercase font-bold">Modo de Competências de Tutela</span>
                        <button
                          onClick={() => setIsGranular(!isGranular)}
                          className="text-[7.5px] font-mono uppercase bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-350 px-2 py-1 rounded transition"
                        >
                          {isGranular ? "Competência Padrão" : "Ajuste Granular"}
                        </button>
                      </div>

                      {/* 5. COMPARADOR DE PERMISSÕES (ANTES VS DEPOIS) */}
                      <div className="flex flex-col gap-2 border-t border-slate-850 pt-3">
                        <span className="text-[8px] font-mono text-amber-500 uppercase font-bold block mb-1">
                          📊 Comparador de Permissões Forenses (Controlo de Auditoria)
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                          {/* ANTES */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5 justify-between">
                            <div>
                              <span className="text-[7.5px] font-mono text-slate-400 uppercase font-black block mb-2 tracking-wider">
                                ◀ ANTES (Privilégios Iniciais do Suplente)
                              </span>
                              <div className="flex flex-col gap-1 text-[8.5px] text-slate-450 text-left">
                                {selectedDelegateeObj ? (
                                  selectedDelegateeObj.permissions && selectedDelegateeObj.permissions.length > 0 ? (
                                    selectedDelegateeObj.permissions.map((p, idx) => {
                                      const label = DELEGATED_COMPETENCIES.find(c => c.id === p)?.label || p;
                                      return (
                                        <span key={idx} className="block truncate text-slate-400 font-sans">
                                          • {label}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-slate-500 italic block">Nenhum privilégio especial associado (Acesso Geral)</span>
                                  )
                                ) : (
                                  <span className="text-rose-400/85 italic block">🚫 Nenhum oficial delegado selecionado no Passo 1</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 border-t border-slate-900/50 pt-1.5 flex items-center justify-between">
                              <span className="text-[7.5px] text-slate-500 uppercase font-mono">Total de Competências</span>
                              <span className="font-mono text-[8px] font-bold text-slate-400">
                                {selectedDelegateeObj?.permissions?.length || 0}
                              </span>
                            </div>
                          </div>

                          {/* DEPOIS */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-950/50 flex flex-col gap-1.5 justify-between relative overflow-hidden">
                            <div className="absolute right-2 top-2 text-emerald-500/10 text-xl font-bold font-mono">
                              ↓
                            </div>
                            <div>
                              <span className="text-[7.5px] font-mono text-emerald-400 uppercase font-black block mb-2 tracking-wider">
                                ▶ DEPOIS (Privilégios Finais Pós-Outorga)
                              </span>
                              <div className="flex flex-col gap-1 text-[8.5px] text-slate-300 text-left">
                                {(() => {
                                  if (!selectedDelegateeObj) {
                                    return <span className="text-rose-400/85 italic block">🚫 Aguardando seleção de oficial</span>;
                                  }
                                  const finalPermissions = Array.from(new Set([
                                    ...(selectedDelegateeObj.permissions || []),
                                    ...selectedPermissions
                                  ]));

                                  return finalPermissions.map((p, idx) => {
                                    const label = DELEGATED_COMPETENCIES.find(c => c.id === p)?.label || p;
                                    const isNew = !selectedDelegateeObj.permissions?.includes(p);
                                    return (
                                      <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-900/20 py-0.5">
                                        <span className={isNew ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                                          {isNew ? "★" : "•"} {label}
                                        </span>
                                        {isNew && (
                                          <span className="bg-emerald-950/80 text-emerald-400 text-[6.5px] font-mono px-1 py-0.2 rounded border border-emerald-900 shrink-0 font-bold uppercase tracking-tight">
                                            + DELEGADO
                                          </span>
                                        )}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                            <div className="mt-3 border-t border-slate-900/50 pt-1.5 flex items-center justify-between">
                              <span className="text-[7.5px] text-emerald-500 uppercase font-mono font-bold">Total Pós-Delegação</span>
                              <span className="font-mono text-[8.5px] font-bold text-emerald-400">
                                {selectedDelegateeObj ? Array.from(new Set([
                                  ...(selectedDelegateeObj.permissions || []),
                                  ...selectedPermissions
                                ])).length : 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Granular selector checkboxes */}
                      {isGranular && (
                        <div className="flex flex-col gap-3 border-t border-slate-850 pt-3 mt-1">
                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 text-xxs flex flex-col gap-1 text-left">
                            <span className="text-[8px] font-mono text-amber-500 uppercase font-black flex items-center gap-1">
                              💡 Princípio do Privilégio Mínimo & Delegação Parcial
                            </span>
                            <p className="text-[8px] text-slate-400 font-sans leading-normal">
                              O sistema separa atos administrativos delegáveis de operações críticas de integridade da base de dados (biometria e purga de registos), garantindo conformidade com as diretivas forenses do MININT.
                            </p>
                          </div>

                          <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1.5 pr-1">
                            {DELEGATED_COMPETENCIES.map((comp) => {
                              const isRestricted = (comp as any).restricted;
                              const isChecked = selectedPermissions.includes(comp.id);
                              
                              if (isRestricted) {
                                return (
                                  <div 
                                    key={comp.id} 
                                    onClick={() => alert(`🚫 RESTRIÇÃO CRÍTICA: A competência "${comp.label}" não é delegável de acordo com as regras de não-repúdio do MININT para evitar fraudes ou expurgo de dados.`)}
                                    className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-950/10 border border-rose-950/20 hover:border-rose-900/40 hover:bg-rose-950/20 transition cursor-help text-left"
                                  >
                                    <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 line-through decoration-rose-500/50">{comp.label}</span>
                                        <span className="bg-rose-950/80 text-rose-400 text-[6px] font-mono px-1 py-0.2 rounded border border-rose-900 font-bold uppercase tracking-tight">
                                          NÃO DELEGÁVEL
                                        </span>
                                      </div>
                                      <span className="text-[8px] text-rose-350/70 font-sans mt-0.5">{comp.desc}</span>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <label 
                                  key={comp.id} 
                                  className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition text-left ${
                                    isChecked 
                                      ? "bg-emerald-950/20 border-emerald-500/25 text-emerald-400" 
                                      : "bg-slate-950/50 border-slate-900 text-slate-400 hover:border-slate-800"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedPermissions(prev => prev.filter(id => id !== comp.id));
                                      } else {
                                        setSelectedPermissions(prev => [...prev, comp.id]);
                                      }
                                    }}
                                    className="mt-1 rounded border-slate-800 text-amber-500 focus:ring-amber-500/20 h-3.5 w-3.5 bg-slate-900"
                                  />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[9.5px] font-bold text-slate-200">{comp.label}</span>
                                    <span className="text-[8px] text-slate-500 font-sans mt-0.5">{comp.desc}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>

                          {/* VISUAL COMPLIANCE MATRIX EXAMPLE AS REQUESTED BY USER */}
                          <div className="mt-1 bg-slate-950/90 rounded-xl p-3 border border-slate-900/60 text-left flex flex-col gap-2">
                            <span className="text-[8.5px] font-mono text-amber-500 uppercase font-black block tracking-wide">
                              📋 Matriz Exemplificativa de Conformidade Forense
                            </span>
                            
                            <div className="grid grid-cols-2 gap-3 text-[8.5px] font-sans">
                              {/* DELEGABLE ACTIONS */}
                              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                                <span className="text-[7.5px] font-mono text-emerald-400 uppercase font-bold block mb-0.5">
                                  ✔ Ações Delegáveis
                                </span>
                                <div className="flex flex-col gap-1 text-slate-300">
                                  <div className="flex items-center gap-1">
                                    <span className="text-emerald-500 font-bold">✔</span>
                                    <span>Aprovar Férias de Operadores</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-emerald-500 font-bold">✔</span>
                                    <span>Aprovar Escoltas / Movimentações</span>
                                  </div>
                                </div>
                              </div>

                              {/* FORBIDDEN ACTIONS */}
                              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                                <span className="text-[7.5px] font-mono text-rose-400 uppercase font-bold block mb-0.5">
                                  ✘ Ações Não-Delegáveis
                                </span>
                                <div className="flex flex-col gap-1 text-slate-400">
                                  <div className="flex items-center gap-1">
                                    <span className="text-rose-500 font-bold">✘</span>
                                    <span className="line-through decoration-rose-500/40">Alterar Dados Biométricos</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-rose-500 font-bold">✘</span>
                                    <span className="line-through decoration-rose-500/40">Eliminar Fichas de Reclusos</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[7.5px] text-slate-500 font-mono mt-0.5">
                              <span>ℹ</span>
                              <span>Garante integridade absoluta de custódia e trilhas de auditoria penal.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 14. MOTOR DE CONFLITOS DE SEGURANÇA */}
                    {conflictAnalysis.hasConflict && (
                      <div className={`p-3.5 rounded-lg border flex flex-col gap-1 text-left ${
                        conflictAnalysis.type === "CRITICAL"
                          ? "bg-rose-950/40 border-rose-900/50 text-rose-350"
                          : "bg-amber-950/40 border-amber-900/50 text-amber-300"
                      }`}>
                        <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono font-black">
                          <ShieldAlert className="h-4 w-4 shrink-0 animate-bounce" />
                          ALERTA DE CONFLITO DE SEGURANÇA DETETADO
                        </div>
                        {conflictAnalysis.messages.map((msg, idx) => (
                          <p key={idx} className="text-[8.5px] leading-relaxed mt-0.5">{msg}</p>
                        ))}
                      </div>
                    )}

                    {/* 3. ASSINATURA DIGITAL DO DELEGANTE E ACEITAÇÃO */}
                    <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl flex flex-col gap-3">
                      <span className="text-[8.5px] font-mono text-amber-500 uppercase font-bold">Assinaturas Eletrónicas Obrigatórias (Co-Assinatura)</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-slate-400 font-mono uppercase">Assinatura do Delegante (Selo de Outorga)</label>
                          <input
                            type="password"
                            value={signaturePhrase}
                            onChange={(e) => setSignaturePhrase(e.target.value)}
                            placeholder="Frase secreta do outorgante..."
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-slate-400 font-mono uppercase">Assinatura do Delegado (Selo de Aceite)</label>
                          <input
                            type="password"
                            value={delegateeSignaturePhrase}
                            onChange={(e) => setDelegateeSignaturePhrase(e.target.value)}
                            placeholder="Frase secreta do suplente..."
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xxs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={signChecked}
                            onChange={(e) => setSignChecked(e.target.checked)}
                          />
                          <span className="text-[8.5px] text-slate-400">Declaro homologada esta portaria sob a norma militar de Não-Repúdio do MININT.</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acceptChecked}
                            onChange={(e) => setAcceptChecked(e.target.checked)}
                          />
                          <span className="text-[8.5px] text-slate-400">O oficial delegado declara o aceite dos termos de substituição temporária.</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard footer controllers */}
              <div className="bg-slate-950 p-3.5 border-t border-slate-850 flex justify-between shrink-0">
                <button
                  onClick={() => {
                    if (wizardStep === 1) setIsWizardOpen(false);
                    else setWizardStep(prev => prev - 1);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xxs uppercase px-4 py-2 rounded-lg border border-slate-850 transition"
                >
                  {wizardStep === 1 ? "Cancelar" : "Voltar"}
                </button>

                <button
                  onClick={() => {
                    if (wizardStep === 3) {
                      handleCreateDelegation();
                    } else {
                      // Small validation before proceeding
                      if (wizardStep === 1 && !newDelegateeId) {
                        alert("Selecione o oficial de suplência.");
                        return;
                      }
                      setWizardStep(prev => prev + 1);
                    }
                  }}
                  className={`font-mono text-xxs uppercase px-5 py-2 rounded-lg transition ${
                    wizardStep === 3 && conflictAnalysis.type === "CRITICAL"
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  }`}
                  disabled={wizardStep === 3 && conflictAnalysis.type === "CRITICAL"}
                >
                  {wizardStep === 3 ? "🔐 Assinar e Emitir Portaria" : "Avançar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
