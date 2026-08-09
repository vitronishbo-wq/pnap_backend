import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  UserCheck, 
  Building, 
  FileText, 
  Lock, 
  Unlock, 
  AlertCircle, 
  Stethoscope, 
  Fingerprint, 
  Archive, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet,
  Zap,
  Check
} from "lucide-react";

export interface NEPVerificationPayload {
  type: "ADMISSAO" | "TRANSFERENCIA" | "MUDANCA_CELA" | "SOLTURA";
  inmateName: string;
  inmateDocOrId?: string;
  nipc?: string;
  originPrison?: string;
  targetPrison?: string;
  targetCell?: string;
  warrantNumber?: string;
  riskLevel?: string;
  operatorName?: string;
  hasWarrant?: boolean;
  hasMedicalExam?: boolean;
  hasBiometrics?: boolean;
  hasBelongingsInventory?: boolean;
  isCellOvercrowded?: boolean;
}

export interface NEPVerificationInterceptorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPersistence: (exceptionNote?: string) => void;
  payload: NEPVerificationPayload;
}

interface ComplianceCheckItem {
  id: string;
  article: string;
  title: string;
  description: string;
  isRequired: boolean;
  isPassed: boolean;
  category: "DOCUMENTAL" | "SANITARIA" | "SEGURANCA" | "BIOMETRICA";
}

