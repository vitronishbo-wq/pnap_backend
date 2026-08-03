import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Zap, HeartPulse, BookOpen, Shield, Check, Plus, Search, CheckCircle, 
  AlertTriangle, Lock, ShieldCheck, Camera, Download, RefreshCw, FileText, 
  Activity, Award, TrendingUp, X, UserCheck, Sliders, Eye
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Html5Qrcode } from "html5-qrcode";
import { HealthModule } from "./HealthModule";
import { apiService } from "../services/apiService";
import { 
  ReintegrationRecord, IntelligenceRecord, HealthRecord, InmateState, OperatorProfile 
} from "../types";

interface SpecialServicesModuleProps {
  reintegrationRecords: ReintegrationRecord[];
  setReintegrationRecords: React.Dispatch<React.SetStateAction<ReintegrationRecord[]>>;
  intelligenceRecords: IntelligenceRecord[];
  setIntelligenceRecords: React.Dispatch<React.SetStateAction<IntelligenceRecord[]>>;
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  inmates: InmateState[];
  prisons: any[];
  currentOperator: OperatorProfile | null;
  hasPermission: (perm: any) => boolean;
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
  currentOperatorId: string;
  operators: OperatorProfile[];
  setOperators: React.Dispatch<React.SetStateAction<OperatorProfile[]>>;
  handleValidateDocument: (code: string) => void;
  writeAuditLog: (...args: any[]) => void;
}

