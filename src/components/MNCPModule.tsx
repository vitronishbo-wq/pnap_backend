import React, { useState, useMemo } from "react";
import { MNCPEngine, PENAL_CODE_GRAPH, PenalCodeArticle, InmateClassificationInput } from "../utils/mncpEngine";
import { 
  Scale, 
  ShieldAlert, 
  Building2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  UserCheck, 
  FileText, 
  Zap, 
  ArrowRight,
  Filter,
  Layers,
  BookOpen,
  Gavel,
  Sparkles
} from "lucide-react";

export interface LegalGroundingArticle {
  article: string;
  paragraph?: string;
  title: string;
  summary: string;
  relevance: "DIRETA_CRIME" | "REGIME_EXECUCAO" | "SEGREGAÇÃO_LEGAL" | "PERIGOSIDADE";
  isDrivingAllocation?: boolean;
  drivingReason?: string;
  allocationTarget?: string;
}

/**
 * HOOK DE CRUZAMENTO NORMATIVO (LEI N.º 38/20 DA ASSEMBLEIA NACIONAL)
 * Cruza o crime seleccionado e variáveis de Admissão Prisional com a Doutrina do Código Penal Angolano
 */
export function useCrimeLegalCrossReference(
  crimeId: string,
  input: InmateClassificationInput
) {
  return useMemo(() => {
    const crime = PENAL_CODE_GRAPH.find(c => c.id === crimeId) || PENAL_CODE_GRAPH[0];
    const groundings: LegalGroundingArticle[] = [];

    // Determina a hierarquia de normas determinantes da alocação de alojamento (Pavilhão/Bloco)
    let drivingKey = "CRIME_DIRECT";
    if (input.contagiousPathology || input.psychiatricNeed) {
      drivingKey = "HEALTH_ISOLATION";
    } else if (input.escapeRisk || input.threatToSelfOrOthers || input.factionMember) {
      drivingKey = "MAX_SECURITY_THREAT";
    } else if (crime.severityGroup === "GRUPO_C_ORDEM_PUBLICA_ESPECIAL" || crime.baseSecurityLevel === "ESPECIAL") {
      drivingKey = "SPECIAL_ORDEM_PUBLICA";
    } else if (input.legalStatus === "MENOR_JOVEM" || input.age < 21) {
      drivingKey = "YOUTH_SEGREGATION";
    } else if (input.legalStatus === "ESTRANGEIRO") {
      drivingKey = "FOREIGN_NATIONAL";
    }

    // 1. Enquadramento Direto do Delito na Parte Especial do Código Penal
    const isCrimeDriving = drivingKey === "CRIME_DIRECT" || drivingKey === "SPECIAL_ORDEM_PUBLICA";
    const crimeParagraph = crime.paragraph || "§ 1.º (Tipo Incriminador e Moldura Penal)";
    groundings.push({
      article: crime.articleNumber,
      paragraph: crimeParagraph,
      title: `${crime.crimeName} (${crime.category})`,
      summary: `${crime.description} — Moldura Penal Máxima: ${crime.maxPenaltyYears} Anos. Classificação de Perigosidade Base: ${crime.severityGroup.replace(/_/g, " ")}.`,
      relevance: "DIRETA_CRIME",
      isDrivingAllocation: isCrimeDriving,
      allocationTarget: crime.severityGroup === "GRUPO_A_ALTA_PERIGOSIDADE" ? "Pavilhão Principal — Bloco A (Ala de Alta Segurança)" :
                        crime.severityGroup === "GRUPO_B_MEDIA_PERIGOSIDADE" ? "Pavilhão Comum — Bloco B (Média Segurança)" :
                        crime.severityGroup === "GRUPO_C_ORDEM_PUBLICA_ESPECIAL" ? "Setor Especial de Segurança — Bloco D (Isolamento)" :
                        "Pavilhão Aberto — Bloco C (Regime Aberto)",
      drivingReason: `A moldura penal máxima de ${crime.maxPenaltyYears} anos e o enquadramento no ${crime.severityGroup.replace(/_/g, " ")} regem deterministicamente o alojamento.`
    });

    // 2. Artigo 40.º (Parte Geral) - Finalidades das Penas e Medidas de Segurança
    groundings.push({
      article: "Artigo 40.º (Lei n.º 38/20)",
      paragraph: "n.º 1 e 2 (Execução e Defesa Social)",
      title: "Finalidades das Penas e Defesa Social",
      summary: "A aplicação de penas visa a protecção de bens jurídicos essenciais e a reintegração social. A execução serve a defesa da sociedade, prevenindo o cometimento de novos crimes.",
      relevance: "REGIME_EXECUCAO",
      isDrivingAllocation: false
    });

    // 3. Artigo 5.º e 17.º - Imputabilidade Juvenil e Segregação Etária
    if (input.legalStatus === "MENOR_JOVEM" || input.age < 21) {
      const isYouthDriving = drivingKey === "YOUTH_SEGREGATION";
      groundings.push({
        article: "Artigo 5.º & 17.º (Lei n.º 38/20)",
        paragraph: "§ 3.º (Imperativo de Segregação de Adultos Condenados)",
        title: "Regime Penal de Menores e Jovens Adultos",
        summary: "Determina o cumprimento obrigatório em estabelecimentos próprios ou secções autónomas separadas de adultos, proibindo qualquer contacto com reclusos adultos condenados.",
        relevance: "SEGREGAÇÃO_LEGAL",
        isDrivingAllocation: isYouthDriving,
        allocationTarget: "Ala Autónoma de Jovens Adultos (16 a 21 Anos)",
        drivingReason: "O Artigo 5.º § 3.º impõe a segregação física obrigatória de jovens adultos para prevenir o contágio criminal."
      });
    }

    // 4. Artigo 68.º - Pena Acessória de Expulsão para Cidadãos Estrangeiros
    if (input.legalStatus === "ESTRANGEIRO") {
      const isForeignDriving = drivingKey === "FOREIGN_NATIONAL";
      groundings.push({
        article: "Artigo 68.º (Lei n.º 38/20)",
        paragraph: "§ 2.º (Protocolo de Custódia e Expulsão Judicial)",
        title: "Expulsão do Território Nacional",
        summary: "Cidadão estrangeiro condenado por crime doloso sujeito a expulsão judicial executada pelo Serviço de Migração e Estrangeiros (SME) após cumprimento parcial da pena.",
        relevance: "REGIME_EXECUCAO",
        isDrivingAllocation: isForeignDriving,
        allocationTarget: "Módulo Diplomático / Estrangeiros (Protocolo SME)",
        drivingReason: "A condição legal de estrangeiro ativa o regime do Art. 68.º § 2.º para articulação com autoridades consulares e SME."
      });
    }

    // 5. Artigo 18.º e 101.º - Inimputabilidade por Anomalia Psíquica / Saúde
    if (input.legalStatus === "MEDIDA_SEGURANCA" || input.psychiatricNeed || input.contagiousPathology) {
      const isHealthDriving = drivingKey === "HEALTH_ISOLATION";
      groundings.push({
        article: "Artigo 18.º & 101.º (Lei n.º 38/20)",
        paragraph: "§ 2.º (Medidas Prisionais de Internamento e Cura Sanitária)",
        title: "Internamento e Medidas de Segurança Prisional",
        summary: "Internamento compulsivo em estabelecimento de cura/segurança por virtude de anomalia psíquica ou quarentena sanitária, sob revisão judicial e acompanhamento médico.",
        relevance: "SEGREGAÇÃO_LEGAL",
        isDrivingAllocation: isHealthDriving,
        allocationTarget: "Ala Hospitalar / Bloco E (Saúde & Quarentena)",
        drivingReason: "O quadro médico/psiquiátrico sobrepõe-se ao regime comum, determinando o isolamento sanitário no Bloco E."
      });
    }

    // 6. Artigo 63.º - Inadmissibilidade de Liberdade Condicional para Crimes Graves
    const nonConditionalCrimes = ["CP-ART-381", "CP-ART-382", "CP-ART-148", "CP-ART-149", "CP-ART-150", "CP-ART-192", "CP-ART-297", "CP-ART-310", "CP-ART-329"];
    if (nonConditionalCrimes.includes(crime.id) || crime.group === "CRIMES_CONTRA_PAZ_INTERNACIONAL") {
      groundings.push({
        article: "Artigo 63.º (Lei n.º 38/20)",
        paragraph: "alínea a) (Exclusão de Benefícios Penais)",
        title: "Inadmissibilidade de Liberdade Condicional",
        summary: "O tipo penal em apreço enquadra-se nas excepções legais que vedam rigorosamente a concessão de liberdade condicional devido à extrema gravidade da ofensa social.",
        relevance: "PERIGOSIDADE",
        isDrivingAllocation: false
      });
    }

    // 7. Artigo 347.º - Prevenção de Amotinação Prisional
    if (input.escapeRisk || input.threatToSelfOrOthers || input.factionMember) {
      const isThreatDriving = drivingKey === "MAX_SECURITY_THREAT";
      groundings.push({
        article: "Artigo 347.º (Lei n.º 38/20)",
        paragraph: "§ 1.º, alínea b) (Contenção Preventiva de Segurança Máxima)",
        title: "Amotinação de Reclusos e Segurança Penitenciária",
        summary: "Exige contenção em cela de segurança máxima e isolamento preventivo para neutralizar riscos de atentado contra funcionários ou perturbação da ordem prisional.",
        relevance: "PERIGOSIDADE",
        isDrivingAllocation: isThreatDriving,
        allocationTarget: "Bloco D (Isolamento e Segurança Máxima)",
        drivingReason: "Riscos operacionais graves (fuga/facção) ativam o Art. 347.º § 1.º, direcionando o alojamento para o Bloco D."
      });
    }

    const drivingNorm = groundings.find(g => g.isDrivingAllocation) || groundings[0];

    return {
      activeCrime: crime,
      groundings,
      drivingNorm,
      totalGroundings: groundings.length
    };
  }, [crimeId, input.legalStatus, input.age, input.psychiatricNeed, input.contagiousPathology, input.escapeRisk, input.threatToSelfOrOthers, input.factionMember]);
}

