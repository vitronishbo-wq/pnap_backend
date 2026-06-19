import React, { useState } from "react";
import { 
  HeartPulse, 
  Activity, 
  Pill, 
  Stethoscope, 
  Thermometer, 
  Search, 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle, 
  Clock, 
  Lock,
  UserCheck,
  Check
} from "lucide-react";
import { SystemPermission, FunctionalScope } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export interface HealthRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  prisonName: string;
  consultationDate: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  severity: "Ligeiro" | "Moderado" | "Grave" | "Crítico";
  status: "Pendente" | "Em Tratamento" | "Recuperado" | "Alta Clínica";
  doctorName: string;
}

export interface TriageRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  triageDate: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  severity: "Ligeiro" | "Moderado" | "Grave" | "Crítico";
  symptoms: string;
  specialtyNeeded: string;
  professionalName: string;
}

export interface FollowUpRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  followUpDate: string;
  progressNotes: string;
  conditionStatus: "Estável" | "Melhoria" | "Sob Observação" | "Crítico" | "Alta";
  treatmentGiven: string;
  nextReviewDate: string;
  doctorName: string;
}

export interface PrescriptionRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  prescriptionDate: string;
  diagnosisAssociated: string;
  medications: string;
  durationDays: number;
  specialInstructions: string;
  doctorName: string;
  status: "Ativo" | "Concluído" | "Cancelado" | "Suspenso";
}

interface HealthModuleProps {
  inmates: any[];
  currentOperator: any;
  hasPermission: (permission: SystemPermission, targetClassification?: any) => boolean;
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
  currentOperatorId: string;
  healthRecords?: HealthRecord[];
  setHealthRecords?: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  operators?: any[];
  setOperators?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function HealthModule({
  inmates,
  currentOperator,
  hasPermission,
  setAuditLogs,
  currentOperatorId,
  healthRecords,
  setHealthRecords,
  operators = [],
  setOperators
}: HealthModuleProps) {
  // Clinical Sub-Modules selection
  const [healthSection, setHealthSection] = useState<"triagens" | "acompanhamentos" | "prescricoes" | "prontuarios" | "permissoes">("triagens");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [localRecords, setLocalRecords] = useState<HealthRecord[]>(() => [
    {
      id: "PRON-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      prisonName: "Cadeia Central do Huambo",
      consultationDate: "2026-06-15",
      symptoms: "Hipertensão arterial sistólica elevada, cefaleia moderada",
      diagnosis: "Crise Hipertensiva ligeira, cansaço acumulado",
      prescription: "Enalapril 20mg (1x ao dia), repouso cirúrgico temporário",
      severity: "Moderado",
      status: "Em Tratamento",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "PRON-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      prisonName: "Estabelecimento Penitenciário de Viana",
      consultationDate: "2026-06-16",
      symptoms: "Febre alta intermitente, calafrios recorrentes, fadiga muscular",
      diagnosis: "Malária por Plasmodium falciparum confirmada",
      prescription: "Coartem (protocolo de 3 dias - 4 comprimidos por dose), Paracetamol 500mg",
      severity: "Grave",
      status: "Em Tratamento",
      doctorName: "Dra. Ana Maria"
    },
    {
      id: "PRON-2026-0003",
      inmateId: "PIR-2026-1049",
      inmateName: "Mateus Chivinda",
      prisonId: "PRIS-HUAMBO",
      prisonName: "Cadeia Central do Huambo",
      consultationDate: "2026-06-17",
      symptoms: "Dificuldade de locomoção, dor lombar aguda prolongada",
      diagnosis: "Lombalgia mecânica aguda secundária a esforço físico de trabalho",
      prescription: "Ibuprofeno 400mg, pomada anti-inflamatória Mioflex gel local, repouso de 5 dias",
      severity: "Ligeiro",
      status: "Alta Clínica",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "PRON-2026-0004",
      inmateId: "PIR-2026-0033",
      inmateName: "Pedro Gouveia",
      prisonId: "PRIS-01",
      prisonName: "Estabelecimento de Viana",
      consultationDate: "2026-06-18",
      symptoms: "Febre ligeira ao acordar, indisposição abdominal frequente",
      diagnosis: "Suspeita de gastrite bacteriana leve",
      prescription: "Omeprazol 20mg (em jejum), repouso e hidratação oral copiosa",
      severity: "Ligeiro",
      status: "Pendente",
      doctorName: "Dra. Ana Maria"
    },
    {
      id: "PRON-2026-0005",
      inmateId: "PIR-2026-0012",
      inmateName: "Sérgio Neto Kassanga",
      prisonId: "PRIS-HUAMBO",
      prisonName: "Cadeia Central do Huambo",
      consultationDate: "2026-06-14",
      symptoms: "Sintomatologia de asma asmática brônquica aguda debelada",
      diagnosis: "Resolução de crise asmática induzida por alérgenos suspensos",
      prescription: "Salbutamol spray SOS, repouso no dormitório climatizado",
      severity: "Moderado",
      status: "Recuperado",
      doctorName: "Dr. Mateus Luvumbo"
    }
  ]);

  const resolvedRecords = healthRecords || localRecords;
  const setResolvedRecords = setHealthRecords || setLocalRecords;

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // State arrays populated with rich seed data for inmates
  const [triagens, setTriagens] = useState<TriageRecord[]>(() => [
    {
      id: "TRI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      triageDate: "2026-06-12",
      bloodPressure: "140/90",
      heartRate: "82 bpm",
      temperature: "37.1 °C",
      weight: "74 kg",
      severity: "Moderado",
      symptoms: "Dor de cabeça constante e mal-estar geral",
      specialtyNeeded: "Medicina Geral",
      professionalName: "Enf.ª Teresa Chivela"
    },
    {
      id: "TRI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      triageDate: "2026-06-15",
      bloodPressure: "120/80",
      heartRate: "95 bpm",
      temperature: "38.9 °C",
      weight: "68 kg",
      severity: "Grave",
      symptoms: "Forte febre, tremores constantes e calafrios intensos",
      specialtyNeeded: "Infectologia / Especialista Clínico",
      professionalName: "Enf. Pedro Kassoma"
    },
    {
      id: "TRI-2026-0003",
      inmateId: "PIR-2026-1049",
      inmateName: "Mateus Chivinda",
      prisonId: "PRIS-HUAMBO",
      triageDate: "2026-06-17",
      bloodPressure: "115/70",
      heartRate: "68 bpm",
      temperature: "36.5 °C",
      weight: "81 kg",
      severity: "Ligeiro",
      symptoms: "Dor forte na zona lombar após movimentação de carga",
      specialtyNeeded: "Ortopedia / Fisioterapia",
      professionalName: "Enf.ª Teresa Chivela"
    }
  ]);

  const [acompanhamentos, setAcompanhamentos] = useState<FollowUpRecord[]>(() => [
    {
      id: "ACO-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      followUpDate: "2026-06-14",
      progressNotes: "Paciente reporta melhora nas dores de cabeça após repouso e Enalapril. Tensão arterial monitorizada está 125/82.",
      conditionStatus: "Melhoria",
      treatmentGiven: "Verificação periódica de sinais vitais + indicação de cessação temporária de esforço pesado.",
      nextReviewDate: "2026-06-21",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "ACO-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      followUpDate: "2026-06-17",
      progressNotes: "Excelente reatividade às doses de Coartem. Ausência total de picos febris e calafrios nas últimas 24h.",
      conditionStatus: "Estável",
      treatmentGiven: "Acompanhamento de protocolo de resgate para malária em isolamento temporário no posto clínico.",
      nextReviewDate: "2026-06-24",
      doctorName: "Dra. Ana Maria"
    }
  ]);

  const [prescricoes, setPrescricoes] = useState<PrescriptionRecord[]>(() => [
    {
      id: "PRE-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      prescriptionDate: "2026-06-13",
      diagnosisAssociated: "Crise Hipertensiva leve",
      medications: "Enalapril 20mg (1 comprimido diário pela manhã, via oral)",
      durationDays: 30,
      specialInstructions: "Oferecer dieta hipossódica e evitar longas exposições ao sol quente nos trabalhos externos.",
      doctorName: "Dr. Mateus Luvumbo",
      status: "Ativo"
    },
    {
      id: "PRE-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      prescriptionDate: "2026-06-16",
      diagnosisAssociated: "Malária por Plasmodium falciparum",
      medications: "Arteméter + Lumefantrina (Coartem) - regime de 3 dias, 4 comprimidos por toma, duas vezes ao dia.",
      durationDays: 3,
      specialInstructions: "Ingerir preferencialmente após refeição rica em lípidos para absorção plena.",
      doctorName: "Dra. Ana Maria",
      status: "Ativo"
    }
  ]);

  // Form Toggles and edit IDs
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);