export const SpecialServicesModule: React.FC<SpecialServicesModuleProps> = ({
  reintegrationRecords,
  setReintegrationRecords,
  intelligenceRecords,
  setIntelligenceRecords,
  healthRecords,
  setHealthRecords,
  inmates,
  prisons,
  currentOperator,
  hasPermission,
  setAuditLogs,
  currentOperatorId,
  operators,
  setOperators,
  handleValidateDocument,
  writeAuditLog,
}) => {
  const [subTab, setSubTab] = useState<"saude" | "reinsercao" | "inteligencia">("saude");
  const [chartMetric, setChartMetric] = useState<"progress" | "enrolled">("progress");

  const educacaoRecords = reintegrationRecords.filter(r => r.category === "Educação");
  const trabalhoRecords = reintegrationRecords.filter(r => r.category === "Trabalho");

  const avgEducacaoProgress = educacaoRecords.length > 0 
    ? Math.round(educacaoRecords.reduce((acc, r) => acc + r.progressScore, 0) / educacaoRecords.length) 
    : 85;
  const avgTrabalhoProgress = trabalhoRecords.length > 0 
    ? Math.round(trabalhoRecords.reduce((acc, r) => acc + r.progressScore, 0) / trabalhoRecords.length) 
    : 88;

  const lastSemesterData = [
    { month: "Jan/26", educacaoAtivos: 12, educacaoProgresso: 68, trabalhoAtivos: 18, trabalhoProgresso: 72 },
    { month: "Fev/26", educacaoAtivos: 15, educacaoProgresso: 70, trabalhoAtivos: 22, trabalhoProgresso: 75 },
    { month: "Mar/26", educacaoAtivos: 18, educacaoProgresso: 74, trabalhoAtivos: 20, trabalhoProgresso: 78 },
    { month: "Abr/26", educacaoAtivos: 21, educacaoProgresso: 78, trabalhoAtivos: 25, trabalhoProgresso: 82 },
    { month: "Mai/26", educacaoAtivos: 24, educacaoProgresso: 81, trabalhoAtivos: 28, trabalhoProgresso: 84 },
    { month: "Jun/26", educacaoAtivos: 25 + educacaoRecords.length, educacaoProgresso: avgEducacaoProgress, trabalhoAtivos: 29 + trabalhoRecords.length, trabalhoProgresso: avgTrabalhoProgress }
  ];
  
  // Form States
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [classificationFilter, setClassificationFilter] = useState<string>("ALL");
  const [threatLevelFilter, setThreatLevelFilter] = useState<string>("ALL");
  const [localIntelSearch, setLocalIntelSearch] = useState<string>("");
  const [intelSigModalOpen, setIntelSigModalOpen] = useState<boolean>(false);
  const [intelSigOfficer, setIntelSigOfficer] = useState<string>("Superintendente-Chefe J. Lourenço");
  const [intelSigPin, setIntelSigPin] = useState<string>("");
  const [intelSigSigned, setIntelSigSigned] = useState<boolean>(false);
  const [intelBioScanning, setIntelBioScanning] = useState<boolean>(false);
  const [intelBioProgress, setIntelBioProgress] = useState<number>(0);
  const [intelBioMatched, setIntelBioMatched] = useState<boolean>(false);
  const [intelSigError, setIntelSigError] = useState<string | null>(null);
  const [intelQrScannerOpen, setIntelQrScannerOpen] = useState<boolean>(false);
  const [intelQrScannerInmate, setIntelQrScannerInmate] = useState<any | null>(null);
  const [intelQrError, setIntelQrError] = useState<string | null>(null);
  const intelScannerHtml5Ref = useRef<Html5Qrcode | null>(null);

  const handleIntelQrScanned = (code: string) => {
    if (!code) return;
    const cleanCode = code.trim();
    
    const matchIntel = intelligenceRecords.find(item => 
      item.checksum.toLowerCase() === cleanCode.toLowerCase() || 
      item.inmateId.toLowerCase() === cleanCode.toLowerCase() ||
      item.inmateName.toLowerCase().includes(cleanCode.toLowerCase())
    );

    const matchInmate = inmates.find(i => 
      i.documentCode.toLowerCase() === cleanCode.toLowerCase() ||
      i.idCard.toLowerCase() === cleanCode.toLowerCase() ||
      (i.firstName + " " + i.lastName).toLowerCase().includes(cleanCode.toLowerCase())
    );

    if (matchIntel || matchInmate) {
      const resolvedIntel = matchIntel || {
        id: "INT-GENERATED",
        inmateId: matchInmate?.id || "PIR-UNKNOWN",
        inmateName: matchInmate ? `${matchInmate.firstName} ${matchInmate.lastName}` : "Não identificado",
        classification: matchInmate?.riskLevel === "Máximo" ? "SECRETO" : "CONFIDENCIAL" as any,
        incidentSource: "QR Scan Reader",
        alertType: "Validação Cruzada de Cadastro",
        threatLevel: matchInmate?.riskLevel === "Máximo" ? "Crítico" : "Médio" as any,
        description: `Informação extraível validada eletronicamente. Recluso localizado no banco de dados central com BI ${matchInmate?.idCard || "N/A"} e nível de risco ${matchInmate?.riskLevel || "N/A"}.`,
        loggedDate: new Date().toISOString().slice(0, 10),
        actionTaken: "Verificação e aprovação de integridade via dispositivo central portátil de fiscalização.",
        checksum: cleanCode
      };

      setIntelQrScannerInmate(resolvedIntel);
      setLocalIntelSearch(resolvedIntel.inmateName);
      
      writeAuditLog(
        null,
        "SECURITY_VALIDATION" as any,
        "Intelligence",
        resolvedIntel.inmateId,
        `Documento QR validado e homologado para ${resolvedIntel.inmateName}. Checksum de auditoria: ${resolvedIntel.checksum}`,
        resolvedIntel.inmateId,
        resolvedIntel.inmateName
      );

      handleValidateDocument(cleanCode);
    } else {
      setIntelQrScannerInmate({
        status: "INVALID",
        error: `Código QR '${cleanCode}' lido não corresponde a nenhum registo de inteligência penitenciária ou guia de recluso na infraestrutura PNAP-AO.`,
        code: cleanCode
      });
    }
  };

  useEffect(() => {
    let activeScanner: Html5Qrcode | null = null;
    let isMounted = true;

    if (intelQrScannerOpen) {
      setIntelQrScannerInmate(null);
      setIntelQrError(null);

      const startTimer = setTimeout(() => {
        if (!isMounted) return;
        const container = document.getElementById("intel-qr-scanner-element");
        if (!container) {
          setIntelQrError("Erro de Renderização: Contentor de leitura não localizado.");
          return;
        }

        try {
          const scanner = new Html5Qrcode("intel-qr-scanner-element");
          activeScanner = scanner;
          intelScannerHtml5Ref.current = scanner;

          scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const size = Math.min(width, height, 250);
                return { width: size, height: size };
              },
            },
            (decodedText) => {
              if (decodedText && isMounted) {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.155);
                } catch (e) {}

                handleIntelQrScanned(decodedText);
              }
            },
            () => {}
          ).catch((err) => {
            console.error("Camera scanner start failed:", err);
            setIntelQrError("Câmara indisponível, permissão bloqueada ou de iFrame. Use a simulação abaixo para validar o fluxo perfeitamente.");
          });
        } catch (e: any) {
          console.error("HTML5Qrcode instantiation failed:", e);
          setIntelQrError(`Não foi possível carregar a câmara: ${e.message || e}`);
        }
      }, 350);

      return () => {
        isMounted = false;
        clearTimeout(startTimer);
        if (activeScanner) {
          if (activeScanner.isScanning) {
            activeScanner.stop().catch((err) => {
              console.error("Error stopping scanner:", err);
            });
          }
        }
        intelScannerHtml5Ref.current = null;
      };
    }
  }, [intelQrScannerOpen]);

  // Form Fields
  // Saúde Fields
  const [sInmateId, setSInmateId] = useState<string>("");
  const [sSymptoms, setSSymptoms] = useState<string>("");
  const [sDiagnosis, setSDiagnosis] = useState<string>("");
  const [sPrescription, setSPrescription] = useState<string>("");
  const [sSeverity, setSSeverity] = useState<"Ligeiro" | "Moderado" | "Grave" | "Crítico">("Ligeiro");
  const [sStatus, setSStatus] = useState<"Pendente" | "Em Tratamento" | "Recuperado" | "Alta Clínica">("Pendente");
  const [sDoctor, setSDoctor] = useState<string>("");

  // Reinserção Fields
  const [rInmateId, setRInmateId] = useState<string>("");
  const [rProgram, setRProgram] = useState<string>("");
  const [rCategory, setRCategory] = useState<"Educação" | "Trabalho" | "Apoio Psicológico" | "Artesanato">("Educação");
  const [rScore, setRScore] = useState<number>(70);
  const [rAttendance, setRAttendance] = useState<number>(90);
  const [rStatus, setRStatus] = useState<"Inscrito" | "Ativo" | "Suspenso" | "Concluído">("Inscrito");
  const [rNotes, setRNotes] = useState<string>("");
  const [rReintegrator, setRReintegrator] = useState<string>("");

  // Inteligência Fields
  const [iInmateId, setIInmateId] = useState<string>("");
  const [iClassification, setIClassification] = useState<"RESTRITO" | "CONFIDENCIAL" | "SECRETO">("RESTRITO");
  const [iSource, setISource] = useState<"MININT" | "Polícia Nacional" | "SICP" | "Guarda Prisional">("Guarda Prisional");
  const [iAlertType, setIAlertType] = useState<"Informador de Bloco" | "Tentativa de Fuga Recorrente" | "Histórico de Facção" | "Conexão Externa Suspeita">("Conexão Externa Suspeita");
  const [iThreat, setIThreat] = useState<"Baixo" | "Médio" | "Alto" | "Crítico">("Baixo");
  const [iDesc, setIDesc] = useState<string>("");
  const [iAction, setIAction] = useState<string>("");

  // Success Message
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Clear fields helper
  const resetForms = () => {
    setEditId(null);
    setShowForm(false);
    
    // Reset Saúde
    setSInmateId(""); setSSymptoms(""); setSDiagnosis(""); setSPrescription(""); setSSeverity("Ligeiro"); setSStatus("Pendente"); setSDoctor("");
    // Reset Reinserção
    setRInmateId(""); setRProgram(""); setRCategory("Educação"); setRScore(70); setRAttendance(90); setRStatus("Inscrito"); setRNotes(""); setRReintegrator("");
    // Reset Inteligência
    setIInmateId(""); setIClassification("RESTRITO"); setISource("Guarda Prisional"); setIAlertType("Conexão Externa Suspeita"); setIThreat("Baixo"); setIDesc(""); setIAction("");
  };

  // Trigger edit mode
  const handleEditClick = (type: "saude" | "reinsercao" | "inteligencia", item: any) => {
    setEditId(item.id);
    setShowForm(true);
    if (type === "saude") {
      setSInmateId(item.inmateId);
      setSSymptoms(item.symptoms);
      setSDiagnosis(item.diagnosis);
      setSPrescription(item.prescription);
      setSSeverity(item.severity);
      setSStatus(item.status);
      setSDoctor(item.doctorName);
    } else if (type === "reinsercao") {
      setRInmateId(item.inmateId);
      setRProgram(item.programName);
      setRCategory(item.category);
      setRScore(item.progressScore);
      setRAttendance(item.attendanceRate);
      setRStatus(item.status);
      setRNotes(item.evaluationNotes);
      setRReintegrator(item.reintegratorName);
    } else if (type === "inteligencia") {
      setIInmateId(item.inmateId);
      setIClassification(item.classification);
      setISource(item.incidentSource);
      setIAlertType(item.alertType);
      setIThreat(item.threatLevel);
      setIDesc(item.description);
      setIAction(item.actionTaken);
    }
  };

  // Submit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (subTab === "saude") {
      if (!sInmateId) { alert("Por favor selecione um recluso."); return; }
      const refInmate = inmates.find(i => i.id === sInmateId);
      const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";
      
      if (editId) {
        // Update
        const updatedFields = {
          inmateId: sInmateId,
          inmateName: inName,
          symptoms: sSymptoms,
          diagnosis: sDiagnosis,
          prescription: sPrescription,
          severity: sSeverity,
          status: sStatus,
          doctorName: sDoctor || "Clínico Geral"
        };

        setHealthRecords(prev => prev.map(item => item.id === editId ? {
          ...item,
          ...updatedFields
        } : item));

        apiService.updateHealthRecord(editId, {
          reclusoId: sInmateId,
          diagnostico: sDiagnosis,
          medicacaoPrescrita: sPrescription,
          medicoResponsavel: sDoctor || "Clínico Geral",
          ...updatedFields
        }).catch(err => console.warn("Offline health update:", err));

        // Add to Audit Log
        setAuditLogs(prev => [
          {
            id: `AUD-H-${Math.floor(Math.random()*10000)}`,
            userId: currentOperatorId,
            timestamp: new Date().toISOString(),
            action: "Edição",
            inmateId: sInmateId,
            inmateName: inName,
            fieldChanged: "Prontuário Médico (Saúde)",
            oldValue: "Registo Clinico Anterior",
            newValue: `Actualizado registo médico CLI: ${sSymptoms} - Diag: ${sDiagnosis}`
          },
          ...prev
        ]);

        triggerFeedback("Registo médico atualizado com sucesso!");
      } else {
        // Create
        const newId = `CLI-2026-${Math.floor(1000 + Math.random()*9000)}`;
        const newRec: HealthRecord = {
          id: newId,
          inmateId: sInmateId,
          inmateName: inName,
          prisonId: refInmate?.assignedPrisonId || "PRIS-HUAMBO",
          prisonName: prisons.find(p => p.id === refInmate?.assignedPrisonId)?.name || "Cadeia Central",
          consultationDate: new Date().toISOString().substring(0, 10),
          symptoms: sSymptoms,
          diagnosis: sDiagnosis,
          prescription: sPrescription,
          severity: sSeverity,
          status: sStatus,
          doctorName: sDoctor || "Clínico Geral"
        };

        setHealthRecords(prev => [newRec, ...prev]);

        apiService.createHealthRecord({
          id: newId,
          reclusoId: sInmateId,
          diagnostico: sDiagnosis,
          medicacaoPrescrita: sPrescription,
          medicoResponsavel: sDoctor || "Clínico Geral",
          ...newRec
        }).catch(err => console.warn("Offline health create:", err));

        // Add to Audit Log
        setAuditLogs(prev => [
          {
            id: `AUD-H-${Math.floor(Math.random()*10000)}`,
            userId: currentOperatorId,
            timestamp: new Date().toISOString(),
            action: "Admissão",
            inmateId: sInmateId,
            inmateName: inName,
            fieldChanged: "Novo Prontuário Médico (Saúde)",
            oldValue: "-",
            newValue: `Criado novo prontuário clínico ${newRec.id}: ${sSymptoms} - Diag: ${sDiagnosis}`
          },
          ...prev
        ]);

        triggerFeedback("Novo prontuário clínico registado!");
      }
    } else if (subTab === "reinsercao") {
      if (!rInmateId) { alert("Por favor selecione um recluso."); return; }
      const refInmate = inmates.find(i => i.id === rInmateId);
      const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";
   
      if (editId) {
        // Update
        const updatedFields = {
          inmateId: rInmateId,
          inmateName: inName,
          programName: rProgram || "Programa Geral",
          category: rCategory,
          progressScore: Number(rScore),
          attendanceRate: Number(rAttendance),
          status: rStatus,
          evaluationNotes: rNotes,
          reintegratorName: rReintegrator || "Conselheiro Social"
        };

        setReintegrationRecords(prev => prev.map(item => item.id === editId ? {
          ...item,
          ...updatedFields
        } : item));

        apiService.updateReintegrationRecord(editId, {
          reclusoId: rInmateId,
          tipoAtividade: rCategory === "Educação" ? "ALFABETIZACAO" : "TRABALHO_INTERNO",
          descricao: rProgram || "Programa Geral",
          responsavelSocial: rReintegrator || "Conselheiro Social",
          ...updatedFields
        }).catch(err => console.warn("Offline reintegration update:", err));

        triggerFeedback("Registo de reinserção social atualizado!");
      } else {
        // Create
        const newId = `REI-2026-${Math.floor(1000 + Math.random()*9000)}`;
        const newRec: ReintegrationRecord = {
          id: newId,
          inmateId: rInmateId,
          inmateName: inName,
          programName: rProgram || "Curso Técnico Profissional",
          category: rCategory,
          enrollmentDate: new Date().toISOString().substring(0, 10),
          progressScore: Number(rScore),
          attendanceRate: Number(rAttendance),
          status: rStatus,
          evaluationNotes: rNotes,
          reintegratorName: rReintegrator || "Conselheiro Social"
        };

        setReintegrationRecords(prev => [newRec, ...prev]);

        apiService.createReintegrationRecord({
          id: newId,
          reclusoId: rInmateId,
          tipoAtividade: rCategory === "Educação" ? "ALFABETIZACAO" : "TRABALHO_INTERNO",
          descricao: rProgram || "Curso Técnico Profissional",
          responsavelSocial: rReintegrator || "Conselheiro Social",
          ...newRec
        }).catch(err => console.warn("Offline reintegration create:", err));

        triggerFeedback("Inscrito novo recluso no programa de reabilitação social!");
      }
    } else if (subTab === "inteligencia") {
      if (!iInmateId) { alert("Por favor selecione um recluso."); return; }
      const refInmate = inmates.find(i => i.id === iInmateId);
      const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";
   
      if (editId) {
        // Update
        setIntelligenceRecords(prev => prev.map(item => item.id === editId ? {
          ...item,
          inmateId: iInmateId,
          inmateName: inName,
          classification: iClassification,
          incidentSource: iSource,
          alertType: iAlertType,
          threatLevel: iThreat,
          description: iDesc,
          actionTaken: iAction
        } : item));

        triggerFeedback("Registo de inteligência operacional atualizado!");
      } else {
        // Create
        const firstWord = inName.split(" ")[0].toUpperCase();
        const newRec: IntelligenceRecord = {
          id: `INT-2026-${Math.floor(1000 + Math.random()*9000)}`,
          inmateId: iInmateId,
          inmateName: inName,
          classification: iClassification,
          incidentSource: iSource,
          alertType: iAlertType,
          threatLevel: iThreat,
          description: iDesc,
          loggedDate: new Date().toISOString().substring(0, 10),
          actionTaken: iAction,
          checksum: `SHA256-${firstWord}-${Math.floor(1000 + Math.random()*9000)}`
        };

        setIntelligenceRecords(prev => [newRec, ...prev]);
        triggerFeedback("Alerta de inteligência e cruzamento criminal lançado!");
      }
    }
    resetForms();
  };

  // Delete Entry
  const handleDeleteClick = (type: "saude" | "reinsercao" | "inteligencia", id: string) => {
    if (confirm("Confirmar exclusão irrevogável deste registo no banco canónico?")) {
      if (type === "saude") {
        setHealthRecords(prev => prev.filter(i => i.id !== id));
        apiService.deleteHealthRecord(id).catch(err => console.warn("Offline health delete:", err));
        triggerFeedback("Registo médico clínico apagado.");
      } else if (type === "reinsercao") {
        setReintegrationRecords(prev => prev.filter(i => i.id !== id));
        apiService.deleteReintegrationRecord(id).catch(err => console.warn("Offline reintegration delete:", err));
        triggerFeedback("Programa de reinserção social apagado.");
      } else if (type === "inteligencia") {
        setIntelligenceRecords(prev => prev.filter(i => i.id !== id));
        triggerFeedback("Alerta de inteligência secreta removido.");
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Switch Tab buttons & KPI Grid */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        {/* Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit shrink-0">
          <button
            type="button"
            onClick={() => { setSubTab("saude"); resetForms(); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "saude"
                ? "bg-slate-800 text-amber-500 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HeartPulse className="h-4 w-4 text-emerald-500" />
            🏥 Serviços de Saúde
          </button>
          <button
            type="button"
            onClick={() => { setSubTab("reinsercao"); resetForms(); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "reinsercao"
                ? "bg-slate-800 text-amber-500 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4 text-amber-500" />
            🌱 Reinserção Social
          </button>
          <button
            type="button"
            onClick={() => { setSubTab("inteligencia"); resetForms(); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "inteligencia"
                ? "bg-slate-800 text-rose-500 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="h-4 w-4 text-rose-500 animate-pulse" />
            🕵️ Inteligência & Forças
          </button>
        </div>

        {/* Summary feedback alert */}
        {feedbackMsg && (
          <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-bounce">
            <Check className="h-4 w-4 text-emerald-400" />
            {feedbackMsg}
          </div>
        )}

        {/* Header quick button insert */}
        {!showForm && subTab !== "saude" && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5 self-start lg:self-center cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            {subTab === "reinsercao" ? "Inscrever em Reinserção" : "Registar Alerta de Inteligência"}
          </button>
        )}
      </div>

      {subTab === "saude" ? (
        <HealthModule 
          inmates={inmates}
          currentOperator={currentOperator}
          hasPermission={hasPermission}
          setAuditLogs={setAuditLogs}
          currentOperatorId={currentOperatorId}
          healthRecords={healthRecords}
          setHealthRecords={setHealthRecords}
          operators={operators}
          setOperators={setOperators}
        />
      ) : (
        <>
          {/* DYNAMIC KPI MINI-GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subTab === "reinsercao" && (
              <>
                <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-slate-500 block uppercase">Inscrições Ativas</span>
                  <span className="text-xl font-bold text-amber-500">{reintegrationRecords.length}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-slate-500 block uppercase">Frequência Média</span>
                  <span className="text-xl font-bold text-slate-100">
                    {Math.round(reintegrationRecords.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (reintegrationRecords.length || 1))}%
                  </span>
                </div>
                <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-emerald-400 block uppercase">Rendimento Médio</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {Math.round(reintegrationRecords.reduce((acc, curr) => acc + curr.progressScore, 0) / (reintegrationRecords.length || 1))}/100
                  </span>
                </div>
                <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-slate-500 block uppercase">Categorias de Apoio</span>
                  <span className="text-xl font-bold text-slate-300">4 Unidades</span>
                </div>
              </>
            )}
            {subTab === "inteligencia" && (
              <>
                <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-slate-500 block uppercase">Registos de Risco</span>
                  <span className="text-xl font-bold text-rose-500">{intelligenceRecords.length}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-rose-450 block uppercase">Nível Vermelho</span>
                  <span className="text-xl font-bold text-rose-400">
                    {intelligenceRecords.filter(i => i.threatLevel === "Crítico" || i.threatLevel === "Alto").length}
                  </span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-slate-500 block uppercase">Organizações Integradas</span>
                  <span className="text-xl font-bold text-slate-200">SICP + MININT</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                  <span className="text-[10px] text-yellow-500 block uppercase">Cripto Hashes Seletos</span>
                  <span className="text-xl font-bold text-yellow-500">100% Selado</span>
                </div>
              </>
            )}
          </div>

          {/* GRÁFICO DE PROGRESSÃO SEMESTRAL */}
          {subTab === "reinsercao" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left flex flex-col gap-4 shadow-lg mb-4 mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" /> Progressão Semestral: Educação vs Trabalho
                  </h3>
                  <p className="text-xxs text-slate-400 mt-0.5 leading-relaxed font-sans">
                    Evolução participativa e avaliação de desempenho dos reclusos no último semestre (Janeiro - Junho).
                  </p>
                </div>
                
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 font-mono text-[9px]">
                  <button
                    type="button"
                    onClick={() => setChartMetric("progress")}
                    className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                      chartMetric === "progress"
                        ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
                        : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Rendimento (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric("enrolled")}
                    className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                      chartMetric === "enrolled"
                        ? "bg-slate-800 text-amber-500 border border-slate-700/50"
                        : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Inscrições (Nº)
                  </button>
                </div>
              </div>

              <div className="h-64 w-full pr-4 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={lastSemesterData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      domain={chartMetric === "progress" ? [0, 100] : [0, 'auto']}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={{
                        backgroundColor: "#0b1329",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontFamily: "monospace"
                      }}
                      itemStyle={{ color: "#cbd5e1" }}
                      labelStyle={{ color: "#94a3b8", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", marginTop: "12px", fontFamily: "sans-serif" }} />
                    
                    {chartMetric === "progress" ? (
                      <>
                        <Bar name="Educação (% Aproveitamento Médio)" dataKey="educacaoProgresso" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar name="Trabalho (% Aproveitamento Médio)" dataKey="trabalhoProgresso" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </>
                    ) : (
                      <>
                        <Bar name="Educação (Total Alunos)" dataKey="educacaoAtivos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar name="Trabalho (Total Alunos)" dataKey="trabalhoAtivos" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-slate-950/40 border border-slate-850 px-3.5 py-2.5 rounded-xl text-[10px] font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Aproveitamento em Educação aumentou de <strong className="text-slate-300">68% canónico</strong> para <strong className="text-emerald-400 font-bold">{avgEducacaoProgress}% dinâmico</strong>.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Atividades de Trabalho produtivo integram <strong className="text-amber-500 font-bold">{29 + trabalhoRecords.length} reclusos</strong> este mês.</span>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FORM CONTAINER */}
          {showForm && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl relative animate-fadeIn font-sans">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 select-none">
                <h3 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  {editId ? "Editar Registo do Banco Dinâmico" : "Adicionar Entrada ao Banco Canónico"}
                </h3>
                <button
                  type="button"
                  onClick={resetForms}
                  className="text-xs text-slate-400 hover:text-slate-300 bg-slate-950 px-2.5 py-1 rounded cursor-pointer animate-pulse font-bold"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-left font-sans">
                {/* Reinserção Form fields */}
                {subTab === "reinsercao" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Seleccionar Recluso *</label>
                      <select
                        value={rInmateId}
                        onChange={(e) => setRInmateId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="">-- Seleccionar Recluso --</option>
                        {inmates.map(i => (
                          <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Técnico de Reinserção Responsável</label>
                      <input
                        type="text"
                        value={rReintegrator}
                        onChange={(e) => setRReintegrator(e.target.value)}
                        placeholder="e.g. Dr. Alfredo Fragoso"
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Nome do Programa de Integração</label>
                      <input
                        type="text"
                        value={rProgram}
                        onChange={(e) => setRProgram(e.target.value)}
                        placeholder="e.g. Serralharia Artística e Marcenaria Prática"
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Categoria de Trabalho/Apoio</label>
                      <select
                        value={rCategory}
                        onChange={(e) => setRCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="Educação">Educação</option>
                        <option value="Trabalho">Trabalho</option>
                        <option value="Apoio Psicológico">Apoio Psicológico</option>
                        <option value="Artesanato">Artesanato</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Rendimento / Progresso Técnico (0 - 100)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={rScore}
                        onChange={(e) => setRScore(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Taxa de Assiduidade Colectiva (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={rAttendance}
                        onChange={(e) => setRAttendance(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Fase do Programa</label>
                      <select
                        value={rStatus}
                        onChange={(e) => setRStatus(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="Inscrito">Inscrito</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Suspenso">Suspenso</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Notas de Observação e Parecer Psicológico</label>
                      <textarea
                        value={rNotes}
                        onChange={(e) => setRNotes(e.target.value)}
                        placeholder="Incorpore as atitudes psicossociais, cooperação familiar, comportamento no pavilhão comun..."
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Inteligência Form fields */}
                {subTab === "inteligencia" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Seleccionar Recluso sob Suspeita *</label>
                      <select
                        value={iInmateId}
                        onChange={(e) => setIInmateId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="">-- Seleccionar Recluso --</option>
                        {inmates.map(i => (
                          <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Grau de Secretismo Legal</label>
                      <select
                        value={iClassification}
                        onChange={(e) => setIClassification(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                      >
                        <option value="RESTRITO">RESTRITO</option>
                        <option value="CONFIDENCIAL">CONFIDENCIAL</option>
                        <option value="SECRETO">SECRETO</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Órgão de Força de Segurança Notificado</label>
                      <select
                        value={iSource}
                        onChange={(e) => setISource(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="MININT">MININT (Ministério do Interior)</option>
                        <option value="Polícia Nacional">Polícia Nacional</option>
                        <option value="SICP">SICP (Investigação Criminal)</option>
                        <option value="Guarda Prisional">Guarda Prisional</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Tipo de Sinalização de Risco</label>
                      <select
                        value={iAlertType}
                        onChange={(e) => setIAlertType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="Informador de Bloco">Informador de Bloco</option>
                        <option value="Tentativa de Fuga Recorrente">Tentativa de Fuga Recorrente</option>
                        <option value="Histórico de Facção">Histórico de Facção</option>
                        <option value="Conexão Externa Suspeita">Conexão Externa Suspeita</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Grau de Ameaça Imediata</label>
                      <select
                        value={iThreat}
                        onChange={(e) => setIThreat(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      >
                        <option value="Baixo">Baixo</option>
                        <option value="Médio">Médio</option>
                        <option value="Alto">Alto</option>
                        <option value="Crítico">Crítico</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Informações Confidenciais do Alerta</label>
                      <textarea
                        value={iDesc}
                        onChange={(e) => setIDesc(e.target.value)}
                        placeholder="Discorra sobre escutas digitais, registo de facções ou alertas de capturas estaduais..."
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Contramedidas / Ações Operacionais Tomadas</label>
                      <input
                        type="text"
                        value={iAction}
                        onChange={(e) => setIAction(e.target.value)}
                        placeholder="e.g. Isolamento temporário, rotatividade forçada de pavilhão..."
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {editId ? "Salvar Alterações" : "Submeter no Banco Canónico"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SEARCH FILTERS */}
          <div className="flex flex-col md:flex-row gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl relative">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por recluso, diagnóstico, curso ou agência..."
                className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
              />
            </div>

            {subTab === "reinsercao" && (
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-emerald-500/50"
                >
                  <option value="ALL">Todas as Categorias</option>
                  <option value="Educação">Educação</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Apoio Psicológico">Apoio Psicológico</option>
                  <option value="Artesanato">Artesanato</option>
                </select>
              </div>
            )}

            {subTab === "inteligencia" && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-rose-500/50 font-mono animate-fadeIn"
                >
                  <option value="ALL">Todos os Secretismos</option>
                  <option value="RESTRITO">RESTRITO</option>
                  <option value="CONFIDENCIAL">CONFIDENCIAL</option>
                  <option value="SECRETO">SECRETO</option>
                </select>
                <select
                  value={threatLevelFilter}
                  onChange={(e) => setThreatLevelFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-red-500/50 font-mono animate-fadeIn"
                >
                  <option value="ALL">Nível de Ameaça: Todos</option>
                  <option value="Crítico">🔴 Crítico</option>
                  <option value="Alto">🟠 Alto</option>
                  <option value="Médio">🟡 Médio</option>
                  <option value="Baixo">🟢 Baixo</option>
                </select>
              </div>
            )}
          </div>

          {/* RENDER DYNAMIC CRUD TABLE/CARDS */}
          <div className="overflow-x-auto border border-slate-855 rounded-xl bg-slate-950/60 shadow-lg">
            {subTab === "reinsercao" && (() => {
              const filtered = reintegrationRecords.filter(item => {
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch = !query || 
                  item.inmateName.toLowerCase().includes(query) ||
                  item.programName.toLowerCase().includes(query) ||
                  item.reintegratorName.toLowerCase().includes(query) ||
                  item.evaluationNotes.toLowerCase().includes(query);
                const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
                return matchesSearch && matchesCategory;
              });

              return (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono select-none bg-slate-900/60">
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Matrícula</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Recluso inscrito</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Programa Integrado</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Assiduidade</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Aproveitamento</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Estágio</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                          Nenhum participante em programas de reinserção social comunitária.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(item => (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition font-sans">
                          <td className="p-4 font-mono font-bold text-slate-350">{item.id}</td>
                          <td className="p-4">
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-slate-100">{item.inmateName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-slate-205">{item.programName}</span>
                              <span className="text-[10px] text-amber-500 font-mono uppercase tracking-wider">{item.category}</span>
                            </div>
                          </td>
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-100">{item.attendanceRate}%</span>
                              <div className="w-12 bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-850">
                                <div className="bg-emerald-500 h-full" style={{ width: (item.attendanceRate + "%") }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-left font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-100">{item.progressScore}/100</span>
                              <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                                item.progressScore >= 85 ? "text-emerald-400 bg-emerald-950/20" :
                                item.progressScore >= 60 ? "text-amber-400 bg-amber-955/15" :
                                "text-rose-455 bg-rose-955/10"
                              }`}>
                                {item.progressScore >= 85 ? "Excelente" : item.progressScore >= 60 ? "Média" : "Crítico"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-left">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-slate-900/50 ${
                              item.status === "Concluído" ? "border-emerald-500/20 text-emerald-400" :
                              item.status === "Ativo" ? "border-amber-500/25 text-amber-500 animate-pulse" :
                              item.status === "Suspenso" ? "border-rose-500/10 text-rose-405" :
                              "border-slate-800 text-slate-450"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-sans">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditClick("reinsercao", item)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer font-mono font-bold"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick("reinsercao", item.id)}
                                className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer font-mono font-bold"
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
              );
            })()}

            {subTab === "inteligencia" && (() => {
              const filtered = intelligenceRecords.filter(item => {
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch = !query || 
                  item.inmateName.toLowerCase().includes(query) ||
                  item.incidentSource.toLowerCase().includes(query) ||
                  item.alertType.toLowerCase().includes(query) ||
                  item.description.toLowerCase().includes(query);
                const matchesClassification = classificationFilter === "ALL" || item.classification === classificationFilter;
                const matchesThreat = threatLevelFilter === "ALL" || item.threatLevel === threatLevelFilter;
                return matchesSearch && matchesClassification && matchesThreat;
              });

              return (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-450 font-mono select-none bg-slate-900/60">
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Checksum canónica</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Suspeito sinalizado</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Origem documental</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Classificação</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Tipo de Alerta</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Nível Ameaça</th>
                      <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                          Nenhuma interceptação de segurança ativa com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(item => (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 text-rose-500 font-bold select-all text-[11px] truncate max-w-xs text-left">{item.checksum}</td>
                          <td className="p-4 font-sans text-left">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-100">{item.inmateName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-200 font-semibold font-sans text-left">{item.incidentSource}</td>
                          <td className="p-4 text-left">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.classification === "SECRETO" ? "bg-red-955/20 border-red-500/20 text-red-400" :
                              item.classification === "CONFIDENCIAL" ? "bg-amber-955/15 border-amber-500/15 text-amber-400" :
                              "bg-slate-900 border-slate-800 text-slate-400"
                            }`}>
                              {item.classification}
                            </span>
                          </td>
                          <td className="p-4 text-slate-350 font-sans font-medium text-left">{item.alertType}</td>
                          <td className="p-4 text-left">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              item.threatLevel === "Crítico" ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" :
                              item.threatLevel === "Alto" ? "bg-rose-950/20 border-rose-500/20 text-rose-355" :
                              item.threatLevel === "Médio" ? "bg-amber-550/10 border-amber-500/10 text-amber-450" :
                              "bg-emerald-950/20 border-emerald-500/10 text-emerald-450"
                            }`}>
                              {item.threatLevel}
                            </span>
                          </td>
                          <td className="p-4 text-right font-sans">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditClick("inteligencia", item)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer font-mono font-bold"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick("inteligencia", item.id)}
                                className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer font-mono font-bold"
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
              );
            })()}
          </div>
        </>
      )}

      {/* Security Footnote */}
      <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex items-start gap-3 text-left">
        <Shield className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Protocolo de Confidencialidade Orgânica (Decreto Lei 14/20)</h4>
          <p className="text-[10px] font-sans text-slate-500 leading-normal mt-1">
            Em conformidade com o regime disciplinar de segurança prisional do Ministério do Interior, todos os prontuários médicos, registos de progressão escolar/laboral, e escutas operacionais de inteligência encontram-se selados criptograficamente. O acesso aos bancos especiais de admissão é monitorizado de ponta-a-ponta e devidamente associado às chaves operacionais e IP de proveniência de cada utilizador ativo no sistema central PNAP.
          </p>
        </div>
      </div>
    </div>
  );
};
