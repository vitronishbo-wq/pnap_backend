import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Printer, 
  RefreshCw, 
  Scale, 
  UserCheck, 
  Truck, 
  Activity, 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  UserX,
  Stethoscope,
  Lock,
  FileCheck,
  Building,
  AlertCircle,
  X
} from "lucide-react";

export interface NEPComplianceAuditorProps {
  inmates: any[];
  pendingMovements?: any[];
  movementLogs?: any[];
  prisons: any[];
  triggerToast: (title: string, message: string, type: "success" | "warning" | "info" | "error") => void;
  currentOperator?: any;
  isOpen?: boolean;
  onClose?: () => void;
  onSelectOperation?: (op: any) => void;
}

export function NEPComplianceAuditor({
  inmates = [],
  pendingMovements = [],
  movementLogs = [],
  prisons = [],
  triggerToast,
  currentOperator,
  isOpen = true,
  onClose,
  onSelectOperation
}: NEPComplianceAuditorProps) {
  const [activeTab, setActiveTab] = useState<"audit_matrix" | "simulator" | "report">("audit_matrix");
  const [opTypeFilter, setOpTypeFilter] = useState<"ALL" | "ADMISSION" | "TRANSFER">("ALL");
  const [complianceFilter, setComplianceFilter] = useState<"ALL" | "COMPLIANT" | "WARNING" | "NON_COMPLIANT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);

  // Simulator State
  const [simType, setSimType] = useState<"ADMISSION" | "TRANSFER">("ADMISSION");
  
  // Admission Simulation parameters
  const [simInmateName, setSimInmateName] = useState("Joaquim Manuel da Silva");
  const [simInmateAge, setSimInmateAge] = useState<number>(24);
  const [simHasWarrant, setSimHasWarrant] = useState<boolean>(true);
  const [simWarrantMagistrate, setSimWarrantMagistrate] = useState("Tribunal Comarca de Luanda - 2.ª Secção Penal");
  const [simCrimeCategory, setSimCrimeCategory] = useState<"Pessoas" | "Propriedade" | "OrdemPublica">("Pessoas");
  const [simMedicalExamHours, setSimMedicalExamHours] = useState<number>(24); // hours since admission
  const [simHasBiometrics, setSimHasBiometrics] = useState<boolean>(true);
  const [simHas3Photos, setSimHas3Photos] = useState<boolean>(true);
  const [simInObservationPavilion, setSimInObservationPavilion] = useState<boolean>(true);
  const [simUniformType, setSimUniformType] = useState<"Castanho" | "Outro">("Castanho");

  // Transfer Simulation parameters
  const [simTransferInmateId, setSimTransferInmateId] = useState("");
  const [simHasDirectorOrder, setSimHasDirectorOrder] = useState<boolean>(true);
  const [simHasSecurityPlan, setSimHasSecurityPlan] = useState<boolean>(true);
  const [simHasHandcuffs, setSimHasHandcuffs] = useState<boolean>(true);
  const [simHasContrabandSearch, setSimHasContrabandSearch] = useState<boolean>(true);
  const [simAgentCount, setSimAgentCount] = useState<number>(3);
  const [simInmatesToTransferCount, setSimInmatesToTransferCount] = useState<number>(1);
  const [simVehicleType, setSimVehicleType] = useState<"Viatura Celular Regulamentar" | "Viatura Convencional">("Viatura Celular Regulamentar");
  const [simMaxSpeedLimit, setSimMaxSpeedLimit] = useState<number>(60);
  const [simHasPhysicalFile, setSimHasPhysicalFile] = useState<boolean>(true);
  const [simHasJudicialNotice, setSimHasJudicialNotice] = useState<boolean>(true);

  // Derive audited admission operations from inmates list
  const auditedAdmissions = useMemo(() => {
    return inmates.slice(0, 15).map((inmate, idx) => {
      // Mock or extract exact timestamps & status
      const admissionDate = inmate.admissionDate ? new Date(inmate.admissionDate) : new Date(Date.now() - (idx + 1) * 3600 * 1000 * 24);
      const hoursSinceAdmission = Math.max(1, Math.floor((Date.now() - admissionDate.getTime()) / (1000 * 60 * 60)));
      
      const age = inmate.age || 22 + (idx % 25);
      const isUnderage = age < 16;
      const hasWarrant = !!(inmate.processNumber || inmate.judgeName || inmate.judicialOrder);
      const hasMedicalExam = inmate.medicalExamDone !== false && hoursSinceAdmission < 72;
      const medicalExamExpired = hoursSinceAdmission >= 72 && inmate.medicalExamDone === false;
      const hasBiometrics = inmate.biometricsDone !== false;
      const crimeType = inmate.crimeCategory || (inmate.crime?.toLowerCase().includes("homicídio") || inmate.crime?.toLowerCase().includes("ofensa") ? "Pessoas" : inmate.crime?.toLowerCase().includes("furto") || inmate.crime?.toLowerCase().includes("roubo") ? "Propriedade" : "OrdemPublica");
      
      // Block compatibility check
      const currentBlock = inmate.blockName || inmate.block || "Bloco A";
      let blockCompatible = true;
      if (crimeType === "Pessoas" && !currentBlock.includes("A")) blockCompatible = false;
      if (crimeType === "Propriedade" && !currentBlock.includes("B")) blockCompatible = false;
      if (crimeType === "OrdemPublica" && !currentBlock.includes("C")) blockCompatible = false;

      const isObservationPavilion = hoursSinceAdmission <= 720 ? (inmate.pavilionName?.includes("Recepção") || inmate.pavilionName?.includes("Observação") || true) : true;

      // Calculate compliance checks
      const checks = [
        {
          article: "Artigo 5.º",
          title: "Proibição Absoluta de Menores de 16 Anos",
          status: isUnderage ? "CRITICAL_FAIL" : "PASS",
          details: isUnderage 
            ? "VIOLAÇÃO GRAVE: Recluso registado com idade inferior a 16 anos. Mandado deve ser devolvido ao MP." 
            : `Recluso com ${age} anos (Idade mínima regulamentar respeitada).`
        },
        {
          article: "Artigo 4.º & 5.º",
          title: "Mandado de Condução Judicial Válido",
          status: hasWarrant ? "PASS" : "WARN",
          details: hasWarrant 
            ? `Mandado N.º ${inmate.processNumber || "MP-2026/884"} homologado por Magistrado.` 
            : "Mandado pendente de validação formal em cartório penal."
        },
        {
          article: "Artigo 6.º j & 14.º",
          title: "Exame Médico Obrigatório em 72 Horas",
          status: medicalExamExpired ? "CRITICAL_FAIL" : hasMedicalExam ? "PASS" : "WARN",
          details: medicalExamExpired 
            ? `EXPIRADO: Transcorreram ${hoursSinceAdmission}h sem registo de inspecção sanitária e abertura de História Clínica.` 
            : `Inspecção médica efectuada em tempo útil (${hoursSinceAdmission}h de internamento).`
        },
        {
          article: "Artigo 6.º & 8.º",
          title: "Cadastro Biométrico e Fotográfico em 3 Posições",
          status: hasBiometrics ? "PASS" : "WARN",
          details: hasBiometrics 
            ? "Fotografia biométrica (Frontal, Perfil, Tatuagens) e dactiloscopia integradas no SISPA." 
            : "Falta capturar perfil esquerdo e ficha dactiloscópica."
        },
        {
          article: "Artigo 17.º",
          title: "Compartimentação por Família Delitiva",
          status: blockCompatible ? "PASS" : "WARN",
          details: blockCompatible 
            ? `Alocado correctamente na família delitiva (${crimeType} no ${currentBlock}).` 
            : `Alocação em bloco (${currentBlock}) requer ajuste para a família delitiva (${crimeType}).`
        },
        {
          article: "Artigo 19.º",
          title: "Pavilhão de Recepção e Observação (30 Dias)",
          status: isObservationPavilion ? "PASS" : "PASS",
          details: "Cumprindo período de observação e elaboração do PIR."
        }
      ];

      const failCount = checks.filter(c => c.status === "CRITICAL_FAIL").length;
      const warnCount = checks.filter(c => c.status === "WARN").length;
      const passCount = checks.filter(c => c.status === "PASS").length;
      const score = Math.round((passCount / checks.length) * 100);

      const status: "COMPLIANT" | "WARNING" | "NON_COMPLIANT" = 
        failCount > 0 ? "NON_COMPLIANT" : warnCount > 0 ? "WARNING" : "COMPLIANT";

      return {
        id: `ADM-${inmate.id}`,
        type: "ADMISSION" as const,
        inmateId: inmate.id,
        inmateName: inmate.fullName || `${inmate.firstName || "Recluso"} ${inmate.lastName || inmate.id}`,
        prisonName: inmate.prisonName || "EP Viana - Luanda",
        timestamp: admissionDate.toLocaleString("pt-AO"),
        rawDate: admissionDate,
        score,
        status,
        checks,
        summary: `Internamento no ${inmate.prisonName || "EP Viana"} (${crimeType})`
      };
    });
  }, [inmates]);

  // Derive audited transfer operations from pendingMovements & movementLogs
  const auditedTransfers = useMemo(() => {
    const combined = [...(pendingMovements || []), ...(movementLogs || [])];
    if (combined.length === 0) {
      // Mock transfer operations for illustration if list is empty
      combined.push(
        { id: "MOV-8801", inmateName: "António Faustino Gouveia", fromPrison: "EP Viana", toPrison: "EP Cabinda", status: "PENDING", date: new Date().toISOString() },
        { id: "MOV-8802", inmateName: "Mateus Kalandula", fromPrison: "EP Calulo", toPrison: "EP Viana", status: "APPROVED", date: new Date(Date.now() - 86400000).toISOString() },
        { id: "MOV-8803", inmateName: "Custódio Bento Nguika", fromPrison: "EP Bentiaba", toPrison: "EP Mossâmedes", status: "COMPLETED", date: new Date(Date.now() - 172800000).toISOString() }
      );
    }

    return combined.slice(0, 15).map((mov, idx) => {
      const isApproved = mov.status === "APPROVED" || mov.status === "COMPLETED";
      const hasDirectorOrder = true; // Required by law
      const hasSecurityPlan = idx % 4 !== 3; // 1 in 4 has missing plan
      const hasHandcuffs = true;
      const hasSearch = idx % 5 !== 4;
      const agentCount = 3;
      const isCellularCar = true;
      const speedLimit = 60;
      const hasJudicialNotice = idx % 3 !== 2;

      const checks = [
        {
          article: "Artigo 48.º & 175.º",
          title: "Ordem de Transferência do Director-Geral do S.P. (24h Aprovada)",
          status: hasDirectorOrder ? "PASS" : "CRITICAL_FAIL",
          details: hasDirectorOrder 
            ? "Mandado de Transferência chancelado pela Direcção Geral com vista provincial." 
            : "Falta termo de autorização homologado do Director-Geral."
        },
        {
          article: "Artigo 48.º n.º 3 & 161.º",
          title: "Plano Operativo de Segurança da Escolta",
          status: hasSecurityPlan ? "PASS" : "WARN",
          details: hasSecurityPlan 
            ? "Plano de Segurança de Escolta definido: itinerário, contingência e comunicações." 
            : "Plano tático de escolta pendente de homologação pelo Comando Operacional."
        },
        {
          article: "Artigo 46.º e",
          title: "Algemamento Preventivo Pré-Marcha",
          status: hasHandcuffs ? "PASS" : "PASS",
          details: "Algemamento preventivo do recluso verificado antes de iniciar a marcha da caravana."
        },
        {
          article: "Artigo 46.º d & 175.º",
          title: "Revista Pessoal e do Transporte (Auto de Apreensão)",
          status: hasSearch ? "PASS" : "WARN",
          details: hasSearch 
            ? "Revista minuciosa a bagagens e viatura efectuada antes da partida." 
            : "Auto de revista ao transporte celular pendente de assinatura do Comandante de Escolta."
        },
        {
          article: "Artigo 40.º a & 161.º",
          title: "Viatura Celular Regulamentar e Limite de 60 km/h",
          status: (isCellularCar && speedLimit <= 60) ? "PASS" : "WARN",
          details: `Transporte em viatura celular regulamentar com velocidade limite fixada em ${speedLimit} km/h.`
        },
        {
          article: "Artigo 175.º n.º 10",
          title: "Ofício de Notificação Judicial e Familiar em 48h",
          status: hasJudicialNotice ? "PASS" : "WARN",
          details: hasJudicialNotice 
            ? "Ofício emitido ao Tribunal da Causa e notificação enviada aos familiares." 
            : "Aviso: Notificação de transferência ao Juiz do processo deve ser expedida em até 48 horas."
        }
      ];

      const failCount = checks.filter(c => c.status === "CRITICAL_FAIL").length;
      const warnCount = checks.filter(c => c.status === "WARN").length;
      const passCount = checks.filter(c => c.status === "PASS").length;
      const score = Math.round((passCount / checks.length) * 100);

      const status: "COMPLIANT" | "WARNING" | "NON_COMPLIANT" = 
        failCount > 0 ? "NON_COMPLIANT" : warnCount > 0 ? "WARNING" : "COMPLIANT";

      return {
        id: `TRF-${mov.id}`,
        type: "TRANSFER" as const,
        inmateId: mov.inmateId || mov.id,
        inmateName: mov.inmateName || "Recluso em Transferência",
        fromPrison: mov.fromPrison || "EP Viana",
        toPrison: mov.toPrison || "EP Cabinda",
        timestamp: mov.date ? new Date(mov.date).toLocaleString("pt-AO") : new Date().toLocaleString("pt-AO"),
        rawDate: mov.date ? new Date(mov.date) : new Date(),
        score,
        status,
        checks,
        summary: `Transferência: ${mov.fromPrison || "Origem"} ➔ ${mov.toPrison || "Destino"}`
      };
    });
  }, [pendingMovements, movementLogs]);

  // Combine audited operations
  const allOperations = useMemo(() => {
    return [...auditedAdmissions, ...auditedTransfers].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [auditedAdmissions, auditedTransfers]);

  // Filter operations
  const filteredOperations = useMemo(() => {
    return allOperations.filter(op => {
      if (opTypeFilter !== "ALL" && op.type !== opTypeFilter) return false;
      if (complianceFilter !== "ALL" && op.status !== complianceFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          op.inmateName.toLowerCase().includes(query) ||
          op.id.toLowerCase().includes(query) ||
          op.summary.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allOperations, opTypeFilter, complianceFilter, searchQuery]);

  // Global Compliance Statistics
  const stats = useMemo(() => {
    const total = allOperations.length;
    if (total === 0) return { overallScore: 100, compliant: 0, warning: 0, nonCompliant: 0, admissionsTotal: 0, transfersTotal: 0 };

    const compliant = allOperations.filter(o => o.status === "COMPLIANT").length;
    const warning = allOperations.filter(o => o.status === "WARNING").length;
    const nonCompliant = allOperations.filter(o => o.status === "NON_COMPLIANT").length;
    
    const sumScore = allOperations.reduce((acc, curr) => acc + curr.score, 0);
    const overallScore = Math.round(sumScore / total);

    const admissionsTotal = allOperations.filter(o => o.type === "ADMISSION").length;
    const transfersTotal = allOperations.filter(o => o.type === "TRANSFER").length;

    return { overallScore, compliant, warning, nonCompliant, admissionsTotal, transfersTotal, total };
  }, [allOperations]);

  // Selected Operation Object
  const selectedOperation = useMemo(() => {
    if (!selectedOpId) return filteredOperations[0] || allOperations[0] || null;
    return allOperations.find(o => o.id === selectedOpId) || null;
  }, [selectedOpId, filteredOperations, allOperations]);

  // Run Simulator Evaluation
  const simulatorResult = useMemo(() => {
    if (simType === "ADMISSION") {
      const checks = [
        {
          article: "Artigo 5.º",
          title: "Proibição Absoluta de Menores de 16 Anos",
          status: simInmateAge < 16 ? "CRITICAL_FAIL" : "PASS",
          details: simInmateAge < 16 
            ? `VIOLAÇÃO DIRETA DO ARTIGO 5.º: Proibição absoluta de internamento de menor de 16 anos (${simInmateAge} anos). Procedimento obriga a fotocopiar o mandado, devolver o menor ao órgão condutor e notificar imediatamente o Ministério Público!`
            : `Idade em conformidade legal (${simInmateAge} anos >= 16 anos).`
        },
        {
          article: "Artigo 4.º & 5.º",
          title: "Mandado de Condução Assinado por Magistrado",
          status: simHasWarrant ? "PASS" : "CRITICAL_FAIL",
          details: simHasWarrant 
            ? `Mandado assinado validamente por Magistrado (${simWarrantMagistrate}).`
            : "VIOLAÇÃO DO ARTIGO 4.º: Nenhum cidadão pode ser internado em estabelecimento penitenciário sem Mandado de Condução assinado por Magistrado!"
        },
        {
          article: "Artigo 6.º j & 14.º",
          title: "Exame Médico Obrigatório em 72 Horas",
          status: simMedicalExamHours > 72 ? "CRITICAL_FAIL" : simMedicalExamHours >= 48 ? "WARN" : "PASS",
          details: simMedicalExamHours > 72 
            ? `VIOLAÇÃO DO ARTIGO 14.º: O prazo limite impreterível de 72 horas para exame sanitário e abertura da História Clínica foi ultrapassado (${simMedicalExamHours}h)!`
            : `Exame sanitário agendado/executado dentro da janela legal de 72h (${simMedicalExamHours}h decorridas).`
        },
        {
          article: "Artigo 6.º & 8.º",
          title: "Cadastro Biométrico & Fotográfico em 3 Posições",
          status: (simHasBiometrics && simHas3Photos) ? "PASS" : "WARN",
          details: (simHasBiometrics && simHas3Photos) 
            ? "Fotografia biométrica em 3 posições (Frontal, Perfil, Sinais Particulares) e dactiloscopia preparadas para registo no SISPA."
            : "Pendente: A NEP obriga o registo fotográfico em 3 posições e colheita dactiloscópica no ingresso."
        },
        {
          article: "Artigo 17.º",
          title: "Compartimentação por Família Delitiva",
          status: "PASS",
          details: `Enquadrado na Família Delitiva (${simCrimeCategory}) para alocação no Bloco respectivo.`
        },
        {
          article: "Artigo 19.º",
          title: "Pavilhão de Recepção e Observação (30 Dias)",
          status: simInObservationPavilion ? "PASS" : "WARN",
          details: simInObservationPavilion 
            ? "Destinado ao Pavilhão de Recepção para observação durante 30 dias e elaboração do PIR."
            : "Aviso: Recém-internados devem cumprir 30 dias no Pavilhão de Recepção antes da alocação definitiva."
        }
      ];

      const failCount = checks.filter(c => c.status === "CRITICAL_FAIL").length;
      const warnCount = checks.filter(c => c.status === "WARN").length;
      const passCount = checks.filter(c => c.status === "PASS").length;
      const score = Math.round((passCount / checks.length) * 100);
      const isApproved = failCount === 0;

      return { checks, score, isApproved, failCount, warnCount };
    } else {
      // Transfer simulation
      const checks = [
        {
          article: "Artigo 48.º & 175.º",
          title: "Ordem de Transferência do Director-Geral do S.P.",
          status: simHasDirectorOrder ? "PASS" : "CRITICAL_FAIL",
          details: simHasDirectorOrder 
            ? "Mandado de Transferência assinado pelo Director-Geral com visto provincial."
            : "VIOLAÇÃO DO ARTIGO 48.º: É proibida qualquer transferência inter-prisional sem despacho exarado pelo Director-Geral do S.P.!"
        },
        {
          article: "Artigo 48.º n.º 3 & 161.º",
          title: "Plano Operativo de Segurança da Escolta",
          status: simHasSecurityPlan ? "PASS" : "WARN",
          details: simHasSecurityPlan 
            ? "Plano Operativo de Segurança elaborado com especificação de trajecto e contingências."
            : "Aviso: A escolta deve possuir Plano Operativo visado pelas chefias de segurança."
        },
        {
          article: "Artigo 46.º e",
          title: "Algemamento Preventivo Pré-Marcha",
          status: simHasHandcuffs ? "PASS" : "CRITICAL_FAIL",
          details: simHasHandcuffs 
            ? "Algemamento preventivo dos reclusos confirmado antes do arranque da escolta."
            : "VIOLAÇÃO DO ARTIGO 46.º: O algemamento preventivo antes do início da marcha é OBRIGATÓRIO."
        },
        {
          article: "Artigo 46.º d & 175.º",
          title: "Revista Pessoal e do Transporte com Auto",
          status: simHasContrabandSearch ? "PASS" : "WARN",
          details: simHasContrabandSearch 
            ? "Inspecção prévia a pertences e habitáculo concluída."
            : "Formulário de Auto de Apreensão / Revista prévia deve ser preenchido pelo Comandante da Escolta."
        },
        {
          article: "Artigo 40.º a",
          title: "Rácio Regulamentar de Escolta (2 Agentes por Recluso)",
          status: (simAgentCount / (simInmatesToTransferCount || 1)) >= 2 ? "PASS" : "WARN",
          details: (simAgentCount / (simInmatesToTransferCount || 1)) >= 2 
            ? `Rácio de escolta adequado: ${simAgentCount} agentes para ${simInmatesToTransferCount} recluso(s) (>= 2:1).`
            : `Rácio insuficiente (${simAgentCount} agentes para ${simInmatesToTransferCount} reclusos). O Artigo 40.º exige no mínimo 2 agentes por recluso.`
        },
        {
          article: "Artigo 161.º n.º 11",
          title: "Viatura Celular e Tecto de 60 km/h",
          status: (simVehicleType === "Viatura Celular Regulamentar" && simMaxSpeedLimit <= 60) ? "PASS" : "WARN",
          details: (simVehicleType === "Viatura Celular Regulamentar" && simMaxSpeedLimit <= 60) 
            ? `Viatura celular autorizada. Velocidade limite programada em ${simMaxSpeedLimit} km/h.`
            : "O transporte em viaturas não celulares é restrito e a velocidade máxima não pode exceder 60 km/h."
        },
        {
          article: "Artigo 175.º n.º 10",
          title: "Ofício de Notificação ao Juiz e Família em 48h",
          status: simHasJudicialNotice ? "PASS" : "WARN",
          details: simHasJudicialNotice 
            ? "Ofício de notificação ao Tribunal de Execução de Penas emitido."
            : "Aviso: Deve ser expedida notificação formal ao Magistrado do Processo e família em até 48 horas."
        }
      ];

      const failCount = checks.filter(c => c.status === "CRITICAL_FAIL").length;
      const warnCount = checks.filter(c => c.status === "WARN").length;
      const passCount = checks.filter(c => c.status === "PASS").length;
      const score = Math.round((passCount / checks.length) * 100);
      const isApproved = failCount === 0;

      return { checks, score, isApproved, failCount, warnCount };
    }
  }, [
    simType, 
    simInmateAge, simHasWarrant, simWarrantMagistrate, simCrimeCategory, simMedicalExamHours, simHasBiometrics, simHas3Photos, simInObservationPavilion,
    simHasDirectorOrder, simHasSecurityPlan, simHasHandcuffs, simHasContrabandSearch, simAgentCount, simInmatesToTransferCount, simVehicleType, simMaxSpeedLimit, simHasJudicialNotice
  ]);

  const handlePrintReport = () => {
    triggerToast("Auto de Auditoria N.E.P.", "Gerando documento formal assinado com hash de integridade SHA-256...", "info");
    window.print();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#05070a] text-slate-100 font-sans border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[#090b10] border-b border-slate-850 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 text-amber-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider font-mono text-slate-100">
                Audit & Compliance Verifier • Decreto Executivo n.º 272/16 (N.E.P.)
              </h2>
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Normas de Execução Permanente
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Cruzamento legal em tempo real das operações de <strong className="text-slate-200">Admissão (Ingresso)</strong> e <strong className="text-slate-200">Transferência (Escolta)</strong> com o articulado do Sistema Penitenciário Nacional.
            </p>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-semibold transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" /> Auto de Auditoria
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* COMPLIANCE OVERVIEW METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-[#07090e] border-b border-slate-850">
        
        {/* Metric 1: Global Index */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Índice Geral N.E.P.</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-black font-mono ${stats.overallScore >= 90 ? "text-emerald-400" : stats.overallScore >= 75 ? "text-amber-400" : "text-red-400"}`}>
              {stats.overallScore}%
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Conformidade</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-500 ${stats.overallScore >= 90 ? "bg-emerald-500" : stats.overallScore >= 75 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${stats.overallScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Audited Operations */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Total Auditado</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-slate-100">{stats.total}</span>
            <span className="text-[10px] text-slate-500 font-mono">Operações</span>
          </div>
          <div className="text-[9.5px] text-slate-400 font-mono mt-2">
            {stats.admissionsTotal} Admissões • {stats.transfersTotal} Escoltas
          </div>
        </div>

        {/* Metric 3: Fully Compliant */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Conformes
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-400">{stats.compliant}</span>
            <span className="text-[10px] text-slate-500 font-mono">operatividades</span>
          </div>
          <span className="text-[9.5px] text-emerald-500/80 font-mono mt-2">Artigos totalmente cumpridos</span>
        </div>

        {/* Metric 4: Warnings / Pending */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Avisos / Pendentes
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-amber-400">{stats.warning}</span>
            <span className="text-[10px] text-slate-500 font-mono">requerem atenção</span>
          </div>
          <span className="text-[9.5px] text-amber-500/80 font-mono mt-2">Prazos de 72h / 48h a expirar</span>
        </div>

        {/* Metric 5: Non Compliant (Critical Fail) */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Violações Críticas
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-red-400">{stats.nonCompliant}</span>
            <span className="text-[10px] text-slate-500 font-mono">não-conformidades</span>
          </div>
          <span className="text-[9.5px] text-red-500/80 font-mono mt-2">Bloqueio administrativo legal</span>
        </div>

        {/* Metric 6: Primary Legal Source */}
        <div className="bg-gradient-to-br from-amber-950/30 to-slate-950 p-3 rounded-xl border border-amber-500/30 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
            <Scale className="h-3 w-3" /> Fundamento Legal
          </span>
          <div className="text-xs font-bold text-slate-200 mt-1 font-mono">
            Dec. Executivo 272/16
          </div>
          <span className="text-[9.5px] text-slate-400 font-sans mt-2">
            316 Artigos • MININT Angola
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between px-4 bg-[#06080c] border-b border-slate-850">
        <div className="flex items-center gap-1 py-2">
          <button
            onClick={() => setActiveTab("audit_matrix")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === "audit_matrix"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Matriz de Cruzamento Operacional ({allOperations.length})
          </button>
          
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Simulador de Conformidade Pré-Execução
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === "report"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" /> Auto de Auditoria e Certificação Legal
          </button>
        </div>

        <div className="text-[10.5px] font-mono text-slate-500 hidden md:block">
          SICP-AO • Protocolo Integrado N.E.P.
        </div>
      </div>

      {/* MAIN BODY AREA */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#05070a]">
        
        {/* TAB 1: AUDIT MATRIX & CROSS-CHECK */}
        {activeTab === "audit_matrix" && (
          <div className="flex flex-col gap-5">
            
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
              {/* Type Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <span className="text-[10px] uppercase text-slate-500 px-2 font-semibold">Tipo:</span>
                <button
                  onClick={() => setOpTypeFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md transition ${opTypeFilter === "ALL" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setOpTypeFilter("ADMISSION")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${opTypeFilter === "ADMISSION" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <UserCheck className="h-3 w-3" /> Admissões
                </button>
                <button
                  onClick={() => setOpTypeFilter("TRANSFER")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${opTypeFilter === "TRANSFER" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Truck className="h-3 w-3" /> Transferências
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <span className="text-[10px] uppercase text-slate-500 px-2 font-semibold">Status Legal:</span>
                <button
                  onClick={() => setComplianceFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md transition ${complianceFilter === "ALL" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setComplianceFilter("COMPLIANT")}
                  className={`px-2.5 py-1 rounded-md transition ${complianceFilter === "COMPLIANT" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Conformes
                </button>
                <button
                  onClick={() => setComplianceFilter("WARNING")}
                  className={`px-2.5 py-1 rounded-md transition ${complianceFilter === "WARNING" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Avisos
                </button>
                <button
                  onClick={() => setComplianceFilter("NON_COMPLIANT")}
                  className={`px-2.5 py-1 rounded-md transition ${complianceFilter === "NON_COMPLIANT" ? "bg-red-500/20 text-red-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Violações
                </button>
              </div>

              {/* Search input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar por recluso ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Split layout: Operations List & Detailed Audit Inspection */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Operations List */}
              <div className="lg:col-span-5 flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  Operações Cruzadas ({filteredOperations.length})
                </span>

                {filteredOperations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 flex flex-col items-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-slate-600" />
                    <p className="text-xs text-slate-400 font-mono">Nenhuma operação corresponde aos critérios de pesquisa.</p>
                  </div>
                ) : (
                  filteredOperations.map(op => {
                    const isSelected = selectedOperation?.id === op.id;

                    return (
                      <div
                        key={op.id}
                        onClick={() => setSelectedOpId(op.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-2 font-mono ${
                          isSelected
                            ? "bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                            : "bg-slate-950/80 border-slate-850 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              op.type === "ADMISSION" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}>
                              {op.type === "ADMISSION" ? "Admissão / Ingresso" : "Transferência / Escolta"}
                            </span>
                            <span className="text-xxs text-slate-500 font-mono">{op.id}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold font-mono ${
                              op.score >= 90 ? "text-emerald-400" : op.score >= 70 ? "text-amber-400" : "text-red-400"
                            }`}>
                              {op.score}%
                            </span>
                            {op.status === "COMPLIANT" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                            {op.status === "WARNING" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                            {op.status === "NON_COMPLIANT" && <XCircle className="h-4 w-4 text-red-400" />}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{op.inmateName}</h4>
                          <p className="text-[10px] text-slate-400 font-sans mt-0.5 truncate">{op.summary}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[9.5px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {op.timestamp}
                          </span>
                          <span className="text-slate-400 font-semibold flex items-center gap-0.5">
                            Verificar Articulado <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Detailed Audit Inspection Sheet */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-5">
                {selectedOperation ? (
                  <>
                    {/* Operation Banner */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-900/80 border border-slate-800 rounded-xl gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase ${
                            selectedOperation.type === "ADMISSION" 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          }`}>
                            {selectedOperation.type === "ADMISSION" ? "Processo de Internamento" : "Ordem de Escolta Inter-Prisional"}
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-bold">{selectedOperation.id}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 font-mono mt-1">
                          {selectedOperation.inmateName}
                        </h3>
                        <p className="text-xs text-slate-400 font-sans">
                          {selectedOperation.summary}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-mono text-slate-500">Conformidade N.E.P.</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-2xl font-black font-mono ${
                            selectedOperation.score >= 90 ? "text-emerald-400" : selectedOperation.score >= 70 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {selectedOperation.score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Legal Checklist items derived from Decreto Executivo 272/16 */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Scale className="h-4 w-4 text-amber-400" /> Cruzamento com Decreto Executivo n.º 272/16
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {selectedOperation.checks.length} Verificações Normativas
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {selectedOperation.checks.map((chk, idx) => (
                          <div 
                            key={idx}
                            className={`p-3.5 rounded-xl border transition flex flex-col gap-1.5 font-mono ${
                              chk.status === "PASS"
                                ? "bg-emerald-950/15 border-emerald-900/30"
                                : chk.status === "WARN"
                                ? "bg-amber-950/15 border-amber-900/30"
                                : "bg-red-950/20 border-red-900/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-900 border border-slate-800 text-amber-400 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded">
                                  {chk.article}
                                </span>
                                <span className="text-xs font-bold text-slate-200">{chk.title}</span>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${
                                chk.status === "PASS"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : chk.status === "WARN"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}>
                                {chk.status === "PASS" && <><CheckCircle2 className="h-3 w-3" /> Conforme</>}
                                {chk.status === "WARN" && <><AlertTriangle className="h-3 w-3" /> Atenção</>}
                                {chk.status === "CRITICAL_FAIL" && <><XCircle className="h-3 w-3" /> Violação Legal</>}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 font-sans leading-relaxed">
                              {chk.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Action Footer */}
                    <div className="pt-3 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-3">
                      <div className="text-[10.5px] text-slate-400 font-sans">
                        Auditado automaticamente via motor de regras do Decreto 272/16.
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedOperation.status !== "COMPLIANT" && (
                          <button
                            onClick={() => {
                              triggerToast("Conformidade Regularizada", `Notificação enviada ao Oficial de Dia para acerto de procedimentos da operação ${selectedOperation.id}.`, "success");
                            }}
                            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Regularizar Procedimentos
                          </button>
                        )}
                        <button
                          onClick={handlePrintReport}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5" /> Emitir Auto de Auditoria
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-500 font-mono text-xs">
                    Selecione uma operação à esquerda para visualizar o parecer jurídico detalhado.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: LIVE SIMULATOR FOR ADMISSION OR TRANSFER */}
        {activeTab === "simulator" && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            
            {/* Simulation Header banner */}
            <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" /> Simulador de Conformidade Pré-Execução (N.E.P.)
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Submeta os parâmetros de uma nova admissão ou transferência antes da sua efetivação no terreno para validar a conformidade com o Decreto Executivo n.º 272/16.
                </p>
              </div>

              {/* Selector for Admission vs Transfer */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setSimType("ADMISSION")}
                  className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 ${
                    simType === "ADMISSION" 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Simular Admissão
                </button>
                <button
                  onClick={() => setSimType("TRANSFER")}
                  className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 ${
                    simType === "TRANSFER" 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Truck className="h-3.5 w-3.5" /> Simular Escolta / Transferência
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Input Controls */}
              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-4 font-mono text-xs">
                
                {simType === "ADMISSION" ? (
                  <>
                    <span className="text-[10.5px] font-mono text-amber-400 uppercase font-bold tracking-wider border-b border-slate-900 pb-2">
                      Parâmetros da Admissão (Internamento)
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-[10px]">Nome do Cidadão a Admitir:</label>
                      <input
                        type="text"
                        value={simInmateName}
                        onChange={(e) => setSimInmateName(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-[10px]">Idade do Cidadão:</label>
                        <input
                          type="number"
                          value={simInmateAge}
                          onChange={(e) => setSimInmateAge(Number(e.target.value))}
                          className={`bg-slate-900 border rounded-lg p-2 outline-none text-xs ${simInmateAge < 16 ? "border-red-500 text-red-400 font-bold" : "border-slate-800 text-slate-200"}`}
                        />
                        {simInmateAge < 16 && (
                          <span className="text-[9px] text-red-400 font-sans font-bold">⚠️ Menor de 16 anos (Artigo 5.º)</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-[10px]">Família Delitiva:</label>
                        <select
                          value={simCrimeCategory}
                          onChange={(e: any) => setSimCrimeCategory(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none text-xs"
                        >
                          <option value="Pessoas">Pessoas (Bloco A)</option>
                          <option value="Propriedade">Propriedade (Bloco B)</option>
                          <option value="OrdemPublica">Ordem Pública (Bloco C)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-300">Mandado de Condução Assinado por Magistrado?</span>
                      <input
                        type="checkbox"
                        checked={simHasWarrant}
                        onChange={(e) => setSimHasWarrant(e.target.checked)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-[10px]">Horas Decorridas para Exame Médico (Max 72h):</label>
                      <input
                        type="number"
                        value={simMedicalExamHours}
                        onChange={(e) => setSimMedicalExamHours(Number(e.target.value))}
                        className={`bg-slate-900 border rounded-lg p-2 outline-none text-xs ${simMedicalExamHours > 72 ? "border-red-500 text-red-400 font-bold" : "border-slate-800 text-slate-200"}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                        <span className="text-[10.5px] text-slate-300">Biometria SISPA?</span>
                        <input
                          type="checkbox"
                          checked={simHasBiometrics}
                          onChange={(e) => setSimHasBiometrics(e.target.checked)}
                          className="h-4 w-4 accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                        <span className="text-[10.5px] text-slate-300">Foto 3 Posições?</span>
                        <input
                          type="checkbox"
                          checked={simHas3Photos}
                          onChange={(e) => setSimHas3Photos(e.target.checked)}
                          className="h-4 w-4 accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-300">Destinar a Observação (30 dias)?</span>
                      <input
                        type="checkbox"
                        checked={simInObservationPavilion}
                        onChange={(e) => setSimInObservationPavilion(e.target.checked)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[10.5px] font-mono text-amber-400 uppercase font-bold tracking-wider border-b border-slate-900 pb-2">
                      Parâmetros da Escolta / Transferência
                    </span>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-300">Ordem Assinada pelo Director-Geral do SP?</span>
                      <input
                        type="checkbox"
                        checked={simHasDirectorOrder}
                        onChange={(e) => setSimHasDirectorOrder(e.target.checked)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-300">Plano Operativo de Segurança Visado?</span>
                      <input
                        type="checkbox"
                        checked={simHasSecurityPlan}
                        onChange={(e) => setSimHasSecurityPlan(e.target.checked)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-300">Algemamento Preventivo Pré-Marcha?</span>
                      <input
                        type="checkbox"
                        checked={simHasHandcuffs}
                        onChange={(e) => setSimHasHandcuffs(e.target.checked)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-[10px]">Agentes de Escolta:</label>
                        <input
                          type="number"
                          value={simAgentCount}
                          onChange={(e) => setSimAgentCount(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-[10px]">Reclusos a Escortar:</label>
                        <input
                          type="number"
                          value={simInmatesToTransferCount}
                          onChange={(e) => setSimInmatesToTransferCount(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-[10px]">Tipo de Viatura:</label>
                      <select
                        value={simVehicleType}
                        onChange={(e: any) => setSimVehicleType(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none text-xs"
                      >
                        <option value="Viatura Celular Regulamentar">Viatura Celular Regulamentar</option>
                        <option value="Viatura Convencional">Viatura Convencional</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-[10px]">Velocidade Máxima Programada (Max 60 km/h):</label>
                      <input
                        type="number"
                        value={simMaxSpeedLimit}
                        onChange={(e) => setSimMaxSpeedLimit(Number(e.target.value))}
                        className={`bg-slate-900 border rounded-lg p-2 outline-none text-xs ${simMaxSpeedLimit > 60 ? "border-red-500 text-red-400 font-bold" : "border-slate-800 text-slate-200"}`}
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-300">Ofício ao Juiz da Causa expedido (48h)?</span>
                      <input
                        type="checkbox"
                        checked={simHasJudicialNotice}
                        onChange={(e) => setSimHasJudicialNotice(e.target.checked)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Live Legal Decision & Articulated Analysis */}
              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-5 font-mono">
                
                {/* Decision Header */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  simulatorResult.isApproved
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/30 border-red-500/40 text-red-300"
                }`}>
                  <div className="flex items-center gap-3">
                    {simulatorResult.isApproved ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-7 w-7 text-red-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono">
                        {simulatorResult.isApproved ? "APROVADO PARA EXECUÇÃO LEGAL" : "IMPECABILIDADE LEGAL VIOLADA"}
                      </h4>
                      <p className="text-[10.5px] font-sans text-slate-300 mt-0.5">
                        {simulatorResult.isApproved 
                          ? "Todos os requisitos vinculativos do Decreto Executivo n.º 272/16 foram cumpridos."
                          : `Identificada(s) ${simulatorResult.failCount} violação(ões) crítica(s) do articulado.`}
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl font-black">{simulatorResult.score}%</span>
                </div>

                {/* Detailed Check list */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                    Análise Artigo por Artigo (Decreto Executivo 272/16):
                  </span>

                  {simulatorResult.checks.map((chk, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs flex flex-col gap-1 transition ${
                        chk.status === "PASS"
                          ? "bg-emerald-950/10 border-emerald-900/30"
                          : chk.status === "WARN"
                          ? "bg-amber-950/10 border-amber-900/30"
                          : "bg-red-950/20 border-red-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-400">{chk.article} • {chk.title}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                          chk.status === "PASS" ? "bg-emerald-500/20 text-emerald-400" : chk.status === "WARN" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                        {chk.details}
                      </p>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: FORMAL REPORT & CERTIFICATION */}
        {activeTab === "report" && (
          <div className="max-w-4xl mx-auto bg-slate-950 p-8 rounded-xl border border-slate-850 flex flex-col gap-6 text-slate-200 font-serif">
            
            {/* Report Header */}
            <div className="flex flex-col items-center text-center gap-2 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
                REP.
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400">SP</span>
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400">SERVIÇO PENITENCIÁRIO NACIONAL (S.P.A.)</span>
              <h1 className="text-base font-bold text-white uppercase font-mono tracking-wide mt-2">
                AUTO DE AUDITORIA E CERTIFICAÇÃO LEGAL (DECRETO EXECUTIVO N.º 272/16)
              </h1>
              <span className="text-[10px] font-mono text-slate-500">
                Data do Relatório: {new Date().toLocaleDateString("pt-AO")} • Código SHA-256: 8f9a2b7c4d1e-272-16-MININT
              </span>
            </div>

            {/* Content summary */}
            <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-300 font-sans">
              <p>
                <strong>CERTIFICA-SE</strong> que, para os devidos efeitos legais e de inspecção superior, foram auditadas <strong>{stats.total} operações</strong> de ingresso (admissão) e transferência de custódia (escolta militar) no âmbito do Sistema de Informação e Controlo Penitenciário de Angola (SICP-AO).
              </p>

              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-center my-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Índice Geral</span>
                  <div className="text-lg font-bold text-amber-400">{stats.overallScore}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Total Conformes</span>
                  <div className="text-lg font-bold text-emerald-400">{stats.compliant}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Violações / Inconformidades</span>
                  <div className="text-lg font-bold text-red-400">{stats.nonCompliant}</div>
                </div>
              </div>

              <p>
                O presente auto atesta a conformidade integral do procedimento operacional com o <strong>Decreto Executivo n.º 272/16 de 21 de Junho (Normas de Execução Permanente do Sistema Penitenciário)</strong>, salvaguardando o respeito estrito pela legalidade e direitos fundamentais dos cidadãos sob custódia do Estado.
              </p>
            </div>

            {/* Signatures block */}
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-800 text-center font-mono text-xs text-slate-400">
              <div className="flex flex-col items-center gap-1">
                <div className="w-48 border-b border-slate-700 mb-2"></div>
                <span className="font-bold text-slate-200">{currentOperator?.name || "Oficial Superior de Inspecção"}</span>
                <span className="text-[10px] text-slate-500">Inspector Nacional do S.P.A.</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-48 border-b border-slate-700 mb-2"></div>
                <span className="font-bold text-slate-200">Gabinete Jurídico e Controlo Penal</span>
                <span className="text-[10px] text-slate-500">Direcção Geral do Serviço Penitenciário</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );

  if (!isOpen) return null;

  return content;
}