  const [editTriageId, setEditTriageId] = useState<string | null>(null);
  const [editFollowUpId, setEditFollowUpId] = useState<string | null>(null);
  const [editPrescriptionId, setEditPrescriptionId] = useState<string | null>(null);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form Fields State
  // 1. Triage fields
  const [tInmateId, setTInmateId] = useState("");
  const [tBloodPressure, setTBloodPressure] = useState("120/80");
  const [tHeartRate, setTHeartRate] = useState("80 bpm");
  const [tTemperature, setTTemperature] = useState("36.5 °C");
  const [tWeight, setTWeight] = useState("70 kg");
  const [tSeverity, setTSeverity] = useState<"Ligeiro" | "Moderado" | "Grave" | "Crítico">("Ligeiro");
  const [tSymptoms, setTSymptoms] = useState("");
  const [tSpecialtyNeeded, setTSpecialtyNeeded] = useState("Medicina Geral");
  const [tProfessionalName, setTProfessionalName] = useState("");

  // 2. Follow-up fields
  const [fInmateId, setFInmateId] = useState("");
  const [fProgressNotes, setFProgressNotes] = useState("");
  const [fConditionStatus, setFConditionStatus] = useState<"Estável" | "Melhoria" | "Sob Observação" | "Crítico" | "Alta">("Estável");
  const [fTreatmentGiven, setFTreatmentGiven] = useState("");
  const [fNextReviewDate, setFNextReviewDate] = useState("");
  const [fDoctorName, setFDoctorName] = useState("");

  // 3. Prescription fields
  const [pInmateId, setPInmateId] = useState("");
  const [pDiagnosisAssociated, setPDiagnosisAssociated] = useState("");
  const [pMedications, setPMedications] = useState("");
  const [pDurationDays, setPDurationDays] = useState(7);
  const [pSpecialInstructions, setPSpecialInstructions] = useState("");
  const [pDoctorName, setPDoctorName] = useState("");
  const [pStatus, setPStatus] = useState<"Ativo" | "Concluído" | "Cancelado" | "Suspenso">("Ativo");

  // 4. Prontuários fields
  const [rInmateId, setRInmateId] = useState("");
  const [rSymptoms, setRSymptoms] = useState("");
  const [rDiagnosis, setRDiagnosis] = useState("");
  const [rPrescription, setRPrescription] = useState("");
  const [rSeverity, setRSeverity] = useState<"Ligeiro" | "Moderado" | "Grave" | "Crítico">("Ligeiro");
  const [rStatus, setRStatus] = useState<"Pendente" | "Em Tratamento" | "Recuperado" | "Alta Clínica">("Pendente");
  const [rDoctorName, setRDoctorName] = useState("");

  // 5. Permissões de Utilizadores fields
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const [editOpRole, setEditOpRole] = useState("");
  const [editOpFScope, setEditOpFScope] = useState("");
  const [editOpSensitivity, setEditOpSensitivity] = useState("");
  const [editOpViewClinical, setEditOpViewClinical] = useState(false);
  const [editOpEditClinical, setEditOpEditClinical] = useState(false);
  const [showOpForm, setShowOpForm] = useState(false);

  // Authentication & Clearance Check
  const isHealthAuthorized = hasPermission(SystemPermission.VIEW_CLINICAL) || 
                             currentOperator.functionalScope === FunctionalScope.SAUDE || 
                             currentOperator.role === "CHEFE_SAUDE" ||
                             currentOperator.role === "DIRECTOR_GERAL";

  const isSaudeEditor = hasPermission(SystemPermission.EDIT_CLINICAL) ||
                        currentOperator.functionalScope === FunctionalScope.SAUDE || 
                        currentOperator.role === "CHEFE_SAUDE" ||
                        currentOperator.role === "DIRECTOR_GERAL";

  // Helpers to reset fields
  const handleCancel = () => {
    setShowTriageForm(false);
    setShowFollowUpForm(false);
    setShowPrescriptionForm(false);
    setShowRecordForm(false);
    setShowOpForm(false);
    setEditTriageId(null);
    setEditFollowUpId(null);
    setEditPrescriptionId(null);
    setEditRecordId(null);
    setSelectedOpId(null);

    // reset fields
    setTInmateId(""); setTBloodPressure("120/80"); setTHeartRate("80 bpm"); setTTemperature("36.5 °C"); setTWeight("70 kg"); setTSeverity("Ligeiro"); setTSymptoms(""); setTSpecialtyNeeded("Medicina Geral"); setTProfessionalName("");
    setFInmateId(""); setFProgressNotes(""); setFConditionStatus("Estável"); setFTreatmentGiven(""); setFNextReviewDate(""); setFDoctorName("");
    setPInmateId(""); setPDiagnosisAssociated(""); setPMedications(""); setPDurationDays(7); setPSpecialInstructions(""); setPDoctorName(""); setPStatus("Ativo");
    setRInmateId(""); setRSymptoms(""); setRDiagnosis(""); setRPrescription(""); setRSeverity("Ligeiro"); setRStatus("Pendente"); setRDoctorName("");
    setEditOpRole(""); setEditOpFScope(""); setEditOpSensitivity(""); setEditOpViewClinical(false); setEditOpEditClinical(false);
  };