export function NEPVerificationInterceptor({
  isOpen,
  onClose,
  onConfirmPersistence,
  payload
}: NEPVerificationInterceptorProps) {
  const [exceptionReason, setExceptionReason] = useState("");
  const [useException, setUseException] = useState(false);
  const [operatorSignature, setOperatorSignature] = useState(payload.operatorName || "Operador de Custódia");
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});

  // Generate initial compliance rule evaluations based on payload
  const initialRules = useMemo<ComplianceCheckItem[]>(() => {
    const isAdmission = payload.type === "ADMISSAO";
    const isTransfer = payload.type === "TRANSFERENCIA" || payload.type === "MUDANCA_CELA";

    return [
      {
        id: "R1_WARRANT",
        article: "Artigo 4.º (Dec. 272/16)",
        title: isAdmission ? "Legitimidade do Título de Detenção / Mandado" : "Ordem Judicial ou Ordem de Trânsito",
        description: isAdmission 
          ? "Existência de Mandado de Detenção assinado pelo Juiz de Garantias ou Mandado de Prisão Preventiva válido."
          : "Guia de Marcha / Ordem de Transferência assinada pela Direção Provincial do DGPNAP.",
        isRequired: true,
        isPassed: payload.hasWarrant !== false,
        category: "DOCUMENTAL"
      },
      {
        id: "R2_BIOMETRICS",
        article: "Artigo 7.º (Dec. 272/16)",
        title: "Registo Canónico & Identificação Biométrica",
        description: "Captura de impressões digitais, fotografia frontal/perfil e atribuição de NIPC único no SICP.",
        isRequired: true,
        isPassed: payload.hasBiometrics !== false,
        category: "BIOMETRICA"
      },
      {
        id: "R3_HEALTH",
        article: "Artigo 9.º (Dec. 272/16)",
        title: "Triagem Médica & Ficha Sanitária de Ingresso",
        description: "Realização do exame médico em até 24h, rastreio de patologias contagiosas e avaliação de lesões prévias.",
        isRequired: true,
        isPassed: payload.hasMedicalExam !== false,
        category: "SANITARIA"
      },
      {
        id: "R4_BELONGINGS",
        article: "Artigo 12.º (Dec. 272/16)",
        title: "Guia de Depósito & Inventário de Bens Pessoais",
        description: "Registo dos haveres do recluso com emissão da Guia de Custódia e depósito no Fundo de Reclusos.",
        isRequired: isAdmission,
        isPassed: payload.hasBelongingsInventory !== false,
        category: "DOCUMENTAL"
      },
      {
        id: "R5_MNCP_RISK",
        article: "Artigo 15.º (Dec. 272/16)",
        title: "Classificação MNCP & Compatibilidade de Regime",
        description: `Verificação de nível de risco (${payload.riskLevel || 'Médio'}) contra o regime do bloco de destino.`,
        isRequired: true,
        isPassed: true,
        category: "SEGURANCA"
      },
      {
        id: "R6_CELL_CAPACITY",
        article: "Artigo 18.º (Dec. 272/16)",
        title: "Rácio Habitacional de Célula (4m² / Recluso)",
        description: "Validação da lotação máxima da cela de destino para prevenir sobrelotação indevida.",
        isRequired: true,
        isPassed: !payload.isCellOvercrowded,
        category: "SEGURANCA"
      },
      {
        id: "R7_NOTIF",
        article: "Artigo 24.º (Dec. 272/16)",
        title: "Notificação do Defensor Constituído e Família",
        description: "Registo do contacto familiar primário para comunicação obrigatória em até 24 horas.",
        isRequired: false,
        isPassed: true,
        category: "DOCUMENTAL"
      }
    ];
  }, [payload]);

  // Combined checked state
  const isRulePassed = (rule: ComplianceCheckItem) => {
    if (checkedRules[rule.id] !== undefined) {
      return checkedRules[rule.id];
    }
    return rule.isPassed;
  };

  const toggleRule = (ruleId: string) => {
    setCheckedRules(prev => ({
      ...prev,
      [ruleId]: !isRulePassed(initialRules.find(r => r.id === ruleId)!)
    }));
  };

  // Evaluation calculations
  const totalRules = initialRules.length;
  const passedRulesCount = initialRules.filter(r => isRulePassed(r)).length;
  const compliancePercentage = Math.round((passedRulesCount / totalRules) * 100);

  const blockingFailures = initialRules.filter(r => r.isRequired && !isRulePassed(r));
  const hasBlockingFailures = blockingFailures.length > 0;

  const isApprovedToPersist = !hasBlockingFailures || (useException && exceptionReason.trim().length >= 10);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER BAR */}
          <div className="bg-slate-900/90 border-b border-slate-850 p-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                <ShieldCheck className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-100 font-mono uppercase tracking-wide">
                    Verificação Prévia de Conformidade Legal (Decreto Executivo n.º 272/16)
                  </h2>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0">
                    INTERCEPTADOR SICP
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-xs font-mono p-1.5 rounded-lg bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">

            {/* OPERATION SUMMARY CARD */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Tipo de Operação:</span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  {payload.type === "ADMISSAO" ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      NOVA ADMISSÃO CANÓNICA
                    </>
                  ) : (
                    <>
                      <Building className="h-3.5 w-3.5 text-blue-400" />
                      MOVIMENTAÇÃO / TRANSFERÊNCIA
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Recluso Alvo:</span>
                <span className="text-xs font-sans font-bold text-slate-200">
                  {payload.inmateName} <span className="text-[10px] font-mono text-slate-400 font-normal">({payload.inmateDocOrId || payload.nipc || 'N/A'})</span>
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Alocação / Destino:</span>
                <span className="text-xs font-mono text-slate-300">
                  {payload.targetPrison || 'EP Viana'} {payload.targetCell ? `• ${payload.targetCell}` : ''}
                </span>
              </div>
            </div>

            {/* COMPLIANCE PROGRESS METER */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-amber-400" />
                  Índice de Conformidade Legal Regulamentar
                </span>
                <span className={`font-bold text-sm ${
                  compliancePercentage === 100 
                    ? "text-emerald-400" 
                    : compliancePercentage >= 75 
                      ? "text-amber-400" 
                      : "text-red-400"
                }`}>
                  {compliancePercentage}% ({passedRulesCount}/{totalRules} Requisitos Válidos)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    compliancePercentage === 100 
                      ? "bg-emerald-500" 
                      : compliancePercentage >= 75 
                        ? "bg-amber-500" 
                        : "bg-red-500"
                  }`}
                  style={{ width: `${compliancePercentage}%` }}
                />
              </div>

              {hasBlockingFailures && !useException && (
                <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-xs text-red-300 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-bold uppercase block text-red-400 text-xxs">PENDÊNCIAS LEGAIS CRÍTICAS ENCONTRADAS ({blockingFailures.length})</span>
                    <p className="text-slate-300 text-xxs font-sans mt-0.5">
                      Para proceder à persistência, conclua a verificação dos requisitos ou registe uma Justificativa de Exceção Jurisdicional fundamentada.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CHECKLIST TABLE OF DECRETO EXECUTIVO 272/16 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                <span>Procedimentos Regulamentares (Decreto Executivo n.º 272/16)</span>
                <span className="text-[10px] text-slate-500 font-normal">Clique para alternar conformidade manual</span>
              </div>

              <div className="flex flex-col gap-2">
                {initialRules.map(rule => {
                  const passed = isRulePassed(rule);
                  return (
                    <div
                      key={rule.id}
                      onClick={() => toggleRule(rule.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        passed
                          ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          : "bg-red-950/15 border-red-900/40 hover:border-red-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {passed ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-200">{rule.title}</span>
                            <span className="text-[9px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              {rule.article}
                            </span>
                            {rule.isRequired && (
                              <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                                OBRIGATÓRIO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans">{rule.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                          passed ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                        }`}>
                          {passed ? "CONFORME" : "PENDENTE"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXCEPTION OVERRIDE SECTION */}
            {hasBlockingFailures && (
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useException}
                      onChange={(e) => setUseException(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      Activar Registo sob Exceção Jurisdicional / Caráter de Urgência (Art. 34.º)
                    </span>
                  </label>
                </div>

                {useException && (
                  <div className="flex flex-col gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                        Fundamentação Jurídica da Exceção (Mínimo 10 caracteres):
                      </label>
                      <textarea
                        rows={2}
                        value={exceptionReason}
                        onChange={(e) => setExceptionReason(e.target.value)}
                        placeholder="Ex: Recluso admitido sob ordem verbal urgente de transferência de escolta pendente de homologação física da guia."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                        Assinatura Digital do Operador Responsável:
                      </label>
                      <input
                        type="text"
                        value={operatorSignature}
                        onChange={(e) => setOperatorSignature(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="bg-slate-900/90 border-t border-slate-850 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-[11px] font-mono text-slate-500 text-center sm:text-left">
              Chave de Auditoria: <span className="text-slate-400">DEC272-VERIF-{Date.now().toString().slice(-6)}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono text-xs px-4 py-2.5 rounded-xl border border-slate-800 transition cursor-pointer"
              >
                Abortar / Rejeitar
              </button>

              <button
                type="button"
                disabled={!isApprovedToPersist}
                onClick={() => onConfirmPersistence(useException ? exceptionReason : undefined)}
                className={`font-mono text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg ${
                  isApprovedToPersist
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Confirmar & Persistir no Sistema
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