export const MNCPModule: React.FC = () => {
  // Search & Filter state
  const [searchTerm, setSearchSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [selectedCrimeId, setSelectedCrimeId] = useState<string>("CP-ART-147");

  // Simulation Form State
  const [simSex, setSimSex] = useState<"MASCULINO" | "FEMININO">("MASCULINO");
  const [simLegalStatus, setSimLegalStatus] = useState<"DETIDO" | "PREVENTIVO" | "CONDENADO" | "MEDIDA_SEGURANCA" | "MENOR_JOVEM" | "ESTRANGEIRO">("PREVENTIVO");
  const [simCrimeForm, setSimCrimeForm] = useState<"CONSUMADO" | "TENTADO" | "CUMPLICIDADE">("CONSUMADO");
  const [simIsQualified, setSimIsQualified] = useState(true);
  const [simAge, setSimAge] = useState(28);
  const [simEscapeRisk, setSimEscapeRisk] = useState(false);
  const [simFactionMember, setSimFactionMember] = useState(false);
  const [simContagiousPathology, setSimContagiousPathology] = useState(false);
  const [simPsychiatricNeed, setSimPsychiatricNeed] = useState(false);
  const [simThreat, setSimThreat] = useState(false);

  // Group list for filter dropdown
  const crimeGroups = useMemo(() => {
    const groupsMap = new Map<string, string>();
    PENAL_CODE_GRAPH.forEach(c => groupsMap.set(c.group, c.groupTitle));
    return Array.from(groupsMap.entries());
  }, []);

  // Filtered crime list
  const filteredCrimes = useMemo(() => {
    return PENAL_CODE_GRAPH.filter(c => {
      const matchesGroup = selectedGroup === "ALL" || c.group === selectedGroup;
      const matchesQuery = 
        c.crimeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesQuery;
    });
  }, [searchTerm, selectedGroup]);

  // Selected crime details
  const activeCrime = useMemo(() => {
    return PENAL_CODE_GRAPH.find(c => c.id === selectedCrimeId) || PENAL_CODE_GRAPH[0];
  }, [selectedCrimeId]);

  // Compute MNCP Decision
  const simulationInput: InmateClassificationInput = useMemo(() => ({
    sex: simSex,
    legalStatus: simLegalStatus,
    crimeId: selectedCrimeId,
    crimeForm: simCrimeForm,
    isQualified: simIsQualified,
    age: simAge,
    escapeRisk: simEscapeRisk,
    factionMember: simFactionMember,
    contagiousPathology: simContagiousPathology,
    psychiatricNeed: simPsychiatricNeed,
    threatToSelfOrOthers: simThreat
  }), [simSex, simLegalStatus, selectedCrimeId, simCrimeForm, simIsQualified, simAge, simEscapeRisk, simFactionMember, simContagiousPathology, simPsychiatricNeed, simThreat]);

  const decision = useMemo(() => {
    return MNCPEngine.evaluateInmate(simulationInput);
  }, [simulationInput]);

  // Hook to cross-reference selected crime ID & inmate variables with Lei n.º 38/20
  const { groundings, drivingNorm } = useCrimeLegalCrossReference(selectedCrimeId, simulationInput);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Scale className="w-80 h-80 text-amber-500" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight text-slate-100">
                  MOTOR NACIONAL DE CLASSIFICAÇÃO PENITENCIÁRIA (MNCP)
                </h1>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  LAW-DRIVEN KERNEL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Motor de Inteligência Jurídico-Operacional baseado na Lei n.º 38/20 (Código Penal Angolano) & Lei n.º 8/08
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-right font-mono">
              <span className="text-[9px] text-slate-500 uppercase block">Base Normativa Ingerida</span>
              <span className="text-xs font-bold text-emerald-400">Lei n.º 38/20 (11 de Novembro)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CRIME GRAPH & LEGAL DATABASE (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-mono font-extrabold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                BASE EXECUTÁVEL DO CÓDIGO PENAL
              </h2>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                {filteredCrimes.length} Tipos Penais
              </span>
            </div>

            {/* SEARCH & GROUP FILTERS */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Pesquisar por artigo, nome do crime, capítulo..."
                  value={searchTerm}
                  onChange={(e) => setSearchSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-slate-500" />
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Todos os Títulos e Grupos Penais</option>
                  {crimeGroups.map(([code, title]) => (
                    <option key={code} value={code}>{title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CRIME GRAPH LIST */}
            <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredCrimes.map((crime) => {
                const isSelected = crime.id === selectedCrimeId;
                return (
                  <button
                    key={crime.id}
                    onClick={() => setSelectedCrimeId(crime.id)}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? "bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30 text-slate-100"
                        : "bg-slate-950/50 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {crime.articleNumber}
                      </span>
                      <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        crime.baseSecurityLevel === "ESPECIAL"
                          ? "bg-purple-950 text-purple-300 border-purple-800"
                          : crime.baseSecurityLevel === "ALTA"
                          ? "bg-red-950 text-red-300 border-red-800"
                          : crime.baseSecurityLevel === "MEDIA"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                      }`}>
                        Nível: {crime.baseSecurityLevel}
                      </span>
                    </div>

                    <strong className="text-xs font-bold text-slate-200 font-sans mt-0.5">
                      {crime.crimeName}
                    </strong>

                    <p className="text-[10px] text-slate-400 line-clamp-2 font-sans">
                      {crime.description}
                    </p>

                    <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-500 mt-1 pt-1 border-t border-slate-900">
                      <span>{crime.groupTitle}</span>
                      <span>Pena Máx: <strong className="text-slate-300">{crime.maxPenaltyYears} Anos</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE MNCP SIMULATOR & DECISION REPORT (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* SIMULATION INPUT FORM */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-mono font-extrabold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                SIMULADOR OPERACIONAL DE TRIAGEM PENITENCIÁRIA
              </h2>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                LÓGICA EM TEMPO REAL
              </span>
            </div>

            {/* FORM CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* SEXO */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">1. Sexo Biológico:</label>
                <select
                  value={simSex}
                  onChange={(e) => setSimSex(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-amber-500"
                >
                  <option value="MASCULINO">Masculino (Pavilhão Masculino)</option>
                  <option value="FEMININO">Feminino (Pavilhão Feminino)</option>
                </select>
              </div>

              {/* SITUAÇÃO JURÍDICA */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">2. Situação Jurídica:</label>
                <select
                  value={simLegalStatus}
                  onChange={(e) => setSimLegalStatus(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-amber-500"
                >
                  <option value="PREVENTIVO">Detido Preventivo (Aguardando Sentença)</option>
                  <option value="CONDENADO">Condenado Definitivo (Pena Cumprimento)</option>
                  <option value="MENOR_JOVEM">Jovem Adulto (16 a 21 Anos)</option>
                  <option value="MEDIDA_SEGURANCA">Medida de Segurança (Inimputável)</option>
                  <option value="ESTRANGEIRO">Cidadão Estrangeiro (Protocolo SME)</option>
                </select>
              </div>

              {/* FORMA DO CRIME */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">3. Forma do Delito:</label>
                <select
                  value={simCrimeForm}
                  onChange={(e) => setSimCrimeForm(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-amber-500"
                >
                  <option value="CONSUMADO">Consumado</option>
                  <option value="TENTADO">Tentado (Pena Atenuada)</option>
                  <option value="CUMPLICIDADE">Cumplicidade</option>
                </select>
              </div>
            </div>

            {/* TOGGLES / VARIÁVEIS DE RISCO E SAÚDE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-850">
              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 rounded cursor-pointer hover:border-slate-700">
                <input 
                  type="checkbox" 
                  checked={simIsQualified} 
                  onChange={(e) => setSimIsQualified(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" 
                />
                <span className="text-[10px] text-slate-300 font-mono">Forma Qualificada</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 rounded cursor-pointer hover:border-slate-700">
                <input 
                  type="checkbox" 
                  checked={simEscapeRisk} 
                  onChange={(e) => setSimEscapeRisk(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" 
                />
                <span className="text-[10px] text-slate-300 font-mono">Risco de Fuga</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 rounded cursor-pointer hover:border-slate-700">
                <input 
                  type="checkbox" 
                  checked={simFactionMember} 
                  onChange={(e) => setSimFactionMember(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" 
                />
                <span className="text-[10px] text-slate-300 font-mono">Membro de Facção</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 rounded cursor-pointer hover:border-slate-700">
                <input 
                  type="checkbox" 
                  checked={simContagiousPathology} 
                  onChange={(e) => setSimContagiousPathology(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" 
                />
                <span className="text-[10px] text-slate-300 font-mono">Isolamento Médico</span>
              </label>
            </div>
          </div>

          {/* DECISION REPORT CARD */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-mono text-amber-400 uppercase font-extrabold block tracking-wider">
                  PARECER DE ALOCAÇÃO E ALOJAMENTO DETERMINÍSTICO
                </span>
                <h3 className="text-base font-extrabold text-slate-100 font-sans">
                  {decision.crimeDetails.articleNumber} — {decision.crimeDetails.crimeName}
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-[8px] text-slate-500 block">HASH DE AUDITORIA</span>
                <span className="text-xxs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {decision.auditHash}
                </span>
              </div>
            </div>

            {/* INDICADOR VISUAL DA NORMA DETERMINANTE DA ALOCAÇÃO (LEI N.º 38/20) */}
            <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/70 rounded-xl p-4 shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-start gap-3 z-10">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/50 shrink-0 mt-0.5 animate-pulse">
                  <Gavel className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
                      NORMA MOTOR DA ALOCAÇÃO
                    </span>
                    <span className="text-xs font-mono font-extrabold text-amber-300">
                      {drivingNorm.article} — {drivingNorm.paragraph}
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-slate-100 font-sans">
                    Destino Determinado: <span className="text-amber-300">{drivingNorm.allocationTarget}</span>
                  </strong>
                  <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                    {drivingNorm.drivingReason}
                  </p>
                </div>
              </div>

              <div className="shrink-0 font-mono text-right bg-slate-950/90 px-3.5 py-2 rounded-lg border border-amber-500/40 self-stretch md:self-auto flex md:flex-col justify-between md:justify-center items-center md:items-end z-10">
                <span className="text-[8px] text-amber-400/90 font-bold uppercase tracking-wider">Fundamento Lei n.º 38/20</span>
                <span className="text-xs font-black text-amber-300">{drivingNorm.article}</span>
                <span className="text-[9px] text-slate-400">{drivingNorm.paragraph}</span>
              </div>
            </div>

            {/* RESULTS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">1. Pavilhão Destino</span>
                  <strong className="text-xs text-slate-100 font-bold block mt-1">{decision.pavilhao}</strong>
                </div>
                <span className="text-[8px] text-amber-400 font-semibold mt-2 block pt-1 border-t border-slate-900">
                  ⚡ Ref: {drivingNorm.article}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">2. Bloco Sugerido</span>
                  <strong className="text-sm text-amber-400 font-black block mt-0.5">Bloco {decision.blocoRecomendado}</strong>
                </div>
                <span className="text-[8px] text-amber-400 font-semibold mt-2 block pt-1 border-t border-slate-900">
                  ⚡ {drivingNorm.paragraph}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">3. Perfil Segurança</span>
                  <strong className="text-xs text-emerald-400 font-bold block mt-1">{decision.nivelSeguranca}</strong>
                </div>
                <span className="text-[8px] text-slate-500 mt-2 block pt-1 border-t border-slate-900">
                  Grau {decision.crimeDetails.severityGroup.replace("GRUPO_", "")}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">4. Sub-Área / Módulo</span>
                  <strong className="text-[10px] text-slate-300 block truncate mt-1">{decision.subArea}</strong>
                </div>
                <span className="text-[8px] text-slate-500 mt-2 block pt-1 border-t border-slate-900">
                  Regime Prisional
                </span>
              </div>
            </div>

            {/* CELAS ELEGÍVEIS */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5 font-mono">
              <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Celas Elegíveis Sugeridas pelo MNCP (Apenas Bloco {decision.blocoRecomendado}):
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {decision.celasElegiveis.map((cela, idx) => (
                  <span key={idx} className="bg-amber-950/40 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded text-xxs font-bold">
                    {cela}
                  </span>
                ))}
              </div>
            </div>

            {/* FUNDAMENTAÇÃO JURÍDICA E CRUZAMENTO NORMATIVO (LEI N.º 38/20) */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-400" />
                  Cruzamento Normativo da Decisão — Lei n.º 38/20 ({groundings.length} Preceitos)
                </span>
                <span className="text-[8.5px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                  DIREITO SUBSTANTIVO
                </span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {groundings.map((gr, idx) => {
                  const isDriving = gr.isDrivingAllocation;
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg flex flex-col gap-1.5 transition-all ${
                        isDriving 
                          ? "bg-amber-950/40 border-2 border-amber-400/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30" 
                          : "bg-slate-900/80 border border-slate-850"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            isDriving 
                              ? "text-amber-300 bg-amber-950 border-amber-400 font-extrabold" 
                              : "text-amber-400 bg-amber-950/80 border-amber-500/30"
                          }`}>
                            {gr.article}
                          </span>

                          {gr.paragraph && (
                            <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {gr.paragraph}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isDriving && (
                            <span className="text-[8px] font-mono bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                              NORMA DETERMINANTE DA ALOCAÇÃO
                            </span>
                          )}
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            gr.relevance === "DIRETA_CRIME" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                            gr.relevance === "SEGREGAÇÃO_LEGAL" ? "bg-purple-950 text-purple-300 border border-purple-800" :
                            gr.relevance === "PERIGOSIDADE" ? "bg-red-950 text-red-300 border border-red-800" :
                            "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}>
                            {gr.relevance.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      <strong className="text-xs font-sans text-slate-100 mt-0.5 flex items-center gap-1.5">
                        {gr.title}
                      </strong>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">{gr.summary}</p>

                      {isDriving && gr.drivingReason && (
                        <div className="mt-1 p-2 bg-slate-950/90 border border-amber-500/30 rounded text-[10.5px] text-amber-200 font-mono flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">Impacto Direto:</span>
                          <span>{gr.drivingReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALERTAS & APROVAÇÕES */}
            {decision.alertasCompatibilidade.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl flex flex-col gap-1 text-xs text-amber-200 font-sans">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alertas de Compatibilidade e Restrições de Segurança:
                </span>
                {decision.alertasCompatibilidade.map((alt, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed mt-0.5">• {alt}</div>
                ))}
              </div>
            )}

            {/* PROTOCOLOS OPERACIONAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Protocolo de Escolta:</span>
                <p className="text-slate-200 text-xxs font-mono">{decision.tipoEscolta}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Regime de Visitas:</span>
                <p className="text-slate-200 text-xxs font-mono">{decision.restricoesVisitas}</p>
              </div>
            </div>

            {/* APROVAÇÕES OBRIGATÓRIAS */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5 font-mono">
              <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cadeia de Aprovação Obrigatória (RBAC Workflow):
              </span>
              <div className="flex flex-col gap-1">
                {decision.aprovacoesObrigatorias.map((appr, idx) => (
                  <div key={idx} className="text-xxs text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{appr}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