  // Submit operations
  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSaudeEditor) {
      alert("Operação Negada: O seu utilizador não possui permissão de edição clínica.");
      return;
    }
    if (!tInmateId) { alert("Indique o recluso associado!"); return; }
    
    const refInmate = inmates.find(i => i.id === tInmateId);
    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";

    if (editTriageId) {
      setTriagens(prev => prev.map(item => item.id === editTriageId ? {
        ...item,
        inmateId: tInmateId,
        inmateName: inName,
        bloodPressure: tBloodPressure,
        heartRate: tHeartRate,
        temperature: tTemperature,
        weight: tWeight,
        severity: tSeverity,
        symptoms: tSymptoms,
        specialtyNeeded: tSpecialtyNeeded,
        professionalName: tProfessionalName || currentOperator.name
      } : item));
      
      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Edição",
          inmateId: tInmateId,
          inmateName: inName,
          fieldChanged: "Triagem Médica",
          oldValue: "Sinais Vitais",
          newValue: `Sinais vitais e gravidade (${tSeverity}) atualizados pelo utilizador central.`
        },
        ...prev
      ]);
      triggerFeedback("Triagem médica de paciente atualizada!");
    } else {
      const newRec: TriageRecord = {
        id: `TRI-2026-${Math.floor(1000 + Math.random()*9000)}`,
        inmateId: tInmateId,
        inmateName: inName,
        prisonId: refInmate?.assignedPrisonId || "PRIS-HUAMBO",
        triageDate: new Date().toISOString().substring(0, 10),
        bloodPressure: tBloodPressure,
        heartRate: tHeartRate,
        temperature: tTemperature,
        weight: tWeight,
        severity: tSeverity,
        symptoms: tSymptoms,
        specialtyNeeded: tSpecialtyNeeded,
        professionalName: tProfessionalName || currentOperator.name
      };
      setTriagens(prev => [newRec, ...prev]);

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Admissão",
          inmateId: tInmateId,
          inmateName: inName,
          fieldChanged: "Nova Triagem Médica",
          oldValue: "-",
          newValue: `Criada nova ficha de triagem ${newRec.id} de gravidade ${tSeverity}.`
        },
        ...prev
      ]);
      triggerFeedback("Ficha de triagem clínica admitida com sucesso!");
    }
    handleCancel();
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSaudeEditor) {
      alert("Operação Negada: O seu utilizador não possui permissão de edição clínica.");
      return;
    }
    if (!fInmateId) { alert("Selecione o recluso acompanhado!"); return; }

    const refInmate = inmates.find(i => i.id === fInmateId);
    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";

    if (editFollowUpId) {
      setAcompanhamentos(prev => prev.map(item => item.id === editFollowUpId ? {
        ...item,
        inmateId: fInmateId,
        inmateName: inName,
        progressNotes: fProgressNotes,
        conditionStatus: fConditionStatus,
        treatmentGiven: fTreatmentGiven,
        nextReviewDate: fNextReviewDate || new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
        doctorName: fDoctorName || currentOperator.name
      } : item));

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Edição",
          inmateId: fInmateId,
          inmateName: inName,
          fieldChanged: "Evolução Médica",
          oldValue: "Registo Clínico",
          newValue: `Actualizado acompanhamento de ${inName} para o estado clínico: ${fConditionStatus}.`
        },
        ...prev
      ]);
      triggerFeedback("Acompanhamento clínico atualizado com sucesso!");
    } else {
      const newRec: FollowUpRecord = {
        id: `ACO-2026-${Math.floor(1000 + Math.random()*9000)}`,
        inmateId: fInmateId,
        inmateName: inName,
        prisonId: refInmate?.assignedPrisonId || "PRIS-HUAMBO",
        followUpDate: new Date().toISOString().substring(0, 10),
        progressNotes: fProgressNotes,
        conditionStatus: fConditionStatus,
        treatmentGiven: fTreatmentGiven,
        nextReviewDate: fNextReviewDate || new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
        doctorName: fDoctorName || currentOperator.name
      };
      setAcompanhamentos(prev => [newRec, ...prev]);

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Admissão",
          inmateId: fInmateId,
          inmateName: inName,
          fieldChanged: "Novo Registo de Acompanhamento",
          oldValue: "-",
          newValue: `Submetido novo boletim de evolução clínica ${newRec.id} (${fConditionStatus}).`
        },
        ...prev
      ]);
      triggerFeedback("Boletim de evolução clínica registado!");
    }
    handleCancel();
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSaudeEditor) {
      alert("Operação Negada: O seu utilizador não possui permissão de edição clínica.");
      return;
    }
    if (!pInmateId) { alert("Escolha o paciente!"); return; }
    if (!pMedications) { alert("Preencha a prescrição com medicamentos e dosagens!"); return; }

    const refInmate = inmates.find(i => i.id === pInmateId);
    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";

    if (editPrescriptionId) {
      setPrescricoes(prev => prev.map(item => item.id === editPrescriptionId ? {
        ...item,
        inmateId: pInmateId,
        inmateName: inName,
        diagnosisAssociated: pDiagnosisAssociated,
        medications: pMedications,
        durationDays: Number(pDurationDays),
        specialInstructions: pSpecialInstructions,
        doctorName: pDoctorName || currentOperator.name,
        status: pStatus
      } : item));

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Edição",
          inmateId: pInmateId,
          inmateName: inName,
          fieldChanged: "Prescrição Médica",
          oldValue: "Terapia e Fármacos",
          newValue: `Modificada prescrição ${editPrescriptionId}: estado alterado para ${pStatus}.`
        },
        ...prev
      ]);
      triggerFeedback("Receita e prescrição farmacêutica atualizada!");
    } else {
      const newRec: PrescriptionRecord = {
        id: `PRE-2026-${Math.floor(1000 + Math.random()*9000)}`,
        inmateId: pInmateId,
        inmateName: inName,
        prisonId: refInmate?.assignedPrisonId || "PRIS-HUAMBO",
        prescriptionDate: new Date().toISOString().substring(0, 10),
        diagnosisAssociated: pDiagnosisAssociated,
        medications: pMedications,
        durationDays: Number(pDurationDays),
        specialInstructions: pSpecialInstructions,
        doctorName: pDoctorName || currentOperator.name,
        status: pStatus
      };
      setPrescricoes(prev => [newRec, ...prev]);

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Admissão",
          inmateId: pInmateId,
          inmateName: inName,
          fieldChanged: "Nova Prescrição",
          oldValue: "-",
          newValue: `Passada nova receita de fármacos ${newRec.id} vinculada ao diagnóstico: ${pDiagnosisAssociated}`
        },
        ...prev
      ]);
      triggerFeedback("Receituário médico devidamente assinado e registado!");
    }
    handleCancel();
  };

  const handleEditRecord = (item: HealthRecord) => {
    setEditRecordId(item.id);
    setRInmateId(item.inmateId);
    setRSymptoms(item.symptoms);
    setRDiagnosis(item.diagnosis);
    setRPrescription(item.prescription);
    setRSeverity(item.severity);
    setRStatus(item.status);
    setRDoctorName(item.doctorName);
    setShowRecordForm(true);
  };

  const handleDeleteRecord = (id: string, name: string, inmateId: string) => {
    if (!isSaudeEditor) {
      alert("Acesso Negado: O seu perfil funcional não permite excluir prontuários no banco central.");
      return;
    }
    if (confirm("Tens a certeza que desejas excluir este registo clínico de forma irrevogável?")) {
      setResolvedRecords(prev => prev.filter(r => r.id !== id));
      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Edição",
          inmateId: inmateId,
          inmateName: name,
          fieldChanged: "Eliminação de Prontuário",
          oldValue: `Prontuário ${id}`,
          newValue: `Prontuário médico de ${name} excluído pelo operador.`
        },
        ...prev
      ]);
      triggerFeedback("Prontuário médico eliminado!");
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSaudeEditor) {
      alert("Operação Negada: O seu utilizador não possui permissão de edição clínica.");
      return;
    }
    if (!rInmateId) { alert("Selecione o recluso para o prontuário!"); return; }

    const refInmate = inmates.find(i => i.id === rInmateId);
    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";

    if (editRecordId) {
      setResolvedRecords(prev => prev.map(item => item.id === editRecordId ? {
        ...item,
        inmateId: rInmateId,
        inmateName: inName,
        symptoms: rSymptoms,
        diagnosis: rDiagnosis,
        prescription: rPrescription,
        severity: rSeverity,
        status: rStatus,
        doctorName: rDoctorName || currentOperator.name
      } : item));

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Edição",
          inmateId: rInmateId,
          inmateName: inName,
          fieldChanged: "Prontuário Médico",
          oldValue: "Ficha clínica",
          newValue: `Atualizado prontuário médico de ${inName} para o estado clínico: ${rStatus}.`
        },
        ...prev
      ]);
      triggerFeedback("Prontuário médico atualizado!");
    } else {
      const newRec: HealthRecord = {
        id: `PRON-2026-${Math.floor(1000 + Math.random()*9000)}`,
        inmateId: rInmateId,
        inmateName: inName,
        prisonId: refInmate?.assignedPrisonId || "PRIS-HUAMBO",
        prisonName: refInmate?.assignedPrisonName || "Cadeia Central do Huambo",
        consultationDate: new Date().toISOString().substring(0, 10),
        symptoms: rSymptoms,
        diagnosis: rDiagnosis,
        prescription: rPrescription,
        severity: rSeverity,
        status: rStatus,
        doctorName: rDoctorName || currentOperator.name
      };
      setResolvedRecords(prev => [newRec, ...prev]);

      setAuditLogs(prev => [
        {
          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Admissão",
          inmateId: rInmateId,
          inmateName: inName,
          fieldChanged: "Novo Prontuário Médico",
          oldValue: "-",
          newValue: `Criado novo prontuário médico ${newRec.id} de gravidade ${rSeverity} e estado ${rStatus}.`
        },
        ...prev
      ]);
      triggerFeedback("Prontuário médico emitido e registado!");
    }
    handleCancel();
  };

  const handleOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpId || !setOperators) return;

    setOperators(prev => prev.map(op => {
      if (op.id === selectedOpId) {
        // Construct custom permissions
        const customPermissions = op.customPermissions ? [...op.customPermissions] : [...(op.permissions || [])];
        
        // Remove or add SystemPermission values dynamically
        const cleanPermissions = customPermissions.filter(p => p !== SystemPermission.VIEW_CLINICAL && p !== SystemPermission.EDIT_CLINICAL);
        if (editOpViewClinical) cleanPermissions.push(SystemPermission.VIEW_CLINICAL);
        if (editOpEditClinical) cleanPermissions.push(SystemPermission.EDIT_CLINICAL);

        return {
          ...op,
          role: editOpRole,
          functionalScope: editOpFScope,
          sensitivityLevel: editOpSensitivity,
          customPermissions: cleanPermissions
        };
      }
      return op;
    }));

    // Find full operator details for audit log
    const updatedOp = operators.find(o => o.id === selectedOpId);
    if (updatedOp) {
      const logMsg = `Alteradas permissões clínicas do operador ${updatedOp.name} (ID: ${selectedOpId}). Escopo funcional: ${editOpFScope}, Nível de Sensibilidade: ${editOpSensitivity}. Leitura Clínica: ${editOpViewClinical ? "Sim" : "Não"}, Escrita: ${editOpEditClinical ? "Sim" : "Não"}.`;
      setAuditLogs(prev => [
        {
          id: `AUD-SAU-PERM-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentOperatorId,
          operatorId: currentOperatorId,
          operatorName: currentOperator.name,
          roleName: currentOperator.roleName,
          action: "Configuração de Permissão",
          actionType: "SYSTEM_CONFIG",
          targetEntity: "OPERATORS_PERMISSIONS",
          targetId: selectedOpId,
          description: logMsg,
          deviceIp: "192.168.12.91",
          securityClassification: "CONFIDENTIAL",
          integrityHash: "SHA256-PERM_OK_SEC_COMPLIANCE",
          fieldChanged: "Permissões Clínicas",
          oldValue: "Anterior",
          newValue: logMsg
        },
        ...prev
      ]);
    }

    triggerFeedback("Permissões de utilizador salvas!");
    handleCancel();
  };

  const handleEditOperator = (op: any) => {
    setSelectedOpId(op.id);
    setEditOpRole(op.role);
    setEditOpFScope(op.functionalScope || (op.role === "CHEFE_SAUDE" ? FunctionalScope.SAUDE : op.role === "CHEFE_SEGURANCA" ? FunctionalScope.SEGURANCA : FunctionalScope.GERAL));
    setEditOpSensitivity(op.sensitivityLevel || "RESTRITO");
    
    // Find current permissions
    const perms = op.customPermissions || op.systemRole?.permissions || op.permissions || [];
    setEditOpViewClinical(perms.includes(SystemPermission.VIEW_CLINICAL) || perms.includes("Saúde") || perms.includes("Relatórios clínicos"));
    setEditOpEditClinical(perms.includes(SystemPermission.EDIT_CLINICAL) || perms.includes("Saúde") || perms.includes("Relatórios clínicos"));
    setShowOpForm(true);
  };

  // Delete handlers
  const handleDeleteClinical = (type: "triagem" | "acompanhamento" | "prescricao", id: string) => {
    if (!isSaudeEditor) {
      alert("Acesso Negado: O seu perfil funcional não permite excluir prontuários no banco central.");
      return;
    }
    if (confirm("Tens a certeza que desejas excluir este registo clínico de forma irrevogável?")) {
      if (type === "triagem") {
        const item = triagens.find(t => t.id === id);
        setTriagens(prev => prev.filter(t => t.id !== id));
        setAuditLogs(prev => [
          {
            id: `AUD-H-${Math.floor(Math.random()*10000)}`,
            userId: currentOperatorId,
            timestamp: new Date().toISOString(),
            action: "Edição",
            inmateId: item?.inmateId || "DESCONHECIDO",
            inmateName: item?.inmateName || "Desconhecido",
            fieldChanged: "Eliminação de Triagem",
            oldValue: `Triagem ${id}`,
            newValue: `Registo de triagem excluído pelo operador central.`
          },
          ...prev
        ]);
        triggerFeedback("Ficha de triagem eliminada do posto médico.");
      } else if (type === "acompanhamento") {
        const item = acompanhamentos.find(t => t.id === id);
        setAcompanhamentos(prev => prev.filter(t => t.id !== id));
        setAuditLogs(prev => [
          {
            id: `AUD-H-${Math.floor(Math.random()*10000)}`,
            userId: currentOperatorId,
            timestamp: new Date().toISOString(),
            action: "Edição",
            inmateId: item?.inmateId || "DESCONHECIDO",
            inmateName: item?.inmateName || "Desconhecido",
            fieldChanged: "Eliminação de Evolução",
            oldValue: `Acompanhamento ${id}`,
            newValue: `Ficha de acompanhamento excluída do sistema.`
          },
          ...prev
        ]);
        triggerFeedback("Ficha de evolução clínica eliminada.");
      } else if (type === "prescricao") {
        const item = prescricoes.find(t => t.id === id);
        setPrescricoes(prev => prev.filter(t => t.id !== id));
        setAuditLogs(prev => [
          {
            id: `AUD-H-${Math.floor(Math.random()*10000)}`,
            userId: currentOperatorId,
            timestamp: new Date().toISOString(),
            action: "Edição",
            inmateId: item?.inmateId || "DESCONHECIDO",
            inmateName: item?.inmateName || "Desconhecido",
            fieldChanged: "Eliminação de Prescrição",
            oldValue: `Receituário ${id}`,
            newValue: `Eliminado registo de medicação e prescrição clínica.`
          },
          ...prev
        ]);
        triggerFeedback("Prescrição e receita médica removidas.");
      }
    }
  };

  // Edit launchers
  const launchEditTriage = (item: TriageRecord) => {
    setEditTriageId(item.id);
    setShowTriageForm(true);
    setTInmateId(item.inmateId);
    setTBloodPressure(item.bloodPressure);
    setTHeartRate(item.heartRate);
    setTTemperature(item.temperature);
    setTWeight(item.weight);
    setTSeverity(item.severity);
    setTSymptoms(item.symptoms);
    setTSpecialtyNeeded(item.specialtyNeeded);
    setTProfessionalName(item.professionalName);
  };

  const launchEditFollowUp = (item: FollowUpRecord) => {
    setEditFollowUpId(item.id);
    setShowFollowUpForm(true);
    setFInmateId(item.inmateId);
    setFProgressNotes(item.progressNotes);
    setFConditionStatus(item.conditionStatus);
    setFTreatmentGiven(item.treatmentGiven);
    setFNextReviewDate(item.nextReviewDate);
    setFDoctorName(item.doctorName);
  };

  const launchEditPrescription = (item: PrescriptionRecord) => {
    setEditPrescriptionId(item.id);
    setShowPrescriptionForm(true);
    setPInmateId(item.inmateId);
    setPDiagnosisAssociated(item.diagnosisAssociated);
    setPMedications(item.medications);
    setPDurationDays(item.durationDays);
    setPSpecialInstructions(item.specialInstructions);
    setPDoctorName(item.doctorName);
    setPStatus(item.status);
  };

  // 🛡️ Lock View check for unauthorized operators
  if (!isHealthAuthorized) {
    return (
      <div className="bg-slate-950 border border-red-500/10 rounded-2xl p-8 max-w-3xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-full animate-pulse text-red-500">
            <Lock className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono text-red-500 font-bold bg-red-950/45 border border-red-500/20 px-3 py-1 rounded-full">
            Bloqueado: Canal de Segurança de Privacidade Médica
          </span>
          <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
            Acesso Restrito ao Módulo Clínico de Saúde
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl mx-auto">
            O seu perfil de acesso corrente (<strong className="text-red-400 font-bold">{currentOperator.roleName}</strong>) possui restrição de sigilo funcional em conformidade com as diretivas sanitárias nacionais e o protocolo do MININT. A leitura, alteração ou exclusão de triagens, acompanhamentos e prescrições médicas estão limitados exclusivamente ao corpo de saúde homologado.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left max-w-lg mx-auto">
          <h4 className="text-[10px] uppercase font-mono text-slate-300 font-bold flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
            🔑 Credenciais autorizadas no sistema:
          </h4>
          <ul className="text-[11px] font-sans text-slate-400 space-y-1.5 leading-tight">
            <li>• <strong>Chefe dos Serviços de Saúde</strong> (role: <code>CHEFE_SAUDE</code>)</li>
            <li>• <strong>Director Geral do PNAP</strong> (role: <code>DIRECTOR_GERAL</code>)</li>
            <li>• <strong>Operadores com Escopo Funcional de Saúde</strong> (scope: <code>SAUDE</code>)</li>
          </ul>
        </div>
      </div>
    );
  }

  // Filter computations
  const query = searchQuery.toLowerCase().trim();

  const filteredRecords = resolvedRecords.filter(item => {
    const matchesSearch = !query || 
      item.inmateName.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.symptoms && item.symptoms.toLowerCase().includes(query)) ||
      (item.diagnosis && item.diagnosis.toLowerCase().includes(query)) ||
      (item.doctorName && item.doctorName.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Recharts Pie Chart Data Calculation
  const statusCounts = resolvedRecords.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {
    "Pendente": 0,
    "Em Tratamento": 0,
    "Recuperado": 0,
    "Alta Clínica": 0
  } as Record<string, number>);

  const pieData = [
    { name: "Pendente", value: statusCounts["Pendente"], color: "#f59e0b" },
    { name: "Em Tratamento", value: statusCounts["Em Tratamento"], color: "#38bdf8" },
    { name: "Recuperado", value: statusCounts["Recuperado"], color: "#10b981" },
    { name: "Alta Clínica", value: statusCounts["Alta Clínica"], color: "#818cf8" }
  ];
  const totalRecords = resolvedRecords.length;
  
  const filteredTriages = triagens.filter(t => {
    const matchesSearch = !query || 
      t.inmateName.toLowerCase().includes(query) || 
      t.id.toLowerCase().includes(query) || 
      t.symptoms.toLowerCase().includes(query);
    const matchesSeverity = severityFilter === "ALL" || t.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredFollowUps = acompanhamentos.filter(f => {
    const matchesSearch = !query || 
      f.inmateName.toLowerCase().includes(query) || 
      f.id.toLowerCase().includes(query) || 
      f.progressNotes.toLowerCase().includes(query) ||
      f.treatmentGiven.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "ALL" || f.conditionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPrescriptions = prescricoes.filter(p => {
    const matchesSearch = !query || 
      p.inmateName.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) || 
      p.medications.toLowerCase().includes(query) || 
      p.diagnosisAssociated.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Clinician Titlebar Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        {/* Partition Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit shrink-0 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => { setHealthSection("triagens"); handleCancel(); }}
            className={`px-3 py-1.5 font-bold text-[10px] tracking-wide uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              healthSection === "triagens"
                ? "bg-slate-800 text-teal-400 border border-slate-700 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HeartPulse className="h-3.5 w-3.5 text-teal-450" />
            1. Triagens
          </button>
          <button
            type="button"
            onClick={() => { setHealthSection("acompanhamentos"); handleCancel(); }}
            className={`px-3 py-1.5 font-bold text-[10px] tracking-wide uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              healthSection === "acompanhamentos"
                ? "bg-slate-800 text-teal-400 border border-slate-700 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5 text-teal-450" />
            2. Evolução Clínica
          </button>
          <button
            type="button"
            onClick={() => { setHealthSection("prescricoes"); handleCancel(); }}
            className={`px-3 py-1.5 font-bold text-[10px] tracking-wide uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              healthSection === "prescricoes"
                ? "bg-slate-800 text-teal-400 border border-slate-700 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Pill className="h-3.5 w-3.5 text-teal-455" />
            3. Prescrições Médicas
          </button>
          <button
            type="button"
            onClick={() => { setHealthSection("prontuarios"); handleCancel(); }}
            className={`px-3 py-1.5 font-bold text-[10px] tracking-wide uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              healthSection === "prontuarios"
                ? "bg-slate-800 text-teal-400 border border-slate-700 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-teal-455" />
            4. Prontuários Médicos (CRUD)
          </button>
          <button
            type="button"
            onClick={() => { setHealthSection("permissoes"); handleCancel(); }}
            className={`px-3 py-1.5 font-bold text-[10px] tracking-wide uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              healthSection === "permissoes"
                ? "bg-slate-800 text-teal-400 border border-slate-700 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-teal-455" />
            5. Gestão de Permissões
          </button>
        </div>

        {/* Feedback indicators */}
        {feedbackMsg && (
          <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 animate-bounce">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            {feedbackMsg}
          </div>
        )}

        {/* Trigger creation of new record */}
        {healthSection === "triagens" && !showTriageForm && (
          <button
            type="button"
            onClick={() => setShowTriageForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition scroll-m-1 flex items-center gap-1.5 self-start lg:self-center cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Nova Triagem Geral
          </button>
        )}
        {healthSection === "acompanhamentos" && !showFollowUpForm && (
          <button
            type="button"
            onClick={() => setShowFollowUpForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition scroll-m-1 flex items-center gap-1.5 self-start lg:self-center cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Registar Acompanhamento
          </button>
        )}
        {healthSection === "prescricoes" && !showPrescriptionForm && (
          <button
            type="button"
            onClick={() => setShowPrescriptionForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition scroll-m-1 flex items-center gap-1.5 self-start lg:self-center cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Passar Prescrição Médica
          </button>
        )}
        {healthSection === "prontuarios" && !showRecordForm && (
          <button
            type="button"
            onClick={() => setShowRecordForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition scroll-m-1 flex items-center gap-1.5 self-start lg:self-center cursor-pointer shadow-lg shadow-teal-500/10"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Adicionar Prontuário Clínico
          </button>
        )}
      </div>

      {/* KPI Stats and Recharts Circular Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Statistics KPIs Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3 h-full">
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-left flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Controlo Clínico</span>
              <span className="text-2xl font-bold text-slate-100 mt-1 block">{resolvedRecords.length}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">Prontuários médicos registados e homologados</p>
          </div>
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-left flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-amber-500 block uppercase font-bold tracking-wider">Pendentes de Alta</span>
              <span className="text-2xl font-bold text-amber-500 mt-1 block">
                {resolvedRecords.filter(r => r.status === "Pendente" || r.status === "Em Tratamento").length}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">Reclusos em vigia ou sob tratamento intensivo</p>
          </div>
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-left flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 block uppercase font-bold tracking-wider">Recuperados & Altas</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                {resolvedRecords.filter(r => r.status === "Recuperado" || r.status === "Alta Clínica").length}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">Casos resolvidos com alta do posto de saúde</p>
          </div>
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-left flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-rose-500 block uppercase font-bold tracking-wider">Casos Graves / Críticos</span>
              <span className="text-2xl font-bold text-rose-450 mt-1 block">
                {resolvedRecords.filter(r => r.severity === "Crítico" || r.severity === "Grave").length}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">Prioridade máxima nas enfermarias locais</p>
          </div>
        </div>

        {/* Recharts Circular Grafico Distribution */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col justify-between text-left h-[230px] lg:h-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Distribuição por Estado Clínico</span>
            <span className="text-[10px] text-teal-400 font-mono bg-teal-950/40 border border-teal-900/40 px-2 py-0.5 rounded font-bold">Gráfico Circular</span>
          </div>
          <div className="flex items-center gap-4 py-2 h-full">
            {/* Center Pie rendering */}
            <div className="w-1/2 h-[120px] relative select-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={52}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                <span className="text-sm font-bold text-slate-100 font-mono">{totalRecords}</span>
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">Fichas</span>
              </div>
            </div>
            {/* Custom visual legend list */}
            <div className="w-1/2 space-y-1.5 font-sans">
              {pieData.map((item, idx) => {
                const percent = totalRecords > 0 ? Math.round((item.value / totalRecords) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-[11px] leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-350 truncate max-w-[76px] font-medium" title={item.name}>{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono font-bold">{item.value} <span className="text-[9px] text-slate-600 font-normal">({percent}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Forms Segmented */}
      {/* 1. Triage Form */}
      {showTriageForm && (
        <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl shadow-2xl animate-fadeIn text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono">
              <Sliders className="h-4 w-4 text-teal-400" />
              {editTriageId ? `Editar Triage ${editTriageId}` : "Instaurar Nova Triagem Geral de Paciente"}
            </h3>
            <button type="button" onClick={handleCancel} className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded cursor-pointer font-semibold uppercase">
              Cancelar
            </button>
          </div>
          <form onSubmit={handleTriageSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Paciente (Recluso) *</label>
              <select
                value={tInmateId}
                onChange={(e) => setTInmateId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="">-- Selecione o Paciente --</option>
                {inmates.map(i => (
                  <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Gravidade Inicial *</label>
              <select
                value={tSeverity}
                onChange={(e) => setTSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-semibold text-teal-400"
              >
                <option value="Ligeiro">Pouco Urgente (Ligeiro)</option>
                <option value="Moderado">Urgente (Moderado)</option>
                <option value="Grave">Muito Urgente (Grave)</option>
                <option value="Crítico">Emergência / Crítico</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-semibold">Técnico responsável</label>
              <input
                type="text"
                value={tProfessionalName}
                onChange={(e) => setTProfessionalName(e.target.value)}
                placeholder="e.g. Enf.ª Teresa Chivela"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            {/* Vital Signs Grid */}
            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <div>
                <label className="text-[9px] text-slate-500 block mb-1 font-mono uppercase font-bold flex items-center gap-1">
                  <Activity className="h-3 w-3 text-red-400" /> Pressão Arterial
                </label>
                <input
                  type="text"
                  required
                  value={tBloodPressure}
                  onChange={(e) => setTBloodPressure(e.target.value)}
                  placeholder="e.g. 120/80 mmHg"
                  className="w-full bg-slate-900 border border-slate-800 p-1.5 text-xs rounded text-slate-200 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1 font-mono uppercase font-bold flex items-center gap-1">
                  <Activity className="h-3 w-3 text-orange-400" /> Frequência Cardíaca
                </label>
                <input
                  type="text"
                  required
                  value={tHeartRate}
                  onChange={(e) => setTHeartRate(e.target.value)}
                  placeholder="e.g. 75 bpm"
                  className="w-full bg-slate-900 border border-slate-800 p-1.5 text-xs rounded text-slate-200 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1 font-mono uppercase font-bold flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-sky-400" /> Temperatura
                </label>
                <input
                  type="text"
                  required
                  value={tTemperature}
                  onChange={(e) => setTTemperature(e.target.value)}
                  placeholder="e.g. 36.6 °C"
                  className="w-full bg-slate-900 border border-slate-800 p-1.5 text-xs rounded text-slate-200 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1 font-mono uppercase font-bold flex items-center gap-1">
                  <Activity className="h-3 w-3 text-yellow-400" /> Peso Corporal
                </label>
                <input
                  type="text"
                  required
                  value={tWeight}
                  onChange={(e) => setTWeight(e.target.value)}
                  placeholder="e.g. 74 kg"
                  className="w-full bg-slate-900 border border-slate-800 p-1.5 text-xs rounded text-slate-200 outline-none font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Principais Queixas e Sintomas Declarados *</label>
              <input
                type="text"
                required
                value={tSymptoms}
                onChange={(e) => setTSymptoms(e.target.value)}
                placeholder="Discorra resumidamente sobre cefaleias, tremores, febre, dor local, etc."
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Encaminhamento / Especialidade Recom.</label>
              <input
                type="text"
                value={tSpecialtyNeeded}
                onChange={(e) => setTSpecialtyNeeded(e.target.value)}
                placeholder="e.g. Medicina Geral, Ortopedia..."
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer">
                <CheckCircle className="h-4 w-4" />
                {editTriageId ? "Gravar Edições de Triagem" : "Submeter Boletim de Triagem"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Clinical Follow-Up Form */}
      {showFollowUpForm && (
        <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl shadow-2xl animate-fadeIn text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 font-mono select-none">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-teal-400 animate-pulse" />
              {editFollowUpId ? `Editar Evolução Clínica: ${editFollowUpId}` : "Registar Novo Acompanhamento e Evolução Clínica"}
            </h3>
            <button type="button" onClick={handleCancel} className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded cursor-pointer font-bold uppercase">
              Cancelar
            </button>
          </div>
          <form onSubmit={handleFollowUpSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Paciente Monitorizado *</label>
              <select
                value={fInmateId}
                onChange={(e) => setFInmateId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="">-- Seleccionar Paciente --</option>
                {inmates.map(i => (
                  <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Estado de Evolução *</label>
              <select
                value={fConditionStatus}
                onChange={(e) => setFConditionStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-semibold text-emerald-400"
              >
                <option value="Estável">Estável</option>
                <option value="Melhoria">Melhoria Assinalável (Regressão de Sintomas)</option>
                <option value="Sob Observação">Sob Observação Crítica no Posto</option>
                <option value="Crítico">Crítico (Piorou)</option>
                <option value="Alta">Alta Clínica Concedida</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Médico Assistente Responsável</label>
              <input
                type="text"
                value={fDoctorName}
                onChange={(e) => setFDoctorName(e.target.value)}
                placeholder="e.g. Dr. Mateus Luvumbo"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Notas de Evolução e Avaliação Clínica *</label>
              <textarea
                required
                value={fProgressNotes}
                onChange={(e) => setFProgressNotes(e.target.value)}
                placeholder="Insira notas completas sobre a condição atual do recluso, regressão de queixas, hidratação, etc."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Tratamento Aplicado</label>
                <input
                  type="text"
                  value={fTreatmentGiven}
                  onChange={(e) => setFTreatmentGiven(e.target.value)}
                  placeholder="e.g. Isolação, soro fisiológico, dosagem, etc."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Data do Próximo Controlo Clínico</label>
                <input
                  type="date"
                  value={fNextReviewDate}
                  onChange={(e) => setFNextReviewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer">
                <CheckCircle className="h-4 w-4" />
                {editFollowUpId ? "Salvar Evolução Médica" : "Registar Ficha de Evolução"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Prescription Form */}
      {showPrescriptionForm && (
        <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl shadow-2xl animate-fadeIn text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 select-none">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono">
              <Pill className="h-4 w-4 text-teal-400" />
              {editPrescriptionId ? `Modificar Prescrição ${editPrescriptionId}` : "Preencher e Cadastrar Nova Prescrição de Fármacos"}
            </h3>
            <button type="button" onClick={handleCancel} className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded cursor-pointer font-bold uppercase">
              Cancelar
            </button>
          </div>
          <form onSubmit={handlePrescriptionSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Paciente Prescrito *</label>
              <select
                value={pInmateId}
                onChange={(e) => setPInmateId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="">-- Seleccionar Paciente --</option>
                {inmates.map(i => (
                  <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Diagnóstico Associado ao Quadro *</label>
              <input
                type="text"
                required
                value={pDiagnosisAssociated}
                onChange={(e) => setPDiagnosisAssociated(e.target.value)}
                placeholder="e.g. Infecção urinária aguda, Malária, Lombalgia"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Estado Ativo da Terapia *</label>
              <select
                value={pStatus}
                onChange={(e) => setPStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-semibold text-teal-300"
              >
                <option value="Ativo">Ativo (Terapia em curso)</option>
                <option value="Concluído">Concluído (Tratamento finalizado)</option>
                <option value="Cancelado">Cancelado por reacção adversa</option>
                <option value="Suspenso">Suspenso temporariamente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Medicamentos e Dosagens Detalhadas *</label>
              <textarea
                required
                value={pMedications}
                onChange={(e) => setPMedications(e.target.value)}
                placeholder="e.g. Paracetamol 500mg (8h/8h de 5 dias), Amoxicilina 500mg cápsulas..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Duração do Tratamento (em Dias) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pDurationDays}
                  onChange={(e) => setPDurationDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-semibold">Médico Prescritor Homologador</label>
                <input
                  type="text"
                  value={pDoctorName}
                  onChange={(e) => setPDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Mateus Luvumbo"
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Recomendações e Instruções de Administração</label>
              <input
                type="text"
                value={pSpecialInstructions}
                onChange={(e) => setPSpecialInstructions(e.target.value)}
                placeholder="e.g. Administrar estritamente após ingestão de sólidos, restrição hídrica, repouso no pavilhão de isolamento s0"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer">
                <CheckCircle className="h-4 w-4" />
                {editPrescriptionId ? "Guardar Modificações na Receita" : "Passar e Homologar Prescrição"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Prontuários Clinicos Form */}
      {showRecordForm && (
        <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl shadow-2xl animate-fadeIn text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 select-none">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono">
              <Sliders className="h-4 w-4 text-teal-400" />
              {editRecordId ? `Editar Prontuário Médico ${editRecordId}` : "Preencher e Instaurar Novo Prontuário Clínico de Recluso"}
            </h3>
            <button type="button" onClick={handleCancel} className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded cursor-pointer font-bold uppercase">
              Cancelar
            </button>
          </div>
          <form onSubmit={handleRecordSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Recluso (Paciente) *</label>
              <select
                value={rInmateId}
                onChange={(e) => setRInmateId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="">-- Selecione o Paciente --</option>
                {inmates.map(i => (
                  <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Estado Clínico (Status) *</label>
              <select
                value={rStatus}
                onChange={(e) => setRStatus(e.target.value as any)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-semibold text-teal-300"
              >
                <option value="Pendente">Pendente</option>
                <option value="Em Tratamento">Em Tratamento</option>
                <option value="Recuperado">Recuperado</option>
                <option value="Alta Clínica">Alta Clínica</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Médico Assistente Responsável</label>
              <input
                type="text"
                value={rDoctorName}
                onChange={(e) => setRDoctorName(e.target.value)}
                placeholder="e.g. Dr. Mateus Luvumbo"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Severidade / Gravidade *</label>
              <select
                value={rSeverity}
                onChange={(e) => setRSeverity(e.target.value as any)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="Ligeiro">Ligeiro</option>
                <option value="Moderado">Moderado</option>
                <option value="Grave">Grave</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Principais Queixas e Sintomas do Recluso</label>
              <input
                type="text"
                value={rSymptoms}
                onChange={(e) => setRSymptoms(e.target.value)}
                placeholder="e.g. Cefaleia recorrente, espasmos abdominais ou tremores"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Diagnóstico Clínico Regularizado *</label>
              <input
                type="text"
                required
                value={rDiagnosis}
                onChange={(e) => setRDiagnosis(e.target.value)}
                placeholder="e.g. Malária por Plasmodium falciparum primária ou crise de asma sazonal"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Prescrição Terapêutica / Medicamentos Administrados</label>
              <textarea
                value={rPrescription}
                onChange={(e) => setRPrescription(e.target.value)}
                placeholder="Especifique doses, intervalos de toma, posologia e restrições..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer">
                <CheckCircle className="h-4 w-4" />
                {editRecordId ? "Gravar Edições de Prontuário" : "Homologar de Forma Definitiva"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Formulário de Permissões de Utilizadores */}
      {showOpForm && selectedOpId && (
        <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl shadow-2xl animate-fadeIn text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 select-none">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono">
              <UserCheck className="h-4 w-4 text-teal-400" />
              Gestão de Permissões de Acesso do Operador
            </h3>
            <button type="button" onClick={handleCancel} className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded cursor-pointer font-bold uppercase">
              Cancelar
            </button>
          </div>
          <form onSubmit={handleOperatorSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Operador (Nome Completo)</label>
              <input
                type="text"
                disabled
                value={operators.find(op => op.id === selectedOpId)?.name || ""}
                className="w-full bg-slate-950/65 border border-slate-850 p-2 text-xs rounded text-slate-400 outline-none cursor-not-allowed font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Identificador (Cód. Operador)</label>
              <input
                type="text"
                disabled
                value={selectedOpId}
                className="w-full bg-slate-950/65 border border-slate-850 p-2 text-xs rounded text-slate-500 outline-none cursor-not-allowed font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Papel do Sistema (Painel Geral) *</label>
              <select
                value={editOpRole || ""}
                onChange={(e) => setEditOpRole(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-semibold text-teal-300"
              >
                <option value="DIRECTOR_GERAL">Director Geral</option>
                <option value="DIRECTOR_PROVINCIAL">Director Provincial</option>
                <option value="DIRECTOR_CADEIA">Director de Cadeia</option>
                <option value="CHEFE_SEGURANCA">Chefe de Segurança Penal</option>
                <option value="CHEFE_SAUDE">Chefe de Saúde Geral</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Escopo Funcional (Bloqueio) *</label>
              <select
                value={editOpFScope || ""}
                onChange={(e) => setEditOpFScope(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="SAUDE">SAUDE (Módulo Médico & Clínico Hospitalar)</option>
                <option value="GERAL">GERAL (Secretarias, Direção e Coordenação)</option>
                <option value="SEGURANCA">SEGURANCA (Controle Físico, Grades & Vigilância)</option>
                <option value="INTELIGENCIA">INTELIGENCIA (Levantamentos, Informações, Alarmes)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">Classificação de Sensibilidade *</label>
              <select
                value={editOpSensitivity || ""}
                onChange={(e) => setEditOpSensitivity(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
              >
                <option value="PUBLICO">PUBLICO (Acesso Livre Nacional)</option>
                <option value="RESTRITO">RESTRITO (Nível Local Estabelecimento)</option>
                <option value="CONFIDENCIAL">CONFIDENCIAL (Serviços Oficiais Confidenciais)</option>
                <option value="SECRETO">SECRETO (Gabinete do Diretor & Assuntos Sigilosos)</option>
              </select>
            </div>
            <div className="bg-slate-950/50 border border-slate-850 p-2 rounded flex flex-col justify-center space-y-1.5 md:col-span-1 px-3">
              <span className="text-[9px] text-slate-400 font-mono uppercase block font-bold">Permissões de Acesso Clínico Granulares:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={editOpViewClinical}
                    onChange={(e) => setEditOpViewClinical(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-755 text-teal-500 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span>Ver Reg. (VIEW_CLINICAL)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={editOpEditClinical}
                    onChange={(e) => setEditOpEditClinical(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-755 text-teal-500 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span>Editar (EDIT_CLINICAL)</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer">
                <CheckCircle className="h-4 w-4" />
                Gravar e Aplicar Permissões
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER SEARCH BARS */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar registros pós-triados por recluso ou sintomas declarados..."
            className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 transition font-mono"
          />
        </div>

        {healthSection === "triagens" && (
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-teal-500/50"
            >
              <option value="ALL">Todas as Gravidades</option>
              <option value="Ligeiro">Ligeiro</option>
              <option value="Moderado">Moderado</option>
              <option value="Grave">Grave</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>
        )}

        {healthSection === "acompanhamentos" && (
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-teal-500/50"
            >
              <option value="ALL">Todos os Estados de Evolução</option>
              <option value="Estável">Estável</option>
              <option value="Melhoria">Melhoria</option>
              <option value="Sob Observação">Sob Observação</option>
              <option value="Crítico">Crítico</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        )}

        {healthSection === "prescricoes" && (
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-teal-500/50"
            >
              <option value="ALL">Todos os Estados da Terapia</option>
              <option value="Ativo">Ativo</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Suspenso">Suspenso</option>
            </select>
          </div>
        )}

        {healthSection === "prontuarios" && (
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-teal-500/50"
            >
              <option value="ALL">Todos os Estados Clínicos</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Tratamento">Em Tratamento</option>
              <option value="Recuperado">Recuperado</option>
              <option value="Alta Clínica">Alta Clínica</option>
            </select>
          </div>
        )}
      </div>

      {/* RENDER DYNAMIC TABLES */}
      <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/60 shadow-lg select-none">
        
        {/* 1. Triagens List output */}
        {healthSection === "triagens" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900/60">
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Cód. Triage</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Recluso (RNR)</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Queixas Declaradas</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Sinais Vitais Registados</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Triador</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Gravidade</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-sans">
              {filteredTriages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    Nenhum prontuário de triagem médica correspondente encontrado.
                  </td>
                </tr>
              ) : (
                filteredTriages.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-350">{item.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-100">{item.inmateName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-left max-w-xs">
                        <span className="text-slate-200">{item.symptoms}</span>
                        <span className="text-[9.5px] text-teal-400 font-mono">Esp. Recom: {item.specialtyNeeded}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[10px] text-slate-400">
                        <span>P.A: <strong className="text-slate-300">{item.bloodPressure}</strong></span>
                        <span>F.C: <strong className="text-slate-300">{item.heartRate}</strong></span>
                        <span>Temp: <strong className="text-slate-300">{item.temperature}</strong></span>
                        <span>Peso: <strong className="text-slate-300">{item.weight}</strong></span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-350">{item.professionalName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        item.severity === "Crítico" ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" :
                        item.severity === "Grave" ? "bg-rose-950/20 border-rose-500/20 text-rose-350" :
                        item.severity === "Moderado" ? "bg-amber-955/20 border-amber-500/20 text-amber-450" :
                        "bg-slate-900 border-slate-850 text-slate-405"
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => launchEditTriage(item)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClinical("triagem", item.id)}
                          className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* 2. Acompanhamento Clínico List output */}
        {healthSection === "acompanhamentos" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900/60">
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Cód. evol.</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Recluso (RNR)</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Notas de Evolução Clínica</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Procedimentos / Medidas</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Médico Responsável</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Próx. Controlo</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Estado Clínico</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-sans">
              {filteredFollowUps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    Nenhum acompanhamento clínico encontrado sob os filtros.
                  </td>
                </tr>
              ) : (
                filteredFollowUps.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-350">{item.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-100">{item.inmateName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs">{item.progressNotes}</td>
                    <td className="p-4 text-slate-400">{item.treatmentGiven || "Repouso e monitorização"}</td>
                    <td className="p-4 text-slate-350 font-sans">{item.doctorName}</td>
                    <td className="p-4 font-mono text-slate-400">{item.nextReviewDate || "N/A"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase border ${
                        item.conditionStatus === "Alta" ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" :
                        item.conditionStatus === "Melhoria" ? "bg-teal-950/20 border-teal-500/20 text-teal-350" :
                        item.conditionStatus === "Estável" ? "bg-slate-900 border-slate-800 text-slate-400" :
                        item.conditionStatus === "Sob Observação" ? "bg-amber-550/10 border-amber-500/10 text-amber-450" :
                        "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                      }`}>
                        {item.conditionStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => launchEditFollowUp(item)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClinical("acompanhamento", item.id)}
                          className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* 3. Prescrições Médicas List output */}
        {healthSection === "prescricoes" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900/60">
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Receita ID</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Recluso (RNR)</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Diagnóstico</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Fármacos e Terapias</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Duração</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Médico Assinante</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Estado Receita</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-sans">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    Nenhuma receita ou prescrição homolgada encontrada correspondente.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-350">{item.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-100">{item.inmateName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                      </div>
                    </td>
                    <td className="p-4 text-amber-500 font-medium font-sans">{item.diagnosisAssociated}</td>
                    <td className="p-4 text-left font-mono text-[11px] text-slate-400 max-w-sm leading-relaxed">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-300 font-bold">{item.medications}</span>
                        {item.specialInstructions && (
                          <span className="text-[9.5px] text-slate-500 font-sans italic">Recomendação: {item.specialInstructions}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-350 font-semibold">{item.durationDays} Dias</td>
                    <td className="p-4 text-slate-350">{item.doctorName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase border ${
                        item.status === "Ativo" ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" :
                        item.status === "Concluído" ? "bg-slate-900 border-slate-800 text-slate-450" :
                        item.status === "Suspenso" ? "bg-amber-550/10 border-amber-500/10 text-amber-450" :
                        "bg-rose-955/20 border-rose-500/20 text-rose-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => launchEditPrescription(item)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClinical("prescricao", item.id)}
                          className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* 4. Prontuários Clinicos List output */}
        {healthSection === "prontuarios" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900/60">
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Cód. Prontuário</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Recluso (RNR)</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Diagnóstico & Quadro Clínico</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Prescrição Terapêutica</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Médico Assistente</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Gravidade</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Estado Clínico</th>
                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    Nenhum prontuário clínico correspondente ao filtro encontrado no sistema.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-350">{item.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-100">{item.inmateName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                      </div>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-amber-500 font-medium">{item.diagnosis}</span>
                        {item.symptoms && (
                          <span className="text-[10px] text-slate-500 italic max-w-xs truncate" title={item.symptoms}>Sintomas: {item.symptoms}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-left font-mono text-[11px] text-slate-300 max-w-xs truncate" title={item.prescription}>
                      {item.prescription || "Nenhum fármaco receitado"}
                    </td>
                    <td className="p-4 text-slate-350">{item.doctorName}</td>
                    <td className="p-4 text-left">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                        item.severity === "Crítico" ? "bg-red-950/30 border-red-500/20 text-red-100 animate-pulse" :
                        item.severity === "Grave" ? "bg-rose-955/20 border-rose-500/20 text-rose-450" :
                        item.severity === "Moderado" ? "bg-amber-955/20 border-amber-500/20 text-amber-450" :
                        "bg-slate-900 border-slate-800 text-slate-500"
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-sans font-bold uppercase border ${
                        item.status === "Alta Clínica" ? "bg-indigo-950/30 border-indigo-500/20 text-indigo-400" :
                        item.status === "Recuperado" ? "bg-teal-950/30 border-teal-500/20 text-teal-400" :
                        item.status === "Em Tratamento" ? "bg-sky-950/30 border-sky-500/20 text-sky-400" :
                        "bg-amber-950/30 border-amber-500/20 text-amber-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditRecord(item)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-sans transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(item.id, item.inmateName, item.inmateId)}
                          className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] font-sans transition cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* 5. Permissão de Utiladores List output */}
        {healthSection === "permissoes" && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl text-left space-y-2 select-none animate-fadeIn">
              <h4 className="font-bold text-xs font-mono text-teal-400 uppercase flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" /> Diretrizes de Governança de Dados de Saúde
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                O gerenciamento de privilégios de saúde penal restringe os dados clínicos estritamente a profissionais médicos habilitados (Escopo Funcional: <strong className="text-teal-300">SAUDE</strong> ou cargos executivos autorizados). A exibição do prontuário é bloqueada individualmente para qualquer outro operador. Os logs de auditoria registam todas as alterações de controlo de acessos no sistema.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900/60 font-medium">
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Utilizador / ID</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Nome do Operador</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Papel de Sistema</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Escopo Funcional</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Sensibilidade / Segurança</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Leitura Clínica</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px]">Edição Clínica</th>
                    <th className="p-4 uppercase text-slate-500 text-[10px] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans">
                  {operators.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                        Nenhum utilizador encontrado no sistema.
                      </td>
                    </tr>
                  ) : (
                    operators.map((op: any) => {
                      // Calculate dynamic permissions for rendering
                      const perms = op.customPermissions || op.systemRole?.permissions || op.permissions || [];
                      const canRead = perms.includes(SystemPermission.VIEW_CLINICAL) || perms.includes("Saúde") || perms.includes("Relatórios clínicos");
                      const canWrite = perms.includes(SystemPermission.EDIT_CLINICAL) || perms.includes("Saúde") || perms.includes("Relatórios clínicos");
                      const resolvedScope = op.functionalScope || (op.role === "CHEFE_SAUDE" ? "SAUDE" : op.role === "CHEFE_SEGURANCA" ? "SEGURANCA" : "GERAL");

                      return (
                        <tr key={op.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-300">{op.username}</span>
                              <span className="text-[9.5px] text-slate-500">{op.id}</span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-100">{op.name}</td>
                          <td className="p-4 text-slate-350">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                              {op.roleName || op.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              resolvedScope === "SAUDE" ? "bg-teal-950/20 border-teal-500/20 text-teal-400" :
                              resolvedScope === "SEGURANCA" ? "bg-amber-950/20 border-amber-500/20 text-amber-500" :
                              resolvedScope === "INTELIGENCIA" ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-400" :
                              "bg-slate-950 border-slate-850 text-slate-400"
                            }`}>
                              {resolvedScope}
                            </span>
                          </td>
                          <td className="p-4 text-left font-mono">
                            <span className={`px-1.5 py-0.5 text-[9.5px] rounded font-bold border ${
                              op.sensitivityLevel === "SECRETO" || op.sensitivityLevel === "SECRET" ? "bg-red-950/20 border-red-500/25 text-red-400 animate-pulse" :
                              op.sensitivityLevel === "CONFIDENCIAL" || op.sensitivityLevel === "CONFIDENTIAL" ? "bg-orange-950/20 border-orange-500/20 text-orange-400" :
                              op.sensitivityLevel === "RESTRITO" || op.sensitivityLevel === "RESTRICTED" ? "bg-slate-800 border-slate-700 text-slate-300" :
                              "bg-slate-950 border-slate-850 text-slate-550"
                            }`}>
                              {op.sensitivityLevel || "RESTRITO"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              canRead ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" : "bg-red-950/40 text-red-450 border border-red-500/10"
                            }`}>
                              {canRead ? "Sim" : "Não"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              canWrite ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" : "bg-red-950/40 text-red-450 border border-red-500/10"
                            }`}>
                              {canWrite ? "Sim" : "Não"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditOperator(op)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 hover:text-teal-300 rounded text-[10px] font-sans transition cursor-pointer font-bold"
                            >
                              Configurar Acessos
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Corporate Medical confidentiality footer warning */}
      <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl flex items-start gap-3 text-left">
        <Stethoscope className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Protocolo de Confidencialidade Orgânica (Decreto Lei 14/20)</h4>
          <p className="text-[10px] font-sans text-slate-500 leading-normal mt-1">
            Em conformidade com a regulamentação do Serviço de Saúde e Assistência Médica Penitenciária, todos as triagens, receitas e historicos de evoluções clínicas encontram-se selados sob sigilo profissional de saúde. Qualquer alteração ou visualização indevida gerará alerta forense imutável com associação de credenciais de utilizador centrais no PNAP-AO.
          </p>
        </div>
      </div>
    </div>
  );
}
